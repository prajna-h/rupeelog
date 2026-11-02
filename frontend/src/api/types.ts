export type PaymentMethod = 'cash' | 'card' | 'upi' | 'other'

export interface Category {
  id: number
  name: string
  letter: string
  color: string
}

export interface Expense {
  id: number
  amount: number
  category_id: number
  note: string | null
  merchant: string | null
  payment_method: PaymentMethod
  date: string
  category: Category
}

export interface ExpenseInput {
  amount: number
  category_id: number
  note?: string | null
  merchant?: string | null
  payment_method: PaymentMethod
  date: string
}

export interface CategoryBreakdown {
  category_id: number
  name: string
  letter: string
  color: string
  amount: number
  pct: number
}

export interface Summary {
  period: 'weekly' | 'monthly'
  label: string
  total: number
  previous_total: number
  delta_pct: number | null
  breakdown: CategoryBreakdown[]
}

export interface Dashboard {
  month_total: number
  week_total: number
  top_category: string | null
  monthly_budget: number | null
  recent: Expense[]
}
