import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoutineStore } from '@/features/client/store/routineStore'
import type { DayOfWeek, Exercise } from '@/types'
import {
  CheckCircle2,
  Circle,
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
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const MotionButton = motion(Button)

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
const todayKey = JS_DAY_MAP[new Date().getDay()]

const REST_QUOTES = [
  'Tu cuerpo se recupera y crece mientras descansas. ¡Aprovéchalo!',
  'El descanso es parte del entrenamiento. Mañana vuelves con todo.',
  'Los músculos se construyen fuera del gimnasio. Recarga energías.',
  'Un guerrero sabe cuándo descansar. Mañana, a darlo todo.',
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
  size = 90,
  strokeWidth = 6,
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
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="#00cc88" />
          </linearGradient>
        </defs>
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
          stroke={isComplete ? 'var(--success)' : 'url(#ringGrad)'}
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
            <Trophy size={24} style={{ color: 'var(--success)' }} />
          </motion.div>
        ) : (
          <>
            <span
              className="text-xl leading-none font-black"
              style={{ color: 'var(--text-primary)' }}
            >
              {Math.round(progress)}
            </span>
            <span
              className="text-[8px] font-bold tracking-wider uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              %
            </span>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   EXERCISE CARD
   ═══════════════════════════════════════════════ */

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
  const setProgress = exercise.sets > 0 ? (doneSets / exercise.sets) * 100 : 0
  const muscleColor = MUSCLE_COLORS[exercise.muscleGroup] ?? 'var(--accent)'
  const hasActiveTimer = restTimer?.exerciseId === exercise.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="overflow-hidden rounded-2xl transition-shadow"
      style={{
        background: isExpanded ? 'var(--surface-hover)' : 'var(--surface)',
        border: `1px solid ${allDone ? 'var(--success)' : isExpanded ? 'var(--accent)' : 'var(--border)'}`,
        backdropFilter: isExpanded ? 'blur(16px)' : 'none',
        boxShadow: isExpanded ? 'var(--shadow-glow)' : allDone ? 'var(--shadow-md)' : 'none',
        animation: allDone ? 'celebrate 0.5s ease-out' : 'none',
      }}
    >
      {/* ── COLLAPSED HEADER ── */}
      <motion.div
        className="flex cursor-pointer items-center gap-2.5 p-3.5 select-none"
        onClick={onToggle}
        whileTap={{ scale: 0.98 }}
        style={{ opacity: allDone && !isExpanded ? 0.55 : 1 }}
      >
        {/* Exercise number */}
        <span
          className="w-5 flex-shrink-0 text-center text-[10px] font-black tabular-nums"
          style={{ color: 'var(--text-muted)', opacity: 0.35 }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Thumbnail */}
        <div
          className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl"
          style={{ background: 'var(--background)' }}
        >
          {exercise.imageUrl && (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
          {allDone && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'var(--accent-muted)' }}
            >
              <CheckCircle2 size={20} style={{ color: 'var(--text-on-primary)' }} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p
            className="text-sm leading-tight font-bold"
            style={{
              color: 'var(--text-primary)',
              textDecoration: allDone ? 'line-through' : 'none',
              textDecorationColor: 'var(--success)',
            }}
          >
            {exercise.name}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {exercise.sets} series × {exercise.reps}
              {exercise.weight ? ` · ${exercise.weight}` : ''}
            </p>
            <span
              className="rounded-full px-1.5 py-px text-[7px] font-bold uppercase"
              style={{
                background: `${muscleColor}18`,
                color: muscleColor,
                border: `1px solid ${muscleColor}30`,
              }}
            >
              {MUSCLE_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup}
            </span>
          </div>
          {/* Mini progress bar */}
          <div
            className="mt-2 h-1 overflow-hidden rounded-full"
            style={{ background: 'var(--border)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: allDone ? 'var(--success)' : 'var(--accent)' }}
              animate={{ width: `${setProgress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {/* Rest timer badge (when collapsed) */}
          {!isExpanded && hasActiveTimer && restTimer && (
            <motion.span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
              style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {restTimer.seconds}s
            </motion.span>
          )}
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: allDone ? 'var(--success)' : 'var(--text-muted)' }}
          >
            {doneSets}/{exercise.sets}
          </span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </motion.div>
        </div>
      </motion.div>

      {/* ── EXPANDED CONTENT ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="exp"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="space-y-3.5 px-3.5 pb-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {/* Rest timer (inline) */}
              {hasActiveTimer && restTimer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3.5 rounded-xl p-4 text-center"
                  style={{
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--accent)',
                  }}
                >
                  <p
                    className="mb-2 text-[9px] font-bold tracking-widest uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ⏱ Descanso
                  </p>
                  <div className="relative mx-auto mb-2 h-16 w-16">
                    <svg width={64} height={64} className="-rotate-90">
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth={4}
                      />
                      <circle
                        cx={32}
                        cy={32}
                        r={26}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={
                          2 * Math.PI * 26 * (1 - restTimer.seconds / restTimer.total)
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-lg font-black tabular-nums"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {restTimer.seconds}
                      </span>
                    </div>
                  </div>
                  <MotionButton
                    whileTap={{ scale: 0.9 }}
                    variant="outline"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      onSkipRest()
                    }}
                    className="border-border text-text-muted bg-surface hover:bg-surface-hover h-auto rounded-full px-3 py-1 text-[10px] font-bold"
                  >
                    Saltar
                  </MotionButton>
                </motion.div>
              )}

              {/* Large image */}
              {exercise.imageUrl && (
                <div className="mt-3.5 overflow-hidden rounded-xl" style={{ height: 160 }}>
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {exercise.description && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {exercise.description}
                </p>
              )}

              {/* Bento metrics */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: exercise.sets, label: 'Series', accent: true },
                  { val: exercise.reps, label: 'Reps', accent: true },
                  { val: `${exercise.restSeconds}s`, label: 'Descanso', accent: false },
                  { val: exercise.weight || '—', label: 'Peso', accent: false },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-2.5 text-center"
                    style={{ background: 'var(--background)' }}
                  >
                    <p
                      className="text-base font-bold"
                      style={{ color: s.accent ? 'var(--accent)' : 'var(--text-primary)' }}
                    >
                      {s.val}
                    </p>
                    <p
                      className="mt-0.5 text-[9px] font-semibold tracking-wider uppercase"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Per-set checkboxes */}
              <div>
                <p
                  className="mb-2 text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Seguimiento de series
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {setsArray.map((i) => {
                    const key = makeSetKey(dayKey, exercise.id, i)
                    const done = completedSets.has(key)
                    return (
                      <MotionButton
                        key={key}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          onToggleSet(exercise, i)
                        }}
                        className="flex h-auto items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold"
                        style={{
                          background: done ? 'var(--accent-muted)' : 'var(--bg-primary)',
                          border: `1.5px solid ${done ? 'var(--success)' : 'var(--border)'}`,
                          color: done ? 'var(--success)' : 'var(--text-secondary)',
                        }}
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.04 }}
                      >
                        {done ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Circle size={14} style={{ opacity: 0.5 }} />
                        )}
                        Set {i + 1}
                      </MotionButton>
                    )
                  })}
                </div>
              </div>

              {/* Tips */}
              {exercise.tips && exercise.tips.length > 0 && (
                <div className="rounded-xl p-3" style={{ background: 'var(--background)' }}>
                  <p
                    className="mb-1.5 text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Consejos
                  </p>
                  <div className="space-y-1.5">
                    {exercise.tips.map((tip, i) => (
                      <p
                        key={i}
                        className="flex items-start gap-1.5 text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Zap
                          size={10}
                          className="mt-0.5 flex-shrink-0"
                          style={{ color: 'var(--detail)' }}
                        />
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Video button */}
              {exercise.videoUrl && (
                <motion.a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
                  style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Play size={16} /> Ver Video Demostrativo
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -120 : 120, opacity: 0 }),
}

export default function MyRoutines() {
  const { currentRoutine, selectedDay, setSelectedDay, loadRoutines } = useRoutineStore()

  /* ── State ── */
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

  // Rest timer
  const [restTimer, setRestTimer] = useState<{
    exerciseId: string
    seconds: number
    total: number
  } | null>(null)

  const prevProgressRef = useRef(0)

  useEffect(() => {
    loadRoutines()
  }, [loadRoutines])

  // Persist completed sets to localStorage
  useEffect(() => {
    if (completedSets.size > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedSets]))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [completedSets, STORAGE_KEY])

  // Workout timer
  useEffect(() => {
    if (!workoutStarted) return
    const iv = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(iv)
  }, [workoutStarted])

  // Rest timer countdown
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

  // Swipe tip (first visit only)
  useEffect(() => {
    if (!localStorage.getItem('multigym-swipe-tip')) {
      setShowSwipeTip(true)
      const t = setTimeout(() => {
        setShowSwipeTip(false)
        localStorage.setItem('multigym-swipe-tip', '1')
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [])

  /* ── Week dates ── */
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
  const monthLabel = today
    .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase())

  /* ── Computed ── */
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

  // Celebration trigger — fires only when crossing 100%
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
    }
    prevProgressRef.current = progress
  }, [progress, todayRoutine?.isRestDay, totalSets])

  /* ── Handlers ── */
  const goToDay = (newDay: DayOfWeek) => {
    const oldIdx = DAYS.findIndex((d) => d.key === selectedDay)
    const newIdx = DAYS.findIndex((d) => d.key === newDay)
    setDirection(newIdx > oldIdx ? 1 : -1)
    setSelectedDay(newDay)
    setExpandedId(null)
    setRestTimer(null)
    // Don't reset completedSets — they persist per day key!
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
      // Start rest timer
      setRestTimer({
        exerciseId: exercise.id,
        seconds: exercise.restSeconds,
        total: exercise.restSeconds,
      })
      // Auto-start workout
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

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div
      className={`mx-auto max-w-2xl space-y-5 px-4 py-6 ${
        !todayRoutine?.isRestDay && totalSets > 0 ? 'pb-44 lg:pb-28' : ''
      }`}
    >
      {/* ══ REST DONE FLASH NOTIFICATION ══ */}
      <AnimatePresence>
        {restDoneFlash && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            ⏱️ ¡Descanso terminado! Siguiente serie
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ SWIPE TIP ══ */}
      <AnimatePresence>
        {showSwipeTip && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-1.5 text-center text-xs font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            👆 Desliza horizontalmente para cambiar de día
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          CALENDARIO SEMANAL
         ══════════════════════════════════════════ */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-between px-5 pt-4 pb-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <p
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Semana actual
            </p>
            <p className="mt-0.5 text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {monthLabel}
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold"
            style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
          >
            {currentRoutine?.name ?? 'Sin rutina'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 px-3 py-3">
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
              <MotionButton
                key={d.key}
                onClick={() => goToDay(d.key)}
                variant="ghost"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                className="relative flex h-auto flex-col items-center gap-1.5 rounded-2xl px-0 py-2.5"
                style={{
                  background: isSelected ? 'var(--accent)' : 'transparent',
                  boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                }}
              >
                <span
                  className="text-[10px] font-black tracking-wider"
                  style={{ color: isSelected ? 'var(--accent-text)' : 'var(--text-muted)' }}
                >
                  {d.short}
                </span>
                <span
                  className="text-lg leading-none font-black"
                  style={{
                    color: isSelected
                      ? 'var(--accent-text)'
                      : isToday
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                  }}
                >
                  {dateObj.getDate()}
                </span>
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: dayAllDone
                      ? 'var(--success)'
                      : isRest
                        ? isSelected
                          ? 'var(--text-secondary)'
                          : 'var(--text-muted)'
                        : isSelected
                          ? 'var(--accent-text)'
                          : 'var(--accent)',
                    opacity: isRest && !isSelected ? 0.3 : 0.85,
                  }}
                />
                {isToday && !isSelected && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{ border: '1.5px solid var(--accent)' }}
                    animate={{ opacity: [0.15, 0.45, 0.15] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </MotionButton>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CONTENIDO DEL DÍA
         ══════════════════════════════════════════ */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={selectedDay}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          className="touch-pan-y space-y-4"
        >
          {/* Day header */}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2
                className="text-4xl leading-none font-black tracking-tight uppercase sm:text-5xl"
                style={{ color: 'var(--text-primary)' }}
              >
                {selectedDayData?.full}
              </h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {todayRoutine?.isRestDay ? (
                  <span
                    className="flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Moon size={15} /> Día de Descanso
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                  >
                    <Dumbbell size={14} />
                    {todayRoutine?.label ?? 'Sin ejercicios'}
                  </span>
                )}
                {todayKey === selectedDay && (
                  <motion.span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                    animate={{ scale: [1, 1.12, 1], opacity: [1, 0.85, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    HOY
                  </motion.span>
                )}
              </div>
              {!todayRoutine?.isRestDay && totalExercises > 0 && (
                <p className="mt-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {completedExerciseCount} de {totalExercises} ejercicios
                  {estimatedMinutes > 0 && ` · ~${estimatedMinutes} min`}
                </p>
              )}
            </div>
            {!todayRoutine?.isRestDay && totalSets > 0 && (
              <ProgressRing progress={progress} size={90} strokeWidth={6} />
            )}
          </div>

          {/* Progress bar */}
          {!todayRoutine?.isRestDay && totalSets > 0 && (
            <div
              className="h-1.5 overflow-hidden rounded-full"
              style={{ background: 'var(--border)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: progress >= 100 ? 'var(--success)' : 'var(--accent)' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          )}

          {/* ── Exercises / Rest ── */}
          {todayRoutine?.isRestDay ? (
            <motion.div
              className="relative overflow-hidden rounded-2xl py-16 text-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 30%, var(--accent-muted) 0%, transparent 60%)',
                }}
              />
              <motion.p
                className="relative z-10 mb-5 text-6xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                😴
              </motion.p>
              <p
                className="relative z-10 text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Día de Descanso
              </p>
              <p
                className="relative z-10 mx-auto mt-2 max-w-xs text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                {restQuote}
              </p>
              <div className="relative z-10 mt-6 flex items-center justify-center gap-3">
                <Moon size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                >
                  Recuperación activa recomendada
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
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

              {/* Inline completion card */}
              {progress >= 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl py-8 text-center"
                  style={{
                    background: 'var(--accent-muted)',
                    border: '1px solid var(--success)',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Trophy size={36} style={{ color: 'var(--success)', margin: '0 auto' }} />
                  </motion.div>
                  <p className="mt-3 text-lg font-bold" style={{ color: 'var(--success)' }}>
                    ¡Rutina Completada!
                  </p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {completedSetCount} series · {formatTime(elapsedSeconds)}
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          FLOATING BOTTOM BAR
         ══════════════════════════════════════════ */}
      <AnimatePresence>
        {!todayRoutine?.isRestDay && totalSets > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ delay: 0.4, type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed right-0 bottom-[72px] left-0 z-40 lg:bottom-0"
            style={{
              background: 'var(--overlay)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
              {/* Reset */}
              <MotionButton
                whileTap={{ scale: 0.8 }}
                onClick={resetDayProgress}
                variant="ghost"
                className="text-text-muted h-10 w-10 flex-shrink-0 rounded-lg p-2"
                title="Reiniciar progreso del día"
              >
                <RotateCcw size={14} />
              </MotionButton>

              {/* Progress */}
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {completedSetCount}/{totalSets} series
                  </span>
                  {workoutStarted && (
                    <span
                      className="font-mono text-xs font-bold tabular-nums"
                      style={{ color: 'var(--accent)' }}
                    >
                      <Clock size={10} className="mr-1 inline" />
                      {formatTime(elapsedSeconds)}
                    </span>
                  )}
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full"
                  style={{ background: 'var(--border)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: progress >= 100 ? 'var(--success)' : 'var(--accent)' }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Action button */}
              <MotionButton
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => {
                  if (progress < 100) setWorkoutStarted(!workoutStarted)
                }}
                className="flex h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black tracking-wider whitespace-nowrap uppercase"
                style={{
                  background:
                    progress >= 100
                      ? 'var(--success)'
                      : workoutStarted
                        ? 'var(--surface)'
                        : 'var(--accent)',
                  color:
                    progress >= 100
                      ? 'white'
                      : workoutStarted
                        ? 'var(--text-primary)'
                        : 'var(--accent-text)',
                  border:
                    workoutStarted && progress < 100
                      ? '1px solid var(--border)'
                      : '1px solid transparent',
                  boxShadow:
                    progress >= 100
                      ? 'var(--shadow-md)'
                      : !workoutStarted
                        ? 'var(--shadow-glow)'
                        : 'none',
                }}
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
              </MotionButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          CELEBRATION OVERLAY
         ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: 'var(--overlay)' }}
            onClick={() => setShowCelebration(false)}
          >
            {/* Floating emoji particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {['🎉', '💪', '⭐', '🔥', '🏆', '✨', '💥', '🎯'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  initial={{ x: `${15 + Math.random() * 70}%`, y: '110%', opacity: 1 }}
                  animate={{
                    y: '-10%',
                    opacity: [1, 1, 0],
                    rotate: [0, Math.random() > 0.5 ? 360 : -360],
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 2,
                    delay: i * 0.35,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="relative z-10 px-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.p
                className="mb-6 text-7xl"
                animate={{ scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🔥
              </motion.p>
              <h2
                className="mb-2 text-3xl font-black tracking-tight uppercase sm:text-4xl"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--detail))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ¡Rutina Completada!
              </h2>
              <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                Gran trabajo, ¡sigue así! 💪
              </p>

              {/* Stats */}
              <div className="mx-auto mb-8 grid max-w-xs grid-cols-3 gap-3">
                {[
                  { val: formatTime(elapsedSeconds), label: 'Tiempo', color: 'var(--accent)' },
                  { val: String(completedSetCount), label: 'Series', color: 'var(--success)' },
                  { val: String(totalExercises), label: 'Ejercicios', color: 'var(--detail)' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-3"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-xl font-black" style={{ color: s.color }}>
                      {s.val}
                    </p>
                    <p
                      className="mt-0.5 text-[9px] font-semibold tracking-wider uppercase"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <MotionButton
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCelebration(false)}
                className="accent-glow h-12 rounded-xl px-8 py-3 text-sm font-bold"
              >
                ¡Vamos! 🚀
              </MotionButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
