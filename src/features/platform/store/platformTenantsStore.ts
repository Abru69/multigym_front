import { create } from 'zustand'
import {
  getTenants,
  getSaasPlans,
  createTenant as apiCreateTenant,
  deleteTenant as apiDeleteTenant,
  toggleTenantStatus as apiToggleTenantStatus,
} from '@/lib/api'
import type { TenantDTO, SaasPlanDTO, TenantRequestDTO } from '@/types'

interface PlatformTenantsStore {
  tenants: TenantDTO[]
  plans: SaasPlanDTO[]
  isLoading: boolean
  error: string | null
  loadTenants: () => Promise<void>
  loadPlans: () => Promise<void>
  createTenant: (data: TenantRequestDTO) => Promise<boolean>
  toggleStatus: (tenantId: string) => Promise<boolean>
  deleteTenant: (tenantId: string) => Promise<boolean>
  getPlanName: (planId: string | null) => string
  getMemberLimit: (planId: string | null) => string
}

export const usePlatformTenantsStore = create<PlatformTenantsStore>()((set, get) => ({
  tenants: [],
  plans: [],
  isLoading: false,
  error: null,

  loadTenants: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await getTenants()
      set({ tenants: response?.lista || [], isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar gimnasios'
      set({ error: message, isLoading: false })
    }
  },

  loadPlans: async () => {
    try {
      const response = await getSaasPlans()
      set({ plans: response?.lista || [] })
    } catch (err) {
      console.error('Error loading SaaS plans:', err)
    }
  },

  createTenant: async (data) => {
    try {
      await apiCreateTenant(data)
      await get().loadTenants()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear gimnasio'
      set({ error: message })
      return false
    }
  },

  toggleStatus: async (tenantId) => {
    try {
      await apiToggleTenantStatus(tenantId)
      await get().loadTenants()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado'
      set({ error: message })
      return false
    }
  },

  deleteTenant: async (tenantId) => {
    try {
      await apiDeleteTenant(tenantId)
      await get().loadTenants()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar gimnasio'
      set({ error: message })
      return false
    }
  },

  getPlanName: (planId) => {
    if (!planId) return 'Sin plan'
    const plan = get().plans.find((p) => p.id === planId)
    return plan?.name || 'Desconocido'
  },

  getMemberLimit: (planId) => {
    if (!planId) return '-'
    const plan = get().plans.find((p) => p.id === planId)
    if (!plan) return '-'
    return plan.memberLimit === -1 ? '∞' : plan.memberLimit.toLocaleString()
  },
}))
