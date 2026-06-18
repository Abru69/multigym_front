import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Dumbbell, Store, LineChart, Users, ChevronRight, CheckCircle, Shield, Zap, Building2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { fetchApi } from "@/lib/api"

const features = [
  {
    icon: Building2,
    title: "Marca Propia",
    desc: "Subdominio personalizado (ej. tugimnasio.multigym.com) y colores adaptados a la identidad de tu negocio.",
  },
  {
    icon: Dumbbell,
    title: "Creador de Rutinas",
    desc: "Herramienta interactiva para que tus entrenadores diseñen planes con videos y progresión.",
  },
  {
    icon: Store,
    title: "E-Commerce Integrado",
    desc: "Vende suplementos, accesorios y planes adicionales directamente desde tu plataforma.",
  },
  {
    icon: LineChart,
    title: "Métricas en Tiempo Real",
    desc: "Seguimiento del progreso de tus clientes, asistencia y analíticas de ventas.",
  },
  {
    icon: Shield,
    title: "Control de Acceso",
    desc: "Gestión de membresías, permisos granulares para staff y clientes.",
  },
  {
    icon: Zap,
    title: "Alta Disponibilidad",
    desc: "Infraestructura cloud robusta para que tu gimnasio esté siempre operativo.",
  },
]

const plans = [
  {
    id: "STARTER",
    name: "Starter",
    price: 5000,
    desc: "Perfecto para estudios pequeños y entrenadores independientes.",
    features: ["Hasta 100 miembros", "1 sede", "Soporte por email", "Reportes básicos", "Catálogo de 50 productos"],
    featured: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: 12000,
    desc: "La mejor opción para gimnasios en crecimiento que necesitan control total.",
    features: ["Hasta 500 miembros", "3 sedes", "Soporte prioritario", "Reportes avanzados", "E-commerce ilimitado", "App móvil PWA"],
    featured: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 35000,
    desc: "Para cadenas de gimnasios y franquicias con necesidades avanzadas.",
    features: ["Miembros ilimitados", "Sedes ilimitadas", "Soporte 24/7 dedicado", "Acceso a API", "SLA 99.9%", "Personalización total"],
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } },
}

