import { useState } from "react"
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom"
import "@/features/admin/pages/styles/AdminShared.css"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/features/auth/store/authStore"
import { getTenantUrl } from "@/lib/tenant"
import { useTenantBranding } from "@/hooks/useTenantBranding"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import {
  LayoutDashboard,
  Package,
  Users,
  Dumbbell,
  Activity,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react"

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/inventario", icon: Package, label: "Inventario" },
  { to: "/admin/usuarios", icon: Users, label: "Usuarios" },
  { to: "/admin/ejercicios", icon: Dumbbell, label: "Ejercicios y Rutinas" },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const { user, logout, tenantId } = useAuthStore()
  const { branding } = useTenantBranding()
  const navigate = useNavigate()

  const handleLogout = () => {
    const currentTenantId = tenantId || user?.tenantId
    logout()
    if (currentTenantId) {
      window.location.href = getTenantUrl(currentTenantId)
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      
      {/* ── TOP HEADER (DESKTOP & MOBILE) ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:px-8"
        style={{ background: "var(--header-bg)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-6">
          {/* Mobile Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)", background: "var(--surface)" }}
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shadow-sm"
              style={{ background: "var(--accent)", color: "var(--accent-text)" }}
            >
              {branding.logoAbbr}
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>{branding.name}</h1>
              <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: "var(--accent)" }}>Admin Panel</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 ml-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={({ isActive }) => ({
                  background: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                  boxShadow: isActive ? "var(--shadow-md)" : "none",
                })}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Section (Theme + User Dropdown) */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full transition-colors border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: "var(--accent)", color: "var(--accent-text)" }}
              >
                {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
              </div>
              <span className="text-xs font-bold hidden sm:block max-w-[100px] truncate" style={{ color: "var(--text-primary)" }}>
                {user?.name?.split(" ")[0] ?? "Admin"}
              </span>
              <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl overflow-hidden py-2 z-50 border"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="px-4 py-2 border-b mb-1" style={{ borderColor: "var(--border)" }}>
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                      {user?.name ?? "Administrador"}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {user?.email ?? "admin@gym.com"}
                    </p>
                  </div>
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
        </div>
      </header>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            style={{ backgroundColor: "var(--overlay)" }}
            onClick={() => setSidebarOpen(false)}
          >
            {/* Mobile Sidebar Content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="absolute top-0 left-0 h-screen w-64 flex flex-col shadow-2xl"
              style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm"
                    style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                  >
                    {branding.logoAbbr}
                  </div>
                  <div>
                    <h1 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{branding.name}</h1>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--text-secondary)", background: "var(--bg-primary)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={({ isActive }) => ({
                      background: isActive ? "var(--accent)" : "transparent",
                      color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                      boxShadow: isActive ? "var(--shadow-md)" : "none",
                    })}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>

    </div>
  )
}
