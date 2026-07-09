import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/features/shop/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Lock,
} from 'lucide-react'

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const navigate = useNavigate()

  const subtotal = total()
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 150
  const finalTotal = subtotal + shipping
  const freeShippingDiff = 1500 - subtotal

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--surface)]">
          <ShoppingBag size={40} className="text-[var(--text-muted)]" />
        </div>
        <h2 className="mb-2 text-xl font-black text-[var(--text-primary)]">
          Carrito vacío
        </h2>
        <p className="mb-8 max-w-sm text-sm text-[var(--text-muted)]">
          Explora nuestra selección de suplementos premium y agrega productos a tu carrito.
        </p>
        <Link
          to="/tienda"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3 text-sm font-bold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
        >
          <ShoppingBag size={16} />
          Explorar Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Back */}
      <Link
        to="/tienda"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ChevronLeft size={16} />
        Seguir comprando
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Tu Carrito
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            {items.length} producto{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-bold text-[var(--text-muted)] transition-all hover:border-[var(--error, #ef4444)]/20 hover:bg-[var(--error, #ef4444)]/5 hover:text-[var(--error, #ef4444)]"
        >
          Vaciar
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Items */}
        <div className="flex-1 space-y-3">
          <AnimatePresence mode="popLayout">
            {items.map(({ product, quantity }) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                key={product.id}
                className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:shadow-sm"
              >
                {/* Image */}
                <Link
                  to={`/tienda/${product.slug}`}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface)]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                        {product.brand}
                      </span>
                      <Link
                        to={`/tienda/${product.slug}`}
                        className="line-clamp-2 text-sm font-semibold leading-tight text-[var(--text-primary)]"
                      >
                        {product.name}
                      </Link>
                    </div>
                    <span className="shrink-0 text-base font-black text-[var(--text-primary)]">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {product.flavor ? `${product.flavor} · ` : ''}
                    {product.weight}
                  </p>

                  {/* Quantity + Remove */}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center overflow-hidden rounded-lg border border-[var(--border)]">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[var(--text-primary)]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="flex h-8 w-8 items-center justify-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--error, #ef4444)]/10 hover:text-[var(--error, #ef4444)]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="sticky top-24 w-full lg:w-[340px]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h3 className="mb-5 text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
              Resumen
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">
                  Subtotal ({items.length})
                </span>
                <span className="font-bold text-[var(--text-primary)]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Envío</span>
                <span
                  className={`font-bold ${
                    shipping === 0 ? 'text-[var(--success, #22c55e)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {shipping === 0 ? 'Gratis' : formatCurrency(shipping)}
                </span>
              </div>
            </div>

            {shipping > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--accent)]/5 px-3 py-2.5 text-xs font-medium text-[var(--accent)]">
                <Truck size={14} />
                Agrega {formatCurrency(freeShippingDiff)} más para envío gratis
              </div>
            )}

            <div className="my-5 border-t border-[var(--border)]" />

            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-[var(--text-primary)]">Total</span>
              <span className="text-2xl font-black text-[var(--text-primary)]">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            <button
              onClick={() => navigate('/tienda/checkout')}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3.5 text-sm font-bold uppercase tracking-wide text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
            >
              <Lock size={14} />
              Proceder al Pago
              <ArrowRight size={14} />
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <ShieldCheck size={12} />
              Pago seguro y encriptado
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
