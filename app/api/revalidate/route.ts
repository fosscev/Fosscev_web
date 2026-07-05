import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const secret = request.headers.get('x-revalidation-secret');
        if (secret !== process.env.REVALIDATION_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { path } = body;

        if (path) {
            revalidatePath(path);
            return NextResponse.json({ revalidated: true, now: Date.now() });
        }
        
        return NextResponse.json({ revalidated: false, message: 'Missing path to revalidate' }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ revalidated: false, message: 'Error revalidating' }, { status: 500 });
    }
}
