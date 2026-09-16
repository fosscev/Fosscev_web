import { createClient } from '@supabase/supabase-js';
import { isEventActive } from '@/lib/event-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
    );
}

// Server-only client for public data fetching
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

export async function getServerEvents() {
    const response = await supabaseServer
        .from('events')
        .select('*')
        .neq('status', 'Draft')
        .order('date', { ascending: false });

    if (response.error) {
        return { upcoming: [], past: [], error: response.error };
    }

    const all = response.data || [];

    // Split events using the time-aware status engine.
    // Events remain "upcoming" until their end time (not just midnight).
    const upcoming = all
        .filter(e => isEventActive(e))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());  // ascending

    const past = all
        .filter(e => !isEventActive(e))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());  // descending

    return { upcoming, past, error: null };
}

export async function getServerTeam() {
    const coreTeamResponse = await supabaseServer
        .from('team_members')
        .select('id, name, role, image_url, github, linkedin, instagram, is_core_team, is_faculty_advisor, display_order')
        .eq('is_core_team', true)
        .is('is_faculty_advisor', false);

    const subTeamResponse = await supabaseServer
        .from('team_members')
        .select('id, name, role, image_url, github, linkedin, instagram, is_core_team, is_faculty_advisor, display_order')
        .eq('is_core_team', false)
        .is('is_faculty_advisor', false);

    const facultyResponse = await supabaseServer
        .from('team_members')
        .select('id, name, role, image_url, github, linkedin, instagram, is_core_team, is_faculty_advisor, display_order')
        .eq('is_faculty_advisor', true);

    const finalCore = [...(coreTeamResponse.data || [])]
        .sort((a, b) => a.display_order - b.display_order)
        .map((member) => {
            if (member.name === 'Muhammad Shabaz') {
                return {
                    ...member,
                    role: 'Content Writer'
                };
            }
            return member;
        });

    const finalSub = [...(subTeamResponse.data || [])]
        .sort((a, b) => a.display_order - b.display_order);

    return {
        coreTeam: finalCore,
        subTeam: finalSub,
        faculty: facultyResponse.data || [],
        error: coreTeamResponse.error || subTeamResponse.error || facultyResponse.error || null
    };
}

export async function getServerStats() {
    const { count, error } = await supabaseServer
        .from('events')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'Draft');

    return {
        eventsCount: count || 0,
        error
    };
}
