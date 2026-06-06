import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { mockProducts } from "@/data/products"
import { formatCurrency } from "@/lib/utils"
import { useCartStore } from "@/features/shop/store/cartStore"
import { ChevronLeft, ShoppingCart, Minus, Plus, Star, Info, Package, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function ProductDetail() {
  const { slug } = useParams()
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const product = mockProducts.find((p) => p.slug === slug)
  const cartItem = cartItems.find((i) => i.product.id === product?.id)
  const initialQuantity = cartItem ? cartItem.quantity : 1
  const [quantity, setQuantity] = useState(initialQuantity)

  // Update local quantity if cart changes externally
  useEffect(() => {
    if (cartItem) setQuantity(cartItem.quantity)
  }, [cartItem])

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Producto no encontrado</h2>
        <Link to="/tienda" className="text-sm font-medium" style={{ color: "var(--accent)" }}>Volver a la tienda</Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (cartItem) {
      updateQuantity(product.id, quantity)
    } else {
      for (let i = 0; i < quantity; i++) {
        addItem(product)
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      <Link to="/tienda" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color: "var(--text-secondary)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
        <ChevronLeft size={16} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--accent)" }}>{product.brand}</span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: "var(--warning)" }}>
              <Star size={16} fill="currentColor" />
              {product.rating} <span style={{ color: "var(--text-muted)" }}>({product.reviewCount})</span>
            </div>
            <div className="w-1 h-1 rounded-full" style={{ background: "var(--border)" }} />
            <span className="text-sm font-medium" style={{ color: product.isAvailable ? "var(--success)" : "var(--danger)" }}>
              {product.isAvailable ? "En stock" : "Agotado"}
            </span>
          </div>

          <div className="mb-6">
            {product.originalPrice && (
              <span className="text-lg line-through block mb-1" style={{ color: "var(--text-muted)" }}>
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>
              {formatCurrency(product.price)}
            </span>
          </div>

          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
            {product.description}
          </p>

          {/* Actions */}
          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-4">
              {/* Qty */}
              <div className="flex items-center h-14 rounded-xl px-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <Button
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 p-0 border-none"
                >
                  <Minus size={16} />
                </Button>
                <span className="w-12 text-center font-bold" style={{ color: "var(--text-primary)" }}>{quantity}</span>
                <Button
                  variant="outline"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 p-0 border-none"
                >
                  <Plus size={16} />
                </Button>
              </div>

              {/* Add to cart */}
              <Button
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                className="flex-1 h-14 text-base gap-2"
              >
                <ShoppingCart size={20} />
                {cartItem ? "Actualizar Carrito" : "Agregar al Carrito"}
              </Button>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-2 gap-3 pt-6">
              {[
                { icon: ShieldCheck, text: "Garantía de calidad" },
                { icon: Package, text: "Envío seguro" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  <f.icon size={16} /> {f.text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Details Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-16 pt-16"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-8">
          <Info size={24} style={{ color: "var(--accent)" }} />
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Información Nutricional</h2>
        </div>

        {product.nutritionFacts && product.nutritionFacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-4">
                <span style={{ color: "var(--text-muted)" }}>Tamaño de porción: <strong style={{ color: "var(--text-primary)" }}>{product.servingSize || "N/A"}</strong></span>
                <span style={{ color: "var(--text-muted)" }}>Porciones: <strong style={{ color: "var(--text-primary)" }}>{product.servings || "N/A"}</strong></span>
              </div>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                {product.nutritionFacts.map((fact, i) => (
                  <div key={fact.label} className="flex justify-between p-4 text-sm" style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--background)" }}>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{fact.label}</span>
                    <div className="text-right">
                      <span className="font-bold" style={{ color: "var(--text-primary)" }}>{fact.value}</span>
                      {fact.dailyValue && <span className="ml-3 text-xs" style={{ color: "var(--text-muted)" }}>{fact.dailyValue}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Detalles del producto</h3>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Sabor", value: product.flavor },
                  { label: "Peso", value: product.weight },
                  { label: "Categoría", value: product.category },
                ].map((d) => d.value && (
                  <li key={d.label} className="flex justify-between pb-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{d.label}</span>
                    <span className="font-medium capitalize" style={{ color: "var(--text-primary)" }}>{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No hay información nutricional disponible para este producto.</p>
        )}
      </motion.div>
    </div>
  )
}
