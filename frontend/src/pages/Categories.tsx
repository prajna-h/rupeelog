import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Category } from '../api/types'
import { formatINR } from '../lib/format'
import BottomNav from '../components/BottomNav'

interface CategoryWithSpend extends Category {
  monthSpend: number
}

export default function Categories() {
  const [categories, setCategories] = useState<CategoryWithSpend[] | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [letter, setLetter] = useState('')
  const [color, setColor] = useState('#3F6B52')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const [catsRes, summaryRes] = await Promise.all([
      api.get<Category[]>('/categories'),
      api.get('/summary', { params: { period: 'monthly' } }),
    ])
    const spendByCategory = new Map<number, number>(
      summaryRes.data.breakdown.map((b: { category_id: number; amount: number }) => [b.category_id, b.amount])
    )
    setCategories(catsRes.data.map((c) => ({ ...c, monthSpend: spendByCategory.get(c.id) ?? 0 })))
  }

  useEffect(() => {
    load().catch(() => setError('Could not load categories.'))
  }, [])

  async function handleAdd() {
    if (!name.trim() || !letter.trim()) return
    try {
      await api.post('/categories', { name: name.trim(), letter: letter.trim().slice(0, 2).toUpperCase(), color })
      setName('')
      setLetter('')
      setColor('#3F6B52')
      setShowAdd(false)
      await load()
    } catch {
      setError('Could not add category — name may already exist.')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this category? Expenses in it will need to be reassigned.')) return
    try {
      await api.delete(`/categories/${id}`)
      await load()
    } catch {
      setError('Could not delete — it may still have expenses linked to it.')
    }
  }

  return (
    <div className="w-full h-full bg-[var(--bg)] text-[var(--ink)] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 safe-top">
          <div className="text-[21px] font-bold">Categories</div>
          <button
            type="button"
            aria-label="Add category"
            onClick={() => setShowAdd((v) => !v)}
            className="w-9 h-9 rounded-full bg-[#1C1B18] flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        {showAdd && (
          <div className="mx-6 mt-4 p-4 bg-white border border-[var(--border)] rounded-2xl space-y-2.5">
            <input
              type="text"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-[var(--border)] rounded-xl text-sm"
            />
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Letter"
                value={letter}
                maxLength={2}
                onChange={(e) => setLetter(e.target.value)}
                className="w-20 p-2.5 border border-[var(--border)] rounded-xl text-sm"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-14 h-10 rounded-xl border border-[var(--border)]"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 bg-[#1C1B18] text-white rounded-xl text-sm font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="px-6 pt-4 pb-1 space-y-2.5">
          {categories?.map((c) => (
            <div key={c.id} className="flex items-center gap-3 bg-white border border-[var(--border)] rounded-2xl p-3.5">
              <span
                className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: c.color }}
              >
                {c.letter}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="text-xs text-[var(--muted)] mt-0.5">This month: {formatINR(c.monthSpend)}</div>
              </div>
              <button type="button" aria-label={`Delete ${c.name}`} onClick={() => handleDelete(c.id)} className="p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A978D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-1 14a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 mx-6 mt-1.5 mb-5 h-12 w-[calc(100%-48px)] rounded-2xl text-[14px] font-bold"
          style={{ border: '1.5px dashed #3F6B52', color: '#3F6B52' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3F6B52" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add category
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
