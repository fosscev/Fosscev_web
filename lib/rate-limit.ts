import { getServiceClient } from '@/lib/picks-db';

interface RateLimitConfig {
    windowMs: number;   // Time window in milliseconds
    maxRequests: number; // Max requests in window
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
    'signup-otp': { windowMs: 600000, maxRequests: 3 },       // 3 per 10 min
    'verify-otp': { windowMs: 1800000, maxRequests: 5 },      // 5 per 30 min (lockout)
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
    if (!config) return { allowed: true, retryAfterMs: 0 };

    try {
        const serviceClient = getServiceClient();
        const { data, error } = await serviceClient.rpc('check_rate_limit', {
            p_identifier: identifier,
            p_action: action,
            p_max_requests: config.maxRequests,
            p_window_seconds: Math.floor(config.windowMs / 1000)
        });

        if (error) {
            console.error('Rate limit RPC error:', error);
            // Fall open if DB fails
            return { allowed: true, retryAfterMs: 0 };
        }

        return { allowed: !!data, retryAfterMs: data ? 0 : config.windowMs };
    } catch (err) {
        console.error('Rate limit exception:', err);
        return { allowed: true, retryAfterMs: 0 };
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
