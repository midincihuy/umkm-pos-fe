import { useEffect, useState } from 'react'
import { GoogleUser, initGoogleAuth, signInWithGoogle as googleSignIn, signOut as googleSignOut, getCurrentUser, onAuthStateChange } from '../lib/google-auth'
import { useNavigate } from 'react-router-dom'

interface AuthState {
  user: GoogleUser | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  })
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize Google Auth with client ID from environment
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID is not defined in .env')
    }

    // Initialize auth and get current user
    const initAuth = async () => {
      try {
        await initGoogleAuth(clientId)
        const user = getCurrentUser()
        setState({ user, loading: false })
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setState({ user: null, loading: false })
      }
    }

    initAuth()

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setState({ user, loading: false })
      if (user) {
        navigate('/dashboard', { replace: true })
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const signInWithGoogle = async () => {
    try {
      googleSignIn()
    } catch (error) {
      console.error('Google sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await googleSignOut()
      setState({ user: null, loading: false })
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Google sign out failed:', error)
      throw error
    }
  }

  return { ...state, signInWithGoogle, signOut }
}
