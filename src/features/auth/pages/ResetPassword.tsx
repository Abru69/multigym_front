import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'

import { fetchApi } from '@/lib/api'
import type { ResponseDTO } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const tenant = searchParams.get('tenant') || ''
  const loginPath = tenant ? `/login?tenant=${encodeURIComponent(tenant)}` : '/login'

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
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
      await fetchApi<ResponseDTO<unknown>>('/api/auth/reset-password/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      })
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
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10">
          <CheckCircle size={32} className="text-[var(--accent)]" />
        </div>
        <h2 className="font-heading mb-1 text-2xl font-black text-[var(--text-primary)]">
          Contraseña actualizada
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva
          contraseña.
        </p>
        <Link to={loginPath}>
          <Button className="w-full gap-2 rounded-2xl py-3 text-sm font-bold">
            Ir al inicio de sesión
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <Link
        to={loginPath}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] hover:underline"
      >
        <ArrowLeft size={14} />
        Volver al login
      </Link>

      <h2 className="font-heading mb-1 text-2xl font-black text-[var(--text-primary)]">
        Nueva contraseña
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
        Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Nueva contraseña</Label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-11 pl-10"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
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
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-4 pl-10"
              required
              minLength={8}
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
