import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ message: 'Signed out successfully' });

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

    // Call Supabase signout which clears the supabase session cookie
    await supabaseAdmin.auth.signOut();

    // Explicitly clear the jose JWT marker cookie for both the new and old paths
    response.cookies.set('foss-admin-marker', '', { path: '/', maxAge: 0 });
    response.cookies.set('foss-admin-marker', '', { path: '/foss-manager', maxAge: 0 });

    // Also explicitly clear the supabase token for the old path, just in case
    response.cookies.set('sb-admin-auth-token', '', { path: '/foss-manager', maxAge: 0 });
    response.cookies.set('sb-admin-auth-token.0', '', { path: '/foss-manager', maxAge: 0 });
    response.cookies.set('sb-admin-auth-token.1', '', { path: '/foss-manager', maxAge: 0 });
    response.cookies.set('sb-admin-auth-token-access-token', '', { path: '/foss-manager', maxAge: 0 });
    response.cookies.set('sb-admin-auth-token-refresh-token', '', { path: '/foss-manager', maxAge: 0 });
    response.cookies.set('sb-admin-auth-token-code-verifier', '', { path: '/foss-manager', maxAge: 0 });

    return response;
}
