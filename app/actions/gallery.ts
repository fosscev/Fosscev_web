"use server"

import { createClient } from '@supabase/supabase-js';

export async function getGalleryPhotos() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl) {
            console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
            return [];
        }

        // Initialize Supabase inside the function so it doesn't crash the build/import
        // if the service key is missing in the deployed environment
        const supabase = supabaseServiceKey
            ? createClient(supabaseUrl, supabaseServiceKey)
            : createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

        const { data: rootFiles } = await supabase.storage.from('event-photos').list();
        const { data: galleryFiles } = await supabase.storage.from('event-photos').list('gallery');

        let allFiles: any[] = [];

        if (rootFiles) {
            const validRootFiles = rootFiles.filter(f => f.name && f.name !== 'gallery' && !f.name.startsWith('.'));
            allFiles = [...allFiles, ...validRootFiles.map(f => ({ ...f, path: f.name }))];
        }

        if (galleryFiles) {
            const validGalleryFiles = galleryFiles.filter(f => f.name && !f.name.startsWith('.'));
            allFiles = [...allFiles, ...validGalleryFiles.map(f => ({ ...f, path: `gallery/${f.name}` }))];
        }

        const formattedItems = allFiles.map((file, index) => {
            const { data: urlData } = supabase.storage.from('event-photos').getPublicUrl(file.path);
            return {
                id: file.id || String(index),
                title: file.name.split('.')[0].replace(/_/g, ' ').replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase()),
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
