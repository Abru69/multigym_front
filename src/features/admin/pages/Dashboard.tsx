import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, ShoppingBag, Dumbbell, ArrowUpRight, Zap, Activity, Package } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { fetchApi } from '@/lib/api'
import type { ResponseDTO, UserDTO, WorkoutDTO, OrderDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
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

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      })
      const monthlySalesTotal = monthlyOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)

      const salesData = generateSalesData(orders)
      const recentActivity = generateRecentActivity(users, workouts, orders)

      setData({
        activeClients,
        monthlySales: `$${monthlySalesTotal.toLocaleString('es-MX')}`,
        totalWorkouts,
        clientsWithoutWorkout,
        activeClientsChange: '+12%',
        monthlySalesChange: '+8%',
        totalWorkoutsChange: '+5%',
        clientsWithoutWorkoutChange: clientsWithoutWorkout > 0 ? `-${clientsWithoutWorkout}` : '0',
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
          <p className="mb-4 text-[var(--error)]">{error || 'No se pudo cargar el dashboard'}</p>
          <button
            onClick={loadDashboard}
            className="glass-btn-primary rounded-2xl px-4 py-2 text-sm font-semibold"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Clientes Activos',
      value: data.activeClients.toString(),
      change: data.activeClientsChange,
      icon: Users,
      color: 'var(--accent)',
      href: '/admin/usuarios',
    },
    {
      label: 'Ventas del Mes',
      value: data.monthlySales,
      change: data.monthlySalesChange,
      icon: ShoppingBag,
      color: 'var(--success)',
      href: '/admin/inventario',
    },
    {
      label: 'Rutinas Creadas',
      value: data.totalWorkouts.toString(),
      change: data.totalWorkoutsChange,
      icon: Dumbbell,
      color: 'var(--warning)',
      href: '/admin/ejercicios',
    },
    {
      label: 'Sin Rutina Activa',
      value: data.clientsWithoutWorkout.toString(),
      change: data.clientsWithoutWorkoutChange,
      icon: Zap,
      color: 'var(--error)',
      href: '/admin/usuarios',
    },
  ]

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Dashboard"
        subtitle="Resumen general y control operativo"
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/admin/usuarios')}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--accent)] backdrop-blur-xl transition-all hover:bg-[var(--accent)]/20"
            >
              <Users size={14} /> Nuevo Cliente
            </button>
            <button
              onClick={() => navigate('/admin/ejercicios?tab=routines')}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--warning)] backdrop-blur-xl transition-all hover:bg-[var(--warning)]/20"
            >
              <Dumbbell size={14} /> Crear Rutina
            </button>
            <button
              onClick={() => navigate('/admin/inventario')}
              className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
            >
              <Package size={14} /> Agregar Producto
            </button>
          </div>
        }
      />

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            onClick={() => navigate(s.href)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all hover:border-[var(--accent)]/30 hover:shadow-[0_0_32px_rgba(66,204,99,0.08)]"
          >
            <div className="absolute -top-8 -right-8 opacity-5 transition-transform group-hover:scale-110">
              <s.icon size={100} style={{ color: s.color }} />
            </div>
            <div className="relative flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl"
                style={{ color: s.color }}
              >
                <s.icon size={24} />
              </div>
              <span className="glass-badge inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
                {s.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="relative mt-4">
              <p className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
                {s.value}
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Ingresos Mensuales
            </h3>
            <Activity size={18} className="text-[var(--accent)]" aria-hidden="true" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 'bold',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: 'var(--accent)' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()} MXN`, 'Ventas']}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="url(#accentGradient)"
                  strokeWidth={4}
                  dot={{
                    fill: 'rgba(255,255,255,0.04)',
                    stroke: 'var(--accent)',
                    strokeWidth: 3,
                    r: 6,
                  }}
                  activeDot={{
                    r: 8,
                    fill: 'var(--accent)',
                    stroke: 'rgba(255,255,255,0.1)',
                    strokeWidth: 2,
                  }}
                />
                <defs>
                  <linearGradient id="accentGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="var(--detail)" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl"
        >
          <h3 className="mb-6 text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Actividad en Vivo
          </h3>
          <div className="space-y-0">
            {data.recentActivity.map((a, i) => {
              const dotColor =
                a.type === 'shop'
                  ? 'var(--success)'
                  : a.type === 'user'
                    ? 'var(--warning)'
                    : 'var(--accent)'
              return (
                <div key={`${a.text}-${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        background: dotColor,
                        boxShadow: `0 0 10px ${dotColor}80`,
                      }}
                    />
                    {i < data.recentActivity.length - 1 && (
                      <div className="w-px flex-1 bg-white/[0.06]" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{a.text}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{a.time}</p>
                  </div>
                </div>
              )
            })}
            {data.recentActivity.length === 0 && (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                No hay actividad reciente.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function generateSalesData(orders: OrderDTO[]): Array<{ month: string; ventas: number }> {
  const months = [
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
  const now = new Date()
  const salesByMonth: Record<string, number> = {}

  months.forEach((m) => {
    salesByMonth[m] = 0
  })

  orders.forEach((order) => {
    const date = new Date(order.createdAt || order.paymentDate || '')
    const monthIndex = date.getMonth()
    if (monthIndex >= 0 && monthIndex < 12) {
      salesByMonth[months[monthIndex]] += Number(order.total) || 0
    }
  })

  return months.map((month) => ({
    month,
    ventas: salesByMonth[month] || 0,
  }))
}

function generateRecentActivity(
  users: UserDTO[],
  workouts: WorkoutDTO[],
  orders: OrderDTO[]
): Array<{ text: string; time: string; type: string }> {
  const activities: Array<{ text: string; time: string; type: string }> = []

  const recentUsers = users
    .slice(-3)
    .reverse()
    .map((u) => ({
      text: `Nuevo usuario registrado: ${u.memberDTO?.name || u.email}`,
      time: 'Reciente',
      type: 'user',
    }))

  const recentWorkouts = workouts
    .slice(-3)
    .reverse()
    .map((w) => ({
      text: `Rutina creada: ${w.title}`,
      time: 'Reciente',
      type: 'routine',
    }))

  const recentOrders = orders
    .slice(-3)
    .reverse()
    .map((o) => ({
      text: `Orden procesada: $${Number(o.total).toLocaleString('es-MX')}`,
      time: 'Reciente',
      type: 'shop',
    }))

  activities.push(...recentUsers, ...recentWorkouts, ...recentOrders)

  return activities.slice(0, 8)
}
