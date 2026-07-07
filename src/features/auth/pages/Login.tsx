import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react'
import { getTenantFromSubdomain, getPlatformUrl } from '@/lib/tenant'
import { resolveBranding } from '@/lib/tenantConfig'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default function Login() {
  const autoTenant = getTenantFromSubdomain()
  const branding = autoTenant ? resolveBranding(autoTenant) : null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState(autoTenant || '')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {}, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const effectiveTenant = autoTenant || tenantId
    if (!effectiveTenant) {
      setError('Ingresa el código de tu gimnasio o accede desde tu URL personalizada.')
      return
    }

    try {
      const ok = await login(email, password, effectiveTenant)
      if (ok) {
        const user = useAuthStore.getState().user
        navigate(user?.role === 'admin' ? '/admin' : '/')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <h2 className="mb-1 font-heading text-2xl font-black text-[var(--text-primary)]">
        Bienvenido de vuelta
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        {autoTenant ? (
          <>
            Conectado a{' '}
            <strong className="text-[var(--accent)]">{branding?.name || autoTenant}</strong>
          </>
        ) : (
          'Ingresa tus credenciales para continuar'
        )}
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!autoTenant && (
          <div>
            <Label>Código de Gimnasio</Label>
            <div className="relative">
              <Building2
                size={16}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <Input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="ej. gym-central"
                className="pl-10"
                required
              />
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
              O accede directamente desde{' '}
              <strong>tu-gym.localhost:{window.location.port || '5173'}</strong>
            </p>
          </div>
        )}

        <div>
          <Label>Correo electrónico</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>
        <div>
          <Label>Contraseña</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="mt-4 w-full gap-2">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link
          to="/forgot-password"
          className="text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {!autoTenant && (
        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          ¿Eres administrador de plataforma?{' '}
          <a
            href={`${getPlatformUrl()}/platform/login`}
            className="font-semibold text-[var(--accent)] transition-colors hover:underline"
          >
            Ir al panel SaaS
          </a>
        </p>
      )}

      <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
        ¿No tienes cuenta? Contacta al administrador de tu gimnasio.
      </p>
    </motion.div>
  )
}
