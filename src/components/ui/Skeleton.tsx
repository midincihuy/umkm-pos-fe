import { cn } from '../../lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gray-100 rounded-xl animate-pulse', className)} />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-11 h-11 rounded-xl" />
      </div>
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-6 w-32" />
    </div>
  )
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-3.5 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-24" />
    </div>
  )
}
