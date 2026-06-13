import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, sanitizeText } from '@/lib/rate-limit';
import { fetchPosts, getPicksUserByAuthId, getServiceClient, FLAIRS, type Flair, type SortMode } from '@/lib/picks-db';
import { supabase } from '@/lib/supabase';

// GET /api/picks/posts — Fetch posts with sorting, filtering, pagination
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sort = (searchParams.get('sort') || 'hot') as SortMode;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const flair = searchParams.get('flair') as Flair | undefined;
    const authId = searchParams.get('auth_id') || undefined;
    const saved = searchParams.get('saved') === 'true';
    const mine = searchParams.get('mine') === 'true';

    // Verify auth if checking saved posts or own posts (requires auth header)
    let authenticatedUserId: string | undefined;
    if (saved || mine) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                const picksUser = await getPicksUserByAuthId(user.id);
                authenticatedUserId = picksUser?.id;
            }
        }
        if (!authenticatedUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        if (saved) {
            const { fetchSavedPosts } = await import('@/lib/picks-db');
            const posts = await fetchSavedPosts(authenticatedUserId);
            return NextResponse.json({ posts, total: posts.length });
        }
    }

    // Resolve picks user ID from auth ID for normal feed
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
        authorId: mine ? authenticatedUserId : undefined,
    });

    return NextResponse.json(result);
}

// POST /api/picks/posts — Create a new post
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, tool_name, flair, license, auth_id, image_url } = body;

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
        if (!title || !tool_name || !flair) {
            return NextResponse.json({ error: 'Title, tool name, and category are required' }, { status: 400 });
        }

        if (!FLAIRS.includes(flair)) {
            return NextResponse.json({ error: 'Invalid flair' }, { status: 400 });
        }

        const cleanTitle = sanitizeText(title).slice(0, 200);
        const cleanDesc = description ? sanitizeText(description) : null;
        const cleanTool = sanitizeText(tool_name).slice(0, 100);
        const cleanLicense = license ? sanitizeText(license).slice(0, 50) : null;
        const cleanImageUrl = image_url ? sanitizeText(image_url) : null;

        if (cleanTitle.length < 3) {
            return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
        }

        const serviceClient = getServiceClient();

        // Duplicate check — same title + tool in 24h
        const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
        const { data: dupes } = await serviceClient
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
        const { data, error } = await serviceClient
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
                image_url: cleanImageUrl,
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
