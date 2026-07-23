import { create } from 'zustand'
import {
  getTenants,
  getTenantsSummary,
  getSaasPlans,
  getTenantBillingSummaries,
  getPlatformMercadoPagoStatus,
} from '@/lib/api'
import type {
  TenantDTO,
  SaasPlanDTO,
  TenantBillingSummaryDTO,
  PlatformMercadoPagoStatusDTO,
} from '@/types'

interface BillingMetrics {
  mrr: number
  arr: number
  totalRevenue: number
  totalPayments: number
  activeTenants: number
  totalTenants: number
}

interface PlanWithTenants {
  plan: SaasPlanDTO
  tenantCount: number
}

interface PlatformBillingStore {
  metrics: BillingMetrics | null
  plans: PlanWithTenants[]
  billingSummaries: TenantBillingSummaryDTO[]
  tenants: TenantDTO[]
  mercadoPagoStatus: PlatformMercadoPagoStatusDTO | null
  isLoading: boolean
  error: string | null
  loadBillingData: () => Promise<void>
}

export const usePlatformBillingStore = create<PlatformBillingStore>()((set) => ({
  metrics: null,
  plans: [],
  billingSummaries: [],
  tenants: [],
  mercadoPagoStatus: null,
  isLoading: false,
  error: null,

  loadBillingData: async () => {
    set({ isLoading: true, error: null })
    try {
      const [tenantsRes, summaryRes, plansRes, billingRes, mercadoPagoRes] = await Promise.all([
        getTenants(),
        getTenantsSummary(),
        getSaasPlans(),
        getTenantBillingSummaries(),
        getPlatformMercadoPagoStatus(),
      ])

      const tenants = tenantsRes?.dto?.data || []
      const summary = summaryRes?.dto
      const saasPlans = plansRes?.dto?.data || []
      const billingSummaries = billingRes?.lista || []

      const tenantCounts = tenants.reduce<Record<string, number>>((acc, t) => {
        if (t.planId) acc[t.planId] = (acc[t.planId] || 0) + 1
        return acc
      }, {})

      const plansWithTenants: PlanWithTenants[] = saasPlans.map((plan) => ({
        plan,
        tenantCount: tenantCounts[plan.id] || 0,
      }))

      const totalRevenue = billingSummaries.reduce(
        (sum, s) => sum + (s.totalPaid || 0),
        0
      )
      const totalPayments = billingSummaries.reduce(
        (sum, s) => sum + (s.paymentCount || 0),
        0
      )
      const mrr = summary?.mrr || 0

      const metrics: BillingMetrics = {
        mrr,
        arr: mrr * 12,
        totalRevenue,
        totalPayments,
        activeTenants: summary?.activeTenantCount || 0,
        totalTenants: summary?.tenantCount || 0,
      }

      set({
        metrics,
        plans: plansWithTenants,
        billingSummaries,
        tenants,
        mercadoPagoStatus: mercadoPagoRes.dto || null,
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos de billing'
      set({ error: message, isLoading: false })
    }
  },
}))
