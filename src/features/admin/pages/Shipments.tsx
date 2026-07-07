import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchApi } from '@/lib/api'
import type { OrderDTO, OrderItemDTO, ResponseDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MapPin,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  COMPLETED: { label: 'Entregado', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  PENDING: { label: 'Enviado', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING')

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await fetchApi<ResponseDTO<{ data: OrderDTO[] }>>('/api/orders?deliveryMethod=SHIPPING')
      setOrders(res.dto?.data || [])
    } catch (err) {
      console.error('Failed to load shipments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filtered = orders.filter((o) => filter === 'ALL' || o.status === filter)
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length

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
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} · {completedCount} entregado{completedCount !== 1 ? 's' : ''}
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
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-blue-600">Enviados</p>
          <p className="mt-0.5 font-heading text-lg font-black text-blue-700">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">Entregados</p>
          <p className="mt-0.5 font-heading text-lg font-black text-emerald-700">{completedCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Estado:</span>
        {(['ALL', 'PENDING', 'COMPLETED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
              filter === f
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Enviados' : 'Entregados'}
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
                  <div className="flex items-center gap-3">
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
                                <p className="text-xs font-bold text-[var(--text-primary)]">Dirección de envío</p>
                                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                                  {order.shippingAddress}
                                </p>
                                <p className="text-[11px] text-[var(--text-secondary)]">
                                  {order.shippingCity}{order.shippingPostalCode ? ` CP ${order.shippingPostalCode}` : ''}
                                </p>
                              </div>
                            </div>
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
                            <span className="text-xs text-[var(--text-muted)]">Total + Envío</span>
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
