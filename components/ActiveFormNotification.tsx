"use client";

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import useSWR from 'swr';

async function fetchActiveForm() {
  const { data, error } = await supabase
    .from('form_schemas')
    .select('form_type, title')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export function ActiveFormNotification() {
  const { data: activeForm } = useSWR('active_form', fetchActiveForm, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
  });

  if (!activeForm) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href={`/register/${activeForm.form_type}`}
        className="flex items-center gap-4 px-5 py-3 rounded-full shadow-[0_0_30px_rgba(0,230,118,0.2)] transition-all hover:scale-105 group backdrop-blur-md"
        style={{
          background: 'linear-gradient(135deg, rgba(0,230,118,0.1) 0%, rgba(0,168,84,0.05) 100%)',
          border: '1px solid rgba(0,230,118,0.3)',
        }}
      >
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e676]"></span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-[#00e676] font-mono font-bold uppercase tracking-wider">
            {activeForm.title}
          </span>
          <span className="text-xs text-gray-300 font-body">
            Registrations are open! Click here.
          </span>
        </div>
        <div className="bg-[#00e676]/10 p-1.5 rounded-full group-hover:bg-[#00e676]/20 transition-colors">
          <svg
            className="w-4 h-4 text-[#00e676] group-hover:translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
