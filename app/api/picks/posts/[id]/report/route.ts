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
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Authentication required to report' }, { status: 401 });
        }
        const token = authHeader.replace('Bearer ', '');
        const serviceClient = getServiceClient();
        const { data: { user }, error: authError } = await serviceClient.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Authentication required to report' }, { status: 401 });
        }

        const { reason } = await request.json();
        const auth_id = user.id;

        const cleanReason = sanitizeText(reason || '').slice(0, 1000);
        if (cleanReason.length < 1) {
            return NextResponse.json({ error: 'Report reason cannot be empty' }, { status: 400 });
        }

        const picksUser = await getPicksUserByAuthId(auth_id);
        if (!picksUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Rate limit reports (e.g., max 5 per 5 mins)
        const rateCheck = await checkRateLimit(picksUser.id, 'create-report');
        if (!rateCheck.allowed) {
            return NextResponse.json({ error: 'Reporting too fast. Slow down.' }, { status: 429 });
        }

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
