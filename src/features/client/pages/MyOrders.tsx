import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchApi } from '@/lib/api'
import type { OrderDTO, OrderItemDTO, ResponseDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  Package,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Banknote,
  Hash,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Store,
  Truck,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  COMPLETED: { label: 'Completada', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  PENDING: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  FAILED: { label: 'Fallida', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
  CANCELLED: { label: 'Cancelada', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
}

const paymentIcons: Record<string, string> = {
  CREDIT_CARD: '💳',
  DEBIT_CARD: '💳',
  CASH: '💵',
  TRANSFER: '🏦',
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

export default function MyOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'date' | 'total'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterDelivery, setFilterDelivery] = useState<'ALL' | 'PICKUP' | 'SHIPPING'>('ALL')

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetchApi<ResponseDTO<{ data: OrderDTO[] }>>('/api/orders/my')
      setOrders(res.dto?.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const totalSpent = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + Number(o.total), 0)
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length

  const sortedOrders = [...orders]
    .filter((o) => filterDelivery === 'ALL' || o.deliveryMethod === filterDelivery)
    .sort((a, b) => {
    if (sortField === 'date') {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return sortDir === 'desc' ? db - da : da - db
    }
    const diff = Number(a.total) - Number(b.total)
    return sortDir === 'desc' ? -diff : diff
  })

  const toggleSort = (field: 'date' | 'total') => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-xs text-[var(--text-muted)]">Cargando órdenes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h3 className="mb-1 font-heading text-lg font-bold text-[var(--text-primary)]">Error al cargar</h3>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">{error}</p>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <RefreshCw size={14} />
          Reintentar
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5">
          <ShoppingBag size={36} className="text-[var(--accent)]" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-black text-[var(--text-primary)]">
          Sin órdenes aún
        </h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
          Tus compras aparecerán aquí después de realizar tu primera orden en la tienda.
        </p>
        <a
          href="/tienda"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <ShoppingBag size={14} />
          Ir a la Tienda
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-[var(--text-primary)]">
            Mis Órdenes
          </h1>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {orders.length} orden{orders.length !== 1 ? 'es' : ''} en total
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
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Total</p>
          <p className="mt-0.5 font-heading text-lg font-black text-[var(--text-primary)]">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">Completadas</p>
          <p className="mt-0.5 font-heading text-lg font-black text-emerald-700">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600">Gastado</p>
          <p className="mt-0.5 font-heading text-lg font-black text-amber-700">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Ordenar:</span>
        <button
          onClick={() => toggleSort('date')}
          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
            sortField === 'date'
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          {sortField === 'date' ? (sortDir === 'desc' ? <ArrowDown size={10} /> : <ArrowUp size={10} />) : <ArrowUpDown size={10} />}
          Fecha
        </button>
        <button
          onClick={() => toggleSort('total')}
          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
            sortField === 'total'
              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
              : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          {sortField === 'total' ? (sortDir === 'desc' ? <ArrowDown size={10} /> : <ArrowUp size={10} />) : <ArrowUpDown size={10} />}
          Total
        </button>
      </div>

      {/* Delivery Filter */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Entrega:</span>
        {(['ALL', 'PICKUP', 'SHIPPING'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterDelivery(f)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
              filterDelivery === f
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {f === 'ALL' ? 'Todas' : f === 'PICKUP' ? <><Store size={10} /> Recogida</> : <><Truck size={10} /> Envío</>}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {sortedOrders.map((order, i) => {
          const status = statusConfig[order.status] || statusConfig.PENDING
          const items = (order as OrderDTO & { items?: OrderItemDTO[] }).items || []
          const isExpanded = expandedId === order.id
          const itemCount = items.length

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition hover:shadow-md"
            >
              {/* Header Row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id!)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-hover)]">
                  <Package size={18} className="text-[var(--text-muted)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      Orden #{order.id?.slice(0, 8).toUpperCase()}
                    </p>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.bg} ${status.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    {order.deliveryMethod && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                        {order.deliveryMethod === 'PICKUP' ? <Store size={9} /> : <Truck size={9} />}
                        {order.deliveryMethod === 'PICKUP' ? 'Recogida' : 'Envío'}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(order.createdAt)}
                    </span>
                    {itemCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <ShoppingBag size={10} />
                        {itemCount} art{itemCount !== 1 ? 'ículos' : 'ículo'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-heading text-base font-black text-[var(--text-primary)]">
                      {formatCurrency(Number(order.total))}
                    </p>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface-hover)] text-[var(--text-muted)]">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[var(--border)] px-4 pt-3 pb-4 sm:px-5">
                      {/* Items */}
                      {items.length > 0 ? (
                        <div className="mb-3">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            Artículos
                          </p>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-xl bg-[var(--surface)] px-3 py-2.5"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                    {item.productName}
                                  </p>
                                  <p className="text-[11px] text-[var(--text-muted)]">
                                    {item.quantity} x {formatCurrency(Number(item.unitPrice))}
                                  </p>
                                </div>
                                <p className="ml-3 text-sm font-bold text-[var(--text-primary)]">
                                  {formatCurrency(Number(item.subtotal))}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3 rounded-xl bg-[var(--surface)] px-3 py-4 text-center">
                          <p className="text-xs text-[var(--text-muted)]">
                            Órdenes anteriores sin detalles de artículos
                          </p>
                        </div>
                      )}

                      {/* Delivery Info */}
                      {order.deliveryMethod && (
                        <div className="mb-3 rounded-xl bg-[var(--surface)] px-3 py-2.5">
                          <p className="text-[10px] font-medium text-[var(--text-muted)]">Método de entrega</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                            {order.deliveryMethod === 'PICKUP' ? (
                              <>
                                <Store size={12} className="text-[var(--accent)]" />
                                Recoger en sucursal
                                {order.branchName && (
                                  <span className="font-normal text-[var(--text-secondary)]"> — {order.branchName}</span>
                                )}
                              </>
                            ) : (
                              <>
                                <Truck size={12} className="text-[var(--accent)]" />
                                Envío a domicilio
                              </>
                            )}
                          </p>
                          {order.deliveryMethod === 'SHIPPING' && order.shippingAddress && (
                            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                              {order.shippingAddress}{order.shippingCity ? `, ${order.shippingCity}` : ''}{order.shippingPostalCode ? ` CP ${order.shippingPostalCode}` : ''}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Payment Info */}
                      <div className="grid grid-cols-2 gap-2">
                        {order.paymentMethod && (
                          <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">Método de pago</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                              <span>{paymentIcons[order.paymentMethod] || '💳'}</span>
                              {order.paymentMethod.replace('_', ' ')}
                            </p>
                          </div>
                        )}
                        {order.paymentReference && (
                          <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                            <p className="text-[10px] font-medium text-[var(--text-muted)]">Referencia</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold font-mono text-[var(--text-primary)]">
                              <Hash size={10} className="text-[var(--text-muted)]" />
                              {order.paymentReference.slice(0, 20)}
                            </p>
                          </div>
                        )}
                        <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                          <p className="text-[10px] font-medium text-[var(--text-muted)]">Pago</p>
                          <p className={`mt-0.5 text-xs font-semibold ${
                            order.paymentStatus === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {order.paymentStatus || 'PENDING'}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                          <p className="text-[10px] font-medium text-[var(--text-muted)]">Total pagado</p>
                          <p className="mt-0.5 text-xs font-bold text-[var(--text-primary)]">
                            {formatCurrency(Number(order.total))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
