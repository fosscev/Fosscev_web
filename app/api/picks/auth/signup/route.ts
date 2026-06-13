import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, isAllowedEmailDomain } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const { email, password, username } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Validate email domain
        if (!isAllowedEmailDomain(email)) {
            return NextResponse.json(
                { error: 'Please use a valid email address (@cev.ac.in, @gmail.com, @outlook.com, or @yahoo.com)' },
                { status: 400 }
            );
        }

        // Rate limit check
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateCheck = checkRateLimit(ip, 'signup-otp');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Too many signup attempts. Try again in ${Math.ceil(rateCheck.retryAfterMs / 60000)} minutes.` },
                { status: 429 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Sign up with Supabase — this sends the OTP email automatically
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username || '',
                },
                // Supabase will send a confirmation email with OTP
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/picks`,
            },
        });

        if (error) {
            // Handle "user already exists" gracefully
            if (error.message.includes('already registered')) {
                return NextResponse.json(
                    { error: 'This email is already registered. Please sign in instead.' },
                    { status: 409 }
                );
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Verification code sent to your email',
            requiresVerification: true,
        });

    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
