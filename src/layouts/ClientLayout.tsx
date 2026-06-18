import { useState } from "react"
import { Outlet, NavLink, Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useCartStore } from "@/features/shop/store/cartStore"
import { useAuthStore } from "@/features/auth/store/authStore"
import { useTenantBranding } from "@/hooks/useTenantBranding"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Dumbbell, TrendingUp, ShoppingBag, User, ShoppingCart, Utensils, LogOut } from "lucide-react"
import { getTenantUrl } from "@/lib/tenant"

const clientNav = [
  { to: "/app/rutinas", icon: Dumbbell, label: "Rutinas" },
  { to: "/app/nutricion", icon: Utensils, label: "Nutrición" },
  { to: "/app/progreso", icon: TrendingUp, label: "Progreso" },
  { to: "/tienda", icon: ShoppingBag, label: "Tienda" },
]

export function ClientLayout() {
  const cartCount = useCartStore((s) => s.itemCount())
  const { isAuthenticated, user, logout, tenantId } = useAuthStore()
  const { branding } = useTenantBranding()
  const location = useLocation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const portalLink = user?.role === "admin" ? "/admin" : "/app/rutinas"

  const handleLogout = () => {
    const currentTenantId = tenantId || user?.tenantId
    logout()
    setShowMenu(false)
    if (currentTenantId) {
      window.location.href = getTenantUrl(currentTenantId)
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--header-bg)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs"
              style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            >
              {branding.logoAbbr}
            </div>
            <span className="font-bold text-sm hidden sm:block" style={{ color: "var(--text-primary)" }}>
              {branding.name}
            </span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {clientNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={({ isActive }) => ({
                    color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                    background: isActive ? "var(--accent)" : "transparent",
                    boxShadow: isActive ? "var(--shadow-md)" : "none",
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
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
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 text-xs font-bold pl-2.5 pr-3.5 py-1.5 rounded-lg transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                  {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} /> : <User size={12} />}
                </div>
                <span className="hidden sm:block truncate">Bienvenido, {user?.name.split(" ")[0]}</span>
              </button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden py-1 z-50"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <button 
                      onClick={() => {
                        setShowMenu(false)
                        navigate(portalLink)
                      }}
                      className="w-full text-left block px-4 py-2 text-sm transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Mi Portal
                    </button>
                    <div className="h-px" style={{ background: "var(--border)" }} />
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                      style={{ color: "var(--error)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--error-muted)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
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
            background: "var(--header-bg)",
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
                color: isActive ? "var(--accent-text)" : "var(--text-muted)",
                background: isActive ? "var(--accent)" : "transparent",
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
