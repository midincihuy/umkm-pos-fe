import { useEffect, useState } from 'react'
import { GoogleUser, initGoogleAuth, signInWithGoogle as googleSignIn, signOut as googleSignOut, getCurrentUser } from '../lib/google-auth'

interface AuthState {
  user: GoogleUser | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  })

  useEffect(() => {
    // Initialize Google Auth with client ID from environment
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID is not defined in .env')
    }

    initGoogleAuth(clientId).then(() => {
      // Get current user from local storage
      const user = getCurrentUser()
      setState({ user, loading: false })
    })
  }, [])

  const signInWithGoogle = async () => {
    try {
      googleSignIn()
      // Note: In a real implementation, you would need to handle the token response
      // and save the user data. You can add a callback handler here.
    } catch (error) {
      console.error('Google sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await googleSignOut()
      setState({ user: null, loading: false })
    } catch (error) {
      console.error('Google sign out failed:', error)
      throw error
    }
  }

  return { ...state, signInWithGoogle, signOut }
}
