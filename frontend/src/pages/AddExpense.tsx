import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Category, PaymentMethod } from '../api/types'

const PAYMENTS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'upi', label: 'UPI' },
]

function todayISO() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

export default function AddExpense() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [merchant, setMerchant] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('upi')
  const [date] = useState(todayISO())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Category[]>('/categories').then((res) => {
      setCategories(res.data)
      if (res.data.length > 0) setCategoryId(res.data[0].id)
    })
  }, [])

  const canSave = Number(amount) > 0 && categoryId !== null && !saving

  async function handleSave() {
    if (!canSave || categoryId === null) return
    setSaving(true)
    setError(null)
    try {
      await api.post('/expenses', {
        amount: Number(amount),
        category_id: categoryId,
        note: note || null,
        merchant: merchant || null,
        payment_method: payment,
        date,
      })
      navigate('/')
    } catch {
      setError('Could not save. Check the amount and try again.')
      setSaving(false)
    }
  }

  return (
    <div className="w-full h-full bg-[var(--bg)] text-[var(--ink)] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3.5 px-6 pt-6 safe-top">
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-[var(--border)] flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-[17px] font-bold">Add Expense</div>
        </div>

        <div className="flex flex-col items-center pt-7 px-6 pb-2">
          <label htmlFor="amount" className="text-[12px] text-[var(--muted)] mb-1.5">
            Amount
          </label>
          <div className="flex items-baseline gap-1">
            <span className="text-[26px] font-bold text-[var(--muted)]">₹</span>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-40 text-[46px] font-extrabold text-center border-none bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="text-[14px] font-bold mx-6 mt-4 mb-2.5">Category</div>
        <div className="grid grid-cols-4 gap-2.5 px-6">
          {categories.map((cat) => {
            const selected = cat.id === categoryId
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl"
                style={{
                  border: selected ? '2px solid #1C1B18' : '2px solid transparent',
                  background: selected ? '#EDEAE1' : 'transparent',
                }}
              >
                <span
                  className="w-[34px] h-[34px] rounded-full text-white flex items-center justify-center font-bold text-[13px]"
                  style={{ background: cat.color }}
                >
                  {cat.letter}
                </span>
                <span className="text-[10.5px] font-semibold">{cat.name}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between mx-6 mt-5 p-3.5 bg-white border border-[var(--border)] rounded-2xl">
          <div>
            <div className="text-[11px] text-[var(--muted)]">Date</div>
            <div className="text-[14px] font-semibold mt-0.5">
              {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C1B18" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
            <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
            <line x1="8" y1="3" x2="8" y2="6.5" />
            <line x1="16" y1="3" x2="16" y2="6.5" />
          </svg>
        </div>

        <div className="mx-6 mt-4">
          <label htmlFor="merchant" className="text-[12px] text-[var(--muted)]">
            Merchant (optional)
          </label>
          <input
            id="merchant"
            name="merchant"
            type="text"
            placeholder="e.g. Swiggy"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full mt-1.5 p-3.5 bg-white border border-[var(--border)] rounded-2xl text-sm"
          />
        </div>

        <div className="mx-6 mt-4 mb-1">
          <label htmlFor="note" className="text-[12px] text-[var(--muted)]">
            Note
          </label>
          <input
            id="note"
            name="note"
            type="text"
            placeholder="e.g. Lunch with team"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full mt-1.5 p-3.5 bg-white border border-[var(--border)] rounded-2xl text-sm"
          />
        </div>

        <div className="text-[14px] font-bold mx-6 mt-5 mb-2.5">Paid with</div>
        <div className="flex gap-2.5 px-6">
          {PAYMENTS.map((p) => {
            const selected = p.id === payment
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPayment(p.id)}
                className="px-[18px] py-2.5 rounded-xl text-[13px] font-semibold"
                style={{
                  border: selected ? '1.5px solid #1C1B18' : '1.5px solid var(--border)',
                  background: selected ? '#1C1B18' : '#FFFFFF',
                  color: selected ? '#FFFFFF' : '#1C1B18',
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        {error && <div className="mx-6 mt-4 text-sm text-red-600">{error}</div>}
      </div>

      <div className="flex-shrink-0 safe-bottom p-4 pb-5 bg-[var(--bg)] border-t border-[var(--border)]">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="w-full h-[50px] rounded-2xl bg-[#1C1B18] text-white text-[15px] font-bold disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Expense'}
        </button>
      </div>
    </div>
  )
}
