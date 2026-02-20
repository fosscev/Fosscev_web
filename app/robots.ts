import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://foss.cev.ac.in';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/private/', '/admin/', '/foss-manager/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
