'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updateBrand, deleteBrand } from '@/app/actions/brands';
import { BrandSetupWizard, BrandProfile, defaultProfile } from '@/components/brand/BrandSetupWizard';
import { ArrowLeft, Sparkles, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function BrandPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [brand, setBrand] = useState<any>(null);
  const [mode, setMode]     = useState<'overview' | 'edit-profile'>('overview');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('brands').select('*').eq('slug', slug).single();
      if (data) setBrand(data);
    })();
  }, [slug]);

  const handleProfileComplete = async (data: { name: string; slug: string; description: string; profile: BrandProfile }) => {
    if (!brand) return;
    setSaving(true);
    try {
      const promptRes = await fetch('/api/brands/generate-prompt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile: data.profile, name: data.name }),
      });
      const { ai_prompt } = promptRes.ok ? await promptRes.json() : { ai_prompt: brand.profile?.ai_prompt ?? null };

      await updateBrand(brand.id, {
        name: data.name,
        description: data.description,
        profile: { ...data.profile, ai_prompt },
      } as any);

      setBrand((prev: any) => ({ ...prev, name: data.name, description: data.description, profile: { ...data.profile, ai_prompt } }));
      setMode('overview');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!brand) return <div className="py-16 text-center" style={{ color: 'var(--text-3)' }}>Loading…</div>;

  if (mode === 'edit-profile') {
    const existingProfile: BrandProfile = brand.profile && Object.keys(brand.profile).length > 1
      ? brand.profile
      : defaultProfile();

    return (
      <div className="flex flex-col gap-5 max-w-lg animate-[fadeUp_0.3s_ease_both]">
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('overview')} className="p-2 rounded-lg"
            style={{ color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="font-display text-2xl tracking-widest" style={{ color: 'var(--text)' }}>
              EDIT<span style={{ color: 'var(--red)' }}>BRAND</span>
            </h1>
            <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>Update your brand profile — AI will regenerate the optimized prompt</p>
          </div>
        </div>
        <BrandSetupWizard
          onComplete={handleProfileComplete}
          saving={saving}
          initialName={brand.name}
          initialSlug={brand.slug}
          initialProfile={existingProfile}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg animate-[fadeUp_0.3s_ease_both]">
      <div className="flex items-center gap-3">
        <Link href="/brands" className="p-2 rounded-lg"
          style={{ color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={15} />
        </Link>
        <h1 className="font-semibold text-[18px]" style={{ color: 'var(--text)' }}>{brand.name}</h1>
        {saved && <span className="text-[12px] ml-auto" style={{ color: '#22c55e' }}>Saved!</span>}
      </div>

      {brand.description && (
        <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>{brand.description}</p>
      )}

      {brand.profile?.ai_prompt && (
        <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={13} style={{ color: 'var(--red)' }} />
            <span className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>AI Brand Prompt</span>
          </div>
          <p className="text-[12px] leading-relaxed line-clamp-4" style={{ color: 'var(--text-2)' }}>
            {brand.profile.ai_prompt}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button onClick={() => setMode('edit-profile')}
          className="py-3 rounded-xl font-semibold text-[14px] text-white"
          style={{ background: 'var(--red)' }}>
          Edit Brand Profile
        </button>

        <Link href={`/brands/${slug}/niches`}
          className="py-3 rounded-xl font-semibold text-[14px] text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          Manage Niches & Keywords →
        </Link>

        <button
          disabled={deleting}
          onClick={async () => {
            if (!confirm(`Delete "${brand.name}"? This cannot be undone.`)) return;
            setDeleting(true);
            try {
              await deleteBrand(brand.id);
              router.push('/brands');
            } finally {
              setDeleting(false);
            }
          }}
          className="py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all active:opacity-70"
          style={{ background: 'var(--surface)', border: '1px solid rgba(255,60,110,0.3)', color: 'var(--red)' }}
        >
          <Trash2 size={14} />
          {deleting ? 'Deleting...' : 'Delete Brand'}
        </button>
      </div>
    </div>
  );
}
