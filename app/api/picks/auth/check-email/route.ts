import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/picks-db';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Checks if an email address exists in the system.
 * This is used for client-side validation on the sign-in page.
 */
export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const rateCheck = await checkRateLimit(ip, 'signin');
        if (!rateCheck.allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required and must be a string' }, { status: 400 });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const serviceClient = getServiceClient();

        // Query the public user profiles table to see if a user with this email exists.
        // We assume that a 'picks_users' entry is created for every authenticated user.
        // We use `select('id')` for a minimal query.
        const { data, error } = await serviceClient
            .from('picks_users')
            .select('id', { count: 'exact', head: true })
            .eq('email', email);
        
        // Handle potential query errors, but ignore 'PGRST116' which means 0 rows found.
        if (error && error.code !== 'PGRST116') {
            console.error('Error checking email in picks_users:', error);
            // Avoid leaking internal error details to the client
            return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
        }

        // `count` will be 1 if the user exists, 0 otherwise.
        const exists = (data?.length ?? 0) > 0 || (error === null && data === null); // Updated logic for head:true

        // After switching to head: true, the check needs to be on the count
        const { count } = await serviceClient
            .from('picks_users')
            .select('*', { count: 'exact', head: true })
            .eq('email', email);


        return NextResponse.json({ exists: (count ?? 0) > 0 });

    } catch (e: unknown) {
        if (e instanceof Error && e.message.includes('Rate limit')) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }
        console.error('Unexpected error in check-email route:', e);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
