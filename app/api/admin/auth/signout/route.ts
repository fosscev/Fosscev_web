import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ message: 'Signed out successfully' });

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

    // Call Supabase signout which clears the supabase session cookie
    await supabaseAdmin.auth.signOut();

    // Explicitly clear the jose JWT marker cookie
    response.cookies.delete({
        name: 'foss-admin-marker',
        path: '/foss-manager',
    });

    return response;
}
