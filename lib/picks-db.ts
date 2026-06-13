import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Server-side client with service role for admin operations
export function getServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key);
}

// ── Types ──────────────────────────────────────────────

export type Flair = 'Development' | 'Design' | 'Sysadmin' | 'Writing' | 'Other' | 'Question';

export const FLAIRS: Flair[] = ['Development', 'Design', 'Sysadmin', 'Writing', 'Other', 'Question'];

export const FLAIR_COLORS: Record<Flair, string> = {
    Development: '#3B82F6',
    Design: '#EC4899',
    Sysadmin: '#10B981',
    Writing: '#8B5CF6',
    Other: '#6B7280',
    Question: '#F59E0B',
};

export const ALLOWED_EMAIL_DOMAINS = [
    'cev.ac.in',
    'gmail.com',
    'outlook.com',
    'yahoo.com',
    'hotmail.com',
];

export interface PicksUser {
    id: string;
    auth_id: string;
    email: string;
    username: string;
    created_at: string;
}

export interface PicksPost {
    id: string;
    title: string;
    description: string | null;
    tool_name: string;
    flair: Flair;
    license: string | null;
    author_id: string;
    score: number;
    is_removed: boolean;
    removed_reason: string | null;
    created_at: string;
    image_url?: string | null;
    // Joined fields
    author?: PicksUser;
    comment_count?: number;
    user_vote?: number | null;
    is_saved?: boolean;
}

export interface PicksSavedPost {
    id: string;
    user_id: string;
    post_id: string;
    created_at: string;
}

export interface PicksVote {
    id: string;
    post_id: string;
    user_id: string;
    value: number;
    created_at: string;
}

export interface PicksComment {
    id: string;
    post_id: string;
    author_id: string;
    body: string;
    is_removed: boolean;
    created_at: string;
    // Joined
    author?: PicksUser;
}

// ── Database Helpers ───────────────────────────────────

export async function getPicksUserByAuthId(authId: string): Promise<PicksUser | null> {
    const { data } = await supabase
        .from('picks_users')
        .select('*')
        .eq('auth_id', authId)
        .single();
    return data;
}

export async function createPicksUser(authId: string, email: string, customUsername?: string): Promise<PicksUser | null> {
    const baseUsername = customUsername 
        ? customUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_')
        : email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const serviceClient = getServiceClient();

    // Check if username exists, append random digits if so
    const { data: existing } = await serviceClient
        .from('picks_users')
        .select('id')
        .eq('username', baseUsername)
        .maybeSingle();

    const finalUsername = existing
        ? `${baseUsername}_${Math.floor(Math.random() * 9999)}`
        : baseUsername;

    const { data, error } = await serviceClient
        .from('picks_users')
        .insert({ auth_id: authId, email, username: finalUsername })
        .select()
        .single();

    if (error) {
        console.error('Error creating picks user:', error);
        return null;
    }
    return data;
}

export type SortMode = 'hot' | 'top' | 'new' | 'questions' | 'foryou';

