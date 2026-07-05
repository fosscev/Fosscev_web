// =============================================================================
// Admin API route: /api/form-schemas
// GET   — List all form schemas (including inactive)
// POST  — Create a new form schema
// PATCH — Update an existing form schema
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin-config';
import { getServiceRoleClient, getServerSupabaseClient } from '@/lib/registrations/server';
import type { FormSchema } from '@/lib/registrations/types';

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

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from('form_schemas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Form Schemas API] Error fetching:', error);
    return NextResponse.json({ error: 'Failed to fetch form schemas' }, { status: 500 });
  }

  return NextResponse.json({ schemas: data || [] });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { form_type, title, description, fields, is_active, allow_duplicates, identity_field, max_submissions_per_hour } = body;

    // Basic validation
    if (!form_type || typeof form_type !== 'string' || !form_type.trim()) {
      return NextResponse.json({ error: 'form_type is required' }, { status: 400 });
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ error: 'fields must be a non-empty array' }, { status: 400 });
    }

    // Validate form_type format (snake_case, lowercase)
    if (!/^[a-z][a-z0-9_]*$/.test(form_type.trim())) {
      return NextResponse.json(
        { error: 'form_type must be lowercase snake_case (e.g. "media_team_application")' },
        { status: 400 }
      );
    }

    // Validate identity_field references a valid field key if set
    if (identity_field) {
      const fieldKeys = fields.map((f: { key: string }) => f.key);
      if (!fieldKeys.includes(identity_field)) {
        return NextResponse.json(
          { error: `identity_field "${identity_field}" must match a key in fields` },
          { status: 400 }
        );
      }
    }

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('form_schemas')
      .insert({
        form_type: form_type.trim(),
        title: title.trim(),
        description: description?.trim() || null,
        fields,
        is_active: is_active !== false,
        allow_duplicates: allow_duplicates === true,
        identity_field: identity_field || null,
        max_submissions_per_hour: max_submissions_per_hour || 3,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `A form with type "${form_type}" already exists` },
          { status: 409 }
        );
      }
      console.error('[Form Schemas API] Error creating:', error);
      return NextResponse.json({ error: 'Failed to create form schema' }, { status: 500 });
    }

    return NextResponse.json({ schema: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid schema ID' }, { status: 400 });
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      'title', 'description', 'fields', 'is_active',
      'allow_duplicates', 'identity_field', 'max_submissions_per_hour',
    ];
    const sanitizedUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in updates) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Validate identity_field if it's being updated
    if ('identity_field' in sanitizedUpdates && sanitizedUpdates.identity_field) {
      const fields = sanitizedUpdates.fields || (await getSchemaFields(id));
      if (Array.isArray(fields)) {
        const fieldKeys = fields.map((f: { key: string }) => f.key);
        if (!fieldKeys.includes(sanitizedUpdates.identity_field as string)) {
          return NextResponse.json(
            { error: `identity_field must match a key in fields` },
            { status: 400 }
          );
        }
      }
    }

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from('form_schemas')
      .update(sanitizedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Form Schemas API] Error updating:', error);
      return NextResponse.json({ error: 'Failed to update form schema' }, { status: 500 });
    }

    return NextResponse.json({ schema: data });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

/** Helper to fetch existing fields for a schema when validating identity_field during PATCH */
async function getSchemaFields(id: string) {
  const supabase = getServiceRoleClient();
  const { data } = await supabase
    .from('form_schemas')
    .select('fields')
    .eq('id', id)
    .single<Pick<FormSchema, 'fields'>>();
  return data?.fields || [];
}
