import { MetadataRoute } from 'next';
import { getEvents } from '@/lib/api/events';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Base URL from environment or default
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://foss.cev.ac.in';

    // Static routes
    const routes = ['', '/about', '/events', '/team', '/conduct', '/privacy'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Fetch all events
    const { data: events } = await getEvents();

    // Dynamic event routes
    const eventRoutes = events
        ? events.map((event) => ({
            url: `${baseUrl}/events/${event.id}`,
            lastModified: new Date(event.updated_at || event.created_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
        : [];

    return [...routes, ...eventRoutes];
}
