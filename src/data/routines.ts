import type { Routine, ProgressEntry } from "@/types"
import { mockExercises } from "./exercises"

const ex = mockExercises

export const mockRoutines: Routine[] = [
  {
    id: "routine-001",
    name: "Fuerza Total — Semana A",
    description: "Rutina de fuerza enfocada en movimientos compuestos con progresión de carga.",
    userId: "client-001",
    isActive: true,
    createdAt: "2025-04-01",
    updatedAt: "2025-05-10",
    days: [
      {
        dayOfWeek: "lunes",
        label: "Piernas",
        isRestDay: false,
        // Sentadilla, Hip Thrust, Zancadas
        exercises: [ex[1], ex[6], ex[11]],
      },
      {
        dayOfWeek: "martes",
        label: "Pecho y Espalda",
        isRestDay: false,
        // Press de Banca, Peso Muerto, Remo con Barra
        exercises: [ex[0], ex[2], ex[8]],
      },
      {
        dayOfWeek: "miercoles",
        label: "Descanso",
        isRestDay: true,
        exercises: [],
      },
      {
        dayOfWeek: "jueves",
        label: "Hombros y Bíceps",
        isRestDay: false,
        // Press Militar, Elevaciones Laterales, Curl de Bíceps
        exercises: [ex[3], ex[9], ex[4]],
      },
      {
        dayOfWeek: "viernes",
        label: "Tríceps y Abdomen",
        isRestDay: false,
        // Fondos en Paralelas, Extensión de Tríceps, Plancha
        exercises: [ex[5], ex[10], ex[7]],
      },
      {
        dayOfWeek: "sabado",
        label: "Full Body",
        isRestDay: false,
        // Press de Banca, Sentadilla, Press Militar, Peso Muerto
        exercises: [ex[0], ex[1], ex[3], ex[2]],
      },
      {
        dayOfWeek: "domingo",
        label: "Descanso",
        isRestDay: true,
        exercises: [],
      },
    ],
  },
]

export const mockProgress: ProgressEntry[] = [
  { id: "p-1", userId: "client-001", date: "2025-01-15", weight: 82.5, bodyFat: 22, measurements: { chest: 102, waist: 88, hips: 100, arms: 34, legs: 58 } },
  { id: "p-2", userId: "client-001", date: "2025-02-15", weight: 81.0, bodyFat: 21, measurements: { chest: 103, waist: 86, hips: 99, arms: 34.5, legs: 58 } },
  { id: "p-3", userId: "client-001", date: "2025-03-15", weight: 79.5, bodyFat: 19.5, measurements: { chest: 103, waist: 84, hips: 98, arms: 35, legs: 59 } },
  { id: "p-4", userId: "client-001", date: "2025-04-15", weight: 78.0, bodyFat: 18, measurements: { chest: 104, waist: 82, hips: 97, arms: 35.5, legs: 59 } },
  { id: "p-5", userId: "client-001", date: "2025-05-10", weight: 77.0, bodyFat: 17, measurements: { chest: 105, waist: 80, hips: 96, arms: 36, legs: 60 } },
]
