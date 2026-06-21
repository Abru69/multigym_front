import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, Dumbbell, Calendar, Search, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { getWorkouts, deleteWorkout } from "@/lib/api"
import RoutineBuilder from "./RoutineBuilder"

export default function RoutineLibrary() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get("userId")
  
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingRoutine, setEditingRoutine] = useState<any>(null)
  const [isBuilding, setIsBuilding] = useState(!!userId) // If there's a userId, open builder immediately

  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      const res = await getWorkouts()
      setTemplates(res.lista || [])
    } catch (e) {
      console.error("Error fetching templates", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isBuilding && !editingRoutine) {
      fetchTemplates()
    }
  }, [isBuilding, editingRoutine])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta plantilla?")) return
    try {
      await deleteWorkout(id)
      fetchTemplates()
    } catch (e: any) {
      alert("Error eliminando: " + e.message)
    }
  }

  const handleEdit = (e: React.MouseEvent, template: any) => {
    e.stopPropagation()
    setEditingRoutine(template)
  }

  const filteredTemplates = templates.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()) && !t.member) // Solo mostrar si no es de cliente

  if (isBuilding || editingRoutine) {
    return <RoutineBuilder editingRoutine={editingRoutine} onBack={() => { setIsBuilding(false); setEditingRoutine(null) }} />
  }

  return (
    <div className="w-full">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Plantillas de Rutinas</h1>
          <p className="admin-page-subtitle">Gestiona tus rutinas base para asignar rápidamente</p>
        </div>
        <Button onClick={() => setIsBuilding(true)} className="accent-glow gap-2">
          <Plus size={18} /> Crear Nueva Plantilla
        </Button>
      </div>

      <div className="flex gap-2 mt-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Buscar plantilla por nombre..." 
            className="pl-10" 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-accent border-r-accent border-b-border border-l-border animate-spin" /></div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]">
          <Dumbbell size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-bold text-text-primary mb-2">No hay plantillas guardadas</h3>
          <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">Crea rutinas predeterminadas (ej. "Hipertrofia 4 Días") para asignarlas rápidamente a tus clientes.</p>
          <Button onClick={() => setIsBuilding(true)} variant="outline">Comenzar a crear</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template, idx) => (
            <motion.div 
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all cursor-pointer group"
              onClick={(e) => handleEdit(e, template)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[var(--background)] text-accent group-hover:scale-110 transition-transform">
                  <Dumbbell size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEdit(e, template)} className="p-2 text-text-muted hover:text-accent hover:bg-[var(--surface-hover)] rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => handleDelete(e, template.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg text-text-primary mb-1">{template.title}</h3>
              <div className="flex items-center gap-4 mt-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><Calendar size={14}/> Plantilla Base</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
