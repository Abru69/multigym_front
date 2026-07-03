import { motion } from 'framer-motion'
import { Dumbbell, Calendar, TrendingUp, Users, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Planificación Semanal',
    description:
      'Organiza rutinas por día con drag & drop. Cada cliente tiene su calendario personalizado.',
  },
  {
    icon: Dumbbell,
    title: 'Biblioteca de Ejercicios',
    description:
      'Más de 100 ejercicios con grupos musculares, series, repeticiones y descanso configurables.',
  },
  {
    icon: TrendingUp,
    title: 'Progresión Automática',
    description:
      'Seguimiento del peso, volumen y tiempo para ajustar la carga de entrenamiento progresivamente.',
  },
  {
    icon: Users,
    title: 'Asignación Masiva',
    description:
      'Asigna rutinas a múltiples clientes simultáneamente o crea plantillas reutilizables.',
  },
]

const steps = [
  {
    step: '1',
    title: 'Selecciona Ejercicios',
    description: 'Elige de la biblioteca o crea ejercicios personalizados',
  },
  {
    step: '2',
    title: 'Organiza por Día',
    description: 'Arrastra y ordena los ejercicios para cada día de la semana',
  },
  {
    step: '3',
    title: 'Asigna a Clientes',
    description: 'Selecciona los miembros que seguirán esta rutina',
  },
  {
    step: '4',
    title: 'Monitorea Progreso',
    description: 'Visualiza el cumplimiento y ajusta según los resultados',
  },
]

export function RoutineShowcase() {
  return (
    <section className="relative bg-[var(--bg-secondary)] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-1.5 text-sm font-medium text-[var(--accent)]">
            <Dumbbell size={16} />
            Función Estrella
          </div>
          <h2 className="mb-4 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Creador de Rutinas <span className="text-[var(--accent)]">Inteligente</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            Diseña planes de entrenamiento personalizados en minutos. Una herramienta intuitiva que
            potencia la experiencia de tus entrenadores y clientes.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--accent)]/30 hover:shadow-[var(--accent)]/5 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-text)]">
                <feature.icon size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"
        >
          <h3 className="mb-8 text-center text-xl font-bold text-[var(--text-primary)]">
            Cómo Funciona
          </h3>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-lg font-bold text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg">
                  {step.step}
                </div>
                <h4 className="mb-2 font-semibold text-[var(--text-primary)]">{step.title}</h4>
                <p className="text-sm text-[var(--text-secondary)]">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight
                    size={20}
                    className="absolute top-6 right-0 hidden text-[var(--text-muted)] lg:block"
                    style={{ transform: 'translateX(50%)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
