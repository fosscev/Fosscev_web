import { createServerClient } from '@supabase/ssr';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import { isAdminEmail } from '@/lib/admin-config';
import { hasSameOrigin } from '@/lib/request-security';

/** Require both a valid Supabase user session and the signed admin marker. */
export async function verifyAdminRequest(request: NextRequest): Promise<boolean> {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !hasSameOrigin(request)) return false;
    const marker = request.cookies.get('foss-admin-marker')?.value;
    if (!marker) return false;

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookieOptions: { name: 'sb-admin-auth-token', path: '/', sameSite: 'strict' },
                cookies: {
                    getAll: () => request.cookies.getAll(),
                    setAll: () => undefined,
                },
            }
        );
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user || !isAdminEmail(user.email)) return false;

        const { payload } = await jwtVerify(marker, getAdminSessionSecret(), { audience: 'admin' });
        return payload.sub === user.id;
    } catch {
        return false;
    }
}
