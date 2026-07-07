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
        <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-[var(--surface-hover)]">
          <ShoppingBag size={52} className="text-gray-300" />
        </div>
        <h2 className="mb-3 font-heading text-3xl font-black text-[var(--text-primary)]">
          Tu carrito está vacío
        </h2>
        <p className="mb-10 max-w-md text-base text-[var(--text-secondary)]">
          Parece que aún no has agregado ningún producto. Descubre nuestra selección de suplementos
          premium.
        </p>
        <Link
          to="/tienda"
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-10 py-4 text-sm font-bold uppercase tracking-wide text-[var(--accent-text)] shadow-md transition-all hover:shadow-lg"
        >
          Explorar Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-12">
      <Link
        to="/tienda"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ChevronLeft size={18} /> Seguir comprando
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-black text-[var(--text-primary)]">Tu Carrito</h1>
        <button
          onClick={clearCart}
          className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="w-full flex-1 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map(({ product, quantity }) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.25 } }}
                key={product.id}
                className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
              >
                <Link
                  to={`/tienda/${product.slug}`}
                  className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--surface-hover)] sm:h-[80px] sm:w-[80px]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="mb-1 block text-[10px] font-bold tracking-widest text-[var(--accent)] uppercase">
                        {product.brand}
                      </span>
                      <Link
                        to={`/tienda/${product.slug}`}
                        className="line-clamp-2 text-sm font-semibold leading-tight text-[var(--text-primary)]"
                      >
                        {product.name}
                      </Link>
                    </div>
                    <span className="shrink-0 font-heading text-lg font-black text-[var(--text-primary)]">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {product.flavor ? `${product.flavor} • ` : ''}
                    {product.weight}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center overflow-hidden rounded-full border border-[var(--border)]">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-[var(--text-primary)]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="flex h-9 w-9 items-center justify-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="rounded-full p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="sticky top-24 w-full lg:w-[380px]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <h3 className="mb-6 font-heading text-lg font-black text-[var(--text-primary)]">
              Resumen de Orden
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">
                  Subtotal ({items.length} productos)
                </span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Envío</span>
                <span
                  className={`font-semibold ${
                    shipping === 0 ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {shipping === 0 ? 'Gratis' : formatCurrency(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-[var(--accent)]/10 px-4 py-3 text-xs font-medium text-[var(--accent-text)]">
                  <Truck size={16} />
                  ¡Agrega {formatCurrency(freeShippingDiff)} más para envío gratis!
                </div>
              )}
            </div>

            <div className="my-6 border-t border-dashed border-[var(--border)]" />

            <div className="mb-8 flex items-end justify-between">
              <span className="font-heading font-bold text-[var(--text-primary)]">Total</span>
              <span className="font-heading text-2xl font-black text-[var(--text-primary)]">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            <button
              onClick={() => navigate('/tienda/checkout')}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-4 font-bold uppercase tracking-wide text-[var(--accent-text)] shadow-md transition-all hover:shadow-lg"
            >
              Proceder al Pago
              <ArrowRight size={18} />
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
              <ShieldCheck size={14} /> Pago 100% seguro y encriptado
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
