import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  AlertTriangle,
  Download,
  BarChart3,
} from 'lucide-react'
import { getPlatformAnalytics, exportPlatformAnalytics } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { LoadingState } from '@/features/admin/components/LoadingState'
import type { PlatformAnalyticsDTO, TenantRevenueDTO, PlanAnalyticsDTO } from '@/types'

type Tab = 'overview' | 'revenue' | 'plans' | 'churn' | 'failed'

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'revenue', label: 'Revenue by Tenant' },
  { key: 'plans', label: 'Plans' },
  { key: 'churn', label: 'Churn & Retention' },
  { key: 'failed', label: 'Failed Payments' },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof DollarSign; color: string }) {
  return (
    <motion.div variants={fadeUp} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

function OverviewTab({ data }: { data: PlatformAnalyticsDTO }) {
  const { mrr, churnRetention, arpuLtv } = data
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="MRR" value={formatCurrency(mrr.totalMRR)} icon={DollarSign} color="var(--success)" />
        <MetricCard label="ARR" value={formatCurrency(mrr.arr)} icon={TrendingUp} color="var(--info)" />
        <MetricCard label="ARPU" value={formatCurrency(arpuLtv.arpu)} icon={Users} color="var(--accent)" />
        <MetricCard label="LTV" value={formatCurrency(arpuLtv.ltv)} icon={TrendingUp} color="var(--warning)" />
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Paying Tenants" value={String(mrr.payingTenants)} icon={Users} color="var(--success)" />
        <MetricCard label="Trial Tenants" value={String(mrr.trialTenants)} icon={Users} color="var(--info)" />
        <MetricCard label="Churn Rate" value={`${churnRetention.churnRate}%`} icon={TrendingDown} color="var(--danger)" />
        <MetricCard label="Retention Rate" value={`${churnRetention.retentionRate}%`} icon={TrendingUp} color="var(--success)" />
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <MetricCard label="Past Due" value={String(mrr.pastDueTenants)} icon={AlertTriangle} color="var(--warning)" />
        <MetricCard label="Suspended" value={String(mrr.suspendedTenants)} icon={AlertTriangle} color="var(--danger)" />
        <MetricCard label="Cancelled" value={String(mrr.cancelledTenants)} icon={TrendingDown} color="var(--danger)" />
      </motion.div>
    </motion.div>
  )
}

function RevenueTab({ tenants }: { tenants: TenantRevenueDTO[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--surface-hover)' }}>
            <th className="px-4 py-3 text-left font-bold" style={{ color: 'var(--text-secondary)' }}>Tenant</th>
            <th className="px-4 py-3 text-left font-bold" style={{ color: 'var(--text-secondary)' }}>Plan</th>
            <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Price</th>
            <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Total Revenue</th>
            <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Monthly</th>
            <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Payments</th>
            <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Failed</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((t) => (
            <tr key={t.tenantId} className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{t.tenantName}</td>
              <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{t.planName || '-'}</td>
              <td className="px-4 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(t.planPrice)}</td>
              <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--success)' }}>{formatCurrency(t.totalRevenue)}</td>
              <td className="px-4 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(t.monthlyRevenue)}</td>
              <td className="px-4 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>{t.paymentCount}</td>
              <td className="px-4 py-3 text-right">
                {t.failedPayments > 0 ? (
                  <Badge variant="destructive">{t.failedPayments}</Badge>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>0</span>
                )}
              </td>
            </tr>
          ))}
          {tenants.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No revenue data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function PlansTab({ plans }: { plans: PlanAnalyticsDTO[] }) {
  return (
    <div className="space-y-4">
      {plans.map((p) => (
        <motion.div key={p.planId} variants={fadeUp} initial="hidden" animate="visible"
          className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.planName}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatCurrency(p.planPrice)}/month</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>{formatCurrency(p.mrr)}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>MRR</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{p.activeTenants}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Tenants</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{p.totalTenants}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Tenants</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.totalRevenue)}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Revenue</p>
            </div>
          </div>
        </motion.div>
      ))}
      {plans.length === 0 && (
        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No plan data</p>
      )}
    </div>
  )
}

