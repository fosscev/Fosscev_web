import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, getPicksUserByAuthId } from '@/lib/picks-db';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Verify auth using service client based on token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getServiceClient();
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get picks user
        const picksUser = await getPicksUserByAuthId(user.id);
        if (!picksUser) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Check if user is author
        const { data: post } = await supabase
            .from('picks_posts')
            .select('author_id')
            .eq('id', id)
            .single();

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (post.author_id !== picksUser.id) {
            return NextResponse.json({ error: 'Forbidden. You can only delete your own posts.' }, { status: 403 });
        }

        // Soft delete the post
        const { error } = await supabase
            .from('picks_posts')
            .update({ is_removed: true, removed_reason: 'Deleted by author' })
            .eq('id', id);

        if (error) {
            console.error('Delete post error:', error);
            return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Delete route error:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
