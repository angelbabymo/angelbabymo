'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface HookListProps {
  hooks: string[];
}

export function HookList({ hooks }: HookListProps) {
  const [copied, setCopied] = useState<number | null>(null);

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display tracking-widest text-base" style={{ color: 'var(--text)' }}>
          HOOKS
        </h3>
        <span className="font-mono text-[9px] tracking-[2px]" style={{ color: 'var(--text-3)' }}>
          {hooks.length} generated
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {hooks.map((hook, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group flex items-start gap-3 p-3 rounded-lg transition-all"
            style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}
          >
            <span
              className="font-mono text-[10px] font-bold shrink-0 mt-0.5 w-4 text-right"
              style={{ color: 'var(--red)' }}
            >
              {i + 1}
            </span>
            <p className="flex-1 text-[13px]" style={{ color: 'var(--text)' }}>{hook}</p>
            <button
              onClick={() => copy(hook, i)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded"
              style={{ color: 'var(--text-3)' }}
              aria-label="Copy hook"
            >
              {copied === i ? <Check size={13} style={{ color: 'var(--green)' }} /> : <Copy size={13} />}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
