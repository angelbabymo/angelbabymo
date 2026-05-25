'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Plus, Trash2, Check } from 'lucide-react';

export interface GenerationRulesData {
  pillars: number[];
  customRules: string;
}

const PILLARS = [
  { id: 0, label: 'Survival & Life',       desc: 'Survival, enjoyment of life, life extension' },
  { id: 1, label: 'Food & Pleasure',        desc: 'Enjoyment of food and beverages' },
  { id: 2, label: 'Safety & Security',      desc: 'Freedom from fear, pain, and danger' },
  { id: 3, label: 'Sexual / Connection',    desc: 'Sexual companionship and attraction' },
  { id: 4, label: 'Comfort',               desc: 'Comfortable living conditions' },
  { id: 5, label: 'Status & Superiority',   desc: 'To be superior, winning, keeping up with the Joneses' },
  { id: 6, label: 'Protection of Loved Ones', desc: 'Care and protection of family' },
  { id: 7, label: 'Social Approval',        desc: 'Belonging, acceptance, social proof' },
];

const STORAGE_KEY = 'creator_os_generation_rules_v1';

function load(): GenerationRulesData {
  if (typeof window === 'undefined') return { pillars: [], customRules: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { pillars: [], customRules: '' };
  } catch {
    return { pillars: [], customRules: '' };
  }
}

export function save(data: GenerationRulesData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadRules(): GenerationRulesData {
  return load();
}

export function formatRulesForPrompt(rules: GenerationRulesData): string | null {
  const lines: string[] = [];

  if (rules.pillars.length) {
    lines.push('PSYCHOLOGY PILLARS TO LEVERAGE (weave these into hooks, captions, and angles):');
    rules.pillars.forEach(id => {
      const p = PILLARS.find(p => p.id === id);
      if (p) lines.push(`  • ${p.label}: ${p.desc}`);
    });
  }

  if (rules.customRules.trim()) {
    lines.push('');
    lines.push('CREATOR RULES (always follow):');
    rules.customRules.trim().split('\n').filter(Boolean).forEach(r => {
      lines.push(`  • ${r}`);
    });
  }

  return lines.length ? lines.join('\n') : null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GenerationRules({ open, onClose }: Props) {
  const [rules, setRules] = useState<GenerationRulesData>({ pillars: [], customRules: '' });
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRules(load());
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const togglePillar = (id: number) => {
    setRules(prev => ({
      ...prev,
      pillars: prev.pillars.includes(id)
        ? prev.pillars.filter(p => p !== id)
        : [...prev.pillars, id],
    }));
  };

  const handleSave = () => {
    save(rules);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.2s ease both',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 9999,
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom)',
          animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1) both',
          maxHeight: '88vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-2)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 4px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} style={{ color: 'var(--red)' }} />
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                Generation Rules
              </p>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
              Applied to every generation across all brands
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} style={{ color: 'var(--text-3)' }} />
          </button>
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          {/* Pillars section */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
            Psychology Pillars (Ca$hvertising LF8)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PILLARS.map(p => {
              const active = rules.pillars.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePillar(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: active ? 'rgba(255,60,110,0.1)' : 'var(--surface-2)',
                    border: `1.5px solid ${active ? 'rgba(255,60,110,0.4)' : 'transparent'}`,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: active ? 'var(--red)' : 'var(--surface-3)',
                    border: `1.5px solid ${active ? 'var(--red)' : 'var(--border-2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {active && <Check size={11} color="white" strokeWidth={3} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--red)' : 'var(--text)', lineHeight: 1.2 }}>
                      {p.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {p.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom rules */}
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
              Custom Creator Rules
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>
              One rule per line. These are injected into every generation.
            </p>
            <textarea
              value={rules.customRules}
              onChange={e => setRules(prev => ({ ...prev, customRules: e.target.value }))}
              placeholder={'Always mention product price\nUse "bestie" instead of "girl"\nEnd every caption with a question\nEmphasize transformation and before/after'}
              rows={5}
              style={{
                width: '100%',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 13,
                color: 'var(--text)',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.6,
              }}
            />
          </div>
        </div>

        {/* Save button */}
        <div style={{ padding: '16px' }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%', padding: '14px',
              borderRadius: 16,
              background: saved ? '#22c55e' : 'var(--red)',
              color: '#fff',
              fontSize: 15, fontWeight: 700,
              transition: 'background 0.2s',
            }}
          >
            {saved ? '✓ Saved!' : `Save Rules${rules.pillars.length ? ` (${rules.pillars.length} pillars active)` : ''}`}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
