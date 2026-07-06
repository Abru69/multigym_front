import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DayOfWeek } from '@/types'
import {
  Plus,
  Trash2,
  Save,
  Image,
  GripVertical,
  Users,
  X,
  Check,
  ArrowLeft,
  Dumbbell,
  Edit2,
  Activity,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToastStore } from '@/components/ui/Toast'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getExercises, createExercise, createWorkout, fetchApi } from '@/lib/api'
import { MUSCLE_GROUPS } from '@/data/constants'
import { SearchBar } from '../components/SearchBar'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'
import type { ResponseDTO } from '@/types'

interface ExerciseData {
  id: string
  name: string
  muscleGroup: string
  imageUrl?: string
}

interface DayExercise extends ExerciseData {
  uniqueId: string
  sets: number
  reps: string
  restSeconds: number
}

interface WorkoutExercise {
  dayOfWeek?: string
  exercise?: ExerciseData
  sets?: number
  reps?: string
  restTimeSeconds?: number
}

interface EditingRoutine {
  id?: string
  title?: string
  exercises?: WorkoutExercise[]
}

interface UserData {
  id: string
  name?: string
  email?: string
}

type DayExercises = Record<DayOfWeek, DayExercise[]>

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

const ALL_GROUPS_LIST = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Brazos',
  'Hombros',
  'Core',
  'Cardio',
  'Cuerpo Completo',
]

