'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGenerate } from '@/hooks/useGenerate';
import { Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

const schema = z.object({
  clipName:    z.string().optional(),
  category:    z.string().min(1, 'Required'),
  description: z.string().min(10, 'Describe the clip in at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

interface GeneratorPanelProps {
  onResult: (data: ReturnType<typeof useGenerate>['data']) => void;
}

export function GeneratorPanel({ onResult }: GeneratorPanelProps) {
  const { generate, loading, error } = useGenerate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'Lifestyle' },
  });

  const onSubmit = async (data: FormData) => {
    await generate(data.description, data.category, data.clipName);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-display tracking-widest text-lg" style={{ color: 'var(--text)' }}>
          GENERATE COPY
        </h2>
        <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
          Describe your clip — Claude generates 10 hooks, 5 captions, 3 CTAs, and emotional angles.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Clip Name (optional)" placeholder="e.g. Spring GRWM" {...register('clipName')} />
        <Select
          label="Category"
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          {...register('category')}
        />
      </div>

      <Textarea
        label="Describe the clip *"
        placeholder="Tell me what happens in the clip, the vibe, any affiliate product, who it's for, what emotion you want to trigger..."
        rows={5}
        error={errors.description?.message}
        {...register('description')}
      />

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-[12px]"
          style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,60,110,0.2)', color: 'var(--red)' }}
        >
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} size="lg" className="w-full justify-center">
        <Zap size={15} />
        {loading ? 'Generating...' : 'Generate Content'}
      </Button>
    </form>
  );
}
