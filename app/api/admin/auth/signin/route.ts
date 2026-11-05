import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
import { isAdminEmail } from '@/lib/admin-config';
import { checkRateLimit } from '@/lib/rate-limit';
import { getTrustedClientIp } from '@/lib/client-ip';
import { hasSameOrigin } from '@/lib/request-security';

const OTP_COOKIE = 'foss-admin-otp';
const OTP_TTL_SECONDS = 5 * 60;

export async function POST(request: NextRequest) {
    if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    try {
        const body = await request.json();
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        if (!email || email.length > 254 || !password || password.length > 1024) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }
        if (!isAdminEmail(email)) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const ip = getTrustedClientIp(request.headers);
        const ipRateCheck = ip === 'unknown'
            ? { allowed: true, retryAfterMs: 0 }
            : await checkRateLimit(`admin-signin-ip:${ip}`, 'admin-signin');
        const emailRateCheck = await checkRateLimit(`admin-signin-email:${email}`, 'admin-signin');
        if (!ipRateCheck.allowed || !emailRateCheck.allowed) {
            return NextResponse.json({ error: 'Too many sign-in attempts. Please wait a few minutes and try again.' }, { status: 429 });
        }

        // Validate the password without writing an authenticated session cookie.
        const authClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        );
        const { data, error } = await authClient.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Send the second factor only after the password and admin allowlist pass.
        const { error: otpError } = await authClient.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false },
        });
        if (otpError) {
            console.error('Admin OTP send failed:', otpError.message);
            return NextResponse.json({ error: 'Could not send a verification code. Please try again shortly.' }, { status: 503 });
        }

        const secret = getAdminSessionSecret();
        const challenge = await new SignJWT({ aud: 'admin-otp', email })
            .setProtectedHeader({ alg: 'HS256' })
            .setSubject(data.user.id)
            .setIssuedAt()
            .setExpirationTime(`${OTP_TTL_SECONDS}s`)
            .sign(secret);

        const response = NextResponse.json({ message: 'Verification code sent' });
        response.cookies.set(OTP_COOKIE, challenge, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/admin/auth',
            maxAge: OTP_TTL_SECONDS,
        });
        return response;
    } catch (error) {
        console.error('Admin signin error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
