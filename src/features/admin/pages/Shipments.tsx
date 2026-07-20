import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cancelOrder, fetchApi, markOrderRefunded, retryOrderRefund } from '@/lib/api'
import type { OrderDTO, OrderItemDTO, PaginatedResult, ResponseDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  Truck,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MapPin,
  CheckCircle2,
  X,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  COMPLETED: {
    label: 'Entregado',
    color: 'text-[var(--success)]',
    bg: 'bg-[var(--success-muted)] border-[var(--success)]/30',
    dot: 'bg-[var(--success)]',
  },
  PENDING: {
    label: 'Enviado',
    color: 'text-[var(--info)]',
    bg: 'bg-[var(--info-muted)] border-[var(--info)]/30',
    dot: 'bg-[var(--info)]',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'text-[var(--text-secondary)]',
    bg: 'bg-[var(--surface)] border-[var(--border)]',
    dot: 'bg-[var(--text-muted)]',
  },
}

const paymentStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: {
    label: 'Pagado',
    color: 'text-[var(--success)]',
    bg: 'bg-[var(--success-muted)] border-[var(--success)]/30',
  },
  REFUNDED: {
    label: 'Reembolsado',
    color: 'text-[var(--info)]',
    bg: 'bg-[var(--info-muted)] border-[var(--info)]/30',
  },
  REFUND_FAILED: {
    label: 'Reembolso fallido',
    color: 'text-[var(--error)]',
    bg: 'bg-[var(--error-muted-bg)] border-[var(--error)]/30',
  },
  FAILED: {
    label: 'Pago fallido',
    color: 'text-[var(--error)]',
    bg: 'bg-[var(--error-muted-bg)] border-[var(--error)]/30',
  },
  PENDING: {
    label: 'Pago pendiente',
    color: 'text-[var(--warning)]',
    bg: 'bg-[var(--warning-muted)] border-[var(--warning)]/30',
  },
}

const normalizeStatus = (status?: string) => (status || 'PENDING').toUpperCase()
const normalizePaymentStatus = (status?: string) => (status || 'PENDING').toUpperCase()
const canCancelOrder = (status?: string) => ['PENDING', 'READY'].includes(normalizeStatus(status))
const canResolveRefund = (status?: string, paymentStatus?: string) =>
  normalizeStatus(status) === 'CANCELLED' &&
  ['REFUND_FAILED', 'COMPLETED'].includes(normalizePaymentStatus(paymentStatus))

type OrderListResponse =
  PaginatedResult<OrderDTO> | { data?: OrderDTO[]; content?: OrderDTO[] } | OrderDTO[]

function extractOrders(res: ResponseDTO<OrderListResponse>) {
  const dto = res.dto
  if (Array.isArray(dto)) return dto
  if (Array.isArray(dto?.data)) return dto.data
  if (dto && 'content' in dto && Array.isArray(dto.content)) return dto.content
  if (Array.isArray(res.lista)) return res.lista as OrderDTO[]
  return []
}

