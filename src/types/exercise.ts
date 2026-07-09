export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  description: string
  sets: number
  reps: string
  restSeconds: number
  weight?: string
  videoUrl?: string
  imageUrl?: string
  tips?: string[]
}

export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'piernas'
  | 'gluteos'
  | 'abdomen'
  | 'cardio'
  | 'cuerpo-completo'

export interface Routine {
  id: string
  name: string
  description: string
  userId?: string
  days: RoutineDay[]
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface RoutineDay {
  dayOfWeek: DayOfWeek
  label: string
  exercises: Exercise[]
  isRestDay: boolean
}

export type DayOfWeek =
  | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'
  notes?: string
}
