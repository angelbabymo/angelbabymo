'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAddPost } from '@/hooks/usePosts';
import { useUIStore } from '@/stores/ui.store';
import { CATEGORIES } from '@/lib/constants';

const schema = z.object({
  title:         z.string().min(1, 'Required'),
  category:      z.string().min(1, 'Required'),
  scheduled_for: z.string().min(1, 'Required'),
  status:        z.string(),
  caption:       z.string().optional(),
  hook:          z.string().optional(),
  notes:         z.string().optional(),
  is_repost:     z.boolean(),
});
type FormData = z.infer<typeof schema>;

export function AddPostModal() {
  const open    = useUIStore((s) => s.addPostOpen);
  const setOpen = useUIStore((s) => s.setAddPostOpen);
  const add     = useAddPost();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'scheduled', is_repost: false },
  });

  const onSubmit = async (data: FormData) => {
    await add.mutateAsync(data as any);
    reset();
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Schedule Post">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Title *" placeholder="e.g. Monday GRWM" error={errors.title?.message} {...register('title')} />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category *"
            placeholder="Select"
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            error={errors.category?.message}
            {...register('category')}
          />
          <Select
            label="Status"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'posted', label: 'Posted' },
              { value: 'skipped', label: 'Skipped' },
            ]}
            {...register('status')}
          />
        </div>
        <Input
          label="Scheduled For *"
          type="datetime-local"
          error={errors.scheduled_for?.message}
          {...register('scheduled_for')}
        />
        <Textarea label="Hook" placeholder="Opening line..." rows={2} {...register('hook')} />
        <Textarea label="Caption" placeholder="TikTok caption..." rows={2} {...register('caption')} />
        <Textarea label="Notes" placeholder="Any notes..." rows={2} {...register('notes')} />

        <label className="flex items-center gap-2 text-[12px] cursor-pointer" style={{ color: 'var(--text-2)' }}>
          <input type="checkbox" {...register('is_repost')} className="rounded" />
          This is a repost
        </label>

        <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" loading={add.isPending} className="ml-auto">Schedule</Button>
        </div>
      </form>
    </Modal>
  );
}
