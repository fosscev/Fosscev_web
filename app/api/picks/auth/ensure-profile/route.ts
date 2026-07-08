import { NextRequest, NextResponse } from 'next/server';
import { createPicksUser, getPicksUserByAuthId, getServiceClient, updatePicksUsername } from '@/lib/picks-db';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.replace('Bearer ', '');
        const serviceClient = getServiceClient();
        const { data: { user }, error } = await serviceClient.auth.getUser(token);

        const { auth_id, email, username } = await request.json();

        if (error || !user || user.id !== auth_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!auth_id || !email) {
            return NextResponse.json(
                { error: 'auth_id and email are required' },
                { status: 400 }
            );
        }

        const { isAdminEmail } = await import('@/lib/admin-config');
        if (isAdminEmail(email)) {
            return NextResponse.json(
                { error: 'Admin accounts cannot be used as community profiles' },
                { status: 403 }
            );
        }

        // Check if profile already exists
        let picksUser = await getPicksUserByAuthId(auth_id);
        if (!picksUser) {
            picksUser = await createPicksUser(auth_id, email, username);
        } else if (username && picksUser.username !== username) {
            picksUser = await updatePicksUsername(auth_id, username);
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
