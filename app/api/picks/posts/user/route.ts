import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPicksUserByAuthId } from '@/lib/picks-db';

// Helper to verify auth token
async function verifyAuth(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return { user: null, error: 'No authorization header' };

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = supabase;

    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) return { user: null, error: 'Invalid token' };

    const picksUser = await getPicksUserByAuthId(user.id);
    if (!picksUser) return { user: null, error: 'Picks user not found' };

    return { user: picksUser, error: null };
}

// GET /api/picks/posts/user/all — Get user's own posts (including removed)
export async function GET(request: NextRequest) {
    try {
        // Verify auth
        const { user, error: authError } = await verifyAuth(request);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query params
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const perPage = 20;
        const offset = (page - 1) * perPage;
        const includeRemoved = searchParams.get('includeRemoved') === 'true';

        // Build query
        let query = supabase
            .from('picks_posts')
            .select(`
                *,
                picks_comments(count)
            `, { count: 'exact' })
            .eq('author_id', user.id);

        // Filter removed if not requested
        if (!includeRemoved) {
            query = query.eq('is_removed', false);
        }

        query = query.order('created_at', { ascending: false })
            .range(offset, offset + perPage - 1);

        const { data, count, error } = await query;

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
        }

        const posts = (data || []).map((p: any) => ({
            ...p,
            comment_count: p.picks_comments?.[0]?.count || 0,
        }));

        return NextResponse.json({
            posts,
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / perPage),
        });
    } catch (err) {
        console.error('Error fetching user posts:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
