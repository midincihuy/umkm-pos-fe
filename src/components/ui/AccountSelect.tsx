// src/components/ui/AccountSelect.tsx
//
// Dropdown rekening yang otomatis diurutkan berdasarkan frekuensi pemakaian
// dalam 3 bulan terakhir. Yang paling sering dipakai muncul paling atas.
//
// Cara pakai (gantikan <select> biasa):
//
//   <AccountSelect
//     value={form.account_id}
//     onChange={id => setForm(f => ({ ...f, account_id: id }))}
//     placeholder="Pilih rekening"
//     excludeId={form.to_account_id}   // opsional: exclude rekening tertentu
//     error={!!errors.account_id}
//   />

import { useMemo } from 'react'
import { Wallet, CreditCard, Smartphone, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { theme } from '../../lib/theme'
import { useAccountsSortedByUsage } from '../../hooks/useAccountsSortedByUsage'
import type { Account, AccountType } from '../../lib/api'

// ── Icon per tipe rekening ─────────────────────────────────────────────────
function AccountIcon({ type, size = 14 }: { type: AccountType; size?: number }) {
  const icons: Record<AccountType, React.ElementType> = {
    bank:       CreditCard,
    cash:       Wallet,
    ewallet:    Smartphone,
    investment: TrendingUp,
  }
  const Icon = icons[type] ?? Wallet
  return <Icon size={size} />
}

function typeLabel(type: AccountType): string {
  return { bank: 'Bank', cash: 'Tunai', ewallet: 'E-Wallet', investment: 'Investasi' }[type] ?? type
}

function formatBalance(balance: number): string {
  if (Math.abs(balance) >= 1_000_000) {
    return `Rp${(balance / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`
  }
  if (Math.abs(balance) >= 1_000) {
    return `Rp${(balance / 1_000).toFixed(0)}rb`
  }
  return `Rp${balance.toFixed(0)}`
}

// ── Props ──────────────────────────────────────────────────────────────────
interface AccountSelectProps {
  value:       string
  onChange:    (accountId: string) => void
  placeholder?: string
  /** Exclude rekening dengan ID ini dari list (misal: rekening tujuan di Transfer) */
  excludeId?:  string
  error?:      boolean
  disabled?:   boolean
  label?:      string
  required?:   boolean
  /** Tampilkan badge frekuensi transaksi (default: false) */
  showUsage?:  boolean
  className?:  string
}

// ── Component ──────────────────────────────────────────────────────────────
export function AccountSelect({
  value,
  onChange,
  placeholder = 'Pilih rekening',
  excludeId,
  error,
  disabled,
  label,
  required,
  showUsage = false,
  className,
}: AccountSelectProps) {
  const { accounts, loading } = useAccountsSortedByUsage()

  // Filter exclude + hanya yang aktif
  const filtered = useMemo(
    () => accounts.filter(a => a.is_active && a.id !== excludeId),
    [accounts, excludeId],
  )

  const selected = filtered.find(a => a.id === value)

  if (loading) {
    return (
      <div className={cn(
        'flex items-center gap-2 h-11 px-3.5 rounded-xl border bg-gray-50 text-sm text-gray-400',
        theme.inputBorder, className,
      )}>
        <Loader2 size={14} className="animate-spin text-gray-300" />
        <span>Memuat rekening…</span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}

      {/* ── Custom select UI ── */}
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            // Base
            'w-full h-11 pl-10 pr-9 rounded-xl border text-sm font-medium bg-white',
            'appearance-none cursor-pointer transition-all outline-none',
            // Border
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : cn(theme.inputBorder, theme.inputFocusBorder, theme.inputFocusRing, 'focus:ring-2'),
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            value ? 'text-gray-900' : 'text-gray-400',
          )}
        >
          <option value="">{placeholder}</option>
          {filtered.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name} — {formatBalance(acc.current_balance ?? 0)}
            </option>
          ))}
        </select>

        {/* Icon kiri — ikut rekening terpilih */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          {selected
            ? <AccountIcon type={selected.type} />
            : <Wallet size={14} />
          }
        </div>

        {/* Chevron kanan */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* ── Urutan rekening (visual hint, opsional) ── */}
      {showUsage && filtered.length > 0 && (
        <UsageList accounts={filtered} selectedId={value} onSelect={onChange} />
      )}
    </div>
  )
}

// ── Visual list dengan usage badge (untuk showUsage=true) ─────────────────
function UsageList({
  accounts,
  selectedId,
  onSelect,
}: {
  accounts:   Account[]
  selectedId: string
  onSelect:   (id: string) => void
}) {
  // Hanya tampilkan 5 teratas
  const top = accounts.slice(0, 5)

  return (
    <div className="mt-1 rounded-xl border divide-y overflow-hidden" style={{ borderColor: theme.mockupChromeBorder }}>
      {top.map((acc, i) => (
        <button
          key={acc.id}
          type="button"
          onClick={() => onSelect(acc.id)}
          className={cn(
            'w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors',
            selectedId === acc.id
              ? cn(theme.navActiveBg, theme.navActiveText)
              : 'bg-white hover:bg-gray-50',
          )}
        >
          {/* Rank number */}
          <span className={cn(
            'w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0',
            i === 0 ? cn(theme.statPrimary.iconBg, 'text-white') : 'bg-gray-100 text-gray-400',
          )}>
            {i + 1}
          </span>

          {/* Icon + nama */}
          <div className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
            selectedId === acc.id ? theme.badgeBg : 'bg-gray-100',
          )}>
            <AccountIcon type={acc.type} size={13} />
          </div>

          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-semibold truncate', selectedId === acc.id ? theme.navActiveText : 'text-gray-800')}>
              {acc.name}
            </p>
            <p className="text-[10px] text-gray-400">{typeLabel(acc.type)}</p>
          </div>

          <span className="text-xs font-mono font-bold text-gray-500 flex-shrink-0">
            {formatBalance(acc.current_balance ?? 0)}
          </span>

          {selectedId === acc.id && (
            <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', theme.navActiveDot)} />
          )}
        </button>
      ))}
    </div>
  )
}

// ── Versi compact untuk form inline (tanpa label, lebih kecil) ─────────────
export function AccountSelectCompact(props: Omit<AccountSelectProps, 'label' | 'showUsage'>) {
  return <AccountSelect {...props} className={cn('h-9 text-xs', props.className)} />
}