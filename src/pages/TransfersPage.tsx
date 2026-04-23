import { useState } from 'react'
import { Plus, Trash2, ArrowRight, ChevronLeft, ChevronRight,
  Eye, EyeOff,
 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api, Transfer, CreateTransferBody } from '../lib/api'
import { formatRupiah, formatDate, MONTH_NAMES } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Field, Input, AmountInput } from '../components/ui/FormField'
import { Skeleton } from '../components/ui/Skeleton'
import { useOnboarding } from '../hooks/useOnboarding'
import AddSecondAccountPrompt from '../components/onboarding/AddSecondAccountPrompt'
import { AccountSelectCompact } from '../components/ui/AccountSelect'
import { theme } from '../lib/theme'

const now = new Date()

// ── Form ──────────────────────────────────────────────────────────────────────

interface FormData {
  from_account_id: string; to_account_id: string
  amount: string; fee: string; date: string; notes: string
}
interface FormErrors {
  from_account_id?: string; to_account_id?: string; amount?: string; same?: string
}

function validate(f: FormData): FormErrors {
  const e: FormErrors = {}
  if (!f.from_account_id) e.from_account_id = 'Pilih rekening asal'
  if (!f.to_account_id)   e.to_account_id   = 'Pilih rekening tujuan'
  if (!f.amount || Number(f.amount) <= 0) e.amount = 'Jumlah wajib diisi'
  if (f.from_account_id && f.from_account_id === f.to_account_id)
    e.same = 'Rekening asal dan tujuan tidak boleh sama'
  return e
}

