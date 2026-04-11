import { useState } from 'react'
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight, Target, TrendingUp, TrendingDown, AlertTriangle,
  Eye, EyeOff,
 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api, Budget, UpsertBudgetBody } from '../lib/api'
import { formatRupiah, MONTH_NAMES } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Field, Select, AmountInput } from '../components/ui/FormField'
import { Skeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'

const now = new Date()

// ── Status helpers ─────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  safe:        { label: 'Aman',     bar: 'bg-mint-400',    text: 'text-mint-500',   bg: 'bg-mint-400/10' },
  warning:     { label: 'Waspada',  bar: 'bg-gold-400',    text: 'text-gold-500',   bg: 'bg-gold-400/10' },
  over_budget: { label: 'Melebihi', bar: 'bg-coral-500',   text: 'text-coral-500',  bg: 'bg-coral-400/10' },
  no_data:     { label: '-',        bar: 'bg-gray-200',    text: 'text-gray-400',   bg: 'bg-gray-100' },
}

function statusConfig(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.no_data
}

function progressPct(planned: number, actual: number) {
  if (planned <= 0) return 0
  return Math.min((actual / planned) * 100, 100)
}

// ── Budget Form ──────────────────────────────────────────────────────────

interface BudgetFormProps {
  month: number; year: number
  onSubmit: (body: UpsertBudgetBody) => Promise<void>
  onClose: () => void
  loading: boolean
  existingCategoryIds: string[]
}

