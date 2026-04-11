import { useState, useEffect } from 'react'
import { Account, Category, Transaction, CreateTransactionBody, UpdateTransactionBody } from '../../lib/api'
import { Field, Input, Select, AmountInput, Textarea } from '../ui/FormField'
import { cn } from '../../lib/utils'
import { AccountSelect } from '../ui/AccountSelect'

const now = new Date()

interface FormData {
  type: 'income' | 'expense'
  account_id: string
  category_id: string
  amount: string
  date: string
  description: string
  notes: string
}

interface Errors { account_id?: string; category_id?: string; amount?: string; date?: string }

function validate(form: FormData): Errors {
  const e: Errors = {}
  if (!form.account_id)  e.account_id  = 'Pilih rekening'
  if (!form.category_id) e.category_id = 'Pilih kategori'
  if (!form.amount || Number(form.amount) <= 0) e.amount = 'Nominal harus lebih dari 0'
  if (!form.date)        e.date        = 'Tanggal wajib diisi'
  return e
}

interface TransactionFormProps {
  initial?: Transaction
  accounts: Account[]
  categories: { income: Category[]; expense: Category[] }
  onSubmit: (data: CreateTransactionBody | UpdateTransactionBody) => Promise<void>
  onClose: () => void
  loading: boolean
}

export default function TransactionForm({
  initial, accounts, categories, onSubmit, onClose, loading,
}: TransactionFormProps) {
  const parts = now.toLocaleDateString('id-ID').split('/')
  const today = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`

  const [form, setForm] = useState<FormData>({
    type:        (initial?.type === 'income' || initial?.type === 'expense' ? initial.type : 'expense'),
    account_id:  initial?.account_id ?? (accounts[0]?.id ?? ''),
    category_id: initial?.category_id ?? '',
    amount:      initial ? String(initial.amount) : '',
    date:        initial ? initial.date.split('T')[0] : today,
    description: initial?.description ?? '',
    notes:       initial?.notes ?? '',
  })
  const [errors, setErrors] = useState<Errors>({})

  // Reset category when type changes
  useEffect(() => {
    if (!initial) setForm(f => ({ ...f, category_id: '' }))
  }, [form.type, initial])

  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  const availableCategories = form.type === 'income' ? categories.income : categories.expense

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    if (initial) {
      const body: UpdateTransactionBody = {}
      if (form.category_id !== initial.category_id) body.category_id = form.category_id
      if (Number(form.amount) !== initial.amount) body.amount = Number(form.amount)
      if (form.date !== initial.date.split('T')[0]) body.date = form.date
      if (form.description !== initial.description) body.description = form.description
      if (form.notes !== initial.notes) body.notes = form.notes
      await onSubmit(body)
    } else {
      await onSubmit({
        type:        form.type,
        account_id:  form.account_id,
        category_id: form.category_id,
        amount:      Number(form.amount),
        date:        form.date,
        description: form.description || undefined,
        notes:       form.notes || undefined,
      } as CreateTransactionBody)
    }
  }

  const submitLabel = loading
    ? 'Menyimpan...'
    : initial
      ? 'Simpan'
      : form.type === 'expense' ? 'Catat Pengeluaran' : 'Catat Pemasukan'

  const submitClass = cn(
    'flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50',
    form.type === 'expense'
      ? 'bg-gradient-to-r from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-500'
      : 'bg-gradient-to-r from-mint-400 to-mint-500 hover:from-mint-500 hover:to-mint-500',
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">

      {/* ── Scrollable fields ── */}
      <div className="space-y-4">

        {/* Type toggle — only for create */}
        {!initial && (
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {(['expense', 'income'] as const).map(t => (
              <button key={t} type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                  form.type === t
                    ? t === 'expense'
                      ? 'bg-white text-coral-500 shadow-sm'
                      : 'bg-white text-mint-500 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                {t === 'expense' ? '💸 Pengeluaran' : '💰 Pemasukan'}
              </button>
            ))}
          </div>
        )}

        {/* Rekening — only for create */}
        {!initial && (
          <Field label="Rekening" required error={errors.account_id}>
            {/* <Select value={form.account_id} onChange={set('account_id')} error={!!errors.account_id}>
              <option value="" disabled>Pilih rekening</option>
              {accounts.filter(a => a.is_active).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select> */}
            <AccountSelect
              value={form.account_id}
              onChange={id => setForm(f => ({ ...f, account_id: id }))}
              placeholder="Pilih rekening"
              showUsage={true}
              // excludeId={form.to_account_id}   // opsional: exclude rekening tertentu
              error={!!errors.account_id}
            />
          </Field>
        )}

        {/* Nominal */}
        <Field label="Nominal" required error={errors.amount}>
          <AmountInput
            value={form.amount} onChange={set('amount')} error={!!errors.amount}
            placeholder="0" autoFocus={!initial}
          />
        </Field>

        {/* Kategori */}
        <Field label="Kategori" required error={errors.category_id}>
          <Select value={form.category_id} onChange={set('category_id')} error={!!errors.category_id}>
            <option value="" disabled>Pilih kategori</option>
            {availableCategories.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </Select>
        </Field>

        {/* Tanggal */}
        <Field label="Tanggal" required error={errors.date}>
          <Input type="date" value={form.date} onChange={set('date')} max={today} error={!!errors.date} />
        </Field>

        {/* Deskripsi */}
        <Field label="Deskripsi">
          <Input value={form.description} onChange={set('description')} placeholder="Opsional" />
        </Field>

        {/* Notes */}
        <Field label="Catatan">
          <Textarea value={form.notes} onChange={set('notes')} placeholder="Catatan tambahan" rows={2} />
        </Field>
      </div>

      {/* ── Tombol aksi — sticky di bawah, selalu terlihat ── */}
      <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button type="submit" disabled={loading} className={submitClass}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
