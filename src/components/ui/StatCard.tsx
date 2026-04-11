import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { theme } from '../../lib/theme'

interface StatCardProps {
  label:   string
  value:   string
  icon:    LucideIcon
  trend?:  { value: string; positive: boolean }
  /** Slot warna: primary=utama, positive=pemasukan, negative=pengeluaran, neutral=surplus, extra=net worth */
  color:   'primary' | 'positive' | 'negative' | 'neutral' | 'extra'
  delay?:  number
}

const colorSlot = {
  primary:  () => theme.statPrimary,
  positive: () => theme.statPositive,
  negative: () => theme.statNegative,
  neutral:  () => theme.statNeutral,
  extra:    () => theme.statExtra,
}

function valueFontSize(value: string): string {
  const len = value.length
  if (len <= 12) return 'text-xl'
  if (len <= 16) return 'text-lg'
  if (len <= 20) return 'text-base'
  return 'text-sm'
}

export default function StatCard({ label, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) {
  const c = colorSlot[color]()

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-card card-hover animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', c.iconBg)}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-mono font-semibold px-2 py-1 rounded-full',
            trend.positive
              ? cn(theme.trendPosBg, theme.trendPosText)
              : cn(theme.trendNegBg, theme.trendNegText),
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-xs font-body font-medium mb-1">{label}</p>
      <p className={cn('font-display font-bold text-gray-900 leading-tight break-all', valueFontSize(value))}>
        {value}
      </p>
    </div>
  )
}