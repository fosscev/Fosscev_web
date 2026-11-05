import { NextResponse } from 'next/server';

// This endpoint used to reveal whether an email had an account. No in-repo
// client depends on it, so keep the route but disable account enumeration.
export async function POST() {
    return NextResponse.json(
        { error: 'Email lookup is disabled. Continue with sign-in or account recovery.' },
        { status: 410, headers: { 'Cache-Control': 'no-store' } }
    );
}
