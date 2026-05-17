'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAddVaultItem } from '@/hooks/useVault';
import { useUIStore } from '@/stores/ui.store';
import { VAULT_TYPES, PRIORITIES } from '@/lib/constants';

const schema = z.object({
  type:       z.string().min(1, 'Required'),
  content:    z.string().min(1, 'Required'),
  priority:   z.string(),
  source_url: z.string().optional(),
  category:   z.string().optional(),
  tags:       z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function AddIdeaModal() {
  const open    = useUIStore((s) => s.addIdeaOpen);
  const setOpen = useUIStore((s) => s.setAddIdeaOpen);
  const add     = useAddVaultItem();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'normal' },
  });

  const onSubmit = async (data: FormData) => {
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    await add.mutateAsync({ ...data, tags } as any);
    reset();
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Add Idea">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select
          label="Type *"
          placeholder="Select type"
          options={VAULT_TYPES.map((v) => ({ value: v, label: v }))}
          error={errors.type?.message}
          {...register('type')}
        />

        <Textarea
          label="Idea / Content *"
          placeholder="Capture the idea, observation, or inspiration..."
          rows={4}
          error={errors.content?.message}
          {...register('content')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
            {...register('priority')}
          />
          <Input label="Category" placeholder="e.g. Fashion" {...register('category')} />
        </div>

        <Input
          label="Tags (comma separated)"
          placeholder="e.g. trending, summer, affiliate"
          {...register('tags')}
        />

        <Input label="Source URL" type="url" placeholder="https://..." {...register('source_url')} />

        <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" loading={add.isPending} className="ml-auto">Save Idea</Button>
        </div>
      </form>
    </Modal>
  );
}
