import { create } from 'zustand'
import { getPlatformSettings, getSaasPlans, updatePlatformSettings } from '@/lib/api'
import type { PlatformSettingDTO, SaasPlanDTO } from '@/types'

interface PlatformSettingsStore {
  settings: PlatformSettingDTO[]
  plans: SaasPlanDTO[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  loadSettings: () => Promise<void>
  saveSettings: (entries: Record<string, string>) => Promise<boolean>
  getValue: (key: string) => string
  getNumber: (key: string, fallback: number) => number
  getBoolean: (key: string) => boolean
}

export const usePlatformSettingsStore = create<PlatformSettingsStore>()((set, get) => ({
  settings: [],
  plans: [],
  isLoading: false,
  isSaving: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const [settingsResponse, plansResponse] = await Promise.all([
        getPlatformSettings(),
        getSaasPlans(),
      ])
      const settings = settingsResponse?.lista || []
      const plans = plansResponse?.dto?.data || []
      set({ settings, plans, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar configuración'
      set({ error: message, isLoading: false })
    }
  },

  saveSettings: async (entries) => {
    set({ isSaving: true, error: null })
    try {
      const response = await updatePlatformSettings(entries)
      const settings = response?.lista || []
      set({ settings, isSaving: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar configuración'
      set({ error: message, isSaving: false })
      return false
    }
  },

  getValue: (key) => {
    const setting = get().settings.find((s) => s.key === key)
    return setting?.value || ''
  },

  getNumber: (key, fallback) => {
    const setting = get().settings.find((s) => s.key === key)
    if (!setting?.value) return fallback
    const num = Number(setting.value)
    return isNaN(num) ? fallback : num
  },

  getBoolean: (key) => {
    const setting = get().settings.find((s) => s.key === key)
    return setting?.value === 'true'
  },
}))
