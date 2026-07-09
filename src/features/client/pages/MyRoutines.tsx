import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoutineStore } from '@/features/client/store/routineStore'
import { createWorkoutLog } from '@/lib/api'
import type { DayOfWeek, Exercise } from '@/types'
import {
  CheckCircle2,
  Play,
  ChevronDown,
  Flame,
  Moon,
  Dumbbell,
  Timer,
  Trophy,
  Zap,
  Clock,
  RotateCcw,
  X,
  Info,
} from 'lucide-react'

const DAYS: { key: DayOfWeek; short: string; full: string }[] = [
  { key: 'lunes', short: 'L', full: 'Lunes' },
  { key: 'martes', short: 'M', full: 'Martes' },
  { key: 'miercoles', short: 'X', full: 'Miércoles' },
  { key: 'jueves', short: 'J', full: 'Jueves' },
  { key: 'viernes', short: 'V', full: 'Viernes' },
  { key: 'sabado', short: 'S', full: 'Sábado' },
  { key: 'domingo', short: 'D', full: 'Domingo' },
]

const JS_DAY_MAP: DayOfWeek[] = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
]

const REST_QUOTES = [
  'Tu cuerpo se recupera y crece mientras descansas.',
  'El descanso es parte del entrenamiento.',
  'Los músculos se construyen fuera del gimnasio.',
  'Un guerrero sabe cuándo descansar.',
]

const MUSCLE_COLORS: Record<string, string> = {
  pecho: '#ff6b6b',
  espalda: '#4ecdc4',
  hombros: '#45b7d1',
  biceps: '#f9ca24',
  triceps: '#f0932b',
  piernas: '#6c5ce7',
  gluteos: '#fd79a8',
  abdomen: '#00b894',
  cardio: '#e17055',
  'cuerpo-completo': '#0084ff',
}

const MUSCLE_LABELS: Record<string, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  hombros: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  piernas: 'Piernas',
  gluteos: 'Glúteos',
  abdomen: 'Abdomen',
  cardio: 'Cardio',
  'cuerpo-completo': 'Full Body',
}

