import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NutritionPlanDTO, ResponseDTO } from '@/types'
import { getMyNutritionPlan } from '@/lib/api'

const MOCK_PLAN: NutritionPlanDTO = {
  id: 'mock-1',
  memberId: 'mock',
  memberName: 'Cliente',
  name: 'Volumen Limpio',
  targetCalories: 2400,
  targetProtein: 160,
  targetCarbs: 250,
  targetFats: 80,
  notes: 'Prioriza el descanso hoy. Consume tus carbohidratos antes y después del entreno para maximizar la recuperación.',
  meals: [
    {
      id: 'm1',
      name: 'Desayuno',
      time: '07:30',
      foods: [
        { id: 'f1', name: 'Avena con proteína y plátano', quantity: '1 taza', calories: 380, protein: 30, carbs: 50, fats: 8 },
        { id: 'f2', name: 'Café negro', quantity: '1 taza', calories: 5, protein: 0, carbs: 1, fats: 0 },
      ],
      calories: 450,
      protein: 35,
      carbs: 55,
      fats: 10,
    },
    {
      id: 'm2',
      name: 'Snack AM',
      time: '11:00',
      foods: [
        { id: 'f3', name: 'Yogurt griego', quantity: '200g', calories: 130, protein: 15, carbs: 8, fats: 5 },
        { id: 'f4', name: 'Almendras', quantity: '30g', calories: 120, protein: 5, carbs: 7, fats: 7 },
      ],
      calories: 250,
      protein: 20,
      carbs: 15,
      fats: 12,
    },
    {
      id: 'm3',
      name: 'Comida',
      time: '14:30',
      foods: [
        { id: 'f5', name: 'Pechuga de pollo a la plancha', quantity: '200g', calories: 330, protein: 50, carbs: 0, fats: 7 },
        { id: 'f6', name: 'Arroz integral', quantity: '1.5 tazas', calories: 210, protein: 5, carbs: 45, fats: 2 },
        { id: 'f7', name: 'Brócoli', quantity: '1 taza', calories: 55, protein: 4, carbs: 11, fats: 1 },
      ],
      calories: 650,
      protein: 55,
      carbs: 70,
      fats: 15,
    },
    {
      id: 'm4',
      name: 'Cena',
      time: '20:00',
      foods: [
        { id: 'f8', name: 'Salmón al horno', quantity: '180g', calories: 350, protein: 38, carbs: 0, fats: 12 },
        { id: 'f9', name: 'Batata', quantity: '150g', calories: 130, protein: 2, carbs: 30, fats: 0 },
        { id: 'f10', name: 'Ensalada verde', quantity: '1 taza', calories: 20, protein: 0, carbs: 4, fats: 0 },
      ],
      calories: 500,
      protein: 40,
      carbs: 45,
      fats: 18,
    },
  ],
}

interface NutritionState {
  plan: NutritionPlanDTO | null
  mealCompletion: Record<string, boolean>
  waterGlasses: number
  isLoading: boolean
  error: string | null
  loadPlan: () => Promise<void>
  toggleMeal: (mealId: string) => void
  setWaterGlasses: (glasses: number) => void
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      plan: null,
      mealCompletion: {},
      waterGlasses: 4,
      isLoading: false,
      error: null,

      loadPlan: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await getMyNutritionPlan()
          const plan = response.dto || null
          if (plan) {
            set({ plan, isLoading: false })
          } else {
            set({ plan: MOCK_PLAN, isLoading: false })
          }
        } catch {
          set({ plan: MOCK_PLAN, isLoading: false, error: null })
        }
      },

      toggleMeal: (mealId: string) => {
        set((state) => ({
          mealCompletion: {
            ...state.mealCompletion,
            [mealId]: !state.mealCompletion[mealId],
          },
        }))
      },

      setWaterGlasses: (glasses: number) => {
        set({ waterGlasses: glasses })
      },
    }),
    {
      name: 'nutrition-storage',
      partialize: (state) => ({
        mealCompletion: state.mealCompletion,
        waterGlasses: state.waterGlasses,
      }),
    }
  )
)
