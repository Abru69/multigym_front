import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DayOfWeek } from '@/types'
import {
  Plus,
  Trash2,
  GripVertical,
  Users,
  Check,
  ArrowLeft,
  Dumbbell,
  Search,
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
  { key: 'miercoles', label: 'Miercoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sabado' },
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

  const activeDaysCount = useMemo(
    () => Object.values(dayExercises).filter((day) => day.length > 0).length,
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

  const sidebarExercises = useMemo(() => {
    const filtered = dbExercises.filter((e) => {
      const matchesGroup = !selectedGroupForModal || e.muscleGroup === selectedGroupForModal
      const matchesSearch = e.name
        .toLowerCase()
        .includes(debouncedExerciseSearch.toLowerCase())
      return matchesGroup && matchesSearch
    })
    const grouped: Record<string, ExerciseData[]> = {}
    filtered.forEach((e) => {
      const group = e.muscleGroup || 'General'
      if (!grouped[group]) grouped[group] = []
      grouped[group].push(e)
    })
    return grouped
  }, [dbExercises, selectedGroupForModal, debouncedExerciseSearch])

  return (
    <div className="flex h-screen flex-col bg-[var(--surface)]/50">
      <div className="flex items-center gap-4 border-b border-[var(--border)] bg-[var(--card)] px-6 py-3">
        {personalizedUser ? (
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
          >
            <ArrowLeft size={16} />
          </button>
        ) : (
          onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
            >
              <ArrowLeft size={16} />
            </button>
          )
        )}

        <div className="flex-1">
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="w-full border-none bg-transparent text-lg font-bold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            style={{ fontFamily: 'var(--font-heading)' }}
            placeholder="Nombre de la rutina..."
          />
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {totalExercises} ejercicios en {activeDaysCount} dia{activeDaysCount !== 1 ? 's' : ''}
            {personalizedUser && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-text)]">
                <Users size={10} />
                {personalizedUser.name || personalizedUser.email}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 disabled:opacity-50"
          >
            <Users size={16} />
            Asignar
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-[70%] flex-col border-r border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-3">
            <div className="flex flex-1 items-center gap-2 overflow-x-auto">
              {DAYS.map((d, i) => (
                <button
                  key={d.key}
                  onClick={() => setSelectedDay(d.key)}
                  className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    selectedDay === d.key
                      ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span>Dia {i + 1}</span>
                  {dayExercises[d.key].length > 0 && (
                    <span
                      className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        selectedDay === d.key
                          ? 'bg-[var(--accent-text)]/15 text-[var(--accent-text)]'
                          : 'bg-[var(--card)] text-[var(--text-muted)]'
                      }`}
                    >
                      {dayExercises[d.key].length}
                    </span>
                  )}
                </button>
              ))}
              <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] border-[var(--border)] text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent-text)]">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-4">
              <input
                type="text"
                value={DAYS.find((d) => d.key === selectedDay)?.label || ''}
                readOnly
                className="text-sm font-bold text-[var(--text-secondary)] bg-transparent border-none outline-none"
                style={{ fontFamily: 'var(--font-heading)' }}
              />
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {currentExercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.uniqueId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border)] hover:shadow-sm"
                  >
                    <div className="flex shrink-0 cursor-grab items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                      <GripVertical size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        {exercise.name}
                      </h4>
                      <span className="mt-1 inline-block rounded-md bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--accent-text)] uppercase">
                        {exercise.muscleGroup || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center rounded-lg bg-[var(--surface)] px-2 py-1">
                        <span className="text-[9px] font-bold uppercase text-[var(--text-muted)]">Sets</span>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExerciseDetail(exercise.uniqueId, 'sets', parseInt(e.target.value) || 1)
                          }
                          className="w-8 border-none bg-transparent text-center text-xs font-bold text-[var(--text-primary)] outline-none"
                        />
                      </div>
                      <div className="flex flex-col items-center rounded-lg bg-[var(--surface)] px-2 py-1">
                        <span className="text-[9px] font-bold uppercase text-[var(--text-muted)]">Reps</span>
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(e) =>
                            updateExerciseDetail(exercise.uniqueId, 'reps', e.target.value)
                          }
                          className="w-10 border-none bg-transparent text-center text-xs font-bold text-[var(--text-primary)] outline-none"
                        />
                      </div>
                      <div className="flex flex-col items-center rounded-lg bg-[var(--surface)] px-2 py-1">
                        <span className="text-[9px] font-bold uppercase text-[var(--text-muted)]">Desc.</span>
                        <input
                          type="number"
                          min="0"
                          step="15"
                          value={exercise.restSeconds}
                          onChange={(e) =>
                            updateExerciseDetail(exercise.uniqueId, 'restSeconds', parseInt(e.target.value) || 0)
                          }
                          className="w-10 border-none bg-transparent text-center text-xs font-bold text-[var(--text-primary)] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeExercise(exercise.uniqueId)}
                      className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                      aria-label={`Eliminar ${exercise.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {currentExercises.length === 0 ? (
              <div
                className="mt-4 cursor-pointer rounded-xl border-2 border-dashed border-[var(--border)] p-8 text-center transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
                onClick={openExerciseModal}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openExerciseModal()
                  }
                }}
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface)]">
                  <Plus size={20} className="text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                  Agregar ejercicios al {DAYS.find((d) => d.key === selectedDay)?.label}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Haz clic aqui o arrastra desde la biblioteca
                </p>
              </div>
            ) : (
              <button
                onClick={openExerciseModal}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] p-4 text-sm font-medium text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
              >
                <Plus size={16} />
                Agregar Ejercicio
              </button>
            )}
          </div>
        </div>

        <div className="flex w-[30%] flex-col bg-[var(--surface)]/80">
          <div className="border-b border-[var(--border)] bg-[var(--card)] p-4">
            <h3
              className="mb-3 text-sm font-bold text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Biblioteca de Ejercicios
            </h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Buscar ejercicio..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--card)] focus:ring-1 focus:ring-[var(--accent)]/20"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedGroupForModal(null)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${
                  !selectedGroupForModal
                    ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                    : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                Todos
              </button>
              {ALL_GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() =>
                    setSelectedGroupForModal(selectedGroupForModal === group ? null : group)
                  }
                  className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${
                    selectedGroupForModal === group
                      ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {Object.entries(sidebarExercises).map(([group, exercises]) => (
              <div key={group} className="mb-4">
                <h4 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {group}
                </h4>
                <div className="space-y-1.5">
                  {exercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => handleAddExercise(exercise)}
                      className="flex w-full items-center gap-2.5 rounded-lg bg-[var(--card)] p-2.5 text-left transition-all hover:shadow-sm border border-[var(--border)]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                        <Dumbbell size={14} className="text-[var(--accent-text)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                          {exercise.name}
                        </p>
                      </div>
                      <Plus size={14} className="shrink-0 text-[var(--text-muted)]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(sidebarExercises).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Dumbbell size={32} className="mb-3 text-[var(--text-muted)]" />
                <p className="text-sm font-medium text-[var(--text-muted)]">No se encontraron ejercicios</p>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border)] bg-[var(--card)] p-3">
            <button
              onClick={() => {
                setIsCreatingExercise(true)
                setShowExerciseModal(true)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
            >
              <Plus size={14} />
              Crear Nuevo Ejercicio
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showExerciseModal && isCreatingExercise}
        onClose={() => {
          setShowExerciseModal(false)
          setIsCreatingExercise(false)
        }}
        title="Nuevo Ejercicio"
        size="md"
      >
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
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
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
              className="h-10 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
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
              onClick={() => {
                setShowExerciseModal(false)
                setIsCreatingExercise(false)
              }}
              disabled={isSavingExercise}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveNewExercise}
              disabled={isSavingExercise}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90"
            >
              {isSavingExercise && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-text)]/30 border-t-[var(--accent-text)]" />
              )}
              {isSavingExercise ? 'Guardando...' : 'Crear Ejercicio'}
            </button>
          </div>
        </div>
      </Modal>

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
                  className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent)]'
                        : 'border-[var(--border)] bg-transparent'
                    }`}
                  >
                    {isSelected && <Check size={12} color="var(--accent-text)" strokeWidth={3} />}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-xs font-bold text-[var(--text-primary)]">
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
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndAssign}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90"
            >
              {isSaving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-text)]/30 border-t-[var(--accent-text)]" />
              )}
              {isSaving ? 'Guardando...' : `Asignar a ${selectedUsers.size} cliente(s)`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
