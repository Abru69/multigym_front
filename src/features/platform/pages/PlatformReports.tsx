import { useState, useEffect } from 'react'
import { getTenantsHealth } from '@/lib/api'
import {
  HeartPulse,
  Building2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import type { TenantHealthDTO } from '@/types'
import { LoadingState } from '@/features/admin/components/LoadingState'

export default function PlatformReportsPage() {
  const [health, setHealth] = useState<TenantHealthDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const healthRes = await getTenantsHealth()
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
