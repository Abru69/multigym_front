import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  DollarSign,
  Dumbbell,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  Package,
  Calendar,
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
import { fetchApi } from '@/lib/api'
import type { ResponseDTO, UserDTO, WorkoutDTO, OrderDTO } from '@/types'
import { LoadingState } from '../components/LoadingState'

interface DashboardData {
  activeClients: number
  monthlySales: string
  totalWorkouts: number
  clientsWithoutWorkout: number
  activeClientsChange: string
  monthlySalesChange: string
  totalWorkoutsChange: string
  clientsWithoutWorkoutChange: string
  salesData: Array<{ month: string; ventas: number }>
  recentActivity: Array<{ text: string; time: string; type: string }>
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const [usersRes, workoutsRes, ordersRes] = await Promise.all([
        fetchApi<ResponseDTO<{ data: UserDTO[] }>>('/api/tenant/users'),
        fetchApi<ResponseDTO<{ data: WorkoutDTO[] }>>('/api/workouts'),
        fetchApi<ResponseDTO<{ data: OrderDTO[] }>>('/api/orders'),
      ])

      const users = usersRes.dto?.data || []
      const workouts = workoutsRes.dto?.data || []
      const orders = ordersRes.dto?.data || []

      const activeClients = users.filter((u) => u.isActive).length
      const totalWorkouts = workouts.length

