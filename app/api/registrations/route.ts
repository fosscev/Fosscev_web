// =============================================================================
// Admin API route: /api/registrations
// GET  — List registrations (paginated, filterable, searchable)
// PATCH — Update registration status
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin-config';
import { getServiceRoleClient, getServerSupabaseClient } from '@/lib/registrations/server';
import { REGISTRATION_STATUSES } from '@/lib/registrations/types';
import type { RegistrationStatus } from '@/lib/registrations/types';

/**
 * Verify the current user is an admin. Returns the user email or null.
 */
async function verifyAdmin(): Promise<string | null> {
  try {
    const supabase = await getServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && isAdminEmail(user.email)) {
      return user.email!;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const formType = searchParams.get('form_type');
  const status = searchParams.get('status') as RegistrationStatus | null;
  const search = searchParams.get('search');
  const sortOrder = searchParams.get('sort_order') === 'asc' ? true : false;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') || '25', 10)));

  const supabase = getServiceRoleClient();

  // Build query
  let query = supabase
    .from('registrations')
    .select('*', { count: 'exact' });

  if (formType) {
    query = query.eq('form_type', formType);
  }

  if (status && REGISTRATION_STATUSES.includes(status)) {
    query = query.eq('status', status);
  }

  // Search within jsonb data — uses Postgres text search on the cast data
  if (search && search.trim()) {
    query = query.or(`data::text.ilike.%${search.trim()}%`);
  }

  // Sort
  query = query.order('created_at', { ascending: sortOrder });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: registrations, error, count } = await query;

  if (error) {
    console.error('[Admin API] Error fetching registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }

  return NextResponse.json({
    registrations: registrations || [],
    total: count || 0,
    page,
    page_size: pageSize,
    total_pages: Math.ceil((count || 0) / pageSize),
  });
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid registration ID' }, { status: 400 });
    }

    if (!status || !REGISTRATION_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${REGISTRATION_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin API] Error updating registration:', error);
      return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
    }

    return NextResponse.json({ registration: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
