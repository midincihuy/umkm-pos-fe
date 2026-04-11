import { useState, useCallback, } from 'react'
import { Plus, Pencil, Trash2, MoreVertical, TrendingUp, Wallet, 
  CreditCard, Smartphone, Eye, EyeOff,  
  ArrowLeft, TrendingDown, ArrowLeftRight,
  ChevronLeft, ChevronRight, Receipt,
 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api, Account, AccountType, CreateAccountBody, UpdateAccountBody } from '../lib/api'
import { formatRupiah, formatDate, getAccountTypeLabel } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Field, Input, AmountInput } from '../components/ui/FormField'
import { Skeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'
import { theme }          from '../lib/theme'


// ── Helpers ────────────────────────────────────────────────────────────────

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { value: 'bank',       label: 'Bank',       icon: CreditCard,  color: 'text-ocean-500',  bg: 'bg-ocean-400/15' },
  { value: 'cash',       label: 'Tunai',      icon: Wallet,      color: 'text-mint-500',   bg: 'bg-mint-400/15' },
  { value: 'ewallet',    label: 'E-Wallet',   icon: Smartphone,  color: 'text-brand-600',  bg: 'bg-brand-400/15' },
  { value: 'investment', label: 'Investasi',  icon: TrendingUp,  color: 'text-gold-500',   bg: 'bg-gold-400/15' },
]

function accountTypeInfo(type: AccountType) {
  return ACCOUNT_TYPES.find(t => t.value === type) ?? ACCOUNT_TYPES[0]
}

// ── Form ───────────────────────────────────────────────────────────────────

interface AccountFormData {
  name: string; type: AccountType; opening_balance: string; icon: string; color: string
}

interface AccountFormErrors { name?: string; opening_balance?: string }

function validateAccountForm(data: AccountFormData): AccountFormErrors {
  const errors: AccountFormErrors = {}
  if (!data.name.trim()) errors.name = 'Nama rekening wajib diisi'
  if (data.opening_balance && isNaN(Number(data.opening_balance)))
    errors.opening_balance = 'Saldo harus berupa angka'
  return errors
}

interface AccountFormProps {
  initial?: Account
  onSubmit: (data: CreateAccountBody | UpdateAccountBody) => Promise<void>
  onClose: () => void
  loading: boolean
}

