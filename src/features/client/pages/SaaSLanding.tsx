import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, Store, LineChart, ChevronRight, Shield, Zap, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/components/ui/Toast'

const features = [
  {
    icon: Building2,
    title: 'Marca Propia',
    desc: 'Subdominio personalizado (ej. tugimnasio.multigym.com) y colores adaptados a la identidad de tu negocio.',
  },
  {
    icon: Dumbbell,
    title: 'Creador de Rutinas',
    desc: 'Herramienta interactiva para que tus entrenadores diseñen planes con videos y progresión.',
  },
  {
    icon: Store,
    title: 'E-Commerce Integrado',
    desc: 'Vende suplementos, accesorios y planes adicionales directamente desde tu plataforma.',
  },
  {
    icon: LineChart,
    title: 'Métricas en Tiempo Real',
    desc: 'Seguimiento del progreso de tus clientes, asistencia y analíticas de ventas.',
  },
  {
    icon: Shield,
    title: 'Control de Acceso',
    desc: 'Gestión de membresías, permisos granulares para staff y clientes.',
  },
  {
    icon: Zap,
    title: 'Alta Disponibilidad',
    desc: 'Infraestructura cloud robusta para que tu gimnasio esté siempre operativo.',
  },
]

const plans = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 5000,
    desc: 'Perfecto para estudios pequeños y entrenadores independientes.',
    features: [
      'Hasta 100 miembros',
      '1 sede',
      'Soporte por email',
      'Reportes básicos',
      'Catálogo de 50 productos',
    ],
    featured: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 12000,
    desc: 'La mejor opción para gimnasios en crecimiento que necesitan control total.',
    features: [
      'Hasta 500 miembros',
      '3 sedes',
      'Soporte prioritario',
      'Reportes avanzados',
      'E-commerce ilimitado',
      'App móvil PWA',
    ],
    featured: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 35000,
    desc: 'Para cadenas de gimnasios y franquicias con necesidades avanzadas.',
    features: [
      'Miembros ilimitados',
      'Sedes ilimitadas',
      'Soporte 24/7 dedicado',
      'Acceso a API',
      'SLA 99.9%',
      'Personalización total',
    ],
    featured: false,
  },
]

const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
}

