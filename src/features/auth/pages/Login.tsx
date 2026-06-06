import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuthStore } from "@/features/auth/store/authStore"
import { Eye, EyeOff, Loader2, Building2 } from "lucide-react"
import { getTenantFromSubdomain, getPlatformUrl } from "@/lib/tenant"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

export default function Login() {
  const autoTenant = getTenantFromSubdomain()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tenantId, setTenantId] = useState(autoTenant || "")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  // If accessed from plain localhost (no subdomain), this is the platform context
  // Optionally redirect to platform login
  useEffect(() => {
    // Tenant is auto-resolved from subdomain — no need to ask
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const effectiveTenant = autoTenant || tenantId
    if (!effectiveTenant) {
      setError("Ingresa el código de tu gimnasio o accede desde tu URL personalizada.")
      return
    }

    const ok = await login(email, password, effectiveTenant)
    if (ok) {
      const user = useAuthStore.getState().user
      navigate(user?.role === "admin" ? "/admin" : "/")
    } else {
      setError("Credenciales inválidas.")
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        Bienvenido de vuelta
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        {autoTenant
          ? <>Conectado a <strong style={{ color: "var(--accent)" }}>{autoTenant}</strong></>
          : "Ingresa tus credenciales para continuar"
        }
      </p>

      {error && (
        <div className="text-sm px-4 py-3 rounded-lg mb-4" style={{ background: "rgba(255,77,77,0.1)", color: "var(--danger)", border: "1px solid rgba(255,77,77,0.2)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Only show gym code field if no subdomain detected */}
        {!autoTenant && (
          <div>
            <Label>Código de Gimnasio</Label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="ej. gym-central"
                className="pl-10"
                required
              />
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>
              O accede directamente desde <strong>tu-gym.localhost:{window.location.port || '5173'}</strong>
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full gap-2 mt-4">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Iniciar Sesión
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link
          to="/forgot-password"
          className="text-xs font-semibold transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {!autoTenant && (
        <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
          ¿Eres administrador de plataforma?{" "}
          <a href={`${getPlatformUrl()}/platform/login`} className="font-semibold" style={{ color: "var(--accent)" }}>
            Ir al panel SaaS
          </a>
        </p>
      )}

      <p className="text-xs text-center mt-3" style={{ color: "var(--text-muted)" }}>
        ¿No tienes cuenta? Contacta al administrador de tu gimnasio.
      </p>
    </motion.div>
  )
}
