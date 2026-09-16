/**
 * image-utils.ts
 * Centralized utility for handling Supabase Storage image URLs.
 */

/**
 * Checks if a URL is a Supabase Storage URL.
 */
export function isSupabaseUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.includes('supabase.co/storage/v1/object/public/');
}

/**
 * Extracts the relative path from a full Supabase Storage public URL.
 * Example: "https://<project>.supabase.co/storage/v1/object/public/team-images/abc.webp"
 * Returns: "team-images/abc.webp"
 */
export function extractStoragePath(url: string | null | undefined): string | null {
    if (!url) return null;
    if (!isSupabaseUrl(url)) return null;

    try {
        const parts = url.split('/storage/v1/object/public/');
        if (parts.length > 1) {
            return parts[1];
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Normalizes an image URL, ensuring it can be used safely in the application.
 * Currently just returns the URL directly (acting as a pass-through for existing full URLs).
 * Can be expanded in the future to support Supabase image transformations if upgraded to Pro plan.
 */
export function getSupabaseImageUrl(
    pathOrUrl: string | null | undefined,
    fallbackUrl: string = '/placeholder-user.svg'
): string {
    if (!pathOrUrl) return fallbackUrl;

    // If it's already a full URL (Supabase or external), return it as is for now.
    // In the future, if we store relative paths instead of full URLs, we can build the full URL here.
    return pathOrUrl;
}
