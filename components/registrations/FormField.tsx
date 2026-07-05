"use client";

// =============================================================================
// FormField — Renders a single form input based on its field definition.
// Handles text, email, tel, url, textarea, select, radio, and checkbox types.
// =============================================================================

import type { FormFieldDef } from '@/lib/registrations/types';

interface FormFieldProps {
  field: FormFieldDef;
  value: unknown;
  error: string | null;
  onChange: (key: string, value: unknown) => void;
  disabled: boolean;
}

export default function FormField({
  field,
  value,
  error,
  onChange,
  disabled,
}: FormFieldProps) {
  const inputId = `field-${field.key}`;
  const errorId = `${inputId}-error`;
  const strValue = typeof value === 'string' ? value : '';
  const boolValue = typeof value === 'boolean' ? value : false;

  const baseInputStyles: React.CSSProperties = {
    background: 'rgba(0,230,118,0.03)',
    border: error
      ? '1px solid rgba(239,68,68,0.5)'
      : '1px solid rgba(0,230,118,0.08)',
    transition: 'border-color 0.2s, background 0.2s',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(0,230,118,0.25)';
    e.target.style.background = 'rgba(0,230,118,0.05)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(0,230,118,0.08)';
    e.target.style.background = 'rgba(0,230,118,0.03)';
  };

  const inputClassName =
    'w-full px-4 py-3 rounded-xl text-base text-gray-100 placeholder-gray-600 font-mono focus:outline-none';

  // --- Checkbox ---
  if (field.type === 'checkbox') {
    return (
      <div className="space-y-1">
        <label className="flex items-center gap-3 cursor-pointer group" htmlFor={inputId}>
          <input
            id={inputId}
            type="checkbox"
            checked={boolValue}
            onChange={(e) => onChange(field.key, e.target.checked)}
            disabled={disabled}
            className="w-5 h-5 rounded border-gray-600 bg-transparent text-[#00e676] focus:ring-[#00e676]/30 focus:ring-offset-0 cursor-pointer"
            aria-describedby={error ? errorId : undefined}
          />
          <span className="text-sm text-gray-200 font-body">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </span>
        </label>
        {error && (
          <p id={errorId} className="text-xs text-red-400 font-mono pl-8">
            {error}
          </p>
        )}
      </div>
    );
  }

  // --- Radio ---
  if (field.type === 'radio' && field.options) {
    return (
      <fieldset className="space-y-2">
        <legend className="block text-xs font-semibold text-gray-300 font-mono uppercase tracking-widest mb-2">
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </legend>
        <div className="space-y-2">
          {field.options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-xl transition-all"
              style={{
                background:
                  strValue === option
                    ? 'rgba(0,230,118,0.06)'
                    : 'rgba(0,230,118,0.02)',
                border:
                  strValue === option
                    ? '1px solid rgba(0,230,118,0.2)'
                    : '1px solid rgba(0,230,118,0.06)',
              }}
            >
              <input
                type="radio"
                name={field.key}
                value={option}
                checked={strValue === option}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={disabled}
                className="w-4 h-4 border-gray-600 bg-transparent text-[#00e676] focus:ring-[#00e676]/30 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-200 font-body">{option}</span>
            </label>
          ))}
        </div>
        {error && (
          <p id={errorId} className="text-xs text-red-400 font-mono mt-1">
            {error}
          </p>
        )}
      </fieldset>
    );
  }

  // --- Select ---
  if (field.type === 'select' && field.options) {
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-gray-300 font-mono uppercase tracking-widest"
        >
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <select
          id={inputId}
          value={strValue}
          onChange={(e) => onChange(field.key, e.target.value)}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`${inputClassName} cursor-pointer appearance-none`}
          style={baseInputStyles}
          aria-describedby={error ? errorId : undefined}
        >
          <option value="" className="bg-[#0a0a0a] text-gray-500">
            {field.placeholder || `Select ${field.label}`}
          </option>
          {field.options.map((option) => (
            <option key={option} value={option} className="bg-[#0a0a0a] text-gray-100">
              {option}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="text-xs text-red-400 font-mono">
            {error}
          </p>
        )}
      </div>
    );
  }

  // --- Textarea ---
  if (field.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-gray-300 font-mono uppercase tracking-widest"
        >
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <textarea
          id={inputId}
          name={field.key}
          value={strValue}
          onChange={(e) => onChange(field.key, e.target.value)}
          disabled={disabled}
          placeholder={field.placeholder || ''}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={4}
          maxLength={field.max_length || undefined}
          className={`${inputClassName} resize-y min-h-[100px]`}
          style={baseInputStyles}
          aria-describedby={error ? errorId : undefined}
        />
        {field.max_length && (
          <p className="text-xs text-gray-600 font-mono text-right">
            {strValue.length}/{field.max_length}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-red-400 font-mono">
            {error}
          </p>
        )}
      </div>
    );
  }

  // --- Text, Email, Tel, URL ---
  const inputType =
    field.type === 'email' ? 'email' :
    field.type === 'tel' ? 'tel' :
    field.type === 'url' ? 'url' :
    'text';

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold text-gray-300 font-mono uppercase tracking-widest"
      >
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        type={inputType}
        name={field.key}
        value={strValue}
        onChange={(e) => onChange(field.key, e.target.value)}
        disabled={disabled}
        placeholder={field.placeholder || ''}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={field.max_length || undefined}
        autoComplete={
          field.type === 'email' ? 'email' :
          field.type === 'tel' ? 'tel' :
          field.type === 'url' ? 'url' :
          'off'
        }
        className={inputClassName}
        style={baseInputStyles}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-400 font-mono">
          {error}
        </p>
      )}
    </div>
  );
}
