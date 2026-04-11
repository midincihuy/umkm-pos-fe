import { useState } from 'react'
import { ArrowLeftRight, CreditCard, ChevronRight } from 'lucide-react'
import { api, AccountType } from '../../lib/api'
import { Field, Input, AmountInput } from '../ui/FormField'
import { useToast } from '../ui/Toast'
import { cn } from '../../lib/utils'

const ACCOUNT_TYPES: {
  value: AccountType; label: string; emoji: string; desc: string
  color: string; border: string; bg: string
}[] = [
  { value: 'bank',       label: 'Bank',      emoji: '🏦', desc: 'Rekening tabungan / giro', color: 'text-ocean-500',  border: 'border-ocean-300',  bg: 'bg-ocean-400/10' },
  { value: 'cash',       label: 'Tunai',     emoji: '👛', desc: 'Uang tunai / dompet',      color: 'text-mint-500',   border: 'border-mint-300',   bg: 'bg-mint-400/10' },
  { value: 'ewallet',    label: 'E-Wallet',  emoji: '📱', desc: 'GoPay, OVO, Dana, dll',    color: 'text-brand-600',  border: 'border-brand-300',  bg: 'bg-brand-400/10' },
  { value: 'investment', label: 'Investasi', emoji: '📈', desc: 'Reksa dana, saham, dll',   color: 'text-gold-500',   border: 'border-gold-300',   bg: 'bg-gold-400/10' },
]

interface Props {
  firstAccountName: string   // nama rekening pertama yang sudah ada
  onDone: () => void         // dipanggil setelah rekening kedua berhasil dibuat
}

export default function AddSecondAccountPrompt({ firstAccountName, onDone }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ name: '', type: 'cash' as AccountType, opening_balance: '' })
  const [errors, setErrors]     = useState<{ name?: string }>({})
  const [saving, setSaving]     = useState(false)
  const { success, error: toastError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setErrors({ name: 'Nama rekening wajib diisi' }); return }
    setSaving(true)
    try {
      const typeInfo = ACCOUNT_TYPES.find(t => t.value === form.type)!
      await api.accounts.create({
        name:            form.name.trim(),
        type:            form.type,
        opening_balance: form.opening_balance ? Number(form.opening_balance) : 0,
        icon:            typeInfo.emoji,
      })
      success(`Rekening "${form.name.trim()}" berhasil dibuat!`)
      onDone()
    } catch (e) {
      toastError((e as Error).message || 'Gagal membuat rekening')
    } finally { setSaving(false) }
  }

  // ── State: teaser (belum buka form) ────────────────────────────────────────
  if (!showForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 animate-fade-up">
        {/* Ilustrasi */}
        <div className="relative mb-8">
          {/* Dua kartu rekening yang saling overlap */}
          <div className="relative w-52 h-28">
            <div className="absolute left-0 top-4 w-40 h-24 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg rotate-[-6deg] flex flex-col justify-between p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏦</span>
                <div className="h-1.5 w-16 bg-white/30 rounded-full" />
              </div>
              <p className="text-white text-xs font-mono truncate opacity-80">{firstAccountName}</p>
            </div>
            <div className="absolute right-0 top-0 w-40 h-24 rounded-2xl bg-gradient-to-br from-ocean-400/60 to-ocean-500/60 border-2 border-dashed border-ocean-300 shadow-md rotate-[6deg] flex flex-col items-center justify-center gap-1">
              <div className="w-8 h-8 rounded-xl border-2 border-dashed border-ocean-300 flex items-center justify-center">
                <span className="text-ocean-300 text-lg leading-none">+</span>
              </div>
              <p className="text-ocean-300 text-[10px] font-semibold">Rekening baru</p>
            </div>
          </div>

          {/* Arrow antara dua kartu */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 w-9 h-9 rounded-full bg-white border border-gray-100 shadow-md flex items-center justify-center">
            <ArrowLeftRight size={15} className="text-brand-500" />
          </div>
        </div>

        <h2 className="font-display font-bold text-xl text-gray-900 mb-2 text-center">
          Transfer butuh 2 rekening
        </h2>
        <p className="text-gray-500 text-sm text-center max-w-xs leading-relaxed mb-2">
          Kamu baru punya <strong className="text-gray-700">"{firstAccountName}"</strong>. Untuk mencatat transfer, tambahkan satu rekening lagi — misalnya dompet tunai atau e-wallet.
        </p>
        <p className="text-xs text-gray-400 text-center mb-8">
          Contoh: transfer dari BCA → GoPay, atau Tabungan → Tunai
        </p>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-ocean-400 text-white font-bold text-sm hover:from-brand-400 hover:to-ocean-300 transition-all shadow-glow-sm hover:-translate-y-0.5 group"
        >
          <CreditCard size={16} />
          Tambah Rekening Kedua
          <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    )
  }

  // ── State: form create rekening kedua ──────────────────────────────────────
  return (
    <div className="max-w-md mx-auto p-6 animate-fade-up">
      {/* Breadcrumb / back */}
      <button onClick={() => setShowForm(false)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6">
        ← Kembali
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ocean-400/15 mb-3">
          <CreditCard size={22} className="text-ocean-500" />
        </div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-1">Tambah Rekening Kedua</h2>
        <p className="text-gray-400 text-sm">
          Nanti bisa transfer dari/ke <strong className="text-gray-600">"{firstAccountName}"</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type picker */}
        <div className="grid grid-cols-2 gap-2">
          {ACCOUNT_TYPES.map(t => (
            <button key={t.value} type="button"
              onClick={() => setForm(f => ({ ...f, type: t.value }))}
              className={cn(
                'flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left',
                form.type === t.value ? `${t.border} ${t.bg}` : 'border-gray-100 hover:border-gray-200',
              )}>
              <span className="text-xl flex-shrink-0">{t.emoji}</span>
              <div className="min-w-0">
                <p className={cn('text-sm font-semibold leading-tight', form.type === t.value ? t.color : 'text-gray-700')}>
                  {t.label}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight truncate">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <Field label="Nama Rekening" required error={errors.name}>
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            error={!!errors.name}
            autoFocus
            placeholder={
              form.type === 'bank'       ? 'cth: Mandiri, BNI, BRI' :
              form.type === 'cash'       ? 'cth: Dompet Harian' :
              form.type === 'ewallet'    ? 'cth: GoPay, OVO, Dana' :
              'cth: Reksa Dana Bibit'
            }
          />
        </Field>

        <Field label="Saldo Awal" hint="Isi saldo rekening ini saat ini">
          <AmountInput
            value={form.opening_balance}
            onChange={e => setForm(f => ({ ...f, opening_balance: e.target.value }))}
            placeholder="0"
          />
        </Field>

        {/* Info */}
        <div className="flex gap-2.5 bg-ocean-400/10 rounded-xl p-3">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-xs text-ocean-700 leading-relaxed">
            Setelah ini kamu langsung bisa mencatat transfer antara <strong>"{firstAccountName}"</strong> dan rekening baru ini.
          </p>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-ocean-400 text-white font-bold text-sm hover:from-brand-400 hover:to-ocean-300 transition-all shadow-glow-sm disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? 'Menyimpan...' : 'Buat Rekening'}
          {!saving && <ChevronRight size={15} />}
        </button>
      </form>
    </div>
  )
}
