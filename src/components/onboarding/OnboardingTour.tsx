import { useState, useEffect } from 'react'
import {
  Wallet, CreditCard, TrendingUp,
  ArrowRight, CheckCircle, X, ChevronRight,
  Sparkles, PiggyBank,
} from 'lucide-react'
import { api, AccountType, CategoryType } from '../../lib/api'
import { Field, Input, Select, AmountInput } from '../ui/FormField'
import { useToast } from '../ui/Toast'
import { cn } from '../../lib/utils'
import { OnboardingStatus } from '../../hooks/useOnboarding'

const ACCOUNT_TYPES: {
  value: AccountType; label: string; emoji: string; desc: string
  color: string; border: string; bg: string
}[] = [
  { value: 'bank',       label: 'Bank',      emoji: '🏦', desc: 'Rekening tabungan / giro', color: 'text-ocean-500',  border: 'border-ocean-300',  bg: 'bg-ocean-400/10' },
  { value: 'cash',       label: 'Tunai',     emoji: '👛', desc: 'Uang tunai / dompet',      color: 'text-mint-500',   border: 'border-mint-300',   bg: 'bg-mint-400/10' },
  { value: 'ewallet',    label: 'E-Wallet',  emoji: '📱', desc: 'GoPay, OVO, Dana, dll',    color: 'text-brand-600',  border: 'border-brand-300',  bg: 'bg-brand-400/10' },
  { value: 'investment', label: 'Investasi', emoji: '📈', desc: 'Reksa dana, saham, dll',   color: 'text-gold-500',   border: 'border-gold-300',   bg: 'bg-gold-400/10' },
]

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className={cn(
      'h-2.5 rounded-full transition-all duration-300',
      done  ? 'w-2.5 bg-mint-500' :
      active ? 'w-5 bg-brand-500' : 'w-2.5 bg-gray-200',
    )} />
  )
}

// ── Welcome ───────────────────────────────────────────────────────────────────
function StepWelcome({ onNext, onSkip, startStep }: {
  onNext: () => void; onSkip: () => void; startStep: 'account' | 'transaction'
}) {
  const steps = startStep === 'account'
    ? [
        { icon: CreditCard, label: 'Buat rekening pertama', sub: 'Catat saldo yang kamu miliki saat ini' },
        { icon: ArrowRight,  label: 'Catat transaksi pertama', sub: 'Pemasukan atau pengeluaran hari ini' },
      ]
    : [
        { icon: ArrowRight,  label: 'Catat transaksi pertama', sub: 'Rekening sudah siap, tinggal catat!' },
      ]

  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-ocean-500 flex items-center justify-center shadow-glow">
          <Wallet size={36} className="text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gold-400 flex items-center justify-center shadow-sm animate-bounce">
          <Sparkles size={13} className="text-white" />
        </div>
      </div>
      <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
        {startStep === 'account' ? 'Selamat datang! 🎉' : 'Hampir siap! 🚀'}
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
        {startStep === 'account'
          ? 'Yuk, setup awal cukup 2 langkah singkat — tidak sampai 1 menit!'
          : 'Rekening sudah ada. Sekarang saatnya catat transaksi pertamamu!'}
      </p>
      <div className="w-full space-y-3 mb-8">
        {steps.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl text-left">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <item.icon size={15} className="text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
            <ChevronRight size={14} className="text-gray-300" />
          </div>
        ))}
      </div>
      <button onClick={onNext}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-ocean-400 text-white font-bold text-sm hover:from-brand-400 hover:to-ocean-300 transition-all shadow-glow-sm hover:-translate-y-0.5 flex items-center justify-center gap-2 group">
        Mulai Setup
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
      <button onClick={onSkip} className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors">
        Lewati, saya akan setup sendiri
      </button>
    </div>
  )
}

