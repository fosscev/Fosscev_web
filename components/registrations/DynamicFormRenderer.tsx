"use client";

// =============================================================================
// DynamicFormRenderer — The core form component.
// Takes a FormSchema, renders all fields dynamically, handles validation,
// honeypot, and submission via the server action.
// =============================================================================

import { useState, useCallback } from 'react';
import type { FormSchema, SubmitRegistrationResult } from '@/lib/registrations/types';
import { validateField, validateFormData } from '@/lib/registrations/validation';
import { submitRegistration } from '@/app/actions/registration';
import FormField from './FormField';

interface DynamicFormRendererProps {
  schema: FormSchema;
}

export default function DynamicFormRenderer({ schema }: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    // Initialize with empty values based on field types
    const initial: Record<string, unknown> = {};
    for (const field of schema.fields) {
      initial[field.key] = field.type === 'checkbox' ? false : '';
    }
    return initial;
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      setFormData((prev) => ({ ...prev, [key]: value }));

      // Clear field error on change
      if (fieldErrors[key]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [fieldErrors]
  );

  const handleFieldBlur = useCallback(
    (key: string) => {
      const fieldDef = schema.fields.find((f) => f.key === key);
      if (!fieldDef) return;

      const error = validateField(formData[key], fieldDef);
      if (error) {
        setFieldErrors((prev) => ({ ...prev, [key]: error }));
      } else {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [formData, schema.fields]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSubmitted) return;

    setGlobalError(null);

    // Client-side validation
    const errors = validateFormData(formData, schema);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result: SubmitRegistrationResult = await submitRegistration(
        schema.form_type,
        formData,
        honeypot
      );

      if (result.success) {
        setIsSubmitted(true);
        setFieldErrors({});
        setGlobalError(null);
      } else {
        switch (result.error_code) {
          case 'validation_error':
            setFieldErrors(result.field_errors);
            break;
          case 'rate_limit':
            setGlobalError('Too many submissions. Please try again later.');
            break;
          case 'duplicate_submission':
            setGlobalError('You have already submitted this form.');
            break;
          case 'form_closed':
            setGlobalError('This form is no longer accepting submissions.');
            break;
          case 'server_error':
          default:
            setGlobalError('An unexpected error occurred. Please try again later.');
            break;
        }
      }
    } catch {
      setGlobalError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Success state ---
  if (isSubmitted) {
    return (
      <div
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{
          background: 'rgba(8,8,8,0.96)',
          border: '1px solid rgba(0,230,118,0.2)',
          boxShadow: '0 0 60px rgba(0,230,118,0.08), 0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.6), transparent)',
          }}
        />
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: 'rgba(0,230,118,0.1)',
            border: '1px solid rgba(0,230,118,0.25)',
          }}
        >
          <svg className="w-8 h-8 text-[#00e676]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white font-mono mb-2">Submission Received!</h3>
        <p className="text-gray-400 font-body text-sm">
          Thank you for submitting. We&apos;ll review your submission and get back to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Honeypot field — off-screen, invisible to real users */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <label htmlFor="website_url_hp">Website</label>
        <input
          type="text"
          id="website_url_hp"
          name="website_url"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Form fields */}
      {schema.fields.map((field) => (
        <div key={field.key} onBlur={() => handleFieldBlur(field.key)}>
          <FormField
            field={field}
            value={formData[field.key]}
            error={fieldErrors[field.key] || null}
            onChange={handleFieldChange}
            disabled={isSubmitting}
          />
        </div>
      ))}

      {/* Global error */}
      {globalError && (
        <div
          className="px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <p className="text-sm text-red-400 font-mono">{globalError}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || isSubmitted}
        className="w-full py-3.5 rounded-xl text-sm font-semibold font-mono transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, rgba(0,230,118,0.15) 0%, rgba(0,168,84,0.1) 100%)',
          color: '#00e676',
          border: '1px solid rgba(0,230,118,0.25)',
          boxShadow: '0 0 20px rgba(0,230,118,0.08)',
        }}
      >
        {isSubmitting ? (
          <>
            <div
              className="w-4 h-4 rounded-full"
              style={{
                border: '2px solid rgba(0,230,118,0.2)',
                borderTopColor: '#00e676',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            Submitting...
          </>
        ) : (
          'Submit →'
        )}
      </button>
    </form>
  );
}
