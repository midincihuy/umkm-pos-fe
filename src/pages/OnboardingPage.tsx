import React, { useState } from 'react'
import { GooglePicker } from '../components/GooglePicker'
import { useOnboarding } from '../hooks/useOnboarding'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const OnboardingPage: React.FC = () => {
  const { status, refetch } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handlePickerSelect = async (document: any) => {
    const spreadsheetId = document.id
    setLoading(true)
    try {
      await api.spreadsheet.set({ spreadsheet_id: spreadsheetId })
      refetch()
    } catch (error) {
      console.error('Failed to save spreadsheet:', error)
    } finally {
      setLoading(false)
    }
  };

  if (status !== 'no_spreadsheet') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Selamat datang di Dompetku!
          </h1>
          <p className="text-gray-600 mb-6">
            Anda sudah memiliki spreadsheet yang terhubung.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Masuk ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Selamat datang di Dompetku!
        </h1>
        <p className="text-gray-600 mb-6">
          Untuk memulai, silakan pilih spreadsheet Google Sheets Anda:
        </p>
        <GooglePicker
          onSelect={handlePickerSelect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          disabled={loading}
        />
        <p className="text-sm text-gray-500 mt-4">
          Anda akan diminta untuk memberikan izin akses ke spreadsheet Anda.
        </p>
      </div>
    </div>
  )
}

export default OnboardingPage