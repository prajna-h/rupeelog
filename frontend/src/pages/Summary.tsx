import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Summary as SummaryData } from '../api/types'
import { formatINR } from '../lib/format'
import BottomNav from '../components/BottomNav'

type Period = 'weekly' | 'monthly'

function buildDonut(breakdown: SummaryData['breakdown']): string {
  if (breakdown.length === 0) return '#E7E3D9 0% 100%'
  let acc = 0
  const stops = breakdown.map((c) => {
    const start = acc
    acc += c.pct
    return `${c.color} ${start}% ${acc}%`
  })
  if (acc < 100) stops.push(`#E7E3D9 ${acc}% 100%`)
  return stops.join(', ')
}

export default function Summary() {
  const [period, setPeriod] = useState<Period>('monthly')
  const [data, setData] = useState<SummaryData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    api
      .get<SummaryData>('/summary', { params: { period } })
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load summary.'))
  }, [period])

  const deltaText =
    data?.delta_pct === null || data?.delta_pct === undefined
      ? 'No data for the previous period yet'
      : `${data.delta_pct >= 0 ? '↑' : '↓'} ${Math.abs(data.delta_pct)}% vs last ${period === 'weekly' ? 'week' : 'month'}`

  return (
    <div className="w-full h-full bg-[var(--bg)] text-[var(--ink)] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="text-[21px] font-bold px-6 pt-6 safe-top">Summary</div>

        <div className="flex bg-white border border-[var(--border)] rounded-xl p-1 mx-6 mt-4">
          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className="flex-1 py-2.5 rounded-[9px] text-[13px] font-bold"
            style={{ background: period === 'weekly' ? '#1C1B18' : 'transparent', color: period === 'weekly' ? '#FFFFFF' : 'var(--muted)' }}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className="flex-1 py-2.5 rounded-[9px] text-[13px] font-bold"
            style={{ background: period === 'monthly' ? '#1C1B18' : 'transparent', color: period === 'monthly' ? '#FFFFFF' : 'var(--muted)' }}
          >
            Monthly
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        <div className="mx-6 mt-[18px] bg-[#1C1B18] text-white rounded-[20px] p-5">
          <div className="text-[13px] opacity-70">Total spent · {data?.label ?? '…'}</div>
          <div className="text-[30px] font-extrabold mt-1">{data ? formatINR(data.total) : '…'}</div>
          <div className="text-[12px] opacity-75 mt-2">{data ? deltaText : ''}</div>
        </div>

        <div className="flex justify-center mt-6 mb-2">
          <div className="relative w-[168px] h-[168px]">
            <div
              className="w-[168px] h-[168px] rounded-full"
              style={{ background: data ? `conic-gradient(${buildDonut(data.breakdown)})` : '#E7E3D9' }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[112px] h-[112px] rounded-full bg-[var(--bg)] flex flex-col items-center justify-center">
              <div className="text-[11px] text-[var(--muted)]">{data?.label}</div>
              <div className="text-[15px] font-bold mt-0.5">{data ? formatINR(data.total) : '…'}</div>
            </div>
          </div>
        </div>

        <div className="text-[14px] font-bold mx-6 mt-5 mb-2.5">By category</div>
        <div className="px-6 pb-6 space-y-2.5">
          {data?.breakdown.length === 0 && (
            <div className="text-center text-sm text-[var(--muted)] py-8">No expenses in this period yet.</div>
          )}
          {data?.breakdown.map((c) => (
            <div key={c.category_id} className="bg-white border border-[var(--border)] rounded-2xl p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-[26px] h-[26px] rounded-full text-white flex items-center justify-center font-bold text-[11px]"
                    style={{ background: c.color }}
                  >
                    {c.letter}
                  </span>
                  <span className="text-[13.5px] font-semibold">{c.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-[13.5px] font-bold">{formatINR(c.amount)}</div>
                  <div className="text-[11px] text-[var(--muted)]">{c.pct}%</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[#EFEDE5] mt-2.5">
                <div className="h-1.5 rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
