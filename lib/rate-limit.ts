import { getServiceClient } from '@/lib/picks-db';
import { createHmac } from 'node:crypto';
import { getAdminSessionSecret } from '@/lib/admin-session-secret';

interface RateLimitConfig {
    windowMs: number;   // Time window in milliseconds
    maxRequests: number; // Max requests in window
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
    'signup-otp': { windowMs: 600000, maxRequests: 3 },       // 3 per 10 min
    'verify-otp': { windowMs: 1800000, maxRequests: 5 },      // 5 per 30 min (lockout)
    'recover-token': { windowMs: 900000, maxRequests: 5 },    // 5 recovery-token exchanges per 15 min
    'reset-password': { windowMs: 900000, maxRequests: 3 },   // 3 reset requests per 15 min
    'signin': { windowMs: 300000, maxRequests: 10 },           // 10 per 5 min
    'create-post': { windowMs: 3600000, maxRequests: 5 },      // 5 per hour
    'create-comment': { windowMs: 300000, maxRequests: 10 },   // 10 per 5 min
    'vote': { windowMs: 60000, maxRequests: 60 },              // 60 per min
};

export async function checkRateLimit(
    identifier: string,
    action: string
): Promise<{ allowed: boolean; retryAfterMs: number }> {
    const config = RATE_LIMITS[action];
    if (!config) {
        console.error(`Unknown rate-limit action: ${action}`);
        return { allowed: false, retryAfterMs: 60000 };
    }

    try {
        const identifierHash = createHmac('sha256', getAdminSessionSecret())
            .update(identifier)
            .digest('hex');
        const serviceClient = getServiceClient();
        const { data, error } = await serviceClient.rpc('check_rate_limit', {
            p_identifier: identifierHash,
            p_action: action,
            p_max_requests: config.maxRequests,
            p_window_seconds: Math.floor(config.windowMs / 1000)
        });

        if (error) {
            console.error('Rate limit RPC error; rejecting request:', error.code, error.message);
            return { allowed: false, retryAfterMs: config.windowMs };
        }

        return { allowed: !!data, retryAfterMs: data ? 0 : config.windowMs };
    } catch (err) {
        console.error('Rate limit exception; rejecting request:', err);
        return { allowed: false, retryAfterMs: config.windowMs };
    }
}

// Simple HTML tag stripper for XSS prevention with while loop to catch double encoding
export function sanitizeText(input: string): string {
    let current = input || "";
    let previous = "";
    while (current !== previous) {
        previous = current;
        current = current
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        current = current.replace(/<[^>]*>/g, '');
    }
    return current.trim();
}

// Email domain validation
export function isAllowedEmailDomain(email: string): boolean {
    const allowedDomains = [
        'cev.ac.in',
        'gmail.com',
        'outlook.com',
        'yahoo.com',
        'hotmail.com',
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return allowedDomains.includes(domain);
}