// ── Create Account ────────────────────────────────────────────────────────────
function StepCreateAccount({ onDone, onSkip }: {
  onDone: (name: string) => void; onSkip: () => void
}) {
  const [form, setForm]     = useState({ name: '', type: 'bank' as AccountType, opening_balance: '' })
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [saving, setSaving] = useState(false)
  const { error: toastError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setErrors({ name: 'Nama rekening wajib diisi' }); return }
    setSaving(true)
    try {
      const typeInfo = ACCOUNT_TYPES.find(t => t.value === form.type)!
      await api.accounts.create({
        name: form.name.trim(), type: form.type,
        opening_balance: form.opening_balance ? Number(form.opening_balance) : 0,
        icon: typeInfo.emoji,
      })
      onDone(form.name.trim())
    } catch (e) {
      toastError((e as Error).message || 'Gagal membuat rekening')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ocean-400/15 mb-3">
          <CreditCard size={22} className="text-ocean-500" />
        </div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-1">Buat Rekening</h2>
        <p className="text-gray-400 text-sm">Rekening adalah tempat uang kamu disimpan</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {ACCOUNT_TYPES.map(t => (
          <button key={t.value} type="button"
            onClick={() => setForm(f => ({ ...f, type: t.value }))}
            className={cn(
              'flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left',
              form.type === t.value ? `${t.border} ${t.bg}` : 'border-gray-100 hover:border-gray-200',
            )}>
            <span className="text-xl flex-shrink-0">{t.emoji}</span>
            <div className="min-w-0">
              <p className={cn('text-sm font-semibold leading-tight', form.type === t.value ? t.color : 'text-gray-700')}>{t.label}</p>
              <p className="text-[10px] text-gray-400 leading-tight truncate">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-4">
        <Field label="Nama Rekening" required error={errors.name}>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            error={!!errors.name} autoFocus
            placeholder={form.type === 'bank' ? 'cth: BCA Utama' : form.type === 'cash' ? 'cth: Dompet Harian' : form.type === 'ewallet' ? 'cth: GoPay' : 'cth: Reksa Dana Bibit'} />
        </Field>
        <Field label="Saldo Awal" hint="Masukkan saldo rekening saat ini">
          <AmountInput value={form.opening_balance}
            onChange={e => setForm(f => ({ ...f, opening_balance: e.target.value }))} placeholder="0" />
        </Field>
      </div>

      <div className="flex gap-2.5 bg-brand-50 rounded-xl p-3 mb-5">
        <span className="text-base">💡</span>
        <p className="text-xs text-brand-700 leading-relaxed">
          Saldo awal dicatat sebagai <strong>Opening Balance</strong>. Kamu bisa tambah rekening lain kapan saja di menu <strong>Rekening</strong>.
        </p>
      </div>

      <div className="flex gap-3 sticky bottom-0 bg-white pb-1 pt-3 border-t border-gray-50">
        <button type="button" onClick={onSkip}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
          Lewati
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-ocean-400 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:from-brand-400 hover:to-ocean-300 transition-all">
          {saving ? 'Menyimpan...' : 'Buat Rekening'}
          {!saving && <ChevronRight size={15} />}
        </button>
      </div>
    </form>
  )
}

// ── First Transaction ─────────────────────────────────────────────────────────
function StepFirstTransaction({ onDone, onSkip }: {
  onDone: () => void; onSkip: () => void
}) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [form, setForm] = useState({ account_id: '', category_id: '', amount: '', description: '', date: new Date().toISOString().slice(0, 10) })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [saving, setSaving] = useState(false)
  const { error: toastError } = useToast()
  const [accounts,   setAccounts]   = useState<{ id: string; name: string; icon: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; type: CategoryType }[]>([])

  useEffect(() => {
    api.accounts.list().then(r => {
      const active = r.data.filter(a => a.is_active)
      setAccounts(active)
      if (active.length > 0) setForm(f => ({ ...f, account_id: active[0].id }))
    }).catch(() => {})
    api.categories.list().then(r => setCategories([...r.income, ...r.expense])).catch(() => {})
  }, [])

  useEffect(() => { setForm(f => ({ ...f, category_id: '' })) }, [type])

  const filteredCats = categories.filter(c => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Partial<typeof form> = {}
    if (!form.account_id)  errs.account_id  = 'Pilih rekening'
    if (!form.category_id) errs.category_id = 'Pilih kategori'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Nominal wajib diisi'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await api.transactions.create({
        type, account_id: form.account_id, category_id: form.category_id,
        amount: Number(form.amount), date: form.date,
        description: form.description || undefined,
      })
      onDone()
    } catch (e) {
      toastError((e as Error).message || 'Gagal mencatat transaksi')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-400/15 mb-3">
          <TrendingUp size={22} className="text-brand-600" />
        </div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-1">Transaksi Pertama</h2>
        <p className="text-gray-400 text-sm">Catat pemasukan atau pengeluaran hari ini</p>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-4">
        {(['expense', 'income'] as const).map(t => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={cn('flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
              type === t ? (t === 'expense' ? 'bg-white text-coral-500 shadow-sm' : 'bg-white text-mint-500 shadow-sm') : 'text-gray-400 hover:text-gray-600')}>
            {t === 'expense' ? '💸 Pengeluaran' : '💰 Pemasukan'}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-4">
        <Field label="Rekening" required error={errors.account_id}>
          <Select value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))} error={!!errors.account_id}>
            <option value="" disabled>Pilih rekening</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
          </Select>
        </Field>
        <Field label="Nominal" required error={errors.amount}>
          <AmountInput value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} error={!!errors.amount} placeholder="0" autoFocus />
        </Field>
        <Field label="Kategori" required error={errors.category_id}>
          <Select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} error={!!errors.category_id}>
            <option value="" disabled>Pilih kategori</option>
            {filteredCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>
        </Field>
        <Field label="Deskripsi">
          <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Opsional, cth: Makan siang kantor" />
        </Field>
      </div>

      <div className="flex gap-3 sticky bottom-0 bg-white pb-1 pt-3 border-t border-gray-50">
        <button type="button" onClick={onSkip}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors">
          Lewati
        </button>
        <button type="submit" disabled={saving}
          className={cn('flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all',
            type === 'expense' ? 'bg-gradient-to-r from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-500' : 'bg-gradient-to-r from-mint-400 to-mint-500 hover:from-mint-500 hover:to-mint-500')}>
          {saving ? 'Menyimpan...' : type === 'expense' ? 'Catat Pengeluaran' : 'Catat Pemasukan'}
          {!saving && <ChevronRight size={15} />}
        </button>
      </div>
    </form>
  )
}

