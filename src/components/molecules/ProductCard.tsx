import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/features/shop/store/cartStore'
import { ShoppingCart, Star } from 'lucide-react'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--surface-hover)]">
        <Link to={`/tienda/${product.slug}`} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.tags?.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                tag === 'nuevo'
                  ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                  : 'bg-black/80 text-white backdrop-blur-sm'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full p-4 transition-transform duration-300 ease-out group-hover:translate-y-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault()
              if (product.isAvailable) addItem(product)
            }}
            disabled={!product.isAvailable}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-3 text-sm font-bold uppercase tracking-wide text-[var(--accent-text)] shadow-lg transition-colors hover:bg-[var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart size={16} />
            {product.isAvailable ? 'Añadir al Carrito' : 'Agotado'}
          </motion.button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <Link to={`/tienda/${product.slug}`} className="flex flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
            <Star size={12} fill="currentColor" />
            {product.rating}
          </div>
        </div>

        <h3 className="mb-1 line-clamp-2 text-base font-semibold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
          {product.name}
        </h3>

        <p className="mb-4 flex-1 text-xs text-[var(--text-muted)]">
          {product.flavor ? `${product.flavor} • ` : ''}
          {product.weight
            ? product.weight
            : product.servings
              ? `${product.servings} porciones`
              : 'Accesorio / Equipo'}
        </p>

        <div className="mt-auto">
          {product.originalPrice && (
            <span className="mb-0.5 block text-xs text-[var(--text-muted)] line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          <span className="font-heading text-xl font-black text-[var(--text-primary)]">
            {formatCurrency(product.price)}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
