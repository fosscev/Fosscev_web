"use server"

import { createClient } from '@supabase/supabase-js';

export async function getGalleryPhotos() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error("Missing Supabase environment variables.");
            return [];
        }

        // Use the safe public anonymous key for listing requests
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: rootFiles, error } = await supabase.storage.from('event-photos').list();

        if (error) {
            console.error("Error listing files from Supabase:", error);
            return [];
        }

        let allFiles: any[] = [];

        if (rootFiles) {
            const validRootFiles = rootFiles.filter(f => f.name && !f.name.startsWith('.'));
            allFiles = validRootFiles.map(f => ({ ...f, path: f.name }));
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
