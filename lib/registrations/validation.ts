// =============================================================================
// Shared validation and sanitization utilities for the registration system.
// Used by both client-side (preview validation) and server-side (enforcement).
// =============================================================================

import type { FormFieldDef, FormSchema } from './types';

/**
 * Validate a single field value against its field definition.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateField(
  value: unknown,
  fieldDef: FormFieldDef
): string | null {
  const strValue = typeof value === 'string' ? value : '';
  const trimmed = strValue.trim();

  // Required check
  if (fieldDef.required) {
    if (fieldDef.type === 'checkbox') {
      // Checkbox "required" means it must be checked (truthy)
      if (!value) {
        return `${fieldDef.label} is required`;
      }
    } else if (!trimmed) {
      return `${fieldDef.label} is required`;
    }
  }

  // For non-required fields with empty value, skip further validation
  if (fieldDef.type !== 'checkbox' && !trimmed) {
    return null;
  }

  // Min length
  if (fieldDef.min_length != null && trimmed.length < fieldDef.min_length) {
    return `${fieldDef.label} must be at least ${fieldDef.min_length} characters`;
  }

  // Max length
  if (fieldDef.max_length != null && trimmed.length > fieldDef.max_length) {
    return `${fieldDef.label} must be at most ${fieldDef.max_length} characters`;
  }

  // Email format (basic check)
  if (fieldDef.type === 'email' && trimmed) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address';
    }
  }

  // Tel format (basic check — allow digits, spaces, dashes, parens, plus)
  if (fieldDef.type === 'tel' && trimmed) {
    const telRegex = /^[+\d\s\-().]{7,20}$/;
    if (!telRegex.test(trimmed)) {
      return 'Please enter a valid phone number';
    }
  }

  // URL format
  if (fieldDef.type === 'url' && trimmed) {
    try {
      new URL(trimmed);
    } catch {
      return 'Please enter a valid URL (e.g. https://example.com)';
    }
  }

  // Select/radio must be one of the defined options
  if (
    (fieldDef.type === 'select' || fieldDef.type === 'radio') &&
    fieldDef.options &&
    trimmed
  ) {
    if (!fieldDef.options.includes(trimmed)) {
      return `Please select a valid option for ${fieldDef.label}`;
    }
  }

  // Custom regex validation
  if (fieldDef.validation_regex && trimmed) {
    try {
      const regex = new RegExp(fieldDef.validation_regex);
      if (!regex.test(trimmed)) {
        return `${fieldDef.label} format is invalid`;
      }
    } catch {
      // Invalid regex in schema — skip validation rather than blocking the user
      console.warn(`Invalid validation_regex for field "${fieldDef.key}": ${fieldDef.validation_regex}`);
    }
  }

  return null;
}

/**
 * Validate all fields in the submitted data against the form schema.
 * Returns a record of field-key → error message for any invalid fields.
 * An empty record means all fields are valid.
 */
export function validateFormData(
  data: Record<string, unknown>,
  schema: FormSchema
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const fieldDef of schema.fields) {
    const value = data[fieldDef.key];
    const error = validateField(value, fieldDef);
    if (error) {
      errors[fieldDef.key] = error;
    }
  }

  return errors;
}

/**
 * Strip HTML tags from a string to prevent stored XSS.
 * Also decodes common HTML entities and trims whitespace.
 */
export function sanitizeHtml(input: string): string {
  let current = input || "";
  let previous = "";
  while (current !== previous) {
    previous = current;
    current = current
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
    current = current.replace(/<[^>]*>/g, '');
  }
  return current.trim();
}

/**
 * Escape HTML entities for safe rendering in the admin panel.
 * Defense-in-depth against stored XSS even if input sanitization is bypassed.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Remove any keys from the data object that are not defined in the schema's fields.
 * Prevents storage of unexpected/injected fields.
 */
export function stripUnknownFields(
  data: Record<string, unknown>,
  schema: FormSchema
): Record<string, unknown> {
  const knownKeys = new Set(schema.fields.map((f) => f.key));
  const cleaned: Record<string, unknown> = {};

  for (const key of Object.keys(data)) {
    if (knownKeys.has(key)) {
      cleaned[key] = data[key];
    }
  }

  return cleaned;
}

/**
 * Sanitize all string values in a data object by stripping HTML.
 * Non-string values are passed through unchanged.
 */
export function sanitizeFormData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
