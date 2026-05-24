import { useState } from "react"
import { motion } from "framer-motion"
import { mockExercises } from "@/data/exercises"
import type { DayOfWeek, Exercise } from "@/types"
import { Plus, Trash2, Save, Play, Image, GripVertical } from "lucide-react"

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
]

export default function RoutineBuilder() {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("lunes")
  const [routineName, setRoutineName] = useState("Nueva Rutina")
  const [dayExercises, setDayExercises] = useState<Record<DayOfWeek, Exercise[]>>({
    lunes: [mockExercises[0], mockExercises[5]],
    martes: [mockExercises[2], mockExercises[8]],
    miercoles: [],
    jueves: [mockExercises[1], mockExercises[6]],
    viernes: [mockExercises[3], mockExercises[9]],
    sabado: [],
    domingo: [],
  })

  const currentExercises = dayExercises[selectedDay]

  const addExercise = () => {
    const available = mockExercises.filter((e) => !currentExercises.find((ce) => ce.id === e.id))
    if (available.length > 0) {
      setDayExercises((prev) => ({
        ...prev,
        [selectedDay]: [...prev[selectedDay], available[0]],
      }))
    }
  }

  const removeExercise = (exerciseId: string) => {
    setDayExercises((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((e) => e.id !== exerciseId),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Constructor de Rutinas</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Diseña y asigna rutinas de entrenamiento</p>
        </div>
        <button 
          onClick={() => {
            const hasExercises = Object.values(dayExercises).some(day => day.length > 0)
            if (!hasExercises) {
              alert("No puedes guardar una rutina vacía. Agrega al menos un ejercicio.")
            } else {
              alert(`¡Rutina "${routineName}" guardada y asignada exitosamente!`)
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: "var(--accent)", color: "var(--accent-text)" }}>
          <Save size={16} />
          Guardar Rutina
        </button>
      </div>

      {/* Routine name */}
      <input
        type="text"
        value={routineName}
        onChange={(e) => setRoutineName(e.target.value)}
        className="text-xl font-bold bg-transparent outline-none w-full max-w-md"
        style={{ color: "var(--text-primary)", borderBottom: "2px solid var(--border)" }}
      />

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {DAYS.map((d) => (
          <button
            key={d.key}
            onClick={() => setSelectedDay(d.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
            style={{
              background: selectedDay === d.key ? "var(--accent)" : "var(--surface)",
              color: selectedDay === d.key ? "var(--accent-text)" : "var(--text-secondary)",
              border: selectedDay === d.key ? "none" : "1px solid var(--border)",
            }}
          >
            {d.label}
            <span className="ml-1.5 text-xs opacity-70">({dayExercises[d.key].length})</span>
          </button>
        ))}
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {currentExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 p-4 rounded-2xl group"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="cursor-grab mt-2" style={{ color: "var(--text-muted)" }}>
              <GripVertical size={16} />
            </div>

            {/* Image */}
            <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "var(--background)" }}>
              {exercise.imageUrl ? (
                <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}>
                  <Image size={20} />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{exercise.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                    {exercise.muscleGroup}
                  </span>
                </div>
                <button onClick={() => removeExercise(exercise.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--danger)" }}>
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{exercise.sets}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Series</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{exercise.reps}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Reps</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{exercise.restSeconds}s</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Descanso</p>
                </div>
                {exercise.weight && (
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>{exercise.weight}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Peso</p>
                  </div>
                )}
              </div>

              {exercise.videoUrl && (
                <a href={exercise.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-medium" style={{ color: "var(--accent)" }}>
                  <Play size={12} /> Ver video
                </a>
              )}
            </div>
          </motion.div>
        ))}

        {/* Add button */}
        <button
          onClick={addExercise}
          className="w-full p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all"
          style={{ border: "2px dashed var(--border)", color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)"
            e.currentTarget.style.color = "var(--accent)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)"
            e.currentTarget.style.color = "var(--text-muted)"
          }}
        >
          <Plus size={18} />
          Agregar Ejercicio
        </button>

        {currentExercises.length === 0 && (
          <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm">Día de descanso — sin ejercicios asignados</p>
          </div>
        )}
      </div>
    </div>
  )
}
