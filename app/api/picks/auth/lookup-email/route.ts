import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/picks-db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    const { data: user } = await serviceClient
        .from('picks_users')
        .select('email')
        .ilike('username', username)
        .single();

    if (!user || !user.email) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ email: user.email });
}
