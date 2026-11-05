import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SignJWT } from 'jose';
import { hasSameOrigin } from '@/lib/request-security';
import { isAdminEmail } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
    if (!hasSameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const response = NextResponse.json({ message: 'Marker refreshed' });

    const supabaseAdmin = createServerClient(
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
            }
        }
    );

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser();
    const { data: { session } } = await supabaseAdmin.auth.getSession();

    if (userError || !user || !isAdminEmail(user.email) || !session || session.user.id !== user.id) {
        return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Re-issue the marker with the new expiration time
    const secret = getAdminSessionSecret();
    const marker = await new SignJWT({ aud: 'admin', sub: session.user.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(session.expires_at || Math.floor(Date.now() / 1000) + 3600)
        .sign(secret);

    response.cookies.set('foss-admin-marker', marker, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: session.expires_in
    });

    return response;
}
