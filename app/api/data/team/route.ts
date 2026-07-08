import { NextResponse } from 'next/server';
import { getServerTeam } from '@/lib/api/server';

export async function GET() {
    try {
        const data = await getServerTeam();
        
        if (data.error) {
            return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
        }

        // Return fresh data (no caching) so server-side changes are reflected immediately
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Error in /api/data/team:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
