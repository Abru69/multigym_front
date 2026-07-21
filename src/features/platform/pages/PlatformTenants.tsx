import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  X,
  Building2,
  MoreVertical,
  CheckCircle,
  Clock,
  PauseCircle,
  AlertTriangle,
  Loader2,
  CreditCard,
  ShieldOff,
} from 'lucide-react'
import { usePlatformTenantsStore } from '@/features/platform/store/platformTenantsStore'
import { disableTenantMercadoPago, getTenantMercadoPagoConfig } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog'
import { LoadingState } from '@/features/admin/components/LoadingState'
import type { MercadoPagoTenantConfigDTO, TenantDTO, TenantRequestDTO, TenantStatus } from '@/types'

const statusConfig: Record<
  TenantStatus,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  ACTIVE: { label: 'Activo', color: 'var(--success)', icon: CheckCircle },
  TRIAL: { label: 'Trial', color: 'var(--info)', icon: Clock },
  PAST_DUE: { label: 'Pago vencido', color: 'var(--warning)', icon: AlertTriangle },
  SUSPENDED: { label: 'Suspendido', color: 'var(--danger)', icon: PauseCircle },
  CANCELLED: { label: 'Cancelado', color: 'var(--danger)', icon: PauseCircle },
}

const planColors: Record<string, string> = {
  Basic: 'var(--info)',
  Pro: 'var(--accent)',
  Enterprise: 'var(--warning)',
}

function getMemberUsageColor(memberCount: number, memberLimit: number): string {
  if (memberLimit === -1) return 'var(--info)'
  if (memberLimit === 0) return 'var(--text-muted)'

  const percentage = (memberCount / memberLimit) * 100
  if (percentage >= 90) return 'var(--danger)'
  if (percentage >= 70) return 'var(--warning)'
  return 'var(--success)'
}

