import { useState, useEffect, useRef } from 'react'
import {
  TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight,
  BarChart2, PieChart, Activity, ArrowUpRight, ArrowDownRight, Minus,
  Eye, EyeOff,
} from 'lucide-react'
import {
  Chart,
  LineElement, PointElement, LinearScale, CategoryScale,
  BarElement, ArcElement, Tooltip, Legend, Filler,
  type ChartData, type ChartOptions,
  DoughnutController, LineController, BarController,
} from 'chart.js'
import { useApi } from '../hooks/useApi'
import { api, TrendItem } from '../lib/api'
import { formatRupiah, MONTH_NAMES } from '../lib/utils'
import { Skeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'
import { theme } from '../lib/theme'

// Register Chart.js components
Chart.register(
  LineElement, PointElement, LinearScale, CategoryScale,
  BarElement, ArcElement, Tooltip, Legend, Filler,
  DoughnutController, LineController, BarController,
)

const now = new Date()

// ── Chart helper hooks ────────────────────────────────────────────────────────

function useChart(
  ref: React.RefObject<HTMLCanvasElement | null>,
  data: ChartData | null,
  options: ChartOptions,
  type: 'line' | 'bar' | 'doughnut',
) {
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current || !data) return
    if (chartRef.current) { chartRef.current.destroy() }
    chartRef.current = new Chart(ref.current, { type, data, options })
    return () => { chartRef.current?.destroy(); chartRef.current = null }
  }, [data]) // eslint-disable-line

  return chartRef
}

// ── Color palette ─────────────────────────────────────────────────────────────

const CHART_COLORS = [
  '#c62af5', '#45aaf2', '#26de81', '#fed330', '#ff6b6b',
  '#a29bfe', '#fd79a8', '#00b894', '#e17055', '#74b9ff',
  '#55efc4', '#fdcb6e', '#636e72', '#b2bec3',
]

// ── Stat card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
  delta?: number | null // % change vs prev month
  loading?: boolean
}

function KpiCard({ label, value, icon: Icon, color, bg, delta, loading }: KpiCardProps) {
  if (loading) return (
    <div className="bg-white rounded-2xl p-5 shadow-card animate-pulse">
      <Skeleton className="w-10 h-10 rounded-xl mb-4" />
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-7 w-36 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  )

  const isPositive = delta != null && delta > 0
  const isNegative = delta != null && delta < 0

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card card-hover">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', bg)}>
        <Icon size={18} className={color} />
      </div>
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className={cn('font-mono font-bold text-xl leading-tight mb-2', color)}>{value}</p>
      {delta != null && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-semibold',
          isPositive ? 'text-mint-500' : isNegative ? 'text-coral-500' : 'text-gray-400',
        )}>
          {isPositive ? <ArrowUpRight size={13} /> : isNegative ? <ArrowDownRight size={13} /> : <Minus size={13} />}
          <span>{Math.abs(delta).toFixed(1)}% vs bulan lalu</span>
        </div>
      )}
    </div>
  )
}

// ── Chart wrappers ─────────────────────────────────────────────────────────────

