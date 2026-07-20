import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Dumbbell, Utensils } from 'lucide-react'
import { useRoutineStore } from '@/features/client/store/routineStore'
import { useNutritionStore } from '@/features/client/store/nutritionStore'

export function MemberPlanSummary() {
  const {
    routines,
    isLoading: routinesLoading,
    error: routinesError,
    loadRoutines,
  } = useRoutineStore()
  const { plan, isLoading: nutritionLoading, error: nutritionError, loadPlan } = useNutritionStore()

  useEffect(() => {
    void loadRoutines()
    void loadPlan()
  }, [loadRoutines, loadPlan])

  if (routinesLoading || nutritionLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-2xl bg-[var(--surface)]" />
          <div className="h-32 animate-pulse rounded-2xl bg-[var(--surface)]" />
        </div>
      </section>
    )
  }

  const routineStatus = routinesError
    ? 'No disponible'
    : routines.length > 0
      ? `${routines.length} ${routines.length === 1 ? 'rutina asignada' : 'rutinas asignadas'}`
      : 'Sin rutinas asignadas'
  const nutritionStatus = nutritionError ? 'No disponible' : plan ? plan.name : 'Sin plan asignado'

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <p className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
          Tu progreso
        </p>
        <h2 className="mt-1 text-2xl font-black text-[var(--text-primary)]">
          Tu plan de entrenamiento
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          href="/app/rutinas"
          icon={<Dumbbell size={22} />}
          title="Mis rutinas"
          status={routineStatus}
          available={!routinesError && routines.length > 0}
        />
        <SummaryCard
          href="/app/nutricion"
          icon={<Utensils size={22} />}
          title="Plan nutricional"
          status={nutritionStatus}
          available={!nutritionError && Boolean(plan)}
        />
      </div>
    </section>
  )
}

function SummaryCard({
  href,
  icon,
  title,
  status,
  available,
}: {
  href: string
  icon: ReactNode
  title: string
  status: string
  available: boolean
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[var(--accent)]">
          {available && <CheckCircle2 size={16} />}
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
