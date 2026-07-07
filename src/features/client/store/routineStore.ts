import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Routine, DayOfWeek, Exercise, MuscleGroup } from '@/types'
import { fetchApi } from '@/lib/api'
import type { ResponseDTO, WorkoutDTO, WorkoutExerciseListItemDTO, PaginatedResult } from '@/types'
import { mockRoutines } from '@/data/routines'

const DAY_LABELS: Record<DayOfWeek, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

const ALL_DAYS: DayOfWeek[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

interface RoutineStore {
  routines: Routine[]
  currentRoutine: Routine | null
  currentRoutineId?: string
  selectedDay: DayOfWeek
  isLoading: boolean
  error: string | null
  loadRoutines: () => Promise<void>
  setCurrentRoutine: (routine: Routine | null) => void
  setSelectedDay: (day: DayOfWeek) => void
  addRoutine: (routine: Routine) => void
  updateRoutine: (id: string, data: Partial<Routine>) => void
  deleteRoutine: (id: string) => void
  getTodayExercises: () => { exercise: Exercise; dayLabel: string }[]
  getWeeklyProgress: () => { day: string; completed: boolean; total: number }[]
}

function getTodayDay(): DayOfWeek {
  const days: DayOfWeek[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  return days[new Date().getDay()]
}

function mapWorkoutToRoutine(w: WorkoutDTO, exercises: WorkoutExerciseListItemDTO[]): Routine {
  const dayMap = new Map<DayOfWeek, Exercise[]>()

  for (const d of ALL_DAYS) {
    dayMap.set(d, [])
  }

  for (const we of exercises) {
    const day = we.dayOfWeek as DayOfWeek
    if (!dayMap.has(day)) dayMap.set(day, [])
    dayMap.get(day)!.push({
      id: we.exercise.id,
      name: we.exercise.name,
      muscleGroup: (we.exercise.muscleGroup?.toLowerCase() || 'cuerpo-completo') as MuscleGroup,
      description: '',
      sets: we.sets,
      reps: we.reps,
      restSeconds: we.restSeconds,
    })
  }

  const days = ALL_DAYS.map((d) => ({
    dayOfWeek: d,
    label: DAY_LABELS[d],
    exercises: dayMap.get(d) || [],
    isRestDay: (dayMap.get(d) || []).length === 0,
  }))

  return {
    id: w.id,
    name: w.title,
    description: '',
    userId: w.member?.id,
    days,
    createdAt: w.startsAt || new Date().toISOString(),
    updatedAt: w.endsAt || new Date().toISOString(),
    isActive: true,
  }
}

export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set, get) => ({
      routines: [],
      currentRoutine: null,
      selectedDay: getTodayDay(),
      isLoading: false,
      error: null,

      loadRoutines: async () => {
        set({ isLoading: true, error: null })
        try {
          const workoutsRes = await fetchApi<ResponseDTO<PaginatedResult<WorkoutDTO>>>('/api/workouts')
          const workouts = workoutsRes.dto?.data || []

          const routines: Routine[] = []
          for (const w of workouts) {
            try {
              const exRes = await fetchApi<ResponseDTO<PaginatedResult<WorkoutExerciseListItemDTO>>>(
                `/api/workout-exercises/${w.id}`
              )
              const exercises = exRes.dto?.data || []
              routines.push(mapWorkoutToRoutine(w, exercises))
            } catch {
              routines.push(mapWorkoutToRoutine(w, []))
            }
          }

          set({ routines, isLoading: false })

          const state = get()
          if (state.currentRoutineId && routines.length > 0) {
            const saved = routines.find((r) => r.id === state.currentRoutineId)
            if (saved) {
              set({ currentRoutine: saved })
            } else if (!state.currentRoutine) {
              set({ currentRoutine: routines[0] })
            }
          } else if (!state.currentRoutine && routines.length > 0) {
            set({ currentRoutine: routines[0] })
          }
        } catch {
          set({ routines: mockRoutines, isLoading: false })
          const state = get()
          if (!state.currentRoutine && mockRoutines.length > 0) {
            set({ currentRoutine: mockRoutines[0] })
          }
        }
      },

      setCurrentRoutine: (routine) => set({ currentRoutine: routine }),
      setSelectedDay: (day) => set({ selectedDay: day }),
      addRoutine: (routine) => set((state) => ({ routines: [...state.routines, routine] })),
      updateRoutine: (id, data) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
          ),
          currentRoutine:
            state.currentRoutine?.id === id
              ? { ...state.currentRoutine, ...data, updatedAt: new Date().toISOString() }
              : state.currentRoutine,
        })),
      deleteRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
          currentRoutine: state.currentRoutine?.id === id ? null : state.currentRoutine,
        })),
      getTodayExercises: () => {
        const { currentRoutine, selectedDay } = get()
        if (!currentRoutine) return []
        const todayData = currentRoutine.days.find((d) => d.dayOfWeek === selectedDay)
        if (!todayData || todayData.isRestDay) return []
        return todayData.exercises.map((exercise) => ({
          exercise,
          dayLabel: todayData.label,
        }))
      },
      getWeeklyProgress: () => {
        const { currentRoutine } = get()
        if (!currentRoutine) return []
        return currentRoutine.days.map((day) => ({
          day: day.label.slice(0, 3),
          completed: false,
          total: day.exercises.length,
        }))
      },
    }),
    {
      name: 'routine-storage',
      partialize: (state) => ({
        currentRoutineId: state.currentRoutine?.id,
      }),
    }
  )
)
