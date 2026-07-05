// Admin email whitelist is securely stored in process.env.ADMIN_EMAILS to prevent brute-force targeting

export function isAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;

    // Server-side only: allow environment variable overrides
    const adminEmailsStr = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    return adminEmails.includes(email.toLowerCase());
}
