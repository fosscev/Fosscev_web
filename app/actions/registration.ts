"use server";

// =============================================================================
// Server action: submitRegistration
//
// Handles public form submissions. Validates, sanitizes, rate-limits, checks
// for duplicates, and inserts — all via the atomic check_and_record_submission
// Postgres function.
//
// NOTE: IP-hash rate limiting will under-count distinct users behind the same
// NAT gateway (e.g. campus wifi). This is intentional — rate limiting here is
// a bot/abuse deterrent, not a precise per-person limit.
// =============================================================================

import { headers } from 'next/headers';
import { getServiceRoleClient, hashIp, getClientIp } from '@/lib/registrations/server';
import {
  validateFormData,
  stripUnknownFields,
  sanitizeFormData,
} from '@/lib/registrations/validation';
import type { SubmitRegistrationResult, FormSchema } from '@/lib/registrations/types';

export async function submitRegistration(
  formType: string,
  data: Record<string, unknown>,
  honeypot: string
): Promise<SubmitRegistrationResult> {
  try {
    const supabase = getServiceRoleClient();

    // 1. Fetch the form schema
    const { data: schema, error: schemaError } = await supabase
      .from('form_schemas')
      .select('*')
      .eq('form_type', formType)
      .single<FormSchema>();

    if (schemaError || !schema) {
      return {
        success: false,
        error_code: 'form_closed',
        message: 'This form does not exist.',
      };
    }

    if (!schema.is_active) {
      return {
        success: false,
        error_code: 'form_closed',
        message: 'This form is no longer accepting submissions.',
      };
    }

    // 2. Honeypot check — if filled, a bot submitted the form.
    //    Return a fake success to avoid tipping off the bot.
    if (honeypot && honeypot.trim() !== '') {
      console.warn(
        `[Registration] Honeypot triggered for form_type="${formType}". Silently discarding.`
      );
      return { success: true, id: 'fake-success-id' };
    }

    // 3. Hash the client IP
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const ipHash = await hashIp(clientIp);

    // 4. Server-side validation against the schema
    const fieldErrors = validateFormData(data, schema);
    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        error_code: 'validation_error',
        field_errors: fieldErrors,
      };
    }

    // 5. Strip unknown fields (prevents storing unexpected/injected keys)
    const strippedData = stripUnknownFields(data, schema);

    // 6. Sanitize all string values (strip HTML to prevent stored XSS)
    const sanitizedData = sanitizeFormData(strippedData);

    // 7. Resolve duplicate-check parameters
    //
    // Identity value extraction — coerce to string safely.
    // jsonb values aren't guaranteed to be strings even when the field schema
    // declares type "email" or "text", because the raw data object comes from
    // user input. A checkbox or misconfigured field could produce a boolean,
    // number, or object. Explicit String() coercion ensures the Postgres
    // function's text parameter receives a comparable value.
    let identityField: string | null = null;
    let identityValue: string | null = null;

    if (!schema.allow_duplicates && schema.identity_field) {
      identityField = schema.identity_field;
      const rawIdentityValue = sanitizedData[schema.identity_field];

      // If the identity field value is undefined or null, skip duplicate checking
      // for this submission rather than passing null through silently — this
      // avoids a silent no-op in the Postgres function's = comparison.
      if (rawIdentityValue != null) {
        identityValue = String(rawIdentityValue);
      }
    }

    // 8. Call the atomic Postgres function
    //    This performs rate-limit check, duplicate check, and insert in a
    //    single transaction with an advisory lock. No separate count query
    //    + insert in application code — eliminates the race condition.
    const { data: result, error: rpcError } = await supabase.rpc(
      'check_and_record_submission',
      {
        p_form_type: formType,
        p_data: sanitizedData,
        p_honeypot: honeypot || null,
        p_submitter_ip_hash: ipHash,
        p_max_per_hour: schema.max_submissions_per_hour,
        p_allow_duplicates: schema.allow_duplicates,
        p_identity_field: identityField,
        p_identity_value: identityValue,
      }
    );

    if (rpcError) {
      console.error('[Registration] RPC error:', rpcError);
      return {
        success: false,
        error_code: 'server_error',
        message: 'An unexpected error occurred. Please try again later.',
      };
    }

    // 9. Map the Postgres function's return to our result type
    if (!result.success) {
      if (result.error_code === 'rate_limit') {
        return {
          success: false,
          error_code: 'rate_limit',
          message: 'Too many submissions. Please try again later.',
        };
      }
      if (result.error_code === 'duplicate_submission') {
        return {
          success: false,
          error_code: 'duplicate_submission',
          message: 'You have already submitted this form.',
        };
      }
      return {
        success: false,
        error_code: 'server_error',
        message: 'An unexpected error occurred. Please try again later.',
      };
    }

    return {
      success: true,
      id: result.id,
    };
  } catch (error) {
    console.error('[Registration] Unexpected error:', error);
    return {
      success: false,
      error_code: 'server_error',
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}
