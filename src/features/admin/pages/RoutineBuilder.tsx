import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { DayOfWeek, Exercise } from "@/types"
import { Plus, Trash2, Save, Play, Image, GripVertical, Users, Search, X, Check, ArrowLeft, Dumbbell, Edit2, Activity } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import "./styles/RoutineBuilder.css"
import { useSearchParams, useNavigate } from "react-router-dom"
import { getExercises, createExercise, createWorkout, fetchApi } from "@/lib/api"
import type { ResponseDTO } from "@/lib/api"
import { MUSCLE_GROUPS } from "./Exercises"

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "lunes", label: "Lunes" }, { key: "martes", label: "Martes" }, { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" }, { key: "viernes", label: "Viernes" }, { key: "sabado", label: "Sábado" }, { key: "domingo", label: "Domingo" },
]

export default function RoutineBuilder({ onBack, editingRoutine }: { onBack?: () => void, editingRoutine?: any }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [dbExercises, setDbExercises] = useState<any[]>([])
  const [dbUsers, setDbUsers] = useState<any[]>([])
  
  const loadExercises = () => {
    // Load real exercises
    getExercises().then(res => {
      const apiExercises = res.lista || []
      // Map them to have fake sets/reps since backend doesn't provide them yet
      const mapped = apiExercises.map(e => ({
        ...e,
        sets: 4,
        reps: "10-12",
        restSeconds: 60,
        imageUrl: ""
      }))
      setDbExercises(mapped)
    }).catch(e => console.error(e))
  }

  useEffect(() => {
    loadExercises()

    // Load real users
    fetchApi<ResponseDTO<any>>("/api/tenant/user/getAll").then(res => {
      setDbUsers(res.lista || [])
    }).catch(e => console.error(e))
  }, [])

  const personalizedUserId = searchParams.get("userId")
  const personalizedUser = personalizedUserId ? dbUsers.find(u => u.id === personalizedUserId) : null

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("lunes")
  const [routineName, setRoutineName] = useState(editingRoutine ? editingRoutine.title : "Nueva Rutina de Hipertrofia")
  
  // Use useEffect to update routineName once personalizedUser is loaded
  useEffect(() => {
    if (personalizedUser && !editingRoutine) {
      setRoutineName(`Rutina Personalizada - ${personalizedUser.name || personalizedUser.email}`)
    }
  }, [personalizedUser, editingRoutine])

  const [dayExercises, setDayExercises] = useState<Record<DayOfWeek, any[]>>(() => {
    const initialDays: Record<DayOfWeek, any[]> = {
      lunes: [], martes: [], miercoles: [],
      jueves: [], viernes: [], sabado: [], domingo: [],
    }
    if (editingRoutine && editingRoutine.exercises) {
      editingRoutine.exercises.forEach((we: any) => {
        const day = we.dayOfWeek?.toLowerCase() as DayOfWeek;
        if (day && initialDays[day]) {
          initialDays[day].push({
            ...we.exercise,
            uniqueId: Math.random().toString(36).substring(2, 9),
            sets: we.sets,
            reps: we.reps,
            restSeconds: we.restTimeSeconds
          })
        }
      })
    }
    return initialDays
  })

  // Exercise Modal State
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState("")
  const [selectedGroupForModal, setSelectedGroupForModal] = useState<string | null>(null)

  const customGroups = (() => {
    try { 
      const stored = JSON.parse(localStorage.getItem("customMuscleGroups") || "[]")
      return stored.map((g: any) => typeof g === 'string' ? g : g.name)
    } catch { return [] }
  })()
  const ALL_GROUPS_LIST = ["Pecho", "Espalda", "Piernas", "Brazos", "Hombros", "Core", "Cardio", "Cuerpo Completo", ...customGroups]

  // New Exercise State
  const [isCreatingExercise, setIsCreatingExercise] = useState(false)
  const [newExerciseForm, setNewExerciseForm] = useState({ name: "", muscleGroup: "" })
  const [isSavingExercise, setIsSavingExercise] = useState(false)

  // Assign Modal State
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [searchUser, setSearchUser] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  const clients = dbUsers
  const filteredClients = clients.filter(u => (u.name || u.email || "").toLowerCase().includes(searchUser.toLowerCase()))

  const currentExercises = dayExercises[selectedDay]

  const openExerciseModal = () => {
    setIsCreatingExercise(false)
    setSelectedGroupForModal(null)
    setExerciseSearch("")
    setShowExerciseModal(true)
  }

  const handleSaveNewExercise = async () => {
    if (!newExerciseForm.name || !newExerciseForm.muscleGroup) return alert("Llena los campos obligatorios")
    setIsSavingExercise(true)
    try {
      await createExercise({ name: newExerciseForm.name, muscleGroup: newExerciseForm.muscleGroup })
      loadExercises()
      setNewExerciseForm({ name: "", muscleGroup: "" })
      setIsCreatingExercise(false)
      setExerciseFilter(newExerciseForm.muscleGroup)
    } catch (e: any) {
      alert("Error creando ejercicio: " + e.message)
    } finally {
      setIsSavingExercise(false)
    }
  }

  const handleAddExercise = (exercise: any) => {
    const exerciseCopy = { 
      ...exercise, 
      uniqueId: Math.random().toString(36).substring(2, 9), 
      sets: 4, 
      reps: "10-12", 
      restSeconds: 60 
    }
    setDayExercises((prev) => ({ ...prev, [selectedDay]: [...prev[selectedDay], exerciseCopy] }))
    setShowExerciseModal(false)
  }

  const removeExercise = (uniqueId: string) => {
    setDayExercises((prev) => ({ ...prev, [selectedDay]: prev[selectedDay].filter((e) => e.uniqueId !== uniqueId) }))
  }

  const updateExerciseDetail = (uniqueId: string, field: string, value: any) => {
    setDayExercises((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map((e) => e.uniqueId === uniqueId ? { ...e, [field]: value } : e)
    }))
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSaveAndAssign = async () => {
    if (selectedUsers.size === 0 && !personalizedUser) return alert("Selecciona al menos un cliente")
    if (!routineName) return alert("Ponle nombre a la rutina")
    
    setIsSaving(true)
    try {
      const exercisesPayload = Object.entries(dayExercises).flatMap(([dayOfWeek, exercises]) => 
        exercises.map((ex, index) => ({
          exercise: { id: ex.id },
          dayOfWeek: dayOfWeek,
          sets: parseInt(ex.sets as any) || 4,
          reps: ex.reps || "12",
          restSeconds: 60,
          orderIndex: index
        }))
      )

      const payload: any = {
        title: routineName,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        exercises: exercisesPayload
      }
      
      if (personalizedUser) {
        payload.member = { id: personalizedUser.id }
        await createWorkout(payload)
      } else {
        for (const userId of Array.from(selectedUsers)) {
          payload.member = { id: userId }
          await createWorkout(payload)
        }
      }
      
      alert(`Rutina "${routineName}" asignada exitosamente a ${personalizedUser ? 1 : selectedUsers.size} cliente(s).`)
      setShowAssignModal(false)
      setSelectedUsers(new Set())
      if (personalizedUser) navigate("/admin/usuarios")
    } catch (e: any) {
      alert("Error guardando rutina: " + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTemplate = async () => {
    setIsSaving(true)
    try {
      const exercisesPayload = Object.entries(dayExercises).flatMap(([dayOfWeek, exercises]) => 
        exercises.map((ex, index) => ({
          exercise: { id: ex.id },
          dayOfWeek: dayOfWeek,
          sets: parseInt(ex.sets as any) || 4,
          reps: ex.reps || "12",
          restSeconds: 60,
          orderIndex: index
        }))
      )

      const payload = {
        title: routineName,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        exercises: exercisesPayload
      }
      await createWorkout(payload)
      alert(`Plantilla "${routineName}" guardada en la biblioteca general exitosamente.`)
    } catch (e: any) {
      alert("Error guardando plantilla: " + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="admin-page-header flex-col md:flex-row items-start md:items-end gap-6 !pb-8 border-b border-[var(--border)]">
        <div className="w-full flex-1">
          <div className="flex items-center gap-3 mb-4">
            {personalizedUser ? (
              <Button variant="outline" onClick={() => navigate("/admin/usuarios")} className="h-9 px-4 rounded-xl border-[var(--border)] text-text-primary hover:bg-[var(--surface-hover)] shadow-sm">
                <ArrowLeft size={16} className="mr-2" /> Volver a Usuarios
              </Button>
            ) : onBack && (
              <Button variant="outline" onClick={onBack} className="h-9 px-4 rounded-xl border-[var(--border)] text-text-primary hover:bg-[var(--surface-hover)] shadow-sm">
                <ArrowLeft size={16} className="mr-2" /> Volver a Plantillas
              </Button>
            )}
            <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-[var(--accent-muted)] text-accent border border-[var(--accent)]/20">
              {personalizedUser ? "MODO ASIGNACIÓN" : "MODO PLANTILLA"}
            </span>
          </div>
          
          <div className="group relative">
            <input 
              type="text" 
              value={routineName} 
              onChange={(e) => setRoutineName(e.target.value)} 
              className="w-full text-3xl sm:text-4xl font-black bg-transparent border-b-2 border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] outline-none text-text-primary placeholder:text-text-muted/30 pb-2 transition-colors duration-200"
              placeholder="Escribe el nombre de la rutina aquí..."
            />
            <Edit2 size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          
          <p className="text-sm text-text-muted mt-3 font-medium flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5"><Activity size={16} /> {Object.values(dayExercises).reduce((acc, day) => acc + day.length, 0)} ejercicios añadidos</span>
            {personalizedUser && (
              <>
                <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                <span className="flex items-center gap-1.5"><Users size={16} /> Personalizando para: <strong className="text-text-primary">{personalizedUser.name}</strong></span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          {personalizedUser ? (
            <Button onClick={handleSaveAndAssign} disabled={isSaving} className="gap-2 accent-glow">
              <Check size={16} />
              Guardar y Asignar a {personalizedUser.name?.split(" ")[0] || personalizedUser.email}
            </Button>
          ) : (
            <>
              <Button variant="outline" disabled={isSaving} onClick={handleSaveTemplate}>
                {isSaving ? "Guardando..." : "Guardar Plantilla"}
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
      <div className="day-tabs-container">
        {DAYS.map((d) => (
          <button key={d.key} onClick={() => setSelectedDay(d.key)} className={`day-tab ${selectedDay === d.key ? 'active' : ''}`}>
            {d.label}
            <span className="day-tab-badge">{dayExercises[d.key].length}</span>
          </button>
        ))}
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        <AnimatePresence>
          {currentExercises.map((exercise, index) => (
            <motion.div key={exercise.uniqueId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }} className="routine-exercise-card">
              <div className="routine-drag-handle">
                <GripVertical size={18} />
              </div>

              {/* Image */}
              <div className="w-full sm:w-24 h-32 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--background)]">
                {exercise.imageUrl ? (
                  <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted"><Image size={24} /></div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-text-primary">{exercise.name}</h4>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-muted)] text-accent">
                      {exercise.muscleGroup || "General"}
                    </span>
                  </div>
                  <button onClick={() => removeExercise(exercise.uniqueId)} className="p-2 rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 text-danger">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="exercise-prop-box">
                    <p className="exercise-prop-label">Series</p>
                    <input type="number" min="1" value={exercise.sets} onChange={(e) => updateExerciseDetail(exercise.uniqueId, 'sets', e.target.value)} className="exercise-prop-input" />
                  </div>
                  <div className="exercise-prop-box">
                    <p className="exercise-prop-label">Reps</p>
                    <input type="text" value={exercise.reps} onChange={(e) => updateExerciseDetail(exercise.uniqueId, 'reps', e.target.value)} className="exercise-prop-input" />
                  </div>
                  <div className="exercise-prop-box">
                    <p className="exercise-prop-label">Descanso (s)</p>
                    <input type="number" min="0" step="15" value={exercise.restSeconds} onChange={(e) => updateExerciseDetail(exercise.uniqueId, 'restSeconds', e.target.value)} className="exercise-prop-input neutral" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add button */}
        <Button variant="outline" onClick={openExerciseModal} className="w-full h-14 border-dashed gap-3 text-text-secondary bg-transparent hover:bg-[var(--surface-hover)] hover:border-[var(--accent)] hover:text-accent border-2">
          <Plus size={18} /> Agregar Ejercicio a {DAYS.find(d => d.key === selectedDay)?.label}
        </Button>

        {currentExercises.length === 0 && (
          <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]/10 transition-colors cursor-pointer" onClick={openExerciseModal}>
            <div className="w-16 h-16 rounded-full bg-[var(--surface-hover)] flex items-center justify-center mx-auto mb-4 text-text-muted">
              <Plus size={24} />
            </div>
            <p className="font-bold text-lg text-text-primary mb-2">Añadir ejercicios al {DAYS.find(d => d.key === selectedDay)?.label}</p>
            <p className="text-sm text-text-muted max-w-sm mx-auto">Comienza agregando ejercicios a este día de entrenamiento para estructurar la rutina.</p>
          </div>
        )}
      </div>

      {/* Exercise Selection Modal */}
      <AnimatePresence>
        {showExerciseModal && (
          <div className="admin-modal-overlay" onClick={() => setShowExerciseModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header flex-col items-start gap-4">
                <div className="flex items-center justify-between w-full">
                  <h2 className="admin-modal-title">
                    {isCreatingExercise 
                      ? "Nuevo Ejercicio" 
                      : selectedGroupForModal 
                        ? `Ejercicios: ${selectedGroupForModal.toUpperCase()}`
                        : "Biblioteca de Ejercicios"}
                  </h2>
                  <button onClick={() => setShowExerciseModal(false)} className="admin-close-btn"><X size={20} /></button>
                </div>
                {!isCreatingExercise && (
                  <div className="w-full">
                    <div className="flex gap-2 relative mt-2">
                      {selectedGroupForModal && (
                        <Button variant="ghost" onClick={() => setSelectedGroupForModal(null)} className="px-3 shrink-0 border border-[var(--border)] text-text-muted hover:text-text-primary hover:bg-[var(--surface-hover)]">
                          <ArrowLeft size={16} />
                        </Button>
                      )}
                      <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <Input 
                          type="text" 
                          value={exerciseSearch} 
                          onChange={(e) => setExerciseSearch(e.target.value)} 
                          placeholder={selectedGroupForModal ? `Buscar en este grupo...` : "Buscar cualquier ejercicio..."} 
                          className="pl-10" 
                        />
                      </div>
                      <Button onClick={() => setIsCreatingExercise(true)} className="whitespace-nowrap px-4 accent-glow gap-2"><Plus size={16}/> Nuevo</Button>
                    </div>
                  </div>
                )}
              </div>

              {isCreatingExercise ? (
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <Label className="admin-form-label">Nombre del Ejercicio</Label>
                    <Input value={newExerciseForm.name} onChange={e => setNewExerciseForm({...newExerciseForm, name: e.target.value})} placeholder="Ej. Press de Banca" />
                  </div>
                  <div className="admin-form-group">
                    <Label className="admin-form-label">Grupo Muscular</Label>
                    <select 
                      value={newExerciseForm.muscleGroup} 
                      onChange={e => setNewExerciseForm({...newExerciseForm, muscleGroup: e.target.value})}
                      className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Selecciona un grupo muscular...</option>
                      {ALL_GROUPS_LIST.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-actions">
                    <Button variant="outline" onClick={() => setIsCreatingExercise(false)} className="flex-1 text-sm font-bold border-none bg-[var(--surface)] text-text-secondary hover:bg-[var(--surface-hover)]">Cancelar</Button>
                    <Button onClick={handleSaveNewExercise} disabled={isSavingExercise} className="flex-1 accent-glow">{isSavingExercise ? "Guardando..." : "Crear Ejercicio"}</Button>
                  </div>
                </div>
              ) : selectedGroupForModal === null && !exerciseSearch ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 bg-[var(--background)]">
                  {ALL_GROUPS_LIST.map(groupName => {
                    const groupInfo = MUSCLE_GROUPS.find(g => g.name === groupName) || { name: groupName, description: "", imageUrl: "" }
                    return (
                      <div key={groupName} onClick={() => setSelectedGroupForModal(groupName)} className="muscle-card !h-32">
                        <div className="muscle-card-img">
                          {groupInfo.imageUrl ? (
                            <img src={groupInfo.imageUrl} alt={groupName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[var(--surface-hover)] flex items-center justify-center"><Dumbbell className="text-text-muted" size={32}/></div>
                          )}
                        </div>
                        <div className="muscle-card-gradient" />
                        <div className="absolute inset-x-0 bottom-0 p-3 z-10 flex items-end">
                          <h3 className="font-bold text-white text-sm truncate">{groupName}</h3>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[var(--background)] content-start">
                  {dbExercises
                    .filter(e => (!selectedGroupForModal || e.muscleGroup === selectedGroupForModal))
                    .filter(e => e.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
                    .map(exercise => (
                      <div key={exercise.id} onClick={() => handleAddExercise(exercise)} className="exercise-grid-item">
                        <div className="w-12 h-12 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 text-text-muted overflow-hidden">
                          {exercise.imageUrl ? (
                            <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover" />
                          ) : (
                            <Dumbbell size={20} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm truncate text-text-primary">{exercise.name}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--surface)] text-accent">
                            {exercise.muscleGroup || "General"}
                          </span>
                        </div>
                        <Plus size={18} className="shrink-0 text-text-muted" />
                      </div>
                    ))}
                  {dbExercises.length > 0 && dbExercises.filter(e => (!selectedGroupForModal || e.muscleGroup === selectedGroupForModal)).filter(e => e.name.toLowerCase().includes(exerciseSearch.toLowerCase())).length === 0 && (
                    <p className="col-span-1 sm:col-span-2 text-center text-sm py-8 text-text-muted">No se encontraron ejercicios con ese filtro.</p>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                        {(user.name || user.email).split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>{user.name || user.email}</p>
                        {user.name && <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>}
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
                <Button onClick={handleSaveAndAssign} disabled={isSaving} className="flex-1">
                  {isSaving ? "Guardando..." : `Asignar a ${selectedUsers.size} cliente(s)`}
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
