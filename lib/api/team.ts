import { supabase, TeamMember as SupabaseTeamMember } from '../supabase';

/**
 * Fetch all team members from Supabase
 */
export async function getTeamMembers(coreTeamOnly: boolean = false) {
    try {
        let query = supabase
            .from('team_members')
            .select('*')
            .order('display_order', { ascending: true });

        if (coreTeamOnly) {
            query = query.eq('is_core_team', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching team members:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching team members:', error);
        return { data: null, error };
    }
}

/**
 * Fetch core team members only
 */
export async function getCoreTeam() {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('is_core_team', true)
            .is('is_faculty_advisor', false)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching core team:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching core team:', error);
        return { data: null, error };
    }
}

/**
 * Fetch subteam members only
 */
export async function getSubteam() {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('is_core_team', false)
            .is('is_faculty_advisor', false)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching subteam:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching subteam:', error);
        return { data: null, error };
    }
}

/**
 * Fetch faculty advisors only
 */
export async function getFacultyAdvisors() {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('is_faculty_advisor', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching faculty advisors:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching faculty advisors:', error);
        return { data: null, error };
    }
}

/**
 * Add a new team member
 */
export async function addTeamMember(member: Omit<SupabaseTeamMember, 'id' | 'created_at' | 'updated_at'>) {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .insert([member])
            .select()
            .single();

        if (error) {
            console.error('Error adding team member:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error adding team member:', error);
        return { data: null, error };
    }
}

/**
 * Update an existing team member
 */
export async function updateTeamMember(id: string, updates: Partial<SupabaseTeamMember>) {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating team member:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error updating team member:', error);
        return { data: null, error };
    }
}

/**
 * Delete a team member
 */
export async function deleteTeamMember(id: string) {
    try {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting team member:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Unexpected error deleting team member:', error);
        return { success: false, error };
    }
}

/**
 * Upload team member image to Supabase Storage
 */
export async function uploadTeamImage(file: File, memberId?: string): Promise<{ url: string | null; error: Error | null }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = memberId
            ? `${memberId}.${fileExt}`
            : `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('team-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) {
            console.error('Error uploading team image:', error);
            return { url: null, error };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('team-images')
            .getPublicUrl(data.path);

        return { url: urlData.publicUrl, error: null };
    } catch (error) {
        console.error('Unexpected error uploading team image:', error);
        return { url: null, error: error as Error };
    }
}

/**
 * Delete team member image from Supabase Storage
 */
export async function deleteTeamImage(imageUrl: string): Promise<{ success: boolean; error: Error | null }> {
    try {
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];

        const { error } = await supabase.storage
            .from('team-images')
            .remove([fileName]);

        if (error) {
            console.error('Error deleting team image:', error);
            return { success: false, error };
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Unexpected error deleting team image:', error);
        return { success: false, error: error as Error };
    }
}
