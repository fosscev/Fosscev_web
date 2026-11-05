import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { isAdminEmail } from './lib/admin-config';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const isAdminPage = pathname.startsWith('/foss-manager');
    const isAdminApi = pathname.startsWith('/api/registrations')
        || pathname.startsWith('/api/form-schemas')
        || pathname.startsWith('/api/picks/admin/posts');
    const hasAdminSessionCookie = request.cookies.getAll()
        .some(({ name }) => name === 'sb-admin-auth-token' || name.startsWith('sb-admin-auth-token.'));
    const applyAdminCsp = isAdminPage || (!pathname.startsWith('/api/') && hasAdminSessionCookie);
    const nonce = btoa(crypto.randomUUID());
    const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data: https://fonts.gstatic.com",
        `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
    ].join('; ');
    const createPassThroughResponse = () => {
        const headers = new Headers(request.headers);
        if (applyAdminCsp) {
            headers.set('x-nonce', nonce);
            headers.set('Content-Security-Policy', csp);
        }
        return NextResponse.next({ request: { headers } });
    };
    const withAdminHeaders = (response: NextResponse) => {
        if (applyAdminCsp) {
            response.headers.set('Content-Security-Policy', csp);
            response.headers.set('Referrer-Policy', 'no-referrer');
        }
        return response;
    };
    let response = createPassThroughResponse();

    // Public pages without an admin session do not need auth refresh work.
    if (!isAdminPage && !isAdminApi) return withAdminHeaders(response);

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: { name: 'sb-admin-auth-token', path: '/', sameSite: 'strict' },
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = createPassThroughResponse();
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

    // 1. Protect the dashboard: Redirect to login if NOT an admin
    //    This catches both unauthenticated users AND picks users who aren't admins.
    if (pathname.startsWith('/foss-manager/dashboard')) {
        if (!user || !isAdminEmail(user.email)) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/foss-manager';
            return withAdminHeaders(NextResponse.redirect(redirectUrl));
        }

        const marker = request.cookies.get('foss-admin-marker')?.value;
        if (!marker) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/foss-manager';
            return withAdminHeaders(NextResponse.redirect(redirectUrl));
        }

        try {
            const secret = getAdminSessionSecret();
            const { payload } = await jwtVerify(marker, secret, { audience: 'admin' });
            
            if (payload.sub !== user.id) {
                throw new Error('Subject mismatch');
            }
        } catch (err) {
            console.error('Marker verification failed:', err);
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/foss-manager';
            return withAdminHeaders(NextResponse.redirect(redirectUrl));
        }
    }

    // 1b. Protect admin API routes: return 403 for non-admin requests.
    //     The API routes themselves also verify admin auth, but middleware
    //     provides an additional layer of defense.
    if (isAdminApi) {
        if (!user || !isAdminEmail(user.email)) {
            return withAdminHeaders(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
        }

        const marker = request.cookies.get('foss-admin-marker')?.value;
        if (!marker) {
            return withAdminHeaders(NextResponse.json({ error: 'Missing session marker' }, { status: 403 }));
        }

        try {
            const secret = getAdminSessionSecret();
            const { payload } = await jwtVerify(marker, secret, { audience: 'admin' });
            
            if (payload.sub !== user.id) {
                throw new Error('Subject mismatch');
            }
        } catch (err) {
            console.error('Marker verification failed in API route middleware:', err);
            return withAdminHeaders(NextResponse.json({ error: 'Invalid session marker' }, { status: 403 }));
        }
    }

    // 2. Only redirect away from login when both halves of the admin session
    // are valid. A Supabase session without a marker can happen after a marker
    // expires or cookies are partially cleared; redirecting it caused a loop:
    // login -> dashboard -> login.
    if (user && isAdminEmail(user.email) && pathname === '/foss-manager') {
        const marker = request.cookies.get('foss-admin-marker')?.value;
        if (marker) {
            try {
                const secret = getAdminSessionSecret();
                const { payload } = await jwtVerify(marker, secret, { audience: 'admin' });
                if (payload.sub === user.id) {
                    const redirectUrl = request.nextUrl.clone();
                    redirectUrl.pathname = '/foss-manager/dashboard';
                    return withAdminHeaders(NextResponse.redirect(redirectUrl));
                }
            } catch {
                // Stay on login so the user can establish a fresh admin session.
            }
        }
    }

    return withAdminHeaders(response);
}

export const config = {
    matcher: [
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
        '/api/registrations/:path*',
        '/api/form-schemas/:path*',
        '/api/picks/admin/posts',
    ],
};
