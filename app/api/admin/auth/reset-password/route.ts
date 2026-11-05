import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin-config';
import { checkRateLimit } from '@/lib/rate-limit';
import { getTrustedClientIp } from '@/lib/client-ip';
import { hasSameOrigin } from '@/lib/request-security';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
    if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // Always return this message for a syntactically valid request so an
    // attacker cannot discover which addresses are administrator accounts.
    const success = NextResponse.json({ message: 'If the address is authorised, a reset link will be sent.' });

    try {
        const body = await request.json();
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
            return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        }

        const clientId = getTrustedClientIp(request.headers);
        const ipRateCheck = await checkRateLimit(`admin-reset-ip:${clientId}`, 'reset-password');
        const emailRateCheck = await checkRateLimit(`admin-reset-email:${email}`, 'reset-password');
        if (!ipRateCheck.allowed || !emailRateCheck.allowed) return success;
        if (!isAdminEmail(email)) return success;

        const configuredUrl = process.env.NODE_ENV === 'production'
            ? 'https://foss.cev.ac.in'
            : (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin);
        const redirectTo = new URL('/foss-manager/reset-password', configuredUrl).toString();
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        );

        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) {
            console.error('Admin password reset request failed:', {
                code: error.code,
                status: error.status,
                message: error.message,
            });
        }

        return success;
    } catch (error) {
        console.error('Admin password reset request error:', error);
        return NextResponse.json({ error: 'Unable to process the request. Please try again later.' }, { status: 500 });
    }
}
