// =============================================================================
// Server-only utilities for the registration system.
// These must NEVER be imported from client components.
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createHmac } from 'node:crypto';
import { getAdminSessionSecret } from '@/lib/admin-session-secret';
import { getTrustedClientIp } from '@/lib/client-ip';

/**
 * Create a Supabase client with service_role privileges.
 * Bypasses RLS — use only in server actions and API routes.
 * NEVER expose the service role key to the client.
 */
export function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase SSR client that reads cookies from the current request.
 * Used to verify admin sessions in API routes.
 */
export async function getServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: 'sb-admin-auth-token', path: '/', sameSite: 'strict' },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // In read-only contexts (e.g. GET handlers), cookie setting may fail.
            // This is expected — the session refresh still works for reading.
          }
        },
      },
    }
  );
}

/**
 * Hash an IP address with SHA-256 + salt for privacy-preserving rate limiting.
 * Never store raw IP addresses.
 *
 * NOTE: IP-hash rate limiting will under-count distinct users behind the same
 * NAT gateway (e.g. campus wifi). This is intentional — rate limiting here is
 * a bot/abuse deterrent, not a precise per-person limit.
 */
export async function hashIp(ip: string): Promise<string> {
  return createHmac('sha256', getAdminSessionSecret()).update(ip).digest('hex');
}

/**
 * Extract client IP from a deployment-trusted edge header.
 * Untrusted forwarded headers are ignored.
 */
export function getClientIp(headers: Headers): string {
  return getTrustedClientIp(headers);
}
