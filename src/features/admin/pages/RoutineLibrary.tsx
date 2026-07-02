import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, Dumbbell, Calendar, Edit2, Trash2 } from "lucide-react"
import { useToastStore } from "@/components/ui/Toast"
import { getWorkouts, deleteWorkout } from "@/lib/api"
import { AdminHeader } from "../components/AdminHeader"
import { SearchBar } from "../components/SearchBar"
import { LoadingState } from "../components/LoadingState"
import { EmptyState } from "../components/EmptyState"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { useDebounce } from "@/hooks/useDebounce"
import RoutineBuilder from "./RoutineBuilder"

interface WorkoutTemplate {
  id: string
  title: string
  member?: { id: string } | null
  createdAt?: string
}

export default function RoutineLibrary() {
  const addToast = useToastStore((s) => s.addToast)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [editingRoutine, setEditingRoutine] = useState<WorkoutTemplate | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WorkoutTemplate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getWorkouts()
      setTemplates(res.lista || [])
    } catch (e) {
      console.error("Error fetching templates", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isBuilding && !editingRoutine) {
      fetchTemplates()
    }
  }, [isBuilding, editingRoutine, fetchTemplates])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteWorkout(deleteTarget.id)
      addToast("Plantilla eliminada correctamente", "success")
      fetchTemplates()
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : "Error al eliminar", "error")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filteredTemplates = templates.filter(
    (t) =>
      t.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) && !t.member
  )

  if (isBuilding || editingRoutine) {
    return (
      <RoutineBuilder
        editingRoutine={editingRoutine}
        onBack={() => {
          setIsBuilding(false)
          setEditingRoutine(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Plantillas de Rutinas"
        subtitle="Gestiona tus rutinas base para asignar rápidamente"
        icon={Dumbbell}
        action={
          <button
            onClick={() => setIsBuilding(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] shadow-lg shadow-[var(--accent)]/25 transition-all hover:brightness-110"
          >
            <Plus size={16} /> Crear Nueva Plantilla
          </button>
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar plantilla por nombre..."
        className="max-w-md"
      />

      {isLoading ? (
        <LoadingState text="Cargando plantillas..." />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No hay plantillas guardadas"
          description="Crea rutinas predeterminadas (ej. 'Hipertrofia 4 Días') para asignarlas rápidamente a tus clientes."
          action={
            <button
              onClick={() => setIsBuilding(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              Comenzar a crear
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--accent)]"
              onClick={() => setEditingRoutine(template)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setEditingRoutine(template)
                }
              }}
              aria-label={`Editar plantilla ${template.title}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-xl bg-[var(--accent)]/10 p-3 transition-transform group-hover:scale-110">
                  <Dumbbell size={24} className="text-[var(--accent)]" aria-hidden="true" />
                </div>
                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingRoutine(template)
                    }}
                    className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                    aria-label={`Editar ${template.title}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(template)
                    }}
                    className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                    aria-label={`Eliminar ${template.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{template.title}</h3>
              <div className="mt-4 flex items-center gap-4 text-sm text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> Plantilla Base
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar plantilla"
        message={`¿Estás seguro de eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel={isDeleting ? "Eliminando..." : "Eliminar"}
      />
    </div>
  )
}
