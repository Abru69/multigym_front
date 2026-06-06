import { create } from "zustand"
import type { Routine, DayOfWeek } from "@/types"
import { mockRoutines } from "@/data/routines"

interface RoutineStore {
  routines: Routine[]
  currentRoutine: Routine | null
  selectedDay: DayOfWeek
  loadRoutines: () => void
  setCurrentRoutine: (routine: Routine) => void
  setSelectedDay: (day: DayOfWeek) => void
  addRoutine: (routine: Routine) => void
  updateRoutine: (id: string, data: Partial<Routine>) => void
  deleteRoutine: (id: string) => void
}

function getTodayDay(): DayOfWeek {
  const days: DayOfWeek[] = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
  return days[new Date().getDay()]
}

export const useRoutineStore = create<RoutineStore>((set) => ({
  routines: [],
  currentRoutine: null,
  selectedDay: getTodayDay(),

  loadRoutines: () => {
    set({ routines: mockRoutines, currentRoutine: mockRoutines[0] ?? null })
  },

  setCurrentRoutine: (routine) => set({ currentRoutine: routine }),
  setSelectedDay: (day) => set({ selectedDay: day }),

  addRoutine: (routine) =>
    set((state) => ({ routines: [...state.routines, routine] })),

  updateRoutine: (id, data) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      ),
    })),

  deleteRoutine: (id) =>
    set((state) => ({
      routines: state.routines.filter((r) => r.id !== id),
    })),
}))
