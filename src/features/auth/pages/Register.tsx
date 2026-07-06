import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
export default function Register() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] hover:underline"
      >
        <ArrowLeft size={14} />
        Volver al login
      </Link>

      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 shadow-[0_0_16px_rgba(66,204,99,0.15)]">
          <Building2 size={32} className="text-[var(--accent)]" />
        </div>

        <h2 className="mb-1 text-xl font-black tracking-tight text-[var(--text-primary)]">
          Registro de Usuarios
        </h2>

        <p className="mb-6 text-sm leading-relaxed text-[var(--text-muted)]">
          En nuestra plataforma, las cuentas de usuario son creadas por el{' '}
          <strong className="text-[var(--text-secondary)]">administrador de tu gimnasio</strong>.
        </p>

        <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[var(--card)] to-[var(--surface)] p-5 text-left backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
          <div className="relative z-10 space-y-3">
            <p className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
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
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 text-[10px] font-black text-[var(--accent)]">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link to="/login">
          <Button className="w-full gap-2 rounded-2xl py-3 text-sm font-bold">
            Ya tengo cuenta — Iniciar Sesión
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
