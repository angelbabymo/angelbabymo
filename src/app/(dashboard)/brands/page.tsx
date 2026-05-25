'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, Settings } from 'lucide-react';

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('brands')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });
      setBrands(data ?? []);
    })();
  }, []);

  return (
    <div className="flex flex-col gap-5 animate-[fadeUp_0.3s_ease_both]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-widest" style={{ color: 'var(--text)' }}>
            MY<span style={{ color: 'var(--red)' }}>BRANDS</span>
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Manage brands, niches, and keywords</p>
        </div>
        <Link href="/brands/new"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-white"
          style={{ background: 'var(--red)' }}>
          <Plus size={14} /> New Brand
        </Link>
      </div>

      {brands.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="font-medium text-[15px]" style={{ color: 'var(--text)' }}>No brands yet</p>
          <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>Create your first brand to start scanning</p>
          <Link href="/brands/new" className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: 'var(--red)' }}>
            Create Brand
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {brands.map(b => (
            <Link key={b.id} href={`/brands/${b.slug}`}
              className="flex items-center justify-between p-4 rounded-2xl transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>{b.name}</p>
                {b.description && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>{b.description}</p>}
                <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>{b.slug}</p>
              </div>
              <Settings size={16} style={{ color: 'var(--text-3)' }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
