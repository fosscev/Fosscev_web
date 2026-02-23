"use server"

import { createClient } from '@supabase/supabase-js';

/**
 * Fetch gallery photos from the events database table.
 * We pull image_url (and poster_url) from all events instead of listing
 * storage bucket files, since Supabase Storage RLS blocks anonymous listing.
 * Database SELECT works perfectly fine with the public anon key.
 */
export async function getGalleryPhotos() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error("Missing Supabase environment variables.");
            return [];
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Fetch all events that have an image_url or poster_url
        const { data: events, error } = await supabase
            .from('events')
            .select('id, title, type, date, image_url, poster_url')
            .order('date', { ascending: false });

        if (error) {
            console.error("Error fetching events for gallery:", error);
            return [];
        }

        if (!events || events.length === 0) {
            return [];
        }

        // Collect all valid image URLs from events
        const formattedItems: { id: string; title: string; event: string; image: string }[] = [];

        events.forEach((event, index) => {
            const year = event.date ? new Date(event.date).getFullYear() : "2025";
            const eventLabel = `${event.type || "Event"} ${year}`;

            // Add poster_url if available
            if (event.poster_url) {
                formattedItems.push({
                    id: `${event.id}-poster`,
                    title: event.title,
                    event: eventLabel,
                    image: event.poster_url
                });
            }

            // Add image_url if available and different from poster
            if (event.image_url && event.image_url !== event.poster_url) {
                formattedItems.push({
                    id: `${event.id}-image`,
                    title: event.title,
                    event: eventLabel,
                    image: event.image_url
                });
            }
        });

        return formattedItems;
    } catch (error) {
        console.error("Error fetching gallery photos:", error);
        return [];
    }
}
