const DEVELOPMENT_SECRET = 'development-only-admin-session-secret';

export function getAdminSessionSecret(): Uint8Array {
    const configuredSecret = process.env.SESSION_MARKER_SECRET;
    if (!configuredSecret && process.env.NODE_ENV === 'production') {
        throw new Error('SESSION_MARKER_SECRET must be configured in production.');
    }

    const secret = configuredSecret || DEVELOPMENT_SECRET;
    if (new TextEncoder().encode(secret).byteLength < 32) {
        throw new Error('SESSION_MARKER_SECRET must be at least 32 bytes long.');
    }

    return new TextEncoder().encode(secret);
}
