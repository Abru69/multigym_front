import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchApi } from '@/lib/api'
import type { OrderDTO, OrderItemDTO, ResponseDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  Store,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MapPin,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING: { label: 'Esperando', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  READY: { label: 'Listo para Recoger', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  COMPLETED: { label: 'Recogida', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelada', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export default function Pickups() {
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'READY' | 'COMPLETED' | 'CANCELLED'>('PENDING')

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await fetchApi<ResponseDTO<{ data: OrderDTO[] }>>('/api/orders?deliveryMethod=PICKUP')
      setOrders(res.dto?.data || [])
    } catch (err) {
      console.error('Failed to load pickup orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleMarkReady = async (orderId: string) => {
    try {
      setActionId(orderId)
      await fetchApi(`/api/orders/${orderId}/ready`, { method: 'PATCH' })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'READY' } : o))
      )
    } catch (err) {
      console.error('Failed to mark as ready:', err)
    } finally {
      setActionId(null)
    }
  }

  const handleMarkComplete = async (orderId: string) => {
    try {
      setActionId(orderId)
      await fetchApi(`/api/orders/${orderId}/complete`, { method: 'PATCH' })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'COMPLETED' } : o))
      )
    } catch (err) {
      console.error('Failed to mark as completed:', err)
    } finally {
      setActionId(null)
    }
  }

  const handleCancel = async (orderId: string) => {
    try {
      setActionId(orderId)
      await fetchApi(`/api/orders/${orderId}/cancel`, { method: 'PATCH' })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
      )
    } catch (err) {
      console.error('Failed to cancel order:', err)
    } finally {
      setActionId(null)
    }
  }

  const filtered = orders.filter((o) => filter === 'ALL' || o.status === filter)
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length
  const readyCount = orders.filter((o) => o.status === 'READY').length
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-xs text-[var(--text-muted)]">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-[var(--text-primary)]">
            Recogidas en Sucursal
          </h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} · {readyCount} listo{readyCount !== 1 ? 's' : ''} · {completedCount} completada{completedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          title="Actualizar"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600">Nuevas</p>
          <p className="mt-0.5 font-heading text-lg font-black text-amber-700">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-blue-600">Listas</p>
          <p className="mt-0.5 font-heading text-lg font-black text-blue-700">{readyCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">Entregadas</p>
          <p className="mt-0.5 font-heading text-lg font-black text-emerald-700">{completedCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Estado:</span>
        {(['ALL', 'PENDING', 'READY', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
              filter === f
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Nuevas' : f === 'READY' ? 'Listas' : f === 'COMPLETED' ? 'Entregadas' : 'Canceladas'}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <Store size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              {filter === 'PENDING' ? 'No hay pedidos nuevos' : filter === 'READY' ? 'No hay pedidos listos' : 'No hay órdenes de recogida'}
            </p>
          </div>
        ) : (
          filtered.map((order, i) => {
            const status = statusConfig[order.status] || statusConfig.PENDING
            const items = (order as OrderDTO & { items?: OrderItemDTO[] }).items || []
            const isExpanded = expandedId === order.id

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id!)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        Orden #{order.id?.slice(0, 8).toUpperCase()}
                      </p>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.bg} ${status.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Package size={10} />
                        {items.length} art{items.length !== 1 ? 'ículos' : 'ículo'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleMarkReady(order.id!)}
                        disabled={actionId === order.id}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionId === order.id ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Check size={12} />
                        )}
                        Marcar Listo
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        onClick={() => handleMarkComplete(order.id!)}
                        disabled={actionId === order.id}
                        className="flex items-center gap-1.5 rounded-xl bg-[var(--success)] px-3 py-2 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {actionId === order.id ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        Entregado
                      </button>
                    )}
                    {(order.status === 'PENDING' || order.status === 'READY') && (
                      <button
                        onClick={() => handleCancel(order.id!)}
                        disabled={actionId === order.id}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {actionId === order.id ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                        ) : (
                          <X size={12} />
                        )}
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id!)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-hover)] text-[var(--text-muted)]"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[var(--border)] px-4 pt-3 pb-4 sm:px-5">
                        {/* Branch Info */}
                        {order.branchName && (
                          <div className="mb-3 rounded-xl bg-[var(--surface)] px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Store size={14} className="text-[var(--accent)]" />
                              <div>
                                <p className="text-xs font-bold text-[var(--text-primary)]">{order.branchName}</p>
                                <p className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                                  <MapPin size={10} /> Sucursal de recogida
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Client Info */}
                        {order.user && (
                          <div className="mb-3 rounded-xl bg-[var(--surface)] px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Cliente</p>
                            <p className="mt-0.5 text-xs font-bold text-[var(--text-primary)]">{order.user.name || order.user.email}</p>
                          </div>
                        )}

                        {/* Items */}
                        {items.length > 0 && (
                          <div className="mb-3 space-y-1.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Artículos</p>
                            {items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-2">
                                <span className="text-xs font-medium text-[var(--text-primary)]">{item.productName}</span>
                                <span className="text-xs text-[var(--text-secondary)]">{item.quantity} x {formatCurrency(Number(item.unitPrice))}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Total */}
                        <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-[var(--text-muted)]">Total</span>
                            <span className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(Number(order.total))}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
