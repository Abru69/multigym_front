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
import { getExercises, createExercise, createWorkout, createWorkoutExercise, updateWorkout, fetchApi } from '@/lib/api'
import { SearchBar } from '../components/SearchBar'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

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
  member?: { id: string } | null
  exercises?: WorkoutExercise[]
}

interface UserData {
  id: string
  name?: string
  email?: string
  memberId?: string
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

let uniqueIdCounter = 0

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExercises()
    fetchApi<{ dto?: { data?: Array<{ id: string; email?: string; role?: string; isActive?: boolean; memberDTO?: { id: string } | null; name?: string }> } }>('/api/tenant/users')
      .then((res) => {
        const users: UserData[] = (res.dto?.data || []).map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          memberId: u.memberDTO?.id,
        }))
        setDbUsers(users)
      })
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
            uniqueId: `init-${uniqueIdCounter++}`,
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
  const [showLibrary, setShowLibrary] = useState(false)

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
      uniqueId: `add-${uniqueIdCounter++}`,
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
          exerciseId: ex.id,
          dayOfWeek,
          sets: parseInt(String(ex.sets)) || 4,
          reps: ex.reps || '12',
          restSeconds: ex.restSeconds || 60,
          orderIndex: index,
        }))
      )

      const workoutPayload = {
        title: routineName,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const assignAndExercises = async (userId: string) => {
        const res = await createWorkout({ ...workoutPayload, memberId: userId })
        const workoutId = res.dto?.id
        if (!workoutId) throw new Error('No se pudo crear la rutina')
        for (const ex of exercisesPayload) {
          await createWorkoutExercise({ workoutId, ...ex })
        }
      }

      if (personalizedUser) {
        const memberKey = personalizedUser.memberId || personalizedUser.id
        await assignAndExercises(memberKey)
      } else {
        for (const userId of Array.from(selectedUsers)) {
          await assignAndExercises(userId)
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
      if (editingRoutine?.id) {
        await updateWorkout(editingRoutine.id, {
          memberId: editingRoutine.member?.id || '',
          title: routineName,
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        addToast(`Plantilla "${routineName}" actualizada exitosamente.`, 'success')
      } else {
        addToast('Para guardar una plantilla primero asígnala a un cliente con "Asignar"', 'warning')
      }
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
    <div className="flex h-dvh flex-col bg-[var(--surface)]/50">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--card)] px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        {personalizedUser ? (
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] sm:px-3"
          >
            <ArrowLeft size={16} />
          </button>
        ) : (
          onBack && (
            <button
              onClick={onBack}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] sm:px-3"
            >
              <ArrowLeft size={16} />
            </button>
          )
        )}

        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="w-full border-none bg-transparent text-base font-bold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] sm:text-lg"
            style={{ fontFamily: 'var(--font-heading)' }}
            placeholder="Nombre de la rutina..."
          />
          <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
            {totalExercises} ejercicios en {activeDaysCount} dia{activeDaysCount !== 1 ? 's' : ''}
            {personalizedUser && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-text)]">
                <Users size={10} />
                {personalizedUser.name || personalizedUser.email}
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] disabled:opacity-50 sm:inline-flex sm:px-4"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 disabled:opacity-50 sm:px-4"
          >
            <Users size={16} />
            <span className="hidden sm:inline">Asignar</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex shrink-0 border-b border-[var(--border)] bg-[var(--card)] lg:hidden">
        <button
          onClick={() => setShowLibrary(false)}
          className={`flex-1 py-2.5 text-center text-xs font-bold transition-all ${
            !showLibrary
              ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setShowLibrary(true)}
          className={`flex-1 py-2.5 text-center text-xs font-bold transition-all ${
            showLibrary
              ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Biblioteca
        </button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div
          className={`flex flex-1 flex-col border-r border-[var(--border)] bg-[var(--card)] ${
            showLibrary ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] px-3 py-2 sm:px-6 sm:py-3">
            <div className="flex flex-1 items-center gap-1.5 overflow-x-auto sm:gap-2">
              {DAYS.map((d, i) => (
                <button
                  key={d.key}
                  onClick={() => setSelectedDay(d.key)}
                  className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
                    selectedDay === d.key
                      ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <span>Dia {i + 1}</span>
                  {dayExercises[d.key].length > 0 && (
                    <span
                      className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold sm:h-5 sm:min-w-[20px] sm:text-[10px] ${
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
              <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent-text)] sm:h-8 sm:w-8">
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
            <div className="mb-3">
              <input
                type="text"
                value={DAYS.find((d) => d.key === selectedDay)?.label || ''}
                readOnly
                className="bg-transparent text-xs font-bold text-[var(--text-secondary)] outline-none sm:text-sm"
                style={{ fontFamily: 'var(--font-heading)' }}
              />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <AnimatePresence>
                {currentExercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.uniqueId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="group flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 transition-all hover:border-[var(--border)] hover:shadow-sm sm:gap-3 sm:p-4"
                  >
                    <div className="hidden shrink-0 cursor-grab items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] sm:flex">
                      <GripVertical size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] sm:text-sm">
                        {exercise.name}
                      </h4>
                      <span className="mt-0.5 inline-block rounded-md bg-[var(--accent)]/10 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-[var(--accent-text)] uppercase sm:mt-1 sm:px-2 sm:text-[10px]">
                        {exercise.muscleGroup || 'General'}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                      <div className="flex flex-col items-center rounded-lg bg-[var(--surface)] px-1.5 py-1 sm:px-2">
                        <span className="text-[8px] font-bold uppercase text-[var(--text-muted)] sm:text-[9px]">Sets</span>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExerciseDetail(exercise.uniqueId, 'sets', parseInt(e.target.value) || 1)
                          }
                          className="w-6 border-none bg-transparent text-center text-[10px] font-bold text-[var(--text-primary)] outline-none sm:w-8 sm:text-xs"
                        />
                      </div>
                      <div className="flex flex-col items-center rounded-lg bg-[var(--surface)] px-1.5 py-1 sm:px-2">
                        <span className="text-[8px] font-bold uppercase text-[var(--text-muted)] sm:text-[9px]">Reps</span>
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(e) =>
                            updateExerciseDetail(exercise.uniqueId, 'reps', e.target.value)
                          }
                          className="w-8 border-none bg-transparent text-center text-[10px] font-bold text-[var(--text-primary)] outline-none sm:w-10 sm:text-xs"
                        />
                      </div>
                      <div className="flex flex-col items-center rounded-lg bg-[var(--surface)] px-1.5 py-1 sm:px-2">
                        <span className="text-[8px] font-bold uppercase text-[var(--text-muted)] sm:text-[9px]">Desc.</span>
                        <input
                          type="number"
                          min="0"
                          step="15"
                          value={exercise.restSeconds}
                          onChange={(e) =>
                            updateExerciseDetail(exercise.uniqueId, 'restSeconds', parseInt(e.target.value) || 0)
                          }
                          className="w-8 border-none bg-transparent text-center text-[10px] font-bold text-[var(--text-primary)] outline-none sm:w-10 sm:text-xs"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeExercise(exercise.uniqueId)}
                      className="shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] transition-all hover:bg-red-500/10 hover:text-red-400 sm:p-2"
                      aria-label={`Eliminar ${exercise.name}`}
                    >
                      <Trash2 size={12} className="sm:hidden" />
                      <Trash2 size={14} className="hidden sm:block" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {currentExercises.length === 0 ? (
              <div
                className="mt-4 cursor-pointer rounded-xl border-2 border-dashed border-[var(--border)] p-6 text-center transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 sm:p-8"
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
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] sm:mb-3 sm:h-12 sm:w-12">
                  <Plus size={16} className="text-[var(--text-muted)] sm:sm:size-20" />
                </div>
                <p className="text-xs font-semibold text-[var(--text-secondary)] sm:text-sm">
                  Agregar ejercicios al {DAYS.find((d) => d.key === selectedDay)?.label}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--text-muted)] sm:mt-1 sm:text-xs">
                  Haz clic aqui o arrastra desde la biblioteca
                </p>
              </div>
            ) : (
              <button
                onClick={openExerciseModal}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] p-3 text-xs font-medium text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent-text)] sm:p-4 sm:text-sm"
              >
                <Plus size={14} />
                Agregar Ejercicio
              </button>
            )}
          </div>
        </div>

        {/* Library Panel */}
        <div
          className={`flex w-full flex-col bg-[var(--surface)]/80 lg:w-[340px] ${
            showLibrary ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="shrink-0 border-b border-[var(--border)] bg-[var(--card)] p-3 sm:p-4">
            <h3
              className="mb-2.5 text-xs font-bold text-[var(--text-primary)] sm:mb-3 sm:text-sm"
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
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-xs text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:bg-[var(--card)] focus:ring-1 focus:ring-[var(--accent)]/20 sm:text-sm"
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1 sm:mt-3">
              <button
                onClick={() => setSelectedGroupForModal(null)}
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-all sm:px-3 sm:text-[10px] ${
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
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-all sm:px-3 sm:text-[10px] ${
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

          <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3">
            {Object.entries(sidebarExercises).map(([group, exercises]) => (
              <div key={group} className="mb-3 sm:mb-4">
                <h4 className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] sm:mb-2 sm:text-[10px]">
                  {group}
                </h4>
                <div className="space-y-1 sm:space-y-1.5">
                  {exercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => handleAddExercise(exercise)}
                      className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-left transition-all hover:shadow-sm sm:gap-2.5 sm:p-2.5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 sm:h-8 sm:w-8">
                        <Dumbbell size={12} className="text-[var(--accent-text)] sm:size-[14]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-[var(--text-primary)] sm:text-xs">
                          {exercise.name}
                        </p>
                      </div>
                      <Plus size={12} className="shrink-0 text-[var(--text-muted)] sm:size-[14]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(sidebarExercises).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
                <Dumbbell size={28} className="mb-2 text-[var(--text-muted)] sm:mb-3 sm:size-8" />
                <p className="text-xs font-medium text-[var(--text-muted)] sm:text-sm">No se encontraron ejercicios</p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[var(--border)] bg-[var(--card)] p-2.5 sm:p-3">
            <button
              onClick={() => {
                setIsCreatingExercise(true)
                setShowExerciseModal(true)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] py-2 text-xs font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] sm:py-2.5 sm:text-sm"
            >
              <Plus size={12} />
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
            {/* eslint-disable jsx-a11y/no-autofocus */}
            <input
              id="new-ex-name"
              type="text"
              value={newExerciseForm.name}
              onChange={(e) => setNewExerciseForm({ ...newExerciseForm, name: e.target.value })}
              placeholder="Ej. Press de Banca"
              autoFocus
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
            />
            {/* eslint-enable jsx-a11y/no-autofocus */}
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
              const key = user.memberId || user.id
              const isSelected = selectedUsers.has(key)
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    const next = new Set(selectedUsers)
                    if (isSelected) { next.delete(key) } else { next.add(key) }
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
