import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
    );
}

// Create a single supabase client for interacting with your database
// Using createBrowserClient from @supabase/ssr to ensure cookies are 
// correctly shared between client and server (middleware/proxy).
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

if (typeof window !== 'undefined') {
    // Catch unhandled background refresh errors from Supabase Auth (e.g., stale tokens)
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && (event.reason.name === 'AuthApiError' || event.reason.message?.includes('Auth'))) {
            console.warn('Caught unhandled Supabase Auth error, clearing stale session...');
            event.preventDefault(); // Prevent Next.js Error Overlay
            supabase.auth.signOut().catch(() => { }); // Clear the bad session
        }
    });
}

// Database types
export interface TeamMember {
    id?: string;
    name: string;
    role: string;
    image_url: string | null;
    github?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    bio?: string | null;
    is_core_team: boolean;
    is_faculty_advisor?: boolean;
    display_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface Event {
    id?: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    type: 'Workshop' | 'Hackathon' | 'Talk' | 'Meetup';
    attendees: string;
    status: 'Upcoming' | 'Registration Open' | 'Completed';
    image_url?: string | null;
    poster_url?: string | null;
    link?: string | null;
    created_at?: string;
    updated_at?: string;
}

// Helper function to get public URL for storage files
export const getPublicUrl = (bucket: string, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
};

// Helper function to upload file to storage
export const uploadFile = async (
    bucket: string,
    path: string,
    file: File
): Promise<{ url: string | null; error: Error | null }> => {
    try {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        });

        if (error) {
            return { url: null, error };
        }

        const publicUrl = getPublicUrl(bucket, data.path);
        return { url: publicUrl, error: null };
    } catch (error) {
        return { url: null, error: error as Error };
    }
};

// Helper function to delete file from storage
export const deleteFile = async (
    bucket: string,
    path: string
): Promise<{ success: boolean; error: Error | null }> => {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);

        if (error) {
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: error as Error };
    }
};
