import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Search, Filter, Plus, Pencil, Trash2, TrendingUp, TrendingDown, ArrowLeftRight, ChevronLeft, ChevronRight, Eye, EyeOff, Download, } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api, Transaction } from '../lib/api'
import { formatRupiah, MONTH_NAMES } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import TransactionForm from '../components/transactions/TransactionForm'
import { TransactionRowSkeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'
import { theme } from '../lib/theme'

const now = new Date()

const TYPE_LABELS: Record<string, string> = {
  income: 'Pemasukan', expense: 'Pengeluaran', transfer: 'Transfer',
  debt_payment: 'Cicilan', opening_balance: 'Saldo Awal', adjustment: 'Penyesuaian',
}

const TYPE_FILTER = [
  { value: '', label: 'Semua' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'transfer', label: 'Transfer' },
]

function TxIcon({ type }: { type: Transaction['type'] }) {
  const map: Record<string, { emoji: string; bg: string }> = {
    income: { emoji: '💰', bg: 'bg-mint-400/15' }, expense: { emoji: '💸', bg: 'bg-coral-400/15' },
    transfer: { emoji: '↔️', bg: 'bg-ocean-400/15' }, debt_payment: { emoji: '📋', bg: 'bg-gold-400/15' },
    opening_balance: { emoji: '🏦', bg: 'bg-brand-400/15' }, adjustment: { emoji: '⚖️', bg: 'bg-gray-100' },
  }
  const { emoji, bg } = map[type] ?? { emoji: '💳', bg: 'bg-gray-100' }
  return <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0', bg)}>{emoji}</div>
}

const canEdit   = (t: Transaction['type']) => t === 'income' || t === 'expense'
const canDelete = (t: Transaction['type']) => t === 'income' || t === 'expense'
// Turunkan ukuran font berdasarkan panjang string value
function valueFontSize(value: string): string {
  const len = value.length
  if (len <= 12) return 'text-sm'
  if (len <= 16) return 'text-xs'
  if (len <= 20) return 'text-[0.5rem]'
  return 'text-xs'
}
export default function TransactionsPage() {
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
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Debounce search input to reduce API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      // Reset to page 1 when search changes
      setPage(1)
    }, 2000)

    return () => clearTimeout(timer)
  }, [search])


  // Fetch filtered data from API directly with debounced search
  const { data, loading, refetch } = useApi(
    () => api.transactions.list({ month, year, page, per_page: 20, type: typeFilter || undefined, search: debouncedSearch || undefined }),
    [month, year, page, typeFilter, debouncedSearch])

  // Update search input display value when debouncedSearch changes (for accessibility)
  useEffect(() => {
    const input = document.querySelector('input[placeholder="Cari transaksi..."]') as HTMLInputElement
    if (input && input.value !== search) {
      input.value = search
    }
  }, [debouncedSearch, search])
  const { data: accountsData }   = useApi(() => api.accounts.list())
  const { data: categoriesData } = useApi(() => api.categories.list())

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1); setPage(1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1); setPage(1) }
  const isNextDisabled = month === now.getMonth() + 1 && year === now.getFullYear()

  // Data is already filtered by API, no need for client-side filtering
  const filtered = data?.data ?? []

  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = tx.date.split('T')[0]; if (!acc[key]) acc[key] = []; acc[key].push(tx); return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const handleCreate = async (body: Parameters<typeof api.transactions.create>[0]) => {
    setSubmitting(true)
    try { await api.transactions.create(body); toast.success('Transaksi dicatat'); setCreateOpen(false); refetch() }
    catch (e) { toast.error((e as Error).message) } finally { setSubmitting(false) }
  }
  const handleEdit = async (body: Parameters<typeof api.transactions.update>[1]) => {
    if (!editTarget) return; setSubmitting(true)
    try { await api.transactions.update(editTarget.id, body); toast.success('Transaksi diperbarui'); setEditTarget(null); refetch() }
    catch (e) { toast.error((e as Error).message) } finally { setSubmitting(false) }
  }
  const handleDelete = async () => {
    if (!deleteTarget) return; setSubmitting(true)
    try { await api.transactions.delete(deleteTarget.id); toast.success('Transaksi dihapus'); setDeleteTarget(null); refetch() }
    catch (e) { toast.error((e as Error).message) } finally { setSubmitting(false) }
  }

  const handleExportExcel = async () => {
    try {
      // Fetch ALL transactions for current month/year (no pagination limits)
      const allTransactions = await api.transactions.list({ month, year, per_page: 1000 })
      const allTxData = allTransactions.data ?? []

      // Apply all active filters (search and type) to full dataset
      const filteredAll = allTxData.filter(tx => {
        if (typeFilter && tx.type !== typeFilter) return false
        if (search) {
          const q = search.toLowerCase()
          return tx.description?.toLowerCase().includes(q) || tx.category_name?.toLowerCase().includes(q) || tx.account_name?.toLowerCase().includes(q)
        }
        return true
      })

      if (!filteredAll.length) return toast.error('Tidak ada transaksi untuk diekspor')

      const exportData = filteredAll.map(tx => ({
        ID: tx.id,
        Type: tx.type,
        Tanggal: new Date(tx.date).toISOString().slice(0, 10).replace('T', ' '),
        Jumlah: tx.amount,
        Kategori: tx.category_name || '-',
        Akun: tx.account_name,
        AkunTo: '',
        Keterangan: tx.description || '-',
        'Created At': tx.created_at ? new Date(tx.created_at).toISOString().slice(0, 19).replace('T', ' ') : '-',
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi')
      XLSX.writeFile(workbook, `Transaksi-${MONTH_NAMES[month-1]}-${year}.xlsx`)
      toast.success('Berhasil mengekspor ke Excel')
    } catch (e) {
      toast.error((e as Error).message || 'Gagal mengekspor data')
    }
  }

  const accounts   = accountsData?.data ?? []
  const categories = categoriesData ?? { income: [], expense: [] };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Transaksi</h1>
          <p className="text-gray-400 text-sm">Riwayat pemasukan dan pengeluaran</p>
          
          <button
            onClick={() => toggleBalance()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r text-white text-sm font-semibold shadow-glow-sm transition-all hover:-translate-y-0.5"
          style={{ background: theme.btnBg }}
          >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-card p-4 mb-4 animate-fade-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <p className="font-display font-bold text-gray-900">{MONTH_NAMES[month - 1]}</p>
          <p className="text-xs text-gray-400">{year}</p>
        </div>
        <button onClick={nextMonth} disabled={isNextDisabled} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
      </div>

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          {[
            { 
              label: 'Pemasukan',
              value: data.data.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0),
              icon: TrendingUp,
              color: 'text-mint-500',
              bg: 'bg-mint-400/10' 
            },
            { 
              label: 'Pengeluaran', 
              value: data.data.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0),
              icon: TrendingDown,
              color: 'text-coral-500',
              bg: 'bg-coral-400/10'
            },
            { 
              label: 'Transfer',
              value: data.data.filter(t => t.type==='transfer' && t.balance_impact > 0).reduce((s,t)=>s+Math.abs(t.balance_impact),0),
              icon: ArrowLeftRight,
              color: 'text-ocean-500',
              bg: 'bg-ocean-400/10' 
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={cn('rounded-xl p-3 flex items-center gap-2', bg)}>
              <Icon size={14} className={cn('flex-shrink-0', color)} />
              <div className="min-w-0">
                <p className="text-xs text-gray-400 truncate">{label}</p>
                <p className={cn('font-mono font-semibold leading-tight break-all', color, valueFontSize(formatRupiah(value)))}>{maskValue(formatRupiah(value))}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 animate-fade-up" style={{ animationDelay: '140ms', animationFillMode: 'both' }}>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input type="text" placeholder="Cari transaksi..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200 placeholder:text-gray-300" />
          {debouncedSearch !== search && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Mencari...
            </span>
          )}
        </div>
        <div className="relative">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200 text-gray-600">
            {TYPE_FILTER.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <Filter size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        </div>
        <button onClick={handleExportExcel}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors">
          <Download size={16} /> Export
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-up" style={{ animationDelay: '180ms', animationFillMode: 'both' }}>
        {loading ? Array.from({ length: 6 }).map((_, i) => <TransactionRowSkeleton key={i} />) :
         sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-2xl">📭</div>
            <p className="text-gray-500 font-medium">Tidak ada transaksi</p>
            <p className="text-gray-300 text-sm mt-1">{search||typeFilter?'Coba ubah filter':`Belum ada catatan di ${MONTH_NAMES[month-1]} ${year}`}</p>
          </div>
        ) : sortedDates.map(date => (
          <div key={date}>
            <div className="px-5 py-2.5 bg-gray-50/80 border-y border-gray-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            {grouped[date].map((tx, ti) => (
              <div key={tx.id}
                className={cn('flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group', ti<grouped[date].length-1 && 'border-b border-gray-50')}
              >
                <TxIcon type={tx.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-gray-800 truncate">{tx.description || tx.category_name || TYPE_LABELS[tx.type]}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 truncate">{tx.account_name}</span>
                    {tx.category_name && <><span className="text-gray-200">·</span><span className="text-xs text-gray-300 truncate">{tx.category_name}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit(tx.type) && (
                      <button onClick={() => setEditTarget(tx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-brand-500 hover:bg-brand-50 transition-colors">
                        <Pencil size={13} />
                      </button>
                    )}
                    {canDelete(tx.type) && (
                      <button onClick={() => setDeleteTarget(tx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={cn('font-mono font-semibold text-sm', tx.balance_impact>0?'text-mint-500':tx.balance_impact<0?'text-coral-500':'text-gray-400')}>
                      {tx.balance_impact>0?'+':''}{maskValue(formatRupiah(tx.balance_impact))}
                    </p>
                    <p className="text-xs text-gray-300">{TYPE_LABELS[tx.type]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {data && data.meta.total_pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">{data.meta.total} transaksi · Hal {data.meta.page}/{data.meta.total_pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p=>Math.min(data.meta.total_pages,p+1))} disabled={page>=data.meta.total_pages} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Catat Transaksi" size="md">
        <TransactionForm accounts={accounts} categories={categories}
          onSubmit={handleCreate as Parameters<typeof TransactionForm>[0]['onSubmit']}
          onClose={() => setCreateOpen(false)} loading={submitting} />
      </Modal>
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Transaksi" size="md">
        {editTarget && <TransactionForm initial={editTarget} accounts={accounts} categories={categories}
          onSubmit={handleEdit as Parameters<typeof TransactionForm>[0]['onSubmit']}
          onClose={() => setEditTarget(null)} loading={submitting} />}
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={submitting} title="Hapus Transaksi"
        message={`Hapus transaksi "${deleteTarget?.description || deleteTarget?.category_name}"? Saldo rekening akan dikembalikan.`} />
    </div>
  )
}
