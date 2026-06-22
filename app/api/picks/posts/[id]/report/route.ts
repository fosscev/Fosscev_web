import { NextRequest, NextResponse } from 'next/server';
import { getPicksUserByAuthId, getServiceClient } from '@/lib/picks-db';
import { checkRateLimit, sanitizeText } from '@/lib/rate-limit';

// POST /api/picks/posts/[id]/report — Submit a report
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params;
        const { auth_id, reason } = await request.json();

        if (!auth_id) {
            return NextResponse.json({ error: 'Authentication required to report' }, { status: 401 });
        }

        const cleanReason = sanitizeText(reason || '').slice(0, 1000);
        if (cleanReason.length < 1) {
            return NextResponse.json({ error: 'Report reason cannot be empty' }, { status: 400 });
        }

        const picksUser = await getPicksUserByAuthId(auth_id);
        if (!picksUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Rate limit reports (e.g., max 5 per 5 mins)
        const rateCheck = checkRateLimit(picksUser.id, 'create-report');
        if (!rateCheck.allowed) {
            return NextResponse.json({ error: 'Reporting too fast. Slow down.' }, { status: 429 });
        }

        const serviceClient = getServiceClient();

        // Verify post exists
        const { data: post } = await serviceClient
            .from('picks_posts')
            .select('id')
            .eq('id', postId)
            .eq('is_removed', false)
            .single();

        if (!post) {
            return NextResponse.json({ error: 'Post not found or already removed' }, { status: 404 });
        }

        // Upsert report
        const { error } = await serviceClient
            .from('picks_reports')
            .upsert({
                post_id: postId,
                reporter_id: picksUser.id,
                reason: cleanReason,
                created_at: new Date().toISOString()
            }, {
                onConflict: 'post_id, reporter_id'
            });

        if (error) {
            console.error('Error submitting report:', error);
            return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Report submitted successfully' });

    } catch (err) {
        console.error('Report endpoint error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
