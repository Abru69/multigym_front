import { motion } from 'framer-motion'
import { ArrowRight, Dumbbell, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { useRoutineStore } from '@/features/client/store/routineStore'
import { useNutritionStore } from '@/features/client/store/nutritionStore'

export function MemberSummary() {
  const { user } = useAuthStore()
  const { branding } = useTenantBranding()
  const { routines, isLoading: routinesLoading, error: routinesError } = useRoutineStore()
  const { plan, isLoading: nutritionLoading, error: nutritionError } = useNutritionStore()

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

        <div className="grid gap-4 lg:grid-cols-2">
          <SummaryCard
            href="/app/rutinas"
            icon={<Dumbbell size={20} />}
            title="Mis rutinas"
            loading={routinesLoading}
            error={routinesError}
          >
            {routines.length > 0 ? (
              <>
                <p className="mb-3 text-sm text-[var(--text-secondary)]">
                  {routines.length}{' '}
                  {routines.length === 1 ? 'rutina asignada' : 'rutinas asignadas'}
                </p>
                <div className="space-y-2">
                  {routines.slice(0, 3).map((routine) => {
                    const exerciseCount = routine.days.reduce(
                      (total, day) => total + day.exercises.length,
                      0
                    )
                    const activeDays = routine.days.filter((day) => !day.isRestDay).length

                    return (
                      <div
                        key={routine.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface)] px-3 py-2"
                      >
                        <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {routine.name}
                        </span>
                        <span className="shrink-0 text-xs text-[var(--text-muted)]">
                          {activeDays} días · {exerciseCount} ejercicios
                        </span>
                      </div>
                    )
                  })}
                </div>
                {routines.length > 3 && (
                  <p className="mt-3 text-xs font-semibold text-[var(--accent)]">
                    +{routines.length - 3} rutinas más
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                Aún no tienes rutinas asignadas.
              </p>
            )}
          </SummaryCard>

          <SummaryCard
            href="/app/nutricion"
            icon={<Utensils size={20} />}
            title="Plan nutricional"
            loading={nutritionLoading}
            error={nutritionError}
          >
            {plan ? (
              <>
                <p className="mb-3 truncate text-sm font-semibold text-[var(--text-primary)]">
                  {plan.name}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Macro label="Kcal" value={plan.targetCalories} color="var(--accent)" />
                  <Macro label="Proteína" value={`${plan.targetProtein}g`} color="var(--success)" />
                  <Macro label="Carbos" value={`${plan.targetCarbs}g`} color="var(--info)" />
                  <Macro label="Grasas" value={`${plan.targetFats}g`} color="var(--warning)" />
                </div>
                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  {plan.meals.length}{' '}
                  {plan.meals.length === 1 ? 'comida planificada' : 'comidas planificadas'}
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                Aún no tienes un plan nutricional asignado.
              </p>
            )}
          </SummaryCard>
        </div>
      </motion.div>
    </section>
  )
}

function SummaryCard({
  href,
  icon,
  title,
  loading,
  error,
  children,
}: {
  href: string
  icon: ReactNode
  title: string
  loading: boolean
  error: string | null
  children: ReactNode
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:shadow-[var(--shadow-md)]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            {icon}
          </div>
          <h2 className="font-bold text-[var(--text-primary)]">{title}</h2>
        </div>
        <ArrowRight
          size={18}
          className="shrink-0 text-[var(--accent)] transition-transform group-hover:translate-x-1"
        />
      </div>

      {loading ? (
        <div className="h-20 animate-pulse rounded-xl bg-[var(--surface)]" />
      ) : error ? (
        <p className="text-sm text-[var(--text-secondary)]">No se pudo cargar esta información.</p>
      ) : (
        children
      )}
    </Link>
  )
}

function Macro({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface)] px-2 py-2 text-center">
      <p className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
        {label}
      </p>
      <p className="text-sm font-black" style={{ color }}>
        {value}
      </p>
    </div>
  )
}
