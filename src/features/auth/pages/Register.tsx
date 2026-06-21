import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Building2, ArrowLeft } from "lucide-react"
import "./styles/AuthShared.css"

export default function Register() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <Link
        to="/login"
        className="auth-link-back"
      >
        <ArrowLeft size={14} />
        Volver al login
      </Link>

      <div className="text-center">
        <div className="auth-icon-box">
          <Building2 size={32} />
        </div>

        <h2 className="auth-title">
          Registro de Usuarios
        </h2>

        <p className="auth-subtitle">
          En nuestra plataforma, las cuentas de usuario son creadas por el <strong className="text-[var(--text-secondary)]">administrador de tu gimnasio</strong>.
        </p>

        <div className="auth-info-card">
          <p className="auth-info-title">
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
                <span className="auth-step-number">
                  {i + 1}
                </span>
                <span className="auth-step-text">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/login"
          className="auth-primary-btn"
        >
          Ya tengo cuenta — Iniciar Sesión
        </Link>
      </div>
    </motion.div>
  )
}
