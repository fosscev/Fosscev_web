import { createClient } from '@supabase/supabase-js';

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
    const today = new Date().toISOString().split('T')[0];

    const upcomingResponse = await supabaseServer
        .from('events')
        .select('*')
        .neq('status', 'Draft')
        .gte('date', today)
        .order('date', { ascending: true });

    const pastResponse = await supabaseServer
        .from('events')
        .select('*')
        .neq('status', 'Draft')
        .lt('date', today)
        .order('date', { ascending: false });

    return {
        upcoming: upcomingResponse.data || [],
        past: pastResponse.data || [],
        error: upcomingResponse.error || pastResponse.error || null
    };
}

export async function getServerTeam() {
    const coreTeamResponse = await supabaseServer
        .from('team_members')
        .select('*')
        .eq('is_core_team', true)
        .is('is_faculty_advisor', false);

    const subTeamResponse = await supabaseServer
        .from('team_members')
        .select('*')
        .eq('is_core_team', false)
        .is('is_faculty_advisor', false);

    const facultyResponse = await supabaseServer
        .from('team_members')
        .select('*')
        .eq('is_faculty_advisor', true);

    const allMembers = [
        ...(coreTeamResponse.data || []),
        ...(subTeamResponse.data || [])
    ];

    const desiredOrder = [
        "Rishnu Lal N",
        "Roshith Krishna",
        "Sayanth P",
        "Anvar Sadath",
        "Lakshmi Reji Suresh",
        "Ashwandha RJ",
        "Sandra Sunil T",
        "Muhammad Shabaz",
        "Muhammad Aswlah",
        "Fathima P",
        "Hemanth Sudhan C",
        "Ananthanarayanan M"
    ];

    const finalCore = desiredOrder
        .map((name) => allMembers.find((member) => member.name === name))
        .filter(Boolean)
        .map((member) => {
            if (member.name === 'Muhammad Shabaz') {
                return {
                    ...member,
                    role: 'Content Writer'
                };
            }
            return member;
        });

    const finalSub = (subTeamResponse.data || []).filter(
        (member) =>
            member.name !== 'Hemanth Sudhan C' &&
            member.name !== 'Ananthanarayanan M'
    );

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
