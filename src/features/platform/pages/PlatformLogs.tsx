import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Download,
  Plus,
  Edit2,
  Key,
  Pause,
  Trash2,
  Globe,
  Building,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { usePlatformLogsStore } from '@/features/platform/store/platformLogsStore'
import { LoadingState } from '@/features/admin/components/LoadingState'

const actionConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  TENANT_CREATED: { icon: Plus, color: 'var(--success)', label: 'Creación' },
  TENANT_UPDATED: { icon: Edit2, color: 'var(--info)', label: 'Actualización' },
  TENANT_SUSPENDED: { icon: Pause, color: 'var(--warning)', label: 'Suspensión' },
  TENANT_DELETED: { icon: Trash2, color: 'var(--danger)', label: 'Eliminación' },
  USER_LOGIN: { icon: Key, color: 'var(--accent)', label: 'Acceso' },
  USER_CREATED: { icon: Plus, color: 'var(--success)', label: 'Creación' },
  PLATFORM_USER_CREATED: { icon: Plus, color: 'var(--success)', label: 'Creación' },
  PLAN_UPDATED: { icon: Edit2, color: 'var(--info)', label: 'Actualización' },
}

const FALLBACK_CONFIG = { icon: ShieldAlert, color: 'var(--text-muted)', label: 'Otro' }

const ACTION_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'TENANT_CREATED', label: 'Tenant creado' },
  { value: 'TENANT_UPDATED', label: 'Tenant actualizado' },
  { value: 'TENANT_SUSPENDED', label: 'Tenant suspendido' },
  { value: 'TENANT_DELETED', label: 'Tenant eliminado' },
  { value: 'USER_LOGIN', label: 'Login' },
  { value: 'PLATFORM_USER_CREATED', label: 'Usuario creado' },
  { value: 'PLAN_UPDATED', label: 'Plan actualizado' },
]

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `hace ${diffMin}m`
  if (diffH < 24) return `hace ${diffH}h`
  if (diffD === 1) return 'Ayer'
  if (diffD < 30) return `hace ${diffD}d`
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function formatActionLabel(action: string): string {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function PlatformLogs() {
  const {
    logs,
    pagination,
    filters,
    isLoading,
    error,
    loadLogs,
    setFilter,
    clearFilters,
    setPage,
  } = usePlatformLogsStore()

  const { action, entityName, fromDate, toDate } = filters
  const page = pagination.page

  useEffect(() => {
    loadLogs()
  }, [loadLogs, action, entityName, fromDate, toDate, page])

  if (isLoading && logs.length === 0) return <LoadingState text="Cargando auditoría..." />

  if (error) {
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
            Logs de Auditoría
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Registro de todas las acciones en la plataforma
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
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex min-w-52 flex-1 items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            value={filters.entityName}
            onChange={(e) => setFilter('entityName', e.target.value)}
            placeholder="Buscar entidad..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        <select
          value={filters.action}
          onChange={(e) => setFilter('action', e.target.value)}
          className="rounded-xl px-3 py-2.5 text-xs font-semibold outline-none"
          style={{
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={filters.fromDate}
          onChange={(e) => setFilter('fromDate', e.target.value ? e.target.value + ':00' : '')}
          className="rounded-xl px-3 py-2.5 text-xs"
          style={{
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
          title="Fecha desde"
        />

        <input
          type="datetime-local"
          value={filters.toDate}
          onChange={(e) => setFilter('toDate', e.target.value ? e.target.value + ':00' : '')}
          className="rounded-xl px-3 py-2.5 text-xs"
          style={{
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
          title="Fecha hasta"
        />

        {(filters.action || filters.entityName || filters.fromDate || filters.toDate) && (
          <button
            onClick={clearFilters}
            className="rounded-xl px-3 py-2.5 text-xs font-semibold transition-all"
            style={{ color: 'var(--danger)' }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Logs Timeline */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {logs.length > 0 ? (
          <div className="space-y-0">
            {logs.map((log, i) => {
              const tc = actionConfig[log.action] || FALLBACK_CONFIG
              const isLast = i === logs.length - 1
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex gap-4"
                >
                  <div className="flex w-6 flex-shrink-0 flex-col items-center">
                    <div
                      className="z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                      style={{
                        background: `${tc.color}15`,
                        color: tc.color,
                        border: `1px solid ${tc.color}30`,
                      }}
                    >
                      <tc.icon size={12} />
                    </div>
                    {!isLast && (
                      <div className="my-1 w-px flex-1" style={{ background: 'var(--border)' }} />
                    )}
                  </div>

                  <div className={`min-w-0 flex-1 pb-6 ${isLast ? '' : ''}`}>
                    <div className="mb-1.5 flex items-start justify-between gap-4">
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {formatActionLabel(log.action)}
                        </p>
                        <p
                          className="mt-1 flex items-center gap-1.5 text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Building size={12} /> {log.entityName}
                          {log.tenantName && (
                            <span className="ml-1 opacity-60">· {log.tenantName}</span>
                          )}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-semibold whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {getRelativeTime(log.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {log.userType && (
                        <span
                          className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                          style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                        >
                          {log.userType}
                        </span>
                      )}
                      {log.ipAddress && (
                        <span
                          className="flex items-center gap-1 font-mono text-[10px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Globe size={10} /> {log.ipAddress}
                        </span>
                      )}
                      {log.metadata && (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {log.metadata}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Search
              size={32}
              className="mx-auto mb-3 opacity-20"
              style={{ color: 'var(--text-muted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No se encontraron registros de auditoría.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalElements > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Mostrando {pagination.page * pagination.size + 1}–
            {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} de{' '}
            {pagination.totalElements}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.first}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {pagination.page + 1} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.last}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
