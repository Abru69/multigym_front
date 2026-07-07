import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Dumbbell, ArrowRight } from 'lucide-react'
import { useRoutineStore } from '@/features/client/store/routineStore'

export function MemberRoutines() {
  const { routines, currentRoutine } = useRoutineStore()

  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Mis Rutinas</h2>
          <Link
            to="/app/rutinas"
            className="flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors hover:brightness-110"
          >
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {routines.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <Dumbbell size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-[var(--text-secondary)]">
              Aún no tienes rutinas asignadas. Tu entrenador las creará pronto.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {routines.slice(0, 2).map((routine) => (
              <div
                key={routine.id}
                className={`rounded-xl border p-5 transition-all hover:shadow-lg ${
                  currentRoutine?.id === routine.id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Dumbbell size={16} className="text-[var(--accent)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">{routine.name}</h3>
                  {currentRoutine?.id === routine.id && (
                    <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                      Activa
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  {routine.days.length} días ·{' '}
                  {routine.days.reduce((acc, d) => acc + d.exercises.length, 0)} ejercicios
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
