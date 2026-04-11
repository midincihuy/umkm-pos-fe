import { getCurrentUser } from './google-auth'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/v1'

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = getCurrentUser()
  const token = localStorage.getItem('google_auth_token')
  if (!user || !token) throw new Error('Tidak terautentikasi')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Terjadi kesalahan' }))
    throw new Error(err.message ?? 'Terjadi kesalahan')
  }
  const json = await res.json()
  return json.data as T
}

export const api = {
  accounts: {
    list: () => request<AccountList>('/accounts'),
    create: (body: CreateAccountBody) =>
      request<Account>('/accounts', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: UpdateAccountBody) =>
      request<Account>(`/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/accounts/${id}`, { method: 'DELETE' }),
  },
  transactions: {
    list: (params?: TransactionParams) => {
      const q = new URLSearchParams()
      if (params?.month)      q.set('month',       String(params.month))
      if (params?.year)       q.set('year',        String(params.year))
      if (params?.account_id) q.set('account_id',  params.account_id)
      if (params?.page)       q.set('page',        String(params.page))
      if (params?.type)       q.set('type',        String(params.type))
      if (params?.search)     q.set('search',      String(params.search))
      q.set('per_page', String(params?.per_page ?? 20))
      return request<TransactionListResponse>(`/transactions?${q}`)
    },
    create: (body: CreateTransactionBody) =>
      request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: UpdateTransactionBody) =>
      request<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/transactions/${id}`, { method: 'DELETE' }),
  },
  budgets: {
    get: (month: number, year: number) =>
      request<BudgetSummary>(`/budgets?month=${month}&year=${year}`),
    upsert: (body: UpsertBudgetBody) =>
      request<Budget>('/budgets', { method: 'POST', body: JSON.stringify(body) }),
    copy: (body: CopyBudgetBody) =>
      request<CopyBudgetResult>('/budgets/copy', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/budgets/${id}`, { method: 'DELETE' }),
  },
  reports: {
    summary: (month: number, year: number) =>
      request<MonthlySummary>(`/reports/summary?month=${month}&year=${year}`),
    expenseBreakdown: (month: number, year: number) =>
      request<Breakdown>(`/reports/expense-breakdown?month=${month}&year=${year}`),
    incomeBreakdown: (month: number, year: number) =>
      request<Breakdown>(`/reports/income-breakdown?month=${month}&year=${year}`),
    trend: (months?: number) =>
      request<TrendResp>(`/reports/trend?months=${months ?? 12}`),
    netWorth: () => request<NetWorth>('/reports/net-worth'),
  },
  transfers: {
    list: (params?: { month?: number; year?: number; account_id?: string; page?: number }) => {
      const q = new URLSearchParams()
      if (params?.month)      q.set('month',      String(params.month))
      if (params?.year)       q.set('year',       String(params.year))
      if (params?.account_id) q.set('account_id', params.account_id)
      if (params?.page)       q.set('page',       String(params?.page ?? 1))
      q.set('per_page', '20')
      return request<TransferListResponse>(`/transfers?${q}`)
    },
    create: (body: CreateTransferBody) =>
      request<Transfer>('/transfers', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/transfers/${id}`, { method: 'DELETE' }),
  },
  debts: {
    list: (params?: { type?: string; status?: string; page?: number }) => {
      const q = new URLSearchParams()
      if (params?.type)   q.set('type',   params.type)
      if (params?.status) q.set('status', params.status)
      q.set('page', String(params?.page ?? 1))
      q.set('per_page', '20')
      return request<DebtListResponse>(`/debts?${q}`)
    },
    create: (body: CreateDebtBody) =>
      request<Debt>('/debts', { method: 'POST', body: JSON.stringify(body) }),
    cancel: (id: string) =>
      request<void>(`/debts/${id}/cancel`, { method: 'POST' }),
    createPayment: (id: string, body: CreateDebtPaymentBody) =>
      request<{ payment: DebtPayment; debt: Debt; is_fully_paid: boolean }>(`/debts/${id}/payments`, { method: 'POST', body: JSON.stringify(body) }),
    deletePayment: (debtId: string, paymentId: string) =>
      request<void>(`/debts/${debtId}/payments/${paymentId}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request<CategoryList>('/categories'),
    create: (body: { name: string; type: string; icon?: string; color?: string }) =>
      request<Category>('/categories', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: { name?: string; icon?: string; color?: string }) =>
      request<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`/categories/${id}`, { method: 'DELETE' }),
  },
  reconciliations: {
    list: (accountId?: string) => {
      const q = accountId ? `?account_id=${accountId}` : ''
      return request<CashAdjustment[]>(`/reconciliations${q}`)
    },
    preview: (body: { account_id: string; actual_balance: number }) =>
      request<ReconciliationPreview>('/reconciliations/preview', { method: 'POST', body: JSON.stringify(body) }),
    create: (body: CreateReconciliationBody) =>
      request<CashAdjustment>('/reconciliations', { method: 'POST', body: JSON.stringify(body) }),
  },
  profile: {
    me: () => request<UserProfile>('/auth/me'),
    update: (body: { name?: string; currency?: string }) =>
      request<UserProfile>('/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
  },
}

