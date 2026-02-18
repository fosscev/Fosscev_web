import { supabase, Event as SupabaseEvent } from '../supabase';

/**
 * Fetch all events from Supabase
 */
export async function getEvents() {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching events:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching events:', error);
        return { data: null, error };
    }
}

/**
 * Fetch upcoming events (date >= today)
 */
export async function getUpcomingEvents() {
    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gte('date', today)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching upcoming events:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching upcoming events:', error);
        return { data: null, error };
    }
}

/**
 * Fetch past events (date < today)
 */
export async function getPastEvents() {
    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .lt('date', today)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching past events:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching past events:', error);
        return { data: null, error };
    }
}

/**
 * Fetch events by type
 */
export async function getEventsByType(type: 'Workshop' | 'Hackathon' | 'Talk' | 'Meetup') {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('type', type)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching events by type:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching events by type:', error);
        return { data: null, error };
    }
}

/**
 * Fetch events by status
 */
export async function getEventsByStatus(status: 'Upcoming' | 'Registration Open' | 'Completed') {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('status', status)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching events by status:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching events by status:', error);
        return { data: null, error };
    }
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching event:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching event:', error);
        return { data: null, error };
    }
}

/**
 * Add a new event
 */
export async function addEvent(event: Omit<SupabaseEvent, 'id' | 'created_at' | 'updated_at'>) {
    try {
        const { data, error } = await supabase
            .from('events')
            .insert([event])
            .select()
            .single();

        if (error) {
            console.error('Error adding event:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error adding event:', error);
        return { data: null, error };
    }
}

/**
 * Update an existing event
 */
export async function updateEvent(id: string, updates: Partial<SupabaseEvent>) {
    try {
        const { data, error } = await supabase
            .from('events')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating event:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error updating event:', error);
        return { data: null, error };
    }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string) {
    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting event:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Unexpected error deleting event:', error);
        return { success: false, error };
    }
}

/**
 * Upload event poster to Supabase Storage
 */
export async function uploadEventPoster(file: File, eventId?: string): Promise<{ url: string | null; error: Error | null }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = eventId
            ? `${eventId}.${fileExt}`
            : `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('event-posters')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) {
            console.error('Error uploading event poster:', error);
            return { url: null, error };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('event-posters')
            .getPublicUrl(data.path);

        return { url: urlData.publicUrl, error: null };
    } catch (error) {
        console.error('Unexpected error uploading event poster:', error);
        return { url: null, error: error as Error };
    }
}

/**
 * Delete event poster from Supabase Storage
 */
export async function deleteEventPoster(imageUrl: string): Promise<{ success: boolean; error: Error | null }> {
    try {
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];

        const { error } = await supabase.storage
            .from('event-posters')
            .remove([fileName]);

        if (error) {
            console.error('Error deleting event poster:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Unexpected error deleting event poster:', error);
        return { success: false, error: error as Error };
    }
}
