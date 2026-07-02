import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-primary)] py-20 lg:py-32">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--detail)]/5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-1.5 text-sm font-medium text-[var(--accent)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
              Plataforma SaaS #1 para Gimnasios
            </div>

            <h1 className="mb-6 text-4xl leading-tight font-bold text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
              Transforma tu gimnasio con{' '}
              <span className="text-[var(--accent)]">tecnología inteligente</span>
            </h1>

            <p className="mb-8 max-w-lg text-lg text-[var(--text-secondary)]">
              Administra rutinas, controla inventario, vende suplementos y analiza el progreso de
              tus clientes — todo en una sola plataforma potente y fácil de usar.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/registro"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-semibold text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Comenzar Gratis
                <ArrowRight size={18} />
              </Link>
              <Link
                to="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 py-4 text-base font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <Play size={18} />
                Ver Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-[var(--border)] pt-8">
              {[
                { value: '500+', label: 'Gimnasios Activos' },
                { value: '50K+', label: 'Miembros' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-[var(--accent)]">{stat.value}</div>
                  <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
              <div className="overflow-hidden rounded-xl bg-[var(--bg-secondary)]">
                <img
                  src="/src/assets/hero.png"
                  alt="MultiGym Dashboard Preview"
                  className="h-auto w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="flex h-64 items-center justify-center bg-gradient-to-br from-[var(--accent)]/10 to-[var(--detail)]/10">
                  <div className="text-center">
                    <div className="mb-2 text-6xl">💪</div>
                    <p className="text-sm text-[var(--text-muted)]">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                  📊
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">+127%</div>
                  <div className="text-xs text-[var(--text-muted)]">Crecimiento mensual</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute -top-4 -right-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10 text-[var(--success)]">
                  ✅
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    Rutinas Activas
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">1,247 rutinas creadas</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
