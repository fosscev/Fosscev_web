import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/picks-db';

// Helper to check admin auth via Supabase service role with detailed errors
async function checkAdmin(request: NextRequest): Promise<{ allowed: boolean; reason?: string }> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return { allowed: false, reason: 'No Authorization header was provided in the request' };
    }

    const token = authHeader.replace('Bearer ', '');
    const serviceClient = getServiceClient();

    const { data: { user }, error } = await serviceClient.auth.getUser(token);
    if (error) {
        return { allowed: false, reason: `Supabase auth verification failed: ${error.message}` };
    }
    if (!user) {
        return { allowed: false, reason: 'No active Supabase user session was found for this token' };
    }

    return { allowed: true };
}

// GET /api/picks/admin/posts — Fetch all posts (including removed) for admin
export async function GET(request: NextRequest) {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.allowed) {
        return NextResponse.json({ error: 'Unauthorized', reason: adminCheck.reason }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, flagged, removed, active
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = 20;
    const offset = (page - 1) * perPage;

    const serviceClient = getServiceClient();
    let query = serviceClient
        .from('picks_posts')
        .select(`
            *,
            author:picks_users!author_id(id, username, email, created_at),
            picks_comments(count),
            picks_reports(reason, created_at)
        `, { count: 'exact' });

    if (filter === 'removed') {
        query = query.eq('is_removed', true);
    } else if (filter === 'flagged') {
        // Change flagged tab to reported tab in backend logic: return posts with report_count > 0.
        // PostgREST doesn't support aggregate filtering easily on joined tables (like having count > 0)
        // Wait, if I just return all active posts to the frontend and let the frontend filter?
        // Let's just fetch all non-removed posts for 'active' and 'reported' filters and filter on the server.
        query = query.eq('is_removed', false);
    } else if (filter === 'active') {
        // Active posts are those that are not removed
        query = query.eq('is_removed', false);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + perPage - 1);

    const { data, count, error } = await query;

    if (error) {
        console.error('Admin fetch posts error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts', reason: error.message }, { status: 500 });
    }

    let posts = (data || []).map((p: any) => ({
        ...p,
        comment_count: p.picks_comments?.[0]?.count || 0,
        report_count: p.picks_reports?.length || 0,
        reports: p.picks_reports || []
    }));

    if (filter === 'flagged') {
        // Filter in memory for reported posts since PostgREST doesn't support having > 0 easily
        posts = posts.filter(p => p.report_count > 0);
    }

    return NextResponse.json({ posts, total: filter === 'flagged' ? posts.length : count || 0 });
}

// PATCH /api/picks/admin/posts — Remove/restore/flag a post
export async function PATCH(request: NextRequest) {
    const adminCheck = await checkAdmin(request);
    if (!adminCheck.allowed) {
        return NextResponse.json({ error: 'Unauthorized', reason: adminCheck.reason }, { status: 403 });
    }

    const { post_id, action, reason } = await request.json();

    if (!post_id || !action) {
        return NextResponse.json({ error: 'post_id and action are required' }, { status: 400 });
    }

    const serviceClient = getServiceClient();

    if (action === 'remove') {
        // Fetch post details to see if it was reported
        const { data: postData } = await serviceClient
            .from('picks_posts')
            .select(`
                author_id,
                title,
                picks_reports(count)
            `)
            .eq('id', post_id)
            .single();

        const reportCount = postData?.picks_reports?.[0]?.count || 0;

        const { error } = await serviceClient
            .from('picks_posts')
            .update({ is_removed: true, removed_reason: reason || 'Removed by admin' })
            .eq('id', post_id);

        if (error) {
            return NextResponse.json({ error: 'Failed to remove post', reason: error.message }, { status: 500 });
        }

        // If it was reported, notify the author
        if (reportCount > 0 && postData?.author_id) {
            await serviceClient.from('picks_notifications').insert({
                user_id: postData.author_id,
                message: 'Your PICK was removed by an administrator after being reported by users.',
                post_title: postData.title,
                is_read: false
            });
        }

        return NextResponse.json({ message: 'Post removed' });
    }

    if (action === 'restore') {
        const { error } = await serviceClient
            .from('picks_posts')
            .update({ is_removed: false, removed_reason: null })
            .eq('id', post_id);

        if (error) {
            return NextResponse.json({ error: 'Failed to restore post', reason: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Post restored' });
    }



    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
