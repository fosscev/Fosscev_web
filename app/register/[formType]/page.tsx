"use client";

// =============================================================================
// Public form page: /register/[formType]
// Fetches the form schema via SWR with caching, then renders the dynamic form.
// =============================================================================

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import type { FormSchema } from '@/lib/registrations/types';
import DynamicFormRenderer from '@/components/registrations/DynamicFormRenderer';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

/**
 * SWR fetcher: queries Supabase for the form schema matching the given form_type.
 * RLS allows anon SELECT on active schemas only.
 */
async function fetchSchema(_key: string, formType: string): Promise<FormSchema | null> {
  const { data, error } = await supabase
    .from('form_schemas')
    .select('*')
    .eq('form_type', formType)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as FormSchema;
}

export default function RegisterPage() {
  const params = useParams();
  const formType = typeof params.formType === 'string' ? params.formType : '';

  const { data: schema, isLoading, error } = useSWR(
    formType ? ['form_schema', formType] : null,
    ([, ft]) => fetchSchema('form_schema', ft),
    {
      revalidateOnFocus: false,      // Schemas don't change while filling the form
      dedupingInterval: 300000,       // 5 minutes — schemas change rarely
      revalidateIfStale: true,        // Picks up schema changes eventually
      shouldRetryOnError: false,
    }
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Loading state */}
          {isLoading && (
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'rgba(8,8,8,0.96)',
                border: '1px solid rgba(0,230,118,0.1)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-800 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-800 rounded-lg w-full" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-gray-800 rounded w-1/4" />
                      <div className="h-12 bg-gray-800 rounded-xl" />
                    </div>
                  ))}
                </div>
                <div className="h-12 bg-gray-800 rounded-xl" />
              </div>
            </div>
          )}

          {/* Error / Not found state */}
          {!isLoading && (error || !schema) && (
            <div
              className="rounded-2xl p-8 text-center relative overflow-hidden"
              style={{
                background: 'rgba(8,8,8,0.96)',
                border: '1px solid rgba(239,68,68,0.15)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)',
                }}
              />
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white font-mono mb-2">
                Form Not Available
              </h2>
              <p className="text-gray-400 font-body text-sm">
                This form doesn&apos;t exist or is no longer accepting submissions.
              </p>
            </div>
          )}

          {/* Form loaded — render it */}
          {!isLoading && schema && (
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'rgba(8,8,8,0.96)',
                border: '1px solid rgba(0,230,118,0.1)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 60px rgba(0,230,118,0.05), 0 25px 60px rgba(0,0,0,0.6)',
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.4), transparent)',
                }}
              />

              {/* Background glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.06) 0%, transparent 70%)',
                }}
              />

              {/* Header */}
              <div className="relative z-10 mb-8">
                <h1 className="text-2xl font-bold text-white font-mono mb-2">
                  {schema.title}
                </h1>
                {schema.description && (
                  <p className="text-sm text-gray-400 font-body leading-relaxed">
                    {schema.description}
                  </p>
                )}
              </div>

              {/* Form */}
              <div className="relative z-10">
                <DynamicFormRenderer schema={schema} />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
