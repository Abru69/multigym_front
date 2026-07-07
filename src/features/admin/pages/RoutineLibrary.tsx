import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Dumbbell, Calendar, Trash2, Eye } from 'lucide-react'
import { useToastStore } from '@/components/ui/Toast'
import { getWorkouts, deleteWorkout } from '@/lib/api'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useDebounce } from '@/hooks/useDebounce'
import RoutineBuilder from './RoutineBuilder'

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
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [editingRoutine, setEditingRoutine] = useState<WorkoutTemplate | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WorkoutTemplate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getWorkouts()
      setTemplates(res.dto?.data || [])
    } catch (e) {
      console.error('Error fetching templates', e)
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
      addToast('Plantilla eliminada correctamente', 'success')
      fetchTemplates()
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Error al eliminar', 'error')
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const filteredTemplates = templates.filter(
    (t) => t.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) && !t.member
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
    <div className="min-h-screen bg-[var(--surface)]/50 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Plantillas de Rutinas
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Gestiona tus rutinas base para asignar rapidamente
          </p>
        </div>
        <button
          onClick={() => setIsBuilding(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] shadow-sm transition-all hover:opacity-90 active:scale-[0.97]"
        >
          <Plus size={16} /> Crear Plantilla
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar plantilla por nombre..."
        />
      </div>

      {isLoading ? (
        <LoadingState text="Cargando plantillas..." />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No hay plantillas guardadas"
          description="Crea rutinas predeterminadas (ej. 'Hipertrofia 4 Dias') para asignarlas rapidamente a tus clientes."
          action={
            <button
              onClick={() => setIsBuilding(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
            >
              Comenzar a crear
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]/10">
                  <Dumbbell size={26} className="text-[var(--accent)]" aria-hidden="true" />
                </div>
                <button
                  onClick={() => setDeleteTarget(template)}
                  className="rounded-lg p-2 text-[var(--text-muted)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  aria-label={`Eliminar ${template.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3
                className="text-xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {template.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Plantilla base de entrenamiento
              </p>

              <div className="mt-4 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} /> Plantilla Base
                </span>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => setEditingRoutine(template)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
                >
                  Usar Plantilla
                </button>
                <button
                  onClick={() => setEditingRoutine(template)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)]"
                >
                  <Eye size={14} />
                  Vista Previa
                </button>
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
        message={`Estas seguro de eliminar "${deleteTarget?.title}"? Esta accion no se puede deshacer.`}
        confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
      />
    </div>
  )
}
