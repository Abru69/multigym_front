import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'

const plans = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 5000,
    description: 'Perfecto para estudios pequeños y entrenadores independientes.',
    features: [
      'Hasta 100 miembros',
      '1 sede',
      'Soporte por email',
      'Reportes básicos',
      'Catálogo de 50 productos',
    ],
    featured: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 12000,
    description: 'La mejor opción para gimnasios en crecimiento que necesitan control total.',
    features: [
      'Hasta 500 miembros',
      '3 sedes',
      'Soporte prioritario',
      'Reportes avanzados',
      'E-commerce ilimitado',
      'App móvil PWA',
    ],
    featured: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 35000,
    description: 'Para cadenas de gimnasios y franquicias con necesidades avanzadas.',
    features: [
      'Miembros ilimitados',
      'Sedes ilimitadas',
      'Soporte 24/7 dedicado',
      'Acceso a API',
      'SLA 99.9%',
      'Personalización total',
    ],
    featured: false,
  },
]

export function Pricing() {
  return (
    <section className="bg-[var(--bg-secondary)] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Planes que <span className="text-[var(--accent)]">crecen contigo</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            Elige el plan que mejor se adapte a tu negocio. Todos incluyen 14 días de prueba gratis.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.featured
                  ? 'scale-[1.02] border-[var(--accent)] bg-[var(--surface)] shadow-[var(--accent)]/10 shadow-2xl'
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
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  ${plan.price.toLocaleString('es-MX')}
                </span>
                <span className="text-[var(--text-muted)]"> /año</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check size={18} className="mt-0.5 flex-shrink-0 text-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/registro"
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                  plan.featured
                    ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg hover:brightness-110'
                    : 'border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                Comenzar Prueba
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