export default function SaaSLanding() {
  const addToast = useToastStore((state) => state.addToast)

  const openRegistration = (planId: string) => {
    addToast(
      `Para contratar el plan ${planId}, contacta al administrador en admin@saas.com`,
      'warning'
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--card)] font-sans">
      {/* ─── NAV ────────────────────────────────────────────── */}
      <nav className="fixed top-0 right-0 left-0 z-50 w-full border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-black text-[var(--accent-text)] shadow-[var(--accent)]/20 shadow-md">
              MG
            </div>
            <span className="font-heading text-lg font-black tracking-tight text-[var(--text-primary)]">
              MULTIGYM <span className="text-[var(--accent)]">SAAS</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#caracteristicas"
              className="text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Características
            </a>
            <a
              href="#precios"
              className="text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Precios
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/platform/login"
              className="hidden text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:block"
            >
              Portal Administrador
            </Link>
            <Button
              onClick={() => openRegistration('PRO')}
              className="rounded-xl px-6 py-2.5 text-sm font-bold"
            >
              Contactar Ventas
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg-primary)] pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-[var(--accent)]/5 blur-[120px]" />
          <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[var(--accent)]/3 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={heroItem} className="mb-6">
              <span className="inline-flex items-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-5 py-2 text-xs font-bold tracking-widest text-[var(--accent-text)] uppercase">
                LA PLATAFORMA DEFINITIVA
              </span>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="font-heading text-6xl leading-[0.95] font-black tracking-tight text-[var(--text-primary)] uppercase sm:text-7xl lg:text-8xl"
            >
              ESCALE SU
              <br />
              <span className="text-[var(--accent)]">GIMNASIO</span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mx-auto mt-8 mb-10 max-w-3xl text-xl leading-relaxed text-[var(--text-secondary)]"
            >
              La solución "todo en uno" para dueños de gimnasios. Administra sedes, diseña rutinas
              interactivas, vende suplementación y fideliza a tus atletas bajo tu propia marca.
            </motion.p>

            <motion.div
              variants={heroItem}
              className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
            >
              <Button
                onClick={() => openRegistration('PRO')}
                className="w-full rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-bold tracking-wider text-[var(--accent-text)] uppercase shadow-[var(--accent)]/20 shadow-lg hover:brightness-110 sm:w-auto"
              >
                Contactar Ventas
                <ChevronRight size={18} strokeWidth={3} />
              </Button>
              <Button
                onClick={() => {
                  document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' })
                }}
                variant="outline"
                className="w-full rounded-xl border-2 border-[var(--border)] px-8 py-4 text-base font-bold tracking-wider text-[var(--text-primary)] uppercase hover:border-[var(--text-primary)] sm:w-auto"
              >
                Ver Planes
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="relative z-10 mx-auto mt-20 w-full max-w-5xl px-6"
        >
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-2xl shadow-black/5">
            <div className="flex aspect-[16/9] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex h-12 items-center gap-2 border-b border-[var(--border)] bg-[var(--card)] px-4">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto flex h-6 w-64 items-center rounded-md border border-[var(--border)] bg-[var(--card)] px-3 font-mono text-[10px] text-[var(--text-muted)]">
                  <Shield size={10} className="mr-2 inline" /> tugimnasio.multigym.com
                </div>
              </div>
              <div className="relative flex flex-1 items-center justify-center bg-[var(--bg-secondary)]">
                <div className="grid w-full max-w-4xl grid-cols-3 gap-6 p-8">
                  <div className="col-span-2 space-y-6">
                    <div className="flex h-32 flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                      <div className="h-4 w-32 rounded bg-gray-200" />
                      <div className="flex flex-1 items-end gap-2">
                        {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm bg-[var(--accent)]"
                            style={{ height: `${h}%`, opacity: 0.3 + i * 0.09 }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="h-40 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4" />
                      <div className="h-40 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4" />
                    </div>
                  </div>
                  <div className="col-span-1 space-y-6">
                    <div className="h-48 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4" />
                    <div className="h-24 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── LOGOS ────────────────────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-secondary)] py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="mb-8 text-sm font-bold tracking-widest text-[var(--text-muted)] uppercase">
            Confiado por más de 500 gimnasios en todo el mundo
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
            {['FitZone', 'Iron Temple', 'PowerGym', 'Alpha Fitness', 'Zeus Gym'].map((logo) => (
              <div key={logo} className="font-heading text-2xl font-black text-[var(--text-muted)]">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section id="caracteristicas" className="bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-bold tracking-widest text-[var(--accent)] uppercase">
              Características
            </span>
            <h2 className="font-heading text-4xl font-black text-[var(--text-primary)] sm:text-5xl">
              Control <span className="text-[var(--accent)]">Absoluto</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
              Todo lo que necesitas para operar, crecer y escalar tu negocio fitness.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/10 transition-transform duration-300 group-hover:scale-110">
                  <f.icon size={26} className="text-[var(--accent)]" strokeWidth={2} />
                </div>
                <h3 className="font-heading mb-2 text-xl font-bold text-[var(--text-primary)]">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────── */}
      <section id="precios" className="bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-bold tracking-widest text-[var(--accent)] uppercase">
              Precios
            </span>
            <h2 className="font-heading text-4xl font-black text-[var(--text-primary)] sm:text-5xl">
              Planes <span className="text-[var(--accent)]">Transparentes</span>
            </h2>
            <p className="mt-4 text-base font-semibold text-[var(--text-muted)]">
              Pago único anual en Pesos Mexicanos (MXN). Sin comisiones ocultas.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((p) => {
              const price = p.price
              return (
                <div
                  key={p.name}
                  className={`relative flex flex-col overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                    p.featured
                      ? 'scale-[1.04] bg-[var(--text-primary)] text-white shadow-2xl'
                      : 'border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)]'
                  }`}
                >
                  {p.featured && (
                    <div className="absolute top-0 right-0 left-0 bg-[var(--accent)] px-4 py-1.5 text-center text-xs font-black tracking-widest text-[var(--accent-text)] uppercase">
                      Más Popular
                    </div>
                  )}

                  <div className={p.featured ? 'pt-4' : ''}>
                    <h3 className="font-heading text-xl font-bold text-[var(--text-primary)]">
                      {p.name}
                    </h3>
                    <p
                      className={`mt-2 mb-6 text-sm ${p.featured ? 'text-white/60' : 'text-[var(--text-secondary)]'}`}
                    >
                      {p.desc}
                    </p>

                    <div className="mb-8 flex items-baseline gap-1">
                      <span className="font-heading text-5xl font-black text-[var(--text-primary)]">
                        ${price.toLocaleString('es-MX')}
                      </span>
                      <span
                        className={`text-sm font-medium ${p.featured ? 'text-white/50' : 'text-[var(--text-muted)]'}`}
                      >
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
                          <span
                            className={
                              p.featured ? 'text-white/80' : 'text-[var(--text-secondary)]'
                            }
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => openRegistration(p.id)}
                      className={`w-full rounded-xl py-3 text-sm font-bold tracking-wider uppercase ${
                        p.featured
                          ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-[var(--accent)]/20 shadow-lg hover:brightness-110'
                          : 'border-2 border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--text-primary)]'
                      }`}
                    >
                      Contactar Ventas
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="bg-[var(--text-primary)]">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <h2 className="font-heading text-4xl leading-tight font-black text-white uppercase sm:text-6xl">
            LLEVA TU NEGOCIO AL
            <br />
            <span className="text-[var(--accent)]">FUTURO</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Únete a la plataforma SaaS que está revolucionando la forma en que los gimnasios
            interactúan con sus clientes.
          </p>
          <div className="mt-10">
            <Button
              onClick={() => openRegistration('PRO')}
              className="rounded-xl bg-[var(--accent)] px-10 py-4 text-base font-bold tracking-wider text-[var(--accent-text)] uppercase shadow-[var(--accent)]/20 shadow-xl hover:brightness-110"
            >
              Contactar al Administrador
              <ChevronRight size={20} strokeWidth={3} />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-black text-[var(--accent-text)]">
              MG
            </div>
            <span className="font-heading text-sm font-bold tracking-tight text-[var(--text-primary)]">
              MULTIGYM SAAS
            </span>
          </div>
          <p className="text-center text-sm font-medium text-[var(--text-muted)] sm:text-left">
            © {new Date().getFullYear()} MultiGym Platform. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <Link
              to="/platform/login"
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Login Propietarios
            </Link>
            <button
              type="button"
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Soporte
            </button>
            <button
              type="button"
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Términos
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
