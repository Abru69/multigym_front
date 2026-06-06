import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { usePlatformAuthStore } from "@/features/platform/store/platformAuthStore"
import { Zap, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"

export default function PlatformLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = usePlatformAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const ok = await login(email, password)
    if (ok) navigate("/platform")
    else setError("Credenciales incorrectas. Verifica tu email y contraseña.")
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #080812 0%, #0d0d1f 50%, #080812 100%)",
      }}
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "var(--accent)", top: "10%", left: "5%", animation: "float 8s ease-in-out infinite" }}
        />
        <div
          className="absolute w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: "var(--detail)", bottom: "15%", right: "10%", animation: "float 10s ease-in-out infinite reverse" }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div
          className="p-8 rounded-2xl"
          style={{
            background: "rgba(26,26,26,0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--detail))",
                boxShadow: "0 0 30px rgba(0,0,255,0.4)",
              }}
            >
              <Zap size={28} color="#fff" />
            </div>
            <h1 className="text-2xl font-black mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
              MultiGym{" "}
              <span style={{ background: "linear-gradient(90deg, var(--accent), var(--detail))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Platform
              </span>
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Panel de Administración SaaS
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@saas.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.2)", color: "var(--danger)" }}
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: isLoading ? "var(--border)" : "linear-gradient(135deg, var(--accent), #3333ff)",
                color: "var(--accent-text)",
                boxShadow: isLoading ? "none" : "0 0 20px rgba(0,0,255,0.3)",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Verificando...
                </span>
              ) : (
                "Acceder al Panel"
              )}
            </button>
          </form>

          {/* Hint */}
          <div
            className="mt-6 p-3 rounded-xl text-center text-xs"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Demo: </span>
            admin@saas.com / admin123
          </div>
        </div>
      </motion.div>
    </div>
  )
}
