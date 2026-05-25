'use client';
import { useCallback, useRef, useState } from 'react';
import { useGenerate } from '@/hooks/useGenerate';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { GenerationRules, loadRules } from '@/components/generator/GenerationRules';
import { Zap, Mic, MicOff, BookOpen, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { HookList } from '@/components/generator/HookList';
import { CaptionList } from '@/components/generator/CaptionList';
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
  const [rulesOpen, setRulesOpen] = useState(false);
  const [interimText, setInterimText] = useState('');

  // Holds all finalized speech so interim preview is appended correctly
  const committedRef = useRef('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'Lifestyle', description: '' },
  });

  const description = watch('description');

  const onFinal = useCallback((text: string) => {
    const base = committedRef.current;
    const next = base ? `${base} ${text}` : text;
    committedRef.current = next;
    setInterimText('');
    setValue('description', next, { shouldValidate: true });
  }, [setValue]);

  const onInterim = useCallback((text: string) => {
    setInterimText(text);
  }, []);

  const { listening, supported, toggle: toggleMic } = useVoiceInput({ onFinal, onInterim });

  // Keep committedRef in sync if user manually edits the textarea
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    committedRef.current = e.target.value;
    setValue('description', e.target.value, { shouldValidate: true });
  }, [setValue]);

  const onSubmit = async (fd: FormData) => {
    await generate(fd.description, fd.category, fd.clipName);
  };

  const rules = loadRules();
  const activePillars = rules.pillars.length;
  const hasCustomRules = !!rules.customRules.trim();
  const rulesActive = activePillars > 0 || hasCustomRules;

  // What the textarea displays: committed text + live interim
  const displayValue = interimText
    ? (description ? `${description} ${interimText}` : interimText)
    : description;

  return (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease_both]">

      <form onSubmit={handleSubmit(onSubmit)} className="card p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display tracking-widest text-lg" style={{ color: 'var(--text)' }}>
              GENERATE COPY
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              10 hooks · 5 captions · 3 CTAs · emotional angles
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRulesOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 11px',
              borderRadius: 10,
              background: rulesActive ? 'rgba(255,60,110,0.1)' : 'var(--surface-2)',
              border: `1.5px solid ${rulesActive ? 'rgba(255,60,110,0.35)' : 'var(--border)'}`,
              color: rulesActive ? 'var(--red)' : 'var(--text-3)',
              fontSize: 12, fontWeight: 600,
              flexShrink: 0,
            }}
          >
            <BookOpen size={13} />
            Rules
            {rulesActive && (
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--red)', color: '#fff',
                fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {activePillars + (hasCustomRules ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Clip Name (optional)" placeholder="e.g. Spring GRWM" {...register('clipName')} />
          <Select
            label="Category"
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            {...register('category')}
          />
        </div>

        {/* Description with voice */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>
              Describe the clip *
            </label>
            {supported && (
              <button
                type="button"
                onClick={toggleMic}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px',
                  borderRadius: 8,
                  background: listening ? 'rgba(255,60,110,0.15)' : 'var(--surface-2)',
                  border: `1.5px solid ${listening ? 'rgba(255,60,110,0.5)' : 'var(--border)'}`,
                  color: listening ? 'var(--red)' : 'var(--text-3)',
                  fontSize: 11, fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                {listening ? (
                  <>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--red)',
                      animation: 'pulse 1s ease infinite',
                      flexShrink: 0,
                    }} />
                    <MicOff size={12} />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic size={12} />
                    Speak
                  </>
                )}
              </button>
            )}
          </div>

          {/* Textarea — shows committed text + live interim in real time */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={displayValue}
              onChange={handleDescriptionChange}
              placeholder={listening
                ? 'Listening… speak now'
                : "Tell me what happens in the clip — the vibe, any affiliate product, who it's for, what emotion you want to trigger..."
              }
              rows={5}
              style={{
                width: '100%',
                background: listening ? 'rgba(255,60,110,0.05)' : 'var(--surface-2)',
                border: `1px solid ${listening ? 'rgba(255,60,110,0.4)' : errors.description ? 'var(--red)' : 'var(--border)'}`,
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--text)',
                resize: 'none',
                outline: 'none',
                transition: 'border-color 0.15s, background 0.15s',
                lineHeight: 1.6,
              }}
            />
            {/* Listening pulse bar */}
            {listening && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: 2, borderRadius: '0 0 8px 8px',
                background: 'var(--red)',
                animation: 'pulse 1.2s ease infinite',
              }} />
            )}
          </div>

          {/* Live interim preview label */}
          {listening && (
            <p style={{ fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--red)',
                animation: 'pulse 1s ease infinite',
                flexShrink: 0,
                display: 'inline-block',
              }} />
              {interimText ? 'Transcribing…' : 'Listening — speak now'}
            </p>
          )}

          {errors.description && !listening && (
            <span className="text-[11px]" style={{ color: 'var(--red)' }}>{errors.description.message}</span>
          )}
        </div>

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

      <GenerationRules open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
