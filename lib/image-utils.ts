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
 * Converts public Supabase object URLs to the Storage image-render endpoint.
 *
 * The Next.js server-side optimizer rejects this Supabase host in DNS64
 * environments because it resolves through a private-address representation.
 * Browser-direct delivery avoids that failure. The browser calls this endpoint
 * directly (Next image proxy is disabled), so legacy JPEG/PNG objects are
 * delivered as resized WebP files too.
 */
export function getSupabaseImageUrl(
    pathOrUrl: string | null | undefined,
    fallbackUrl: string = '/placeholder-user.svg',
    options: { width?: number; quality?: number } = {}
): string {
    if (!pathOrUrl) return fallbackUrl;

    if (!isSupabaseUrl(pathOrUrl)) return pathOrUrl;

    try {
        const url = new URL(pathOrUrl);
        url.pathname = url.pathname.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
        url.searchParams.set('width', String(options.width ?? 1200));
        url.searchParams.set('quality', String(options.quality ?? 75));
        url.searchParams.set('format', 'webp');
        return url.toString();
    } catch {
        return fallbackUrl;
    }
}
