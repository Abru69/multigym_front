import { motion } from 'framer-motion'
import { Dumbbell, Flame, TrendingUp, Clock } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTenantBranding } from '@/hooks/useTenantBranding'

const stats = [
  { label: 'Rutinas Activas', value: '2', icon: Dumbbell, color: 'var(--accent)' },
  { label: 'Calorías esta Semana', value: '1,850', icon: Flame, color: 'var(--warning)' },
  { label: 'Progreso Mensual', value: '+12%', icon: TrendingUp, color: 'var(--success)' },
  { label: 'Horas Entrenadas', value: '8.5', icon: Clock, color: 'var(--detail)' },
]

const recentActivity = [
  { text: 'Completaste Push Day A', time: 'Hace 2 horas', type: 'workout' },
  { text: 'Rutina Semanal asignada', time: 'Ayer', type: 'routine' },
  { text: 'Nuevo record en Bench Press: 80kg', time: 'Hace 3 días', type: 'record' },
]

export function MemberSummary() {
  const { user } = useAuthStore()
  const { branding } = useTenantBranding()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">
          {greeting()}, {user?.name?.split(' ')[0] ?? 'Miembro'}
        </h1>
        <p className="mb-8 text-[var(--text-secondary)]">
          Bienvenido a <span className="font-semibold text-[var(--accent)]">{branding.name}</span>.
          Aquí está tu resumen de hoy.
        </p>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: `${stat.color}15`, color: stat.color }}
                >
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</div>
              <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm text-[var(--text-secondary)]">{activity.text}</span>
                <span className="text-xs text-[var(--text-muted)]">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
