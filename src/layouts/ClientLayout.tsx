import { Outlet, NavLink, Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { Dumbbell, TrendingUp, ShoppingBag, User, ShoppingCart, Utensils } from "lucide-react"

const clientNav = [
  { to: "/app/rutinas", icon: Dumbbell, label: "Rutinas" },
  { to: "/app/nutricion", icon: Utensils, label: "Nutrición" },
  { to: "/app/progreso", icon: TrendingUp, label: "Progreso" },
  { to: "/tienda", icon: ShoppingBag, label: "Tienda" },
]

export function ClientLayout() {
  const cartCount = useCartStore((s) => s.itemCount())
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs"
            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
          >
            R4
          </div>
          <span className="font-bold text-sm hidden sm:block" style={{ color: "var(--text-primary)" }}>
            Reto 4 Gym
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/tienda/carrito"
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: "var(--accent)", color: "var(--accent-text)" }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-sm font-medium px-4 py-1.5 rounded-lg transition-all"
              style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20 lg:pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      {isAuthenticated && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 lg:hidden"
          style={{
            background: "rgba(14,14,14,0.95)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--border)",
          }}
        >
          {clientNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors"
              style={({ isActive }) => ({
                color: isActive ? "var(--accent)" : "var(--text-muted)",
              })}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
