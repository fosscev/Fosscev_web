import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SignJWT } from 'jose';
import { isAdminEmail } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        if (!isAdminEmail(email)) {
            // Use generic error to prevent email enumeration
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const response = NextResponse.json({ message: 'Signed in successfully' });

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
                },
            }
        );

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

        if (error) {
            // Use generic error to prevent credential enumeration
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        if (!data.user || !data.session) {
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
        }

        // Issue Signed Session Marker using jose
        const secret = new TextEncoder().encode(process.env.SESSION_MARKER_SECRET || 'development-fallback-secret-key-12345');
        const marker = await new SignJWT({ aud: 'admin', sub: data.user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(data.session.expires_at || Math.floor(Date.now() / 1000) + 3600)
            .sign(secret);

        // Set the marker cookie
        response.cookies.set('foss-admin-marker', marker, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/foss-manager',
            maxAge: data.session.expires_in
        });

        return response;
    } catch (err) {
        console.error('Admin Signin error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
