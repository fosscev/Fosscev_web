import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/picks-db';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const serviceClient = getServiceClient();

    const { data: { user }, error: authError } = await serviceClient.auth.getUser(token);
    if (authError || !user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get picks user id
    const { data: picksUser } = await serviceClient
        .from('picks_users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (!picksUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data, error } = await serviceClient
        .from('picks_notifications')
        .select('*')
        .eq('user_id', picksUser.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    return NextResponse.json({ notifications: data || [] });
}

export async function PATCH(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const serviceClient = getServiceClient();

    const { data: { user }, error: authError } = await serviceClient.auth.getUser(token);
    if (authError || !user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { notification_id } = body;

    const { data: picksUser } = await serviceClient
        .from('picks_users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (!picksUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let query = serviceClient
        .from('picks_notifications')
        .update({ is_read: true })
        .eq('user_id', picksUser.id);

    if (notification_id) {
        query = query.eq('id', notification_id);
    }

    const { error } = await query;

    if (error) {
        return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Success' });
}
