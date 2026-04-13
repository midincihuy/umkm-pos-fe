import { useState, useEffect } from 'react'

export interface GooglePickerResult {
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
}

export const useGooglePicker = (): GooglePickerResult => {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('google_auth_token')

    setAccessToken(token || null)
    setLoading(false)

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'google_auth_token') {
        setAccessToken(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return {
    accessToken,
    isAuthenticated: !!accessToken,
    loading
  }
}