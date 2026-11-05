import type { NextRequest } from 'next/server';

/** Require a same-origin browser request for cookie-authenticated mutations. */
export function hasSameOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return false;

    try {
        return new URL(origin).origin === request.nextUrl.origin;
    } catch {
        return false;
    }
}
