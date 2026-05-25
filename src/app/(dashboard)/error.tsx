'use client';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
      <p className="font-mono text-[10px] tracking-[3px] uppercase" style={{ color: 'var(--text-3)' }}>
        Something went wrong
      </p>
      <p className="text-[14px] max-w-md" style={{ color: 'var(--text-2)' }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      {error.digest && (
        <p className="font-mono text-[11px]" style={{ color: 'var(--text-3)' }}>
          Digest: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
        style={{ background: 'var(--red)' }}
      >
        Try again
      </button>
    </div>
  );
}
