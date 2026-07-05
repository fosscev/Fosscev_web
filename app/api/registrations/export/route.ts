// =============================================================================
// Admin API route: /api/registrations/export
// GET — Streamed export of registrations as CSV or Markdown document.
//
// Uses ReadableStream to incrementally stream batches of 500 rows,
// avoiding memory accumulation and serverless function timeouts.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin-config';
import { getServiceRoleClient, getServerSupabaseClient } from '@/lib/registrations/server';
import { escapeHtml } from '@/lib/registrations/validation';
import { REGISTRATION_STATUSES } from '@/lib/registrations/types';
import type { FormSchema, Registration, RegistrationStatus } from '@/lib/registrations/types';
import Papa from 'papaparse';

const BATCH_SIZE = 500;

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

/**
 * Fetch a batch of registrations with the given filters.
 */
async function fetchBatch(
  supabase: ReturnType<typeof getServiceRoleClient>,
  formType: string | null,
  status: RegistrationStatus | null,
  search: string | null,
  offset: number,
  limit: number
) {
  let query = supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (formType) query = query.eq('form_type', formType);
  if (status && REGISTRATION_STATUSES.includes(status)) query = query.eq('status', status);
  if (search && search.trim()) {
    query = query.or(`data::text.ilike.%${search.trim()}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data as Registration[]) || [];
}

/**
 * Get all form schemas (keyed by form_type) for label lookups.
 */
async function getSchemaMap(
  supabase: ReturnType<typeof getServiceRoleClient>
): Promise<Map<string, FormSchema>> {
  const { data } = await supabase.from('form_schemas').select('*');
  const map = new Map<string, FormSchema>();
  if (data) {
    for (const s of data as FormSchema[]) {
      map.set(s.form_type, s);
    }
  }
  return map;
}

/**
 * Build CSV row from a registration, using field labels as headers.
 */
function registrationToCsvRow(
  reg: Registration,
  schema: FormSchema | undefined
): Record<string, string> {
  const row: Record<string, string> = {
    'ID': reg.id,
    'Form Type': reg.form_type,
    'Status': reg.status,
    'Submitted At': reg.created_at,
  };

  if (schema) {
    for (const field of schema.fields) {
      const val = reg.data[field.key];
      // Handle missing keys gracefully (old submissions missing new fields)
      row[field.label] = val != null ? String(val) : 'N/A';
    }
  } else {
    // Fallback: flatten data with raw keys
    for (const [key, val] of Object.entries(reg.data)) {
      row[key] = val != null ? String(val) : 'N/A';
    }
  }

  return row;
}

/**
 * Build Markdown section for a single registration.
 */
function registrationToMarkdown(
  reg: Registration,
  schema: FormSchema | undefined
): string {
  const lines: string[] = [];
  lines.push(`## Submission: ${reg.id.slice(0, 8)}…`);
  lines.push('');
  lines.push(`- **Form Type**: ${escapeHtml(reg.form_type)}`);
  lines.push(`- **Status**: ${reg.status}`);
  lines.push(`- **Submitted At**: ${reg.created_at}`);
  lines.push('');

  if (schema) {
    for (const field of schema.fields) {
      const val = reg.data[field.key];
      const display = val != null ? escapeHtml(String(val)) : '_N/A_';
      lines.push(`- **${escapeHtml(field.label)}**: ${display}`);
    }
  } else {
    for (const [key, val] of Object.entries(reg.data)) {
      const display = val != null ? escapeHtml(String(val)) : '_N/A_';
      lines.push(`- **${escapeHtml(key)}**: ${display}`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const formType = searchParams.get('form_type');
  const status = searchParams.get('status') as RegistrationStatus | null;
  const search = searchParams.get('search');

  const supabase = getServiceRoleClient();
  const schemaMap = await getSchemaMap(supabase);

  // Determine CSV headers from the schema if a specific form_type is selected
  const targetSchema = formType ? schemaMap.get(formType) : undefined;

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = formType
    ? `registrations_${formType}_${dateStr}`
    : `registrations_all_${dateStr}`;

  if (format === 'document') {
    // --- Streamed Markdown export ---
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        controller.enqueue(
          encoder.encode(`# Registration Export\n\n**Exported**: ${new Date().toISOString()}\n\n`)
        );
        if (formType) {
          const title = targetSchema?.title || formType;
          controller.enqueue(encoder.encode(`**Form**: ${title}\n\n---\n\n`));
        }

        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          try {
            const batch = await fetchBatch(supabase, formType, status, search, offset, BATCH_SIZE);

            for (const reg of batch) {
              const schema = schemaMap.get(reg.form_type);
              const md = registrationToMarkdown(reg, schema);
              controller.enqueue(encoder.encode(md));
            }

            if (batch.length < BATCH_SIZE) {
              hasMore = false;
            } else {
              offset += BATCH_SIZE;
            }
          } catch (err) {
            console.error('[Export] Error fetching batch:', err);
            hasMore = false;
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.md"`,
      },
    });
  }

  // --- Streamed CSV export ---
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isFirstBatch = true;
      let offset = 0;
      let hasMore = true;

      // Determine all field labels for CSV header
      let csvFields: string[] = ['ID', 'Form Type', 'Status', 'Submitted At'];
      if (targetSchema) {
        csvFields = csvFields.concat(targetSchema.fields.map((f) => f.label));
      }

      while (hasMore) {
        try {
          const batch = await fetchBatch(supabase, formType, status, search, offset, BATCH_SIZE);

          const rows = batch.map((reg) => {
            const schema = schemaMap.get(reg.form_type);
            return registrationToCsvRow(reg, schema);
          });

          // If no specific form type, we might encounter varied schemas.
          // Collect all unique keys across this batch for the header.
          if (!targetSchema && isFirstBatch && rows.length > 0) {
            const allKeys = new Set(csvFields);
            for (const row of rows) {
              for (const key of Object.keys(row)) {
                allKeys.add(key);
              }
            }
            csvFields = Array.from(allKeys);
          }

          const csv = Papa.unparse(rows, {
            columns: csvFields,
            header: isFirstBatch,
          });

          if (csv) {
            controller.enqueue(encoder.encode(isFirstBatch ? csv : '\n' + csv));
          }

          isFirstBatch = false;

          if (batch.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            offset += BATCH_SIZE;
          }
        } catch (err) {
          console.error('[Export] Error fetching batch:', err);
          hasMore = false;
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  });
}
