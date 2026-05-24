import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { usePlatformAuthStore } from "@/store/platformAuthStore"
import {
  Zap, LayoutDashboard, Building2, Users, CreditCard,
  FileText, Settings, Menu, X, LogOut, Bell, ChevronRight,
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
  const { admin, logout } = usePlatformAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/platform/login")
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--detail))", boxShadow: "0 0 15px rgba(0,0,255,0.3)" }}
            >
              <Zap size={18} color="#fff" />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
                MultiGym
              </p>
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--accent)" }}>
                Platform
              </p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded" style={{ color: "var(--text-secondary)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
              style={({ isActive }) => ({
                background: isActive ? "rgba(0,0,255,0.12)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                border: isActive ? "1px solid rgba(0,0,255,0.2)" : "1px solid transparent",
              })}
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Divider with label */}
        <div className="px-4 pb-2">
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            Cuenta
          </p>
        </div>

        {/* User + logout */}
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--detail))", color: "#fff" }}
            >
              {admin?.name?.slice(0, 2).toUpperCase() ?? "SA"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {admin?.name ?? "Super Admin"}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                {admin?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: "var(--danger)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,77,77,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3"
          style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg"
            style={{ background: "var(--surface)", color: "var(--text-secondary)" }}
          >
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {/* Notification badge */}
            <div className="relative">
              <button
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--text-secondary)", background: "var(--surface)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                <Bell size={18} />
              </button>
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            </div>
            {/* Role chip */}
            <span
              className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: "rgba(0,0,255,0.12)", color: "var(--accent)", border: "1px solid rgba(0,0,255,0.2)" }}
            >
              SUPER ADMIN
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
