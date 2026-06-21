import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, Loader2, CheckCircle, Building2 } from "lucide-react"
import { getTenantFromSubdomain } from "@/lib/tenant"
import { resolveBranding } from "@/lib/tenantConfig"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import "./styles/AuthShared.css"

export default function ForgotPassword() {
  const autoTenant = getTenantFromSubdomain()
  const branding = autoTenant ? resolveBranding(autoTenant) : null
  const [email, setEmail] = useState("")
  const [tenantId, setTenantId] = useState(autoTenant || "")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const effectiveTenant = autoTenant || tenantId
    if (!effectiveTenant) {
      setError("Ingresa el código de tu gimnasio.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": effectiveTenant,
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.mensaje || "No se pudo procesar la solicitud")
      }

      setSent(true)
    } catch (err: any) {
      setError(err.message || "Error al enviar la solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="auth-icon-box">
          <CheckCircle size={32} />
        </div>
        <h2 className="auth-title">Revisa tu correo</h2>
        <p className="auth-subtitle">
          Si existe una cuenta con <strong className="text-[var(--text-secondary)]">{email}</strong>, recibirás un enlace para restablecer tu contraseña.
        </p>
        <Link to="/login" className="auth-link-small inline-flex items-center gap-2">
          <ArrowLeft size={14} /> Volver al inicio de sesión
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <Link to="/login" className="auth-link-back">
        <ArrowLeft size={14} /> Volver
      </Link>

      <h2 className="auth-title">Recuperar contraseña</h2>
      <p className="auth-subtitle">
        {autoTenant
          ? <>Conectado a <strong className="text-accent">{branding?.name || autoTenant}</strong>. Ingresa tu correo para recibir el enlace de recuperación.</>
          : "Ingresa tu código de gimnasio y correo electrónico."
        }
      </p>

      {error && (
        <div className="auth-error-banner">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!autoTenant && (
          <div>
            <Label>Código de Gimnasio</Label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                type="text" value={tenantId} onChange={(e) => setTenantId(e.target.value)}
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
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full gap-2 mt-4">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Enviar enlace de recuperación
        </Button>
      </form>
    </motion.div>
  )
}
