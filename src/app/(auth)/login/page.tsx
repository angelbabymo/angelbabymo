'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router   = useRouter();
  const [mode, setMode]         = useState<Mode>('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        // After signup, sign in immediately
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }

      router.push('/database');
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Grid background */}
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <h2 className="font-display tracking-widest text-lg" style={{ color: 'var(--text)' }}>
                {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </h2>
              <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
                {mode === 'signin' ? 'Enter your email and password.' : 'Set up your private access.'}
              </p>
            </div>

            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  className="w-full px-3 py-2 pr-10 text-[13px] rounded-lg outline-none focus:border-[var(--border-2)] placeholder:text-[var(--text-3)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-3)' }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[12px]" style={{ color: 'var(--red)' }}>{error}</p>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full justify-center">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>

            <button
              type="button"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              className="text-[12px] text-center"
              style={{ color: 'var(--text-3)' }}
            >
              {mode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[10px] mt-6" style={{ color: 'var(--text-3)' }}>
          Authorized users only · Creator OS Lite
        </p>
      </div>
    </div>
  );
}
