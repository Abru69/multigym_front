import { motion } from 'framer-motion'
import { Clock, MapPin, Phone } from 'lucide-react'
import { useTenantBranding } from '@/hooks/useTenantBranding'

export function GymSchedule() {
  const { branding } = useTenantBranding()
  const { schedule, address, phone } = branding

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
            Horarios y <span className="text-[var(--accent)]">Ubicación</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            Te esperamos para que comiences tu transformación.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Horarios</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="font-medium text-[var(--text-primary)]">Lunes a Viernes</span>
                <span className="text-[var(--accent)]">{schedule.weekdays}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="font-medium text-[var(--text-primary)]">Sábado</span>
                <span className="text-[var(--accent)]">{schedule.saturday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--text-primary)]">Domingo</span>
                <span className="text-[var(--accent)]">{schedule.sunday}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Encuéntranos</h3>
            </div>

            <div className="space-y-4">
              {address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 flex-shrink-0 text-[var(--accent)]" />
                  <span className="text-[var(--text-secondary)]">{address}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="flex-shrink-0 text-[var(--accent)]" />
                  <span className="text-[var(--text-secondary)]">{phone}</span>
                </div>
              )}
              {!address && !phone && (
                <p className="text-[var(--text-muted)]">
                  Contacta para obtener información de ubicación.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
