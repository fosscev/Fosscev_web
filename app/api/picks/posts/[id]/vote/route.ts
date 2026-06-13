import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getPicksUserByAuthId } from '@/lib/picks-db';
import { supabase } from '@/lib/supabase';

// POST /api/picks/posts/[id]/vote — Cast or toggle a vote
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params;
        const { auth_id, value } = await request.json();

        if (!auth_id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (value !== 1 && value !== -1) {
            return NextResponse.json({ error: 'Vote value must be 1 or -1' }, { status: 400 });
        }

        const picksUser = await getPicksUserByAuthId(auth_id);
        if (!picksUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        // Rate limit
        const rateCheck = checkRateLimit(picksUser.id, 'vote');
        if (!rateCheck.allowed) {
            return NextResponse.json({ error: 'Voting too fast. Slow down.' }, { status: 429 });
        }

        // Check existing vote
        const { data: existingVote } = await supabase
            .from('picks_votes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', picksUser.id)
            .single();

        let scoreDelta = 0;

        if (existingVote) {
            if (existingVote.value === value) {
                // Same vote again → toggle off (remove vote)
                await supabase
                    .from('picks_votes')
                    .delete()
                    .eq('id', existingVote.id);
                scoreDelta = -value;
            } else {
                // Switch vote direction
                await supabase
                    .from('picks_votes')
                    .update({ value })
                    .eq('id', existingVote.id);
                scoreDelta = value * 2; // e.g., -1 → +1 = delta of 2
            }
        } else {
            // New vote
            await supabase
                .from('picks_votes')
                .insert({
                    post_id: postId,
                    user_id: picksUser.id,
                    value,
                });
            scoreDelta = value;
        }

        // Update post score
        const { data: post } = await supabase
            .from('picks_posts')
            .select('score')
            .eq('id', postId)
            .single();

        const newScore = (post?.score || 0) + scoreDelta;

        await supabase
            .from('picks_posts')
            .update({ score: newScore })
            .eq('id', postId);

        // Update user flair affinity score
        const { data: postData } = await supabase
            .from('picks_posts')
            .select('flair')
            .eq('id', postId)
            .single();

        if (postData?.flair) {
            // Upsert flair score
            const { data: existing } = await supabase
                .from('picks_user_flair_scores')
                .select('score')
                .eq('user_id', picksUser.id)
                .eq('flair', postData.flair)
                .single();

            if (existing) {
                const newFlairScore = existing.score + (existingVote && existingVote.value === value ? -value : value);
                await supabase
                    .from('picks_user_flair_scores')
                    .update({ score: newFlairScore })
                    .eq('user_id', picksUser.id)
                    .eq('flair', postData.flair);
            } else if (!existingVote || existingVote.value !== value) {
                await supabase
                    .from('picks_user_flair_scores')
                    .insert({
                        user_id: picksUser.id,
                        flair: postData.flair,
                        score: value,
                    });
            }
        }

        // Determine current user vote state
        let currentVote: number | null = null;
        if (existingVote && existingVote.value === value) {
            currentVote = null; // toggled off
        } else {
            currentVote = value;
        }

        return NextResponse.json({
            score: newScore,
            userVote: currentVote,
        });

    } catch (err) {
        console.error('Vote error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
