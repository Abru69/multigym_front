import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, Building2 } from "lucide-react"

import { getTenantFromSubdomain } from "@/lib/tenant"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const tenantParam = searchParams.get("tenantId") || ""
  const autoTenant = getTenantFromSubdomain()

  const [tenantId, setTenantId] = useState(autoTenant || tenantParam)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    if (!token) {
      setError("Token de recuperación no válido. Solicita un nuevo enlace.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": tenantId,
        },
        body: JSON.stringify({ token, newPassword }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.mensaje || "No se pudo restablecer la contraseña")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "El enlace ha expirado o no es válido. Solicita uno nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--background)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: "var(--radius-lg)",
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--accent-muted)" }}
        >
          <CheckCircle size={32} style={{ color: "var(--success)" }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Contraseña actualizada
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
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
        className="inline-flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={14} />
        Volver al login
      </Link>

      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        Nueva contraseña
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
      </p>

      {error && (
        <div
          className="text-sm px-4 py-3 rounded-lg mb-4"
          style={{ background: "var(--error-muted)", color: "var(--danger)", border: "1px solid var(--error)" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!(autoTenant || tenantParam) && (
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Código de Gimnasio
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="ej. reto4"
                className="w-full pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 transition-all"
                style={{ ...inputStyle, "--tw-ring-color": "var(--accent)" } as React.CSSProperties}
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-3 text-sm outline-none focus:ring-2 transition-all"
              style={{ ...inputStyle, "--tw-ring-color": "var(--accent)" } as React.CSSProperties}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 transition-all"
              style={{ ...inputStyle, "--tw-ring-color": "var(--accent)" } as React.CSSProperties}
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: "var(--accent)",
            color: "var(--accent-text)",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Restablecer contraseña
        </button>
      </form>
    </motion.div>
  )
}
