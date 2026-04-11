import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateStr))
}

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export function getAccountTypeLabel(type: string): string {
  const map: Record<string, string> = {
    bank: 'Bank', cash: 'Tunai', ewallet: 'E-Wallet', investment: 'Investasi',
  }
  return map[type] ?? type
}

export function getAccountTypeColor(type: string): string {
  const map: Record<string, string> = {
    bank:       'bg-ocean-400/15 text-ocean-500',
    cash:       'bg-mint-400/15 text-mint-500',
    ewallet:    'bg-brand-400/15 text-brand-600',
    investment: 'bg-gold-400/15 text-gold-500',
  }
  return map[type] ?? 'bg-gray-100 text-gray-500'
}
