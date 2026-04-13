import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import { useApi } from './useApi'

export type OnboardingStatus =
  | 'loading'
  | 'no_spreadsheet'    // Belum ada connect ke spreadsheet
  | 'no_account'        // 0 rekening → tampilkan tour buat rekening + transaksi
  | 'no_transaction'    // ≥1 rekening, 0 transaksi → tampilkan prompt transaksi pertama
  | 'one_account'       // tepat 1 rekening aktif (dipakai di TransfersPage)
  | 'complete'          // ≥1 rekening + ≥1 transaksi → user sudah aktif

// ── Dismiss flag (localStorage) ───────────────────────────────────────────────
// Hanya menyimpan keputusan "user sengaja skip" — bukan penanda selesai onboarding.
// Kalau user akhirnya buat rekening, DB yang jadi sumber kebenaran → flag ini tidak relevan.
const DISMISS_KEY = 'dompetku_tour_dismissed'

function isDismissed(): boolean {
  try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
}

function setDismissed() {
  try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* noop */ }
}

function clearDismissed() {
  try { localStorage.removeItem(DISMISS_KEY) } catch { /* noop */ }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export interface OnboardingState {
  status: OnboardingStatus
  accountCount: number
  hasTransaction: boolean
  loading: boolean
  /** Panggil setelah user berhasil buat rekening/transaksi → refresh dari DB */
  refetch: () => void
  /** Panggil saat user klik "Lewati" → simpan dismiss flag, tour tidak muncul lagi */
  dismiss: () => void
}

export function useOnboarding(): OnboardingState {
  const [dismissed, setDismissedState] = useState(() => isDismissed())

  const { data: accountData, loading: accLoading, refetch: refetchAccounts } = useApi(
    () => api.accounts.list()
  )
  const { data: txData, loading: txLoading, refetch: refetchTx } = useApi(
    () => api.transactions.list({ per_page: 1, type: "expense" })
  )
  const { data: spreadsheetData, loading: spreadsheetLoading, refetch: refetchSpreadsheet } = useApi(
    () => api.spreadsheet.get()
  )

  const refetch = useCallback(() => {
    // Saat user berhasil buat rekening → hapus dismiss flag supaya
    // kalau status kembali perlu onboarding (edge case) tour bisa muncul lagi.
    clearDismissed()
    setDismissedState(false)
    refetchAccounts()
    refetchTx()
    refetchSpreadsheet()
  }, [refetchAccounts, refetchTx, refetchSpreadsheet])

  const dismiss = useCallback(() => {
    setDismissed()
    setDismissedState(true)
  }, [])

  const loading = accLoading || txLoading || spreadsheetLoading

  if (loading) return { status: 'loading', accountCount: 0, hasTransaction: false, loading: true, refetch, dismiss }

  const activeAccounts = (accountData?.data ?? []).filter((a: { is_active: boolean }) => a.is_active)
  const accountCount   = activeAccounts.length
  const hasTransaction = (txData?.meta?.total ?? 0) > 0
  const hasSpreadsheet = !!spreadsheetData?.spreadsheet_id

  // Kalau user sudah punya spreadsheet → dismiss flag tidak relevan, clear it
  if (hasSpreadsheet && isDismissed()) clearDismissed()

  let status: OnboardingStatus = 'complete'
  if (!hasSpreadsheet)                                 status = 'no_spreadsheet'
  else if (accountCount === 0)                         status = 'no_account'
  else if (accountCount === 1 && !hasTransaction)      status = 'no_transaction'
  else if (accountCount === 1)                         status = 'one_account'
  else if (!hasTransaction)                            status = 'no_transaction'

  // Kalau user dismiss dan belum punya rekening → sembunyikan tour
  if (dismissed && accountCount === 0 && hasSpreadsheet) status = 'complete'

  return { status, accountCount, hasTransaction, loading: false, refetch, dismiss }
}