function TransferForm({
  onSubmit, 
  onClose, 
  loading,
}: {
  onSubmit: (b: CreateTransferBody) => Promise<void>; 
  onClose: () => void; 
  loading: boolean
}) {
  const parts = now.toLocaleDateString('id-ID').split('/')
  const today = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`

  const [form, setForm] = useState<FormData>({
    from_account_id: '', to_account_id: '', amount: '', fee: '', date: today, notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    await onSubmit({
      from_account_id: form.from_account_id,
      to_account_id:   form.to_account_id,
      amount: Number(form.amount),
      fee:    form.fee ? Number(form.fee) : 0,
      date:   form.date,
      notes:  form.notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.same && (
        <div className="bg-coral-400/10 text-coral-500 text-sm rounded-xl px-4 py-2.5">{errors.same}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Dari Rekening" required error={errors.from_account_id}>
          <AccountSelectCompact
            value={form.from_account_id}
            onChange={id => setForm(f => ({ ...f, from_account_id: id }))}
            placeholder="Pilih rekening"
            // showUsage={true}
            excludeId={form.to_account_id}   // opsional: exclude rekening tertentu
            error={!!errors.from_account_id}
          />
        </Field>
        <Field label="Ke Rekening" required error={errors.to_account_id}>
          <AccountSelectCompact
            value={form.to_account_id}
            onChange={id => setForm(f => ({ ...f, to_account_id: id }))}
            placeholder="Pilih rekening"
            // showUsage={true}
            excludeId={form.from_account_id}   // opsional: exclude rekening tertentu
            error={!!errors.to_account_id}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Jumlah Transfer" required error={errors.amount}>
          <AmountInput value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} error={!!errors.amount} placeholder="0" />
        </Field>
        <Field label="Biaya Admin" hint="Opsional">
          <AmountInput value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="0" />
        </Field>
      </div>

      <Field label="Tanggal" required>
        <Input type="date" value={form.date} onChange={set('date')} max={today} />
      </Field>

      <Field label="Catatan">
        <Input value={form.notes} onChange={set('notes')} placeholder="Opsional..." />
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 hover:-translate-y-0.5"
          style={{ background: theme.btnBg }}
          >
          {loading ? 'Menyimpan...' : 'Transfer'}
        </button>
      </div>
    </form>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────

function TransferRow({ t, amount, fee, onDelete }: { t: Transfer; amount: string; fee: string; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-ocean-400/15 flex items-center justify-center flex-shrink-0">
        <ArrowRight size={16} className="text-ocean-500" />
      </div>
      {/* Accounts */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          <span className="truncate max-w-[100px]">{t.from_account}</span>
          <ArrowRight size={12} className="text-gray-300 flex-shrink-0" />
          <span className="truncate max-w-[100px]">{t.to_account}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
          {t.notes && <p className="text-xs text-gray-400 truncate">· {t.notes}</p>}
        </div>
      </div>
      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="font-mono font-bold text-sm text-ocean-500">{amount}</p>
        {t.fee > 0 && <p className="text-xs text-gray-400 font-mono">+{fee} biaya</p>}
      </div>
      {/* Delete */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-coral-500 hover:bg-red-50"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TransfersPage() {
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

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())
  const [showCreate, setShowCreate] = useState(false)
  const [delTarget, setDelTarget]   = useState<Transfer | null>(null)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { success, error: toastError } = useToast()

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const isNextDisabled = month === now.getMonth() + 1 && year === now.getFullYear()

  const { data: txData, loading, refetch } = useApi(
    () => api.transfers.list({ month, year }), [month, year])
  const { data: accountData, refetch: refetchAccounts } = useApi(() => api.accounts.list())

  const transfers   = txData?.data ?? []
  const accounts    = (accountData?.data ?? []).filter(a => a.is_active)
  const totalAmount = transfers.reduce((s, t) => s + t.amount, 0)

  // ── Guard: need ≥2 accounts for transfer ─────────────────────────────────
  const onboarding = useOnboarding()
  const needsSecondAccount = !onboarding.loading && onboarding.accountCount < 2
  const firstAccountName = accounts[0]?.name ?? 'rekening pertama'

  const handleCreate = async (body: CreateTransferBody) => {
    setSaving(true)
    try {
      await api.transfers.create(body)
      success('Transfer berhasil dicatat')
      setShowCreate(false)
      refetch()
    } catch (e) {
      toastError((e as Error).message || 'Gagal menyimpan transfer')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    setDeleting(true)
    try {
      await api.transfers.delete(delTarget.id)
      success('Transfer dihapus, saldo dikembalikan')
      setDelTarget(null)
      refetch()
    } catch (e) {
      toastError((e as Error).message || 'Gagal menghapus transfer')
    } finally { setDeleting(false) }
  }

  // ── Guard render ────────────────────────────────────────────────────────────
  if (needsSecondAccount) {
    return (
      <AddSecondAccountPrompt
        firstAccountName={firstAccountName}
        onDone={() => { onboarding.refetch(); refetchAccounts() }}
      />
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Transfer</h1>
          <p className="text-gray-400 text-sm">Pindah saldo antar rekening</p>
          <button
            onClick={() => toggleBalance()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          style={{ background: theme.btnBg }}
        >
          <Plus size={16} /> Transfer
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-card p-4 mb-4 animate-fade-up" style={{ animationDelay: '40ms', animationFillMode: 'both' }}>
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <p className="font-display font-bold text-gray-900">{MONTH_NAMES[month - 1]} {year}</p>
          {!loading && <p className="text-xs text-gray-400">{transfers.length} transfer · {maskValue(formatRupiah(totalAmount))}</p>}
        </div>
        <button onClick={nextMonth} disabled={isNextDisabled} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-up" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-4 p-5 animate-pulse">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1"><Skeleton className="h-3.5 w-40 mb-2" /><Skeleton className="h-3 w-24" /></div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="text-4xl mb-3">↔️</div>
            <p className="font-display font-bold text-gray-900 mb-1">Belum ada transfer</p>
            <p className="text-sm text-gray-400 mb-5">Pindahkan saldo antar rekening kamu</p>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors hover:-translate-y-0.5"
              style={{ background: theme.btnBg }}
              >
              <Plus size={16} /> Buat Transfer
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transfers.map(t => (
              <TransferRow key={t.id} t={t} amount={maskValue(formatRupiah(t.amount))} fee={maskValue(formatRupiah(t.fee))} onDelete={() => setDelTarget(t)} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Transfer Antar Rekening">
        <TransferForm onSubmit={handleCreate} onClose={() => setShowCreate(false)} loading={saving} />
      </Modal>

      <ConfirmDialog
        open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete}
        title="Hapus Transfer" loading={deleting}
        message={`Hapus transfer ${delTarget ? formatRupiah(delTarget.amount) : ''}? Saldo kedua rekening akan dikembalikan.`}
        confirmLabel="Hapus Transfer"
      />
    </div>
  )
}
