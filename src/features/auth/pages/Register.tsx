import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Building2, ArrowLeft } from "lucide-react"

export default function Register() {
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

      <div className="text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "var(--accent-muted)" }}
        >
          <Building2 size={32} style={{ color: "var(--accent)" }} />
        </div>

        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Registro de Usuarios
        </h2>

        <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          En nuestra plataforma, las cuentas de usuario son creadas por el <strong style={{ color: "var(--text-secondary)" }}>administrador de tu gimnasio</strong>.
        </p>

        <div
          className="rounded-2xl p-5 mb-6 text-left space-y-3"
          style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            ¿Cómo obtener acceso?
          </p>
          <div className="space-y-2">
            {[
              "Contacta a la recepción de tu gimnasio",
              "Solicita que te creen una cuenta con tu email",
              "Recibirás tus credenciales de acceso",
              "Inicia sesión con tu código de gimnasio",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
                >
                  {i + 1}
                </span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          Ya tengo cuenta — Iniciar Sesión
        </Link>
      </div>
    </motion.div>
  )
}
