import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, Building2 } from 'lucide-react'

import { getTenantFromSubdomain } from '@/lib/tenant'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const tenantParam = searchParams.get('tenantId') || ''
  const autoTenant = getTenantFromSubdomain()

  const [tenantId, setTenantId] = useState(autoTenant || tenantParam)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (!token) {
      setError('Token de recuperación no válido. Solicita un nuevo enlace.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({ token, newPassword }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.mensaje || 'No se pudo restablecer la contraseña')
      }

      setSuccess(true)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'El enlace ha expirado o no es válido. Solicita uno nuevo.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
        >
          <CheckCircle size={32} />
        </div>
        <h2 className="mb-1 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Contraseña actualizada
        </h2>
        <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva
          contraseña.
        </p>
        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          Ir al inicio de sesión
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:underline"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={14} />
        Volver al login
      </Link>

      <h2 className="mb-1 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Nueva contraseña
      </h2>
      <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
      </p>

      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--error-muted)',
            color: 'var(--danger)',
            borderColor: 'var(--error)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!(autoTenant || tenantParam) && (
          <div>
            <Label>Código de Gimnasio</Label>
            <div className="relative">
              <Building2
                size={16}
                className="absolute top-1/2 left-3.5 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
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
          <Label>Nueva contraseña</Label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-11 pl-10"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <Label>Confirmar contraseña</Label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-4 pl-10"
              required
              minLength={6}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="mt-4 w-full gap-2">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Restablecer contraseña
        </Button>
      </form>
    </motion.div>
  )
}