      const usersWithWorkout = new Set(
        workouts.filter((w) => w.member?.id).map((w) => w.member!.id)
      )
      const clientsWithoutWorkout = users.filter(
        (u) => u.isActive && !usersWithWorkout.has(u.id)
      ).length

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const monthlyOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt || o.paymentDate || '')
        return (
          orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
        )
      })
      const monthlySalesTotal = monthlyOrders.reduce(
        (sum, o) => sum + (Number(o.total) || 0), 0
      )

      const salesData = generateSalesData(orders)
      const recentActivity = generateRecentActivity(users, workouts, orders)

      setData({
        activeClients,
        monthlySales: `$${monthlySalesTotal.toLocaleString('es-MX')}`,
        totalWorkouts,
        clientsWithoutWorkout,
        activeClientsChange: '+12%',
        monthlySalesChange: '+8%',
        totalWorkoutsChange: '+5',
        clientsWithoutWorkoutChange: clientsWithoutWorkout > 0 ? `${clientsWithoutWorkout}` : '0',
        salesData,
        recentActivity,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas del dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (isLoading) return <LoadingState text="Cargando dashboard..." />
  if (error || !data) {
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

  const clientsWithRoutine = data.activeClients - data.clientsWithoutWorkout
  const coveragePercent =
    data.activeClients > 0
      ? Math.round((clientsWithRoutine / data.activeClients) * 100)
      : 0

  const kpiCards = [
    {
      label: 'Clientes Activos',
      value: data.activeClients.toLocaleString(),
      change: data.activeClientsChange,
      changeLabel: 'este mes',
      changePositive: true,
      icon: Users,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6',
    },
    {
      label: 'Ventas del Mes',
      value: data.monthlySales,
      change: data.monthlySalesChange,
      changeLabel: 'este mes',
      changePositive: true,
      icon: DollarSign,
      iconBg: '#f0fdf4',
      iconColor: '#22c55e',
    },
    {
      label: 'Rutinas Creadas',
      value: data.totalWorkouts.toLocaleString(),
      change: data.totalWorkoutsChange,
      changeLabel: 'esta semana',
      changePositive: true,
      icon: Dumbbell,
      iconBg: '#faf5ff',
      iconColor: '#a855f7',
    },
    {
      label: 'Sin Rutina Activa',
      value: data.clientsWithoutWorkout.toLocaleString(),
      change: data.clientsWithoutWorkoutChange,
      changeLabel: 'requieren atención',
      changePositive: false,
      icon: AlertCircle,
      iconBg: '#fff7ed',
      iconColor: '#f97316',
    },
  ]

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
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: card.changePositive ? '#f0fdf4' : '#fff7ed',
                  color: card.changePositive ? '#16a34a' : '#ea580c',
                }}
              >
                {card.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="mt-4">
              <p
                style={{ fontFamily: 'var(--font-heading)' }}
                className="text-4xl font-black"
              >
                {card.value}
              </p>
              <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* Revenue Chart */}
        <div
          className="bg-[var(--card)] rounded-2xl p-6"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-lg font-bold"
            >
              Ingresos Mensuales
            </h3>
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Calendar size={14} />
              <span>Ene 2026 — Jul 2026</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  }}
                  itemStyle={{ color: 'var(--accent)' }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()} MXN`,
                    'Ventas',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  fill="url(#gradientAccent)"
                  dot={{
                    fill: '#ffffff',
                    stroke: 'var(--accent)',
                    strokeWidth: 3,
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: 'var(--accent)',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="bg-[var(--card)] rounded-2xl p-6"
          style={{ border: '1px solid var(--border)' }}
        >
          <h3
            style={{ fontFamily: 'var(--font-heading)' }}
            className="text-lg font-bold mb-4"
          >
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/usuarios')}
              className="group flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200"
              style={{ border: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#22c55e')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 44, height: 44, backgroundColor: '#f0fdf4' }}
              >
                <Users size={20} style={{ color: '#22c55e' }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Nuevo Cliente
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Registrar usuario
                </p>
              </div>
              <ChevronRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: 'var(--text-muted)' }}
              />
            </button>

            <button
              onClick={() => navigate('/admin/ejercicios?tab=routines')}
              className="group flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200"
              style={{ border: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#a855f7')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 44, height: 44, backgroundColor: '#faf5ff' }}
              >
                <Dumbbell size={20} style={{ color: '#a855f7' }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Crear Rutina
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Diseñar entrenamiento
                </p>
              </div>
              <ChevronRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: 'var(--text-muted)' }}
              />
            </button>

            <button
              onClick={() => navigate('/admin/inventario')}
              className="group flex w-full items-center gap-4 rounded-xl p-4 transition-all duration-200"
              style={{ border: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 44, height: 44, backgroundColor: '#eff6ff' }}
              >
                <Package size={20} style={{ color: '#3b82f6' }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Agregar Producto
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Gestionar inventario
                </p>
              </div>
              <ChevronRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: 'var(--text-muted)' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Activity + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Recent Activity */}
        <div
          className="bg-[var(--card)] rounded-2xl"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <h3
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-lg font-bold"
            >
              Actividad Reciente
            </h3>
            <button
              className="text-sm font-semibold transition-colors duration-200"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Ver todo
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
            {data.recentActivity.map((a, i) => {
              const dotColor =
                a.type === 'shop'
                  ? '#22c55e'
                  : a.type === 'user'
                    ? '#f59e0b'
                    : '#3b82f6'
              return (
                <div
                  key={`${a.text}-${i}`}
                  className="flex items-center gap-3 px-6 py-3.5"
                  style={{ borderBottom: '1px solid #f8fafc' }}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <p
                    className="flex-1 text-sm font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {a.text}
                  </p>
                  <span
                    className="text-xs flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {a.time}
                  </span>
                </div>
              )
            })}
            {data.recentActivity.length === 0 && (
              <p className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No hay actividad reciente.
              </p>
            )}
          </div>
        </div>

        {/* Distribution */}
        <div
          className="bg-[var(--card)] rounded-2xl p-6"
          style={{ border: '1px solid var(--border)' }}
        >
          <h3
            style={{ fontFamily: 'var(--font-heading)' }}
            className="text-lg font-bold mb-5"
          >
            Distribución de Usuarios
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Admins
                </span>
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {data.activeClients > 0 ? Math.max(1, Math.floor(data.activeClients * 0.05)) : 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#3b82f6' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Clientes con rutina
                </span>
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {clientsWithRoutine}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#f97316' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Clientes sin rutina
                </span>
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {data.clientsWithoutWorkout}
              </span>
            </div>

            {/* Progress bar */}
            <div className="pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Cobertura de rutinas
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  {coveragePercent}%
                </span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full"
                style={{ backgroundColor: '#f1f5f9' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${coveragePercent}%`,
                    backgroundColor: 'var(--accent)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateSalesData(orders: OrderDTO[]): Array<{ month: string; ventas: number }> {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ]
  const salesByMonth: Record<string, number> = {}
  months.forEach((m) => { salesByMonth[m] = 0 })

  orders.forEach((order) => {
    const date = new Date(order.createdAt || order.paymentDate || '')
    const monthIndex = date.getMonth()
    if (monthIndex >= 0 && monthIndex < 12) {
      salesByMonth[months[monthIndex]] += Number(order.total) || 0
    }
  })

  return months.map((month) => ({ month, ventas: salesByMonth[month] || 0 }))
}

function generateRecentActivity(
  users: UserDTO[],
  workouts: WorkoutDTO[],
  orders: OrderDTO[]
): Array<{ text: string; time: string; type: string }> {
  const activities: Array<{ text: string; time: string; type: string }> = []

  users.slice(-3).reverse().forEach((u) => {
    activities.push({
      text: `Nuevo usuario registrado: ${u.memberDTO?.name || u.email}`,
      time: 'Reciente',
      type: 'user',
    })
  })

  workouts.slice(-3).reverse().forEach((w) => {
    activities.push({
      text: `Rutina creada: ${w.title}`,
      time: 'Reciente',
      type: 'routine',
    })
  })

  orders.slice(-3).reverse().forEach((o) => {
    activities.push({
      text: `Orden procesada: $${Number(o.total).toLocaleString('es-MX')}`,
      time: 'Reciente',
      type: 'shop',
    })
  })

  return activities.slice(0, 8)
}
