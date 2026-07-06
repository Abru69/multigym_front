import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle, Building2 } from 'lucide-react'
import { getTenantFromSubdomain } from '@/lib/tenant'
import { resolveBranding } from '@/lib/tenantConfig'
import { fetchApi } from '@/lib/api'
import type { ResponseDTO } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default function ForgotPassword() {
  const autoTenant = getTenantFromSubdomain()
  const branding = autoTenant ? resolveBranding(autoTenant) : null
  const [email, setEmail] = useState('')
  const [tenantId, setTenantId] = useState(autoTenant || '')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const effectiveTenant = autoTenant || tenantId
    if (!effectiveTenant) {
      setError('Ingresa el código de tu gimnasio.')
      return
    }

    setIsLoading(true)

    try {
      await fetchApi<ResponseDTO<unknown>>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 shadow-[0_0_16px_rgba(66,204,99,0.15)]">
          <CheckCircle size={32} className="text-[var(--accent)]" />
        </div>
        <h2 className="mb-1 text-xl font-black tracking-tight text-[var(--text-primary)]">
          Revisa tu correo
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-[var(--text-muted)]">
          Si existe una cuenta con <strong className="text-[var(--text-secondary)]">{email}</strong>
          , recibirás un enlace para restablecer tu contraseña.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] hover:underline"
        >
          <ArrowLeft size={14} /> Volver al inicio de sesión
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] hover:underline"
      >
        <ArrowLeft size={14} /> Volver
      </Link>

      <h2 className="mb-1 text-xl font-black tracking-tight text-[var(--text-primary)]">
        Recuperar contraseña
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-[var(--text-muted)]">
        {autoTenant ? (
          <>
            Conectado a{' '}
            <strong className="text-[var(--accent)]">{branding?.name || autoTenant}</strong>.
            Ingresa tu correo para recibir el enlace de recuperación.
          </>
        ) : (
          'Ingresa tu código de gimnasio y correo electrónico.'
        )}
      </p>

      {error && (
        <div className="mb-4 rounded-2xl border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)] backdrop-blur-xl">
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
                placeholder="ej. reto4"
                className="pl-10"
                required
              />
            </div>
          </div>
        )}

        <div>
          <Label>Correo electrónico</Label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="mt-4 w-full gap-2">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Enviar enlace de recuperación
        </Button>
      </form>
    </motion.div>
  )
}