const makeSetKey = (day: DayOfWeek, exId: string, setIdx: number) => `${day}:${exId}-${setIdx}`

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 5,
}: {
  progress: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  const isComplete = progress >= 100

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? 'var(--success, #22c55e)' : 'var(--accent)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <Trophy size={20} className="text-[var(--success, #22c55e)]" />
          </motion.div>
        ) : (
          <>
            <span className="text-lg leading-none font-black text-[var(--text-primary)]">
              {Math.round(progress)}
            </span>
            <span className="text-[7px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              %
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function ExerciseCard({
  exercise,
  index,
  dayKey,
  isExpanded,
  completedSets,
  restTimer,
  onToggle,
  onToggleSet,
  onSkipRest,
}: {
  exercise: Exercise
  index: number
  dayKey: DayOfWeek
  isExpanded: boolean
  completedSets: Set<string>
  restTimer: { exerciseId: string; seconds: number; total: number } | null
  onToggle: () => void
  onToggleSet: (exercise: Exercise, setIndex: number) => void
  onSkipRest: () => void
}) {
  const setsArray = Array.from({ length: exercise.sets }, (_, i) => i)
  const doneSets = setsArray.filter((i) =>
    completedSets.has(makeSetKey(dayKey, exercise.id, i))
  ).length
  const allDone = doneSets === exercise.sets
  const muscleColor = MUSCLE_COLORS[exercise.muscleGroup] ?? 'var(--accent)'
  const hasActiveTimer = restTimer?.exerciseId === exercise.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`overflow-hidden rounded-2xl border transition-all ${
        allDone
          ? 'border-[var(--success, #22c55e)]/20 bg-[var(--success, #22c55e)]/5'
          : isExpanded
            ? 'border-[var(--accent)] shadow-md'
            : 'border-[var(--border)] bg-[var(--card)]'
      }`}
    >
      {/* Collapsed header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left select-none active:scale-[0.98] transition-transform"
        style={{ opacity: allDone && !isExpanded ? 0.5 : 1 }}
      >
        {/* Thumbnail */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--surface)]">
          {exercise.imageUrl ? (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Dumbbell size={20} className="text-[var(--text-muted)]" />
            </div>
          )}
          {allDone && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--success, #22c55e)]/20">
              <CheckCircle2 size={18} className="text-[var(--success, #22c55e)]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className="truncate text-sm font-bold text-[var(--text-primary)]"
              style={{ textDecoration: allDone ? 'line-through' : 'none' }}
            >
              {exercise.name}
            </p>
            <span
              className="shrink-0 rounded-full px-1.5 py-px text-[7px] font-bold uppercase"
              style={{
                background: `${muscleColor}15`,
                color: muscleColor,
              }}
            >
              {MUSCLE_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {exercise.sets} × {exercise.reps}
            {exercise.weight ? ` · ${exercise.weight}` : ''}
          </p>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2">
          {!isExpanded && hasActiveTimer && restTimer && (
            <motion.span
              className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)] tabular-nums"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {restTimer.seconds}s
            </motion.span>
          )}
          <span className={`text-xs font-bold tabular-nums ${allDone ? 'text-[var(--success, #22c55e)]' : 'text-[var(--text-muted)]'}`}>
            {doneSets}/{exercise.sets}
          </span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-[var(--text-muted)]" />
          </motion.div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="exp"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-[var(--border)] px-3 pb-4 pt-3">
              {/* Rest timer inline */}
              {hasActiveTimer && restTimer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between rounded-xl bg-[var(--accent)]/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Timer size={16} className="text-[var(--accent)]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        Descanso
                      </p>
                      <p className="text-xl font-black tabular-nums text-[var(--accent)]">
                        {restTimer.seconds}s
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSkipRest()
                    }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    Saltar
                  </button>
                </motion.div>
              )}

              {/* Exercise image large */}
              {exercise.imageUrl && (
                <div className="overflow-hidden rounded-xl" style={{ height: 140 }}>
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Description */}
              {exercise.description && (
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {exercise.description}
                </p>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: exercise.sets, label: 'Series', accent: true },
                  { val: exercise.reps, label: 'Reps', accent: true },
                  { val: `${exercise.restSeconds}s`, label: 'Descanso', accent: false },
                  { val: exercise.weight || '—', label: 'Peso', accent: false },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-center"
                  >
                    <p
                      className={`text-base font-black ${
                        s.accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {s.val}
                    </p>
                    <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Set tracking — large circles */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  Series
                </p>
                <div className="flex gap-2">
                  {setsArray.map((i) => {
                    const key = makeSetKey(dayKey, exercise.id, i)
                    const done = completedSets.has(key)
                    return (
                      <button
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleSet(exercise, i)
                        }}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-bold transition-all active:scale-90 ${
                          done
                            ? 'border-[var(--success, #22c55e)] bg-[var(--success, #22c55e)]/10 text-[var(--success, #22c55e)]'
                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30'
                        }`}
                      >
                        {done ? <CheckCircle2 size={18} /> : i + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tips */}
              {exercise.tips && exercise.tips.length > 0 && (
                <div className="rounded-xl bg-[var(--surface)] p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Zap size={10} className="text-[var(--accent)]" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      Consejos
                    </p>
                  </div>
                  <div className="space-y-1">
                    {exercise.tips.map((tip, i) => (
                      <p key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]/40" />
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Video link */}
              {exercise.videoUrl && (
                <a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-sm font-bold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
                >
                  <Play size={14} /> Ver Video
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -100 : 100, opacity: 0 }),
}

export default function MyRoutines() {
  const { currentRoutine, selectedDay, setSelectedDay, loadRoutines } = useRoutineStore()

  const todayKey = JS_DAY_MAP[new Date().getDay()]
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const STORAGE_KEY = `multigym-progress-${todayDateStr}`

  const [completedSets, setCompletedSets] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(
        `multigym-progress-${new Date().toISOString().split('T')[0]}`
      )
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set()
    } catch {
      return new Set()
    }
  })

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [direction, setDirection] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [restDoneFlash, setRestDoneFlash] = useState(false)
  const [showSwipeTip, setShowSwipeTip] = useState(false)

  const [restTimer, setRestTimer] = useState<{
    exerciseId: string
    seconds: number
    total: number
  } | null>(null)

  const prevProgressRef = useRef(0)

  useEffect(() => {
    loadRoutines()
  }, [loadRoutines])

  useEffect(() => {
    if (completedSets.size > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedSets]))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [completedSets, STORAGE_KEY])

  useEffect(() => {
    if (!workoutStarted) return
    const iv = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(iv)
  }, [workoutStarted])

  const timerActive = restTimer !== null
  useEffect(() => {
    if (!timerActive) return
    const iv = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev || prev.seconds <= 1) {
          try {
            navigator.vibrate?.([100, 50, 100])
          } catch {
            /* no-op */
          }
          setRestDoneFlash(true)
          setTimeout(() => setRestDoneFlash(false), 2500)
          return null
        }
        return { ...prev, seconds: prev.seconds - 1 }
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [timerActive])

  useEffect(() => {
    if (!localStorage.getItem('multigym-swipe-tip')) {
      setShowSwipeTip(true)
      const t = setTimeout(() => {
        setShowSwipeTip(false)
        localStorage.setItem('multigym-swipe-tip', '1')
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [])

  const today = new Date()
  const dow = today.getDay()
  const diffToMon = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMon)
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const todayRoutine = currentRoutine?.days.find((d) => d.dayOfWeek === selectedDay)
  const exercises = todayRoutine?.exercises ?? []
  const selectedDayData = DAYS.find((d) => d.key === selectedDay)
  const dayIndex = DAYS.findIndex((d) => d.key === selectedDay)

  const totalSets = exercises.reduce((s, ex) => s + ex.sets, 0)
  const completedSetCount = exercises.reduce(
    (s, ex) =>
      s +
      Array.from({ length: ex.sets }).filter((_, i) =>
        completedSets.has(makeSetKey(selectedDay, ex.id, i))
      ).length,
    0
  )
  const progress = totalSets > 0 ? (completedSetCount / totalSets) * 100 : 0

  const totalExercises = exercises.length
  const completedExerciseCount = exercises.filter((ex) =>
    Array.from({ length: ex.sets }).every((_, i) =>
      completedSets.has(makeSetKey(selectedDay, ex.id, i))
    )
  ).length

  const estimatedMinutes = useMemo(() => {
    if (!exercises.length) return 0
    return Math.round(
      exercises.reduce((sum, ex) => {
        const reps = parseInt(ex.reps) || 10
        return sum + ex.sets * (reps * 3.5 + ex.restSeconds)
      }, 0) / 60
    )
  }, [exercises])

  const restQuote = useMemo(
    () => REST_QUOTES[Math.floor(Math.random() * REST_QUOTES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDay]
  )

  useEffect(() => {
    if (
      progress >= 100 &&
      prevProgressRef.current < 100 &&
      !todayRoutine?.isRestDay &&
      totalSets > 0
    ) {
      setShowCelebration(true)
      try {
        navigator.vibrate?.([100, 50, 100, 50, 200])
      } catch {
        /* no-op */
      }
      if (currentRoutine?.id) {
        const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
        const estimatedCalories = Math.max(1, Math.round(totalExercises * 8 + durationMinutes * 5))
        createWorkoutLog({
          workoutId: currentRoutine.id,
          durationMinutes,
          caloriesBurned: estimatedCalories,
        }).catch(() => {})
      }
    }
    prevProgressRef.current = progress
  }, [progress, todayRoutine?.isRestDay, totalSets, currentRoutine?.id, elapsedSeconds, totalExercises])

  const goToDay = (newDay: DayOfWeek) => {
    const oldIdx = DAYS.findIndex((d) => d.key === selectedDay)
    const newIdx = DAYS.findIndex((d) => d.key === newDay)
    setDirection(newIdx > oldIdx ? 1 : -1)
    setSelectedDay(newDay)
    setExpandedId(null)
    setRestTimer(null)
  }

  const handleToggleSet = (exercise: Exercise, setIndex: number) => {
    const key = makeSetKey(selectedDay, exercise.id, setIndex)
    const isChecking = !completedSets.has(key)

    setCompletedSets((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

    if (isChecking) {
      setRestTimer({
        exerciseId: exercise.id,
        seconds: exercise.restSeconds,
        total: exercise.restSeconds,
      })
      if (!workoutStarted) setWorkoutStarted(true)
      try {
        navigator.vibrate?.(40)
      } catch {
        /* no-op */
      }
    }
  }

  const resetDayProgress = () => {
    setCompletedSets((prev) => {
      const next = new Set(prev)
      for (const key of prev) {
        if (key.startsWith(`${selectedDay}:`)) next.delete(key)
      }
      return next
    })
    setWorkoutStarted(false)
    setElapsedSeconds(0)
    setRestTimer(null)
  }

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60 && dayIndex < 6) goToDay(DAYS[dayIndex + 1].key)
    else if (info.offset.x > 60 && dayIndex > 0) goToDay(DAYS[dayIndex - 1].key)
  }

  return (
    <div
      className={`mx-auto max-w-2xl px-4 py-6 ${
        !todayRoutine?.isRestDay && totalSets > 0 ? 'pb-44 lg:pb-28' : ''
      }`}
    >
      {/* Rest done flash */}
      <AnimatePresence>
        {restDoneFlash && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-bold text-[var(--accent-text)] shadow-lg"
          >
            ¡Descanso terminado!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe tip */}
      <AnimatePresence>
        {showSwipeTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]"
          >
            <Info size={12} />
            Desliza para cambiar de día
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header — Day name + Progress ring */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Rutina de
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-[var(--text-primary)] sm:text-5xl">
            {selectedDayData?.full.toUpperCase()}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            {todayRoutine?.isRestDay ? (
              <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                <Moon size={14} /> Descanso
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                <Dumbbell size={14} />
                {todayRoutine?.label ?? 'Sin ejercicios'}
                {estimatedMinutes > 0 && ` · ~${estimatedMinutes} min`}
              </span>
            )}
            {todayKey === selectedDay && (
              <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold text-[var(--accent-text)]">
                HOY
              </span>
            )}
          </div>
        </div>
        {!todayRoutine?.isRestDay && totalSets > 0 && (
          <ProgressRing progress={progress} size={80} strokeWidth={5} />
        )}
      </div>

      {/* Week selector — horizontal scroll */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DAYS.map((d, i) => {
          const isSelected = d.key === selectedDay
          const isToday = d.key === todayKey
          const dayData = currentRoutine?.days.find((r) => r.dayOfWeek === d.key)
          const isRest = dayData?.isRestDay ?? false
          const dateObj = weekDates[i]

          const dayExercises = dayData?.exercises ?? []
          const dayTotal = dayExercises.reduce((s, ex) => s + ex.sets, 0)
          const dayDone = dayExercises.reduce(
            (s, ex) =>
              s +
              Array.from({ length: ex.sets }).filter((_, j) =>
                completedSets.has(makeSetKey(d.key, ex.id, j))
              ).length,
            0
          )
          const dayAllDone = dayTotal > 0 && dayDone === dayTotal

          return (
            <button
              key={d.key}
              onClick={() => goToDay(d.key)}
              className={`relative flex min-w-[52px] flex-col items-center gap-1 rounded-2xl px-3 py-3 transition-all active:scale-95 ${
                isSelected
                  ? 'bg-[var(--accent)] shadow-sm'
                  : 'bg-[var(--card)] border border-[var(--border)]'
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {d.short}
              </span>
              <span
                className={`text-xl leading-none font-black ${
                  isSelected
                    ? 'text-[var(--accent-text)]'
                    : isToday
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-primary)]'
                }`}
              >
                {dateObj.getDate()}
              </span>
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: dayAllDone
                    ? 'var(--success, #22c55e)'
                    : isRest
                      ? 'var(--text-muted)'
                      : isSelected
                        ? 'var(--accent-text)'
                        : 'var(--accent)',
                  opacity: isRest ? 0.3 : 0.8,
                }}
              />
              {isToday && !isSelected && (
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-[var(--accent)]/30"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Day content — swipeable */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={selectedDay}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          className="touch-pan-y space-y-3"
        >
          {/* Progress bar */}
          {!todayRoutine?.isRestDay && totalSets > 0 && (
            <div className="h-1 overflow-hidden rounded-full bg-[var(--surface-hover)]">
              <motion.div
                className={`h-full rounded-full ${
                  progress >= 100 ? 'bg-[var(--success, #22c55e)]' : 'bg-[var(--accent)]'
                }`}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          )}

          {/* Rest day */}
          {todayRoutine?.isRestDay ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16 text-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Moon size={40} className="text-[var(--text-muted)]" />
              </motion.div>
              <p className="mt-4 text-lg font-black text-[var(--text-primary)]">
                Día de Descanso
              </p>
              <p className="mt-2 max-w-xs text-sm text-[var(--text-muted)]">
                {restQuote}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Exercise list */}
              {exercises.map((exercise, i) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  index={i}
                  dayKey={selectedDay}
                  isExpanded={expandedId === exercise.id}
                  completedSets={completedSets}
                  restTimer={restTimer}
                  onToggle={() => setExpandedId(expandedId === exercise.id ? null : exercise.id)}
                  onToggleSet={handleToggleSet}
                  onSkipRest={() => setRestTimer(null)}
                />
              ))}

              {/* Completed state */}
              {progress >= 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center rounded-2xl border border-[var(--success, #22c55e)]/20 bg-[var(--success, #22c55e)]/5 py-10 text-center"
                >
                  <Trophy size={32} className="text-[var(--success, #22c55e)]" />
                  <p className="mt-3 text-base font-black text-[var(--success, #22c55e)]">
                    ¡Rutina Completada!
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {completedSetCount} series · {formatTime(elapsedSeconds)}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom bar — active workout */}
      <AnimatePresence>
        {!todayRoutine?.isRestDay && totalSets > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ delay: 0.3, type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed right-0 bottom-[68px] left-0 z-40 border-t border-[var(--border)] bg-[var(--card)] shadow-lg lg:bottom-0"
          >
            <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
              <button
                onClick={resetDayProgress}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)]"
                title="Reiniciar"
              >
                <RotateCcw size={16} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    {completedSetCount}/{totalSets} series
                  </span>
                  {workoutStarted && (
                    <span className="text-xs font-bold tabular-nums text-[var(--accent)]">
                      <Clock size={10} className="mr-1 inline" />
                      {formatTime(elapsedSeconds)}
                    </span>
                  )}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]">
                  <motion.div
                    className={`h-full rounded-full ${
                      progress >= 100 ? 'bg-[var(--success, #22c55e)]' : 'bg-[var(--accent)]'
                    }`}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (progress < 100) setWorkoutStarted(!workoutStarted)
                }}
                className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-xl px-5 text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                  progress >= 100
                    ? 'bg-[var(--success, #22c55e)] text-white'
                    : workoutStarted
                      ? 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]'
                      : 'bg-[var(--accent)] text-[var(--accent-text)]'
                }`}
              >
                {progress >= 100 ? (
                  <>
                    <Trophy size={14} /> ¡Hecho!
                  </>
                ) : workoutStarted ? (
                  <>
                    <Timer size={14} /> {formatTime(elapsedSeconds)}
                  </>
                ) : (
                  <>
                    <Flame size={14} /> Iniciar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration modal — clean, no emojis */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--bg-primary)]/95 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14 }}
              className="relative px-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Trophy size={48} className="mx-auto text-[var(--accent)]" />
              </motion.div>

              <h2
                className="mt-5 text-3xl font-black tracking-tight sm:text-4xl"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ¡Completado!
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Gran trabajo, sigue así</p>

              <div className="mx-auto mt-8 grid max-w-xs grid-cols-3 gap-3">
                {[
                  { val: formatTime(elapsedSeconds), label: 'Tiempo', color: 'var(--accent)' },
                  { val: String(completedSetCount), label: 'Series', color: 'var(--success, #22c55e)' },
                  { val: String(totalExercises), label: 'Ejercicios', color: 'var(--text-secondary)' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"
                  >
                    <p className="text-xl font-black" style={{ color: s.color }}>
                      {s.val}
                    </p>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="mt-8 rounded-xl bg-[var(--accent)] px-8 py-3 text-sm font-bold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
              >
                Continuar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
