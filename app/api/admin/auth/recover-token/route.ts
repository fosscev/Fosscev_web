import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/admin-config';
import { checkRateLimit } from '@/lib/rate-limit';
import { getTrustedClientIp } from '@/lib/client-ip';
import { hasSameOrigin } from '@/lib/request-security';

export async function POST(request: NextRequest) {
    if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    try {
        const { tokenHash, type } = await request.json();
        if (typeof tokenHash !== 'string' || !/^[a-f0-9]{40,128}$/i.test(tokenHash) || type !== 'recovery') {
            return NextResponse.json({ error: 'This reset link is invalid or expired. Request a new one.' }, { status: 400 });
        }

        const ip = getTrustedClientIp(request.headers);
        const rateCheck = ip === 'unknown'
            ? { allowed: true, retryAfterMs: 0 }
            : await checkRateLimit(ip, 'recover-token');
        if (!rateCheck.allowed) {
            return NextResponse.json({ error: 'Too many attempts. Request a new reset link later.' }, { status: 429 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        );
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        if (error || !data.user || !data.session) {
            return NextResponse.json({ error: 'This reset link is invalid or expired. Request a new one.' }, { status: 400 });
        }
        if (!isAdminEmail(data.user.email)) {
            return NextResponse.json({ error: 'This reset link is not authorised for admin access.' }, { status: 403 });
        }

        const response = NextResponse.json({ session: data.session }, { headers: { 'Cache-Control': 'no-store' } });
        response.headers.set('Pragma', 'no-cache');
        return response;
    } catch (error) {
        console.error('Admin recovery token verification failed:', error);
        return NextResponse.json({ error: 'Unable to verify this reset link. Request a new one.' }, { status: 500 });
    }
}
