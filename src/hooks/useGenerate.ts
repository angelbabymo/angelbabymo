'use client';
import { useState } from 'react';
import { useBrand } from '@/hooks/useBrand';
import { GeneratedContent } from '@/types';

export function useGenerate() {
  const { data: brand } = useBrand();
  const [data, setData]       = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const generate = async (description: string, category: string, clipName?: string) => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, category, clipName, brandId: brand?.id ?? null }),
      });
      if (!res.ok) throw new Error('Failed');
      const result: GeneratedContent = await res.json();
      setData(result);
    } catch {
      setError('Generation failed. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setData(null); setError(null); };

  return { data, loading, error, generate, reset };
}
