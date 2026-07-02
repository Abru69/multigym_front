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
} from 'lucide-react'

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const navigate = useNavigate()

  const subtotal = total()
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 150
  const finalTotal = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
        >
          <ShoppingBag size={40} />
        </div>
        <h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Tu carrito está vacío
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
          Parece que aún no has agregado ningún producto. Descubre nuestra selección de suplementos
          premium.
        </p>
        <Link
          to="/tienda"
          className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-bold transition-all"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          Explorar Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between">
        <Link
          to="/tienda"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronLeft size={16} /> Seguir comprando
        </Link>
        <button
          onClick={clearCart}
          className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--danger)', background: 'var(--error-muted)' }}
        >
          Vaciar carrito
        </button>
      </div>

      <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
        Tu Carrito
      </h1>

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* Items List */}
        <div className="w-full flex-1 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map(({ product, quantity }) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                key={product.id}
                className="group relative flex gap-4 rounded-2xl p-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                {/* Image */}
                <Link
                  to={`/tienda/${product.slug}`}
                  className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28"
                  style={{ background: 'var(--background)' }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className="mb-1 block text-[10px] font-bold tracking-wider uppercase"
                        style={{ color: 'var(--accent)' }}
                      >
                        {product.brand}
                      </span>
                      <Link
                        to={`/tienda/${product.slug}`}
                        className="line-clamp-2 text-sm leading-tight font-semibold sm:text-base"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {product.name}
                      </Link>
                    </div>
                    <span
                      className="shrink-0 font-bold sm:text-lg"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {product.flavor ? `${product.flavor} • ` : ''}
                    {product.weight}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    {/* Qty controls */}
                    <div
                      className="flex h-8 items-center rounded-lg px-1"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                    >
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="flex h-full w-7 items-center justify-center transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        className="w-8 text-center text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="flex h-full w-7 items-center justify-center transition-colors disabled:opacity-50"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="rounded-lg p-2 opacity-100 transition-colors group-hover:opacity-100 sm:opacity-0"
                      style={{ color: 'var(--danger)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--error-muted)')
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="sticky top-24 w-full lg:w-[380px]">
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h3 className="mb-6 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Resumen de Orden
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>
                  Subtotal ({items.length} productos)
                </span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Costo de envío</span>
                <span
                  className="font-medium"
                  style={{ color: shipping === 0 ? 'var(--success)' : 'var(--text-primary)' }}
                >
                  {shipping === 0 ? 'Gratis' : formatCurrency(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <div
                  className="rounded-lg p-2 text-[11px]"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
                  ¡Agrega {formatCurrency(1500 - subtotal)} más para obtener envío gratis!
                </div>
              )}
            </div>

            <div className="my-6" style={{ borderTop: '1px dashed var(--border)' }} />

            <div className="mb-8 flex items-end justify-between">
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                Total
              </span>
              <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(finalTotal)}
              </span>
            </div>

            <button
              onClick={() => navigate('/tienda/checkout')}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold transition-all"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              Proceder al Pago
              <ArrowRight size={18} />
            </button>

            <div
              className="mt-4 flex items-center justify-center gap-2 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <ShieldCheck size={14} /> Pago 100% seguro y encriptado
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