export async function fetchPosts(options: {
    sort: SortMode;
    page: number;
    flair?: Flair;
    userId?: string;
    authorId?: string;
    perPage?: number;
}): Promise<{ posts: PicksPost[]; total: number }> {
    const { sort, page, flair, userId, authorId, perPage = 20 } = options;
    const offset = (page - 1) * perPage;

    let query = supabase
        .from('picks_posts')
        .select(`
            *,
            author:picks_users!author_id(id, username, email, created_at),
            picks_comments(count)
        `, { count: 'exact' })
        .eq('is_removed', false);

    // Flair filter
    if (flair) {
        query = query.eq('flair', flair);
    }

    // Author filter
    if (authorId) {
        query = query.eq('author_id', authorId);
    }

    // Sort-specific filters
    if (sort === 'questions') {
        query = query.eq('flair', 'Question');
    }

    // Sorting
    switch (sort) {
        case 'top':
            query = query.order('score', { ascending: false });
            break;
        case 'new':
        case 'questions':
            query = query.order('created_at', { ascending: false });
            break;
        case 'hot':
        default:
            // Hot sort: we'll sort client-side after fetch since Supabase
            // doesn't support computed column ordering easily
            query = query.order('created_at', { ascending: false });
            break;
    }

    query = query.range(offset, offset + perPage - 1);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching posts:', error);
        return { posts: [], total: 0 };
    }

    let posts: PicksPost[] = (data || []).map((p: any) => ({
        ...p,
        author: p.author,
        comment_count: p.picks_comments?.[0]?.count || 0,
    }));

    // Hot sort: score / (hours + 2)^1.5
    if (sort === 'hot') {
        const now = Date.now();
        posts.sort((a, b) => {
            const hoursA = (now - new Date(a.created_at).getTime()) / 3600000;
            const hoursB = (now - new Date(b.created_at).getTime()) / 3600000;
            const hotA = a.score / Math.pow(hoursA + 2, 1.5);
            const hotB = b.score / Math.pow(hoursB + 2, 1.5);
            return hotB - hotA;
        });
    }

    // For You sort: boost flairs user has upvoted
    if (sort === 'foryou' && userId) {
        const { data: flairScores } = await supabase
            .from('picks_user_flair_scores')
            .select('flair, score')
            .eq('user_id', userId);

        const affinityMap: Record<string, number> = {};
        (flairScores || []).forEach((fs: any) => {
            affinityMap[fs.flair] = fs.score || 0;
        });

        // Get user's voted post IDs
        const { data: userVotes } = await supabase
            .from('picks_votes')
            .select('post_id')
            .eq('user_id', userId);
        const votedIds = new Set((userVotes || []).map((v: any) => v.post_id));

        const now = Date.now();
        posts.sort((a, b) => {
            const hoursA = (now - new Date(a.created_at).getTime()) / 3600000;
            const hoursB = (now - new Date(b.created_at).getTime()) / 3600000;
            const hotA = a.score / Math.pow(hoursA + 2, 1.5);
            const hotB = b.score / Math.pow(hoursB + 2, 1.5);
            const affinityA = (affinityMap[a.flair] || 0) * 3;
            const affinityB = (affinityMap[b.flair] || 0) * 3;
            const unseenA = votedIds.has(a.id) ? 0 : 2;
            const unseenB = votedIds.has(b.id) ? 0 : 2;
            return (hotB + affinityB + unseenB) - (hotA + affinityA + unseenA);
        });
    }

    // If userId provided, fetch user's votes and saved status for these posts
    if (userId && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        
        const [votesRes, savedRes] = await Promise.all([
            supabase.from('picks_votes').select('post_id, value').eq('user_id', userId).in('post_id', postIds),
            supabase.from('picks_saved_posts').select('post_id').eq('user_id', userId).in('post_id', postIds)
        ]);

        const voteMap: Record<string, number> = {};
        (votesRes.data || []).forEach((v: any) => {
            voteMap[v.post_id] = v.value;
        });

        const savedSet = new Set((savedRes.data || []).map((s: any) => s.post_id));

        posts = posts.map(p => ({
            ...p,
            user_vote: voteMap[p.id] || null,
            is_saved: savedSet.has(p.id),
        }));
    }

    return { posts, total: count || 0 };
}

export async function fetchComments(postId: string): Promise<PicksComment[]> {
    const { data, error } = await supabase
        .from('picks_comments')
        .select(`
            *,
            author:picks_users!author_id(id, username, email, created_at)
        `)
        .eq('post_id', postId)
        .eq('is_removed', false)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    return data || [];
}

export async function getCommunityStats() {
    const [usersResult, postsResult, flairResult] = await Promise.all([
        supabase.from('picks_users').select('*', { count: 'exact', head: true }),
        supabase.from('picks_posts').select('*', { count: 'exact', head: true }).eq('is_removed', false),
        supabase.from('picks_posts').select('flair').eq('is_removed', false),
    ]);

    const flairCounts: Record<string, number> = {};
    (flairResult.data || []).forEach((p: any) => {
        flairCounts[p.flair] = (flairCounts[p.flair] || 0) + 1;
    });

    return {
        memberCount: usersResult.count || 0,
        picksCount: postsResult.count || 0,
        flairCounts,
    };
}

export async function toggleSavedPost(userId: string, postId: string): Promise<{ isSaved: boolean }> {
    // Check if already saved
    const { data } = await supabase
        .from('picks_saved_posts')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

    if (data) {
        // Unsave
        await supabase
            .from('picks_saved_posts')
            .delete()
            .eq('user_id', userId)
            .eq('post_id', postId);
        return { isSaved: false };
    } else {
        // Save
        await supabase
            .from('picks_saved_posts')
            .insert({ user_id: userId, post_id: postId });
        return { isSaved: true };
    }
}

export async function fetchSavedPosts(userId: string): Promise<PicksPost[]> {
    const { data: savedPosts, error } = await supabase
        .from('picks_saved_posts')
        .select(`
            post_id,
            picks_posts (
                *,
                author:picks_users!author_id(id, username, email, created_at),
                picks_comments(count)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching saved posts:', error);
        return [];
    }

    let posts: PicksPost[] = (savedPosts || [])
        .filter((sp: any) => sp.picks_posts && !sp.picks_posts.is_removed)
        .map((sp: any) => ({
            ...sp.picks_posts,
            author: sp.picks_posts.author,
            comment_count: sp.picks_posts.picks_comments?.[0]?.count || 0,
            is_saved: true,
        }));

    // Fetch user votes for these posts
    if (posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const { data: votes } = await supabase
            .from('picks_votes')
            .select('post_id, value')
            .eq('user_id', userId)
            .in('post_id', postIds);

        const voteMap: Record<string, number> = {};
        (votes || []).forEach((v: any) => {
            voteMap[v.post_id] = v.value;
        });

        posts = posts.map(p => ({
            ...p,
            user_vote: voteMap[p.id] || null,
        }));
    }

    return posts;
}