function mergeUpdatedOrder(
  current: OrderDTO,
  response: ResponseDTO<OrderDTO>,
  fallbackStatus: string
) {
  return response.dto ? { ...current, ...response.dto } : { ...current, status: fallbackStatus }
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

export default function Shipments() {
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('PENDING')

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await fetchApi<ResponseDTO<OrderListResponse>>(
        '/api/orders?deliveryMethod=SHIPPING'
      )
      setOrders(extractOrders(res))
    } catch (err) {
      console.error('Failed to load shipments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders()
  }, [])

  const handleRetryRefund = async (orderId: string) => {
    try {
      setActionId(orderId)
      const res = await retryOrderRefund(orderId)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? mergeUpdatedOrder(o, res, 'CANCELLED') : o))
      )
    } catch (err) {
      console.error('Failed to retry refund:', err)
    } finally {
      setActionId(null)
    }
  }

  const handleCancel = async (orderId: string) => {
    try {
      setActionId(orderId)
      const res = await cancelOrder(orderId)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? mergeUpdatedOrder(o, res, 'CANCELLED') : o))
      )
    } catch (err) {
      console.error('Failed to cancel order:', err)
    } finally {
      setActionId(null)
    }
  }

  const handleMarkRefunded = async (orderId: string) => {
    const refundReference = window.prompt('Referencia de devolución manual (opcional)') || undefined
    const note = window.prompt('Nota de resolución manual (opcional)') || undefined
    try {
      setActionId(orderId)
      const res = await markOrderRefunded(orderId, { refundReference, note })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? mergeUpdatedOrder(o, res, 'CANCELLED') : o))
      )
    } catch (err) {
      console.error('Failed to mark refund manually resolved:', err)
    } finally {
      setActionId(null)
    }
  }

  const filtered = orders.filter((o) => filter === 'ALL' || normalizeStatus(o.status) === filter)
  const pendingCount = orders.filter((o) => normalizeStatus(o.status) === 'PENDING').length
  const completedCount = orders.filter((o) => normalizeStatus(o.status) === 'COMPLETED').length

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-xs text-[var(--text-muted)]">Cargando envíos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-[var(--text-primary)]">
            Envíos a Domicilio
          </h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} · {completedCount} entregado
            {completedCount !== 1 ? 's' : ''}
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
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--info)]/30 bg-[var(--info-muted)] p-3 text-center">
          <p className="text-[10px] font-medium tracking-wider text-[var(--info)] uppercase">
            Enviados
          </p>
          <p className="font-heading mt-0.5 text-lg font-black text-[var(--info)]">
            {pendingCount}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success-muted)] p-3 text-center">
          <p className="text-[10px] font-medium tracking-wider text-[var(--success)] uppercase">
            Entregados
          </p>
          <p className="font-heading mt-0.5 text-lg font-black text-[var(--success)]">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
          Estado:
        </span>
        {(['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
              filter === f
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {f === 'ALL'
              ? 'Todas'
              : f === 'PENDING'
                ? 'Enviados'
                : f === 'COMPLETED'
                  ? 'Entregados'
                  : 'Cancelados'}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <Truck size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              {filter === 'PENDING' ? 'No hay envíos pendientes' : 'No hay órdenes de envío'}
            </p>
          </div>
        ) : (
          filtered.map((order, i) => {
            const orderStatus = normalizeStatus(order.status)
            const orderPaymentStatus = normalizePaymentStatus(order.paymentStatus)
            const status = statusConfig[orderStatus] || statusConfig.PENDING
            const paymentStatus =
              paymentStatusConfig[orderPaymentStatus] || paymentStatusConfig.PENDING
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
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.bg} ${status.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${paymentStatus.bg} ${paymentStatus.color}`}
                      >
                        {paymentStatus.label}
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
                  <div className="flex items-center gap-3">
                    {canCancelOrder(order.status) && (
                      <button
                        onClick={() => handleCancel(order.id!)}
                        disabled={actionId === order.id}
                        className="flex items-center gap-1.5 rounded-xl border border-[var(--error)]/30 bg-[var(--error-muted-bg)] px-3 py-2 text-xs font-bold text-[var(--error)] transition hover:bg-[var(--error-muted-bg)] disabled:opacity-50"
                      >
                        {actionId === order.id ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--error)] border-t-transparent" />
                        ) : (
                          <X size={12} />
                        )}
                        Cancelar
                      </button>
                    )}
                    {canResolveRefund(order.status, order.paymentStatus) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRetryRefund(order.id!)}
                          disabled={actionId === order.id}
                          className="flex items-center gap-1.5 rounded-xl bg-[var(--info)] px-3 py-2 text-xs font-bold text-[var(--text-on-primary)] transition hover:opacity-90 disabled:opacity-50"
                        >
                          <RefreshCw
                            size={12}
                            className={actionId === order.id ? 'animate-spin' : ''}
                          />
                          Reintentar
                        </button>
                        <button
                          onClick={() => handleMarkRefunded(order.id!)}
                          disabled={actionId === order.id}
                          className="flex items-center gap-1.5 rounded-xl border border-[var(--success)]/30 bg-[var(--success-muted)] px-3 py-2 text-xs font-bold text-[var(--success)] transition hover:bg-[var(--success-muted)] disabled:opacity-50"
                        >
                          <CheckCircle2 size={12} />
                          Manual
                        </button>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="font-heading text-sm font-black text-[var(--text-primary)]">
                        {formatCurrency(Number(order.total))}
                      </p>
                    </div>
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
                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="mb-3 rounded-xl bg-[var(--surface)] px-3 py-2.5">
                            <div className="flex items-start gap-2">
                              <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                              <div>
                                <p className="text-xs font-bold text-[var(--text-primary)]">
                                  Dirección de envío
                                </p>
                                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                                  {order.shippingAddress}
                                </p>
                                <p className="text-[11px] text-[var(--text-secondary)]">
                                  {order.shippingCity}
                                  {order.shippingPostalCode
                                    ? ` CP ${order.shippingPostalCode}`
                                    : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Items */}
                        {items.length > 0 && (
                          <div className="mb-3 space-y-1.5">
                            <p className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                              Artículos
                            </p>
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-2"
                              >
                                <span className="text-xs font-medium text-[var(--text-primary)]">
                                  {item.productName}
                                </span>
                                <span className="text-xs text-[var(--text-secondary)]">
                                  {item.quantity} x {formatCurrency(Number(item.unitPrice))}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Total */}
                        <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-[var(--text-muted)]">Total + Envío</span>
                            <span className="text-sm font-bold text-[var(--text-primary)]">
                              {formatCurrency(Number(order.total))}
                            </span>
                          </div>
                        </div>
                        {orderPaymentStatus === 'REFUND_FAILED' && (
                          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                            <p className="text-xs font-bold text-red-700">
                              Resolver devolución manualmente
                            </p>
                            <p className="mt-1 text-[11px] text-red-600">
                              {order.refundErrorMessage ||
                                'Mercado Pago no aceptó el reembolso automático.'}
                            </p>
                          </div>
                        )}
                        {orderPaymentStatus === 'REFUNDED' && order.refundReference && (
                          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">
                            <p className="text-xs font-bold text-blue-700">Devolución completada</p>
                            <p className="mt-1 truncate font-mono text-[11px] text-blue-600">
                              {order.refundReference}
                            </p>
                            {order.refundedAt && (
                              <p className="mt-1 text-[11px] text-blue-600">
                                {formatDate(order.refundedAt)} {formatTime(order.refundedAt)}
                              </p>
                            )}
                          </div>
                        )}
                        {orderStatus === 'CANCELLED' && order.cancelledAt && (
                          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                            <p className="text-xs font-bold text-gray-700">Cancelada</p>
                            <p className="mt-1 text-[11px] text-gray-600">
                              {formatDate(order.cancelledAt)} {formatTime(order.cancelledAt)}
                            </p>
                          </div>
                        )}
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