function ChurnTab({ data }: { data: PlatformAnalyticsDTO['churnRetention'] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Churn Rate" value={`${data.churnRate}%`} icon={TrendingDown} color="var(--danger)" />
        <MetricCard label="Retention Rate" value={`${data.retentionRate}%`} icon={TrendingUp} color="var(--success)" />
        <MetricCard label="Churned (30d)" value={String(data.churnedLast30Days)} icon={AlertTriangle} color="var(--warning)" />
        <MetricCard label="Churned (90d)" value={String(data.churnedLast90Days)} icon={AlertTriangle} color="var(--danger)" />
      </div>
      {data.monthlyChurn.length > 0 && (
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-hover)' }}>
                <th className="px-4 py-3 text-left font-bold" style={{ color: 'var(--text-secondary)' }}>Month</th>
                <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Total Tenants</th>
                <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Churned</th>
                <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Churn Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyChurn.map((m) => (
                <tr key={`${m.year}-${m.month}`} className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{m.year}-{String(m.month).padStart(2, '0')}</td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>{m.total}</td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--danger)' }}>{m.churned}</td>
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>
                    {m.total > 0 ? `${((m.churned / m.total) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FailedPaymentsTab({ data }: { data: PlatformAnalyticsDTO['failedPayments'] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Total Failed" value={String(data.totalFailed)} icon={AlertTriangle} color="var(--danger)" />
        <MetricCard label="Needs Retry" value={String(data.needsRetry)} icon={CreditCard} color="var(--warning)" />
        <MetricCard label="Failed Amount" value={formatCurrency(data.failedAmount)} icon={DollarSign} color="var(--danger)" />
      </div>
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--surface-hover)' }}>
              <th className="px-4 py-3 text-left font-bold" style={{ color: 'var(--text-secondary)' }}>Tenant</th>
              <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Amount</th>
              <th className="px-4 py-3 text-left font-bold" style={{ color: 'var(--text-secondary)' }}>Error</th>
              <th className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-secondary)' }}>Retries</th>
              <th className="px-4 py-3 text-left font-bold" style={{ color: 'var(--text-secondary)' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recentFailed.map((p, i) => (
              <tr key={i} className="border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{p.tenantName}</td>
                <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--danger)' }}>{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{p.lastError || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <Badge variant={p.retryCount >= 3 ? 'destructive' : 'warning'}>{p.retryCount}</Badge>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(p.createdAt).toLocaleDateString('es-MX')}
                </td>
              </tr>
            ))}
            {data.recentFailed.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>No failed payments</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PlatformAnalyticsPage() {
  const [data, setData] = useState<PlatformAnalyticsDTO | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const res = await getPlatformAnalytics()
        setData(res.dto || null)
      } catch {
        // Will show empty state
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleExport = async (format: string) => {
    try {
      const blob = await exportPlatformAnalytics(format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `platform-analytics.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Export failed silently
    }
  }

  if (isLoading) return <LoadingState text="Cargando analytics..." />
  if (!data) return <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No analytics data available</p>

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            Platform Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            MRR, churn, retention, and revenue insights
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)]" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <Download size={16} /> CSV
          </button>
          <button onClick={() => handleExport('xlsx')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)]" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <Download size={16} /> XLSX
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)]" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            style={{
              background: activeTab === tab.key ? 'var(--card)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab data={data} />}
      {activeTab === 'revenue' && <RevenueTab tenants={data.mrr.tenants} />}
      {activeTab === 'plans' && <PlansTab plans={data.planBreakdown} />}
      {activeTab === 'churn' && <ChurnTab data={data.churnRetention} />}
      {activeTab === 'failed' && <FailedPaymentsTab data={data.failedPayments} />}
    </div>
  )
}
