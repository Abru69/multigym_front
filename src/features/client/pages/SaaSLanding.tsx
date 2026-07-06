import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Store,
  LineChart,
  Users,
  ChevronRight,
  CheckCircle,
  Shield,
  Zap,
  Building2,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { fetchApi } from '@/lib/api'

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

// Stagger variants for Hero
const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as any } },
}

export default function SaaSLanding() {
  const navigate = useNavigate()

  const openRegistration = (planId: string) => {
    alert(`Para contratar el plan ${planId}, por favor contacta al administrador en admin@saas.com`)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between border-b border-white/[0.06] bg-[var(--card)]/80 px-6 py-4 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
              color: 'var(--accent-text)',
            }}
          >
            MG
          </div>
          <span className="font-heading text-xl font-black tracking-tight text-[var(--text-primary)]">
            MULTIGYM <span className="text-accent">SAAS</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#caracteristicas"
            className="hidden text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)] md:block"
          >
            Características
          </a>
          <a
            href="#precios"
            className="hidden text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)] md:block"
          >
            Precios
          </a>
          <div className="hidden h-4 w-px bg-white/[0.08] md:block" />
          <Link
            to="/platform/login"
            className="text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
          >
            Portal Administrador
          </Link>
          <Button onClick={() => openRegistration('PRO')} className="hidden text-sm sm:flex">
            Contactar Ventas
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="bg-primary/20 pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
          <div className="bg-accent/15 pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full blur-[100px]" />
          <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={heroItem} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-4 py-1.5 text-xs font-bold tracking-widest text-[var(--detail)] uppercase backdrop-blur-xl">
                <Zap size={14} />
                La Plataforma Definitiva
              </span>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="font-heading mb-8 text-5xl leading-[1.05] font-black tracking-tight text-[var(--text-primary)] sm:text-6xl md:text-8xl"
            >
              ESCALA TU GIMNASIO <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                A OTRO NIVEL
              </span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed font-medium text-[var(--text-secondary)] sm:text-xl"
            >
              La solución "todo en uno" para dueños de gimnasios. Administra sedes, diseña rutinas
              interactivas, vende suplementación y fideliza a tus atletas bajo tu propia marca y
              subdominio personalizado.
            </motion.p>

            <motion.div
              variants={heroItem}
              className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
            >
              <Button
                onClick={() => openRegistration('PRO')}
                size="lg"
                className="w-full gap-2 text-base tracking-wider uppercase shadow-[0_0_16px_rgba(66,204,99,0.3)] sm:w-auto"
              >
                Contactar al Administrador <ChevronRight size={18} strokeWidth={3} />
              </Button>
              <Button
                onClick={() => {
                  document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' })
                }}
                variant="outline"
                size="lg"
                className="w-full text-base tracking-wider uppercase sm:w-auto"
              >
                Ver Planes y Precios
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          className="relative z-10 mx-auto mt-20 w-full max-w-6xl px-6"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[var(--card)] to-[var(--surface)] p-2 shadow-2xl backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent" />
            <div className="relative z-10 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-[var(--background)]">
              <div className="absolute inset-0 flex flex-col">
                <div className="flex h-12 items-center gap-2 border-b border-white/[0.06] bg-[var(--surface)] px-4">
                  <div className="flex gap-1.5">
                    <div className="bg-danger/80 h-3 w-3 rounded-full" />
                    <div className="bg-warning/80 h-3 w-3 rounded-full" />
                    <div className="bg-success/80 h-3 w-3 rounded-full" />
                  </div>
                  <div className="mx-auto flex h-6 w-64 items-center rounded-md border border-white/[0.06] bg-[var(--background)] px-3 font-mono text-[10px] text-[var(--text-muted)]">
                    <Shield size={10} className="mr-2 inline" /> tugimnasio.multigym.com
                  </div>
                </div>
                <div className="from-surface to-background relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br">
                  {/* Abstract representation of the dashboard */}
                  <div className="grid w-full max-w-4xl grid-cols-3 gap-6 p-8">
                    <div className="col-span-2 space-y-6">
                      <div className="flex h-32 flex-col gap-3 rounded-xl border border-white/[0.06] bg-[var(--surface)] p-4">
                        <div className="h-4 w-32 rounded bg-[var(--text-muted)]/20" />
                        <div className="flex flex-1 items-end gap-2">
                          {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                            <div
                              key={i}
                              className="bg-accent/80 flex-1 rounded-t-sm"
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="h-40 rounded-xl border border-white/[0.06] bg-[var(--surface)] p-4" />
                        <div className="h-40 rounded-xl border border-white/[0.06] bg-[var(--surface)] p-4" />
                      </div>
                    </div>
                    <div className="col-span-1 space-y-6">
                      <div className="h-48 rounded-xl border border-white/[0.06] bg-[var(--surface)] p-4" />
                      <div className="h-24 rounded-xl border border-white/[0.06] bg-[var(--surface)] p-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Logos Section */}
      <section className="border-b border-white/[0.06] bg-[var(--surface)]/30 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="mb-8 text-sm font-bold tracking-widest text-[var(--text-muted)] uppercase">
            Confiado por más de 500 gimnasios en todo el mundo
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
            {['FitZone', 'Iron Temple', 'PowerGym', 'Alpha Fitness', 'Zeus Gym'].map((logo) => (
              <div
                key={logo}
                className="font-heading text-2xl font-black text-[var(--text-secondary)]"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <h2 className="font-heading mb-4 text-4xl font-black tracking-tight text-[var(--text-primary)] uppercase sm:text-5xl">
              Control <span className="text-accent">Absoluto</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[var(--text-secondary)]">
              Todo lo que necesitas para operar, crecer y escalar tu negocio fitness. Sin
              complicaciones tecnológicas, enfócate en tus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[var(--card)] to-[var(--surface)] p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                <div className="relative z-10">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)]/15 to-[var(--accent)]/5 shadow-[0_0_16px_rgba(66,204,99,0.08)] transition-transform duration-300 group-hover:scale-110">
                    <f.icon size={28} className="text-accent" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading mb-3 text-xl font-bold tracking-tight text-[var(--text-primary)]">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="precios"
        className="relative border-y border-white/[0.06] bg-[var(--surface)]/50 py-24 backdrop-blur-xl"
      >
        <div className="from-primary/10 via-background to-background pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="font-heading mb-6 text-4xl font-black tracking-tight text-[var(--text-primary)] uppercase sm:text-5xl">
              Planes <span className="text-accent">Transparentes</span>
            </h2>

            <p className="text-base font-bold text-[var(--text-secondary)]">
              Pago único anual en Pesos Mexicanos (MXN). Sin comisiones ocultas.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {plans.map((p) => {
              const price = p.price
              return (
                <div
                  key={p.name}
                  className={`relative flex flex-col overflow-hidden rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-2 ${
                    p.featured
                      ? 'border-2 border-[var(--accent)] bg-gradient-to-br from-[var(--card)] to-[var(--surface)] shadow-[0_0_32px_rgba(66,204,99,0.15)]'
                      : 'border border-white/[0.06] bg-gradient-to-br from-[var(--card)] to-[var(--surface)]'
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                  {p.featured && (
                    <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[var(--accent)] px-4 py-1 text-xs font-black tracking-widest text-[var(--accent-text)] uppercase shadow-[0_0_16px_rgba(66,204,99,0.4)]">
                      Más Popular
                    </div>
                  )}

                  <div className="relative z-10">
                    <h3 className="font-heading mb-2 text-2xl font-bold text-[var(--text-primary)]">
                      {p.name}
                    </h3>
                    <p className="mb-6 min-h-[40px] text-sm text-[var(--text-secondary)]">
                      {p.desc}
                    </p>

                    <div className="mb-8 flex items-end gap-1">
                      <span className="font-heading text-4xl font-black text-[var(--text-primary)] lg:text-5xl">
                        ${price.toLocaleString('es-MX')}
                      </span>
                      <span className="mb-2 font-bold text-[var(--text-muted)]">MXN /año</span>
                    </div>

                    <ul className="mb-8 flex-1 space-y-4">
                      {p.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm font-medium text-[var(--text-secondary)]"
                        >
                          <CheckCircle size={18} className="text-accent mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={p.featured ? 'default' : 'outline'}
                      className="h-12 w-full text-sm tracking-wider uppercase"
                      onClick={() => openRegistration(p.id)}
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

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[var(--card)] to-[var(--surface)] p-12 backdrop-blur-xl sm:p-20">
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)]/20 blur-[100px]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />

            <h2 className="font-heading relative z-10 mb-6 text-4xl font-black tracking-tight text-[var(--text-primary)] uppercase sm:text-6xl">
              LLEVA TU NEGOCIO AL <span className="text-accent">FUTURO</span>
            </h2>
            <p className="relative z-10 mx-auto mb-10 max-w-2xl text-lg text-[var(--text-secondary)]">
              Únete a la plataforma SaaS que está revolucionando la forma en que los gimnasios
              interactúan con sus clientes.
            </p>
            <div className="relative z-10 inline-block">
              <Button
                onClick={() => openRegistration('PRO')}
                size="lg"
                className="h-14 gap-3 px-10 text-base tracking-wider uppercase shadow-[0_0_32px_rgba(66,204,99,0.3)] hover:shadow-[0_0_48px_rgba(66,204,99,0.45)]"
              >
                Contactar al Administrador <ChevronRight size={20} strokeWidth={3} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[var(--surface)] py-12 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded text-xs font-black"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
                color: 'var(--accent-text)',
              }}
            >
              MG
            </div>
            <span className="font-heading font-bold tracking-tight text-[var(--text-primary)]">
              MULTIGYM SAAS
            </span>
          </div>
          <p className="text-center text-sm font-medium text-[var(--text-muted)] md:text-left">
            © {new Date().getFullYear()} MultiGym Platform. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <Link
              to="/platform/login"
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Login Propietarios
            </Link>
            <a
              href="#"
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Soporte
            </a>
            <a
              href="#"
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Términos
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
