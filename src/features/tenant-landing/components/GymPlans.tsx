import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { useAuthStore } from '@/features/auth/store/authStore'

export function GymPlans() {
  const { branding, tenantId } = useTenantBranding()
  const { isAuthenticated } = useAuthStore()
  const { plans } = branding

  if (plans.length === 0) return null

  return (
    <section className="bg-[var(--bg-secondary)] py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-16"
        >
          <h2 className="mb-3 text-2xl font-bold text-[var(--text-primary)] sm:mb-4 sm:text-3xl lg:text-4xl">
            Planes que <span className="text-[var(--accent)]">se adaptan a ti</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            Elige el plan que mejor se adapte a tus objetivos de entrenamiento.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl border p-6 transition-all sm:p-8 ${
                plan.featured
                  ? 'border-[var(--accent)] bg-[var(--surface)] shadow-[var(--accent)]/10 shadow-2xl sm:scale-[1.02]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/30'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] px-4 py-1 text-sm font-semibold text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg">
                  Más Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{plan.name}</h3>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  ${plan.price.toLocaleString('es-MX')}
                </span>
                <span className="text-[var(--text-muted)]"> /{plan.period}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 flex-shrink-0 text-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isAuthenticated && (
                <Link
                  to={`/registro?tenant=${tenantId}`}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                    plan.featured
                      ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg hover:brightness-110'
                      : 'border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  Comenzar
                  <ArrowRight size={16} />
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
