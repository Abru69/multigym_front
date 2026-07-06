import { Hero } from '../components/Hero'
import { RoutineShowcase } from '../components/RoutineShowcase'
import { Features } from '../components/Features'
import { Pricing } from '../components/Pricing'
import { Footer } from '../components/Footer'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--detail)] text-[var(--text-on-primary)]">
              <Zap size={18} />
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)]">MultiGym</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Características
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Precios
            </a>
            <a
              href="#"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Documentación
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:block"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/registro"
              className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Hero />
        <div id="features">
          <RoutineShowcase />
        </div>
        <Features />
        <div id="pricing">
          <Pricing />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
