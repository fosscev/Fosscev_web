import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, sanitizeText } from '@/lib/rate-limit';
import { getPicksUserByAuthId, fetchComments } from '@/lib/picks-db';
import { supabase } from '@/lib/supabase';

// GET /api/picks/posts/[id]/comments — Fetch comments for a post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: postId } = await params;
    const comments = await fetchComments(postId);
    return NextResponse.json({ comments });
}

// POST /api/picks/posts/[id]/comments — Add a comment
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params;
        const { auth_id, body } = await request.json();

        if (!auth_id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const picksUser = await getPicksUserByAuthId(auth_id);
        if (!picksUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Rate limit
        const rateCheck = checkRateLimit(picksUser.id, 'create-comment');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: 'Commenting too fast. Please wait a moment.' },
                { status: 429 }
            );
        }

        const cleanBody = sanitizeText(body).slice(0, 1000);
        if (cleanBody.length < 1) {
            return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
        }

        // Verify post exists
        const { data: post } = await supabase
            .from('picks_posts')
            .select('id')
            .eq('id', postId)
            .eq('is_removed', false)
            .single();

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const { data, error } = await supabase
            .from('picks_comments')
            .insert({
                post_id: postId,
                author_id: picksUser.id,
                body: cleanBody,
                is_removed: false,
            })
            .select(`
                *,
                author:picks_users!author_id(id, username, email, created_at)
            `)
            .single();

        if (error) {
            console.error('Error creating comment:', error);
            return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
        }

        return NextResponse.json({ comment: data }, { status: 201 });

    } catch (err) {
        console.error('Comment error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
