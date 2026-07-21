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
      <section className="border-t border-[var(--border)] py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-32 animate-pulse rounded-2xl bg-[var(--surface)]" />
            <div className="h-32 animate-pulse rounded-2xl bg-[var(--surface)]" />
          </div>
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
    <section className="border-t border-[var(--border)] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-3">
          <p className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
            Tu progreso
          </p>
          <h2 className="mt-1 text-xl font-black text-[var(--text-primary)] sm:text-2xl">
            Tu plan de entrenamiento
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <SummaryCard
            href="/app/rutinas"
            icon={<Dumbbell size={20} />}
            title="Mis rutinas"
            status={routineStatus}
            available={!routinesError && routines.length > 0}
          />
          <SummaryCard
            href="/app/nutricion"
            icon={<Utensils size={20} />}
            title="Plan nutricional"
            status={nutritionStatus}
            available={!nutritionError && Boolean(plan)}
          />
        </div>
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
      className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/50 sm:p-5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] sm:h-11 sm:w-11">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">{status}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-[var(--accent)]">
        {available && <CheckCircle2 size={16} />}
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
