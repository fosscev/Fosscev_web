import { NextResponse } from 'next/server';
import { getServerStats } from '@/lib/api/server';

export const revalidate = 3600; // 1 hour

export async function GET() {
    try {
        const data = await getServerStats();
        
        if (data.error) {
            return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in /api/stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
