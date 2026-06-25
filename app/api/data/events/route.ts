import { NextResponse } from 'next/server';
import { getServerEvents } from '@/lib/api/server';

export async function GET() {
    try {
        const data = await getServerEvents();
        
        if (data.error) {
            return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
        }

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 's-maxage=3600, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Error in /api/data/events:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
