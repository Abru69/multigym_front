import { useCallback, useEffect, useMemo, useState } from 'react'
import { Dumbbell, Edit2, Plus, RefreshCw, Trash2, Users } from 'lucide-react'
import { useToastStore } from '@/components/ui/Toast'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { getClientUsers, getResponseItems, getWorkoutById, getWorkoutExercises, getWorkouts, deleteWorkout } from '@/lib/api'
import type { UserDTO, WorkoutDTO, WorkoutExerciseListItemDTO } from '@/types'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import RoutineBuilder, { type EditingRoutine, type ExerciseData } from './RoutineBuilder'

type ViewMode = 'assigned' | 'templates'

interface RoutineRow {
  id: string
  title: string
  member?: { id: string } | null
  memberName: string
  startsAt?: string
  endsAt?: string
}

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString('es-MX')
}

export default function RoutineLibrary() {
  const addToast = useToastStore((s) => s.addToast)
  const [routines, setRoutines] = useState<RoutineRow[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('assigned')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isBuilding, setIsBuilding] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<EditingRoutine | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoutineRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchRoutines = useCallback(async () => {
    try {
      setIsLoading(true)
      const [workoutsResponse, clientsResponse] = await Promise.all([
        getWorkouts({ size: 9999 }),
        getClientUsers().catch(() => null),
      ])
      const loadedClients = clientsResponse ? getResponseItems<UserDTO>(clientsResponse) : []
      const clientNames = new Map(
        loadedClients
          .filter((client) => client.memberDTO?.id)
          .map((client) => [client.memberDTO!.id, client.memberDTO!.name || client.email])
      )
      const loadedRoutines = getResponseItems<WorkoutDTO>(workoutsResponse).map((workout) => ({
        id: workout.id,
        title: workout.title,
        member: workout.member,
        memberName: workout.member?.id
          ? clientNames.get(workout.member.id) || `Cliente ${workout.member.id.slice(0, 8)}`
          : 'Plantilla base',
        startsAt: workout.startsAt,
        endsAt: workout.endsAt,
      }))
      setRoutines(loadedRoutines)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudieron cargar las rutinas', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    if (!isBuilding && !editingRoutine) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRoutines()
    }
  }, [editingRoutine, fetchRoutines, isBuilding])

  const visibleRoutines = useMemo(() => {
    const term = search.trim().toLowerCase()
    return routines.filter((routine) => {
      const isAssigned = Boolean(routine.member)
      const matchesMode = viewMode === 'assigned' ? isAssigned : !isAssigned
      const matchesSearch =
        !term || routine.title.toLowerCase().includes(term) || routine.memberName.toLowerCase().includes(term)
      return matchesMode && matchesSearch
    })
  }, [routines, search, viewMode])

  const loadRoutineForEditing = async (routine: RoutineRow) => {
    setEditingId(routine.id)
    try {
      const [detailResponse, exercisesResponse] = await Promise.all([
        getWorkoutById(routine.id),
        getWorkoutExercises(routine.id),
      ])
      const detail = detailResponse.dto
      const exercises = getResponseItems<WorkoutExerciseListItemDTO>(exercisesResponse)
      if (!detail) throw new Error('No se pudo cargar el detalle de la rutina')

      const editorExercises = exercises.map((workoutExercise) => {
        const source = workoutExercise.exerciseSource ||
          (workoutExercise.catalogExerciseId ? 'CATALOG' : 'CUSTOM')
        const exercise: ExerciseData = {
          id: source === 'CATALOG'
            ? workoutExercise.catalogExerciseId || workoutExercise.exercise.id
            : workoutExercise.exerciseId || workoutExercise.exercise.id,
          source,
          name: workoutExercise.exercise.name,
          displayName: workoutExercise.exercise.name,
          muscleGroup: workoutExercise.exercise.muscleGroup || 'General',
          muscleGroupLabel: workoutExercise.exercise.muscleGroup || 'General',
          imageUrl: workoutExercise.exercise.imageUrl || '',
        }
        return {
          id: workoutExercise.id,
          exercise,
          exerciseId: workoutExercise.exerciseId,
          catalogExerciseId: workoutExercise.catalogExerciseId,
          exerciseSource: source,
          dayOfWeek: workoutExercise.dayOfWeek,
          sets: workoutExercise.sets,
          reps: workoutExercise.reps,
          restSeconds: workoutExercise.restSeconds,
        }
      })

      setEditingRoutine({
        id: detail.id,
        title: detail.title,
        member: detail.member,
        exercises: editorExercises,
      })
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo abrir la rutina', 'error')
    } finally {
      setEditingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteWorkout(deleteTarget.id)
      setRoutines((current) => current.filter((routine) => routine.id !== deleteTarget.id))
      addToast('Rutina eliminada correctamente', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo eliminar la rutina', 'error')
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const columns: DataTableColumn<RoutineRow>[] = [
    { key: 'title', label: 'Rutina', sortable: true, className: 'font-semibold text-[var(--text-primary)]' },
    ...(viewMode === 'assigned'
      ? [{ key: 'memberName', label: 'Cliente', sortable: true }]
      : []),
    { key: 'startsAt', label: 'Inicio', sortable: true, render: (routine) => formatDate(routine.startsAt) },
    { key: 'endsAt', label: 'Vigencia', render: (routine) => formatDate(routine.endsAt) },
    {
      key: 'actions',
      label: 'Acciones',
      className: 'text-right',
      render: (routine) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => loadRoutineForEditing(routine)}
            disabled={editingId === routine.id}
            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] disabled:opacity-50"
            aria-label={`Editar ${routine.title}`}
            title="Editar"
          >
            {editingId === routine.id ? <RefreshCw size={16} className="animate-spin" /> : <Edit2 size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(routine)}
            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Eliminar ${routine.title}`}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

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
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Gestión de Rutinas
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Administra las rutinas asignadas a clientes y tus plantillas base.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsBuilding(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> Crear plantilla
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-[var(--border)] bg-[var(--card)] p-1">
          <button
            type="button"
            onClick={() => setViewMode('assigned')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${viewMode === 'assigned' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}
          >
            <Users size={15} /> Rutinas de clientes
          </button>
          <button
            type="button"
            onClick={() => setViewMode('templates')}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${viewMode === 'templates' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}
          >
            <Dumbbell size={15} /> Plantillas
          </button>
        </div>
        <div className="w-full sm:max-w-sm">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={viewMode === 'assigned' ? 'Buscar por rutina o cliente...' : 'Buscar plantilla...'}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState text="Cargando rutinas..." />
      ) : (
        <DataTable
          columns={columns}
          data={visibleRoutines}
          keyExtractor={(routine) => routine.id}
          emptyIcon={viewMode === 'assigned' ? Users : Dumbbell}
          emptyTitle={viewMode === 'assigned' ? 'No hay rutinas asignadas' : 'No hay plantillas'}
          emptyDescription={viewMode === 'assigned' ? 'Las rutinas asignadas a clientes aparecerán aquí.' : 'Crea una plantilla para reutilizarla con tus clientes.'}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar rutina"
        message={`¿Seguro que deseas eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel={isDeleting ? 'Eliminando...' : 'Eliminar'}
      />
    </div>
  )
}
