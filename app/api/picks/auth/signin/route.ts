import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rate-limit';
import { createPicksUser, getPicksUserByAuthId } from '@/lib/picks-db';
import { logSecurityEvent } from '@/lib/security-logger';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const { isAdminEmail } = await import('@/lib/admin-config');
        if (isAdminEmail(email)) {
            return NextResponse.json(
                { error: 'Admin accounts cannot be used to sign into the community portal. Please use a regular user account.' },
                { status: 403 }
            );
        }

        // Rate limit sign-in attempts
        const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const rateCheck = await checkRateLimit(ip, 'signin');
        if (!rateCheck.allowed) {
            logSecurityEvent({
                type: 'AUTH_RATE_LIMIT_EXCEEDED',
                ip,
                email,
                reason: 'signin endpoint'
            });
            return NextResponse.json(
                { error: `Too many sign-in attempts. Try again later.` },
                { status: 429 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            logSecurityEvent({
                type: 'AUTH_LOGIN_FAILED',
                ip,
                email,
                reason: 'Invalid credentials'
            });
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        if (!data.user) {
            return NextResponse.json(
                { error: 'Sign-in failed' },
                { status: 401 }
            );
        }

        // Ensure picks_users profile exists
        let picksUser = await getPicksUserByAuthId(data.user.id);
        if (!picksUser) {
            picksUser = await createPicksUser(data.user.id, email);
        }

        return NextResponse.json({
            message: 'Signed in successfully',
            user: picksUser,
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
            },
        });

    } catch (err) {
        console.error('Signin error:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
