import React, { useEffect, useRef, useState } from 'react'
import { useGooglePicker } from '../hooks/useGooglePicker'

interface GooglePickerProps {
  onSelect: (document: any) => void
  className?: string
  disabled?: boolean
}

declare global {
  interface Window {
    google: {
      picker: any
      load: (api: string, version: string, config: { callback: () => void }) => void
    }
    gapi: {
      load: (api: string, options: { callback: () => void; apiKey?: string }) => void
    }
  }
}

export const GooglePicker: React.FC<GooglePickerProps> = ({ onSelect, className, disabled }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [pickerLoaded, setPickerLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const { accessToken, isAuthenticated } = useGooglePicker()

  useEffect(() => {
    // Check if already loaded
    if (window.google?.picker) {
      setPickerLoaded(true)
      return
    }

    let timeoutId: NodeJS.Timeout
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.async = true
    script.defer = true

    script.onload = () => {
      // Set timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        // Final check if picker is available
        if (window.google?.picker) {
          setPickerLoaded(true)
        } else {
          setLoadError(true)
          console.error('Google Picker failed to load within timeout period')
        }
      }, 8000)

      // Initialize the API
      if (window.gapi) {
        window.gapi.load('picker', {
          callback: () => {
            clearTimeout(timeoutId)
            setPickerLoaded(true)
          },
          apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        })
      } else if (window.google) {
        window.google.load('picker', '1', () => {
          clearTimeout(timeoutId)
          setPickerLoaded(true)
        })
      }
    }

    script.onerror = (error) => {
      console.error('Failed to load Google Picker API:', error)
      setLoadError(true)
    }

    document.body.appendChild(script)

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const handlePickerClick = () => {
    if (!pickerLoaded || disabled || !buttonRef.current || loadError) return

    try {
      // Check if we have an access token from the hook
      if (!isAuthenticated || !accessToken) {
        console.error('No Google access token found. Please login first.')
        alert('Silakan login terlebih dahulu untuk menggunakan Google Picker')
        return
      }

      const pickerBuilder = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.SPREADSHEETS)
        .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
        .setOAuthToken(accessToken)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const document = data.docs[0]
            onSelect(document)
          }
        })

      const picker = pickerBuilder.build()
      picker.setVisible(true)
    } catch (error) {
      console.error('Failed to open Google Picker:', error)
      setLoadError(true)
    }
  }

  if (loadError) {
    return (
      <button
        className={className}
        type="button"
        disabled
      >
        Gagal memuat picker
      </button>
    )
  }

  return (
    <button
      ref={buttonRef}
      className={className}
      type="button"
      disabled={disabled || !pickerLoaded}
      onClick={handlePickerClick}
    >
      {!pickerLoaded ? 'Loading Google Picker...' : disabled ? 'Please wait...' : 'Pilih Spreadsheet Google'}
    </button>
  )
}