function AccountForm({ initial, onSubmit, onClose, loading }: AccountFormProps) {
  const [form, setForm] = useState<AccountFormData>({
    name:            initial?.name ?? '',
    type:            initial?.type ?? 'bank',
    opening_balance: initial ? String(initial.opening_balance) : '',
    icon:            initial?.icon ?? '',
    color:           initial?.color ?? '',
  })
  const [errors, setErrors] = useState<AccountFormErrors>({})

  const set = (key: keyof AccountFormData) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateAccountForm(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    const body: CreateAccountBody = {
      name: form.name.trim(),
      type: form.type,
      opening_balance: form.opening_balance ? Number(form.opening_balance) : 0,
    }
    if (form.icon)  (body as CreateAccountBody).icon  = form.icon
    if (form.color) (body as CreateAccountBody).color = form.color

    await onSubmit(body)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Nama Rekening" required error={errors.name}>
        <Input
          value={form.name} onChange={set('name')} error={!!errors.name}
          placeholder="cth: BCA Utama, Dompet Harian"
          autoFocus
        />
      </Field>

      <Field label="Tipe Rekening" required>
        <div className="grid grid-cols-2 gap-2">
          {ACCOUNT_TYPES.map(({ value, label, icon: Icon, bg, color }) => (
            <button
              key={value} type="button"
              onClick={() => setForm(f => ({ ...f, type: value }))}
              className={cn(
                'flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left',
                form.type === value
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white',
              )}
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                <Icon size={15} className={color} />
              </div>
              <span className={cn('text-sm font-medium', form.type === value ? 'text-brand-700' : 'text-gray-600')}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </Field>

      {!initial && (
        <Field label="Saldo Awal" error={errors.opening_balance}
          hint="Isi saldo saat ini jika rekening sudah ada sebelumnya">
          <AmountInput
            value={form.opening_balance} onChange={set('opening_balance')}
            error={!!errors.opening_balance} placeholder="0"
          />
        </Field>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold hover:from-brand-600 hover:to-brand-700 transition-all shadow-glow-sm disabled:opacity-50">
          {loading ? 'Menyimpan...' : initial ? 'Simpan Perubahan' : 'Buat Rekening'}
        </button>
      </div>
    </form>
  )
}

// ── Account Card ──────────────────────────────────────────────────────────

interface AccountCardProps {
  account: Account
  balance: string
  onEdit: () => void
  onDelete: () => void
  onViewTransactions:  () => void
  isSelected:          boolean
}

function AccountCard({ account, balance, onEdit, onDelete, onViewTransactions, isSelected }: AccountCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const info = accountTypeInfo(account.type)
  const Icon = info.icon

  return (
    <div className={cn(
            'bg-white rounded-2xl p-5 shadow-card transition-all relative group cursor-pointer',
            isSelected
              ? cn('ring-2 shadow-card-hover', theme.badgeBorder.replace('border-', 'ring-'))
              : 'hover:shadow-card-hover',
          )}
          onClick={onViewTransactions}
          >
      {/* Menu button */}
      <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-9 z-20 w-36 bg-white rounded-xl shadow-card-hover border border-gray-100 overflow-hidden py-1">
              <button
                onClick={() => { onViewTransactions(); setMenuOpen(false) }}
                className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors', theme.badgeText, theme.navHoverBg)}
              >
                <Receipt size={14} /> Lihat Transaksi
              </button>
              <button onClick={() => { onEdit(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Pencil size={14} /> Edit
              </button>
              <button onClick={() => { onDelete(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </>
        )}
      </div>

      {/* Icon + type */}
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4', info.bg)}>
        <Icon size={20} className={info.color} />
      </div>

      <p className="text-xs text-gray-400 font-medium mb-0.5">{getAccountTypeLabel(account.type)}</p>
      <h3 className="font-display font-bold text-gray-900 text-base leading-tight mb-3 truncate">{account.name}</h3>

      <div>
        <p className="text-xs text-gray-400 mb-0.5">Saldo saat ini</p>
        <p className={cn(
          'font-mono font-bold text-lg leading-tight',
          'text-gray-900',
        )}>
          {balance}
        </p>
      </div>

      {!account.is_active && (
        <span className="absolute top-3 left-3 text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">
          Nonaktif
        </span>
      )}
    </div>
  )
}
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

function txTypeIcon(type: string) {
  if (type === 'income')  return <TrendingUp  size={14} className={theme.txIncomeText} />
  if (type === 'expense') return <TrendingDown size={14} className={theme.txExpenseText} />
  return <ArrowLeftRight size={14} className={theme.txTransferText} />
}

function txTypeBg(type: string) {
  if (type === 'income')  return theme.txIncomeBg
  if (type === 'expense') return theme.txExpenseBg
  return theme.txTransferBg
}

interface AccountTransactionPanelProps {
  account: Account
  onClose: () => void
}

function AccountTransactionPanel({ account, onClose }: AccountTransactionPanelProps) {
  const now     = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())
  const [page,  setPage]  = useState(1)

  const PER_PAGE = 15

  const { data, loading } = useApi(
    () => api.transactions.list({ account_id: account.id, month, year, page, per_page: PER_PAGE }),
    [account.id, month, year, page],
  )

  const txList     = data?.data ?? []
  const meta       = data?.meta
  const totalPages = meta?.total_pages ?? 1

  const prevMonth = () => {
    setPage(1)
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    setPage(1)
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()

  // Hitung ringkasan bulan ini dari transaksi yang ada
  const income  = txList.filter(t => t.balance_impact > 0).reduce((s, t) => s + t.balance_impact, 0)
  const expense = txList.filter(t => t.balance_impact < 0).reduce((s, t) => s + t.balance_impact, 0)

  const info = accountTypeInfo(account.type)
  const Icon = info.icon

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-card animate-fade-up overflow-hidden">

      {/* Panel header */}
      <div className={cn('flex items-center gap-3 px-5 py-4 border-b', theme.sidebarBorder)}>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Account badge */}
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', info.bg)}>
          <Icon size={15} className={info.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-gray-900 text-sm truncate">{account.name}</p>
          <p className="text-xs text-gray-400">{formatRupiah(account.current_balance ?? account.current_balance ?? 0)}</p>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-semibold text-gray-700 w-24 text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button onClick={nextMonth} disabled={isCurrentMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Ringkasan bulan */}
      {txList.length > 0 && (
        <div className={cn('grid grid-cols-3 divide-x px-0 border-b', theme.sidebarBorder)}>
          <div className="px-5 py-3">
            <p className="text-[10px] text-gray-400 mb-0.5">Pemasukan</p>
            <p className={cn('text-sm font-mono font-bold', theme.txIncomeText)}>{formatRupiah(income)}</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[10px] text-gray-400 mb-0.5">Pengeluaran</p>
            <p className={cn('text-sm font-mono font-bold', theme.txExpenseText)}>{formatRupiah(Math.abs(expense))}</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[10px] text-gray-400 mb-0.5">Total Transaksi</p>
            <p className="text-sm font-mono font-bold text-gray-700">{meta?.total ?? txList.length}</p>
          </div>
        </div>
      )}

      {/* Transaction list */}
      {loading ? (
        <div className="divide-y divide-gray-50">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
              <div className="flex-1"><div className="h-3 bg-gray-100 rounded w-32 mb-1.5" /><div className="h-2.5 bg-gray-100 rounded w-20" /></div>
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : txList.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-center">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-3', theme.badgeBg)}>
            <Receipt size={20} className={theme.accentText} />
          </div>
          <p className="text-sm font-semibold text-gray-700">Tidak ada transaksi</p>
          <p className="text-xs text-gray-400 mt-1">{MONTH_NAMES[month - 1]} {year} — rekening ini tidak ada aktivitas</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {txList.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', txTypeBg(tx.type))}>
                {txTypeIcon(tx.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {tx.description || tx.category_name || 'Transaksi'}
                </p>
                <p className="text-xs text-gray-400">
                  {tx.category_name && tx.description ? `${tx.category_name} · ` : ''}{formatDate(tx.date)}
                </p>
              </div>
              <p className={cn(
                'text-sm font-mono font-bold flex-shrink-0',
                tx.balance_impact > 0 ? theme.txIncomeText : theme.txExpenseText,
              )}>
                {tx.balance_impact > 0 ? '+' : ''}{formatRupiah(tx.balance_impact)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={cn('flex items-center justify-between px-5 py-3 border-t', theme.sidebarBorder)}>
          <p className="text-xs text-gray-400">
            Hal {page} dari {totalPages} · {meta?.total} transaksi
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


// ── Page ──────────────────────────────────────────────────────────────────

export default function AccountsPage() {
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
  const { data, loading, refetch } = useApi(() => api.accounts.list())
  const [selectedAccountId,  setSelectedAccountId]  = useState<string | null>(null)
  
  const selectedAccount = data?.data.find(a => a.id === selectedAccountId) ?? null

  const handleSelectAccount = useCallback((id: string) => {
    setSelectedAccountId(prev => prev === id ? null : id)
  }, [])
  
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Account | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (body: CreateAccountBody) => {
    setSubmitting(true)
    try {
      await api.accounts.create(body)
      toast.success('Rekening berhasil dibuat')
      setCreateOpen(false)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally { setSubmitting(false) }
  }

  const handleEdit = async (body: UpdateAccountBody) => {
    if (!editTarget) return
    setSubmitting(true)
    try {
      await api.accounts.update(editTarget.id, body)
      toast.success('Rekening diperbarui')
      setEditTarget(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      await api.accounts.delete(deleteTarget.id)
      toast.success('Rekening dihapus')
      if (selectedAccountId === deleteTarget.id) setSelectedAccountId(null)
      setDeleteTarget(null)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally { setSubmitting(false) }
  }

  const accounts = data?.data ?? []
  const activeAccounts   = accounts.filter(a => a.is_active)
  const inactiveAccounts = accounts.filter(a => !a.is_active)

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Rekening</h1>
          <p className="text-gray-400 text-sm">Kelola semua rekening keuangan kamu</p>
          <p className="text-gray-400 text-sm">
            {selectedAccount
              ? <span>Klik rekening untuk lihat transaksi · <button className={cn('font-medium', theme.linkText)} onClick={() => setSelectedAccountId(null)}>Sembunyikan</button></span>
              : 'Klik rekening untuk melihat transaksi'
            }
          </p>
          <button
            onClick={() => toggleBalance()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow-glow-sm hover:from-brand-600 hover:to-brand-700 transition-all"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {/* Total */}
      {!loading && data && (
        <div className="bg-gradient-to-br from-brand-500 to-ocean-500 rounded-2xl p-5 mb-6 text-white animate-fade-up shadow-glow" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
          <p className="text-white/70 text-sm mb-1">Total Semua Aset</p>
          <p className="font-display font-bold text-3xl">{maskValue(formatRupiah(data.total_balance))}</p>
          <p className="text-white/60 text-xs mt-1">{activeAccounts.length} rekening aktif</p>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-card animate-pulse">
              <Skeleton className="w-11 h-11 rounded-xl mb-4" />
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-6 w-28" />
            </div>
          ))}
        </div>
      )}

      {/* Active accounts */}
      {!loading && activeAccounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {activeAccounts.map((acc, i) => (
            <div key={acc.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
              <AccountCard
                account={acc}
                balance={maskValue(formatRupiah(acc.current_balance))}
                onEdit={() => setEditTarget(acc)}
                onDelete={() => setDeleteTarget(acc)}
                onViewTransactions={() => handleSelectAccount(acc.id)}
                isSelected={acc.id === selectedAccountId}
              />
            </div>
          ))}
        </div>
      )}

      {/* Inactive accounts */}
      {!loading && inactiveAccounts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Nonaktif</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 opacity-60">
            {inactiveAccounts.map(acc => (
              <AccountCard
                key={acc.id} account={acc}
                balance={maskValue(formatRupiah(acc.current_balance))}
                onEdit={() => setEditTarget(acc)}
                onDelete={() => setDeleteTarget(acc)}
                onViewTransactions={() => handleSelectAccount(acc.id)}
                isSelected={acc.id === selectedAccountId}
              />
            ))}
          </div>
        </div>
      )}
      {/* Panel transaksi per rekening */}
      {selectedAccount && (
        <AccountTransactionPanel
          key={selectedAccount.id}
          account={selectedAccount}
          onClose={() => setSelectedAccountId(null)}
        />
      )}
      {/* Empty */}
      {!loading && accounts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 text-2xl">🏦</div>
          <p className="font-display font-semibold text-gray-700 mb-1">Belum ada rekening</p>
          <p className="text-gray-400 text-sm mb-6">Tambahkan rekening pertamamu untuk mulai mencatat</p>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
            <Plus size={16} /> Tambah Rekening
          </button>
        </div>
      )}

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Rekening">
        <AccountForm onSubmit={handleCreate as (b: CreateAccountBody | UpdateAccountBody) => Promise<void>} onClose={() => setCreateOpen(false)} loading={submitting} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Rekening">
        {editTarget && (
          <AccountForm
            initial={editTarget}
            onSubmit={handleEdit as (b: CreateAccountBody | UpdateAccountBody) => Promise<void>}
            onClose={() => setEditTarget(null)}
            loading={submitting}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitting}
        title="Hapus Rekening"
        message={`Yakin ingin menghapus rekening "${deleteTarget?.name}"? Rekening akan dinonaktifkan jika sudah ada transaksi.`}
        confirmLabel="Hapus"
      />
    </div>
  )
}
