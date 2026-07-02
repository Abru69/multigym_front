import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, ArrowLeft } from 'lucide-react'
export default function Register() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:underline"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={14} />
        Volver al login
      </Link>

      <div className="text-center">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
        >
          <Building2 size={32} />
        </div>

        <h2 className="mb-1 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Registro de Usuarios
        </h2>

        <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          En nuestra plataforma, las cuentas de usuario son creadas por el{' '}
          <strong style={{ color: 'var(--text-secondary)' }}>administrador de tu gimnasio</strong>.
        </p>

        <div
          className="mb-6 flex flex-col gap-3 rounded-2xl border p-5 text-left"
          style={{ background: 'var(--input-bg)', borderColor: 'var(--border)' }}
        >
          <p className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            ¿Cómo obtener acceso?
          </p>
          <div className="space-y-2">
            {[
              'Contacta a la recepción de tu gimnasio',
              'Solicita que te creen una cuenta con tu email',
              'Recibirás tus credenciales de acceso',
              'Inicia sesión con tu código de gimnasio',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
                  {i + 1}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          Ya tengo cuenta — Iniciar Sesión
        </Link>
      </div>
    </motion.div>
  )
}
