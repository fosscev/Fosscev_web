import { NextResponse } from 'next/server';
import { getCommunityStats } from '@/lib/picks-db';

// GET /api/picks/stats — Community stats
export async function GET() {
    const stats = await getCommunityStats();
    return NextResponse.json(stats);
}
