'use client';
import { useState } from 'react';
import { useBrand } from '@/hooks/useBrand';
import { GeneratedContent } from '@/types';
import { loadRules, formatRulesForPrompt } from '@/components/generator/GenerationRules';

export function useGenerate() {
  const { data: brand } = useBrand();
  const [data, setData]       = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const generate = async (description: string, category: string, clipName?: string) => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);

    const rules = loadRules();
    const globalRules = formatRulesForPrompt(rules);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, category, clipName, brandId: brand?.id ?? null, globalRules }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error ?? 'Failed');
      setData(payload as GeneratedContent);
    } catch (e: any) {
      setError(e?.message ?? 'Generation failed. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setData(null); setError(null); };

  return { data, loading, error, generate, reset };
}
