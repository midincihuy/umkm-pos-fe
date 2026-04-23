import React, { useState } from 'react'
import { FileSpreadsheet, ExternalLink, RefreshCw, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../hooks/useOnboarding'
import { api } from '../lib/api'
import { GooglePicker } from '../components/GooglePicker'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useToast } from '../components/ui/Toast'
import { theme } from '../lib/theme'

const SpreadsheetPage: React.FC = () => {
  const { status, refetch, spreadsheetId } = useOnboarding()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const handlePickerSelect = async (document: any) => {
    const newSpreadsheetId = document.id
    setLoading(true)
    try {
      await api.spreadsheet.set({ spreadsheet_id: newSpreadsheetId })
      refetch()
      setShowPicker(false)
      toast.success('Spreadsheet berhasil diubah')
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to save spreadsheet:', error)
      toast.error('Gagal mengubah spreadsheet')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSpreadsheet = async () => {
    setDeleting(true)
    try {
      await api.spreadsheet.set({ spreadsheet_id: "" })
      refetch()
      setShowDeleteConfirm(false)
      setShowPicker(true)
      toast.success('Spreadsheet dihapus, silakan pilih spreadsheet baru')
    } catch (error) {
      console.error('Failed to delete spreadsheet:', error)
      toast.error('Gagal menghapus spreadsheet')
    } finally {
      setDeleting(false)
    }
  }

  // Show picker mode (selecting a new spreadsheet)
  if (showPicker || status === 'no_spreadsheet') {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="mb-6 animate-fade-up">
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">
            Pilih Spreadsheet
          </h1>
          <p className="text-gray-400 text-sm">
            Hubungkan atau pilih spreadsheet Google Sheets Anda
          </p>
        </div>

        <div className="animate-fade-up bg-white rounded-xl border border-gray-200 p-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Pilih Spreadsheet Google Sheets
            </h2>
            <p className="text-sm text-gray-500">
              Anda akan diminta memberikan izin akses untuk terhubung dengan spreadsheet Anda
            </p>
          </div>

          <GooglePicker
            onSelect={handlePickerSelect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            disabled={loading}
          />

          {showPicker && (
            <button
              onClick={() => setShowPicker(false)}
              className="w-full py-2.5 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    )
  }

  // Show spreadsheet details mode
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6 animate-fade-up">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Spreadsheet</h1>
        <p className="text-gray-400 text-sm">Kelola spreadsheet yang terhubung dengan akun Anda</p>
      </div>

      <div className="space-y-4 animate-fade-up" style={{ animationDelay: '40ms', animationFillMode: 'both' }}>
        {/* Current spreadsheet card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileSpreadsheet size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Spreadsheet Terpilih</h3>
                <p className="text-sm text-gray-500">{spreadsheetId}</p>
              </div>
            </div>
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              title="Buka di Google Sheets"
            >
              <ExternalLink size={20} />
            </a>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowPicker(true)}
              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <RefreshCw size={16} />
              Ganti Spreadsheet
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 py-2.5 px-4 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              disabled={loading || deleting}
            >
              <Trash2 size={16} />
              Hapus
            </button>
          </div>
        </div>

        {/* Back to dashboard button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-2.5 px-4 rounded-lg text-white font-medium transition-colors hover:-translate-y-0.5"
          style={{ background: theme.btnBg }}
        >
          Kembali ke Dashboard
        </button>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleRemoveSpreadsheet}
        title="Hapus Spreadsheet"
        message="Apakah Anda yakin ingin menghapus spreadsheet ini? Anda dapat memilih spreadsheet lain setelahnya."
        confirmLabel="Hapus"
        loading={deleting}
      />
    </div>
  )
}

export default SpreadsheetPage