// ── Done ──────────────────────────────────────────────────────────────────────
function StepDone({ accountName, onClose }: { accountName: string; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center px-2">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-mint-400 to-mint-500 flex items-center justify-center shadow-lg">
          <CheckCircle size={38} className="text-white" />
        </div>
        <div className="absolute inset-0 rounded-3xl bg-mint-400/30 animate-ping"
          style={{ animationDuration: '1.5s', animationIterationCount: '2' } as React.CSSProperties} />
      </div>
      <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Siap digunakan! 🚀</h2>
      {accountName && <p className="text-gray-500 text-sm mb-1">Rekening <strong className="text-gray-700">"{accountName}"</strong> sudah aktif.</p>}
      <p className="text-gray-400 text-sm mb-8">Dashboard sudah menampilkan data terbaru kamu.</p>
      <div className="w-full bg-gray-50 rounded-2xl p-4 mb-7 text-left space-y-2.5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Langkah selanjutnya</p>
        {[
          { emoji: '🏦', text: 'Tambah rekening lain di menu Rekening' },
          { emoji: '🎯', text: 'Atur budget bulanan di menu Budget' },
          { emoji: '📊', text: 'Pantau laporan keuangan tiap bulan' },
          { emoji: '🤝', text: 'Catat hutang & piutang yang ada' },
        ].map(item => (
          <div key={item.text} className="flex items-start gap-2.5">
            <span className="text-base flex-shrink-0">{item.emoji}</span>
            <p className="text-sm text-gray-600">{item.text}</p>
          </div>
        ))}
      </div>
      <button onClick={onClose}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-ocean-400 text-white font-bold text-sm hover:from-brand-400 hover:to-ocean-300 transition-all shadow-glow-sm hover:-translate-y-0.5">
        Mulai Gunakan Dompet Keluargaku ✨
      </button>
    </div>
  )
}

// ── Tour step machine ─────────────────────────────────────────────────────────
type TourStep = 'welcome' | 'account' | 'transaction' | 'done'

function getSteps(status: OnboardingStatus): TourStep[] {
  if (status === 'no_account')     return ['welcome', 'account', 'transaction', 'done']
  if (status === 'no_transaction') return ['welcome', 'transaction', 'done']
  return ['welcome', 'transaction', 'done']
}

// ── Main export ───────────────────────────────────────────────────────────────
interface OnboardingTourProps {
  status: OnboardingStatus
  onComplete: () => void
  onDismiss: () => void
}

export default function OnboardingTour({ status, onComplete, onDismiss }: OnboardingTourProps) {
  const steps = getSteps(status)
  const [idx, setIdx]             = useState(0)
  const [accountName, setAccountName] = useState('')

  const currentStep   = steps[idx]
  const actionSteps   = steps.filter(s => s !== 'welcome' && s !== 'done')
  const currentAction = steps.slice(0, idx).filter(s => s !== 'welcome' && s !== 'done').length
  const progressPct   = steps.length <= 1 ? 100 : Math.round((idx / (steps.length - 1)) * 100)
  const next          = () => setIdx(i => Math.min(i + 1, steps.length - 1))
  const startStep     = status === 'no_account' ? 'account' : 'transaction'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={currentStep === 'done' ? onComplete : undefined} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => <StepDot key={i} active={i === idx} done={i < idx} />)}
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {currentStep === 'done' ? 'Selesai! 🎉'
              : currentStep === 'welcome' ? `${actionSteps.length} langkah singkat`
              : `Langkah ${currentAction + 1} dari ${actionSteps.length}`}
          </span>
          {currentStep !== 'done' && (
            <button onClick={onDismiss} title="Lewati semua"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-6 mb-4 flex-shrink-0">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-ocean-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0">
          {currentStep === 'welcome'     && <StepWelcome onNext={next} onSkip={onDismiss} startStep={startStep} />}
          {currentStep === 'account'     && <StepCreateAccount onDone={name => { setAccountName(name); next() }} onSkip={next} />}
          {currentStep === 'transaction' && <StepFirstTransaction onDone={next} onSkip={next} />}
          {currentStep === 'done'        && <StepDone accountName={accountName} onClose={onComplete} />}
        </div>

        {currentStep === 'welcome' && (
          <div className="flex-shrink-0 px-6 pb-4 flex items-center justify-center gap-3 text-xs text-gray-300">
            <PiggyBank size={12} /><span>Dompet Keluargaku — Keuangan Rumah Tangga</span><Sparkles size={12} />
          </div>
        )}
      </div>
    </div>
  )
}