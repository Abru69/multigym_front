import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import RoutineLibrary from "./RoutineLibrary"
import { getExercises, createExercise } from "@/lib/api"
import { Search, Plus, Dumbbell, Trash2, Edit2, X, Activity, Flame, HeartPulse } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import "./styles/Exercises.css"

export const MUSCLE_GROUPS = [
  { name: "Pecho", description: "Ejercicios enfocados en pectorales mayores y menores.", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60" },
  { name: "Espalda", description: "Desarrollo de dorsales, trapecios y lumbares.", imageUrl: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=500&auto=format&fit=crop&q=60" },
  { name: "Piernas", description: "Cuádriceps, isquiotibiales, glúteos y gemelos.", imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500&auto=format&fit=crop&q=60" },
  { name: "Brazos", description: "Bíceps, tríceps y antebrazos.", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60" },
  { name: "Hombros", description: "Deltoides frontales, laterales y posteriores.", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60" },
  { name: "Core", description: "Abdomen, oblicuos y zona media.", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60" },
  { name: "Cardio", description: "Ejercicios cardiovasculares y resistencia.", imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop&q=60" },
  { name: "Cuerpo Completo", description: "Movimientos compuestos full-body.", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=60" }
]

export default function Exercises() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<"exercises" | "routines">(tabParam === "routines" ? "routines" : "exercises")

  const handleTabChange = (tab: "exercises" | "routines") => {
    setActiveTab(tab)
    setSearchParams(tab === "exercises" ? {} : { tab })
  }

  const [exercisesList, setExercisesList] = useState<any[]>([])
  
  // Custom groups state
  const [customGroups, setCustomGroups] = useState<any[]>(() => {
    try { 
      const stored = JSON.parse(localStorage.getItem("customMuscleGroups") || "[]") 
      return stored.map((g: any) => typeof g === 'string' ? { name: g, description: "", imageUrl: "" } : g)
    } catch { return [] }
  })
  
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formName, setFormName] = useState("")

  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [newGroupForm, setNewGroupForm] = useState({ name: "", description: "", imageUrl: "" })

  const loadExercises = () => {
    getExercises().then(response => {
      const apiExercises = response.lista || []
      setExercisesList(apiExercises)
    }).catch(e => console.error(e))
  }

  useEffect(() => {
    loadExercises()
  }, [])

  const handleSave = async () => {
    if (!formName || !selectedGroup) return alert("Llena los campos obligatorios")
    setIsSaving(true)
    try {
      await createExercise({ name: formName, muscleGroup: selectedGroup })
      loadExercises()
      setIsCreating(false)
      setFormName("")
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const closeModal = () => {
    setSelectedGroup(null)
    setIsCreating(false)
    setSearch("")
    setFormName("")
  }

  const handleSaveNewGroup = () => {
    if (!newGroupForm.name.trim()) return
    const newGroup = { name: newGroupForm.name.trim(), description: newGroupForm.description.trim(), imageUrl: newGroupForm.imageUrl.trim() }
    const updatedGroups = [...customGroups, newGroup]
    setCustomGroups(updatedGroups)
    localStorage.setItem("customMuscleGroups", JSON.stringify(updatedGroups))
    setIsCreatingGroup(false)
    setNewGroupForm({ name: "", description: "", imageUrl: "" })
  }

  const currentGroupExercises = exercisesList.filter(e => e.muscleGroup === selectedGroup)
  const filteredExercises = currentGroupExercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))

  const ALL_GROUPS = [
    ...MUSCLE_GROUPS,
    ...customGroups
  ]

  return (
    <div className="admin-page-container">
      {/* View Tabs */}
      <div className="flex bg-[var(--surface)] border border-[var(--border)] p-1 rounded-2xl w-full sm:w-fit shadow-sm shrink-0">
        <button
          onClick={() => handleTabChange("exercises")}
          className={`flex-1 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "exercises" ? "bg-[var(--accent)] text-[var(--accent-text)] shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"}`}
        >
          Grupos Musculares
        </button>
        <button
          onClick={() => handleTabChange("routines")}
          className={`flex-1 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "routines" ? "bg-[var(--accent)] text-[var(--accent-text)] shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"}`}
        >
          Plantillas de Rutinas
        </button>
      </div>

      {activeTab === "exercises" ? (
        <>
          <div className="admin-page-header">
            <div>
              <h1 className="admin-page-title">
                Grupos Musculares
              </h1>
          <p className="admin-page-subtitle">
            {exercisesList.length} ejercicios registrados en la biblioteca
          </p>
        </div>
        <Button onClick={() => setIsCreatingGroup(true)} className="accent-glow whitespace-nowrap gap-2">
          <Plus size={18} /> Agregar Grupo
        </Button>
      </div>

      <div className="exercises-grid">
        {ALL_GROUPS.map((group, idx) => {
          const count = exercisesList.filter(e => e.muscleGroup === group.name).length
          return (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedGroup(group.name)}
              className="muscle-card"
            >
              {group.imageUrl ? (
                <div className="muscle-card-img-container">
                  <img src={group.imageUrl} alt={group.name} className="muscle-card-img" />
                  <div className="muscle-card-gradient"></div>
                </div>
              ) : (
                 <div className="muscle-card-fallback"></div>
              )}
              
              <div className="muscle-card-content">
                <h3 className="muscle-card-title">{group.name}</h3>
                <p className="muscle-card-desc">{group.description || "Explora los ejercicios de este grupo muscular."}</p>
                <div className="inline-flex self-start">
                  <span className="muscle-card-badge">
                    {count} {count === 1 ? "ejercicio" : "ejercicios"}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="admin-modal-overlay" onClick={closeModal}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="admin-modal-content" onClick={e => e.stopPropagation()}>
              
              <div className="admin-modal-header flex-col items-start sm:flex-row sm:items-center">
                <div className="flex justify-between items-center w-full mb-4 sm:mb-0">
                  <div>
                    <h2 className="admin-modal-title">
                      {isCreating ? "Nuevo Ejercicio" : `Ejercicios: ${selectedGroup}`}
                    </h2>
                    {!isCreating && <p className="admin-page-subtitle">{currentGroupExercises.length} registrados</p>}
                  </div>
                  <button onClick={closeModal} className="admin-close-btn"><X size={20} /></button>
                </div>

                {!isCreating && (
                  <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="relative flex-1 sm:w-64">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en este grupo..." className="pl-10" />
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="whitespace-nowrap px-4 accent-glow gap-2"><Plus size={16}/> Nuevo</Button>
                  </div>
                )}
              </div>

              {isCreating ? (
                <div className="admin-modal-body">
                  <div className="admin-form-group">
                    <Label className="admin-form-label">Nombre del Ejercicio</Label>
                    <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ej. Press de Banca Inclinado" autoFocus />
                  </div>
                  <div className="admin-form-group">
                    <Label className="admin-form-label">Grupo Muscular</Label>
                    <Input value={selectedGroup} disabled className="opacity-50 cursor-not-allowed" />
                  </div>
                  <div className="admin-form-actions">
                    <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1 border-none bg-[var(--surface)] text-text-secondary hover:bg-[var(--surface-hover)]">Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="flex-1 accent-glow">{isSaving ? "Guardando..." : "Guardar Ejercicio"}</Button>
                  </div>
                </div>
              ) : (
                <div className="admin-modal-body space-y-2">
                  {filteredExercises.map(exercise => (
                    <div key={exercise.id} className="admin-list-item">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--background)] text-text-muted border border-[var(--border)] shrink-0">
                        <Dumbbell size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate text-text-primary">{exercise.name}</p>
                      </div>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => alert("Edición no soportada aún.")} className="text-text-muted hover:text-accent h-8 w-8">
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => alert("Eliminación no soportada aún.")} className="text-text-muted hover:text-danger h-8 w-8">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredExercises.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-text-muted text-sm">No se encontraron ejercicios en este grupo.</p>
                      {!search && (
                        <Button variant="outline" onClick={() => setIsCreating(true)} className="mt-4 gap-2"><Plus size={16}/> Crea el primero</Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Group Modal */}
      <AnimatePresence>
        {isCreatingGroup && (
          <div className="admin-modal-overlay" onClick={() => setIsCreatingGroup(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="admin-modal-content !max-w-md" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">Nuevo Grupo Muscular</h2>
                <button onClick={() => setIsCreatingGroup(false)} className="admin-close-btn"><X size={20} /></button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <Label className="admin-form-label">Nombre del Grupo</Label>
                  <Input value={newGroupForm.name} onChange={e => setNewGroupForm({...newGroupForm, name: e.target.value})} placeholder="Ej. Antebrazos" autoFocus />
                </div>
                <div className="admin-form-group">
                  <Label className="admin-form-label">Descripción <span className="text-xs font-normal text-text-muted">(Opcional)</span></Label>
                  <Input value={newGroupForm.description} onChange={e => setNewGroupForm({...newGroupForm, description: e.target.value})} placeholder="Ej. Ejercicios para fortalecer el agarre." />
                </div>
                <div className="admin-form-group">
                  <Label className="admin-form-label">URL de Imagen <span className="text-xs font-normal text-text-muted">(Opcional)</span></Label>
                  <Input value={newGroupForm.imageUrl} onChange={e => setNewGroupForm({...newGroupForm, imageUrl: e.target.value})} placeholder="Ej. https://images.unsplash.com/..." />
                </div>
                <div className="admin-form-actions">
                  <Button variant="outline" onClick={() => setIsCreatingGroup(false)} className="flex-1 border-none bg-[var(--background)]">Cancelar</Button>
                  <Button onClick={handleSaveNewGroup} className="flex-1 accent-glow">Guardar</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      ) : (
        <RoutineLibrary />
      )}
    </div>
  )
}
