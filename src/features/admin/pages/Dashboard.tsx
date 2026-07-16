import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  DollarSign,
  Dumbbell,
  AlertCircle,
  ChevronRight,
  Package,
  Calendar,
  ClipboardList,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { getTenantDashboardReport, getRevenueReportData } from '@/lib/api'
import type { TenantDashboardDTO, RevenueReportDTO } from '@/types'
import { LoadingState } from '../components/LoadingState'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<TenantDashboardDTO | null>(null)
  const [revenue, setRevenue] = useState<RevenueReportDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const [dashRes, revRes] = await Promise.all([
        getTenantDashboardReport(),
        getRevenueReportData(),
      ])
      setDashboard(dashRes.dto || null)
      setRevenue(revRes.dto || null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas del dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard()
  }, [loadDashboard])

  if (isLoading) return <LoadingState text="Cargando dashboard..." />
  if (error || !dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--error)' }}>{error || 'No se pudo cargar el dashboard'}</p>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const formatCurrency = (v: number) => `$${v.toLocaleString('es-MX')}`

  const kpiCards = [
    {
      label: 'Miembros Activos',
      value: dashboard.activeMembers.toLocaleString(),
      sub: `${dashboard.newMembersThisMonth} nuevos este mes`,
      icon: Users,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
    },
    {
      label: 'Ingresos del Mes',
      value: formatCurrency(dashboard.monthlyRevenue),
      sub: `Total: ${formatCurrency(dashboard.totalRevenue)}`,
      icon: DollarSign,
      iconBg: '#f0fdf4',
      iconColor: '#22c55e',
    },
    {
      label: 'Check-ins Hoy',
      value: dashboard.todayCheckIns.toLocaleString(),
      sub: `Ocupación: ${dashboard.currentOccupancy}`,
      icon: ClipboardList,
      iconBg: '#faf5ff',
      iconColor: '#a855f7',
    },
    {
      label: 'Suscripciones',
      value: dashboard.activeSubscriptions.toLocaleString(),
      sub: `${dashboard.expiringSubscriptions} por vencer`,
      icon: Calendar,
      iconBg: '#fff7ed',
      iconColor: '#f97316',
    },
  ]

  const salesData = revenue
    ? [{ month: `${revenue.month}/${revenue.year}`, ventas: revenue.totalRevenue }]
    : []

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--card)] rounded-2xl p-6 transition-shadow duration-200"
            style={{ border: '1px solid var(--border)' }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div className="flex items-start justify-between">
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 40, height: 40, backgroundColor: card.iconBg }}
              >
                <card.icon size={20} style={{ color: card.iconColor }} />
              </div>
            </div>
            <div className="mt-4">
              <p style={{ fontFamily: 'var(--font-heading)' }} className="text-3xl font-black">
                {card.value}
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {card.label}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {card.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* Revenue Chart */}
        <div className="bg-[var(--card)] rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 style={{ fontFamily: 'var(--font-heading)' }} className="text-lg font-bold">
              Ingresos Mensuales
            </h3>
            <div className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <Calendar size={14} />
              <span>{revenue ? `${revenue.month}/${revenue.year}` : 'Sin datos'}</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData.length > 0 ? salesData : [{ month: 'Sin datos', ventas: 0 }]} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: 'var(--accent)' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()} MXN`, 'Ventas']}
                />
                <Area type="monotone" dataKey="ventas" stroke="var(--accent)" strokeWidth={3} fill="url(#gradientAccent)" dot={{ fill: '#ffffff', stroke: 'var(--accent)', strokeWidth: 3, r: 5 }} activeDot={{ r: 7, fill: 'var(--accent)', stroke: '#ffffff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--card)] rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)' }} className="text-lg font-bold mb-4">
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <QuickAction onClick={() => navigate('/admin/usuarios')} icon={Users} iconBg="#f0fdf4" iconColor="#22c55e" title="Nuevo Cliente" subtitle="Registrar usuario" />
            <QuickAction onClick={() => navigate('/admin/check-ins')} icon={ClipboardList} iconBg="#eff6ff" iconColor="#3b82f6" title="Check-In" subtitle="Registrar asistencia" />
            <QuickAction onClick={() => navigate('/admin/reportes')} icon={Activity} iconBg="#faf5ff" iconColor="#a855f7" title="Reportes" subtitle="Ver analíticas" />
            <QuickAction onClick={() => navigate('/admin/inventario')} icon={Package} iconBg="#fff7ed" iconColor="#f97316" title="Inventario" subtitle="Gestionar productos" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(249,115,22,0.1)' }}>
              <AlertCircle size={20} style={{ color: '#f97316' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Próximas a vencer</p>
              <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>{dashboard.expiringSubscriptions}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(139,92,246,0.1)' }}>
              <Package size={20} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Productos activos</p>
              <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>{dashboard.activeProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(6,182,212,0.1)' }}>
              <Dumbbell size={20} style={{ color: '#06b6d4' }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Órdenes pendientes</p>
              <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>{dashboard.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ onClick, icon: Icon, iconBg, iconColor, title, subtitle }: {
  onClick: () => void
  icon: typeof Users
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200"
      style={{ border: '1px solid var(--border)' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = iconColor)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, backgroundColor: iconBg }}>
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>
      <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
    </button>
  )
}
