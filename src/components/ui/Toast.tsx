import { useState, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { cn } from '../../lib/utils'

type ToastType = 'success' | 'error'
interface Toast { id: number; type: ToastType; message: string }

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  let nextId = 0

  const dismiss = useCallback((id: number) =>
    setToasts(t => t.filter(x => x.id !== id)), [])

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++nextId
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => dismiss(id), 4000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismiss])

  const success = useCallback((m: string) => toast('success', m), [toast])
  const error   = useCallback((m: string) => toast('error', m),   [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg pointer-events-auto animate-fade-up',
              'max-w-xs text-sm font-medium',
              t.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white',
            )}
          >
            {t.type === 'success'
              ? <CheckCircle size={16} className="flex-shrink-0 text-mint-400" />
              : <XCircle    size={16} className="flex-shrink-0 text-white/80" />}
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
