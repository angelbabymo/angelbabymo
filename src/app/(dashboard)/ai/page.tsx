'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Zap, Tag, CheckSquare, Calendar, Search, Activity, DollarSign, Hash, Cpu } from 'lucide-react';

type Period = 'today' | '7d' | '30d';

const AGENTS: Record<string, { label: string; icon: any; color: string }> = {
  generator:    { label: 'Content Generator', icon: Zap,         color: '#ff3c6e' },
  brand_prompt: { label: 'Brand Builder',     icon: Tag,         color: '#8b5cf6' },
  checklist:    { label: 'Task Builder',      icon: CheckSquare, color: '#10b981' },
  scheduler:    { label: 'AI Scheduler',      icon: Calendar,    color: '#3b82f6' },
  scanner:      { label: 'Product Scanner',   icon: Search,      color: '#f59e0b' },
};

function timeAgo(ts: string) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fmt$(n: number) {
  if (n < 0.01) return '<$0.01';
  return `$${n.toFixed(3)}`;
}

function fmtTokens(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function AIUsagePage() {
  const [period, setPeriod]   = useState<Period>('today');
  const [rows, setRows]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    setLoading(true);
    const since = period === 'today'
      ? new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      : period === '7d'
        ? new Date(Date.now() - 7  * 86400_000).toISOString()
        : new Date(Date.now() - 30 * 86400_000).toISOString();

    supabase
      .from('ai_usage')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, [period]);

  const totalCost    = rows.reduce((s, r) => s + (r.cost_usd ?? 0), 0);
  const totalCalls   = rows.length;
  const totalTokens  = rows.reduce((s, r) => s + (r.input_tokens ?? 0) + (r.output_tokens ?? 0), 0);
  const successRate  = totalCalls ? Math.round(rows.filter(r => r.status === 'success').length / totalCalls * 100) : 100;

  const byAgent = Object.entries(
    rows.reduce<Record<string, { calls: number; tokens: number; cost: number }>>((acc, r) => {
      if (!acc[r.agent]) acc[r.agent] = { calls: 0, tokens: 0, cost: 0 };
      acc[r.agent].calls++;
      acc[r.agent].tokens += (r.input_tokens ?? 0) + (r.output_tokens ?? 0);
      acc[r.agent].cost   += r.cost_usd ?? 0;
      return acc;
    }, {})
  ).sort((a, b) => b[1].calls - a[1].calls);

  const maxCalls = Math.max(...byAgent.map(([, v]) => v.calls), 1);

  return (
    <div className="flex flex-col gap-5 animate-[fadeUp_0.3s_ease_both]">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-widest leading-tight" style={{ color: 'var(--text)' }}>
            AI<span style={{ color: 'var(--red)' }}>ACTIVITY</span>
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Agent usage, token spend & cost tracking</p>
        </div>

        {/* Period tabs */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--surface-2)' }}>
          {(['today', '7d', '30d'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: period === p ? 'var(--surface)' : 'transparent',
                color: period === p ? 'var(--text)' : 'var(--text-3)',
                boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Est. Cost',     value: fmt$(totalCost),         icon: DollarSign, color: '#22c55e' },
          { label: 'API Calls',     value: String(totalCalls),       icon: Activity,   color: '#ff3c6e' },
          { label: 'Total Tokens',  value: fmtTokens(totalTokens),  icon: Hash,       color: '#3b82f6' },
          { label: 'Success Rate',  value: `${successRate}%`,        icon: Cpu,        color: '#8b5cf6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: `${color}18`,
              border: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div>
              <p className="font-mono font-bold text-[22px] leading-none" style={{ color: 'var(--text)' }}>{value}</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Agent breakdown */}
      <div className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="font-mono text-[10px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>
          Agent Breakdown
        </p>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
          </div>
        ) : byAgent.length === 0 ? (
          <p className="text-[13px] py-4 text-center" style={{ color: 'var(--text-3)' }}>
            No activity yet — run a generation to start tracking
          </p>
        ) : (
          byAgent.map(([agent, stats]) => {
            const def = AGENTS[agent] ?? { label: agent, icon: Cpu, color: '#52525b' };
            const Icon = def.icon;
            const pct  = Math.round((stats.calls / maxCalls) * 100);
            return (
              <div key={agent} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: `${def.color}18`, border: `1px solid ${def.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} style={{ color: def.color }} />
                </div>

                {/* Bar + label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{def.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                      {stats.calls} call{stats.calls !== 1 ? 's' : ''} · {fmt$(stats.cost)}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${pct}%`,
                      background: def.color,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                    {fmtTokens(stats.tokens)} tokens
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Activity feed */}
      <div className="rounded-2xl flex flex-col"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="font-mono text-[10px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>
            Recent Activity
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg animate-pulse" style={{ background: 'var(--surface-2)', flexShrink: 0 }} />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-3 rounded animate-pulse w-2/3" style={{ background: 'var(--surface-2)' }} />
                  <div className="h-2.5 rounded animate-pulse w-1/3" style={{ background: 'var(--surface-2)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Activity size={24} className="mx-auto mb-2" style={{ color: 'var(--text-3)' }} />
            <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>No activity in this period</p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ maxHeight: 400, overflowY: 'auto' }}>
            {rows.slice(0, 50).map((row, i) => {
              const def  = AGENTS[row.agent] ?? { label: row.agent, icon: Cpu, color: '#52525b' };
              const Icon = def.icon;
              const tokens = (row.input_tokens ?? 0) + (row.output_tokens ?? 0);
              return (
                <div
                  key={row.id}
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: `${def.color}15`, border: `1px solid ${def.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={13} style={{ color: def.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {def.label}
                      </p>
                      <span style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0, fontFamily: 'monospace' }}>
                        {timeAgo(row.created_at)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                        {fmtTokens(tokens)} tokens
                      </span>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#22c55e' }}>
                        {fmt$(row.cost_usd ?? 0)}
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                        padding: '1px 5px', borderRadius: 4,
                        background: row.status === 'success' ? 'rgba(34,197,94,0.12)' : 'var(--red-dim)',
                        color: row.status === 'success' ? '#22c55e' : 'var(--red)',
                      }}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-center pb-2" style={{ color: 'var(--text-3)' }}>
        Cost estimates based on Claude Sonnet 4.6 pricing ($3/1M input · $15/1M output)
      </p>
    </div>
  );
}
