import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, RefreshCw, Eye, EyeOff, } from 'lucide-react'
import { useState } from 'react'

import OnboardingTour from '../components/onboarding/OnboardingTour'
import { useOnboarding } from '../hooks/useOnboarding'
import { useAuth } from '../hooks/useAuth'
import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { theme }     from '../lib/theme'
import { formatRupiah, MONTH_NAMES, getAccountTypeLabel, getAccountTypeColor } from '../lib/utils'
import StatCard from '../components/ui/StatCard'
import { StatCardSkeleton, TransactionRowSkeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'

const now = new Date()
const currentMonth = now.getMonth() + 1
const currentYear = now.getFullYear()

export default function DashboardPage() {
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

  const { user } = useAuth()

  // ── Onboarding tour ──────────────────────────────────────────────────────
  const onboarding = useOnboarding()
  const showTour = !onboarding.loading &&
    (onboarding.status === 'no_account' || onboarding.status === 'no_transaction')

  const handleTourComplete = () => {
    onboarding.refetch()
    netWorth.refetch()
    summary.refetch()
    transactions.refetch()
  }

  const handleTourDismiss = () => {
    onboarding.dismiss()
  }
  const displayName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'Kamu'

  const summary = useApi(() => api.reports.summary(currentMonth, currentYear))
  const netWorth = useApi(() => api.reports.netWorth())
  const transactions = useApi(() => api.transactions.list({ month: currentMonth, year: currentYear, per_page: 5 }))

  const isLoading = summary.loading || netWorth.loading
  // ── Helpers ────────────────────────────────────────────────────────────────
  function txIconBg(type: string) {
    if (type === 'income')  return cn(theme.txIncomeBg)
    if (type === 'expense') return cn(theme.txExpenseBg)
    return cn(theme.txTransferBg)
  }
  function txAmtColor(balanceImpact: number) {
    return balanceImpact > 0 ? theme.txIncomeText : theme.txExpenseText
  }
  return (
    <div className={cn('p-6 md:p-8 max-w-5xl mx-auto space-y-6', theme.pageBg)}>

      {/* Header */}
      <div className="mb-8 animate-fade-up flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-body mb-1">
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
            Halo, {displayName} 👋
          </h1>
        </div>
        <button
          onClick={() => toggleBalance()}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Aset"
              value={maskValue(formatRupiah(netWorth.data?.total_assets ?? 0))}
              icon={Wallet}
              color="primary"
              delay={0}
            />
            <StatCard
              label="Pemasukan"
              value={maskValue(formatRupiah(summary.data?.total_income ?? 0))}
              icon={TrendingUp}
              color="positive"
              delay={80}
            />
            <StatCard
              label="Pengeluaran"
              value={maskValue(formatRupiah(summary.data?.total_expense ?? 0))}
              icon={TrendingDown}
              color="negative"
              delay={160}
            />
            <StatCard
              label={summary.data?.surplus_deficit != null && summary.data.surplus_deficit >= 0 ? 'Surplus' : 'Defisit'}
              value={maskValue(formatRupiah(Math.abs(summary.data?.surplus_deficit ?? 0)))}
              icon={ArrowLeftRight}
              color={summary.data?.surplus_deficit != null && summary.data.surplus_deficit >= 0 ? 'negative' : 'positive'}
              trend={
                summary.data
                  ? {
                      value: maskValue(formatRupiah(Math.abs(summary.data.surplus_deficit))),
                      positive: summary.data.surplus_deficit >= 0,
                    }
                  : undefined
              }
              delay={240}
            />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-5 gap-6">

        {/* Recent transactions */}
        <div className="md:col-span-3 bg-white rounded-2xl shadow-card animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className={cn('flex items-center justify-between px-5 py-4 border-b', theme.sidebarBorder)}>
            <h2 className="font-display font-semibold text-gray-900 text-sm">Transaksi Terbaru</h2>
            <a href="/transactions" className={cn('text-xs font-medium transition-colors hover:opacity-80', theme.linkText)}>
              Lihat semua →
            </a>
          </div>

          {transactions.loading ? (
            <div>
              {Array.from({ length: 4 }).map((_, i) => <TransactionRowSkeleton key={i} />)}
            </div>
          ) : transactions.data?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-3', theme.badgeBg)}>
                <ArrowLeftRight size={20} className={theme.accentText} />
              </div>
              <p className="text-gray-500 text-sm font-medium">Belum ada transaksi</p>
              <p className="text-gray-300 text-xs mt-1">Bulan ini belum ada catatan transaksi</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.data?.data?.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors">
                  {/* Icon */}
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', txIconBg(tx.type))}>
                    {tx.type === 'income'
                      ? <TrendingUp  size={15} className={theme.txIncomeText} />
                      : tx.type === 'expense'
                      ? <TrendingDown size={15} className={theme.txExpenseText} />
                      : <ArrowLeftRight size={15} className={theme.txTransferText} />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-gray-800 truncate">
                      {tx.description || tx.category_name || tx.type}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {tx.account_name} · {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  {/* Amount */}
                  <p className={cn('text-sm font-mono font-bold flex-shrink-0', txAmtColor(tx.balance_impact))}>
                    {tx.balance_impact > 0 ? '+' : ''}{maskValue(formatRupiah(tx.balance_impact))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accounts */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-card animate-fade-up" style={{ animationDelay: '280ms', animationFillMode: 'both' }}>
          <div className={cn('flex items-center justify-between px-5 py-4 border-b', theme.sidebarBorder)}>
            <h2 className="font-display font-semibold text-gray-900 text-sm">Rekening</h2>
            <a href="/accounts" className={cn('text-xs font-medium transition-colors hover:opacity-80', theme.linkText)}>
              Kelola →
            </a>
          </div>

          {netWorth.loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
                    <div className="h-2.5 bg-gray-100 rounded w-16" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </div>
              ))}
            </div>
          ) : netWorth.data?.accounts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
              <p className="text-gray-400 text-sm">Belum ada rekening</p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {netWorth.data?.accounts?.map((account) => (
                <div key={account.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0',
                    getAccountTypeColor(account.type)
                  )}>
                    {account.type === 'bank' ? '🏦' :
                     account.type === 'cash' ? '👛' :
                     account.type === 'ewallet' ? '📱' : '📈'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{account.name}</p>
                    <p className="text-xs text-gray-400">{getAccountTypeLabel(account.type)}</p>
                  </div>
                  <p className="font-mono text-sm font-semibold text-gray-700 flex-shrink-0 text-right">
                    {maskValue(formatRupiah(account.current_balance))}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Net worth */}
          {!netWorth.loading && (
            <div className="mx-3 mb-3 p-3 rounded-xl bg-gradient-to-r from-brand-500/8 to-ocean-400/8 border border-brand-100">
              <p className="text-xs text-gray-400 mb-1">Net Worth</p>
              <p className="font-display font-bold text-brand-600 text-base">
                {maskValue(formatRupiah(netWorth.data?.net_worth ?? 0))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error states */}
      {(summary.error || netWorth.error) && (
        <div className={cn('p-6 md:p-8 max-w-5xl mx-auto', theme.pageBg)}>
          <div className={cn('p-4 rounded-xl flex items-center gap-3 border', theme.errorBg, theme.errorBorder)}>

            <RefreshCw size={16} className={cn('flex-shrink-0', theme.errorText)} />
            <div>
              <p className={cn('text-sm font-semibold', theme.errorText)}>Gagal memuat data</p>
              <p className="text-xs text-gray-400 mt-0.5">{summary.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding tour */}
      {showTour && <OnboardingTour status={onboarding.status} onComplete={handleTourComplete} onDismiss={handleTourDismiss} />}
    </div>
  )
}