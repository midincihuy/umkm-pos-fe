import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0614] flex items-center justify-center">

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-600/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-ocean-400/20 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-coral-400/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: '3s' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 right-24 w-3 h-3 rounded-full bg-brand-400 animate-float opacity-60" />
      <div className="absolute bottom-32 left-20 w-2 h-2 rounded-full bg-mint-400 animate-float opacity-50" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 left-12 w-4 h-4 rounded-full bg-gold-400/50 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 right-16 w-2 h-2 rounded-full bg-ocean-400 animate-float opacity-60" style={{ animationDelay: '3s' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 animate-fade-up">

        {/* Logo area */}
        <div className="text-center mb-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500 to-ocean-400 opacity-20 blur-xl" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-ocean-500 flex items-center justify-center shadow-glow">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M6 10C6 8.34315 7.34315 7 9 7H27C28.6569 7 30 8.34315 30 10V26C30 27.6569 28.6569 29 27 29H9C7.34315 29 6 27.6569 6 26V10Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
                <path d="M6 13H30" stroke="white" strokeWidth="1.5"/>
                <circle cx="22" cy="21" r="3" fill="white" fillOpacity="0.9"/>
                <path d="M10 21H17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 17H26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"/>
              </svg>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">
            Dompet Keluargaku
          </h1>
          <p className="text-gray-400 text-sm font-body">
            Catat keuangan rumah tangga dengan mudah
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-dark rounded-3xl p-8 shadow-2xl">
          <h2 className="font-display text-lg font-semibold text-white mb-1">
            Masuk ke akun kamu
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Gunakan akun Google untuk masuk dengan aman
          </p>

          {/* Google button */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm py-4 px-6 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {/* Google icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
              <path d="M4.405 11.9A6.01 6.01 0 014.09 10c0-.663.114-1.305.314-1.9V5.51H1.064A9.995 9.995 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
              <path d="M10 3.977c1.468 0 2.786.505 3.822 1.496l2.868-2.868C14.959.99 12.695 0 10 0A9.996 9.996 0 001.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z" fill="#EA4335"/>
            </svg>
            <span className="group-hover:text-gray-900 transition-colors">
              {loading ? 'Memuat...' : 'Masuk dengan Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs">Atau</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Coming soon note */}
          <div className="text-center">
            <p className="text-gray-500 text-xs">
              Login dengan email & password{' '}
              <span className="text-brand-400 font-medium">segera hadir</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          Data kamu tersimpan aman dan terenkripsi
        </p>
      </div>
    </div>
  )
}
