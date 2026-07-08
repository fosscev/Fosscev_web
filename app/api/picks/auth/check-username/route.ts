import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/picks-db';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const rateCheck = await checkRateLimit(ip, 'signin');
        if (!rateCheck.allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { username } = await request.json();

        if (!username || typeof username !== 'string') {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const serviceClient = getServiceClient();
        const { count, error } = await serviceClient
            .from('picks_users')
            .select('*', { count: 'exact', head: true })
            .ilike('username', username);

        if (error) {
            console.error('Error checking username:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }

        return NextResponse.json({ exists: (count ?? 0) > 0 });
    } catch (err) {
        console.error('Unexpected error in check-username:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
