import { cn } from '../../lib/utils'

interface FieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}

export function Field({ label, error, required, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-coral-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-colors',
        'placeholder:text-gray-300 focus:outline-none focus:ring-2',
        error
          ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
          : 'border-gray-200 focus:ring-brand-100 focus:border-brand-300',
        className,
      )}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(
        'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-colors',
        'focus:outline-none focus:ring-2 appearance-none cursor-pointer',
        error
          ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
          : 'border-gray-200 focus:ring-brand-100 focus:border-brand-300',
        className,
      )}
    >
      {children}
    </select>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-colors resize-none',
        'placeholder:text-gray-300 focus:outline-none focus:ring-2',
        error
          ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
          : 'border-gray-200 focus:ring-brand-100 focus:border-brand-300',
        className,
      )}
    />
  )
}

export function AmountInput({ error, className, ...props }: InputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
      <input
        {...props}
        type="number"
        min="0"
        step="1"
        className={cn(
          'w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-white transition-colors',
          'placeholder:text-gray-300 focus:outline-none focus:ring-2',
          error
            ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
            : 'border-gray-200 focus:ring-brand-100 focus:border-brand-300',
          className,
        )}
      />
    </div>
  )
}
