import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRoutineStore } from "@/store/routineStore"
import type { DayOfWeek, Exercise } from "@/types"
import { CheckCircle2, Circle, Play, X, ChevronRight, Flame, Moon, Dumbbell } from "lucide-react"

const DAYS: { key: DayOfWeek; short: string; full: string }[] = [
  { key: "lunes",     short: "LUN", full: "Lunes"     },
  { key: "martes",    short: "MAR", full: "Martes"    },
  { key: "miercoles", short: "MIÉ", full: "Miércoles" },
  { key: "jueves",    short: "JUE", full: "Jueves"    },
  { key: "viernes",   short: "VIE", full: "Viernes"   },
  { key: "sabado",    short: "SÁB", full: "Sábado"    },
  { key: "domingo",   short: "DOM", full: "Domingo"   },
]

const JS_DAY_MAP: DayOfWeek[] = [
  "domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado",
]
const todayKey = JS_DAY_MAP[new Date().getDay()]

export default function MyRoutines() {
  const { currentRoutine, selectedDay, setSelectedDay, loadRoutines } = useRoutineStore()
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [viewExercise, setViewExercise] = useState<Exercise | null>(null)

  useEffect(() => { loadRoutines() }, [loadRoutines])

  // Semana actual (lunes = día 0)
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
    .toLocaleDateString("es-MX", { month: "long", year: "numeric" })
    .replace(/^\w/, c => c.toUpperCase())

  const todayRoutine   = currentRoutine?.days.find(d => d.dayOfWeek === selectedDay)
  const totalExercises = todayRoutine?.exercises.length ?? 0
  const completedCount = todayRoutine?.exercises.filter(e => completed.has(e.id)).length ?? 0
  const progress       = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0
  const selectedDayData = DAYS.find(d => d.key === selectedDay)

  const toggleComplete = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* ══════════════════════════════
          CALENDARIO SEMANAL
         ══════════════════════════════ */}
      <div className="rounded-3xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-0.5"
              style={{ color: "var(--text-muted)" }}>Semana actual</p>
            <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
              {monthLabel}
            </h1>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
            {currentRoutine?.name ?? "Sin rutina"}
          </span>
        </div>

        {/* Grid 7 días */}
        <div className="grid grid-cols-7">
          {DAYS.map((d, i) => {
            const isSelected = d.key === selectedDay
            const isToday    = d.key === todayKey
            const dayData    = currentRoutine?.days.find(r => r.dayOfWeek === d.key)
            const isRest     = dayData?.isRestDay ?? false
            const exCount    = dayData?.exercises.length ?? 0
            const doneCount  = dayData?.exercises.filter(e => completed.has(e.id)).length ?? 0
            const allDone    = exCount > 0 && doneCount === exCount
            const dateObj    = weekDates[i]

            return (
              <button key={d.key}
                onClick={() => { setSelectedDay(d.key); setCompleted(new Set()) }}
                className="relative flex flex-col items-center py-4 gap-2 transition-all"
                style={{
                  background: isSelected ? "var(--accent)" : "transparent",
                  borderRight: i < 6 ? "1px solid var(--border)" : "none",
                }}>
                <span className="text-[10px] font-black tracking-wider"
                  style={{ color: isSelected ? "var(--accent-text)" : "var(--text-muted)" }}>
                  {d.short}
                </span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: isSelected ? "rgba(0,0,0,0.18)" : isToday ? "var(--accent-muted)" : "transparent",
                    border: isToday && !isSelected ? "2px solid var(--accent)" : "2px solid transparent",
                  }}>
                  <span className="text-base font-black leading-none"
                    style={{ color: isSelected ? "var(--accent-text)" : isToday ? "var(--accent)" : "var(--text-secondary)" }}>
                    {dateObj.getDate()}
                  </span>
                </div>
                {isRest
                  ? <Moon size={14} style={{ color: isSelected ? "var(--accent-text)" : "var(--text-muted)", opacity: 0.7 }} />
                  : <Dumbbell size={14} style={{ color: isSelected ? "var(--accent-text)" : "var(--accent)", opacity: isSelected ? 0.9 : 0.55 }} />
                }
                {!isRest && exCount > 0 && (
                  <span className="text-[9px] font-bold"
                    style={{ color: isSelected ? "var(--accent-text)" : "var(--text-muted)", opacity: 0.75 }}>
                    {doneCount}/{exCount}
                  </span>
                )}
                {allDone && (
                  <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full"
                    style={{ background: isSelected ? "var(--accent-text)" : "var(--success)" }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Leyenda */}
        <div className="flex items-center justify-center gap-6 px-5 py-3"
          style={{ borderTop: "1px solid var(--border)" }}>
          {[
            { icon: <Dumbbell size={11} style={{ color: "var(--accent)" }} />, label: "Entreno" },
            { icon: <Moon size={11} style={{ color: "var(--text-muted)" }} />, label: "Descanso" },
            { icon: <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--success)" }} />, label: "Completado" },
          ].map(item => (
            <span key={item.label} className="flex items-center gap-1.5 text-[10px] font-semibold"
              style={{ color: "var(--text-muted)" }}>
              {item.icon} {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          DÍA EN GRANDE + RUTINA
         ══════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedDay}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
          className="space-y-4">

          {/* Encabezado del día */}
          <div className="flex items-end justify-between">
            <div>
              {/* Día en grande */}
              <h2 className="text-6xl font-black uppercase leading-none tracking-tight"
                style={{ color: "var(--text-primary)" }}>
                {selectedDayData?.full}
              </h2>
              {/* Rutina del día */}
              <div className="flex items-center gap-2 mt-2.5">
                {todayRoutine?.isRestDay ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "var(--text-muted)" }}>
                    <Moon size={15} /> Día de Descanso
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full"
                    style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                    <Dumbbell size={14} />
                    {todayRoutine?.label ?? "Sin ejercicios"}
                  </span>
                )}
                {todayKey === selectedDay && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent)", color: "var(--accent-text)" }}>
                    HOY
                  </span>
                )}
              </div>
            </div>

            {/* Dots de progreso */}
            {!todayRoutine?.isRestDay && totalExercises > 0 && (
              <div className="flex flex-col items-end gap-2 pb-1">
                <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                  {completedCount}/{totalExercises}
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalExercises }).map((_, i) => (
                    <motion.div key={i} className="w-2.5 h-2.5 rounded-full"
                      animate={{ background: i < completedCount ? "var(--success)" : "var(--border)" }}
                      transition={{ duration: 0.3 }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          {!todayRoutine?.isRestDay && totalExercises > 0 && (
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "var(--accent)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }} />
            </div>
          )}

          {/* ══════════════════════════════
              LISTA DE EJERCICIOS
             ══════════════════════════════ */}
          {todayRoutine?.isRestDay ? (
            <div className="text-center py-14 rounded-2xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-5xl mb-4">😴</p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Día de Descanso</p>
              <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
                Tu cuerpo se recupera y crece mientras descansas. ¡Aprovéchalo!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayRoutine?.exercises.map((exercise, i) => {
                const isDone = completed.has(exercise.id)
                return (
                  <motion.div key={exercise.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: "var(--surface)",
                      border: `1px solid ${isDone ? "var(--success)" : "var(--border)"}`,
                      opacity: isDone ? 0.65 : 1,
                    }}
                    onClick={() => setViewExercise(exercise)}>

                    <button onClick={e => { e.stopPropagation(); toggleComplete(exercise.id) }}
                      className="flex-shrink-0"
                      style={{ color: isDone ? "var(--success)" : "var(--text-muted)" }}>
                      {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>

                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ background: "var(--background)" }}>
                      {exercise.imageUrl && (
                        <img src={exercise.imageUrl} alt={exercise.name}
                          className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)", textDecoration: isDone ? "line-through" : "none" }}>
                        {exercise.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {exercise.sets} series × {exercise.reps}
                        {exercise.weight ? ` • ${exercise.weight}` : ""}
                      </p>
                    </div>

                    <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ══════════════════════════════
          MODAL DETALLE
         ══════════════════════════════ */}
      <AnimatePresence>
        {viewExercise && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setViewExercise(null)}>
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ background: "var(--surface)" }}
              onClick={e => e.stopPropagation()}>

              {viewExercise.imageUrl && (
                <div className="relative h-52 sm:h-60">
                  <img src={viewExercise.imageUrl} alt={viewExercise.name}
                    className="w-full h-full object-cover" />
                  <button onClick={() => setViewExercise(null)}
                    className="absolute top-3 right-3 p-2 rounded-full"
                    style={{ background: "rgba(0,0,0,0.5)", color: "white" }}>
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                    {viewExercise.muscleGroup}
                  </span>
                  <h3 className="text-xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
                    {viewExercise.name}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                    {viewExercise.description}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { val: viewExercise.sets, label: "Series" },
                    { val: viewExercise.reps, label: "Reps" },
                    { val: `${viewExercise.restSeconds}s`, label: "Descanso" },
                    { val: viewExercise.weight || "—", label: "Peso" },
                  ].map(s => (
                    <div key={s.label} className="text-center p-3 rounded-xl"
                      style={{ background: "var(--background)" }}>
                      <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>{s.val}</p>
                      <p className="text-[10px] uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {viewExercise.tips && viewExercise.tips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Consejos</h4>
                    <ul className="space-y-1.5">
                      {viewExercise.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm"
                          style={{ color: "var(--text-secondary)" }}>
                          <span style={{ color: "var(--accent)" }}>•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {viewExercise.videoUrl && (
                  <a href={viewExercise.videoUrl} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "var(--accent)", color: "var(--accent-text)" }}>
                    <Play size={16} />
                    Ver Video Demostrativo
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
