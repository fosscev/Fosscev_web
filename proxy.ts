import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminEmail } from './lib/admin-config';

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // This will refresh session if expired - vital for SSR
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // 1. Protect the dashboard: Redirect to login if NOT an admin
    //    This catches both unauthenticated users AND picks users who aren't admins.
    if (pathname.startsWith('/foss-manager/dashboard')) {
        if (!user || !isAdminEmail(user.email)) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/foss-manager';
            return NextResponse.redirect(redirectUrl);
        }
    }

    // 2. Auto-redirect from login page to dashboard if ALREADY authenticated as admin
    if (user && isAdminEmail(user.email) && pathname === '/foss-manager') {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/foss-manager/dashboard';
        return NextResponse.redirect(redirectUrl);
    }

    return response;
}

export const config = {
    matcher: [
        '/foss-manager',
        '/foss-manager/dashboard/:path*',
    ],
};
