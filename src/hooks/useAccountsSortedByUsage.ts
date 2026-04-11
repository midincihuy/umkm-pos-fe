// src/hooks/useAccountsSortedByUsage.ts
//
// Hook yang mengembalikan daftar rekening sudah diurutkan berdasarkan
// frekuensi pemakaian dalam 3 bulan terakhir.
//
// Cara pakai:
//   const { accounts, loading } = useAccountsSortedByUsage()
//
// Tidak perlu prop apapun. Data di-cache di module level sehingga
// beberapa komponen yang pakai hook ini tidak akan double-fetch.

import { useState, useEffect } from 'react'
import { api, Account } from '../lib/api'

// ── Module-level cache ────────────────────────────────────────────────────────
// Shared antar semua komponen yang pakai hook ini dalam satu session.
// Di-reset ketika user refresh halaman.
let cachedSorted: Account[] | null = null
let cachePromise: Promise<Account[]> | null = null

// ── Helper: 3 bulan terakhir sebagai {month, year}[] ─────────────────────────
function last3Months(): { month: number; year: number }[] {
  const result = []
  const now = new Date()
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({ month: d.getMonth() + 1, year: d.getFullYear() })
  }
  return result
}

// ── Core logic ────────────────────────────────────────────────────────────────
async function fetchSortedAccounts(): Promise<Account[]> {
  // 1. Fetch semua rekening aktif
  const accountList = await api.accounts.list()
  const accounts = accountList.data ?? []

  if (accounts.length === 0) return []

  // 2. Fetch transaksi 3 bulan terakhir secara paralel
  //    per_page=100 cukup untuk menghitung frekuensi (bukan untuk tampil semua)
  const months = last3Months()
  const txResults = await Promise.allSettled(
    months.map(({ month, year }) =>
      api.transactions.list({ month, year, per_page: 100, page: 1 })
    )
  )

  // 3. Hitung frekuensi per account_id
  const freq: Record<string, number> = {}

  for (const result of txResults) {
    if (result.status !== 'fulfilled') continue
    for (const tx of result.value.data ?? []) {
      if (!tx.account_id) continue
      freq[tx.account_id] = (freq[tx.account_id] ?? 0) + 1
    }
  }

  // 4. Sort: lebih banyak transaksi → lebih atas
  //    Rekening yang tidak pernah dipakai tetap muncul, di bagian bawah
  const sorted = [...accounts].sort((a, b) => {
    const fa = freq[a.id] ?? 0
    const fb = freq[b.id] ?? 0
    if (fb !== fa) return fb - fa           // descending by frequency
    return a.name.localeCompare(b.name)     // alphabetical sebagai tiebreaker
  })

  return sorted
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export interface UseAccountsSortedResult {
  /** Daftar rekening sudah diurutkan — siap pakai langsung di dropdown */
  accounts: Account[]
  loading:  boolean
  error:    string | null
  /** Paksa re-fetch (misal setelah user tambah rekening baru) */
  refetch:  () => void
}

export function useAccountsSortedByUsage(): UseAccountsSortedResult {
  const [accounts, setAccounts] = useState<Account[]>(cachedSorted ?? [])
  const [loading,  setLoading]  = useState(cachedSorted === null)
  const [error,    setError]    = useState<string | null>(null)
  const [tick,     setTick]     = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        // Pakai promise yang sudah berjalan jika ada (avoid double-fetch)
        if (!cachePromise) {
          cachePromise = fetchSortedAccounts()
        }

        const sorted = await cachePromise
        cachedSorted = sorted
        if (!cancelled) setAccounts(sorted)
      } catch (e) {
        cachePromise = null  // reset agar bisa retry
        if (!cancelled) setError((e as Error).message ?? 'Gagal memuat rekening')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [tick])

  const refetch = () => {
    // Hapus cache → trigger re-fetch
    cachedSorted = null
    cachePromise = null
    setTick(t => t + 1)
  }

  return { accounts, loading, error, refetch }
}

/** Bersihkan cache dari luar (misal saat logout) */
export function clearAccountUsageCache() {
  cachedSorted = null
  cachePromise = null
}