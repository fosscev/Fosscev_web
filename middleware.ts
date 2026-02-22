import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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
    await supabase.auth.getUser();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // 1. Protect the dashboard: Redirect to login if NOT authenticated
    if (!user && pathname.startsWith('/foss-manager/dashboard')) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/foss-manager';
        return NextResponse.redirect(redirectUrl);
    }

    // 2. Protect the login page: Redirect to dashboard if ALREADY authenticated
    // Only redirect if specifically on the login root, not its sub-assets
    if (user && pathname === '/foss-manager') {
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
