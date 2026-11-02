import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Dashboard as DashboardData } from '../api/types'
import { formatINR, formatDate } from '../lib/format'
import BottomNav from '../components/BottomNav'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<DashboardData>('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard. Is the backend running?'))
  }, [])

  const budgetPct = data?.monthly_budget ? Math.min(100, Math.round((data.month_total / data.monthly_budget) * 100)) : null

  return (
    <div className="w-full h-full bg-[var(--bg)] text-[var(--ink)] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 safe-top">
          <div>
            <div className="text-[13px] text-[var(--muted)]">Good evening</div>
            <div className="text-[21px] font-bold mt-0.5">Prajna</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white border border-[var(--border)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C1B18" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 10a6 6 0 1 1 12 0c0 3.2 1 5 2 6.5H4c1-1.5 2-3.3 2-6.5Z" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <div className="mx-6 mt-4 bg-[#1C1B18] text-white rounded-[20px] p-6">
          <div className="text-[13px] opacity-70">Spent this month</div>
          <div className="text-[34px] font-extrabold mt-1 tracking-tight">
            {data ? formatINR(data.month_total) : '…'}
          </div>
          {budgetPct !== null && data?.monthly_budget && (
            <>
              <div className="text-[12px] opacity-70 mt-2.5">of {formatINR(data.monthly_budget)} budget</div>
              <div className="h-2 rounded-full bg-white/15 mt-2">
                <div className="h-2 rounded-full bg-[var(--accent-soft)]" style={{ width: `${budgetPct}%` }} />
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mx-6 mt-4">
          <div className="bg-white border border-[var(--border)] rounded-2xl p-3.5">
            <div className="text-[12px] text-[var(--muted)]">This week</div>
            <div className="text-[18px] font-bold mt-1">{data ? formatINR(data.week_total) : '…'}</div>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-2xl p-3.5">
            <div className="text-[12px] text-[var(--muted)]">Top category</div>
            <div className="text-[18px] font-bold mt-1">{data?.top_category ?? '—'}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mx-6 mt-6 mb-3">
          <div className="text-[16px] font-bold">Recent transactions</div>
          <Link to="/summary" className="text-[13px] font-semibold">See all</Link>
        </div>

        <div className="px-6 pb-6 space-y-2.5">
          {data?.recent.length === 0 && (
            <div className="text-center text-sm text-[var(--muted)] py-10">
              No expenses yet. Tap + below to add your first one.
            </div>
          )}
          {data?.recent.map((t) => (
            <div key={t.id} className="flex items-center gap-3 bg-white border border-[var(--border)] rounded-2xl p-3">
              <div
                className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: t.category.color }}
              >
                {t.category.letter}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{t.merchant || t.category.name}</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">
                  {t.category.name} · {formatDate(t.date)}
                </div>
              </div>
              <div className="text-sm font-bold whitespace-nowrap">-{formatINR(t.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
