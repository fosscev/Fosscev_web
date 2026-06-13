import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, sanitizeText } from '@/lib/rate-limit';
import { fetchPosts, getPicksUserByAuthId, FLAIRS, type Flair, type SortMode } from '@/lib/picks-db';
import { supabase } from '@/lib/supabase';

// GET /api/picks/posts — Fetch posts with sorting, filtering, pagination
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sort = (searchParams.get('sort') || 'hot') as SortMode;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const flair = searchParams.get('flair') as Flair | undefined;
    const authId = searchParams.get('auth_id') || undefined;

    // Resolve picks user ID from auth ID
    let userId: string | undefined;
    if (authId) {
        const user = await getPicksUserByAuthId(authId);
        userId = user?.id;
    }

    const result = await fetchPosts({
        sort,
        page,
        flair: flair && FLAIRS.includes(flair) ? flair : undefined,
        userId,
    });

    return NextResponse.json(result);
}

// POST /api/picks/posts — Create a new post
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, tool_name, flair, license, auth_id } = body;

        // Auth check
        if (!auth_id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const picksUser = await getPicksUserByAuthId(auth_id);
        if (!picksUser) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 401 });
        }

        // Rate limit
        const rateCheck = checkRateLimit(picksUser.id, 'create-post');
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `Post limit reached. Try again in ${Math.ceil(rateCheck.retryAfterMs / 60000)} minutes.` },
                { status: 429 }
            );
        }

        // Validate
        if (!title || !description || !tool_name || !flair || !license) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (!FLAIRS.includes(flair)) {
            return NextResponse.json({ error: 'Invalid flair' }, { status: 400 });
        }

        const cleanTitle = sanitizeText(title).slice(0, 200);
        const cleanDesc = sanitizeText(description).slice(0, 300);
        const cleanTool = sanitizeText(tool_name).slice(0, 100);
        const cleanLicense = sanitizeText(license).slice(0, 50);

        if (cleanTitle.length < 3) {
            return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
        }

        // Duplicate check — same title + tool in 24h
        const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
        const { data: dupes } = await supabase
            .from('picks_posts')
            .select('id')
            .eq('title', cleanTitle)
            .eq('tool_name', cleanTool)
            .gte('created_at', oneDayAgo)
            .limit(1);

        if (dupes && dupes.length > 0) {
            return NextResponse.json(
                { error: 'A similar post was submitted recently. Please check existing posts.' },
                { status: 409 }
            );
        }

        // Insert
        const { data, error } = await supabase
            .from('picks_posts')
            .insert({
                title: cleanTitle,
                description: cleanDesc,
                tool_name: cleanTool,
                flair,
                license: cleanLicense,
                author_id: picksUser.id,
                score: 0,
                is_removed: false,
            })
            .select(`
                *,
                author:picks_users!author_id(id, username, email, created_at)
            `)
            .single();

        if (error) {
            console.error('Error creating post:', error);
            return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
        }

        return NextResponse.json({ post: { ...data, comment_count: 0, user_vote: null } }, { status: 201 });

    } catch (err) {
        console.error('Create post error:', err);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
