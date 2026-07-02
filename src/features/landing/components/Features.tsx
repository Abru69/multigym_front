import { motion } from 'framer-motion'
import { Building2, Store, LineChart, Shield, Zap, Smartphone } from 'lucide-react'

const features = [
  {
    icon: Building2,
    title: 'Marca Propia',
    description:
      'Subdominio personalizado (ej. tugimnasio.multigym.com) y colores adaptados a la identidad de tu negocio.',
  },
  {
    icon: Store,
    title: 'E-Commerce Integrado',
    description:
      'Vende suplementos, accesorios y planes adicionales directamente desde tu plataforma.',
  },
  {
    icon: LineChart,
    title: 'Métricas en Tiempo Real',
    description: 'Seguimiento del progreso de tus clientes, asistencia y analíticas de ventas.',
  },
  {
    icon: Shield,
    title: 'Control de Acceso',
    description: 'Gestión de membresías, permisos granulares para staff y clientes.',
  },
  {
    icon: Zap,
    title: 'Alta Disponibilidad',
    description: 'Infraestructura cloud robusta para que tu gimnasio esté siempre operativo.',
  },
  {
    icon: Smartphone,
    title: 'App Móvil PWA',
    description: 'Tus clientes acceden desde su celular como una app nativa, sin descargar nada.',
  },
]

export function Features() {
  return (
    <section className="bg-[var(--bg-primary)] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Todo lo que necesitas en <span className="text-[var(--accent)]">una plataforma</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            Herramientas diseñadas específicamente para la gestión moderna de gimnasios.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 transition-all hover:border-[var(--accent)]/30 hover:shadow-[var(--accent)]/5 hover:shadow-xl"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] transition-all group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-text)] group-hover:shadow-[var(--accent)]/25 group-hover:shadow-lg">
                <feature.icon size={28} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
                {feature.title}
              </h3>
              <p className="text-[var(--text-secondary)]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
