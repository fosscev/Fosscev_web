import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin-config';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_WINDOW_MS = 15 * 60 * 1000;
const RESET_LIMIT = 3;
const attempts = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(key: string) {
    const now = Date.now();
    const attempt = attempts.get(key);
    if (!attempt || attempt.expiresAt <= now) {
        attempts.set(key, { count: 1, expiresAt: now + RESET_WINDOW_MS });
        return false;
    }

    attempt.count += 1;
    return attempt.count > RESET_LIMIT;
}

export async function POST(request: NextRequest) {
    // Always return this message for a syntactically valid request so an
    // attacker cannot discover which addresses are administrator accounts.
    const success = NextResponse.json({ message: 'If the address is authorised, a reset link will be sent.' });

    try {
        const body = await request.json();
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        if (!EMAIL_PATTERN.test(email)) {
            return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        }

        const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
        const clientId = forwardedFor || request.headers.get('x-real-ip') || 'unknown';
        if (isRateLimited(`${clientId}:${email}`)) return success;
        if (!isAdminEmail(email)) return success;

        const configuredUrl = process.env.NODE_ENV === 'production'
            ? 'https://foss.cev.ac.in'
            : (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin);
        const redirectTo = new URL('/foss-manager/reset-password', configuredUrl).toString();
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) console.error('Admin password reset request failed:', error.message);

        return success;
    } catch (error) {
        console.error('Admin password reset request error:', error);
        return NextResponse.json({ error: 'Unable to process the request. Please try again later.' }, { status: 500 });
    }
}
