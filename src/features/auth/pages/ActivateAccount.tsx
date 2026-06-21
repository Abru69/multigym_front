import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, UserCheck } from "lucide-react"

import { activateAccount } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import "./styles/AuthShared.css"

export default function ActivateAccount() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword && newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    if (!token) {
      setError("Enlace de activación no válido.")
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        token,
        ...(newPassword ? { newPassword } : {})
      }
      await activateAccount(payload)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "El enlace ha expirado o no es válido.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="auth-icon-box">
          <CheckCircle size={32} />
        </div>
        <h2 className="auth-title">
          ¡Cuenta Activada!
        </h2>
        <p className="auth-subtitle">
          Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión en la plataforma.
        </p>
        <Link
          to="/login"
          className="auth-primary-btn"
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
        className="auth-link-back"
      >
        <ArrowLeft size={14} />
        Volver al login
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent-muted)] text-[var(--accent)]">
          <UserCheck size={20} />
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          Activa tu cuenta
        </h2>
      </div>
      <p className="auth-subtitle mt-2">
        Establece una contraseña segura para terminar de activar tu cuenta.
      </p>

      {error && (
        <div className="auth-error-banner">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Contraseña</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-11"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <Label>Confirmar contraseña</Label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-4"
              required
              minLength={6}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full gap-2 mt-6"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Activar Cuenta
        </Button>
      </form>
    </motion.div>
  )
}
