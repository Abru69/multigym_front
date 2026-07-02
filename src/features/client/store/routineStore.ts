import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Routine, DayOfWeek } from '@/types'
import { mockRoutines } from '@/data/routines'

interface RoutineStore {
  routines: Routine[]
  currentRoutine: Routine | null
  selectedDay: DayOfWeek
  isLoading: boolean
  error: string | null
  loadRoutines: () => void
  setCurrentRoutine: (routine: Routine | null) => void
  setSelectedDay: (day: DayOfWeek) => void
  addRoutine: (routine: Routine) => void
  updateRoutine: (id: string, data: Partial<Routine>) => void
  deleteRoutine: (id: string) => void
  getTodayExercises: () => { exercise: Routine['days'][0]['exercises'][0]; dayLabel: string }[]
  getWeeklyProgress: () => { day: string; completed: boolean; total: number }[]
}

function getTodayDay(): DayOfWeek {
  const days: DayOfWeek[] = [
    'domingo',
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
  ]
  return days[new Date().getDay()]
}

export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set, get) => ({
      routines: [],
      currentRoutine: null,
      selectedDay: getTodayDay(),
      isLoading: false,
      error: null,

      loadRoutines: () => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Replace with API call
          // const response = await fetchApi<ResponseDTO<Routine>>('/api/tenant/routines')
          set({
            routines: mockRoutines,
            currentRoutine: mockRoutines[0] ?? null,
            isLoading: false,
          })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Error loading routines',
            isLoading: false,
          })
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
          completed: false, // TODO: Track from API
          total: day.exercises.length,
        }))
      },
    }),
    {
      name: 'routine-storage',
      partialize: (state) => ({
        selectedDay: state.selectedDay,
        currentRoutineId: state.currentRoutine?.id,
      }),
    }
  )
)
