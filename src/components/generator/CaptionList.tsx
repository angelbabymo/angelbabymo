'use client';
import { useState } from 'react';
import { Copy, Check, MousePointerClick, Lightbulb, type LucideIcon } from 'lucide-react';
import { GeneratedContent } from '@/types';
import { motion } from 'framer-motion';

interface CaptionListProps {
  data: GeneratedContent;
}

export function CaptionList({ data }: CaptionListProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Captions */}
      <div className="card p-5 lg:col-span-1">
        <SectionHeader label="CAPTIONS" count={data.captions.length} color="var(--cyan)" />
        <div className="flex flex-col gap-2">
          {data.captions.map((cap, i) => (
            <CopyItem key={i} text={cap} id={`cap-${i}`} copied={copied} onCopy={copy} delay={i * 0.05} />
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="card p-5 lg:col-span-1">
        <SectionHeader label="CTAs" count={data.ctas.length} color="var(--gold)" icon={MousePointerClick} />
        <div className="flex flex-col gap-2">
          {data.ctas.map((cta, i) => (
            <CopyItem key={i} text={cta} id={`cta-${i}`} copied={copied} onCopy={copy} delay={i * 0.06} />
          ))}
        </div>
      </div>

      {/* Emotional Angles */}
      <div className="card p-5 lg:col-span-1">
        <SectionHeader label="EMOTIONAL ANGLES" count={data.emotional_angles.length} color="var(--violet)" icon={Lightbulb} />
        <div className="flex flex-col gap-2">
          {data.emotional_angles.map((angle, i) => (
            <CopyItem key={i} text={angle} id={`angle-${i}`} copied={copied} onCopy={copy} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label, count, color, icon: Icon }: { label: string; count: number; color: string; icon?: LucideIcon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon size={12} style={{ color }} />}
      <h3 className="font-display tracking-widest text-sm" style={{ color: 'var(--text)' }}>{label}</h3>
      <span className="font-mono text-[9px]" style={{ color: 'var(--text-3)' }}>{count}</span>
    </div>
  );
}

function CopyItem({ text, id, copied, onCopy, delay }: { text: string; id: string; copied: string | null; onCopy: (t: string, k: string) => void; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group flex items-start gap-2 p-3 rounded-lg cursor-pointer transition-all"
      style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}
      onClick={() => onCopy(text, id)}
    >
      <p className="flex-1 text-[12px]" style={{ color: 'var(--text-2)' }}>{text}</p>
      <div className="shrink-0 mt-0.5" style={{ color: 'var(--text-3)' }}>
        {copied === id ? <Check size={12} style={{ color: 'var(--green)' }} /> : <Copy size={12} />}
      </div>
    </motion.div>
  );
}
