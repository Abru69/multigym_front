import { motion } from 'framer-motion'
import { Download, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const metrics = [
  {
    label: 'Ingresos del mes',
    value: '$4,820',
    trend: '+18%',
    up: true,
    icon: '💰',
    color: 'var(--success)',
  },
  { label: 'MRR', value: '$6,240', trend: '+9%', up: true, icon: '📅', color: 'var(--accent)' },
  {
    label: 'ARR proyectado',
    value: '$74.8k',
    trend: '+12%',
    up: true,
    icon: '📈',
    color: 'var(--warning)',
  },
  {
    label: 'Pagos fallidos',
    value: '2',
    trend: '-1',
    up: false,
    icon: '⚠️',
    color: 'var(--danger)',
  },
]

const plans = [
  {
    name: 'Starter',
    price: '$29',
    tenants: 4,
    featured: false,
    features: ['Hasta 100 miembros', '1 sede', 'Soporte email', 'Reportes básicos'],
  },
  {
    name: 'Pro',
    price: '$79',
    tenants: 5,
    featured: true,
    features: [
      'Hasta 500 miembros',
      '3 sedes',
      'Soporte prioritario',
      'Reportes avanzados',
      'App móvil',
    ],
  },
  {
    name: 'Enterprise',
    price: '$199',
    tenants: 3,
    featured: false,
    features: [
      'Miembros ilimitados',
      'Sedes ilimitadas',
      'Soporte 24/7',
      'API acceso',
      'SLA 99.9%',
      'Personalización',
    ],
  },
]

const invoices = [
  {
    id: '#INV-2026-042',
    tenant: 'FitZone Elite',
    plan: 'ENTERPRISE',
    amount: '$199.00',
    status: 'PAID',
    date: '01 May 2026',
  },
  {
    id: '#INV-2026-041',
    tenant: 'Body Factory',
    plan: 'ENTERPRISE',
    amount: '$199.00',
    status: 'PAID',
    date: '01 May 2026',
  },
  {
    id: '#INV-2026-040',
    tenant: 'Iron Temple',
    plan: 'PRO',
    amount: '$79.00',
    status: 'PAID',
    date: '01 May 2026',
  },
  {
    id: '#INV-2026-039',
    tenant: 'Zeus Gym',
    plan: 'PRO',
    amount: '$79.00',
    status: 'PENDING',
    date: '01 May 2026',
  },
  {
    id: '#INV-2026-038',
    tenant: 'Alpha Fitness',
    plan: 'STARTER',
    amount: '$29.00',
    status: 'FAILED',
    date: '01 May 2026',
  },
  {
    id: '#INV-2026-037',
    tenant: 'PowerGym MX',
    plan: 'STARTER',
    amount: '$0.00',
    status: 'PENDING',
    date: '15 Abr 2026',
  },
]

const statusConfig: Record<string, any> = {
  PAID: { color: 'var(--success)', icon: CheckCircle, label: 'Pagado' },
  PENDING: { color: 'var(--warning)', icon: Clock, label: 'Pendiente' },
  FAILED: { color: 'var(--danger)', icon: AlertCircle, label: 'Fallido' },
}
const planColors: Record<string, string> = {
  STARTER: 'var(--info)',
  PRO: 'var(--accent)',
  ENTERPRISE: 'var(--warning)',
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }

export default function PlatformBilling() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Facturación & Planes
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Control de ingresos y suscripciones de la plataforma
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
          style={{
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--input-bg)')}
        >
          <Download size={16} /> Exportar
        </button>
      </div>

      {/* Metrics */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="absolute top-0 left-0 h-1 w-full" style={{ background: m.color }} />
            <div className="flex items-center gap-4">
              <div className="text-3xl">{m.icon}</div>
              <div className="flex-1">
                <p
                  className="mb-1 text-2xl leading-none font-black"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                >
                  {m.value}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {m.label}
                  </p>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      background: `${m.up ? 'var(--success)' : 'var(--danger)'}20`,
                      color: m.up ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {m.trend}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Plans */}
      <div>
        <h3
          className="mb-4 text-sm font-bold tracking-wider uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          Planes Disponibles
        </h3>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {plans.map((p, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="relative rounded-2xl p-6 transition-transform hover:-translate-y-1"
              style={{
                background: p.featured ? 'var(--accent-muted)' : 'var(--surface)',
                border: `1px solid ${p.featured ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: p.featured ? 'var(--shadow-glow)' : 'none',
              }}
            >
              {p.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black tracking-wider uppercase"
                  style={{
                    background: 'linear-gradient(90deg, var(--accent), var(--detail))',
                    color: 'var(--text-on-primary)',
                  }}
                >
                  Más Popular
                </div>
              )}
              <h4
                className="text-sm font-bold tracking-wider uppercase"
                style={{ color: 'var(--text-secondary)' }}
              >
                {p.name}
              </h4>
              <div className="mt-2 mb-1">
                <span
                  className="text-3xl font-black"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                >
                  {p.price}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  /mes
                </span>
              </div>
              <p className="mb-5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {p.tenants} gimnasios activos
              </p>
              <ul className="space-y-2.5">
                {p.features.map((f, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-2 text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <CheckCircle size={14} style={{ color: 'var(--success)' }} /> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Invoices Table */}
      <div>
        <h3
          className="mb-4 text-sm font-bold tracking-wider uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          Facturas Recientes
        </h3>
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Gimnasio', 'Plan', 'Monto', 'Estado', 'Fecha'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => {
                const sc = statusConfig[inv.status]
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b transition-colors last:border-b-0 hover:bg-[var(--surface-hover)]"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        {inv.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {inv.tenant}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: `${planColors[inv.plan]}18`,
                          color: planColors[inv.plan],
                        }}
                      >
                        {inv.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {inv.amount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: sc.color }}
                      >
                        <sc.icon size={12} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {inv.date}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
