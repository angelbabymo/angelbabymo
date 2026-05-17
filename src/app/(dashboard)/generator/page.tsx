'use client';
import { useState } from 'react';
import { useGenerate } from '@/hooks/useGenerate';
import { GeneratedContent } from '@/types';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { HookList } from '@/components/generator/HookList';
import { CaptionList } from '@/components/generator/CaptionList';
import { AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  clipName:    z.string().optional(),
  category:    z.string().min(1, 'Required'),
  description: z.string().min(10, 'Describe the clip (at least 10 characters)'),
});
type FormData = z.infer<typeof schema>;

export default function GeneratorPage() {
  const { generate, data, loading, error, reset } = useGenerate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'Lifestyle' },
  });

  const onSubmit = async (fd: FormData) => {
    await generate(fd.description, fd.category, fd.clipName);
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease_both]">

      {/* Input panel */}
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
          placeholder="Tell me what happens in the clip — the vibe, any affiliate product, who it's for, what emotion you want to trigger..."
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

        <div className="flex gap-3">
          {data && (
            <Button type="button" variant="outline" onClick={reset}>
              Clear
            </Button>
          )}
          <Button type="submit" loading={loading} size="lg" className="ml-auto">
            <Zap size={15} />
            {loading ? 'Generating...' : 'Generate Content'}
          </Button>
        </div>
      </form>

      {/* Results */}
      <AnimatePresence>
        {data && (
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <HookList hooks={data.hooks} />
            <CaptionList data={data} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!data && !loading && (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ border: '1px dashed var(--border)' }}
        >
          <Zap size={28} style={{ color: 'var(--text-3)' }} className="mb-3" />
          <p className="font-display tracking-widest text-sm" style={{ color: 'var(--text-3)' }}>
            WAITING FOR INPUT
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>
            Fill out the form above and hit Generate
          </p>
        </div>
      )}
    </div>
  );
}
