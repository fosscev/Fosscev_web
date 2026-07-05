import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ message: 'Marker refreshed' });

    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: { name: 'sb-admin-auth-token', path: '/foss-manager', sameSite: 'strict' },
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            }
        }
    );

    const { data: { session }, error } = await supabaseAdmin.auth.getSession();

    if (error || !session) {
        return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Re-issue the marker with the new expiration time
    const secret = new TextEncoder().encode(process.env.SESSION_MARKER_SECRET || 'development-fallback-secret-key-12345');
    const marker = await new SignJWT({ aud: 'admin', sub: session.user.id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(session.expires_at || Math.floor(Date.now() / 1000) + 3600)
        .sign(secret);

    response.cookies.set('foss-admin-marker', marker, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/foss-manager',
        maxAge: session.expires_in
    });

    return response;
}
