import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { api, Category, CategoryType } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Field, Input } from '../components/ui/FormField'
import { Skeleton } from '../components/ui/Skeleton'
import { cn } from '../lib/utils'

// ── Emoji picker (simplified) ─────────────────────────────────────────────────

const EXPENSE_EMOJIS = ['🍽️','🏠','📱','📚','🚗','💊','👗','🔧','👨‍👩‍👧','📋','🏦','💳','🎯','📦','🛒','☕','🎬','✈️','💇','🐾']
const INCOME_EMOJIS  = ['💰','🎁','🏪','📈','🤝','💼','🎓','🏆','💵','🌟','📦','🎨','🔑','⚡']

// ── Colors ────────────────────────────────────────────────────────────────────

const COLORS = [
  '#c62af5','#45aaf2','#26de81','#fed330','#ff6b6b',
  '#a29bfe','#fd79a8','#00b894','#e17055','#74b9ff',
  '#55efc4','#fdcb6e','#636e72','#ff9f43','#ee5a24',
]

// ── Form ──────────────────────────────────────────────────────────────────────

function CategoryForm({ initial, type, onSubmit, onClose, loading }: {
  initial?: Category; type?: CategoryType
  onSubmit: (b: { name: string; type: string; icon?: string; color?: string }) => Promise<void>
  onClose: () => void; loading: boolean
}) {
  const [form, setForm] = useState({
    name:  initial?.name  ?? '',
    type:  initial?.type  ?? type ?? 'expense' as CategoryType,
    icon:  initial?.icon  ?? '',
    color: initial?.color ?? COLORS[0],
  })
  const [errors, setErrors] = useState<{ name?: string }>({})

  const emojis = form.type === 'expense' ? EXPENSE_EMOJIS : INCOME_EMOJIS

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setErrors({ name: 'Nama kategori wajib diisi' }); return }
    await onSubmit({
      name: form.name.trim(),
      type: form.type,
      icon:  form.icon  || undefined,
      color: form.color || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Type (only for create) */}
      {!initial && (
        <div className="grid grid-cols-2 gap-2">
          {(['expense', 'income'] as CategoryType[]).map(t => (
            <button key={t} type="button"
              onClick={() => setForm(f => ({ ...f, type: t, icon: '' }))}
              className={cn(
                'py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
                form.type === t
                  ? t === 'expense'
                    ? 'border-coral-500 bg-coral-400/10 text-coral-500'
                    : 'border-mint-500 bg-mint-400/10 text-mint-500'
                  : 'border-gray-100 text-gray-400 hover:border-gray-200',
              )}>
              {t === 'expense' ? '💸 Pengeluaran' : '💰 Pemasukan'}
            </button>
          ))}
        </div>
      )}

      <Field label="Nama Kategori" required error={errors.name}>
        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Contoh: Langganan Netflix..." error={!!errors.name} />
      </Field>

      {/* Icon picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Icon</label>
        <div className="flex flex-wrap gap-2">
          {emojis.map(emoji => (
            <button key={emoji} type="button"
              onClick={() => setForm(f => ({ ...f, icon: emoji }))}
              className={cn(
                'w-9 h-9 text-lg rounded-xl transition-all',
                form.icon === emoji
                  ? 'bg-brand-500/10 ring-2 ring-brand-400 scale-110'
                  : 'hover:bg-gray-100',
              )}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Warna</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button key={color} type="button"
              onClick={() => setForm(f => ({ ...f, color }))}
              className={cn(
                'w-7 h-7 rounded-lg transition-all',
                form.color === color ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-105',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      {(form.icon || form.name) && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: form.color + '22' }}>
            {form.icon || '📦'}
          </div>
          <p className="text-sm font-semibold text-gray-800">{form.name || 'Nama Kategori'}</p>
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: form.color + '22', color: form.color }}>
            {form.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
          </span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50">
          {loading ? 'Menyimpan...' : initial ? 'Simpan' : 'Buat Kategori'}
        </button>
      </div>
    </form>
  )
}

// ── Category row ──────────────────────────────────────────────────────────────

function CategoryRow({ cat, onEdit, onDelete }: {
  cat: Category; onEdit: () => void; onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: (cat.color || '#888') + '22' }}>
        {cat.icon || '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
        {cat.is_system && <p className="text-xs text-gray-400">Sistem · tidak dapat diedit</p>}
      </div>
      {!cat.is_system && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button onClick={onEdit}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-brand-500 hover:bg-brand-50 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-coral-500 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

function CategorySection({ title, categories, color, onAdd, onEdit, onDelete }: {
  title: string; categories: Category[]; color: string
  onAdd: () => void; onEdit: (c: Category) => void; onDelete: (c: Category) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const system = categories.filter(c => c.is_system)
  const custom = categories.filter(c => !c.is_system)

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <button onClick={() => setCollapsed(c => !c)} className="flex items-center gap-2 flex-1">
          <span className={cn('w-2 h-2 rounded-full', color)} />
          <h3 className="font-display font-bold text-gray-900 text-sm">{title}</h3>
          <span className="text-xs text-gray-400">({categories.length})</span>
        </button>
        <button onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold transition-colors">
          <Plus size={13} /> Tambah
        </button>
      </div>

      {!collapsed && (
        <div className="divide-y divide-gray-50">
          {custom.length > 0 && (
            <>
              <div className="px-5 py-2 bg-gray-50/50">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Kustom</p>
              </div>
              {custom.map(c => (
                <CategoryRow key={c.id} cat={c} onEdit={() => onEdit(c)} onDelete={() => onDelete(c)} />
              ))}
            </>
          )}
          {system.length > 0 && (
            <>
              <div className="px-5 py-2 bg-gray-50/50">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Sistem</p>
              </div>
              {system.map(c => (
                <CategoryRow key={c.id} cat={c} onEdit={() => {}} onDelete={() => {}} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [createType, setCreateType] = useState<CategoryType | null>(null)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [delTarget,  setDelTarget]  = useState<Category | null>(null)
  const [saving,    setSaving]      = useState(false)
  const [deleting,  setDeleting]    = useState(false)
  const { success, error: toastError } = useToast()

  const { data, loading, refetch } = useApi(() => api.categories.list())
  const income  = data?.income  ?? []
  const expense = data?.expense ?? []

  const handleCreate = async (body: { name: string; type: string; icon?: string; color?: string }) => {
    setSaving(true)
    try {
      await api.categories.create(body)
      success('Kategori berhasil dibuat')
      setCreateType(null)
      refetch()
    } catch (e) { toastError((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleEdit = async (body: { name: string; type: string; icon?: string; color?: string }) => {
    if (!editTarget) return
    setSaving(true)
    try {
      await api.categories.update(editTarget.id, body)
      success('Kategori diperbarui')
      setEditTarget(null)
      refetch()
    } catch (e) { toastError((e as Error).message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delTarget) return
    setDeleting(true)
    try {
      await api.categories.delete(delTarget.id)
      success('Kategori dihapus')
      setDelTarget(null)
      refetch()
    } catch (e) { toastError((e as Error).message) }
    finally { setDeleting(false) }
  }

  const skeletonSection = (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 animate-pulse flex justify-between">
        <Skeleton className="h-4 w-32" /><Skeleton className="h-6 w-20 rounded-xl" />
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-3.5 flex-1" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">

      <div className="mb-6 animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Kategori</h1>
        <p className="text-gray-400 text-sm">Kelola kategori pemasukan dan pengeluaran</p>
      </div>

      <div className="space-y-4 animate-fade-up" style={{ animationDelay: '40ms', animationFillMode: 'both' }}>
        {loading ? (
          <>{skeletonSection}{skeletonSection}</>
        ) : (
          <>
            <CategorySection
              title="Pengeluaran" categories={expense} color="bg-coral-500"
              onAdd={() => setCreateType('expense')}
              onEdit={setEditTarget} onDelete={setDelTarget}
            />
            <CategorySection
              title="Pemasukan" categories={income} color="bg-mint-500"
              onAdd={() => setCreateType('income')}
              onEdit={setEditTarget} onDelete={setDelTarget}
            />
          </>
        )}
      </div>

      {/* Create */}
      <Modal open={!!createType} onClose={() => setCreateType(null)} title="Buat Kategori Baru">
        {createType && (
          <CategoryForm type={createType} onSubmit={handleCreate} onClose={() => setCreateType(null)} loading={saving} />
        )}
      </Modal>

      {/* Edit */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Kategori">
        {editTarget && (
          <CategoryForm initial={editTarget} onSubmit={handleEdit} onClose={() => setEditTarget(null)} loading={saving} />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete}
        title="Hapus Kategori" loading={deleting} confirmLabel="Hapus"
        message={`Hapus kategori "${delTarget?.name}"? Kategori yang sudah digunakan transaksi tidak dapat dihapus.`}
      />
    </div>
  )
}
