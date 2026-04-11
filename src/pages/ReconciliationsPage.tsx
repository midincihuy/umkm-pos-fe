import { useState } from 'react'
import { Plus, CheckCircle, AlertTriangle, ArrowUpDown } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api, Account, CashAdjustment, ReconciliationPreview, CreateReconciliationBody } from '../lib/api'
import { formatRupiah, formatDate } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import { Field, Input, Select, AmountInput } from '../components/ui/FormField'
import { Skeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'

// ── Reconciliation Wizard ─────────────────────────────────────────────────────

type Step = 'form' | 'preview' | 'done'

function ReconciliationWizard({ accounts, onClose, onDone }: {
  accounts: Account[]; onClose: () => void; onDone: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [step, setStep]         = useState<Step>('form')
  const [form, setForm]         = useState({ account_id: '', actual_balance: '', date: today, notes: '' })
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [preview, setPreview]   = useState<ReconciliationPreview | null>(null)
  const [saving, setSaving]     = useState(false)
  const { success, error: toastError } = useToast()

  const activeAccounts = accounts.filter(a => a.is_active)

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.account_id)     errs.account_id     = 'Pilih rekening'
    if (form.actual_balance === '') errs.actual_balance = 'Saldo aktual wajib diisi'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const prev = await api.reconciliations.preview({
        account_id: form.account_id,
        actual_balance: Number(form.actual_balance),
      })
      setPreview(prev)
      setStep('preview')
    } catch (e) { toastError((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleConfirm = async () => {
    if (!preview) return
    setSaving(true)
    try {
      await api.reconciliations.create({
        account_id:     form.account_id,
        actual_balance: Number(form.actual_balance),
        date:           form.date,
        notes:          form.notes || undefined,
      } as CreateReconciliationBody)
      success('Rekonsiliasi berhasil disimpan')
      setStep('done')
      onDone()
    } catch (e) { toastError((e as Error).message) }
    finally { setSaving(false) }
  }

  if (step === 'done') return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-mint-400/15 flex items-center justify-center mb-4">
        <CheckCircle size={32} className="text-mint-500" />
      </div>
      <h3 className="font-display font-bold text-gray-900 text-lg mb-2">Rekonsiliasi Selesai</h3>
      {preview && (
        <p className="text-sm text-gray-500 mb-1">
          {preview.difference === 0
            ? 'Saldo sudah sesuai, tidak ada penyesuaian.'
            : `Saldo disesuaikan ${formatRupiah(Math.abs(preview.difference))} (${preview.difference > 0 ? '+' : '-'}).`}
        </p>
      )}
      <button onClick={onClose}
        className="mt-5 px-6 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors">
        Selesai
      </button>
    </div>
  )

  if (step === 'preview' && preview) return (
    <div className="space-y-4">
      {/* Account info */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Rekening</span>
          <span className="font-semibold text-gray-900">{preview.account_name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Saldo sistem</span>
          <span className="font-mono font-semibold text-gray-900">{formatRupiah(preview.balance_before)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Saldo aktual (input)</span>
          <span className="font-mono font-semibold text-gray-900">{formatRupiah(preview.actual_balance)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2.5 flex justify-between text-sm">
          <span className="text-gray-500 font-semibold">Selisih</span>
          <span className={cn('font-mono font-bold text-lg',
            preview.difference === 0 ? 'text-mint-500' :
            preview.difference > 0   ? 'text-mint-500' : 'text-coral-500')}>
            {preview.difference > 0 ? '+' : ''}{formatRupiah(preview.difference)}
          </span>
        </div>
      </div>

      {/* Warning */}
      {preview.warning && (
        <div className="flex gap-3 bg-gold-400/10 rounded-xl p-3.5">
          <AlertTriangle size={16} className="text-gold-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gold-500">{preview.warning}</p>
        </div>
      )}

      {/* No adjustment needed */}
      {!preview.needs_adjustment && (
        <div className="flex gap-3 bg-mint-400/10 rounded-xl p-3.5">
          <CheckCircle size={16} className="text-mint-500 flex-shrink-0" />
          <p className="text-xs text-mint-500">Saldo sudah sesuai, tidak ada penyesuaian yang diperlukan.</p>
        </div>
      )}

      {/* Date & notes for the adjustment */}
      {preview.needs_adjustment && (
        <div className="space-y-3">
          <Field label="Tanggal Rekonsiliasi">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} max={today} />
          </Field>
          <Field label="Catatan">
            <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Opsional..." />
          </Field>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep('form')}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Kembali
        </button>
        <button type="button" onClick={handleConfirm} disabled={saving}
          className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50">
          {saving ? 'Menyimpan...' : preview.needs_adjustment ? 'Simpan & Sesuaikan' : 'Konfirmasi'}
        </button>
      </div>
    </div>
  )

  // Step: form
  return (
    <form onSubmit={handlePreview} className="space-y-4">
      <p className="text-sm text-gray-500">
        Bandingkan saldo sistem dengan saldo fisik/mutasi rekening. Selisih akan dicatat sebagai penyesuaian.
      </p>

      <Field label="Rekening" required error={errors.account_id}>
        <Select value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))} error={!!errors.account_id}>
          <option value="">Pilih rekening</option>
          {activeAccounts.map(a => (
            <option key={a.id} value={a.id}>
              {a.icon} {a.name} — {formatRupiah(a.current_balance)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Saldo Aktual" required hint="Saldo sesuai rekening koran / cek fisik" error={errors.actual_balance}>
        <AmountInput
          value={form.actual_balance}
          onChange={e => setForm(f => ({ ...f, actual_balance: e.target.value }))}
          placeholder="0"
          error={!!errors.actual_balance}
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
        <button type="submit" disabled={saving}
          className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50">
          {saving ? 'Memeriksa...' : 'Cek Selisih →'}
        </button>
      </div>
    </form>
  )
}

// ── History row ────────────────────────────────────────────────────────────────

function HistoryRow({ adj }: { adj: CashAdjustment }) {
  const diff = adj.difference
  const isZero = diff === 0

  return (
    <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        isZero ? 'bg-gray-100' : diff > 0 ? 'bg-mint-400/15' : 'bg-coral-400/15',
      )}>
        <ArrowUpDown size={16} className={isZero ? 'text-gray-400' : diff > 0 ? 'text-mint-500' : 'text-coral-500'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{adj.account_name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
          <span>{formatDate(adj.date)}</span>
          <span>·</span>
          <span>Sebelum: {formatRupiah(adj.balance_before)}</span>
          {adj.notes && <><span>·</span><span className="truncate">{adj.notes}</span></>}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn(
          'font-mono font-bold text-sm',
          isZero ? 'text-gray-400' : diff > 0 ? 'text-mint-500' : 'text-coral-500',
        )}>
          {isZero ? '±0' : diff > 0 ? `+${formatRupiah(diff)}` : formatRupiah(diff)}
        </p>
        <p className="text-xs text-gray-400">→ {formatRupiah(adj.actual_balance)}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReconciliationsPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [filterAccount, setFilterAccount] = useState('')

  const { data: accounts } = useApi(() => api.accounts.list())
  const { data: history, loading, refetch } = useApi(
    () => api.reconciliations.list(filterAccount || undefined),
    [filterAccount],
  )

  const accountList = accounts?.data ?? []
  const adjustments = history ?? []

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Rekonsiliasi</h1>
          <p className="text-gray-400 text-sm">Cocokkan saldo sistem dengan saldo fisik</p>
        </div>
        <button onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors shadow-sm">
          <Plus size={16} /> Rekonsiliasi
        </button>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-5 animate-fade-up" style={{ animationDelay: '40ms', animationFillMode: 'both' }}>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-ocean-400/15 flex items-center justify-center flex-shrink-0">
            <ArrowUpDown size={18} className="text-ocean-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Apa itu Rekonsiliasi?</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Proses mencocokkan saldo di aplikasi dengan saldo nyata (mutasi bank / uang fisik). Jika ada selisih, sistem akan mencatat penyesuaian otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      {accountList.length > 0 && (
        <div className="mb-4 animate-fade-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
          <select
            value={filterAccount}
            onChange={e => setFilterAccount(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300 appearance-none"
          >
            <option value="">Semua rekening</option>
            {accountList.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
          </select>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-up" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
        <div className="px-5 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Riwayat Rekonsiliasi</p>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-4 p-5 animate-pulse">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1"><Skeleton className="h-3.5 w-32 mb-2" /><Skeleton className="h-3 w-48" /></div>
                <div className="text-right"><Skeleton className="h-4 w-20 mb-1" /><Skeleton className="h-3 w-24" /></div>
              </div>
            ))}
          </div>
        ) : adjustments.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="text-4xl mb-3">⚖️</div>
            <p className="font-display font-bold text-gray-900 mb-1">Belum ada riwayat</p>
            <p className="text-sm text-gray-400 mb-5">Lakukan rekonsiliasi pertama kamu</p>
            <button onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition-colors">
              <Plus size={16} /> Rekonsiliasi Sekarang
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {adjustments.map(adj => <HistoryRow key={adj.id} adj={adj} />)}
          </div>
        )}
      </div>

      <Modal open={showWizard} onClose={() => setShowWizard(false)} title="Rekonsiliasi Saldo" size="md">
        <ReconciliationWizard
          accounts={accountList}
          onClose={() => setShowWizard(false)}
          onDone={() => { setShowWizard(false); refetch() }}
        />
      </Modal>
    </div>
  )
}