const TREND_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: { family: '"Plus Jakarta Sans"', size: 12 },
        usePointStyle: true,
        pointStyleWidth: 8,
        padding: 20,
        color: '#6b7280',
      },
    },
    tooltip: {
      backgroundColor: '#1f2937',
      titleFont: { family: '"Plus Jakarta Sans"', size: 12, weight: 'bold' },
      bodyFont: { family: '"JetBrains Mono"', size: 12 },
      padding: 12,
      cornerRadius: 12,
      callbacks: {
        label: ctx => {
          const value = ctx.parsed.y ?? 0
          return ` ${ctx.dataset.label}: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: '"Plus Jakarta Sans"', size: 11 }, color: '#9ca3af' },
    },
    y: {
      grid: { color: '#f3f4f6' },
      ticks: {
        font: { family: '"JetBrains Mono"', size: 10 }, color: '#9ca3af',
        callback: v => {
          const n = Number(v)
          if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}jt`
          if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`
          return String(n)
        },
      },
    },
  },
}

function TrendChart({ items, loading }: { items: TrendItem[]; loading: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const sorted = [...items].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
  const labels = sorted.map(i => `${MONTH_NAMES[i.month - 1].slice(0, 3)} ${String(i.year).slice(2)}`)

  const data: ChartData<'line'> | null = sorted.length === 0 ? null : {
    labels,
    datasets: [
      {
        label: 'Pemasukan',
        data: sorted.map(i => i.income),
        borderColor: '#26de81',
        backgroundColor: 'rgba(38,222,129,0.08)',
        pointBackgroundColor: '#26de81',
        pointRadius: 4, pointHoverRadius: 6,
        borderWidth: 2.5, fill: true, tension: 0.4,
      },
      {
        label: 'Pengeluaran',
        data: sorted.map(i => i.expense),
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255,107,107,0.08)',
        pointBackgroundColor: '#ff6b6b',
        pointRadius: 4, pointHoverRadius: 6,
        borderWidth: 2.5, fill: true, tension: 0.4,
      },
      {
        label: 'Surplus',
        data: sorted.map(i => i.surplus),
        borderColor: '#c62af5',
        backgroundColor: 'rgba(198,42,245,0.06)',
        pointBackgroundColor: '#c62af5',
        pointRadius: 3, pointHoverRadius: 5,
        borderWidth: 2, fill: false, tension: 0.4,
        borderDash: [5, 3],
      },
    ],
  }

  useChart(canvasRef, data, TREND_OPTIONS as ChartOptions, 'line')

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="h-64 flex flex-col items-center justify-center text-center">
      <Activity size={32} className="text-gray-200 mb-3" />
      <p className="text-gray-400 text-sm">Belum ada data trend</p>
    </div>
  )

  return <div className="h-64 relative"><canvas ref={canvasRef} /></div>
}

const DONUT_OPTIONS: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1f2937',
      titleFont: { family: '"Plus Jakarta Sans"', size: 12, weight: 'bold' },
      bodyFont: { family: '"JetBrains Mono"', size: 12 },
      padding: 12, cornerRadius: 12,
      callbacks: {
        label: ctx => ` ${ctx.parsed.toFixed(1)}%  ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(ctx.dataset.data[ctx.dataIndex] as number)}`,
      },
    },
  },
}

interface DonutChartProps {
  items: { label: string; icon: string; amount: number; percentage: number }[]
  total: string
  centerLabel: string
  loading: boolean
  emptyMsg: string
}

function DonutChart({ items, total, centerLabel, loading, emptyMsg }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const data: ChartData<'doughnut'> | null = items.length === 0 ? null : {
    labels: items.map(i => i.label),
    datasets: [{
      data: items.map(i => i.amount),
      backgroundColor: CHART_COLORS.slice(0, items.length),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }

  useChart(canvasRef, data, DONUT_OPTIONS as ChartOptions, 'doughnut')

  if (loading) return (
    <div className="h-44 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="h-44 flex flex-col items-center justify-center text-center">
      <PieChart size={28} className="text-gray-200 mb-2" />
      <p className="text-gray-400 text-sm">{emptyMsg}</p>
    </div>
  )

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative flex-shrink-0 w-40 h-40">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="font-mono font-bold text-sm text-gray-900 leading-tight">{total}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{centerLabel}</p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex-1 min-w-0 space-y-2 max-h-40 overflow-y-auto pr-1">
        {items.slice(0, 8).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <p className="text-xs text-gray-700 font-medium truncate">{item.label}</p>
                <p className="text-xs text-gray-400 font-mono flex-shrink-0">{item.percentage.toFixed(1)}%</p>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.percentage}%`, backgroundColor: CHART_COLORS[i] }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Months range selector ─────────────────────────────────────────────────────

const TREND_RANGES = [
  { label: '3B', months: 3 },
  { label: '6B', months: 6 },
  { label: '12B', months: 12 },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
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
  const [year, setYear]   = useState(now.getFullYear())
  const [trendMonths, setTrendMonths] = useState(6)

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1)
  }
  const isNextDisabled = month === now.getMonth() + 1 && year === now.getFullYear()

  const { data: summary,   loading: sumLoading  } = useApi(() => api.reports.summary(month, year), [month, year])
  const { data: expense,   loading: expLoading  } = useApi(() => api.reports.expenseBreakdown(month, year), [month, year])
  const { data: income,    loading: incLoading  } = useApi(() => api.reports.incomeBreakdown(month, year), [month, year])
  const { data: trendData, loading: trendLoading } = useApi(() => api.reports.trend(trendMonths), [trendMonths])

  // Calculate delta vs prev month: we don't have prev month data fetched separately,
  // so use trend data if available
  const pm = month === 1 ? 12 : month - 1
  const py = month === 1 ? year - 1 : year
  const items = trendData?.items ?? []

  const prevMonthData = items.find(i => i.month === pm && i.year === py) ?? null

  const incomeDelta = summary && prevMonthData && prevMonthData.income > 0
    ? ((summary.total_income - prevMonthData.income) / prevMonthData.income) * 100
    : null
  const expenseDelta = summary && prevMonthData && prevMonthData.expense > 0
    ? ((summary.total_expense - prevMonthData.expense) / prevMonthData.expense) * 100
    : null
  const surplusDelta = null

  const expenseItems = (expense?.items ?? []).map(i => ({
    label: i.category_name, icon: i.category_icon, amount: i.amount, percentage: i.percentage,
  }))
  const incomeItems = (income?.items ?? []).map(i => ({
    label: i.category_name, icon: i.category_icon, amount: i.amount, percentage: i.percentage,
  }))

  const { data, loading: nwLoading } = useApi(() => api.reports.netWorth())
  const isLoading = nwLoading

  const accounts = data?.accounts ?? []
  const maxBalance = Math.max(...accounts.map(a => Math.abs(a.current_balance)), 1)

  const typeColor: Record<string, string> = {
    bank: 'bg-ocean-400', cash: 'bg-mint-400',
    ewallet: 'bg-brand-500', investment: 'bg-gold-400',
  }

  
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Laporan</h1>
          <p className="text-gray-400 text-sm">Analisis keuangan bulanan & trend</p>
          
          <button
            onClick={() => toggleBalance()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-card p-4 mb-5 animate-fade-up" style={{ animationDelay: '40ms', animationFillMode: 'both' }}>
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-display font-bold text-gray-900">{MONTH_NAMES[month - 1]}</p>
          <p className="text-xs text-gray-400">{year}</p>
        </div>
        <button onClick={nextMonth} disabled={isNextDisabled}
          className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5 animate-fade-up" style={{ animationDelay: '80ms', animationFillMode: 'both' }}>
        <KpiCard
          label="Pemasukan" value={maskValue(formatRupiah(summary?.total_income ?? 0))}
          icon={TrendingUp} color="text-mint-500" bg="bg-mint-400/15"
          delta={incomeDelta} loading={sumLoading}
        />
        <KpiCard
          label="Pengeluaran" value={maskValue(formatRupiah(summary?.total_expense ?? 0))}
          icon={TrendingDown} color="text-coral-500" bg="bg-coral-400/15"
          delta={expenseDelta} loading={sumLoading}
        />
        <div className="col-span-2 md:col-span-1">
          <KpiCard
            label={summary && summary.surplus_deficit >= 0 ? 'Surplus' : 'Defisit'}
            value={maskValue(formatRupiah(summary ? Math.abs(summary.surplus_deficit) : 0))}
            icon={summary && summary.surplus_deficit < 0 ? TrendingDown : TrendingUp}
            color={summary && summary.surplus_deficit < 0 ? 'text-coral-500' : 'text-brand-600'}
            bg={summary && summary.surplus_deficit < 0 ? 'bg-coral-400/15' : 'bg-brand-400/15'}
            delta={surplusDelta} loading={sumLoading}
          />
        </div>
      </div>

      {/* Breakdown charts */}
      <div className="grid md:grid-cols-2 gap-4 mb-5 animate-fade-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>

        {/* Expense breakdown */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-coral-400/15 flex items-center justify-center">
              <TrendingDown size={15} className="text-coral-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm">Pengeluaran</h3>
              <p className="text-xs text-gray-400">per kategori</p>
            </div>
          </div>
          <DonutChart
            items={expenseItems}
            total={maskValue(formatRupiah(expense?.total ?? 0))}
            centerLabel="total"
            loading={expLoading}
            emptyMsg="Belum ada pengeluaran"
          />
        </div>

        {/* Income breakdown */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-mint-400/15 flex items-center justify-center">
              <TrendingUp size={15} className="text-mint-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm">Pemasukan</h3>
              <p className="text-xs text-gray-400">per kategori</p>
            </div>
          </div>
          <DonutChart
            items={incomeItems}
            total={maskValue(formatRupiah(income?.total ?? 0))}
            centerLabel="total"
            loading={incLoading}
            emptyMsg="Belum ada pemasukan"
          />
        </div>
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-5 animate-fade-up" style={{ animationDelay: '160ms', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className={cn(theme.badgeBg, "w-8 h-8 rounded-xl flex items-center justify-center")}>
              <BarChart2 size={15} className={cn(theme.accentText)} />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm">Trend Keuangan</h3>
              <p className="text-xs text-gray-400">pemasukan vs pengeluaran</p>
            </div>
          </div>
          {/* Range selector */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {TREND_RANGES.map(({ label, months }) => (
              <button
                key={months}
                onClick={() => setTrendMonths(months)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  trendMonths === months
                    ? cn(theme.accentText, 'bg-white shadow-sm')
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart items={trendData?.items ?? []} loading={trendLoading} />
      </div>

      {/* Net worth section */}
      <div className="animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className={cn(theme.badgeBg, "w-8 h-8 rounded-xl flex items-center justify-center")}
            >
              <Wallet size={15} className={cn(theme.accentText)} />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm">Net Worth</h3>
              <p className="text-xs text-gray-400">Saldo per rekening</p>
            </div>
            {!isLoading && data && (
              <div className="ml-auto text-right">
                <p className={cn(theme.accentText, "font-mono font-bold")}>{maskValue(formatRupiah(data.net_worth))}</p>
                <p className="text-xs text-gray-400">total aset</p>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <p className="text-gray-400 text-sm">Belum ada rekening</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map(acc => {
                const pct = (Math.abs(acc.current_balance) / maxBalance) * 100
                const colorClass = typeColor[acc.type] ?? 'bg-gray-300'
                return (
                  <div key={acc.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{acc.icon || '🏦'}</span>
                        <p className="text-sm font-medium text-gray-700 truncate">{acc.name}</p>
                      </div>
                      <p className={cn(
                        'font-mono font-semibold text-sm flex-shrink-0 ml-2',
                        acc.current_balance >= 0 ? 'text-gray-900' : 'text-coral-500',
                      )}>
                        {maskValue(formatRupiah(acc.current_balance))}
                      </p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', colorClass)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Debt & receivable summary */}
          {!isLoading && data && (data.total_debt > 0 || data.total_receivable > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
              {data.total_debt > 0 && (
                <div className="bg-coral-400/8 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Total Hutang</p>
                  <p className="font-mono font-bold text-coral-500 text-sm">{maskValue(formatRupiah(data.total_debt))}</p>
                </div>
              )}
              {data.total_receivable > 0 && (
                <div className="bg-mint-400/8 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Total Piutang</p>
                  <p className="font-mono font-bold text-mint-500 text-sm">{maskValue(formatRupiah(data.total_receivable))}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
