import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, CreditCard, AlertCircle, CheckCircle, TrendingUp, DollarSign, Building2 } from 'lucide-react'
import { usePlatformBillingStore } from '../store/platformBillingStore'
import { formatCurrency } from '@/lib/utils'

const planColorMap: Record<string, string> = {
  Basic: 'var(--info)',
  Pro: 'var(--accent)',
  Enterprise: 'var(--warning)',
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }

function formatCurrencyCompact(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PlatformBilling() {
  const { metrics, plans, billingSummaries, isLoading, error, loadBillingData } = usePlatformBillingStore()

  useEffect(() => {
    loadBillingData()
  }, [loadBillingData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-transparent" style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--danger)' }}>
        <AlertCircle size={32} style={{ color: 'var(--danger)' }} className="mx-auto mb-2" />
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Error al cargar billing</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    )
  }

  const metricCards = metrics
    ? [
        {
          label: 'MRR',
          value: formatCurrencyCompact(metrics.mrr),
          icon: DollarSign,
          color: 'var(--accent)',
          trend: `${metrics.activeTenants} tenants activos`,
        },
        {
          label: 'ARR Proyectado',
          value: formatCurrencyCompact(metrics.arr),
          icon: TrendingUp,
          color: 'var(--success)',
          trend: '+12 meses',
        },
        {
          label: 'Ingresos Totales',
          value: formatCurrencyCompact(metrics.totalRevenue),
          icon: CreditCard,
          color: 'var(--warning)',
          trend: `${metrics.totalPayments} pagos`,
        },
        {
          label: 'Tenants',
          value: `${metrics.activeTenants}/${metrics.totalTenants}`,
          icon: Building2,
          color: 'var(--info)',
          trend: 'activos/total',
        },
      ]
    : []

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
        {metricCards.map((m, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="absolute top-0 left-0 h-1 w-full" style={{ background: m.color }} />
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `${m.color}18` }}
              >
                <m.icon size={22} style={{ color: m.color }} />
              </div>
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
                    style={{ background: `${m.color}20`, color: m.color }}
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
          Planes SaaS Disponibles
        </h3>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {plans.map((pw) => {
            const planColor = planColorMap[pw.plan.name] || 'var(--info)'
            return (
              <motion.div
                key={pw.plan.id}
                variants={fadeUp}
                className="relative rounded-2xl p-6 transition-transform hover:-translate-y-1"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid var(--border)`,
                }}
              >
                <h4
                  className="text-sm font-bold tracking-wider uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {pw.plan.name}
                </h4>
                <div className="mt-2 mb-1">
                  <span
                    className="text-3xl font-black"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
                  >
                    ${pw.plan.price}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    /mes
                  </span>
                </div>
                <p className="mb-5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {pw.tenantCount} {pw.tenantCount === 1 ? 'gimnasio' : 'gimnasios'} activos
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                    {pw.plan.memberLimit === -1 ? 'Miembros ilimitados' : `Hasta ${pw.plan.memberLimit} miembros`}
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                    {pw.plan.trialDays} días de prueba
                  </li>
                  {pw.plan.description && (
                    <li className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {pw.plan.description}
                    </li>
                  )}
                </ul>
                <div className="mt-4">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: pw.plan.isActive ? `${planColor}18` : 'var(--danger)18',
                      color: pw.plan.isActive ? planColor : 'var(--danger)',
                    }}
                  >
                    {pw.plan.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Tenant Billing Summaries */}
      <div>
        <h3
          className="mb-4 text-sm font-bold tracking-wider uppercase"
          style={{ color: 'var(--text-secondary)' }}
        >
          Resumen de Facturación por Tenant
        </h3>
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Gimnasio', 'Plan Activo', 'Total Pagado', 'Pagos', 'Último Pago'].map((h) => (
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
              {billingSummaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      No hay datos de facturación aún
                    </p>
                  </td>
                </tr>
              ) : (
                billingSummaries.map((s, i) => (
                  <motion.tr
                    key={s.tenantId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b transition-colors last:border-b-0 hover:bg-[var(--surface-hover)]"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {s.tenantName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          background: s.activePlanName ? 'var(--accent)18' : 'var(--muted)18',
                          color: s.activePlanName ? 'var(--accent)' : 'var(--text-muted)',
                        }}
                      >
                        {s.activePlanName || 'Sin plan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        ${Number(s.totalPaid).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {s.paymentCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(s.lastPaymentDate)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
