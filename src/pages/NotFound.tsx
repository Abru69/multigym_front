import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <div className="mb-6 text-8xl font-bold text-[var(--accent)]">404</div>
        <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Página no encontrada</h1>
        <p className="mb-8 text-[var(--text-secondary)]">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-text)] shadow-[var(--accent)]/20 shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Home size={16} className="mr-2" />
            Ir al inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </button>
        </div>
      </motion.div>
    </div>
  )
}
