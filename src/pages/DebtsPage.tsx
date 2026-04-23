import { useState } from 'react'
import {
  Plus, Trash2, ChevronDown, ChevronUp,
  TrendingDown, TrendingUp, XCircle, CheckCircle,
} from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api, Debt, DebtType, DebtStatus, Account, CreateDebtBody, CreateDebtPaymentBody } from '../lib/api'
import { formatRupiah, formatDate } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Field, Input, Select, AmountInput } from '../components/ui/FormField'
import { Skeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'
import { AccountSelectCompact } from '../components/ui/AccountSelect'
import { theme } from '../lib/theme'

const now = new Date()
// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(status: DebtStatus) {
  const map: Record<DebtStatus, { label: string; className: string }> = {
    active:    { label: 'Aktif',     className: 'bg-ocean-400/15 text-ocean-500' },
    paid:      { label: 'Lunas',     className: 'bg-mint-400/15 text-mint-500' },
    cancelled: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-400' },
  }
  const s = map[status] ?? map.active
  return <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', s.className)}>{s.label}</span>
}

// ── Create Debt Form ──────────────────────────────────────────────────────────

function CreateDebtForm({ accounts, onSubmit, onClose, loading }: {
  accounts: Account[]; onSubmit: (b: CreateDebtBody) => Promise<void>; onClose: () => void; loading: boolean
}) {
  const parts = now.toLocaleDateString('id-ID').split('/')
  const today = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`

  const [form, setForm] = useState({
    type: 'debt' as DebtType, contact_name: '', total_amount: '', account_id: '',
    start_date: today, due_date: '', notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.contact_name.trim()) errs.contact_name = 'Nama kontak wajib diisi'
    if (!form.total_amount || Number(form.total_amount) <= 0) errs.total_amount = 'Jumlah wajib diisi'
    if (!form.account_id) errs.account_id = 'Pilih rekening'
    if (Object.keys(errs).length) { setErrors(errs); return }
    await onSubmit({
      type: form.type, contact_name: form.contact_name.trim(),
      total_amount: Number(form.total_amount), account_id: form.account_id,
      start_date: form.start_date,
      due_date: form.due_date || undefined,
      notes: form.notes || undefined,
    })
  }

  const activeAccounts = accounts.filter(a => a.is_active)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {activeAccounts.map(a => (
            <input type="hidden" value={a.opening_balance}/>
      ))}
      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(['debt', 'receivable'] as DebtType[]).map(t => (
          <button key={t} type="button"
            onClick={() => setForm(f => ({ ...f, type: t }))}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
              form.type === t
                ? t === 'debt'
                  ? 'border-coral-500 bg-coral-400/10 text-coral-500'
                  : 'border-mint-500 bg-mint-400/10 text-mint-500'
                : 'border-gray-100 text-gray-400 hover:border-gray-200',
            )}>
            {t === 'debt' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
            {t === 'debt' ? 'Hutang' : 'Piutang'}
          </button>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-xs text-gray-500">
        {form.type === 'debt'
          ? '💡 Saldo rekening akan bertambah (terima pinjaman)'
          : '💡 Saldo rekening akan berkurang (memberi pinjaman)'}
      </div>

      <Field label="Nama Kontak" required error={errors.contact_name}>
        <Input value={form.contact_name} onChange={set('contact_name')} placeholder="Nama orang / perusahaan" error={!!errors.contact_name} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Jumlah" required error={errors.total_amount}>
          <AmountInput value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} placeholder="0" error={!!errors.total_amount} />
        </Field>
        <Field label="Rekening" required error={errors.account_id}>
          <AccountSelectCompact
              value={form.account_id}
              onChange={id => setForm(f => ({ ...f, account_id: id }))}
              placeholder="Pilih rekening"
              // showUsage={true}
              // excludeId={form.to_account_id}   // opsional: exclude rekening tertentu
              error={!!errors.account_id}
            />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tanggal Mulai">
          <Input type="date" value={form.start_date} max={today} onChange={set('start_date')} />
        </Field>
        <Field label="Jatuh Tempo" hint="Opsional">
          <Input type="date" value={form.due_date} onChange={set('due_date')} min={form.start_date} />
        </Field>
      </div>

      <Field label="Catatan">
        <Input value={form.notes} onChange={set('notes')} placeholder="Opsional..." />
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 hover:-translate-y-0.5"
          style={{ background: theme.btnBg }}
          >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}

// ── Add Payment Form ──────────────────────────────────────────────────────────

function AddPaymentForm({ debt, accounts, onSubmit, onClose, loading }: {
  debt: Debt; accounts: Account[]; onSubmit: (b: CreateDebtPaymentBody) => Promise<void>; onClose: () => void; loading: boolean
}) {
  const parts = now.toLocaleDateString('id-ID').split('/')
  const today = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`

  const [form, setForm] = useState({ account_id: '', amount: '', date: today, notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.account_id) errs.account_id = 'Pilih rekening'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Jumlah wajib diisi'
    if (Number(form.amount) > debt.remaining_amount) errs.amount = `Melebihi sisa (${formatRupiah(debt.remaining_amount)})`
    if (Object.keys(errs).length) { setErrors(errs); return }
    await onSubmit({ account_id: form.account_id, amount: Number(form.amount), date: form.date, notes: form.notes || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-3 text-sm">
        <p className="text-gray-500 text-xs mb-1">Sisa kewajiban</p>
        <p className="font-mono font-bold text-gray-900">{formatRupiah(debt.remaining_amount)}</p>
      </div>

      <Field label="Rekening" required error={errors.account_id}>
        <Select value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))} error={!!errors.account_id}>
          <option value="">Pilih rekening</option>
          {accounts.filter(a => a.is_active).map(a => <option key={a.id} value={a.id}>{a.icon} {a.name} ({formatRupiah(a.current_balance)})</option>)}
        </Select>
      </Field>

      <Field label="Jumlah Cicilan" required error={errors.amount}>
        <AmountInput value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" error={!!errors.amount} />
      </Field>

      <Field label="Tanggal">
        <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} max={today} />
      </Field>

      <Field label="Catatan">
        <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Opsional..." />
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
        <button type="submit" disabled={loading}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50',
            debt.type === 'debt' ? 'bg-coral-500 hover:bg-coral-400' : 'bg-mint-500 hover:bg-mint-400',
          )}>
          {loading ? 'Menyimpan...' : 'Catat Cicilan'}
        </button>
      </div>
    </form>
  )
}