function BudgetForm({ month, year, onSubmit, onClose, loading, existingCategoryIds }: BudgetFormProps) {
  const { data: categoriesData } = useApi(() => api.categories.list())
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount]         = useState('')
  const [frequency, setFrequency]   = useState('monthly')
  const [errors, setErrors]         = useState<Record<string, string>>({})

  const allCategories = [
    ...(categoriesData?.income ?? []),
    ...(categoriesData?.expense ?? []),
  ].filter(c => !existingCategoryIds.includes(c.id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!categoryId)              errs.category = 'Pilih kategori'
    if (!amount || Number(amount) <= 0) errs.amount = 'Nominal wajib diisi'
    if (Object.keys(errs).length) { setErrors(errs); return }
    await onSubmit({ category_id: categoryId, month, year, planned_amount: Number(amount), frequency })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Kategori" required error={errors.category}>
        <Select value={categoryId} onChange={e => setCategoryId(e.target.value)} error={!!errors.category}>
          <option value="" disabled>Pilih kategori</option>
          <optgroup label="Pengeluaran">
            {(categoriesData?.expense ?? []).filter(c => !existingCategoryIds.includes(c.id)).map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </optgroup>
          <optgroup label="Pemasukan">
            {(categoriesData?.income ?? []).filter(c => !existingCategoryIds.includes(c.id)).map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </optgroup>
        </Select>
      </Field>

      <Field label="Target Anggaran" required error={errors.amount}>
        <AmountInput value={amount} onChange={e => setAmount(e.target.value)} error={!!errors.amount} placeholder="0" autoFocus />
      </Field>

      <Field label="Frekuensi" hint="Anggaran tahunan/kuartalan akan dibagi rata per bulan">
        <Select value={frequency} onChange={e => setFrequency(e.target.value)}>
          <option value="monthly">Bulanan</option>
          <option value="quarterly">Kuartalan (÷3 per bulan)</option>
          <option value="yearly">Tahunan (÷12 per bulan)</option>
        </Select>
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button type="submit" disabled={loading || allCategories.length === 0}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold disabled:opacity-50 hover:from-brand-600 hover:to-brand-700 transition-all">
          {loading ? 'Menyimpan...' : 'Simpan Budget'}
        </button>
      </div>
    </form>
  )
}

// ── Copy Budget Modal ──────────────────────────────────────────────────────

interface CopyModalProps {
  toMonth: number; toYear: number
  onSubmit: (fromMonth: number, fromYear: number) => Promise<void>
  onClose: () => void
  loading: boolean
}

function CopyModal({ toMonth, toYear, onSubmit, onClose, loading }: CopyModalProps) {
  const prevM = toMonth === 1 ? 12 : toMonth - 1
  const prevY = toMonth === 1 ? toYear - 1 : toYear
  const [fromMonth, setFromMonth] = useState(prevM)
  const [fromYear, setFromYear]   = useState(prevY)

  const years = Array.from({ length: 3 }, (_, i) => toYear - i)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(fromMonth, fromYear)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">
        Salin semua budget dari bulan tertentu ke{' '}
        <strong className="text-gray-800">{MONTH_NAMES[toMonth - 1]} {toYear}</strong>.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Bulan Sumber">
          <Select value={fromMonth} onChange={e => setFromMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tahun Sumber">
          <Select value={fromYear} onChange={e => setFromYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </Select>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
          Batal
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold disabled:opacity-50 hover:from-brand-600 hover:to-brand-700 transition-all">
          {loading ? 'Menyalin...' : 'Salin Budget'}
        </button>
      </div>
    </form>
  )
}

// ── Budget Row ─────────────────────────────────────────────────────────────

interface BudgetRowProps {
  budget: Budget
  actual: string
  planned: string
  remaining: string
  onEdit: () => void
  onDelete: () => void
}

function BudgetRow({ budget, actual, planned, remaining, onEdit, onDelete }: BudgetRowProps) {
  const cfg  = statusConfig(budget.status)
  const pct  = progressPct(budget.planned_amount, budget.actual_amount)
  const isIncome = budget.category_type === 'income'

  return (
    <div className="p-4 hover:bg-gray-50/60 transition-colors group">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
          {budget.category_icon || (isIncome ? '💰' : '💸')}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-sm font-semibold text-gray-800 truncate">{budget.category_name}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.text, cfg.bg)}>
                {cfg.label}
              </span>
              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-brand-500 hover:bg-brand-50 transition-colors">
                  <Target size={12} />
                </button>
                <button onClick={onDelete} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>
              Realisasi{' '}
              <span className={cn('font-mono font-semibold', isIncome ? 'text-mint-500' : 'text-gray-700')}>
                {actual}
              </span>
            </span>
            <span>
              Target{' '}
              <span className="font-mono font-semibold text-gray-600">
                {planned}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', cfg.bar)}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Remaining */}
          {budget.remaining !== 0 && (
            <p className={cn('text-xs mt-1.5', budget.remaining > 0 ? 'text-mint-500' : 'text-coral-500')}>
              {remaining}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Edit Budget Amount Modal ───────────────────────────────────────────────

function EditBudgetModal({ budget, onSubmit, onClose, loading }: {
  budget: Budget; onSubmit: (b: UpsertBudgetBody) => Promise<void>; onClose: () => void; loading: boolean
}) {
  const [amount, setAmount] = useState(String(budget.planned_amount))
  const [frequency, setFrequency] = useState(budget.frequency)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { setError('Nominal wajib diisi'); return }
    await onSubmit({
      category_id: budget.category_id, month: budget.month,
      year: budget.year, planned_amount: Number(amount), frequency,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <span className="text-2xl">{budget.category_icon}</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">{budget.category_name}</p>
          <p className="text-xs text-gray-400">{budget.category_type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
        </div>
      </div>
      <Field label="Target Anggaran" required error={error}>
        <AmountInput value={amount} onChange={e => setAmount(e.target.value)} error={!!error} autoFocus />
      </Field>
      <Field label="Frekuensi">
        <Select value={frequency} onChange={e => setFrequency(e.target.value)}>
          <option value="monthly">Bulanan</option>
          <option value="quarterly">Kuartalan</option>
          <option value="yearly">Tahunan</option>
        </Select>
      </Field>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
          Batal
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [showBalance, setShowBalance] = useState(() => {
    return localStorage.getItem('showBalance') !== 'false'
  })

  const toggleBalance = () => {
    const newValue = !showBalance
    setShowBalance(newValue)
    localStorage.setItem('showBalance', String(newValue))
  }

  function maskValue(value: string) {
    if (showBalance) return value
    return '••••••'
  }
  const toast = useToast()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())
  const [addOpen, setAddOpen]     = useState(false)
  const [copyOpen, setCopyOpen]   = useState(false)
  const [editTarget, setEditTarget]     = useState<Budget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null)
  const [submitting, setSubmitting]     = useState(false)

  const { data, loading, refetch } = useApi(
    () => api.budgets.get(month, year), [month, year])

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const isNextDisabled = month === now.getMonth() + 1 && year === now.getFullYear()

  const handleUpsert = async (body: UpsertBudgetBody) => {
    setSubmitting(true)
    try {
      await api.budgets.upsert(body)
      toast.success('Budget disimpan')
      setAddOpen(false); setEditTarget(null); refetch()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSubmitting(false) }
  }

  const handleCopy = async (fromMonth: number, fromYear: number) => {
    setSubmitting(true)
    try {
      const result = await api.budgets.copy({ from_month: fromMonth, from_year: fromYear, to_month: month, to_year: year })
      toast.success(`${result.copied_count} budget berhasil disalin`)
      setCopyOpen(false); refetch()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      await api.budgets.delete(deleteTarget.id)
      toast.success('Budget dihapus'); setDeleteTarget(null); refetch()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSubmitting(false) }
  }

  const budgets    = data?.budgets ?? []
  const incomeBudgets  = budgets.filter(b => b.category_type === 'income')
  const expenseBudgets = budgets.filter(b => b.category_type === 'expense')
  const existingCatIds = budgets.map(b => b.category_id)

  const totalExpensePlan   = data?.total_expense_plan ?? 0
  const totalExpenseActual = data?.total_expense_actual ?? 0
  const totalIncomePlan    = data?.total_income_plan ?? 0
  const totalIncomeActual  = data?.total_income_actual ?? 0
  const overBudgetCount    = budgets.filter(b => b.status === 'over_budget').length

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Budget</h1>
          <p className="text-gray-400 text-sm">Rencanakan pengeluaran bulanan kamu</p>
          <button
            onClick={() => toggleBalance()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCopyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Copy size={15} /> Salin
          </button>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow-glow-sm hover:from-brand-600 hover:to-brand-700 transition-all">
            <Plus size={15} /> Tambah
          </button>
        </div>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-card p-4 mb-4 animate-fade-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <p className="font-display font-bold text-gray-900">{MONTH_NAMES[month - 1]}</p>
          <p className="text-xs text-gray-400">{year}</p>
        </div>
        <button onClick={nextMonth} disabled={isNextDisabled}
          className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Summary cards */}
      {!loading && data && (
        <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          {/* Expense summary */}
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-coral-400/15 flex items-center justify-center">
                <TrendingDown size={15} className="text-coral-500" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Pengeluaran</p>
            </div>
            <p className="font-mono font-bold text-gray-900 text-base">{maskValue(formatRupiah(totalExpenseActual))}</p>
            <p className="text-xs text-gray-400 mt-0.5">dari {maskValue(formatRupiah(totalExpensePlan))}</p>
            {totalExpensePlan > 0 && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', totalExpenseActual > totalExpensePlan ? 'bg-coral-500' : 'bg-coral-400')}
                  style={{ width: `${Math.min((totalExpenseActual / totalExpensePlan) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Income summary */}
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-mint-400/15 flex items-center justify-center">
                <TrendingUp size={15} className="text-mint-500" />
              </div>
              <p className="text-xs font-semibold text-gray-500">Pemasukan</p>
            </div>
            <p className="font-mono font-bold text-gray-900 text-base">{maskValue(formatRupiah(totalIncomeActual))}</p>
            <p className="text-xs text-gray-400 mt-0.5">dari {maskValue(formatRupiah(totalIncomePlan))}</p>
            {totalIncomePlan > 0 && (
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-mint-400 rounded-full"
                  style={{ width: `${Math.min((totalIncomeActual / totalIncomePlan) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Over budget warning */}
      {!loading && overBudgetCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-coral-400/8 border border-coral-400/20 rounded-2xl mb-4 animate-fade-up">
          <AlertTriangle size={18} className="text-coral-500 flex-shrink-0" />
          <p className="text-sm text-coral-600 font-medium">
            {overBudgetCount} kategori melebihi budget bulan ini
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-50 last:border-0">
              <div className="flex items-start gap-3 animate-pulse">
                <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expense budgets */}
      {!loading && expenseBudgets.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-4 animate-fade-up" style={{ animationDelay: '160ms', animationFillMode: 'both' }}>
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <TrendingDown size={14} className="text-coral-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pengeluaran</p>
          </div>
          <div className="divide-y divide-gray-50">
            {expenseBudgets.map(b => (
              <BudgetRow key={b.id} budget={b} 
                actual={maskValue(formatRupiah(b.actual_amount))} 
                planned={maskValue(formatRupiah(b.planned_amount))} 
                remaining={b.remaining > 0 
                  ? `Sisa ${maskValue(formatRupiah(b.remaining))}`
                  : `Melebihi ${maskValue(formatRupiah(Math.abs(b.remaining)))}`
                }
                onEdit={() => setEditTarget(b)} onDelete={() => setDeleteTarget(b)} />
            ))}
          </div>
        </div>
      )}

      {/* Income budgets */}
      {!loading && incomeBudgets.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-4 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
            <TrendingUp size={14} className="text-mint-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pemasukan</p>
          </div>
          <div className="divide-y divide-gray-50">
            {incomeBudgets.map(b => (
              <BudgetRow key={b.id} budget={b}
                actual={maskValue(formatRupiah(b.actual_amount))} 
                planned={maskValue(formatRupiah(b.planned_amount))} 
                remaining={b.remaining > 0 
                  ? `Sisa ${maskValue(formatRupiah(b.remaining))}`
                  : `Melebihi ${maskValue(formatRupiah(Math.abs(b.remaining)))}`
                }
                onEdit={() => setEditTarget(b)} onDelete={() => setDeleteTarget(b)} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && budgets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-card animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 text-2xl">🎯</div>
          <p className="font-display font-semibold text-gray-700 mb-1">Belum ada budget</p>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            Buat rencana pengeluaran bulan ini, atau salin dari bulan sebelumnya
          </p>
          <div className="flex gap-3">
            <button onClick={() => setCopyOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
              <Copy size={15} /> Salin Budget
            </button>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
              <Plus size={15} /> Buat Budget
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah Budget">
        <BudgetForm month={month} year={year} existingCategoryIds={existingCatIds}
          onSubmit={handleUpsert} onClose={() => setAddOpen(false)} loading={submitting} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Budget">
        {editTarget && <EditBudgetModal budget={editTarget}
          onSubmit={handleUpsert} onClose={() => setEditTarget(null)} loading={submitting} />}
      </Modal>

      <Modal open={copyOpen} onClose={() => setCopyOpen(false)} title="Salin Budget" size="sm">
        <CopyModal toMonth={month} toYear={year}
          onSubmit={handleCopy} onClose={() => setCopyOpen(false)} loading={submitting} />
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={submitting}
        title="Hapus Budget"
        message={`Hapus budget untuk "${deleteTarget?.category_name}"?`} />
    </div>
  )
}
