// =============================================================================
// Shared TypeScript types for the multi-form registration system.
// Used by both client components and server actions/API routes.
// =============================================================================

/** Supported field input types for dynamic form rendering. */
export type FormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox';

/** Definition of a single field within a form schema's `fields` jsonb array. */
export interface FormFieldDef {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  min_length?: number | null;
  max_length?: number | null;
  /** Options for select/radio field types. */
  options?: string[] | null;
  /** Optional regex string for custom validation. */
  validation_regex?: string | null;
  placeholder?: string | null;
}

/** Shape of a row from the `form_schemas` table. */
export interface FormSchema {
  id: string;
  form_type: string;
  title: string;
  description: string | null;
  fields: FormFieldDef[];
  is_active: boolean;
  allow_duplicates: boolean;
  /**
   * The key from `fields` used for duplicate detection (e.g. "email", "student_id").
   * If null, duplicate checking is skipped regardless of `allow_duplicates`.
   */
  identity_field: string | null;
  /** Per-form rate limit override. Default 3 submissions per IP per hour. */
  max_submissions_per_hour: number;
  created_at: string;
}

/** Shape of a row from the `registrations` table. */
export interface Registration {
  id: string;
  form_type: string;
  created_at: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  data: Record<string, unknown>;
  honeypot: string | null;
  submitter_ip_hash: string | null;
}

/** Valid registration status values. */
export const REGISTRATION_STATUSES = ['pending', 'reviewed', 'accepted', 'rejected'] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

/** Error codes returned by the submission server action. */
export type SubmissionErrorCode =
  | 'validation_error'
  | 'rate_limit'
  | 'duplicate_submission'
  | 'form_closed'
  | 'server_error';

/** Discriminated union for submit registration results. */
export type SubmitRegistrationResult =
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      error_code: 'validation_error';
      /** Field-key → error message map */
      field_errors: Record<string, string>;
    }
  | {
      success: false;
      error_code: 'rate_limit';
      message: string;
    }
  | {
      success: false;
      error_code: 'duplicate_submission';
      message: string;
    }
  | {
      success: false;
      error_code: 'form_closed';
      message: string;
    }
  | {
      success: false;
      error_code: 'server_error';
      message: string;
    };
