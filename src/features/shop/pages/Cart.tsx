import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useCartStore } from "@/features/shop/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ChevronLeft } from "lucide-react"

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const navigate = useNavigate()

  const subtotal = total()
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 150
  const finalTotal = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Tu carrito está vacío</h2>
        <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
          Parece que aún no has agregado ningún producto. Descubre nuestra selección de suplementos premium.
        </p>
        <Link
          to="/tienda"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          Explorar Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/tienda" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: "var(--text-secondary)" }}>
          <ChevronLeft size={16} /> Seguir comprando
        </Link>
        <button
          onClick={clearCart}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "var(--danger)", background: "var(--error-muted)" }}
        >
          Vaciar carrito
        </button>
      </div>

      <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>Tu Carrito</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Items List */}
        <div className="flex-1 w-full space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map(({ product, quantity }) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                key={product.id}
                className="flex gap-4 p-4 rounded-2xl relative group"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                {/* Image */}
                <Link to={`/tienda/${product.slug}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0" style={{ background: "var(--background)" }}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: "var(--accent)" }}>{product.brand}</span>
                      <Link to={`/tienda/${product.slug}`} className="font-semibold text-sm sm:text-base line-clamp-2 leading-tight" style={{ color: "var(--text-primary)" }}>
                        {product.name}
                      </Link>
                    </div>
                    <span className="font-bold sm:text-lg shrink-0" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    {product.flavor ? `${product.flavor} • ` : ""}{product.weight}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    {/* Qty controls */}
                    <div className="flex items-center h-8 rounded-lg px-1" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-full flex items-center justify-center transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-7 h-full flex items-center justify-center transition-colors disabled:opacity-50"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-2 rounded-lg transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                      style={{ color: "var(--danger)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--error-muted)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
        <div className="w-full lg:w-[380px] sticky top-24">
          <div className="p-6 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="font-bold text-lg mb-6" style={{ color: "var(--text-primary)" }}>Resumen de Orden</h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Subtotal ({items.length} productos)</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Costo de envío</span>
                <span className="font-medium" style={{ color: shipping === 0 ? "var(--success)" : "var(--text-primary)" }}>
                  {shipping === 0 ? "Gratis" : formatCurrency(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <div className="text-[11px] p-2 rounded-lg" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                  ¡Agrega {formatCurrency(1500 - subtotal)} más para obtener envío gratis!
                </div>
              )}
            </div>

            <div className="my-6" style={{ borderTop: "1px dashed var(--border)" }} />

            <div className="flex justify-between items-end mb-8">
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>Total</span>
              <span className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{formatCurrency(finalTotal)}</span>
            </div>

            <button
              onClick={() => navigate("/tienda/checkout")}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
              style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            >
              Proceder al Pago
              <ArrowRight size={18} />
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <ShieldCheck size={14} /> Pago 100% seguro y encriptado
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShieldCheck(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1.5 7 3a1 1 0 0 1 1 1v6Z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  )
}
