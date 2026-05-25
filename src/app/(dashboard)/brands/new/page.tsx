'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandSetupWizard, BrandProfile } from '@/components/brand/BrandSetupWizard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBrandPage() {
  const router  = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleComplete = async (data: { name: string; slug: string; description: string; profile: BrandProfile }) => {
    setSaving(true);
    setError('');
    try {
      // Generate AI-optimized brand prompt
      let ai_prompt: string | null = null;
      try {
        const promptRes = await fetch('/api/brands/generate-prompt', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ profile: data.profile, name: data.name }),
        });
        if (promptRes.ok) {
          const json = await promptRes.json();
          ai_prompt = json.ai_prompt ?? null;
        }
      } catch {
        // prompt generation failure is non-fatal
      }

      // Create brand via API route (not server action — avoids RSC re-render errors)
      const res = await fetch('/api/brands/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          description: data.description,
          profile: { ...data.profile, ai_prompt },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Failed to create brand');
        setSaving(false);
        return;
      }

      router.push('/brands');
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? 'Failed to create brand');
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg animate-[fadeUp_0.3s_ease_both]">
      <div className="flex items-center gap-3">
        <Link href="/brands" className="p-2 rounded-lg" style={{ color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="font-display text-2xl tracking-widest" style={{ color: 'var(--text)' }}>
            NEW<span style={{ color: 'var(--red)' }}>BRAND</span>
          </h1>
          <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>Answer a few questions to tune the AI to your brand</p>
        </div>
      </div>
      {error && <p className="text-[12px] px-3 py-2 rounded-lg" style={{ color: 'var(--red)', background: 'var(--red-dim)' }}>{error}</p>}
      <BrandSetupWizard onComplete={handleComplete} saving={saving} />
    </div>
  );
}
