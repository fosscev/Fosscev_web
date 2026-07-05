// Admin email whitelist is now stored in process.env.ADMIN_EMAILS

export function isAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    // Server-side only
    const adminEmailsStr = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase());
    return adminEmails.includes(email.toLowerCase());
}
