import { NextRequest, NextResponse } from 'next/server';
import { createPicksUser, getPicksUserByAuthId } from '@/lib/picks-db';

export async function POST(request: NextRequest) {
    try {
        const { auth_id, email, username } = await request.json();

        if (!auth_id || !email) {
            return NextResponse.json(
                { error: 'auth_id and email are required' },
                { status: 400 }
            );
        }

        // Check if profile already exists
        let picksUser = await getPicksUserByAuthId(auth_id);
        if (!picksUser) {
            picksUser = await createPicksUser(auth_id, email, username);
        }

        return NextResponse.json({ user: picksUser });
    } catch (err) {
        console.error('Ensure profile error:', err);
        return NextResponse.json(
            { error: 'Failed to ensure profile' },
            { status: 500 }
        );
    }
}
