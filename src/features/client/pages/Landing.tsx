import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
  Zap,
  Shield,
  Users,
  LogOut,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getTenantUrl } from '@/lib/tenant'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { getAllowedPages } from '@/lib/permissions'
import SaaSLanding from './SaaSLanding'

const features = [
  {
    icon: Dumbbell,
    title: 'Rutinas Personalizadas',
    desc: 'Planes de entrenamiento diseñados para tus objetivos con videos demostrativos.',
  },
  {
    icon: ShoppingBag,
    title: 'Suplementación Premium',
    desc: 'Tienda con los mejores suplementos, proteínas y pre-entrenos del mercado.',
  },
  {
    icon: TrendingUp,
    title: 'Seguimiento de Progreso',
    desc: 'Gráficas detalladas de tu evolución en peso, medidas y rendimiento.',
  },
  {
    icon: Shield,
    title: 'Asesoría Profesional',
    desc: 'Entrenadores certificados construyen tu rutina según tu nivel y metas.',
  },
  {
    icon: Zap,
    title: 'Resultados Reales',
    desc: 'Método probado con cientos de clientes que han transformado su cuerpo.',
  },
  {
    icon: Users,
    title: 'Comunidad Activa',
    desc: 'Únete a una comunidad motivada que entrena con propósito y disciplina.',
  },
]

