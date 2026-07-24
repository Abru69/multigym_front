import { Hero } from '../components/Hero'
import { RoutineShowcase } from '../components/RoutineShowcase'
import { Features } from '../components/Features'
import { Pricing } from '../components/Pricing'
import { Footer } from '../components/Footer'
import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'

const platformBrandStyle = {
  '--accent': '#1769e8',
  '--accent-hover': '#1256c7',
  '--accent-light': '#6ea4ff',
  '--accent-muted': 'rgba(23, 105, 232, 0.14)',
  '--accent-text': '#ffffff',
  '--detail': '#22ad55',
  '--primary': '#1769e8',
  '--primary-hover': '#1256c7',
  '--bg-primary': '#07142f',
  '--bg-secondary': '#0b1c3e',
  '--surface': '#0d2146',
  '--card': '#0a1937',
  '--header-bg': '#07142f',
  '--text-primary': '#f4f8ff',
  '--text-secondary': '#b7c7df',
  '--text-muted': '#7f96b8',
  '--text-on-primary': '#ffffff',
  '--border': '#19345d',
  '--shadow-glow': '0 0 24px rgba(23, 105, 232, 0.22)',
} as CSSProperties

export default function LandingPage() {
  return (
    <div style={platformBrandStyle} className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/branding/multigym-isotipo-transparent.png"
              alt="MultiGym"
              className="h-9 w-9 rounded-xl object-contain"
            />
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
            <button
              type="button"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Documentación
            </button>
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
