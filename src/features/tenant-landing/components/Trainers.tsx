import { motion } from 'framer-motion'
import { useTenantBranding } from '@/hooks/useTenantBranding'

export function Trainers() {
  const { branding } = useTenantBranding()
  const { trainers } = branding

  if (trainers.length === 0) return null

  return (
    <section className="bg-[var(--bg-primary)] py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-16"
        >
          <h2 className="mb-3 text-2xl font-bold text-[var(--text-primary)] sm:mb-4 sm:text-3xl lg:text-4xl">
            Nuestros <span className="text-[var(--accent)]">Entrenadores</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            Profesionales certificados que te acompañarán en cada paso de tu transformación.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {trainers.map((trainer, index) => (
            <motion.div
              key={trainer.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--accent)]/30 hover:shadow-[var(--accent)]/5 hover:shadow-xl"
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/10 text-2xl font-bold text-[var(--accent)] transition-all group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-text)]">
                {trainer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <h3 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
                {trainer.name}
              </h3>
              <p className="text-sm text-[var(--accent)]">{trainer.specialty}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