export default function Landing() {
  const featuresRef = useRef(null)
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: '-100px' })
  const { user, isAuthenticated, logout, tenantId: authTenantId } = useAuthStore()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const { branding, isTenantContext } = useTenantBranding()

  if (!isTenantContext) {
    return <SaaSLanding />
  }

  const hasAdminAccess = getAllowedPages(user?.role).length > 0
  const portalLink = hasAdminAccess ? '/admin' : '/app/rutinas'
  const ctaText = isAuthenticated
    ? hasAdminAccess
      ? branding.hero.ctaAuthenticatedAdmin
      : branding.hero.ctaAuthenticatedClient
    : branding.hero.ctaText

  const handleLogout = async () => {
    const currentTenantId = authTenantId || user?.tenantId
    await logout()
    setShowMenu(false)
    if (currentTenantId) {
      window.location.href = getTenantUrl(currentTenantId)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="bg-[var(--card)] min-h-screen font-sans">
      {/* ─── NAV ────────────────────────────────────────────── */}
      <nav className="fixed top-0 right-0 left-0 z-50 mx-auto w-full border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent)] text-[var(--accent-text)] flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black shadow-md shadow-[var(--accent)]/20">
              {branding.logoAbbr}
            </div>
            <span className="font-heading text-xl font-black tracking-tight text-[var(--text-primary)]">
              {branding.name.toUpperCase()}
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Características
            </a>
            <Link
              to="/tienda"
              className="text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Tienda
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowMenu(!showMenu)}
                  className="gap-2 rounded-xl border-[var(--border)] py-2.5 px-4 text-[var(--text-primary)] hover:border-[var(--accent)]"
                >
                  <div className="bg-[var(--accent)]/10 text-[var(--accent)] flex h-7 w-7 items-center justify-center overflow-hidden rounded-full">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        className="h-full w-full object-cover"
                        alt={user.name}
                      />
                    ) : (
                      <UserIcon size={14} />
                    )}
                  </div>
                  <span className="hidden truncate text-sm font-semibold sm:block">
                    {user?.name.split(' ')[0]}
                  </span>
                </Button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] py-1.5 shadow-xl"
                    >
                      <Link
                        to={portalLink}
                        onClick={() => setShowMenu(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
                      >
                        Mi Portal
                      </Link>
                      <Link
                        to="/tienda"
                        onClick={() => setShowMenu(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] sm:hidden"
                      >
                        Tienda
                      </Link>
                      <div className="my-1 h-px bg-[var(--border)]" />
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start rounded-none px-4 py-2.5 text-sm text-[var(--error)] hover:bg-red-500/10"
                      >
                        <LogOut size={14} /> Cerrar Sesión
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="rounded-xl px-6 py-2.5 text-sm font-bold"
              >
                ENTRAR
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-black">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start px-6 pt-28 pb-20 lg:flex-row lg:items-center lg:justify-between lg:pt-0">
          {/* Left — Text */}
          <div className="flex max-w-xl flex-col items-start">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest text-white/80 uppercase backdrop-blur-sm"
            >
              {branding.hero.badge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-heading text-5xl sm:text-7xl lg:text-8xl font-black uppercase text-white leading-[0.95] tracking-tight"
            >
              {branding.hero.title}
              <br />
              <span className="text-[var(--accent)]">{branding.hero.titleAccent}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 max-w-md text-lg text-white/70 leading-relaxed"
            >
              {branding.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Button
                onClick={() => navigate(isAuthenticated ? portalLink : '/registro')}
                className="bg-[var(--accent)] text-[var(--accent-text)] px-8 py-4 rounded-xl font-bold text-base uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[var(--accent)]/20"
              >
                {ctaText}
                <ChevronRight size={18} strokeWidth={3} />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/tienda')}
                className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-base uppercase tracking-wider hover:bg-white/10"
              >
                {branding.hero.secondaryCta}
              </Button>
            </motion.div>
          </div>

          {/* Right — Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-16 hidden w-full max-w-md lg:block"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              {/* Chart bars */}
              <div className="mb-4 flex items-end gap-2 h-40">
                {[45, 70, 55, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-[var(--accent)]"
                    style={{ height: `${h}%`, opacity: 0.4 + (i * 0.06) }}
                  />
                ))}
              </div>
              {/* Stat blocks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-4">
                  <div className="mb-2 h-2 w-12 rounded bg-white/30" />
                  <div className="mb-1 h-5 w-20 rounded bg-[var(--accent)]" />
                  <div className="h-2 w-16 rounded bg-white/20" />
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <div className="mb-2 h-2 w-12 rounded bg-white/30" />
                  <div className="mb-1 h-5 w-20 rounded bg-[var(--accent)]" />
                  <div className="h-2 w-16 rounded bg-white/20" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS MARQUEE ────────────────────────────────────── */}
      <section className="bg-[var(--accent)]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between gap-8 overflow-x-auto snap-x sm:snap-none sm:flex-row sm:gap-0">
            {branding.stats.map(([val, label]) => (
              <div key={label} className="flex flex-col items-center text-center snap-center min-w-[160px] sm:min-w-0">
                <p className="font-heading text-3xl font-black text-[var(--accent-text)]">{val}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-text)]/70">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES (alternating) ──────────────────────────── */}
      <section id="features" className="bg-[var(--card)]" ref={featuresRef}>
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-[var(--accent)]">
              {branding.featuresHeading}
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-[var(--text-primary)]">
              {branding.featuresHeadingAccent}
            </h2>
          </div>

          <div className="space-y-20">
            {features.map((f, i) => {
              const isReversed = i % 2 === 1
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className={`flex flex-col items-center gap-12 ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
                >
                  {/* Text */}
                  <div className="flex-1 space-y-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10">
                      <f.icon size={26} className="text-[var(--accent)]" strokeWidth={2} />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
                      {f.title}
                    </h3>
                    <p className="text-base leading-relaxed text-[var(--text-secondary)]">
                      {f.desc}
                    </p>
                  </div>
                  {/* Illustration placeholder */}
                  <div className="flex-1">
                    <div
                      className="flex h-72 items-center justify-center rounded-3xl"
                      style={{
                        background: `linear-gradient(135deg, var(--accent)/5, var(--accent)/15)`,
                      }}
                    >
                      <div className="relative h-40 w-40">
                        <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20" />
                        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[var(--accent)]/40" />
                        <f.icon
                          size={32}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent)]"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────── */}
      <section className="bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-[var(--accent)]">
              Planes
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-[var(--text-primary)]">
              {branding.featuresHeading}
            </h2>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: 'Starter',
                price: '$5,000',
                desc: 'Perfecto para estudios pequeños y entrenadores independientes.',
                features: ['Hasta 100 miembros', '1 sede', 'Soporte por email', 'Reportes básicos', 'Catálogo de 50 productos'],
                featured: false,
              },
              {
                name: 'Pro',
                price: '$12,000',
                desc: 'La mejor opción para gimnasios en crecimiento que necesitan control total.',
                features: ['Hasta 500 miembros', '3 sedes', 'Soporte prioritario', 'Reportes avanzados', 'E-commerce ilimitado', 'App móvil PWA'],
                featured: true,
              },
              {
                name: 'Enterprise',
                price: '$35,000',
                desc: 'Para cadenas de gimnasios y franquicias con necesidades avanzadas.',
                features: ['Miembros ilimitados', 'Sedes ilimitadas', 'Soporte 24/7 dedicado', 'Acceso a API', 'SLA 99.9%', 'Personalización total'],
                featured: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  p.featured
                    ? 'bg-[var(--text-primary)] text-white shadow-2xl scale-[1.04]'
                    : 'bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-md)]'
                }`}
              >
                {p.featured && (
                  <div className="absolute top-0 left-0 right-0 bg-[var(--accent)] px-4 py-1.5 text-center text-xs font-black uppercase tracking-widest text-[var(--accent-text)]">
                    Más Popular
                  </div>
                )}

                <div className={p.featured ? 'pt-4' : ''}>
                  <h3 className="font-heading text-xl font-bold text-[var(--text-primary)]">
                    {p.name}
                  </h3>
                  <p className={`mt-2 mb-6 text-sm ${p.featured ? 'text-white/60' : 'text-[var(--text-secondary)]'}`}>
                    {p.desc}
                  </p>

                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="font-heading text-5xl font-black text-[var(--text-primary)]">
                      {p.price}
                    </span>
                    <span className={`text-sm font-medium ${p.featured ? 'text-white/50' : 'text-[var(--text-muted)]'}`}>
                      MXN/año
                    </span>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <svg
                          className={`h-4 w-4 shrink-0 ${p.featured ? 'text-[var(--accent)]' : 'text-[var(--success)]'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={p.featured ? 'text-white/80' : 'text-[var(--text-secondary)]'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => navigate(isAuthenticated ? portalLink : '/registro')}
                    className={`w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider ${
                      p.featured
                        ? 'bg-[var(--accent)] text-[var(--accent-text)] hover:brightness-110 shadow-lg shadow-[var(--accent)]/20'
                        : 'border-2 border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--text-primary)]'
                    }`}
                  >
                    Comenzar Ahora
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────── */}
      <section className="bg-[var(--text-primary)]">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <h2 className="font-heading text-4xl sm:text-6xl font-black uppercase text-white leading-tight">
            {isAuthenticated ? branding.ctaHeadingAuth : branding.ctaHeadingGuest}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            {isAuthenticated ? branding.ctaSubAuth : branding.ctaSubGuest}
          </p>
          <div className="mt-10">
            <Button
              onClick={() => navigate(isAuthenticated ? portalLink : '/registro')}
              className="bg-[var(--accent)] text-[var(--accent-text)] px-10 py-4 rounded-xl font-bold text-base uppercase tracking-wider hover:brightness-110 shadow-xl shadow-[var(--accent)]/20"
            >
              {isAuthenticated ? branding.ctaButtonAuth : branding.ctaButtonGuest}
              <ChevronRight size={18} strokeWidth={3} />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent)] text-[var(--accent-text)] flex h-9 w-9 items-center justify-center rounded-lg text-xs font-black">
              {branding.logoAbbr}
            </div>
            <span className="font-heading text-sm font-bold tracking-tight text-[var(--text-primary)]">
              {branding.name.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-6">
            {!isTenantContext && (
              <Link
                to="/platform/login"
                className="text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
              >
                Panel SaaS
              </Link>
            )}
            <p className="text-xs font-medium text-[var(--text-muted)]">
              © {new Date().getFullYear()} {branding.name}. {branding.tagline}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
