import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type { Product } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { useCartStore } from "@/store/cartStore"
import { ShoppingCart, Star } from "lucide-react"

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
      className="group flex flex-col rounded-2xl overflow-hidden h-full bg-surface border border-border hover:border-accent/40 transition-colors duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        <Link to={`/tienda/${product.slug}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.tags?.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                tag === "nuevo" 
                  ? "bg-accent text-accent-text" 
                  : "bg-black/80 backdrop-blur-sm text-white"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Slide-up Add to Cart Button */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault()
              if (product.isAvailable) addItem(product)
            }}
            disabled={!product.isAvailable}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-accent text-accent-text hover:bg-accent-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            <ShoppingCart size={16} />
            {product.isAvailable ? "Añadir al Carrito" : "Agotado"}
          </motion.button>
        </div>
        
        {/* Subtle gradient to make the slide-up button pop more against bright images */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      <Link to={`/tienda/${product.slug}`} className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-warning">
            <Star size={12} fill="currentColor" />
            {product.rating}
          </div>
        </div>

        <h3 className="text-base font-heading font-bold mb-1 line-clamp-2 text-white tracking-tight group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        
        <p className="text-xs text-text-secondary mb-4 flex-1">
          {product.flavor ? `${product.flavor} • ` : ""}
          {product.weight ? product.weight : product.servings ? `${product.servings} porciones` : "Accesorio / Equipo"}
        </p>

        <div className="mt-auto">
          {product.originalPrice && (
            <span className="text-xs line-through block text-text-muted">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          <span className="text-lg font-black text-white">
            {formatCurrency(product.price)}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
