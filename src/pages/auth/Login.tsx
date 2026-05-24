import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, loginAs, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const ok = await login(email, password)
    if (ok) {
      const user = useAuthStore.getState().user
      navigate(user?.role === "admin" ? "/admin" : "/")
    } else {
      setError("Credenciales inválidas. Usa los accesos rápidos.")
    }
  }

  const quickLogin = (role: "admin" | "client") => {
    loginAs(role)
    navigate(role === "admin" ? "/admin" : "/")
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--background)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: "var(--radius-lg)",
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        Bienvenido de vuelta
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Ingresa tus credenciales para continuar
      </p>

      {error && (
        <div className="text-sm px-4 py-3 rounded-lg mb-4" style={{ background: "rgba(255,77,77,0.1)", color: "var(--danger)", border: "1px solid rgba(255,77,77,0.2)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-4 py-3 text-sm outline-none focus:ring-2 transition-all"
            style={{ ...inputStyle, "--tw-ring-color": "var(--accent)" } as React.CSSProperties}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-11 text-sm outline-none focus:ring-2 transition-all"
              style={{ ...inputStyle, "--tw-ring-color": "var(--accent)" } as React.CSSProperties}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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
          Iniciar Sesión
        </button>
      </form>

      {/* Quick access */}
      <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs font-medium text-center mb-3" style={{ color: "var(--text-muted)" }}>
          Acceso rápido (desarrollo)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => quickLogin("admin")}
            className="py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(204,255,0,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent-muted)")}
          >
            Entrar como Admin
          </button>
          <button
            onClick={() => quickLogin("client")}
            className="py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            Entrar como Cliente
          </button>
        </div>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
        ¿No tienes cuenta?{" "}
        <Link to="/registro" className="font-semibold" style={{ color: "var(--accent)" }}>
          Regístrate
        </Link>
      </p>
    </motion.div>
  )
}
