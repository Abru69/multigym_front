import { useState } from "react"
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { usePlatformAuthStore } from "@/features/platform/store/platformAuthStore"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import {
  Zap, LayoutDashboard, Building2, Users, CreditCard,
  FileText, Settings, Menu, X, LogOut, Bell, ChevronDown,
} from "lucide-react"

const navItems = [
  { to: "/platform",          icon: LayoutDashboard, label: "Dashboard",   end: true },
  { to: "/platform/tenants",  icon: Building2,       label: "Gimnasios"         },
  { to: "/platform/users",    icon: Users,           label: "Usuarios"          },
  { to: "/platform/billing",  icon: CreditCard,      label: "Facturación"       },
  { to: "/platform/logs",     icon: FileText,        label: "Auditoría"         },
  { to: "/platform/settings", icon: Settings,        label: "Configuración"     },
]

export function PlatformLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const { admin, logout } = usePlatformAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/platform/login")
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
          <Link to="/platform" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--detail))", color: "var(--text-on-primary)" }}
            >
              <Zap size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>MultiGym</h1>
              <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: "var(--accent)" }}>Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 ml-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={({ isActive }) => ({
                  background: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                  boxShadow: isActive ? "var(--shadow-md)" : "none",
                })}
              >
                <item.icon size={14} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Section (Theme, Bell, User Dropdown) */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <div className="relative">
            <button
              className="p-2 rounded-lg transition-colors hidden sm:block"
              style={{ color: "var(--text-secondary)", background: "var(--surface)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              <Bell size={18} />
            </button>
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full hidden sm:block"
              style={{ background: "var(--accent)" }}
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full transition-colors border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--detail))", color: "var(--text-on-primary)" }}
              >
                {admin?.name?.slice(0, 2).toUpperCase() ?? "SA"}
              </div>
              <span className="text-xs font-bold hidden sm:block max-w-[100px] truncate" style={{ color: "var(--text-primary)" }}>
                {admin?.name?.split(" ")[0] ?? "Super Admin"}
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
                      {admin?.name ?? "Super Administrador"}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {admin?.email ?? "super@multigym.com"}
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
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--detail))", color: "var(--text-on-primary)" }}
                  >
                    <Zap size={18} />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>MultiGym</h1>
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
