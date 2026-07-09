import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchApi } from '@/lib/api'
import type { Product, ResponseDTO } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/features/shop/store/cartStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import {
  ChevronLeft,
  ShoppingCart,
  Minus,
  Plus,
  Star,
  Info,
  ShieldCheck,
  Truck,
  Lock,
} from 'lucide-react'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const { isAuthenticated } = useAuthStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [productLoading, setProductLoading] = useState(true)
  const cartItem = cartItems.find((i) => i.product.id === product?.id)
  const initialQuantity = cartItem ? cartItem.quantity : 1
  const [quantity, setQuantity] = useState(initialQuantity)

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return
      try {
        setProductLoading(true)
        const response = await fetchApi<ResponseDTO<any>>(`/api/products?search=${slug}`)
        const products = response.dto?.data || []
        const found = products.find((p: any) =>
          p.name.toLowerCase().replace(/ /g, '-') === slug
        )
        if (found) {
          setProduct({
            ...found,
            slug: found.name.toLowerCase().replace(/ /g, '-'),
            brand: found.brand || 'MultiGym',
            image: found.imageUrl || found.image || 'https://images.unsplash.com/photo-1593095948071-474c5cc2c2b0?w=600&h=600&fit=crop',
            category: found.category || 'proteinas',
            rating: found.rating || 5.0,
            reviewCount: found.reviewCount || 0,
            isAvailable: found.stock > 0,
            description: found.description || 'Producto premium de alta calidad.',
            nutritionFacts: found.nutritionFacts || [],
          })
        } else {
          const { mockProducts } = await import('@/data/products')
          setProduct(mockProducts.find((p: any) => p.slug === slug) || null)
        }
      } catch {
        try {
          const { mockProducts } = await import('@/data/products')
          setProduct(mockProducts.find((p: any) => p.slug === slug) || null)
        } catch {
          setProduct(null)
        }
      } finally {
        setProductLoading(false)
      }
    }
    loadProduct()
  }, [slug])

  if (productLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h2 className="mb-3 font-heading text-2xl font-black text-[var(--text-primary)]">
          Producto no encontrado
        </h2>
        <Link
          to="/tienda"
          className="text-sm font-semibold text-[var(--accent)]"
        >
          Volver a la tienda
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (cartItem) {
      updateQuantity(product.id, quantity)
    } else {
      addItem(product)
      if (quantity > 1) {
        updateQuantity(product.id, quantity)
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:py-12">
      <Link
        to="/tienda"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ChevronLeft size={18} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="aspect-square overflow-hidden rounded-3xl bg-[var(--surface-hover)]">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col"
        >
          <span className="mb-3 text-xs font-bold tracking-widest text-[var(--accent)] uppercase">
            {product.brand}
          </span>

          <h1 className="mb-4 font-heading text-3xl font-black text-[var(--text-primary)] sm:text-4xl">
            {product.name}
          </h1>

          <div className="mb-6 flex items-center gap-4 border-b border-[var(--border)] pb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-[var(--border)]'
                  }
                />
              ))}
              <span className="ml-1 text-sm font-medium text-[var(--text-secondary)]">
                ({product.reviewCount})
              </span>
            </div>
            <div className="h-1 w-1 rounded-full bg-gray-200" />
            <span
              className="text-sm font-semibold"
              style={{ color: product.isAvailable ? 'var(--success)' : '#ef4444' }}
            >
              {product.isAvailable ? 'En stock' : 'Agotado'}
            </span>
          </div>

          <div className="mb-6">
            {product.originalPrice && (
              <span className="mb-1 block text-lg text-[var(--text-muted)] line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="font-heading text-4xl font-black text-[var(--text-primary)]">
              {formatCurrency(product.price)}
            </span>
          </div>

          <p className="mb-8 text-sm leading-relaxed text-[var(--text-secondary)]">
            {product.description}
          </p>

          <div className="mt-auto space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-full border border-[var(--border)]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-14 w-14 items-center justify-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-heading text-lg font-black text-[var(--text-primary)]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="flex h-14 w-14 items-center justify-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-sm font-bold uppercase tracking-wide text-[var(--accent-text)] shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={20} />
                {cartItem ? 'Actualizar Carrito' : 'Agregar al Carrito'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { icon: ShieldCheck, text: 'Garantía de calidad' },
                { icon: Truck, text: 'Envío seguro' },
                { icon: Lock, text: 'Pago encriptado' },
              ].map((f) => (
                <div
                  key={f.text}
                  className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-4 text-center"
                >
                  <f.icon size={18} className="text-[var(--accent)]" />
                  <span className="text-[11px] font-medium text-[var(--text-secondary)]">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-t border-[var(--border)] pt-12"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10">
            <Info size={20} className="text-[var(--accent)]" />
          </div>
          <h2 className="font-heading text-xl font-black text-[var(--text-primary)]">
            Información Nutricional
          </h2>
        </div>

        {product.nutritionFacts && product.nutritionFacts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              <div className="mb-4 flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">
                  Tamaño de porción:{' '}
                  <strong className="text-[var(--text-primary)]">
                    {product.servingSize || 'N/A'}
                  </strong>
                </span>
                <span className="text-[var(--text-muted)]">
                  Porciones:{' '}
                  <strong className="text-[var(--text-primary)]">
                    {product.servings || 'N/A'}
                  </strong>
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                {product.nutritionFacts.map((fact, i) => (
                  <div
                    key={fact.label}
                    className={`flex justify-between p-4 text-sm ${
                      i % 2 === 0 ? 'bg-[var(--card)]' : 'bg-[var(--surface)]'
                    }`}
                  >
                    <span className="font-medium text-[var(--text-primary)]">{fact.label}</span>
                    <div className="text-right">
                      <span className="font-bold text-[var(--text-primary)]">{fact.value}</span>
                      {fact.dailyValue && (
                        <span className="ml-3 text-xs text-[var(--text-muted)]">
                          {fact.dailyValue}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-heading font-bold text-[var(--text-primary)]">
                Detalles del producto
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { label: 'Sabor', value: product.flavor },
                  { label: 'Peso', value: product.weight },
                  { label: 'Categoría', value: product.category },
                ].map(
                  (d) =>
                    d.value && (
                      <li
                        key={d.label}
                        className="flex justify-between border-b border-[var(--border)] pb-3"
                      >
                        <span className="text-[var(--text-muted)]">{d.label}</span>
                        <span className="font-medium capitalize text-[var(--text-primary)]">
                          {d.value}
                        </span>
                      </li>
                    )
                )}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            No hay información nutricional disponible para este producto.
          </p>
        )}
      </motion.div>
    </div>
  )
}
