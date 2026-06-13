import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient, toggleSavedPost, getPicksUserByAuthId } from '@/lib/picks-db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(
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

        // Rate limit votes to prevent spam
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateCheck = checkRateLimit(`${ip}:${user.id}`, 'vote');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.' },
                { status: 429 }
            );
        }

        // Get picks user
        const picksUser = await getPicksUserByAuthId(user.id);
        if (!picksUser) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        const result = await toggleSavedPost(picksUser.id, id);

        return NextResponse.json({
            message: result.isSaved ? 'Post saved' : 'Post unsaved',
            isSaved: result.isSaved
        });
    } catch (err) {
        console.error('Save post error:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
