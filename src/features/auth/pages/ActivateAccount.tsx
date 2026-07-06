import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, UserCheck } from 'lucide-react'

import { activateAccount } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
export default function ActivateAccount() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword && newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (!token) {
      setError('Enlace de activación no válido.')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        token,
        ...(newPassword ? { newPassword } : {}),
      }
      await activateAccount(payload)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'El enlace ha expirado o no es válido.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 shadow-[0_0_16px_rgba(66,204,99,0.15)]">
          <CheckCircle size={32} className="text-[var(--accent)]" />
        </div>
        <h2 className="mb-1 text-xl font-black tracking-tight text-[var(--text-primary)]">
          ¡Cuenta Activada!
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-[var(--text-muted)]">
          Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión en la plataforma.
        </p>
        <Link to="/login">
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
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] hover:underline"
      >
        <ArrowLeft size={14} />
        Volver al login
      </Link>

      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 shadow-[0_0_12px_rgba(66,204,99,0.15)]">
          <UserCheck size={20} className="text-[var(--accent)]" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
          Activa tu cuenta
        </h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        Establece una contraseña segura para terminar de activar tu cuenta.
      </p>

      {error && (
        <div className="mb-4 rounded-2xl border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)] backdrop-blur-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Contraseña</Label>
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
              minLength={6}
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
              minLength={6}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="mt-6 w-full gap-2">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Activar Cuenta
        </Button>
      </form>
    </motion.div>
  )
}
