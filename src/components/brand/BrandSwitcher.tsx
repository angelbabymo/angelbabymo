'use client';
import { useRouter } from 'next/navigation';
import { switchBrand } from '@/app/actions/brands';
import { ChevronDown } from 'lucide-react';

export function BrandSwitcher({ brands, currentSlug }: { brands: any[]; currentSlug: string }) {
  const router = useRouter();

  const handleChange = async (slug: string) => {
    if (slug === '__new__') { router.push('/brands/new'); return; }
    await switchBrand(slug);
    router.refresh();
  };

  return (
    <div className="relative flex items-center">
      <select
        value={currentSlug}
        onChange={e => handleChange(e.target.value)}
        className="appearance-none rounded-xl pr-7 pl-3 py-2 text-[12px] font-medium outline-none cursor-pointer"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        {brands.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
        <option value="__new__">+ New brand</option>
      </select>
      <ChevronDown size={12} className="absolute right-2 pointer-events-none" style={{ color: 'var(--text-3)' }} />
    </div>
  );
}
