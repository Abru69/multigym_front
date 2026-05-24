import { Outlet, Link } from "react-router-dom"
import { motion } from "framer-motion"

export function AuthLayout() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(204, 255, 0, 0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(204, 255, 0, 0.04) 0%, transparent 50%),
          var(--background)
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            R4
          </div>
          <div>
            <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>
              Reto 4 Gym
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Nutrición & Entrenamiento
            </p>
          </div>
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}
