'use client';
import { useState, useRef } from 'react';
import { Zap, Mic, MicOff, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useClips } from '@/hooks/useClips';
import { useAddPost } from '@/hooks/usePosts';
import { ScheduledPost } from '@/types';
import { format } from 'date-fns';
import { getCategoryColor } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AISchedulerProps {
  currentMonth: Date;
}

export function AIScheduler({ currentMonth }: AISchedulerProps) {
  const { data: clips = [] } = useClips();
  const addPost = useAddPost();

  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [preview, setPreview]     = useState<Partial<ScheduledPost>[] | null>(null);
  const [applying, setApplying]   = useState(false);
  const [applied, setApplied]     = useState(false);
  const [error, setError]         = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef            = useRef<any>(null);

  const monthStr = format(currentMonth, 'MMMM yyyy');

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice not supported on this browser. Try Safari on iPhone.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend  = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setPreview(null);
    setApplied(false);

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input, clips, month: monthStr }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPreview(data.posts);
    } catch (err: any) {
      setError('Could not generate schedule. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const applySchedule = async () => {
    if (!preview) return;
    setApplying(true);
    try {
      await Promise.all(preview.map((post) => addPost.mutateAsync(post as any)));
      setApplied(true);
      setPreview(null);
      setInput('');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Zap size={14} style={{ color: 'var(--red)' }} />
        <h3 className="font-display tracking-widest text-sm" style={{ color: 'var(--text)' }}>
          AI SCHEDULE
        </h3>
      </div>

      <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
        Describe what you want to schedule — or speak it. Claude will build the calendar based on your top-performing content.
      </p>

      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Schedule 3 posts this week — GRWM Monday, affiliate Wednesday, lifestyle Friday at 7pm..."
            rows={3}
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            className="w-full px-3 py-2 text-[13px] rounded-lg outline-none resize-none placeholder:text-[var(--text-3)] focus:border-[var(--border-2)]"
          />
        </div>
        <button
          onClick={listening ? stopVoice : startVoice}
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all self-start mt-0.5"
          style={{
            background: listening ? 'var(--red-dim)' : 'var(--surface-2)',
            border: `1px solid ${listening ? 'var(--red)' : 'var(--border)'}`,
            color: listening ? 'var(--red)' : 'var(--text-3)',
          }}
          aria-label={listening ? 'Stop recording' : 'Start voice input'}
        >
          {listening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      </div>

      {listening && (
        <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--red)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--red)' }} />
          Listening... speak your schedule
        </div>
      )}

      {error && <p className="text-[12px]" style={{ color: 'var(--red)' }}>{error}</p>}

      <Button onClick={generate} loading={loading} disabled={!input.trim()} className="w-full justify-center">
        <Zap size={13} /> {loading ? 'Building schedule...' : 'Generate Schedule'}
      </Button>

      {/* Applied confirmation */}
      {applied && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-[12px]"
          style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--green)' }}
        >
          <Check size={13} /> Schedule added to your calendar!
        </div>
      )}

      {/* Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>
                {preview.length} posts to schedule
              </span>
              <button onClick={() => setPreview(null)} style={{ color: 'var(--text-3)' }}>
                <X size={13} />
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {preview.map((post, i) => {
                const catColor = getCategoryColor(post.category ?? '');
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium" style={{ color: 'var(--text)' }}>{post.title}</div>
                      <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                        {post.scheduled_for ? format(new Date(post.scheduled_for), 'EEE MMM d · h:mm a') : ''}
                      </div>
                      {post.notes && (
                        <div className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>{post.notes}</div>
                      )}
                    </div>
                    <span className="tag shrink-0" style={{ color: catColor, background: `${catColor}1a` }}>
                      {post.category}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setPreview(null)} className="flex-1 justify-center">
                Discard
              </Button>
              <Button onClick={applySchedule} loading={applying} className="flex-1 justify-center">
                <Check size={13} /> Apply to Calendar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
