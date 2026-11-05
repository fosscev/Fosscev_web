import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { jwtVerify, SignJWT } from 'jose';
import { isAdminEmail } from '@/lib/admin-config';
import { checkRateLimit } from '@/lib/rate-limit';
import { getTrustedClientIp } from '@/lib/client-ip';
import { hasSameOrigin } from '@/lib/request-security';

const OTP_COOKIE = 'foss-admin-otp';

export async function POST(request: NextRequest) {
    if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    try {
        const { email: rawEmail, token: rawToken } = await request.json();
        const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
        const token = typeof rawToken === 'string' ? rawToken.trim() : '';
        const challenge = request.cookies.get(OTP_COOKIE)?.value;
        if (!email || email.length > 254 || !/^\d{6,8}$/.test(token) || !challenge) {
            return NextResponse.json({ error: 'Your verification step expired. Sign in again to request a new code.' }, { status: 400 });
        }

        const secret = getAdminSessionSecret();
        let challengeEmail = '';
        let challengeUserId = '';
        try {
            const { payload } = await jwtVerify(challenge, secret, { audience: 'admin-otp' });
            challengeEmail = typeof payload.email === 'string' ? payload.email : '';
            challengeUserId = payload.sub || '';
        } catch {
            return NextResponse.json({ error: 'Your verification step expired. Sign in again to request a new code.' }, { status: 401 });
        }

        if (email !== challengeEmail || !challengeUserId || !isAdminEmail(email)) {
            return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 401 });
        }

        const ip = getTrustedClientIp(request.headers);
        const ipRateCheck = ip === 'unknown'
            ? { allowed: true, retryAfterMs: 0 }
            : await checkRateLimit(`admin-otp-ip:${ip}`, 'admin-verify-otp');
        const emailRateCheck = await checkRateLimit(`admin-otp-email:${email}`, 'admin-verify-otp');
        if (!ipRateCheck.allowed || !emailRateCheck.allowed) {
            return NextResponse.json({ error: 'Too many verification attempts. Request a new code later.' }, { status: 429 });
        }

        const response = NextResponse.json({ message: 'Signed in successfully' });
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookieOptions: { name: 'sb-admin-auth-token', path: '/', sameSite: 'strict' },
                cookies: {
                    getAll() { return request.cookies.getAll(); },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            response.cookies.set(name, value, { ...options, httpOnly: false });
                        });
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
        if (error || !data.user || !data.session || data.user.id !== challengeUserId) {
            return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 401 });
        }

        const sessionTtl = Math.min(60 * 60, data.session.expires_in || 60 * 60);
        const marker = await new SignJWT({ aud: 'admin', sub: data.user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(`${sessionTtl}s`)
            .sign(secret);
        response.cookies.set('foss-admin-marker', marker, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: sessionTtl,
        });
        response.cookies.set(OTP_COOKIE, '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/admin/auth',
            maxAge: 0,
        });
        return response;
    } catch (error) {
        console.error('Admin OTP verification error:', error);
        return NextResponse.json({ error: 'Could not verify the code. Please try again.' }, { status: 500 });
    }
}