export default function RoutineBuilder({
  onBack,
  editingRoutine,
}: {
  onBack?: () => void
  editingRoutine?: EditingRoutine | null
}) {
  const addToast = useToastStore((s) => s.addToast)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [dbExercises, setDbExercises] = useState<ExerciseData[]>([])
  const [dbUsers, setDbUsers] = useState<UserData[]>([])

  const customGroups = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('customMuscleGroups') || '[]')
      return stored.map((g: unknown) => (typeof g === 'string' ? g : (g as UserData).name || ''))
    } catch {
      return []
    }
  }, [])

  const ALL_GROUPS = useMemo(() => [...ALL_GROUPS_LIST, ...customGroups], [customGroups])

  const loadExercises = useCallback(async () => {
    try {
      const res = await getExercises()
      const apiExercises = res.dto?.data || []
      const mapped: ExerciseData[] = apiExercises.map((e) => ({
        id: e.id,
        name: e.name,
        muscleGroup: e.muscleGroup,
        imageUrl: '',
      }))
      setDbExercises(mapped)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    loadExercises()
    fetchApi<ResponseDTO<{ data: UserData[] }>>('/api/tenant/users')
      .then((res) => setDbUsers(res.dto?.data || []))
      .catch((e) => console.error(e))
  }, [loadExercises])

  const personalizedUserId = searchParams.get('userId')
  const personalizedUser = personalizedUserId
    ? dbUsers.find((u) => u.id === personalizedUserId)
    : null

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lunes')
  const [routineName, setRoutineName] = useState(
    editingRoutine?.title || 'Nueva Rutina de Hipertrofia'
  )

  useEffect(() => {
    if (personalizedUser && !editingRoutine) {
      setRoutineName(`Rutina Personalizada - ${personalizedUser.name || personalizedUser.email}`)
    }
  }, [personalizedUser, editingRoutine])

  const [dayExercises, setDayExercises] = useState<DayExercises>(() => {
    const initialDays: DayExercises = {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
      sabado: [],
      domingo: [],
    }
    if (editingRoutine?.exercises) {
      editingRoutine.exercises.forEach((we: WorkoutExercise) => {
        const day = we.dayOfWeek?.toLowerCase() as DayOfWeek
        if (day && initialDays[day]) {
          initialDays[day].push({
            ...we.exercise!,
            uniqueId: Math.random().toString(36).substring(2, 9),
            sets: we.sets || 4,
            reps: we.reps || '10-12',
            restSeconds: we.restTimeSeconds || 60,
          })
        }
      })
    }
    return initialDays
  })

  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const debouncedExerciseSearch = useDebounce(exerciseSearch)
  const [selectedGroupForModal, setSelectedGroupForModal] = useState<string | null>(null)

  const [isCreatingExercise, setIsCreatingExercise] = useState(false)
  const [newExerciseForm, setNewExerciseForm] = useState({ name: '', muscleGroup: '' })
  const [newExerciseErrors, setNewExerciseErrors] = useState<Record<string, string>>({})
  const [isSavingExercise, setIsSavingExercise] = useState(false)

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [searchUser, setSearchUser] = useState('')
  const debouncedUserSearch = useDebounce(searchUser)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  const filteredClients = useMemo(
    () =>
      dbUsers.filter((u) =>
        (u.name || u.email || '').toLowerCase().includes(debouncedUserSearch.toLowerCase())
      ),
    [dbUsers, debouncedUserSearch]
  )

  const currentExercises = dayExercises[selectedDay]

  const totalExercises = useMemo(
    () => Object.values(dayExercises).reduce((acc, day) => acc + day.length, 0),
    [dayExercises]
  )

  const openExerciseModal = () => {
    setIsCreatingExercise(false)
    setSelectedGroupForModal(null)
    setExerciseSearch('')
    setShowExerciseModal(true)
  }

  const validateNewExerciseForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!newExerciseForm.name) errors.name = 'El nombre es requerido'
    if (!newExerciseForm.muscleGroup) errors.muscleGroup = 'Selecciona un grupo'
    setNewExerciseErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveNewExercise = async () => {
    if (!validateNewExerciseForm()) {
      addToast('Completa los campos obligatorios', 'error')
      return
    }
    setIsSavingExercise(true)
    try {
      await createExercise({ name: newExerciseForm.name, muscleGroup: newExerciseForm.muscleGroup })
      addToast('Ejercicio creado correctamente', 'success')
      loadExercises()
      setNewExerciseForm({ name: '', muscleGroup: '' })
      setIsCreatingExercise(false)
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Error creando ejercicio', 'error')
    } finally {
      setIsSavingExercise(false)
    }
  }

  const handleAddExercise = (exercise: ExerciseData) => {
    const exerciseCopy: DayExercise = {
      ...exercise,
      uniqueId: Math.random().toString(36).substring(2, 9),
      sets: 4,
      reps: '10-12',
      restSeconds: 60,
    }
    setDayExercises((prev) => ({ ...prev, [selectedDay]: [...prev[selectedDay], exerciseCopy] }))
    setShowExerciseModal(false)
  }

  const removeExercise = (uniqueId: string) => {
    setDayExercises((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((e) => e.uniqueId !== uniqueId),
    }))
  }

  const updateExerciseDetail = (
    uniqueId: string,
    field: keyof DayExercise,
    value: string | number
  ) => {
    setDayExercises((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map((e) =>
        e.uniqueId === uniqueId ? { ...e, [field]: value } : e
      ),
    }))
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSaveAndAssign = async () => {
    if (selectedUsers.size === 0 && !personalizedUser) {
      addToast('Selecciona al menos un cliente', 'error')
      return
    }
    if (!routineName) {
      addToast('Ponle nombre a la rutina', 'error')
      return
    }

    setIsSaving(true)
    try {
      const exercisesPayload = Object.entries(dayExercises).flatMap(([dayOfWeek, exercises]) =>
        exercises.map((ex, index) => ({
          exercise: { id: ex.id },
          dayOfWeek,
          sets: parseInt(String(ex.sets)) || 4,
          reps: ex.reps || '12',
          restSeconds: 60,
          orderIndex: index,
        }))
      )

      const payload = {
        title: routineName,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        exercises: exercisesPayload,
      }

      if (personalizedUser) {
        await createWorkout({ ...payload, member: { id: personalizedUser.id } })
      } else {
        for (const userId of Array.from(selectedUsers)) {
          await createWorkout({ ...payload, member: { id: userId } })
        }
      }

      addToast(
        `Rutina "${routineName}" asignada exitosamente a ${personalizedUser ? 1 : selectedUsers.size} cliente(s).`,
        'success'
      )
      setShowAssignModal(false)
      setSelectedUsers(new Set())
      if (personalizedUser) navigate('/admin/usuarios')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Error guardando rutina', 'error')
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
          dayOfWeek,
          sets: parseInt(String(ex.sets)) || 4,
          reps: ex.reps || '12',
          restSeconds: 60,
          orderIndex: index,
        }))
      )

      const payload = {
        title: routineName,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        exercises: exercisesPayload,
      }
      await createWorkout(payload)
      addToast(
        `Plantilla "${routineName}" guardada en la biblioteca general exitosamente.`,
        'success'
      )
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Error guardando plantilla', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-6 border-b border-[var(--border)] pb-8 md:flex-row md:items-end">
        <div className="w-full flex-1">
          <div className="mb-4 flex items-center gap-3">
            {personalizedUser ? (
              <button
                onClick={() => navigate('/admin/usuarios')}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97]"
              >
                <ArrowLeft size={16} /> Volver a Usuarios
              </button>
            ) : (
              onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97]"
                >
                  <ArrowLeft size={16} /> Volver a Plantillas
                </button>
              )
            )}
            <span className="glass-badge rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[var(--accent)] uppercase">
              {personalizedUser ? 'MODO ASIGNACIÓN' : 'MODO PLANTILLA'}
            </span>
          </div>

          <div className="group relative">
            <input
              type="text"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full border-b-2 border-transparent bg-transparent pb-2 text-3xl font-black text-[var(--text-primary)] transition-colors duration-200 outline-none placeholder:text-[var(--text-muted)]/30 hover:border-[var(--border-hover)] focus:border-[var(--accent)] sm:text-4xl"
              placeholder="Escribe el nombre de la rutina aquí..."
            />
            <Edit2
              size={16}
              className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>

          <p className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Activity size={16} /> {totalExercises} ejercicios añadidos
            </span>
            {personalizedUser && (
              <>
                <span className="h-1 w-1 rounded-full bg-white/[0.15]" />
                <span className="flex items-center gap-1.5">
                  <Users size={16} /> Personalizando para:{' '}
                  <strong className="text-[var(--text-primary)]">{personalizedUser.name}</strong>
                </span>
              </>
            )}
          </p>
        </div>
        <div className="mt-4 flex w-full items-center gap-3 md:mt-0 md:w-auto">
          {personalizedUser ? (
            <button
              onClick={handleSaveAndAssign}
              disabled={isSaving}
              className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
            >
              <Check size={16} />
              Guardar y Asignar a {personalizedUser.name?.split(' ')[0] || personalizedUser.email}
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveTemplate}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97] disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
              >
                <Users size={16} /> Guardar y Asignar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-sm backdrop-blur-xl">
        {DAYS.map((d) => (
          <button
            key={d.key}
            onClick={() => setSelectedDay(d.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              selectedDay === d.key
                ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--detail)] text-white shadow-[0_0_16px_rgba(66,204,99,0.3)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]'
            }`}
          >
            {d.label}
            <span
              className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                selectedDay === d.key
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--card)] text-[var(--text-muted)]'
              }`}
            >
              {dayExercises[d.key].length}
            </span>
          </button>
        ))}
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        <AnimatePresence>
          {currentExercises.map((exercise, index) => (
            <motion.div
              key={exercise.uniqueId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="group flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:flex-row sm:items-center sm:p-5"
            >
              <div className="flex shrink-0 items-center text-[var(--text-muted)]">
                <GripVertical size={18} aria-hidden="true" />
              </div>

              {/* Image */}
              <div className="h-32 w-full flex-shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] sm:h-20 sm:w-24">
                {exercise.imageUrl ? (
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--accent)]">
                    <Image size={24} aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="w-full min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-[var(--text-primary)]">
                      {exercise.name}
                    </h4>
                    <span className="mt-1 inline-block rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--accent)] uppercase">
                      {exercise.muscleGroup || 'General'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeExercise(exercise.uniqueId)}
                    className="rounded-xl p-2 text-[var(--error)] opacity-100 transition-all hover:bg-[var(--error)]/10 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Eliminar ${exercise.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-center backdrop-blur-xl">
                    <p className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                      Series
                    </p>
                    <input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExerciseDetail(
                          exercise.uniqueId,
                          'sets',
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-12 border-none bg-transparent text-center text-sm font-bold text-[var(--text-primary)] outline-none"
                      aria-label="Número de series"
                    />
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-center backdrop-blur-xl">
                    <p className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                      Reps
                    </p>
                    <input
                      type="text"
                      value={exercise.reps}
                      onChange={(e) =>
                        updateExerciseDetail(exercise.uniqueId, 'reps', e.target.value)
                      }
                      className="w-14 border-none bg-transparent text-center text-sm font-bold text-[var(--text-primary)] outline-none"
                      aria-label="Número de repeticiones"
                    />
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-center backdrop-blur-xl">
                    <p className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                      Descanso (s)
                    </p>
                    <input
                      type="number"
                      min="0"
                      step="15"
                      value={exercise.restSeconds}
                      onChange={(e) =>
                        updateExerciseDetail(
                          exercise.uniqueId,
                          'restSeconds',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-14 border-none bg-transparent text-center text-sm font-bold text-[var(--text-primary)] outline-none"
                      aria-label="Tiempo de descanso en segundos"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add button */}
        <button
          onClick={openExerciseModal}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--border)] bg-transparent text-sm font-bold text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
        >
          <Plus size={18} /> Agregar Ejercicio a {DAYS.find((d) => d.key === selectedDay)?.label}
        </button>

        {currentExercises.length === 0 && (
          <div
            className="cursor-pointer rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-12 text-center backdrop-blur-xl transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
            onClick={openExerciseModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openExerciseModal()
              }
            }}
            aria-label={`Añadir ejercicios al ${DAYS.find((d) => d.key === selectedDay)?.label}`}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <Plus size={24} className="text-[var(--accent)]" aria-hidden="true" />
            </div>
            <p className="mb-2 text-lg font-bold text-[var(--text-primary)]">
              Añadir ejercicios al {DAYS.find((d) => d.key === selectedDay)?.label}
            </p>
            <p className="mx-auto max-w-sm text-sm text-[var(--text-muted)]">
              Comienza agregando ejercicios a este día de entrenamiento para estructurar la rutina.
            </p>
          </div>
        )}
      </div>

      {/* Exercise Selection Modal */}
      <Modal
        isOpen={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        title={
          isCreatingExercise
            ? 'Nuevo Ejercicio'
            : selectedGroupForModal
              ? `Ejercicios: ${selectedGroupForModal.toUpperCase()}`
              : 'Biblioteca de Ejercicios'
        }
        size="xl"
      >
        {isCreatingExercise ? (
          <div className="space-y-4">
            <FormField
              label="Nombre del Ejercicio"
              required
              error={newExerciseErrors.name}
              htmlFor="new-ex-name"
            >
              <input
                id="new-ex-name"
                type="text"
                value={newExerciseForm.name}
                onChange={(e) => setNewExerciseForm({ ...newExerciseForm, name: e.target.value })}
                placeholder="Ej. Press de Banca"
                autoFocus
                className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
              />
            </FormField>
            <FormField
              label="Grupo Muscular"
              required
              error={newExerciseErrors.muscleGroup}
              htmlFor="new-ex-group"
            >
              <select
                id="new-ex-group"
                value={newExerciseForm.muscleGroup}
                onChange={(e) =>
                  setNewExerciseForm({ ...newExerciseForm, muscleGroup: e.target.value })
                }
                className="h-10 w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
              >
                <option value="" disabled>
                  Selecciona un grupo muscular...
                </option>
                {ALL_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
              <button
                onClick={() => setIsCreatingExercise(false)}
                disabled={isSavingExercise}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewExercise}
                disabled={isSavingExercise}
                className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
              >
                {isSavingExercise && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {isSavingExercise ? 'Guardando...' : 'Crear Ejercicio'}
              </button>
            </div>
          </div>
        ) : selectedGroupForModal === null && !exerciseSearch ? (
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {ALL_GROUPS.map((groupName) => {
              const groupInfo = MUSCLE_GROUPS.find((g) => g.name === groupName) || {
                name: groupName,
                description: '',
                imageUrl: '',
              }
              return (
                <button
                  key={groupName}
                  onClick={() => setSelectedGroupForModal(groupName)}
                  className="group relative h-32 overflow-hidden rounded-2xl border border-[var(--border)] backdrop-blur-xl transition-all hover:border-[var(--accent)]/30 hover:shadow-[0_0_24px_rgba(66,204,99,0.08)]"
                >
                  {groupInfo.imageUrl ? (
                    <img
                      src={groupInfo.imageUrl}
                      alt={groupName}
                      className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]">
                      <Dumbbell
                        size={32}
                        className="text-[var(--accent)] opacity-40"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end p-3">
                    <h3 className="truncate text-sm font-bold text-white">{groupName}</h3>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedGroupForModal && (
                <button
                  onClick={() => setSelectedGroupForModal(null)}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--text-muted)] backdrop-blur-md transition-all hover:bg-white/[0.08] hover:text-[var(--text-primary)]"
                  aria-label="Volver a grupos"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <SearchBar
                value={exerciseSearch}
                onChange={setExerciseSearch}
                placeholder={
                  selectedGroupForModal
                    ? 'Buscar en este grupo...'
                    : 'Buscar cualquier ejercicio...'
                }
                className="flex-1"
              />
              <button
                onClick={() => setIsCreatingExercise(true)}
                className="glass-btn-primary inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
              >
                <Plus size={16} /> Nuevo
              </button>
            </div>

            <div className="grid grid-cols-1 content-start gap-3 overflow-y-auto sm:grid-cols-2">
              {dbExercises
                .filter((e) => !selectedGroupForModal || e.muscleGroup === selectedGroupForModal)
                .filter((e) => e.name.toLowerCase().includes(debouncedExerciseSearch.toLowerCase()))
                .map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleAddExercise(exercise)}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 text-left backdrop-blur-xl transition-all hover:border-[var(--accent)]/30 hover:bg-[var(--surface-hover)]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
                      {exercise.imageUrl ? (
                        <img
                          src={exercise.imageUrl}
                          alt={exercise.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Dumbbell size={20} className="text-[var(--accent)]" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                        {exercise.name}
                      </p>
                      <span className="mt-1 inline-block rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-[var(--accent)] uppercase">
                        {exercise.muscleGroup || 'General'}
                      </span>
                    </div>
                    <Plus
                      size={18}
                      className="shrink-0 text-[var(--text-muted)]"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              {dbExercises.length > 0 &&
                dbExercises
                  .filter((e) => !selectedGroupForModal || e.muscleGroup === selectedGroupForModal)
                  .filter((e) =>
                    e.name.toLowerCase().includes(debouncedExerciseSearch.toLowerCase())
                  ).length === 0 && (
                  <p className="col-span-1 py-8 text-center text-sm text-[var(--text-muted)] sm:col-span-2">
                    No se encontraron ejercicios con ese filtro.
                  </p>
                )}
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Asignar Rutina"
        description={routineName}
        size="md"
      >
        <div className="space-y-4">
          <SearchBar
            value={searchUser}
            onChange={setSearchUser}
            placeholder="Buscar cliente por nombre..."
          />

          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {filteredClients.map((user) => {
              const isSelected = selectedUsers.has(user.id)
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    const next = new Set(selectedUsers)
                    isSelected ? next.delete(user.id) : next.add(user.id)
                    setSelectedUsers(next)
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left backdrop-blur-xl transition-all ${
                    isSelected
                      ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10 shadow-[0_0_16px_rgba(66,204,99,0.1)]'
                      : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isSelected
                        ? 'border-[var(--accent)] bg-gradient-to-br from-[var(--accent)] to-[var(--detail)]'
                        : 'border-[var(--border-hover)] bg-transparent'
                    }`}
                  >
                    {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--text-primary)]">
                    {(user.name || user.email || '')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                      {user.name || user.email}
                    </p>
                    {user.name && (
                      <p className="truncate text-[10px] text-[var(--text-muted)]">{user.email}</p>
                    )}
                  </div>
                </button>
              )
            })}
            {filteredClients.length === 0 && (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                No se encontraron clientes.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
            <button
              onClick={() => setShowAssignModal(false)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndAssign}
              disabled={isSaving}
              className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
            >
              {isSaving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isSaving ? 'Guardando...' : `Asignar a ${selectedUsers.size} cliente(s)`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
