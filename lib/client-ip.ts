import { isIP } from 'node:net';

function firstValidIp(value: string | null): string | null {
    if (!value) return null;
    for (const candidate of value.split(',')) {
        const ip = candidate.trim();
        if (isIP(ip)) return ip;
    }
    return null;
}

/**
 * Use an IP header only when it is supplied by the deployment's trusted edge.
 * Vercel overwrites its forwarded IP headers. Other hosts must configure a
 * private header written by their reverse proxy; client-controlled forwarded
 * headers are deliberately ignored.
 */
export function getTrustedClientIp(headers: Headers): string {
    const configuredHeader = process.env.TRUSTED_CLIENT_IP_HEADER?.trim();
    const candidate = process.env.VERCEL === '1'
        ? firstValidIp(headers.get('x-vercel-forwarded-for'))
            || firstValidIp(headers.get('x-forwarded-for'))
        : configuredHeader
            ? firstValidIp(headers.get(configuredHeader))
            : null;

    return candidate || 'unknown';
}
