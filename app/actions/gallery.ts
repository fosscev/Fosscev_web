"use server"

import { createClient } from '@supabase/supabase-js';

/**
 * Fetch gallery photos from the event-photos storage bucket.
 * Requires an RLS policy on storage.objects allowing public SELECT
 * for the 'event-photos' bucket so the anon key can list files.
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

        // List all files in the root of the event-photos bucket
        const { data: files, error } = await supabase.storage
            .from('event-photos')
            .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

        if (error) {
            console.error("Error listing event photos:", error);
            return [];
        }

        if (!files || files.length === 0) {
            return [];
        }

        // Filter out any hidden files or folders
        const validFiles = files.filter(f => f.name && !f.name.startsWith('.') && f.id);

        const formattedItems = validFiles.map((file, index) => {
            const { data: urlData } = supabase.storage
                .from('event-photos')
                .getPublicUrl(file.name);

            return {
                id: file.id || String(index),
                title: file.name
                    .split('.')[0]
                    .replace(/_/g, ' ')
                    .replace(/\s*\(\d+\)\s*/g, ' ')
                    .replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase())
                    .trim(),
                event: "FOSS CEV Event",
                image: urlData.publicUrl
            };
        });

        return formattedItems;
    } catch (error) {
        console.error("Error fetching gallery photos:", error);
        return [];
    }
}
