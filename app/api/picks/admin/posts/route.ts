import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Helper to check admin auth via Supabase service role
async function isAdmin(request: NextRequest): Promise<boolean> {
    // Check for admin session using same mechanism as /foss-manager
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error } = await serviceClient.auth.getUser(token);
    if (error || !user) return false;

    // Check if user email matches admin email (same as foss-manager)
    const adminEmail = 'fossclubcev@cev.ac.in';
    return user.email === adminEmail;
}

// GET /api/picks/admin/posts — Fetch all posts (including removed) for admin
export async function GET(request: NextRequest) {
    if (!await isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, flagged, removed
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = 20;
    const offset = (page - 1) * perPage;

    let query = supabase
        .from('picks_posts')
        .select(`
            *,
            author:picks_users!author_id(id, username, email, created_at),
            picks_comments(count)
        `, { count: 'exact' });

    if (filter === 'removed') {
        query = query.eq('is_removed', true);
    } else if (filter === 'flagged') {
        // Posts with negative scores are auto-flagged
        query = query.eq('is_removed', false).lt('score', -3);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + perPage - 1);

    const { data, count, error } = await query;

    if (error) {
        console.error('Admin fetch posts error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    const posts = (data || []).map((p: any) => ({
        ...p,
        comment_count: p.picks_comments?.[0]?.count || 0,
    }));

    return NextResponse.json({ posts, total: count || 0 });
}

// PATCH /api/picks/admin/posts — Remove/restore a post
export async function PATCH(request: NextRequest) {
    if (!await isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { post_id, action, reason } = await request.json();

    if (!post_id || !action) {
        return NextResponse.json({ error: 'post_id and action are required' }, { status: 400 });
    }

    if (action === 'remove') {
        const { error } = await supabase
            .from('picks_posts')
            .update({ is_removed: true, removed_reason: reason || 'Removed by admin' })
            .eq('id', post_id);

        if (error) {
            return NextResponse.json({ error: 'Failed to remove post' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Post removed' });
    }

    if (action === 'restore') {
        const { error } = await supabase
            .from('picks_posts')
            .update({ is_removed: false, removed_reason: null })
            .eq('id', post_id);

        if (error) {
            return NextResponse.json({ error: 'Failed to restore post' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Post restored' });
    }

    if (action === 'remove-comment') {
        const { comment_id } = await request.json();
        const { error } = await supabase
            .from('picks_comments')
            .update({ is_removed: true })
            .eq('id', comment_id);

        if (error) {
            return NextResponse.json({ error: 'Failed to remove comment' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Comment removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
