// =============================================================================
// Server-only utilities for the registration system.
// These must NEVER be imported from client components.
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
  const salt = process.env.IP_HASH_SALT || 'default-salt-change-me';
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract client IP from request headers.
 * Checks x-forwarded-for first (set by reverse proxies/CDNs), then x-real-ip.
 * Returns '0.0.0.0' as a fallback if no IP header is found.
 */
export function getClientIp(headers: Headers): string {
  const vercelForwarded = headers.get('x-vercel-forwarded-for');
  if (vercelForwarded) {
    return vercelForwarded.trim();
  }

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first (client) IP
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return '0.0.0.0';
}
