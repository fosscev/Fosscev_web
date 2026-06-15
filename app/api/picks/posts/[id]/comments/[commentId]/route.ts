import { NextRequest, NextResponse } from 'next/server';
import { getPicksUserByAuthId, getServiceClient } from '@/lib/picks-db';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const { id: postId, commentId } = await params;
        const { auth_id } = await request.json();

        if (!auth_id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const picksUser = await getPicksUserByAuthId(auth_id);
        if (!picksUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const serviceClient = getServiceClient();

        // Verify comment exists and belongs to user
        const { data: comment } = await serviceClient
            .from('picks_comments')
            .select('author_id')
            .eq('id', commentId)
            .eq('post_id', postId)
            .single();

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        if (comment.author_id !== picksUser.id) {
            return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 });
        }

        // Soft delete
        const { error } = await serviceClient
            .from('picks_comments')
            .update({ is_removed: true })
            .eq('id', commentId);

        if (error) {
            console.error('Error deleting comment:', error);
            return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete comment error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
