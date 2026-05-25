'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import {
  useChecklists, useChecklistItems,
  useDeleteChecklist, useToggleItem, useAddItem, useDeleteItem,
  Checklist, ChecklistItem,
} from '@/hooks/useChecklists';
import { NewChecklistModal } from '@/components/checklists/NewChecklistModal';
import { ArrowLeft, Plus, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ChecklistsPage() {
  const { data: checklists = [], isLoading } = useChecklists();
  const [active, setActive]     = useState<Checklist | null>(null);
  const [newOpen, setNewOpen]   = useState(false);

  return (
    <div className="flex flex-col gap-5 animate-[fadeUp_0.3s_ease_both]">
      {active
        ? <DetailView checklist={active} onBack={() => setActive(null)} />
        : <GridView checklists={checklists} isLoading={isLoading} onSelect={setActive} onNew={() => setNewOpen(true)} />
      }
      <NewChecklistModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}

/* ─── Grid ─────────────────────────────────────────────────────────────── */

function GridView({
  checklists, isLoading, onSelect, onNew,
}: {
  checklists: Checklist[];
  isLoading: boolean;
  onSelect: (c: Checklist) => void;
  onNew: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-widest" style={{ color: 'var(--text)' }}>
            CHECK<span style={{ color: 'var(--red)' }}>LISTS</span>
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>
            Track shoots, brand deals, and weekly goals
          </p>
        </div>
        <Button size="sm" onClick={onNew}>
          <Plus size={13} /> New
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: 'var(--surface)' }} />
          ))}
        </div>
      ) : checklists.length === 0 ? (
        <EmptyState onNew={onNew} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {checklists.map((c) => (
            <ChecklistCard key={c.id} checklist={c} onClick={() => onSelect(c)} />
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────────── */

function ChecklistCard({ checklist, onClick }: { checklist: Checklist; onClick: () => void }) {
  const { data: items = [] } = useChecklistItems(checklist.id);
  const done  = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl p-5 flex flex-col gap-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between">
        <div className="text-3xl">{checklist.emoji}</div>
        {total > 0 && pct === 100 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
            <Check size={10} /> Done
          </div>
        )}
      </div>
      <div>
        <p className="font-semibold text-[15px] leading-tight" style={{ color: 'var(--text)' }}>{checklist.title}</p>
        {checklist.description && (
          <p className="text-[12px] mt-1 line-clamp-2" style={{ color: 'var(--text-3)' }}>{checklist.description}</p>
        )}
      </div>
      {total > 0 ? (
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : 'var(--red)' }}
            />
          </div>
          <p className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>
            {done}/{total} complete · {pct}%
          </p>
        </div>
      ) : (
        <p className="text-[11px] font-mono" style={{ color: 'var(--text-3)' }}>No items yet</p>
      )}
    </button>
  );
}

/* ─── Detail ────────────────────────────────────────────────────────────── */

function DetailView({ checklist, onBack }: { checklist: Checklist; onBack: () => void }) {
  const { data: items = [], isLoading } = useChecklistItems(checklist.id);
  const deleteChecklist = useDeleteChecklist();
  const toggleItem      = useToggleItem();
  const addItem         = useAddItem();
  const deleteItem      = useDeleteItem();

  const [newText, setNewText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const done  = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAdd = async () => {
    const text = newText.trim();
    if (!text) return;
    setNewText('');
    await addItem.mutateAsync({ checklistId: checklist.id, text, position: items.length });
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this checklist?')) return;
    await deleteChecklist.mutateAsync(checklist.id);
    onBack();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
        >
          <ArrowLeft size={13} /> Back
        </button>
        <div className="flex-1 flex items-center gap-3">
          <span className="text-2xl">{checklist.emoji}</span>
          <div>
            <p className="font-semibold text-[16px]" style={{ color: 'var(--text)' }}>{checklist.title}</p>
            {checklist.description && (
              <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>{checklist.description}</p>
            )}
          </div>
        </div>
        <button onClick={handleDelete} className="p-2 rounded-lg" style={{ color: 'var(--text-3)' }}>
          <Trash2 size={15} />
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="flex flex-col gap-2 px-4 py-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Progress</span>
            <span className="font-mono text-[12px] font-bold" style={{ color: pct === 100 ? '#22c55e' : 'var(--red)' }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : 'var(--red)' }}
            />
          </div>
          <p className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>{done} of {total} done</p>
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>
          Items · {total}
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1,2,3,4].map((i) => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={(completed) => toggleItem.mutate({ id: item.id, completed, checklistId: checklist.id })}
                onDelete={() => deleteItem.mutate({ id: item.id, checklistId: checklist.id })}
              />
            ))}

            {/* Add item */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl mt-1"
              style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}
            >
              <div className="w-5 h-5 rounded-md shrink-0" style={{ border: '1.5px dashed var(--border)' }} />
              <input
                ref={inputRef}
                className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ color: 'var(--text)' }}
                placeholder="Add item..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={onKeyDown}
              />
              {newText.trim() && (
                <button
                  onClick={handleAdd}
                  className="px-2 py-1 rounded-lg text-[12px] font-semibold text-white"
                  style={{ background: 'var(--red)' }}
                >
                  Add
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Item Row ──────────────────────────────────────────────────────────── */

function ItemRow({
  item, onToggle, onDelete,
}: {
  item: ChecklistItem;
  onToggle: (c: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl group transition-all"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${item.completed ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
        opacity: item.completed ? 0.7 : 1,
      }}
    >
      <button
        onClick={() => onToggle(!item.completed)}
        className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center transition-all"
        style={{
          background: item.completed ? '#22c55e' : 'transparent',
          border: `1.5px solid ${item.completed ? '#22c55e' : 'var(--border)'}`,
        }}
      >
        {item.completed && <Check size={11} color="white" strokeWidth={3} />}
      </button>
      <span
        className="flex-1 text-[14px]"
        style={{
          color: item.completed ? 'var(--text-3)' : 'var(--text)',
          textDecoration: item.completed ? 'line-through' : 'none',
        }}
      >
        {item.text}
      </span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
        style={{ color: 'var(--text-3)' }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

/* ─── Empty ─────────────────────────────────────────────────────────────── */

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
      <div className="text-5xl">🎯</div>
      <div>
        <p className="font-medium text-[15px]" style={{ color: 'var(--text)' }}>No checklists yet</p>
        <p className="text-[13px] mt-1 max-w-xs" style={{ color: 'var(--text-3)' }}>
          Create a shoot plan, brand deal tracker, or weekly content checklist
        </p>
      </div>
      <Button onClick={onNew}>
        <Plus size={14} /> Create First Checklist
      </Button>
    </div>
  );
}

