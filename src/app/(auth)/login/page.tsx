'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Zap, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.3,
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,60,110,0.2)' }}
          >
            <Zap size={22} style={{ color: 'var(--red)' }} />
          </div>
          <h1 className="font-display tracking-widest text-3xl" style={{ color: 'var(--text)' }}>
            CREATOR<span style={{ color: 'var(--red)' }}>OS</span>
          </h1>
          <p className="font-mono text-[10px] tracking-[3px] uppercase mt-1" style={{ color: 'var(--text-3)' }}>
            Private Access · Lite V1.0
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <CheckCircle size={32} style={{ color: 'var(--green)' }} />
              <div>
                <h2 className="font-display tracking-widest text-lg" style={{ color: 'var(--text)' }}>
                  LINK SENT
                </h2>
                <p className="text-[13px] mt-2" style={{ color: 'var(--text-2)' }}>
                  Check <strong>{email}</strong> for your magic link.
                </p>
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
                  No password needed — just click the link.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="font-mono text-[11px]"
                style={{ color: 'var(--text-3)' }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <h2 className="font-display tracking-widest text-lg" style={{ color: 'var(--text)' }}>
                  SIGN IN
                </h2>
                <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
                  Enter your email to receive a magic link.
                </p>
              </div>

              <Input
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <p className="text-[12px]" style={{ color: 'var(--red)' }}>{error}</p>
              )}

              <Button type="submit" loading={loading} size="lg" className="w-full justify-center">
                <Mail size={14} />
                Send Magic Link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center font-mono text-[10px] mt-6" style={{ color: 'var(--text-3)' }}>
          Authorized users only · Creator OS Lite
        </p>
      </div>
    </div>
  );
}
