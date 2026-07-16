import { useState, useEffect } from 'react'
import { getTenantsHealth, getPlatformDashboardReport } from '@/lib/api'
import {
  HeartPulse,
  Building2,
  Users,
  DollarSign,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TenantHealthDTO, PlatformDashboardDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { LoadingState } from '@/features/admin/components/LoadingState'

export default function PlatformReportsPage() {
  const [dashboard, setDashboard] = useState<PlatformDashboardDTO | null>(null)
  const [health, setHealth] = useState<TenantHealthDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const [dashRes, healthRes] = await Promise.all([
          getPlatformDashboardReport(),
          getTenantsHealth(),
        ])
        setDashboard(dashRes.dto || null)
        setHealth(healthRes.dto || [])
      } catch {
        // Will show empty state
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) return <LoadingState text="Cargando reportes de plataforma..." />

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <HeartPulse size={24} style={{ color: '#ef4444' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reportes de Plataforma</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Salud y métricas globales de la plataforma</p>
        </div>
      </div>

      {dashboard && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--card)] rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
                  <Building2 size={20} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Tenants</p>
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>{dashboard.totalTenants}</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card)] rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                  <CheckCircle size={20} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Activos</p>
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>{dashboard.activeTenants}</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card)] rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(168,85,247,0.1)' }}>
                  <Users size={20} style={{ color: '#a855f7' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Miembros</p>
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>{dashboard.totalMembers}</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card)] rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                  <DollarSign size={20} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>MRR Total</p>
                  <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>{formatCurrency(dashboard.totalMRR)}</p>
                </div>
              </div>
            </div>
          </div>

          {dashboard.monthlyTrend.length > 0 && (
            <div className="bg-[var(--card)] rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Tendencia Mensual</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboard.monthlyTrend}>
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 13 }} formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ingresos']} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tenant Health */}
      <div className="bg-[var(--card)] rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Salud de Tenants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Miembros</th>
                <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Trial</th>
              </tr>
            </thead>
            <tbody>
              {health.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                health.map((t) => (
                  <tr key={t.tenantId} className="transition-colors hover:bg-[var(--surface)]" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                          <Building2 size={14} />
                        </div>
                        <span className="text-sm font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: t.status === 'ACTIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: t.status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {t.status === 'ACTIVE' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {t.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">{t.memberCount}</td>
                    <td className="px-6 py-3">
                      {t.isTrial ? (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                          Trial
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
