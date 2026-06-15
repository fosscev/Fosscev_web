// In-memory rate limiter — no extra dependencies
// Tracks requests per identifier (IP or user ID) per action

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (now - entry.windowStart > 600000) { // 10 min max
                store.delete(key);
            }
        }
    }, 300000);
}

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

export function checkRateLimit(
    identifier: string,
    action: string
): { allowed: boolean; retryAfterMs: number } {
    const config = RATE_LIMITS[action];
    if (!config) return { allowed: true, retryAfterMs: 0 };

    const key = `${action}:${identifier}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart > config.windowMs) {
        // New window
        store.set(key, { count: 1, windowStart: now });
        return { allowed: true, retryAfterMs: 0 };
    }

    if (entry.count >= config.maxRequests) {
        const retryAfterMs = config.windowMs - (now - entry.windowStart);
        return { allowed: false, retryAfterMs };
    }

    entry.count++;
    return { allowed: true, retryAfterMs: 0 };
}

// Simple HTML tag stripper for XSS prevention
export function sanitizeText(input: string): string {
    return input
        .replace(/<[^>]*>/g, '')       // Strip HTML tags
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim();
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
