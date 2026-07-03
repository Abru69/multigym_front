import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlatformAuthStore } from '@/features/platform/store/platformAuthStore'
import { Zap, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function PlatformLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = usePlatformAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const ok = await login(email, password)
    if (ok) navigate('/platform')
    else setError('Credenciales incorrectas. Verifica tu email y contraseña.')
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background:
          'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)',
      }}
    >
      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'var(--accent)',
            top: '10%',
            left: '5%',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute h-72 w-72 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'var(--detail)',
            bottom: '15%',
            right: '10%',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--border)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--detail))',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Zap size={28} style={{ color: 'var(--text-on-primary)' }} />
            </div>
            <h1
              className="mb-1 text-2xl font-black"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              MultiGym{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, var(--accent), var(--detail))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Platform
              </span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Panel de Administración SaaS
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute top-1/2 left-3 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@saas.com"
                  required
                  className="w-full rounded-xl py-3 pr-4 pl-10 text-sm transition-all outline-none"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute top-1/2 left-3 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl py-3 pr-4 pl-10 text-sm transition-all outline-none"
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-xl p-3 text-sm"
                style={{
                  background: 'var(--error-muted)',
                  border: '1px solid var(--error)',
                  color: 'var(--error)',
                }}
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl py-3 text-sm font-bold transition-all"
              style={{
                background: isLoading
                  ? 'var(--border)'
                  : 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                color: 'var(--accent-text)',
                boxShadow: isLoading ? 'none' : 'var(--shadow-glow)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Verificando...
                </span>
              ) : (
                'Acceder al Panel'
              )}
            </button>
          </form>

          {/* Hint */}
          <div
            className="mt-6 rounded-xl p-3 text-center text-xs"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Demo: </span>
            admin@saas.com / admin123
          </div>
        </div>
      </motion.div>
    </div>
  )
}
