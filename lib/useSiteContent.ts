"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface SiteContent {
  section: string;
  content: any;
}

export function useSiteContent() {
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      const { data, error } = await supabase.from('site_content').select('*');
      if (data && !error) {
        const contentMap: Record<string, any> = {};
        data.forEach(item => {
          contentMap[item.section] = item.content;
        });
        setContent(contentMap);
      }
      setLoading(false);
    }
    fetchContent();
  }, []);

  return { content, loading };
}
