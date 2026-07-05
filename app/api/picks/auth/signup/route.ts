import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, isAllowedEmailDomain } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/security-logger';

async function checkHIBP(password: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    try {
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { cache: 'no-store' });
        if (!response.ok) return false;
        const text = await response.text();
        return text.includes(suffix);
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email, password, username } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 12) {
            return NextResponse.json(
                { error: 'Password must be at least 12 characters' },
                { status: 400 }
            );
        }

        const isCompromised = await checkHIBP(password);
        if (isCompromised) {
            return NextResponse.json(
                { error: 'This password has appeared in a data breach. Please choose a different one.' },
                { status: 400 }
            );
        }

        const { isAdminEmail } = await import('@/lib/admin-config');
        if (isAdminEmail(email)) {
            return NextResponse.json(
                { error: 'Admin accounts cannot be used to sign up for the community portal. Please use a regular user account.' },
                { status: 403 }
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
        const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const rateCheck = await checkRateLimit(ip, 'signup-otp');
        if (!rateCheck.allowed) {
            logSecurityEvent({
                type: 'AUTH_RATE_LIMIT_EXCEEDED',
                ip,
                email,
                reason: 'signup endpoint'
            });
            return NextResponse.json(
                { error: `Too many signup attempts. Try again later.` },
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