export default function PlatformTenants() {
  const {
    tenants,
    plans,
    isLoading,
    error,
    loadTenants,
    loadPlans,
    createTenant,
    toggleStatus,
    deleteTenant,
    getPlanName,
  } = usePlatformTenantsStore()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mpTenant, setMpTenant] = useState<TenantDTO | null>(null)
  const [mpConfig, setMpConfig] = useState<MercadoPagoTenantConfigDTO | null>(null)
  const [isMpLoading, setIsMpLoading] = useState(false)
  const [isMpDisabling, setIsMpDisabling] = useState(false)
  const [form, setForm] = useState<TenantRequestDTO>({
    tenantId: '',
    name: '',
    subdomain: '',
    adminEmail: '',
    adminPassword: '',
    adminName: '',
    adminPhone: '',
    planId: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadTenants()
    loadPlans()
  }, [loadTenants, loadPlans])

  const filtered = tenants
    .filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.subdomain.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'ALL' || t.status === filter
      return matchSearch && matchFilter
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const openCreate = () => {
    setForm({
      tenantId: '',
      name: '',
      subdomain: '',
      adminEmail: '',
      adminPassword: '',
      adminName: '',
      adminPhone: '',
      planId: plans[0]?.id || '',
    })
    setShowModal(true)
  }

  const handleToggleStatus = async (tenantId: string) => {
    setOpenMenu(null)
    const ok = await toggleStatus(tenantId)
    if (ok) {
      showToast('Estado actualizado')
    } else {
      showToast('Error al cambiar estado')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const ok = await deleteTenant(deleteTarget)
    setIsDeleting(false)
    setDeleteTarget(null)
    if (ok) {
      showToast('Gimnasio eliminado')
    } else {
      showToast('Error al eliminar gimnasio')
    }
  }

  const openMercadoPago = async (tenant: TenantDTO) => {
    setOpenMenu(null)
    setMpTenant(tenant)
    setMpConfig(null)
    setIsMpLoading(true)
    try {
      const response = await getTenantMercadoPagoConfig(tenant.tenantId)
      setMpConfig(response.dto || null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al cargar Mercado Pago')
    } finally {
      setIsMpLoading(false)
    }
  }

  const handleDisableMercadoPago = async () => {
    if (!mpTenant) return
    setIsMpDisabling(true)
    try {
      const response = await disableTenantMercadoPago(mpTenant.tenantId)
      setMpConfig(response.dto || null)
      showToast('Mercado Pago deshabilitado')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al deshabilitar Mercado Pago')
    } finally {
      setIsMpDisabling(false)
    }
  }

  const save = async () => {
    setIsSaving(true)
    const ok = await createTenant(form)
    setIsSaving(false)
    if (ok) {
      showToast('Gimnasio creado')
      setShowModal(false)
    } else {
      showToast('Error al crear gimnasio')
    }
  }

  const stats = [
    { label: 'Total', filterValue: 'ALL', count: tenants.length, color: 'var(--text-secondary)' },
    {
      label: 'Activos',
      filterValue: 'ACTIVE',
      count: tenants.filter((t) => t.status === 'ACTIVE').length,
      color: 'var(--success)',
    },
    {
      label: 'Trial',
      filterValue: 'TRIAL',
      count: tenants.filter((t) => t.status === 'TRIAL').length,
      color: 'var(--info)',
    },
    {
      label: 'Pago vencido',
      filterValue: 'PAST_DUE',
      count: tenants.filter((t) => t.status === 'PAST_DUE').length,
      color: 'var(--warning)',
    },
    {
      label: 'Suspendidos',
      filterValue: 'SUSPENDED',
      count: tenants.filter((t) => t.status === 'SUSPENDED').length,
      color: 'var(--danger)',
    },
    {
      label: 'Cancelados',
      filterValue: 'CANCELLED',
      count: tenants.filter((t) => t.status === 'CANCELLED').length,
      color: 'var(--danger)',
    },
  ]

  if (isLoading && tenants.length === 0) return <LoadingState text="Cargando gimnasios..." />

  if (error && tenants.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--error)' }}>
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Gimnasios
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Gestiona todos los tenants de la plataforma
          </p>
        </div>
        <Button onClick={openCreate} className="accent-glow gap-2">
          <Plus size={16} /> Nuevo Gimnasio
        </Button>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onClick={() => setFilter(s.filterValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setFilter(s.filterValue)
              }
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{s.count}</span>
            <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <div
          className="flex min-w-52 flex-1 items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar gimnasio..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex gap-1">
          {['ALL', 'ACTIVE', 'INACTIVE', 'TRIAL_EXPIRED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-xl px-3 py-2 text-xs font-semibold transition-all"
              style={{
                background: filter === f ? 'var(--accent-muted)' : 'var(--surface)',
                color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
                border: filter === f ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              {f === 'ALL'
                ? 'Todos'
                : f === 'ACTIVE'
                  ? 'Activos'
                  : f === 'INACTIVE'
                    ? 'Inactivos'
                    : 'Trial expirado'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Gimnasio', 'Subdominio', 'Plan', 'Miembros', 'Estado', 'Creado', 'Acciones'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const sc = statusConfig[t.status]
              const planName = getPlanName(t.planId)
              const planColor = planColors[planName] || 'var(--text-muted)'
              const memberCount = t.memberCount ?? 0
              const memberLimit = t.memberLimit ?? 0
              const hasUnlimitedMembers = memberLimit === -1
              const usageColor = getMemberUsageColor(memberCount, memberLimit)
              const usagePercentage =
                memberLimit > 0 ? Math.min(100, Math.round((memberCount / memberLimit) * 100)) : 0
              return (
                <motion.tr
                  key={t.tenantId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b transition-colors last:border-b-0"
                  style={{ borderColor: 'var(--border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black"
                        style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                      >
                        {t.name[0]}
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {t.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t.subdomain}.multigym.com
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-bold"
                        style={{ background: `${planColor}18`, color: planColor }}
                      >
                        {planName}
                      </span>
                      {t.isTrial && (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-bold"
                          style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}
                        >
                          Trial
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="min-w-24 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                        <span style={{ color: 'var(--text-primary)' }}>
                          {memberCount.toLocaleString()}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          / {hasUnlimitedMembers ? '∞' : memberLimit.toLocaleString()}
                        </span>
                      </div>
                      {!hasUnlimitedMembers && (
                        <div
                          className="h-1.5 overflow-hidden rounded-full"
                          style={{ background: 'var(--surface-hover)' }}
                          aria-label={`${usagePercentage}% de miembros usados`}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${usagePercentage}%`, background: usageColor }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleStatus(t.tenantId)
                      }}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all hover:opacity-80"
                      style={{ background: `${sc.color}18`, color: sc.color }}
                      title={t.status === 'ACTIVE' ? 'Clic para suspender' : 'Clic para activar'}
                    >
                      <sc.icon size={12} />
                      {sc.label}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(t.createdAt).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="relative px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenu(openMenu === t.tenantId ? null : t.tenantId)
                      }}
                      className="rounded-lg p-1.5 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--surface-hover)')
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <MoreVertical size={16} />
                    </button>
                    <AnimatePresence>
                      {openMenu === t.tenantId && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute right-0 z-50 w-44 rounded-xl py-1 shadow-lg"
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            top: '100%',
                          }}
                        >
                          {[
                            {
                              label: t.status === 'ACTIVE' ? '⏸ Suspender' : '▶ Activar',
                              fn: () => handleToggleStatus(t.tenantId),
                            },
                            {
                              label: '💳 Mercado Pago',
                              fn: () => openMercadoPago(t),
                            },
                            {
                              label: '🗑 Eliminar',
                              fn: () => {
                                setDeleteTarget(t.tenantId)
                                setOpenMenu(null)
                              },
                              danger: true,
                            },
                          ].map((item) => (
                            <button
                              type="button"
                              key={item.label}
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenu(null)
                                item.fn()
                              }}
                              className="block w-full px-4 py-2 text-left text-sm transition-colors"
                              style={{
                                color: item.danger ? 'var(--danger)' : 'var(--text-secondary)',
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = 'var(--surface-hover)')
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = 'transparent')
                              }
                            >
                              {item.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
            <Building2 size={32} className="mx-auto mb-3 opacity-40" />
            <p>Sin resultados</p>
          </div>
        )}
      </div>

      <p className="text-right text-xs" style={{ color: 'var(--text-muted)' }}>
        Mostrando {filtered.length} de {tenants.length} gimnasios
      </p>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Gimnasio"
        message={`¿Estás seguro de eliminar "${tenants.find((t) => t.tenantId === deleteTarget)?.name}"? Esta acción eliminará permanentemente el gimnasio y todos sus datos.`}
        confirmLabel="Eliminar Gimnasio"
        isLoading={isDeleting}
      />

      {/* Create Modal */}
      <AnimatePresence>
        {mpTenant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'var(--overlay)', backdropFilter: 'blur(6px)' }}
            onClick={() => setMpTenant(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl p-6"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      Mercado Pago
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {mpTenant.name} · {mpTenant.tenantId}
                    </p>
                  </div>
                </div>
                <button onClick={() => setMpTenant(null)} style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {isMpLoading ? (
                <div
                  className="flex h-32 items-center justify-center gap-2 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Loader2 size={18} className="animate-spin" /> Cargando configuración...
                </div>
              ) : (
                <div className="space-y-5">
                  <div
                    className="rounded-2xl border p-4"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                  >
                    <p
                      className="text-xs font-black tracking-wide uppercase"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Estado
                    </p>
                    <p
                      className="mt-1 text-xl font-black"
                      style={{ color: mpConfig?.enabled ? 'var(--success)' : 'var(--warning)' }}
                    >
                      {mpConfig?.enabled && mpConfig.connectionStatus === 'CONNECTED'
                        ? 'Conectado y activo'
                        : 'No activo'}
                    </p>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Platform puede deshabilitar la integración, pero el tenant debe conectar o
                      reconectar su cuenta desde su panel de admin.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MpInfo
                      label="Public key"
                      value={mpConfig?.publicKey ? 'Configurada' : 'No configurada'}
                    />
                    <MpInfo label="Cuenta MP" value={mpConfig?.mpUserId || 'No conectada'} />
                    <MpInfo
                      label="Access token"
                      value={mpConfig?.accessTokenConfigured ? 'Guardado' : 'No guardado'}
                    />
                    <MpInfo
                      label="Webhook secret"
                      value={mpConfig?.webhookSecretConfigured ? 'Guardado' : 'No guardado'}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setMpTenant(null)}>
                      Cerrar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisableMercadoPago}
                      disabled={!mpConfig?.enabled || isMpDisabling}
                      className="gap-2"
                    >
                      {isMpDisabling ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ShieldOff size={14} />
                      )}
                      Deshabilitar
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'var(--overlay)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl p-6"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Nuevo Gimnasio
                </h2>
                <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Nombre', key: 'name' as const, placeholder: 'Ej: FitZone Elite' },
                  { label: 'Tenant ID', key: 'tenantId' as const, placeholder: 'fitzone' },
                  { label: 'Subdominio', key: 'subdomain' as const, placeholder: 'fitzone' },
                  {
                    label: 'Email Admin',
                    key: 'adminEmail' as const,
                    placeholder: 'admin@gym.com',
                    type: 'email',
                    colSpan: true,
                  },
                ].map((f) => (
                  <div key={f.key} className={f.colSpan ? 'col-span-2' : ''}>
                    <Label>{f.label}</Label>
                    <Input
                      type={f.type ?? 'text'}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <p
                    className="mb-1.5 block text-xs font-semibold"
                    style={{ color: 'var(--detail)' }}
                  >
                    Datos del Administrador
                  </p>
                  <div className="h-px w-full" style={{ background: 'var(--border)' }} />
                </div>
                {[
                  { label: 'Nombre Admin', key: 'adminName' as const, placeholder: 'Juan Pérez' },
                  {
                    label: 'Contraseña',
                    key: 'adminPassword' as const,
                    placeholder: 'Mínimo 8 caracteres',
                    type: 'password',
                  },
                  {
                    label: 'Teléfono',
                    key: 'adminPhone' as const,
                    placeholder: '+52 614 555 0000',
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <Label>{f.label}</Label>
                    <Input
                      type={f.type ?? 'text'}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <Label>Plan SaaS</Label>
                  <select
                    value={form.planId}
                    onChange={(e) => setForm({ ...form, planId: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {plans
                      .filter((p) => p.isActive)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price}/mes —{' '}
                          {p.memberLimit === -1 ? 'Ilimitado' : `${p.memberLimit} miembros`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={() => setShowModal(false)} variant="secondary">
                  Cancelar
                </Button>
                <Button onClick={save} disabled={isSaving} className="gap-2">
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  Crear Gimnasio
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-6 bottom-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MpInfo({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl border px-3 py-2.5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="mt-1 text-sm font-bold break-all" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  )
}
