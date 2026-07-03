import { create } from 'zustand'
import { getSaasPlans, getTenants, getTenantsSummary } from '@/lib/api'
import type { SaasPlanDTO, TenantDTO, TenantSummaryDTO } from '@/types'

interface GrowthData {
  month: string
  tenants: number
}

interface PlanDistribution {
  name: string
  value: number
  color: string
}

interface DashboardMetrics {
  totalGyms: number
  activeGyms: number
  totalMembers: number
  mrr: number
  retentionRate: number
  activeGymsChange: string
  totalMembersChange: string
  mrrChange: string
  retentionChange: string
}

interface PlatformDashboardStore {
  metrics: DashboardMetrics | null
  recentTenants: TenantDTO[]
  growthData: GrowthData[]
  planDistribution: PlanDistribution[]
  isLoading: boolean
  error: string | null
  loadDashboard: () => Promise<void>
}

const MONTH_NAMES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

const PLAN_COLORS = [
  'var(--info)',
  'var(--accent)',
  'var(--warning)',
  'var(--success)',
  'var(--danger)',
  'var(--detail)',
]

function calculateGrowthData(tenants: TenantDTO[]): GrowthData[] {
  const monthlyCounts: Record<string, number> = {}

  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    monthlyCounts[key] = 0
  }

  tenants.forEach((t) => {
    const d = new Date(t.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (monthlyCounts[key] !== undefined) {
      monthlyCounts[key]++
    }
  })

  let cumulative = 0
  return Object.entries(monthlyCounts).map(([key, count]) => {
    cumulative += count
    const [, month] = key.split('-')
    return {
      month: MONTH_NAMES[parseInt(month, 10)],
      tenants: cumulative,
    }
  })
}

function getMemberUsageChange(summary: TenantSummaryDTO): string {
  if (summary.totalMemberLimit === -1) return 'Sin límite'
  if (summary.totalMemberLimit === 0) return '0% usado'

  return `${Math.round((summary.totalMemberCount / summary.totalMemberLimit) * 100)}% usado`
}

function calculateMetrics(summary: TenantSummaryDTO): DashboardMetrics {
  return {
    totalGyms: summary.tenantCount,
    activeGyms: summary.activeTenantCount,
    totalMembers: summary.totalMemberCount,
    mrr: summary.mrr,
    retentionRate: summary.retentionRate,
    activeGymsChange: `${summary.activeTenantCount}/${summary.tenantCount}`,
    totalMembersChange: getMemberUsageChange(summary),
    mrrChange: 'Actual',
    retentionChange: `${summary.trialTenantCount} trial`,
  }
}

function calculatePlanDistribution(tenants: TenantDTO[], plans: SaasPlanDTO[]): PlanDistribution[] {
  const counts = tenants.reduce<Record<string, number>>((acc, tenant) => {
    const key = tenant.planId || 'NO_PLAN'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([planId, value], index) => {
    const plan = plans.find((p) => p.id === planId)
    return {
      name: plan?.name || 'Sin plan',
      value,
      color: PLAN_COLORS[index % PLAN_COLORS.length],
    }
  })
}

export const usePlatformDashboardStore = create<PlatformDashboardStore>()((set) => ({
  metrics: null,
  recentTenants: [],
  growthData: [],
  planDistribution: [],
  isLoading: false,
  error: null,

  loadDashboard: async () => {
    set({ isLoading: true, error: null })

    try {
      const [tenantsResponse, summaryResponse, plansResponse] = await Promise.all([
        getTenants(),
        getTenantsSummary(),
        getSaasPlans(),
      ])
      const tenants = tenantsResponse?.lista || []
      const summary = summaryResponse?.dto
      const plans = plansResponse?.lista || []

      if (!summary) {
        throw new Error('No se recibió el resumen de tenants')
      }

      const sorted = [...tenants].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      set({
        metrics: calculateMetrics(summary),
        recentTenants: sorted.slice(0, 5),
        growthData: calculateGrowthData(tenants),
        planDistribution: calculatePlanDistribution(tenants, plans),
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar dashboard'
      set({ error: message, isLoading: false })
    }
  },
}))
