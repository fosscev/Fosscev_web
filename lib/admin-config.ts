// Single source of truth for admin email whitelist.
// Used by proxy.ts (server middleware), login page, and dashboard layout.
export const ADMIN_EMAILS: string[] = [
    'fossclubcev@cev.ac.in',
    'admin@fosscev.org',
];

export function isAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}
