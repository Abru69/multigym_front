import { useState, useEffect } from 'react'
import {
  getTenantDashboardReport,
  getMemberReport,
  getSubscriptionReport,
  getCheckInReport,
  getProductReport,
  getWorkoutReport,
} from '@/lib/api'
import {
  BarChart3,
  Users,
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type {
  TenantDashboardDTO,
  MemberReportDTO,
  SubscriptionReportDTO,
  CheckInReportDTO,
  ProductReportDTO,
  WorkoutReportDTO,
} from '@/types'
import { formatCurrency } from '@/lib/utils'
import { LoadingState } from '../components/LoadingState'

type Tab = 'overview' | 'members' | 'subscriptions' | 'checkins' | 'products' | 'workouts'

const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'overview', label: 'Resumen', icon: BarChart3 },
  { key: 'members', label: 'Miembros', icon: Users },
  { key: 'subscriptions', label: 'Suscripciones', icon: CalendarCheck },
  { key: 'checkins', label: 'Asistencia', icon: ClipboardList },
  { key: 'products', label: 'Productos', icon: Package },
  { key: 'workouts', label: 'Entrenamientos', icon: Dumbbell },
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [dashboard, setDashboard] = useState<TenantDashboardDTO | null>(null)
  const [memberReport, setMemberReport] = useState<MemberReportDTO | null>(null)
  const [subReport, setSubReport] = useState<SubscriptionReportDTO | null>(null)
  const [checkinReport, setCheckinReport] = useState<CheckInReportDTO | null>(null)
  const [productReport, setProductReport] = useState<ProductReportDTO | null>(null)
  const [workoutReport, setWorkoutReport] = useState<WorkoutReportDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true)
        const [dash, mem, sub, ci, prod, wo] = await Promise.all([
          getTenantDashboardReport(),
          getMemberReport(),
          getSubscriptionReport(),
          getCheckInReport(),
          getProductReport(),
          getWorkoutReport(),
        ])
        setDashboard(dash.dto || null)
        setMemberReport(mem.dto || null)
        setSubReport(sub.dto || null)
        setCheckinReport(ci.dto || null)
        setProductReport(prod.dto || null)
        setWorkoutReport(wo.dto || null)
      } catch {
        // Errors will show empty states
      } finally {
        setIsLoading(false)
      }
    }
    loadAll()
  }, [])

  if (isLoading) return <LoadingState text="Cargando reportes..." />

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Reportes
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Análisis completo del rendimiento de tu gimnasio
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === tab.key ? 'var(--accent)' : 'var(--card)',
              color: activeTab === tab.key ? 'var(--accent-text)' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === tab.key ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard
              label="Miembros Totales"
              value={dashboard.totalMembers}
              icon={Users}
              color="#3b82f6"
            />
            <KPICard
              label="Ingresos del Mes"
              value={formatCurrency(dashboard.monthlyRevenue)}
              icon={TrendingUp}
              color="#22c55e"
            />
            <KPICard
              label="Check-ins Hoy"
              value={dashboard.todayCheckIns}
              icon={ClipboardList}
              color="#a855f7"
            />
            <KPICard
              label="Ocupación Actual"
              value={dashboard.currentOccupancy}
              icon={Activity}
              color="var(--warning)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard
              label="Suscripciones Activas"
              value={dashboard.activeSubscriptions}
              icon={CalendarCheck}
              color="#06b6d4"
            />
            <KPICard
              label="Próximas a Vencer"
              value={dashboard.expiringSubscriptions}
              icon={Clock}
              color="var(--error)"
            />
            <KPICard
              label="Productos Activos"
              value={dashboard.activeProducts}
              icon={Package}
              color="#8b5cf6"
            />
            <KPICard
              label="Órdenes Pendientes"
              value={dashboard.pendingOrders}
              icon={ClipboardList}
              color="var(--accent)"
            />
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && memberReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard label="Total" value={memberReport.totalMembers} icon={Users} color="#3b82f6" />
            <KPICard
              label="Activos"
              value={memberReport.activeMembers}
              icon={TrendingUp}
              color="#22c55e"
            />
            <KPICard
              label="Inactivos"
              value={memberReport.inactiveMembers}
              icon={TrendingDown}
              color="var(--error)"
            />
            <KPICard
              label="Nuevos este mes"
              value={memberReport.newThisMonth}
              icon={Users}
              color="#a855f7"
            />
          </div>
          {memberReport.monthlyTrend.length > 0 && (
            <div
              className="rounded-2xl bg-[var(--card)] p-6"
              style={{ border: '1px solid var(--border)' }}
            >
              <h3 className="mb-4 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Tendencia de Miembros
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberReport.monthlyTrend}>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        color: 'var(--text-primary)',
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && subReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard
              label="Activas"
              value={subReport.active}
              icon={CalendarCheck}
              color="#22c55e"
            />
            <KPICard
              label="Canceladas"
              value={subReport.cancelled}
              icon={TrendingDown}
              color="var(--error)"
            />
            <KPICard
              label="Expiradas"
              value={subReport.expired}
              icon={Clock}
              color="var(--warning)"
            />
            <KPICard
              label="MRR"
              value={formatCurrency(subReport.mrr)}
              icon={TrendingUp}
              color="#3b82f6"
            />
          </div>
          {subReport.monthlyTrend.length > 0 && (
            <div
              className="rounded-2xl bg-[var(--card)] p-6"
              style={{ border: '1px solid var(--border)' }}
            >
              <h3 className="mb-4 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Tendencia de Suscripciones
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={subReport.monthlyTrend}>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: 12,
                        fontSize: 13,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--accent)"
                      fill="var(--accent)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check-Ins Tab */}
      {activeTab === 'checkins' && checkinReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard
              label="Hoy"
              value={checkinReport.todayCheckIns}
              icon={ClipboardList}
              color="#3b82f6"
            />
            <KPICard
              label="Esta Semana"
              value={checkinReport.thisWeekCheckIns}
              icon={TrendingUp}
              color="#22c55e"
            />
            <KPICard
              label="Este Mes"
              value={checkinReport.thisMonthCheckIns}
              icon={CalendarCheck}
              color="#a855f7"
            />
            <KPICard
              label="Promedio (min)"
              value={checkinReport.avgDurationMinutes}
              icon={Clock}
              color="var(--warning)"
            />
          </div>
          {checkinReport.dailyTrend.length > 0 && (
            <div
              className="rounded-2xl bg-[var(--card)] p-6"
              style={{ border: '1px solid var(--border)' }}
            >
              <h3 className="mb-4 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Tendencia Diaria
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={checkinReport.dailyTrend}>
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: 12,
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="count" fill="var(--info)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && productReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <KPICard
              label="Total Productos"
              value={productReport.totalProducts}
              icon={Package}
              color="#3b82f6"
            />
            <KPICard
              label="Stock Bajo"
              value={productReport.lowStockProducts}
              icon={TrendingDown}
              color="var(--error)"
            />
            <KPICard
              label="Valor Inventario"
              value={formatCurrency(productReport.totalInventoryValue)}
              icon={TrendingUp}
              color="#22c55e"
            />
          </div>
          {productReport.topByRevenue.length > 0 && (
            <div
              className="rounded-2xl bg-[var(--card)] p-6"
              style={{ border: '1px solid var(--border)' }}
            >
              <h3 className="mb-4 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Top Productos por Ingresos
              </h3>
              <div className="space-y-3">
                {productReport.topByRevenue.map((p, i) => (
                  <div
                    key={`${p.name}-${i}`}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workouts Tab */}
      {activeTab === 'workouts' && workoutReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard
              label="Total Rutinas"
              value={workoutReport.totalWorkouts}
              icon={Dumbbell}
              color="#3b82f6"
            />
            <KPICard
              label="Total Logs"
              value={workoutReport.totalLogs}
              icon={ClipboardList}
              color="#22c55e"
            />
            <KPICard
              label="Calorías Promedio"
              value={workoutReport.avgCaloriesBurned}
              icon={Activity}
              color="var(--warning)"
            />
            <KPICard
              label="Duración Promedio (min)"
              value={workoutReport.avgDurationMinutes}
              icon={Clock}
              color="#a855f7"
            />
          </div>
          {workoutReport.workoutTrend.length > 0 && (
            <div
              className="rounded-2xl bg-[var(--card)] p-6"
              style={{ border: '1px solid var(--border)' }}
            >
              <h3 className="mb-4 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Tendencia de Entrenamientos
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={workoutReport.workoutTrend}>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        borderRadius: 12,
                        fontSize: 13,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--accent)"
                      fill="var(--accent)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function KPICard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: typeof Users
  color: string
}) {
  return (
    <div className="rounded-2xl bg-[var(--card)] p-5" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'var(--surface-hover)' }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {label}
          </p>
          <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}
