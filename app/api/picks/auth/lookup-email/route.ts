import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/picks-db';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const serviceClient = getServiceClient();
    const { data: { user }, error: authError } = await serviceClient.auth.getUser(token);

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const { data: targetUser } = await serviceClient
        .from('picks_users')
        .select('email')
        .ilike('username', username)
        .single();

    if (!targetUser || !targetUser.email) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mask the email to prevent full email harvesting (Finding #3)
    const email = targetUser.email;
    const [local, domain] = email.split('@');
    const masked = local[0] + '***@' + domain;
    return NextResponse.json({ email: masked });
}
