import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchApi } from '@/lib/api'
import type { OrderDTO, OrderItemDTO, ResponseDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Store,
  Truck,
  QrCode,
} from 'lucide-react'
import { PickupVoucher } from '@/features/client/components/PickupVoucher'

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  COMPLETED: { label: 'Completada', color: 'var(--success, #22c55e)', dot: 'bg-[var(--success, #22c55e)]' },
  PENDING: { label: 'Pendiente', color: 'var(--warning, #f59e0b)', dot: 'bg-[var(--warning, #f59e0b)]' },
  READY: { label: 'Listo', color: 'var(--info, #3b82f6)', dot: 'bg-[var(--info, #3b82f6)]' },
  FAILED: { label: 'Fallida', color: 'var(--error, #ef4444)', dot: 'bg-[var(--error, #ef4444)]' },
  CANCELLED: { label: 'Cancelada', color: 'var(--text-muted)', dot: 'bg-[var(--text-muted)]' },
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
  const [voucherOrder, setVoucherOrder] = useState<OrderDTO | null>(null)

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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-xs text-[var(--text-muted)]">Cargando órdenes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface)]">
          <AlertCircle size={28} className="text-[var(--error, #ef4444)]" />
        </div>
        <h3 className="mb-1 text-base font-black text-[var(--text-primary)]">
          Error al cargar
        </h3>
        <p className="mb-4 text-sm text-[var(--text-muted)]">{error}</p>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)] transition hover:opacity-90 active:scale-[0.97]"
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
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)]">
          <ShoppingBag size={32} className="text-[var(--accent)]" />
        </div>
        <h3 className="mb-2 text-lg font-black text-[var(--text-primary)]">
          Sin órdenes aún
        </h3>
        <p className="mx-auto max-w-sm text-sm text-[var(--text-muted)]">
          Tus compras aparecerán aquí después de realizar tu primera orden.
        </p>
        <a
          href="/tienda"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--accent-text)] transition hover:opacity-90 active:scale-[0.97]"
        >
          <ShoppingBag size={14} />
          Ir a la Tienda
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Mis Órdenes
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {orders.length} orden{orders.length !== 1 ? 'es' : ''}
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

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: orders.length, color: 'var(--text-primary)' },
          { label: 'Completadas', value: completedCount, color: 'var(--success, #22c55e)' },
          { label: 'Gastado', value: formatCurrency(totalSpent), color: 'var(--accent)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              {stat.label}
            </p>
            <p
              className="mt-1 text-xl font-black"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Entrega:
        </span>
        {([
          { key: 'ALL', label: 'Todas' },
          { key: 'PICKUP', label: 'Recogida', icon: Store },
          { key: 'SHIPPING', label: 'Envío', icon: Truck },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterDelivery(f.key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition ${
              filterDelivery === f.key
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {f.icon && <f.icon size={10} />}
            {f.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Ordenar:
          </span>
          {(['date', 'total'] as const).map((field) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                sortField === field
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {sortField === field ? (
                sortDir === 'desc' ? <ArrowDown size={10} /> : <ArrowUp size={10} />
              ) : (
                <ArrowUpDown size={10} />
              )}
              {field === 'date' ? 'Fecha' : 'Total'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {sortedOrders.map((order, i) => {
          const status = statusConfig[order.status] || statusConfig.PENDING
          const items = (order as OrderDTO & { items?: OrderItemDTO[] }).items || []
          const isExpanded = expandedId === order.id

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-sm"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id!)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)]">
                  <Package size={18} className="text-[var(--text-muted)]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      #{order.id?.slice(0, 8).toUpperCase()}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        color: status.color,
                        borderColor: `color-mix(in srgb, ${status.color} 25%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${status.color} 8%, transparent)`,
                      }}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    {order.deliveryMethod && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-secondary)]">
                        {order.deliveryMethod === 'PICKUP' ? <Store size={9} /> : <Truck size={9} />}
                        {order.deliveryMethod === 'PICKUP' ? 'Recogida' : 'Envío'}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(order.createdAt)}
                    </span>
                    {items.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <ShoppingBag size={10} />
                        {items.length} art{items.length !== 1 ? 'ículos' : 'ículo'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-base font-black text-[var(--text-primary)]">
                    {formatCurrency(Number(order.total))}
                  </p>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--text-muted)]">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </button>

              {/* Expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[var(--border)] px-4 pt-3 pb-4 sm:px-5">
                      {/* Items */}
                      {items.length > 0 && (
                        <div className="mb-3">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
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
                      )}

                      {/* Delivery Info */}
                      {order.deliveryMethod && (
                        <div className="mb-3 rounded-xl bg-[var(--surface)] px-3 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                            Entrega
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                            {order.deliveryMethod === 'PICKUP' ? (
                              <>
                                <Store size={12} className="text-[var(--accent)]" />
                                Recoger en sucursal
                                {order.branchName && (
                                  <span className="font-normal text-[var(--text-secondary)]">
                                    — {order.branchName}
                                  </span>
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
                              {order.shippingAddress}
                              {order.shippingCity ? `, ${order.shippingCity}` : ''}
                              {order.shippingPostalCode ? ` CP ${order.shippingPostalCode}` : ''}
                            </p>
                          )}
                        </div>
                      )}

                      {/* READY */}
                      {order.status === 'READY' && (
                        <div className="mb-3 rounded-xl border border-[var(--info, #3b82f6)]/20 bg-[var(--info, #3b82f6)]/5 px-3 py-2.5">
                          <p className="text-xs font-bold text-[var(--info, #3b82f6)]">
                            Tu pedido está listo para recoger
                            {order.branchName ? ` en ${order.branchName}` : ''}.
                          </p>
                          <button
                            onClick={() => setVoucherOrder(order)}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--info, #3b82f6)] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                          >
                            <QrCode size={12} />
                            Ver Comprobante
                          </button>
                        </div>
                      )}

                      {/* Payment */}
                      <div className="grid grid-cols-2 gap-2">
                        {order.paymentMethod && (
                          <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                              Pago
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                              <span>{paymentIcons[order.paymentMethod] || '💳'}</span>
                              {order.paymentMethod.replace('_', ' ')}
                            </p>
                          </div>
                        )}
                        <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                            Estado
                          </p>
                          <p
                            className="mt-1 text-xs font-bold"
                            style={{
                              color: order.paymentStatus === 'COMPLETED'
                                ? 'var(--success, #22c55e)'
                                : 'var(--warning, #f59e0b)',
                            }}
                          >
                            {order.paymentStatus === 'COMPLETED' ? 'Pagado' :
                             order.paymentStatus === 'PENDING' ? 'Pendiente' :
                             order.paymentStatus === 'FAILED' ? 'Fallido' :
                             order.paymentStatus === 'REFUNDED' ? 'Reembolsado' :
                             order.paymentStatus || 'Pendiente'}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                            Total
                          </p>
                          <p className="mt-1 text-xs font-black text-[var(--text-primary)]">
                            {formatCurrency(Number(order.total))}
                          </p>
                        </div>
                        {order.paymentReference && (
                          <div className="rounded-xl bg-[var(--surface)] px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                              Referencia
                            </p>
                            <p className="mt-1 truncate text-xs font-mono font-bold text-[var(--text-primary)]">
                              {order.paymentReference.slice(0, 16)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Pickup Voucher Modal */}
      {voucherOrder && (
        <PickupVoucher
          isOpen={!!voucherOrder}
          onClose={() => setVoucherOrder(null)}
          order={voucherOrder}
        />
      )}
    </div>
  )
}
