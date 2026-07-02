import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { usePlatformDashboardStore } from '@/features/platform/store/platformDashboardStore'
import { LoadingState } from '@/features/admin/components/LoadingState'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const statusColor: Record<string, string> = {
  ACTIVE: 'var(--success)',
  INACTIVE: 'var(--danger)',
}

export default function PlatformDashboard() {
  const {
    metrics,
    recentTenants,
    growthData,
    planDistribution,
    activity,
    isLoading,
    error,
    loadDashboard,
  } = usePlatformDashboardStore()

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (isLoading) return <LoadingState text="Cargando dashboard..." />

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--error)' }}>
          {error}
        </p>
      </div>
    )
  }

  if (!metrics) return null

  const metricCards = [
    {
      label: 'Gymnasios Activos',
      value: metrics.activeGyms.toString(),
      change: metrics.activeGymsChange,
      up: true,
      icon: Building2,
      color: 'var(--accent)',
    },
    {
      label: 'Total Miembros',
      value: metrics.totalMembers.toLocaleString(),
      change: metrics.totalMembersChange,
      up: true,
      icon: Users,
      color: 'var(--success)',
    },
    {
      label: 'MRR',
      value: `$${metrics.mrr.toLocaleString()}`,
      change: metrics.mrrChange,
      up: true,
      icon: DollarSign,
      color: 'var(--warning)',
    },
    {
      label: 'Tasa Retención',
      value: `${metrics.retentionRate}%`,
      change: metrics.retentionChange,
      up: true,
      icon: TrendingUp,
      color: 'var(--info)',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-black"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Vista general de la plataforma MultiGym SaaS
        </p>
      </div>

      {/* Metrics */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metricCards.map((m) => (
          <motion.div
            key={m.label}
            variants={fadeUp}
            className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${m.color}18`, color: m.color }}
              >
                <m.icon size={20} />
              </div>
              <span
                className="flex items-center gap-0.5 text-xs font-bold"
                style={{ color: m.up ? 'var(--success)' : 'var(--danger)' }}
              >
                {m.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {m.change}
              </span>
            </div>
            <p
              className="mb-0.5 text-3xl font-black"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              {m.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {m.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Growth chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 lg:col-span-2"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Crecimiento de la Plataforma
            </h3>
            <Activity size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tenants"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#mrrGrad)"
                  dot={{ fill: 'var(--accent)', r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie - plan distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h3 className="mb-4 font-bold" style={{ color: 'var(--text-primary)' }}>
            Distribución de Planes
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {planDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {planDistribution.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {p.value} gyms
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent tenants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-6 lg:col-span-2"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Gimnasios Recientes
            </h3>
            <a
              href="/platform/tenants"
              className="text-xs font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              Ver todos →
            </a>
          </div>
          <div className="space-y-3">
            {recentTenants.map((t) => (
              <div key={t.tenantId} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
                  {t.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.subdomain} · {new Date(t.createdAt).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: `${statusColor[t.status]}18`,
                    color: statusColor[t.status],
                  }}
                >
                  {t.status}
                </span>
              </div>
            ))}
            {recentTenants.length === 0 && (
              <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                No hay gimnasios registrados
              </p>
            )}
          </div>
        </motion.div>

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h3 className="mb-4 font-bold" style={{ color: 'var(--text-primary)' }}>
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: a.dot }}
                  />
                  {i < activity.length - 1 && (
                    <div className="mt-1 w-px flex-1" style={{ background: 'var(--border)' }} />
                  )}
                </div>
                <div>
                  <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
                    {a.text}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
