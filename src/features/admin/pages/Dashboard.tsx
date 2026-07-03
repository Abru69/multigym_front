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
import type { ResponseDTO, DashboardDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { LoadingState } from '../components/LoadingState'
import { Spinner } from '@/components/ui/Spinner'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await fetchApi<ResponseDTO<DashboardDTO>>('/api/tenant/dashboard')
      if (response && response.dto) {
        response.dto.salesData = response.dto.salesData.reverse()
        setData(response.dto)
      }
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
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition-all hover:brightness-110"
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
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
            >
              <Users size={14} /> Nuevo Cliente
            </button>
            <button
              onClick={() => navigate('/admin/ejercicios?tab=routines')}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--warning)] transition-colors hover:bg-[var(--warning)]/20"
            >
              <Dumbbell size={14} /> Crear Rutina
            </button>
            <button
              onClick={() => navigate('/admin/inventario')}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg transition-all hover:brightness-110"
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
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--accent)]/30 hover:shadow-[var(--accent)]/5 hover:shadow-lg"
          >
            <div className="absolute -top-8 -right-8 opacity-5 transition-transform group-hover:scale-110">
              <s.icon size={100} style={{ color: s.color }} />
            </div>
            <div className="relative flex items-start justify-between">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `${s.color}15`, color: s.color }}
              >
                <s.icon size={24} />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
                {s.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="relative mt-4">
              <p className="text-3xl font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{s.label}</p>
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
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Ingresos Mensuales</h3>
            <Activity size={18} className="text-[var(--text-muted)]" aria-hidden="true" />
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
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 'bold',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  itemStyle={{ color: 'var(--accent)' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()} MXN`, 'Ventas']}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="var(--accent)"
                  strokeWidth={4}
                  dot={{ fill: 'var(--surface)', stroke: 'var(--accent)', strokeWidth: 3, r: 6 }}
                  activeDot={{
                    r: 8,
                    fill: 'var(--accent)',
                    stroke: 'var(--surface)',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <h3 className="mb-6 text-lg font-semibold text-[var(--text-primary)]">
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
                      <div className="w-px flex-1 bg-[var(--border)]" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-[var(--text-primary)]">{a.text}</p>
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
