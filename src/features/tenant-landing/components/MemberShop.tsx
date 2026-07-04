import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'

export function MemberShop() {
  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Tienda</h2>
          <Link
            to="/tienda"
            className="flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors hover:brightness-110"
          >
            Ver catálogo <ArrowRight size={14} />
          </Link>
        </div>

        <Link
          to="/tienda"
          className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--accent)]/30 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] transition-all group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-text)]">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Suplementos y Accesorios</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Explora nuestra tienda de productos deportivos
              </p>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  )
}
