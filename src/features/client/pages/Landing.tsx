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

const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as any } },
}

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

  const portalLink = user?.role === 'admin' ? '/admin' : '/app/rutinas'
  const ctaText = isAuthenticated
    ? user?.role === 'admin'
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
    <div className="bg-background min-h-screen font-sans">
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          {branding.heroVideo ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
              src={branding.heroVideo}
            />
          ) : branding.heroImage ? (
            <img
              src={branding.heroImage}
              alt={branding.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-background h-full w-full" />
          )}
          <div className="absolute inset-0 z-10 bg-black/60" />
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-48 bg-gradient-to-t from-[var(--surface)] to-transparent" />
        </div>

        <nav className="relative z-50 mx-auto flex w-full max-w-7xl items-center justify-between border-b border-white/[0.06] px-6 py-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="bg-accent text-accent-text flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black">
              {branding.logoAbbr}
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-white">
              {branding.name.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/tienda"
              className="hidden px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:text-white sm:block"
            >
              Tienda
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowMenu(!showMenu)}
                  className="hover:border-accent gap-2 rounded-lg py-2 pr-4 pl-3 text-white"
                >
                  <div className="bg-accent/20 text-accent flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
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
                  <span className="hidden truncate sm:block">
                    Bienvenido, {user?.name.split(' ')[0]}
                  </span>
                </Button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] py-1 shadow-2xl backdrop-blur-2xl"
                    >
                      <Link
                        to={portalLink}
                        onClick={() => setShowMenu(false)}
                        className="block px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
                      >
                        Mi Portal
                      </Link>
                      <Link
                        to="/tienda"
                        onClick={() => setShowMenu(false)}
                        className="block px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] sm:hidden"
                      >
                        Tienda
                      </Link>
                      <div className="my-1 h-px bg-white/[0.08]" />
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start rounded-none px-4 py-2 text-[var(--error)] hover:bg-[var(--error-muted)]"
                      >
                        <LogOut size={14} /> Cerrar Sesión
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={() => navigate('/login')} className="px-6">
                  ENTRAR
                </Button>
              </motion.div>
            )}
          </div>
        </nav>

        <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-6 pt-10 pb-20 text-center">
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="mx-auto flex max-w-5xl flex-col items-center"
          >
            <motion.div variants={heroItem} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-4 py-1.5 text-xs font-bold tracking-widest text-[var(--detail)] uppercase backdrop-blur-xl">
                <Zap size={14} />
                {branding.hero.badge}
              </span>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="font-heading mb-8 text-5xl leading-[1.1] font-black tracking-tight text-white uppercase sm:text-7xl lg:text-8xl"
            >
              {branding.hero.title} <br />
              <span className="text-accent">{branding.hero.titleAccent}</span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-medium text-white/80 sm:text-xl"
            >
              {branding.hero.subtitle}
            </motion.p>

            <motion.div
              variants={heroItem}
              className="flex w-full flex-col items-center gap-5 sm:w-auto sm:flex-row"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  onClick={() => navigate(isAuthenticated ? portalLink : '/registro')}
                  className="h-14 w-full gap-3 px-10 text-sm font-bold tracking-wider uppercase shadow-[0_0_16px_rgba(66,204,99,0.3)] backdrop-blur-sm sm:w-auto"
                >
                  {ctaText}
                  <ChevronRight size={18} strokeWidth={3} />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  onClick={() => navigate('/tienda')}
                  className="h-14 w-full border-none bg-white/10 px-10 text-sm font-bold tracking-wider text-white uppercase backdrop-blur-md hover:bg-white/20 sm:w-auto"
                >
                  {branding.hero.secondaryCta}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-12 px-6 py-12 sm:flex-row sm:gap-24">
          {branding.stats.map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="font-heading text-accent mb-1 text-4xl font-black sm:text-5xl">{val}</p>
              <p className="text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32" ref={featuresRef}>
        <div className="mb-20 text-center">
          <h2 className="font-heading mb-4 text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase sm:text-5xl">
            {branding.featuresHeading}{' '}
            <span className="text-accent">{branding.featuresHeadingAccent}</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[var(--text-secondary)]">
            {branding.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl transition-colors duration-300 hover:border-[var(--accent)]/30"
            >
              <div className="pointer-events-none absolute inset-0 bg-[var(--accent)] opacity-0 transition-opacity duration-300 group-hover:opacity-[0.02]" />

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] transition-transform duration-300 group-hover:scale-110">
                <f.icon size={28} className="text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading mb-3 text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-12 text-center backdrop-blur-xl sm:p-20">
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)]/20 blur-[100px]" />

          <h2 className="font-heading relative z-10 mb-6 text-4xl font-black tracking-tight text-[var(--text-primary)] uppercase sm:text-6xl">
            {isAuthenticated ? branding.ctaHeadingAuth : branding.ctaHeadingGuest}
          </h2>
          <p className="relative z-10 mx-auto mb-10 max-w-xl text-lg text-[var(--text-secondary)]">
            {isAuthenticated ? branding.ctaSubAuth : branding.ctaSubGuest}
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 inline-block"
          >
            <Button
              variant="outline"
              onClick={() => navigate(isAuthenticated ? portalLink : '/registro')}
              className="h-14 gap-3 border-none bg-gradient-to-r from-[var(--accent)] to-[var(--detail)] px-10 text-sm font-bold tracking-wider text-white uppercase transition-colors hover:brightness-110"
            >
              {isAuthenticated ? branding.ctaButtonAuth : branding.ctaButtonGuest}
              <ChevronRight size={18} strokeWidth={3} />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="bg-accent text-accent-text flex h-8 w-8 items-center justify-center rounded text-xs font-black">
              {branding.logoAbbr}
            </div>
            <span className="font-heading font-bold tracking-tight text-[var(--text-primary)]">
              {branding.name.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-6">
            {!isTenantContext && (
              <Link
                to="/platform/login"
                className="hover:text-accent text-xs font-semibold text-[var(--text-muted)] transition-colors"
              >
                Panel SaaS (Propietario)
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
