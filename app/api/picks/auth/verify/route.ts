import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rate-limit';
import { createPicksUser, getPicksUserByAuthId } from '@/lib/picks-db';

export async function POST(request: NextRequest) {
    try {
        const { email, token } = await request.json();

        if (!email || !token) {
            return NextResponse.json(
                { error: 'Email and verification code are required' },
                { status: 400 }
            );
        }

        // Rate limit to prevent brute-force OTP guessing
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateCheck = checkRateLimit(`${ip}:${email}`, 'verify-otp');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many verification attempts. Account locked for ${Math.ceil(rateCheck.retryAfterMs / 60000)} minutes.` },
                { status: 429 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Verify OTP via Supabase
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup',
        });

        if (error) {
            return NextResponse.json(
                { error: 'Invalid or expired verification code. Please try again.' },
                { status: 400 }
            );
        }

        if (!data.user) {
            return NextResponse.json(
                { error: 'Verification failed. Please try signing up again.' },
                { status: 400 }
            );
        }

        // Create or fetch picks_users profile
        let picksUser = await getPicksUserByAuthId(data.user.id);
        if (!picksUser) {
            const customUsername = data.user.user_metadata?.username;
            picksUser = await createPicksUser(data.user.id, email, customUsername);
        }

        // Return session info
        return NextResponse.json({
            message: 'Email verified successfully',
            user: picksUser,
            session: data.session ? {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
            } : null,
        });

    } catch (err) {
        console.error('Verify error:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