export default function SaaSLanding() {
  const navigate = useNavigate()

  const openRegistration = (planId: string) => {
    alert(`Para contratar el plan ${planId}, por favor contacta al administrador en admin@saas.com`)
  }

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)", color: "var(--accent-text)" }}>
            MG
          </div>
          <span className="font-heading font-black text-xl tracking-tight text-[var(--text-primary)]">
            MULTIGYM <span className="text-accent">SAAS</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#caracteristicas" className="hidden md:block text-sm font-semibold text-text-secondary hover:text-accent transition-colors">
            Características
          </a>
          <a href="#precios" className="hidden md:block text-sm font-semibold text-text-secondary hover:text-accent transition-colors">
            Precios
          </a>
          <div className="h-4 w-px bg-border hidden md:block" />
          <Link to="/platform/login" className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
            Portal Administrador
          </Link>
          <Button onClick={() => openRegistration("PRO")} className="hidden sm:flex text-sm">
            Contactar Ventas
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div variants={heroStagger} initial="hidden" animate="visible" className="flex flex-col items-center">
            <motion.div variants={heroItem} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border border-accent/30 bg-accent/10 text-accent tracking-widest uppercase">
                <Zap size={14} />
                La Plataforma Definitiva
              </span>
            </motion.div>

            <motion.h1 variants={heroItem} className="font-heading font-black text-5xl sm:text-6xl md:text-8xl leading-[1.05] mb-8 text-[var(--text-primary)] tracking-tight">
              ESCALA TU GIMNASIO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                A OTRO NIVEL
              </span>
            </motion.h1>

            <motion.p variants={heroItem} className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
              La solución "todo en uno" para dueños de gimnasios. Administra sedes, diseña rutinas interactivas, vende suplementación y fideliza a tus atletas bajo tu propia marca y subdominio personalizado.
            </motion.p>

            <motion.div variants={heroItem} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button onClick={() => openRegistration("PRO")} size="lg" className="w-full sm:w-auto text-base uppercase tracking-wider gap-2 accent-glow">
                Contactar al Administrador <ChevronRight size={18} strokeWidth={3} />
              </Button>
              <Button onClick={() => { document.getElementById("precios")?.scrollIntoView({ behavior: "smooth" }) }} variant="outline" size="lg" className="w-full sm:w-auto text-base uppercase tracking-wider">
                Ver Planes y Precios
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-20"
        >
          <div className="rounded-2xl border border-border bg-surface/50 backdrop-blur-xl p-2 shadow-2xl overflow-hidden glass-card">
            <div className="bg-background rounded-xl border border-border/50 overflow-hidden aspect-[16/9] relative flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col">
                <div className="h-12 border-b border-border flex items-center px-4 gap-2 bg-surface">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-danger/80"/><div className="w-3 h-3 rounded-full bg-warning/80"/><div className="w-3 h-3 rounded-full bg-success/80"/></div>
                  <div className="mx-auto w-64 h-6 rounded-md bg-background border border-border flex items-center px-3 text-[10px] text-text-muted font-mono">
                    <Shield size={10} className="mr-2 inline" /> tugimnasio.multigym.com
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-surface to-background relative overflow-hidden">
                   {/* Abstract representation of the dashboard */}
                   <div className="grid grid-cols-3 gap-6 w-full max-w-4xl p-8">
                     <div className="col-span-2 space-y-6">
                       <div className="h-32 rounded-xl bg-surface border border-border p-4 flex flex-col gap-3">
                         <div className="h-4 w-32 bg-text-muted/20 rounded" />
                         <div className="flex-1 flex items-end gap-2">
                           {[40, 70, 45, 90, 65, 85, 100].map((h, i) => <div key={i} className="flex-1 bg-accent/80 rounded-t-sm" style={{ height: `${h}%` }} />)}
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                         <div className="h-40 rounded-xl bg-surface border border-border p-4" />
                         <div className="h-40 rounded-xl bg-surface border border-border p-4" />
                       </div>
                     </div>
                     <div className="col-span-1 space-y-6">
                       <div className="h-48 rounded-xl bg-surface border border-border p-4" />
                       <div className="h-24 rounded-xl bg-surface border border-border p-4" />
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Logos Section */}
      <section className="py-12 border-b border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-8">Confiado por más de 500 gimnasios en todo el mundo</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {["FitZone", "Iron Temple", "PowerGym", "Alpha Fitness", "Zeus Gym"].map((logo) => (
              <div key={logo} className="font-heading font-black text-2xl text-text-secondary">{logo}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-heading font-black text-4xl sm:text-5xl text-[var(--text-primary)] tracking-tight mb-4 uppercase">
              Control <span className="text-accent">Absoluto</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Todo lo que necesitas para operar, crecer y escalar tu negocio fitness. Sin complicaciones tecnológicas, enfócate en tus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-surface border border-border hover:border-accent/50 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-300">
                  <f.icon size={28} className="text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-bold text-xl text-[var(--text-primary)] mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-24 bg-surface/50 border-y border-border relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading font-black text-4xl sm:text-5xl text-[var(--text-primary)] tracking-tight mb-6 uppercase">
              Planes <span className="text-accent">Transparentes</span>
            </h2>
            
            <p className="text-text-secondary text-base font-bold">
              Pago único anual en Pesos Mexicanos (MXN). Sin comisiones ocultas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((p) => {
              const price = p.price
              return (
                <div 
                  key={p.name}
                  className={`relative flex flex-col p-8 rounded-3xl transition-transform duration-300 hover:-translate-y-2 ${
                    p.featured 
                      ? "bg-surface border-2 border-accent shadow-glow" 
                      : "bg-surface border border-border"
                  }`}
                >
                  {p.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-text text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                      Más Popular
                    </div>
                  )}
                  
                  <h3 className="font-heading font-bold text-2xl text-[var(--text-primary)] mb-2">{p.name}</h3>
                  <p className="text-text-secondary text-sm mb-6 min-h-[40px]">{p.desc}</p>
                  
                  <div className="mb-8 flex items-end gap-1">
                    <span className="font-heading font-black text-4xl lg:text-5xl text-[var(--text-primary)]">${price.toLocaleString('es-MX')}</span>
                    <span className="text-text-muted font-bold mb-2">MXN /año</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)] font-medium">
                        <CheckCircle size={18} className="text-accent shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={p.featured ? "default" : "outline"} 
                    className="w-full h-12 uppercase tracking-wider text-sm"
                    onClick={() => openRegistration(p.id)}
                  >
                    Contactar Ventas
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading font-black text-4xl sm:text-6xl text-[var(--text-primary)] uppercase tracking-tight mb-6">
            LLEVA TU NEGOCIO AL <span className="text-accent">FUTURO</span>
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-2xl mx-auto">
            Únete a la plataforma SaaS que está revolucionando la forma en que los gimnasios interactúan con sus clientes.
          </p>
          <Button onClick={() => openRegistration("PRO")} size="lg" className="px-10 h-14 uppercase tracking-wider gap-3 accent-glow text-base">
            Contactar al Administrador <ChevronRight size={20} strokeWidth={3} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center font-black text-xs" style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)", color: "var(--accent-text)" }}>
              MG
            </div>
            <span className="font-heading font-bold tracking-tight text-[var(--text-primary)]">
              MULTIGYM SAAS
            </span>
          </div>
          <p className="text-sm font-medium text-text-muted text-center md:text-left">
            © {new Date().getFullYear()} MultiGym Platform. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <Link to="/platform/login" className="text-text-muted hover:text-accent transition-colors">
              Login Propietarios
            </Link>
            <a href="#" className="text-text-muted hover:text-accent transition-colors">Soporte</a>
            <a href="#" className="text-text-muted hover:text-accent transition-colors">Términos</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
