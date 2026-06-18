import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { mockExercises } from "@/data/exercises"
import { mockUsers } from "@/data/users"
import type { DayOfWeek, Exercise } from "@/types"
import { Plus, Trash2, Save, Play, Image, GripVertical, Users, Search, X, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useSearchParams, useNavigate } from "react-router-dom"

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "lunes", label: "Lunes" }, { key: "martes", label: "Martes" }, { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" }, { key: "viernes", label: "Viernes" }, { key: "sabado", label: "Sábado" }, { key: "domingo", label: "Domingo" },
]

export default function RoutineBuilder() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const personalizedUserId = searchParams.get("userId")
  const personalizedUser = personalizedUserId ? mockUsers.find(u => u.id === personalizedUserId) : null

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("lunes")
  const [routineName, setRoutineName] = useState(personalizedUser ? `Rutina Personalizada - ${personalizedUser.name}` : "Nueva Rutina de Hipertrofia")
  const [dayExercises, setDayExercises] = useState<Record<DayOfWeek, Exercise[]>>({
    lunes: [mockExercises[0], mockExercises[5]], martes: [mockExercises[2], mockExercises[8]], miercoles: [],
    jueves: [mockExercises[1], mockExercises[6]], viernes: [mockExercises[3], mockExercises[9]], sabado: [], domingo: [],
  })

  // Assign Modal State
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [searchUser, setSearchUser] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  const clients = mockUsers.filter(u => u.role === "client" && u.isActive)
  const filteredClients = clients.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()))

  const currentExercises = dayExercises[selectedDay]

  const addExercise = () => {
    const available = mockExercises.filter((e) => !currentExercises.find((ce) => ce.id === e.id))
    if (available.length > 0) setDayExercises((prev) => ({ ...prev, [selectedDay]: [...prev[selectedDay], available[0]] }))
  }

  const removeExercise = (exerciseId: string) => {
    setDayExercises((prev) => ({ ...prev, [selectedDay]: prev[selectedDay].filter((e) => e.id !== exerciseId) }))
  }

  const handleSaveAndAssign = () => {
    if (selectedUsers.size === 0) return alert("Selecciona al menos un cliente")
    alert(`Rutina "${routineName}" asignada exitosamente a ${selectedUsers.size} cliente(s).`)
    setShowAssignModal(false)
    setSelectedUsers(new Set())
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-4 sm:p-6 rounded-2xl border border-[var(--border)] shadow-sm">
        <div>
          {personalizedUser && (
            <Button variant="ghost" onClick={() => navigate("/admin/usuarios")} className="mb-2 -ml-4 text-text-muted hover:text-accent">
              <ArrowLeft size={16} className="mr-2" /> Volver a Usuarios
            </Button>
          )}
          <input type="text" value={routineName} onChange={(e) => setRoutineName(e.target.value)} className="text-2xl font-black uppercase tracking-tight bg-transparent outline-none w-full max-w-xl transition-colors hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] rounded-lg px-2 -ml-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }} />
          <p className="text-sm mt-1 ml-2 text-text-muted">
            {personalizedUser ? `Personalizando para: ${personalizedUser.name}` : "Constructor de Plantillas"} · {Object.values(dayExercises).reduce((acc, day) => acc + day.length, 0)} ejercicios
          </p>
        </div>
        <div className="flex items-center gap-3">
          {personalizedUser ? (
            <Button onClick={() => { alert(`Rutina personalizada guardada y asignada a ${personalizedUser.name}`); navigate("/admin/usuarios") }} className="gap-2 accent-glow">
              <Check size={16} />
              Guardar y Asignar a {personalizedUser.name.split(" ")[0]}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => alert("Rutina guardada en la biblioteca general.")}>
                Guardar Plantilla
              </Button>
              <Button onClick={() => setShowAssignModal(true)} className="gap-2 accent-glow">
                <Users size={16} />
                Guardar y Asignar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {DAYS.map((d) => (
          <button key={d.key} onClick={() => setSelectedDay(d.key)} className="px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2" style={{ background: selectedDay === d.key ? "var(--accent)" : "var(--surface)", color: selectedDay === d.key ? "var(--accent-text)" : "var(--text-secondary)", border: selectedDay === d.key ? "none" : "1px solid var(--border)", transform: selectedDay === d.key ? "scale(1.05)" : "scale(1)" }}>
            {d.label}
            <span className="flex items-center justify-center w-5 h-5 rounded-md text-[10px]" style={{ background: selectedDay === d.key ? "var(--accent-muted)" : "var(--bg-primary)", color: selectedDay === d.key ? "var(--accent)" : "var(--text-muted)" }}>{dayExercises[d.key].length}</span>
          </button>
        ))}
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        <AnimatePresence>
          {currentExercises.map((exercise, index) => (
            <motion.div key={exercise.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl group relative" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
              <div className="cursor-grab sm:mt-0 mt-2 p-2 hover:bg-[var(--surface-hover)] rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
                <GripVertical size={18} />
              </div>

              {/* Image */}
              <div className="w-full sm:w-24 h-32 sm:h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--background)" }}>
                {exercise.imageUrl ? (
                  <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-muted)" }}><Image size={24} /></div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>{exercise.name}</h4>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                      {exercise.muscleGroup}
                    </span>
                  </div>
                  <button onClick={() => removeExercise(exercise.id)} className="p-2 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10" style={{ color: "var(--danger)" }}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { val: exercise.sets, label: "Series", isAcc: true },
                    { val: exercise.reps, label: "Reps", isAcc: true },
                    { val: `${exercise.restSeconds}s`, label: "Descanso", isAcc: false },
                    ...(exercise.weight ? [{ val: exercise.weight, label: "Peso", isAcc: false }] : [])
                  ].map((s, i) => (
                    <div key={i} className="flex-1 min-w-[70px] text-center p-2 rounded-lg" style={{ background: "var(--background)" }}>
                      <p className="text-base font-black" style={{ color: s.isAcc ? "var(--accent)" : "var(--text-primary)" }}>{s.val}</p>
                      <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add button */}
        <Button variant="outline" onClick={addExercise} className="w-full h-14 border-dashed gap-3 text-text-secondary bg-transparent hover:bg-[var(--surface-hover)] hover:border-accent hover:text-accent border-2">
          <Plus size={18} /> Agregar Ejercicio a {DAYS.find(d => d.key === selectedDay)?.label}
        </Button>

        {currentExercises.length === 0 && (
          <div className="text-center py-16 px-4 rounded-2xl" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
            <p className="text-4xl mb-4">😴</p>
            <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Día de Descanso</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>No hay ejercicios asignados para este día.</p>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "var(--overlay)", backdropFilter: "blur(8px)" }} onClick={() => setShowAssignModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg flex flex-col rounded-3xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
              
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] shrink-0">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Asignar Rutina</h2>
                  <p className="text-xs mt-1" style={{ color: "var(--accent)" }}>{routineName}</p>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="p-2 rounded-full hover:bg-[var(--surface-hover)]" style={{ color: "var(--text-muted)" }}><X size={20} /></button>
              </div>

              <div className="p-4 shrink-0 bg-[var(--background)]">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <Input type="text" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} placeholder="Buscar cliente por nombre..." className="pl-10" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredClients.map(user => {
                  const isSelected = selectedUsers.has(user.id)
                  return (
                    <div key={user.id} onClick={() => {
                      const next = new Set(selectedUsers)
                      isSelected ? next.delete(user.id) : next.add(user.id)
                      setSelectedUsers(next)
                    }} className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border" style={{ background: isSelected ? "var(--accent-muted)" : "var(--surface)", borderColor: isSelected ? "var(--accent)" : "var(--border)" }}>
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors" style={{ border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`, background: isSelected ? "var(--accent)" : "transparent" }}>
                        {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "var(--background)", color: "var(--text-primary)" }}>
                        {user.name.split(" ").map(n=>n[0]).join("").substring(0,2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                        <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  )
                })}
                {filteredClients.length === 0 && (
                  <p className="text-center text-sm py-8" style={{ color: "var(--text-muted)" }}>No se encontraron clientes.</p>
                )}
              </div>

              <div className="p-6 border-t border-[var(--border)] bg-[var(--surface)] shrink-0 flex gap-3">
                <Button variant="outline" onClick={() => setShowAssignModal(false)} className="flex-1 text-sm font-bold border-none bg-background text-text-secondary">Cancelar</Button>
                <Button onClick={handleSaveAndAssign} className="flex-1">
                  Asignar a {selectedUsers.size} cliente(s)
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
