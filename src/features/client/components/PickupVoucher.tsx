import { QRCodeSVG } from 'qrcode.react'
import { Modal } from '@/components/ui/Modal'
import type { OrderDTO, OrderItemDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Store, MapPin, CreditCard, Hash, Calendar, Clock } from 'lucide-react'

interface PickupVoucherProps {
  isOpen: boolean
  onClose: () => void
  order: OrderDTO
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatTime(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export function PickupVoucher({ isOpen, onClose, order }: PickupVoucherProps) {
  const items = (order as OrderDTO & { items?: OrderItemDTO[] }).items || []
  const orderShortId = order.id?.slice(0, 8).toUpperCase() || ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={true}>
      <div className="flex flex-col items-center">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10">
            <Store size={20} className="text-[var(--accent)]" />
          </div>
          <h3 className="font-heading text-lg font-black text-[var(--text-primary)]">
            Comprobante de Recogida
          </h3>
          <p className="text-xs text-[var(--text-muted)]">Muestra este comprobante en sucursal</p>
        </div>

        {/* QR Code */}
        <div className="mb-4 rounded-2xl border-2 border-dashed border-[var(--border)] bg-white p-4">
          <QRCodeSVG
            value={order.id || ''}
            size={160}
            level="M"
            includeMargin={false}
            fgColor="#1a1a1a"
            bgColor="#ffffff"
          />
        </div>

        {/* Order Number */}
        <div className="mb-4 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Número de Orden
          </p>
          <p className="font-mono text-2xl font-black tracking-widest text-[var(--text-primary)]">
            #{orderShortId}
          </p>
        </div>

        {/* Branch Info */}
        {order.branchName && (
          <div className="mb-3 w-full rounded-xl bg-[var(--surface)] px-4 py-3">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">{order.branchName}</p>
                <p className="text-[11px] text-[var(--text-secondary)]">Sucursal de recogida</p>
              </div>
            </div>
          </div>
        )}

        {/* Date & Time */}
        <div className="mb-3 flex w-full gap-2">
          <div className="flex-1 rounded-xl bg-[var(--surface)] px-3 py-2">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Calendar size={10} />
              <span className="text-[10px] font-medium">Fecha</span>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-[var(--text-primary)]">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex-1 rounded-xl bg-[var(--surface)] px-3 py-2">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Clock size={10} />
              <span className="text-[10px] font-medium">Hora</span>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-[var(--text-primary)]">
              {formatTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="mb-3 w-full space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Artículos
            </p>
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-1.5">
                <span className="text-xs text-[var(--text-primary)]">
                  {item.quantity}x {item.productName}
                </span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {formatCurrency(Number(item.subtotal))}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Payment */}
        <div className="mb-3 w-full rounded-xl bg-[var(--surface)] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <CreditCard size={12} />
              <span className="text-xs">{order.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash size={10} className="text-[var(--text-muted)]" />
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {order.paymentReference?.slice(0, 16) || '—'}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-2">
            <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
            <span className="font-heading text-lg font-black text-[var(--text-primary)]">
              {formatCurrency(Number(order.total))}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-blue-700">
            Presenta este comprobante al personal de la sucursal para recoger tu pedido.
          </p>
        </div>
      </div>
    </Modal>
  )
}
