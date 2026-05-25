'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAddClip } from '@/hooks/useClips';
import { useUIStore } from '@/stores/ui.store';
import { uploadClipMedia } from '@/lib/supabase/storage';
import { CATEGORIES, HOOK_STYLES, VISUAL_STYLES, PACING_OPTIONS, LIGHTING_OPTIONS } from '@/lib/constants';
import { ImagePlus, Camera, X } from 'lucide-react';
import { CameraModal } from './CameraModal';

const schema = z.object({
  clip_name:    z.string().min(1, 'Required'),
  category:     z.string().min(1, 'Required'),
  post_date:    z.string().optional(),
  views:        z.coerce.number().min(0),
  saves:        z.coerce.number().min(0),
  shares:       z.coerce.number().min(0),
  watch_time_pct: z.coerce.number().min(0).max(100),
  profile_visits: z.coerce.number().min(0),
  affiliate_clicks: z.coerce.number().min(0),
  comments:     z.coerce.number().min(0),
  reposts:      z.coerce.number().min(0),
  followers_gained: z.coerce.number().min(0),
  hook:         z.string().optional(),
  caption:      z.string().optional(),
  sound_used:   z.string().optional(),
  hook_style:   z.string().optional(),
  visual_style: z.string().optional(),
  pacing:       z.string().optional(),
  lighting:     z.string().optional(),
  emotional_tone: z.string().optional(),
  affiliate_notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddClipModalProps {
  folderId?: string | null;
}

export function AddClipModal({ folderId }: AddClipModalProps) {
  const open        = useUIStore((s) => s.addClipOpen);
  const setOpen     = useUIStore((s) => s.setAddClipOpen);
  const addClip     = useAddClip();
  const [preview, setPreview]       = useState<string | null>(null);
  const [mediaFile, setMediaFile]   = useState<File | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      views: 0, saves: 0, shares: 0, watch_time_pct: 0,
      profile_visits: 0, affiliate_clicks: 0, comments: 0,
      reposts: 0, followers_gained: 0,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    try {
      let thumbnail_url: string | undefined;
      if (mediaFile) {
        thumbnail_url = await uploadClipMedia(mediaFile);
      }
      await addClip.mutateAsync({ ...data, thumbnail_url, folder_id: folderId ?? null } as any);
      reset();
      setPreview(null);
      setMediaFile(null);
      setOpen(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Add Clip" width="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Thumbnail / Media Upload */}
        <div>
          <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--text-3)' }}>
            Thumbnail / Cover
          </div>
          {/* Hidden file input for library picker */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {preview ? (
            <div className="relative w-full h-36 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {mediaFile?.type.startsWith('video')
                ? <video src={preview} className="w-full h-full object-cover" muted playsInline />
                : <img src={preview} alt="preview" className="w-full h-full object-cover" />}
              <button
                type="button"
                onClick={() => { setPreview(null); setMediaFile(null); }}
                className="absolute top-2 right-2 p-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                className="h-20 rounded-lg flex flex-col items-center justify-center gap-2 transition-all active:opacity-70"
                style={{ border: '1px dashed var(--border-2)', color: 'var(--text-3)' }}
              >
                <Camera size={18} />
                <span className="font-mono text-[10px]">Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-20 rounded-lg flex flex-col items-center justify-center gap-2 transition-all active:opacity-70"
                style={{ border: '1px dashed var(--border-2)', color: 'var(--text-3)' }}
              >
                <ImagePlus size={18} />
                <span className="font-mono text-[10px]">Photo Library</span>
              </button>
            </div>
          )}
        </div>

        <CameraModal
          open={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={(file, url) => { setMediaFile(file); setPreview(url); }}
        />

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Clip Name *" placeholder="e.g. GRWM Morning Routine" error={errors.clip_name?.message} {...register('clip_name')} />
          <Select
            label="Category *"
            placeholder="Select category"
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            error={errors.category?.message}
            {...register('category')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Post Date" type="date" {...register('post_date')} />
          <Select
            label="Hook Style"
            placeholder="Select style"
            options={HOOK_STYLES.map((h) => ({ value: h, label: h }))}
            {...register('hook_style')}
          />
        </div>

        {/* Hook + Caption */}
        <Textarea label="Hook" placeholder="Opening line or on-screen text..." rows={2} {...register('hook')} />
        <Textarea label="Caption" placeholder="TikTok caption..." rows={2} {...register('caption')} />

        {/* Tier 1 Metrics */}
        <div>
          <div className="font-mono text-[9px] tracking-[2px] uppercase mb-3" style={{ color: 'var(--red)' }}>
            Tier 1 — Impact
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Input label="Saves"     type="number" placeholder="0" {...register('saves')} />
            <Input label="Shares"    type="number" placeholder="0" {...register('shares')} />
            <Input label="Watch %" type="number" placeholder="0" {...register('watch_time_pct')} />
            <Input label="Profile Visits" type="number" placeholder="0" {...register('profile_visits')} />
          </div>
        </div>

        {/* Tier 2 Metrics */}
        <div>
          <div className="font-mono text-[9px] tracking-[2px] uppercase mb-3" style={{ color: 'var(--gold)' }}>
            Tier 2 — Monetization
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Aff. Clicks" type="number" placeholder="0" {...register('affiliate_clicks')} />
            <Input label="Comments"   type="number" placeholder="0" {...register('comments')} />
            <Input label="Reposts"    type="number" placeholder="0" {...register('reposts')} />
          </div>
        </div>

        {/* Tier 3 Metrics */}
        <div>
          <div className="font-mono text-[9px] tracking-[2px] uppercase mb-3" style={{ color: 'var(--cyan)' }}>
            Tier 3 — Reach
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Views"           type="number" placeholder="0" {...register('views')} />
            <Input label="Followers Gained" type="number" placeholder="0" {...register('followers_gained')} />
          </div>
        </div>

        {/* Production */}
        <div className="grid grid-cols-3 gap-3">
          <Select label="Visual Style" placeholder="Style" options={VISUAL_STYLES.map((v) => ({ value: v, label: v }))} {...register('visual_style')} />
          <Select label="Pacing"       placeholder="Pacing" options={PACING_OPTIONS.map((p) => ({ value: p, label: p }))} {...register('pacing')} />
          <Select label="Lighting"     placeholder="Lighting" options={LIGHTING_OPTIONS.map((l) => ({ value: l, label: l }))} {...register('lighting')} />
        </div>

        <Input label="Sound Used" placeholder="Song name or original audio" {...register('sound_used')} />

        {/* Actions */}
        <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" loading={addClip.isPending || uploading} className="ml-auto">
            {uploading ? 'Uploading...' : 'Save Clip'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
