import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { Loader2 } from "lucide-react"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await register(name, email, password)
    if (ok) navigate("/app/rutinas")
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
        Crear cuenta
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Regístrate para comenzar tu transformación
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Nombre completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-3 text-sm outline-none focus:ring-2 transition-all"
            style={inputStyle}
            required
          />
        </div>
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
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 text-sm outline-none focus:ring-2 transition-all"
            style={inputStyle}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{ background: "var(--accent)", color: "var(--accent-text)", opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Crear Cuenta
        </button>
      </form>

      <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-semibold" style={{ color: "var(--accent)" }}>
          Inicia sesión
        </Link>
      </p>
    </motion.div>
  )
}