// ── Types ──────────────────────────────────────────────────────────────────
export type AccountType = 'bank' | 'cash' | 'ewallet' | 'investment'
export type TransactionType = 'income' | 'expense' | 'transfer' | 'debt_payment' | 'opening_balance' | 'adjustment'
export type CategoryType = 'income' | 'expense'

export interface UserProfile {
  id: string; name: string; email: string; currency: string
}
export interface Account {
  id: string; name: string; type: AccountType
  opening_balance: number; current_balance: number
  icon: string; color: string; is_active: boolean; created_at: string
}
export interface AccountList { data: Account[]; total_balance: number }
export interface CreateAccountBody {
  name: string; type: AccountType; opening_balance?: number; icon?: string; color?: string
}
export interface UpdateAccountBody {
  name?: string; icon?: string; color?: string; is_active?: boolean
}

export interface Category {
  id: string; name: string; type: CategoryType
  icon: string; color: string; is_system: boolean; is_active: boolean
}
export interface CategoryList { income: Category[]; expense: Category[] }

export interface Transaction {
  id: string; account_id: string; account_name: string
  category_id: string | null; category_name: string | null
  type: TransactionType; amount: number; balance_impact: number
  date: string; description: string; notes: string; created_at: string
}
export interface TransactionListResponse {
  data: Transaction[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}
export interface TransactionParams {
  month?: number; year?: number; account_id?: string; 
  page?: number; per_page?: number; 
  type?: string; search?: string;
}
export interface CreateTransactionBody {
  account_id: string; category_id: string; type: 'income' | 'expense'
  amount: number; date: string; description?: string; notes?: string
}
export interface UpdateTransactionBody {
  category_id?: string; amount?: number; date?: string
  description?: string; notes?: string
}

export interface Budget {
  id: string; category_id: string; category_name: string
  category_icon: string; category_type: CategoryType
  month: number; year: number
  planned_amount: number; monthly_equiv: number
  actual_amount: number; remaining: number
  frequency: string; status: string
}
export interface BudgetSummary {
  month: number; year: number
  total_income_plan: number; total_income_actual: number
  total_expense_plan: number; total_expense_actual: number
  surplus_deficit: number; debt_obligations: number
  budgets: Budget[]
}
export interface UpsertBudgetBody {
  category_id: string; month: number; year: number
  planned_amount: number; frequency?: string
}
export interface CopyBudgetBody {
  from_month: number; from_year: number; to_month: number; to_year: number
}
export interface CopyBudgetResult { copied_count: number; skipped_count: number }

export interface MonthlySummary {
  month: number; year: number
  total_income: number; total_expense: number; surplus_deficit: number
  total_assets: number; total_debt: number; total_receivable: number; net_worth: number
}
export interface NetWorth {
  total_assets: number; total_debt: number; total_receivable: number; net_worth: number
  accounts: Account[]
}

export interface BreakdownItem {
  category_id: string; category_name: string; category_icon: string
  amount: number; percentage: number
}
export interface Breakdown {
  month: number; year: number; type: string
  total: number; items: BreakdownItem[]
}
export interface TrendItem {
  year: number; month: number
  income: number; expense: number; surplus: number
}
export interface TrendResp { months: number; items: TrendItem[] }

// ── Transfer ──────────────────────────────────────────────────────────────────
export interface Transfer {
  id: string; from_account_id: string; from_account: string
  to_account_id: string; to_account: string
  amount: number; fee: number; date: string; notes: string; created_at: string
}
export interface TransferListResponse {
  data: Transfer[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}
export interface CreateTransferBody {
  from_account_id: string; to_account_id: string
  amount: number; fee?: number; date: string; notes?: string
}

// ── Debt ─────────────────────────────────────────────────────────────────────
export type DebtType = 'debt' | 'receivable'
export type DebtStatus = 'active' | 'paid' | 'cancelled'

export interface DebtPayment {
  id: string; debt_id: string; account_id: string; account_name: string
  amount: number; date: string; notes: string; created_at: string
}
export interface Debt {
  id: string; type: DebtType; contact_name: string
  total_amount: number; paid_amount: number; remaining_amount: number
  progress_pct: number; start_date: string; due_date?: string
  status: DebtStatus; notes: string; payments: DebtPayment[]; created_at: string
}
export interface DebtListResponse {
  data: Debt[]; total_debt: number; total_receivable: number
  meta: { page: number; per_page: number; total: number; total_pages: number }
}
export interface CreateDebtBody {
  type: DebtType; contact_name: string; total_amount: number
  account_id: string; start_date: string; due_date?: string; notes?: string
}
export interface CreateDebtPaymentBody {
  account_id: string; amount: number; date: string; notes?: string
}

// ── Reconciliation ────────────────────────────────────────────────────────────
export interface ReconciliationPreview {
  account_id: string; account_name: string
  balance_before: number; actual_balance: number
  difference: number; needs_adjustment: boolean; warning?: string
}
export interface CashAdjustment {
  id: string; account_id: string; account_name: string
  balance_before: number; actual_balance: number; difference: number
  date: string; notes: string; created_at: string
}
export interface CreateReconciliationBody {
  account_id: string; actual_balance: number; date: string; notes?: string
}
