import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rate-limit';
import { createPicksUser, getPicksUserByAuthId } from '@/lib/picks-db';

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
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateCheck = checkRateLimit(ip, 'signin');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many sign-in attempts. Try again in ${Math.ceil(rateCheck.retryAfterMs / 60000)} minutes.` },
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