// ── Debt Card ─────────────────────────────────────────────────────────────────

function DebtCard({ debt, accounts, onRefetch }: { debt: Debt; accounts: Account[]; onRefetch: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmDelPayment, setConfirmDelPayment] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { success, error: toastError } = useToast()

  const isDebt = debt.type === 'debt'
  const typeColor = isDebt ? 'text-coral-500' : 'text-mint-500'
  const typeBg    = isDebt ? 'bg-coral-400/15' : 'bg-mint-400/15'

  const handlePayment = async (body: CreateDebtPaymentBody) => {
    setSaving(true)
    try {
      await api.debts.createPayment(debt.id, body)
      success('Cicilan berhasil dicatat')
      setShowPayment(false)
      onRefetch()
    } catch (e) { toastError((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleCancel = async () => {
    setSaving(true)
    try {
      await api.debts.cancel(debt.id)
      success('Dibatalkan')
      setConfirmCancel(false)
      onRefetch()
    } catch (e) { toastError((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleDelPayment = async () => {
    if (!confirmDelPayment) return
    setSaving(true)
    try {
      await api.debts.deletePayment(debt.id, confirmDelPayment)
      success('Cicilan dihapus')
      setConfirmDelPayment(null)
      onRefetch()
    } catch (e) { toastError((e as Error).message) }
    finally { setSaving(false) }
  }

  const progressPct = Math.min(debt.progress_pct, 100)

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', typeBg)}>
            {isDebt ? <TrendingDown size={18} className={typeColor} /> : <TrendingUp size={18} className={typeColor} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="font-display font-bold text-gray-900 text-sm">{debt.contact_name}</p>
              {statusBadge(debt.status)}
              <span className={cn('text-xs font-semibold', typeColor)}>{isDebt ? 'Hutang' : 'Piutang'}</span>
            </div>
            <p className="text-xs text-gray-400">
              Mulai {formatDate(debt.start_date)}
              {debt.due_date && ` · Jatuh tempo ${formatDate(debt.due_date)}`}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={cn('font-mono font-bold text-sm', typeColor)}>{formatRupiah(debt.remaining_amount)}</p>
            <p className="text-xs text-gray-400">dari {formatRupiah(debt.total_amount)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{progressPct.toFixed(0)}% terbayar</span>
            <span>{formatRupiah(debt.paid_amount)} dari {formatRupiah(debt.total_amount)}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', isDebt ? 'bg-coral-500' : 'bg-mint-500')}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        {debt.status === 'active' && (
          <div className="flex gap-2">
            <button onClick={() => setShowPayment(true)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-colors',
                isDebt
                  ? 'bg-coral-400/10 text-coral-500 hover:bg-coral-400/20'
                  : 'bg-mint-400/10 text-mint-500 hover:bg-mint-400/20',
              )}>
              + Catat Cicilan
            </button>
            <button onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:bg-gray-50 transition-colors">
              {debt.payments?.length} cicilan
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <button onClick={() => setConfirmCancel(true)}
              className="p-2 rounded-xl text-gray-300 hover:text-coral-500 hover:bg-red-50 transition-colors">
              <XCircle size={14} />
            </button>
          </div>
        )}
        {debt.status !== 'active' && debt.payments?.length > 0 && (
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-1">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {debt.payments?.length} cicilan
          </button>
        )}
      </div>

      {/* Payments list */}
      {expanded && debt.payments?.length > 0 && (
        <div className="border-t border-gray-50">
          {debt.payments.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group">
              <CheckCircle size={14} className={isDebt ? 'text-coral-400' : 'text-mint-400'} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700">{formatDate(p.date)}</p>
                {p.notes && <p className="text-xs text-gray-400 truncate">{p.notes}</p>}
              </div>
              <p className={cn('font-mono font-semibold text-sm', isDebt ? 'text-coral-500' : 'text-mint-500')}>
                {formatRupiah(p.amount)}
              </p>
              <button onClick={() => setConfirmDelPayment(p.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-coral-500 hover:bg-red-50">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)}
        title={`Catat Cicilan — ${debt.contact_name}`} size="sm">
        <AddPaymentForm debt={debt} accounts={accounts} onSubmit={handlePayment} onClose={() => setShowPayment(false)} loading={saving} />
      </Modal>

      <ConfirmDialog open={confirmCancel} onClose={() => setConfirmCancel(false)} onConfirm={handleCancel}
        title="Batalkan Hutang/Piutang" loading={saving} confirmLabel="Ya, Batalkan"
        message="Hutang/piutang akan ditandai sebagai dibatalkan. Tindakan ini tidak dapat diurungkan." />

      <ConfirmDialog open={!!confirmDelPayment} onClose={() => setConfirmDelPayment(null)} onConfirm={handleDelPayment}
        title="Hapus Cicilan" loading={saving} confirmLabel="Hapus"
        message="Cicilan akan dihapus dan saldo rekening dikembalikan." />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type FilterType   = 'all' | 'debt' | 'receivable'
type FilterStatus = 'active' | 'paid' | 'cancelled'

export default function DebtsPage() {
  const [filterType,   setFilterType]   = useState<FilterType>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active')
  const [showCreate, setShowCreate]     = useState(false)
  const [saving, setSaving]             = useState(false)
  const { success, error: toastError }  = useToast()

  const { data, loading, refetch } = useApi(
    () => api.debts.list({
      type:   filterType === 'all' ? undefined : filterType,
      status: filterStatus,
    }),
    [filterType, filterStatus],
  )

  const { data: accountData } = useApi(() => api.accounts.list())
  const accounts = accountData?.data ?? []
  const debts    = data?.data ?? []

  const handleCreate = async (body: CreateDebtBody) => {
    setSaving(true)
    try {
      await api.debts.create(body)
      success('Hutang/piutang berhasil dicatat')
      setShowCreate(false)
      refetch()
    } catch (e) {
      toastError((e as Error).message || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const TYPES:   { value: FilterType;   label: string }[] = [{ value: 'all', label: 'Semua' }, { value: 'debt', label: 'Hutang' }, { value: 'receivable', label: 'Piutang' }]
  const STATUSES: { value: FilterStatus; label: string }[] = [{ value: 'active', label: 'Aktif' }, { value: 'paid', label: 'Lunas' }, { value: 'cancelled', label: 'Dibatalkan' }]

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Hutang & Piutang</h1>
          <p className="text-gray-400 text-sm">Kelola kewajiban keuangan</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm hover:-translate-y-0.5"
          style={{ background: theme.btnBg }}
          >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {/* Summary banner */}
      {data && (data.total_debt > 0 || data.total_receivable > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-4 animate-fade-up" style={{ animationDelay: '40ms', animationFillMode: 'both' }}>
          <div className="bg-white rounded-2xl shadow-card p-4">
            <p className="text-xs text-gray-400 mb-1">Total Hutang Aktif</p>
            <p className="font-mono font-bold text-coral-500 text-lg">{formatRupiah(data.total_debt)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-4">
            <p className="text-xs text-gray-400 mb-1">Total Piutang Aktif</p>
            <p className="font-mono font-bold text-mint-500 text-lg">{formatRupiah(data.total_receivable)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 animate-fade-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
        <div className="flex rounded-xl shadow-card p-1 gap-1">
          {TYPES.map(({ value, label }) => (
            <button key={value} onClick={() => setFilterType(value)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filterType === value ? 'text-white' : 'text-gray-400 hover:text-gray-600')} 
                style={filterType === value ? { background: theme.btnBg } : {}}
                >
              {label}
            </button>
          ))}
        </div>
        <div className="flex bg-white rounded-xl shadow-card p-1 gap-1">
          {STATUSES.map(({ value, label }) => (
            <button key={value} onClick={() => setFilterStatus(value)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filterStatus === value ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 animate-fade-up" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
        {loading ? (
          [1,2].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-24" /></div>
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))
        ) : debts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card flex flex-col items-center py-16 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <p className="font-display font-bold text-gray-900 mb-1">
              {filterStatus === 'active' ? 'Tidak ada hutang/piutang aktif' : `Tidak ada data ${filterStatus}`}
            </p>
            <p className="text-sm text-gray-400 mb-5">Catat pinjaman atau hutang kamu di sini</p>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors hover:-translate-y-0.5"
              style={{ background: theme.btnBg }}
              >
              <Plus size={16} /> Tambah
            </button>
          </div>
        ) : (
          debts.map(d => (
            <DebtCard key={d.id} debt={d} accounts={accounts} onRefetch={refetch} />
          ))
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Catat Hutang / Piutang">
        <CreateDebtForm accounts={accounts} onSubmit={handleCreate} onClose={() => setShowCreate(false)} loading={saving} />
      </Modal>
    </div>
  )
}
