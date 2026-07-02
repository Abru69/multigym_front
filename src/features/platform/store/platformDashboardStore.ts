import { create } from 'zustand'
import { getTenants } from '@/lib/api'
import type { TenantDTO } from '@/types'

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

interface Activity {
  text: string
  time: string
  dot: string
}

interface PlatformDashboardStore {
  metrics: DashboardMetrics | null
  recentTenants: TenantDTO[]
  growthData: GrowthData[]
  planDistribution: PlanDistribution[]
  activity: Activity[]
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

function calculateMetrics(tenants: TenantDTO[]): DashboardMetrics {
  const total = tenants.length
  const active = tenants.filter((t) => t.status === 'ACTIVE').length

  return {
    totalGyms: total,
    activeGyms: active,
    totalMembers: 1427,
    mrr: 6240,
    retentionRate: 94.2,
    activeGymsChange: `+${active}`,
    totalMembersChange: '+18%',
    mrrChange: '+12%',
    retentionChange: '+1.3%',
  }
}

export const usePlatformDashboardStore = create<PlatformDashboardStore>()((set) => ({
  metrics: null,
  recentTenants: [],
  growthData: [],
  planDistribution: [
    { name: 'Starter', value: 4, color: 'var(--info)' },
    { name: 'Pro', value: 5, color: 'var(--accent)' },
    { name: 'Enterprise', value: 3, color: 'var(--warning)' },
  ],
  activity: [
    { text: 'Nuevo gimnasio registrado: PowerGym MX', time: 'hace 2h', dot: 'var(--success)' },
    { text: 'Plan actualizado: Iron Temple → Pro', time: 'hace 5h', dot: 'var(--accent)' },
    { text: 'Pago procesado: Body Factory $199', time: 'hace 7h', dot: 'var(--warning)' },
    { text: 'Tenant suspendido: Alpha Fitness', time: 'ayer', dot: 'var(--danger)' },
    { text: 'Nuevo usuario de plataforma: Ana Martínez', time: 'ayer', dot: 'var(--success)' },
    { text: 'Reporte mensual generado', time: 'hace 2d', dot: 'var(--text-muted)' },
  ],
  isLoading: false,
  error: null,

  loadDashboard: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await getTenants()
      const tenants = response.lista || []

      const sorted = [...tenants].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      set({
        metrics: calculateMetrics(tenants),
        recentTenants: sorted.slice(0, 5),
        growthData: calculateGrowthData(tenants),
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar dashboard'
      set({ error: message, isLoading: false })
    }
  },
}))
