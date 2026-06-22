import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPicksUserByAuthId, getServiceClient } from '@/lib/picks-db';
import { checkRateLimit, sanitizeText } from '@/lib/rate-limit';

// Helper to verify user owns the post
async function getUserPost(postId: string, userId: string) {
    const serviceClient = getServiceClient();
    const { data, error } = await serviceClient
        .from('picks_posts')
        .select('*')
        .eq('id', postId)
        .eq('author_id', userId)
        .single();

    return { data, error };
}

// Helper to verify auth token
async function verifyAuth(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return { user: null, error: 'No authorization header' };

    const token = authHeader.replace('Bearer ', '');
    const serviceClient = getServiceClient();

    const { data: { user }, error } = await serviceClient.auth.getUser(token);
    if (error || !user) return { user: null, error: 'Invalid token' };

    const picksUser = await getPicksUserByAuthId(user.id);
    if (!picksUser) return { user: null, error: 'Picks user not found' };

    return { user: picksUser, error: null };
}

// GET /api/picks/posts/[id] — Get a single post (public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const auth_id = searchParams.get('auth_id');

        const { data, error } = await supabase
            .from('picks_posts')
            .select(`
                *,
                author:picks_users!author_id(id, username, email, created_at),
                picks_comments(count)
            `)
            .eq('id', id)
            .eq('is_removed', false)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        let user_vote = null;
        if (auth_id) {
            const picksUser = await getPicksUserByAuthId(auth_id);
            if (picksUser) {
                const { data: voteData } = await supabase
                    .from('picks_votes')
                    .select('value')
                    .eq('post_id', id)
                    .eq('user_id', picksUser.id)
                    .single();
                if (voteData) {
                    user_vote = voteData.value;
                }
            }
        }

        return NextResponse.json({
            ...data,
            comment_count: data.picks_comments?.[0]?.count || 0,
            user_vote,
        });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

// PUT /api/picks/posts/[id] — Edit user's own post
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Verify auth
        const { user, error: authError } = await verifyAuth(request);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user owns the post
        const { data: post, error: postError } = await getUserPost(id, user.id);
        if (postError || !post) {
            return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
        }

        // Parse body
        const body = await request.json();
        const { title, description, tool_name, flair, license } = body;

        // Validate required fields
        if (!title && !description && !tool_name && !flair && !license) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        // Prepare update object
        const updates: Record<string, any> = {};

        if (title !== undefined) {
            const cleanTitle = sanitizeText(title).slice(0, 200);
            if (cleanTitle.length < 3) {
                return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
            }
            updates.title = cleanTitle;
        }

        if (description !== undefined) {
            updates.description = sanitizeText(description).slice(0, 300);
        }

        if (tool_name !== undefined) {
            updates.tool_name = sanitizeText(tool_name).slice(0, 100);
        }

        if (flair !== undefined) {
            const FLAIRS = ['Development', 'Design', 'Sysadmin', 'Writing', 'Other', 'Question'];
            if (!FLAIRS.includes(flair)) {
                return NextResponse.json({ error: 'Invalid flair' }, { status: 400 });
            }
            updates.flair = flair;
        }

        if (license !== undefined) {
            updates.license = sanitizeText(license).slice(0, 50);
        }

        // Update post
        const serviceClient = getServiceClient();
        const { error: updateError } = await serviceClient
            .from('picks_posts')
            .update(updates)
            .eq('id', id)
            .eq('author_id', user.id);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Post updated successfully' });
    } catch (err) {
        console.error('Error in PUT:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE /api/picks/posts/[id] — Delete user's own post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // Verify auth
        const { user, error: authError } = await verifyAuth(request);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify user owns the post
        const { data: post, error: postError } = await getUserPost(id, user.id);
        if (postError || !post) {
            return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
        }

        // Rate limit deletes
        const rateCheck = checkRateLimit(user.id, 'delete-post');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Delete limit reached. Try again in ${Math.ceil(rateCheck.retryAfterMs / 60000)} minutes.` },
                { status: 429 }
            );
        }

        // Soft delete by marking as removed
        const serviceClient = getServiceClient();
        const { error: deleteError } = await serviceClient
            .from('picks_posts')
            .update({
                is_removed: true,
                removed_reason: 'Deleted by author'
            })
            .eq('id', id)
            .eq('author_id', user.id);

        if (deleteError) {
            return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error in DELETE:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
