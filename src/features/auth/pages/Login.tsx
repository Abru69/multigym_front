import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react'
import { getTenantFromSubdomain, getTenantFromUrl, getPlatformUrl, getTenantHomeUrl, getTenantUrl } from '@/lib/tenant'
import { resolveBranding } from '@/lib/tenantConfig'
import { getDefaultRoute } from '@/router/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default function Login() {
  const autoTenant = getTenantFromUrl()
  const branding = autoTenant ? resolveBranding(autoTenant) : null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState(autoTenant || '')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const { login, restoreSession, isLoading, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const getSafeReturnPath = () => {
    const returnTo = searchParams.get('returnTo')
    if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) return null
    return returnTo
  }

  useEffect(() => {
    if (!isAuthenticated && autoTenant) void restoreSession(autoTenant)
  }, [autoTenant, isAuthenticated, restoreSession])

  useEffect(() => {
    if (isAuthenticated) {
      const user = useAuthStore.getState().user
      if (!user) return
      const authenticatedTenant = useAuthStore.getState().tenantId || autoTenant
      if (authenticatedTenant && !getTenantFromSubdomain()) {
        const tenantPath = getSafeReturnPath() || getDefaultRoute(user.role)
        window.location.assign(`${getTenantUrl(authenticatedTenant)}${tenantPath}`)
        return
      }
      if (user.role === 'client') {
        // Clients see the tenant landing page first, not the routines portal.
        window.location.href = getTenantHomeUrl(useAuthStore.getState().tenantId || autoTenant)
      } else {
        navigate(getSafeReturnPath() || getDefaultRoute(user.role), { replace: true })
      }
    }
  }, [isAuthenticated, navigate, autoTenant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const effectiveTenant = autoTenant || tenantId
    if (!effectiveTenant) {
      setError('Ingresa el código de tu gimnasio o accede desde tu URL personalizada.')
      return
    }

    try {
      await login(email, password, effectiveTenant)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas.')
    }
  }

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || isLoading || e.nativeEvent.isComposing) return
    e.preventDefault()
    formRef.current?.requestSubmit()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <h2 className="font-heading mb-1 text-2xl font-black text-[var(--text-primary)]">
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

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {!autoTenant && (
          <div>
            <Label htmlFor="tenant-id">Código de Gimnasio</Label>
            <div className="relative">
              <Building2
                size={16}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <Input
                id="tenant-id"
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
          <Label htmlFor="login-email">Correo electrónico</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="login-password">Contraseña</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handlePasswordKeyDown}
              placeholder="••••••••"
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
          to={autoTenant ? `/forgot-password?tenant=${autoTenant}` : '/forgot-password'}
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
