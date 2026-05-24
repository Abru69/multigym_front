import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Dumbbell, ShoppingBag, TrendingUp, ChevronRight, Zap, Shield, Users, LogOut, User as UserIcon } from "lucide-react"
import { useAuthStore } from "@/store/authStore"


const features = [
  {
    icon: Dumbbell,
    title: "Rutinas Personalizadas",
    desc: "Planes de entrenamiento diseñados para tus objetivos con videos demostrativos.",
  },
  {
    icon: ShoppingBag,
    title: "Suplementación Premium",
    desc: "Tienda con los mejores suplementos, proteínas y pre-entrenos del mercado.",
  },
  {
    icon: TrendingUp,
    title: "Seguimiento de Progreso",
    desc: "Gráficas detalladas de tu evolución en peso, medidas y rendimiento.",
  },
  {
    icon: Shield,
    title: "Asesoría Profesional",
    desc: "Entrenadores certificados construyen tu rutina según tu nivel y metas.",
  },
  {
    icon: Zap,
    title: "Resultados Reales",
    desc: "Método probado con cientos de clientes que han transformado su cuerpo.",
  },
  {
    icon: Users,
    title: "Comunidad Activa",
    desc: "Únete a una comunidad motivada que entrena con propósito y disciplina.",
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

export default function Landing() {
  const featuresRef = useRef(null)
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" })
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const portalLink = user?.role === "admin" ? "/admin" : "/app/rutinas"
  const ctaText = isAuthenticated 
    ? user?.role === "admin" ? "Ir al Panel de Control" : "Ir a mis Rutinas"
    : "Comenzar Ahora"

  const handleLogout = () => {
    logout()
    setShowMenu(false)
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            src="/vid_sup.mp4"
          />
          {/* Overlay to darken the video for contrast */}
          <div className="absolute inset-0 bg-black/60 z-10" />
          {/* Subtle gradient from bottom to blend into the next section */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-transparent z-10" />
        </div>

        {/* Nav */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm bg-accent text-accent-text">
              R4
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white">
              RETO 4
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/tienda"
              className="hidden sm:block text-sm font-semibold px-4 py-2 text-text-secondary hover:text-white transition-colors"
            >
              Tienda
            </Link>
            
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 text-sm font-bold pl-3 pr-4 py-2 rounded-lg bg-surface border border-border text-white hover:border-accent transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} /> : <UserIcon size={14} />}
                  </div>
                  <span className="hidden sm:block truncate">Bienvenido, {user?.name.split(" ")[0]}</span>
                </button>
                
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl overflow-hidden py-1 z-50"
                    >
                      <Link to={portalLink} className="block px-4 py-2 text-sm text-white hover:bg-background transition-colors">Mi Portal</Link>
                      <Link to="/tienda" className="block px-4 py-2 text-sm text-white hover:bg-background transition-colors sm:hidden">Tienda</Link>
                      <div className="h-px bg-border my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-background transition-colors flex items-center gap-2">
                        <LogOut size={14} /> Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="text-sm font-bold px-6 py-2.5 rounded-lg bg-surface border border-border text-white hover:border-accent hover:text-accent transition-colors"
                >
                  ENTRAR
                </Link>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 pt-10 pb-20">
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto flex flex-col items-center"
          >
            <motion.div variants={heroItem} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-detail/15 text-detail tracking-widest uppercase">
                <Zap size={14} />
                Alto Rendimiento
              </span>
            </motion.div>

            <motion.h1
              variants={heroItem}
              className="font-heading font-black text-5xl sm:text-7xl lg:text-8xl leading-[1.1] mb-8 text-white uppercase tracking-tight"
            >
              TU TRANSFORMACIÓN <br />
              <span className="text-accent">EMPIEZA AQUÍ</span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
            >
              Entrenamientos inteligentes, nutrición experta y la suplementación que necesitas. Todo en un solo lugar.
            </motion.p>

            <motion.div variants={heroItem} className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link
                  to={isAuthenticated ? portalLink : "/registro"}
                  className="flex items-center justify-center gap-3 text-sm font-bold px-10 py-4 rounded-xl bg-accent text-accent-text hover:bg-accent-hover transition-colors shadow-glow uppercase tracking-wider w-full sm:w-auto"
                >
                  {ctaText}
                  <ChevronRight size={18} strokeWidth={3} />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link
                  to="/tienda"
                  className="flex items-center justify-center px-10 py-4 rounded-xl bg-surface/50 backdrop-blur-md border border-border text-white hover:border-accent transition-colors text-sm font-bold uppercase tracking-wider w-full sm:w-auto"
                >
                  Comprar Suplementos
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-24">
          {[
            ["500+", "Atletas"],
            ["1200+", "Rutinas Completadas"],
            ["98%", "Retención"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="font-heading font-black text-4xl sm:text-5xl text-accent mb-1">{val}</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 sm:py-32 max-w-7xl mx-auto" ref={featuresRef}>
        <div className="text-center mb-20">
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white uppercase tracking-tight mb-4">
            Todo en una <span className="text-accent">sola plataforma</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            La disciplina requiere las herramientas adecuadas. Diseñado para maximizar tus resultados sin distracciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="group p-8 rounded-2xl bg-surface border border-border hover:border-accent/50 transition-colors duration-300 relative overflow-hidden"
            >
              {/* Subtle hover glow inside the card */}
              <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 pointer-events-none" />
              
              <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <f.icon size={28} className="text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-3 tracking-tight">
                {f.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-32">
        <div className="max-w-4xl mx-auto rounded-3xl p-12 sm:p-20 text-center relative overflow-hidden bg-surface border border-border">
          {/* Glow effect behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 blur-[100px] pointer-events-none" />
          
          <h2 className="font-heading font-black text-4xl sm:text-6xl text-white uppercase tracking-tight mb-6 relative z-10">
            {isAuthenticated ? "¿LISTO PARA ENTRENAR?" : "¿LISTO PARA EL RETO?"}
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto relative z-10">
            {isAuthenticated 
              ? "Tu transformación no espera. Accede a tus rutinas y sigue superando tus límites."
              : "Únete a la plataforma definitiva de entrenamiento. Rompe tus límites y construye tu mejor versión."}
          </p>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block relative z-10">
            <Link
              to={isAuthenticated ? portalLink : "/registro"}
              className="inline-flex items-center gap-3 text-sm font-bold px-10 py-4 rounded-xl bg-white text-black hover:bg-accent hover:text-accent-text transition-colors uppercase tracking-wider"
            >
              {isAuthenticated ? "Ir a mi Portal" : "Crear Cuenta Gratis"}
              <ChevronRight size={18} strokeWidth={3} />
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border bg-background px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center font-black text-xs bg-accent text-accent-text">
              R4
            </div>
            <span className="font-heading font-bold tracking-tight text-white">
              RETO 4 GYM
            </span>
          </div>
          <p className="text-xs font-medium text-text-muted">
            © {new Date().getFullYear()} Reto 4 Gym. Alto Rendimiento.
          </p>
        </div>
      </footer>
    </div>
  )
}
