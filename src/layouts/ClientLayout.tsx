import { useState } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/features/shop/store/cartStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import {
  Dumbbell,
  ShoppingBag,
  User,
  ShoppingCart,
  Utensils,
  LogOut,
  Package,
  Sun,
  Moon,
} from 'lucide-react'
import { getTenantUrl } from '@/lib/tenant'
import { useTheme } from '@/hooks/useTheme'
import { getAllowedPages } from '@/lib/permissions'

const clientNav = [
  { to: '/app/rutinas', icon: Dumbbell, label: 'Rutinas' },
  { to: '/app/nutricion', icon: Utensils, label: 'Nutrición' },
  { to: '/app/mis-ordenes', icon: Package, label: 'Órdenes' },
  { to: '/tienda', icon: ShoppingBag, label: 'Tienda' },
  { to: '/app/perfil', icon: User, label: 'Perfil' },
]

export function ClientLayout() {
  const cartCount = useCartStore((s) => s.itemCount())
  const { isAuthenticated, user, logout, tenantId } = useAuthStore()
  const { branding } = useTenantBranding()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const portalLink = getAllowedPages(user?.role).length > 0 ? '/admin' : '/app/rutinas'

  const handleLogout = async () => {
    const currentTenantId = tenantId || user?.tenantId
    await logout()
    setShowMenu(false)
    if (currentTenantId) {
      window.location.href = getTenantUrl(currentTenantId)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-secondary)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="flex items-center justify-between px-4 py-3 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-xs font-black text-[var(--accent-text)]">
              {branding.logoAbbr}
            </div>
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              {branding?.name || 'MULTIGYM'}
            </span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {clientNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'text-[var(--accent-text)] font-semibold border-b-2 border-[var(--accent)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link
                to="/tienda/carrito"
                className="relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--text-secondary)] transition-all hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-[var(--accent-text)]">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] py-1.5 pr-3.5 pl-2.5 text-xs font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
                >
                  <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[var(--accent)] text-[var(--accent-text)]">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        className="h-full w-full object-cover"
                        alt={user.name ?? ''}
                      />
                    ) : (
                      <User size={12} />
                    )}
                  </div>
                  <span className="hidden truncate sm:block">
                    {user?.name?.split(' ')[0] ?? 'User'}
                  </span>
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg"
                    >
                      <div className="border-b border-[var(--border)] px-4 py-3">
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          {user?.name ?? ''}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          navigate(portalLink)
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
                      >
                        Mi Portal
                      </button>
                      <button
                        onClick={() => {
                          toggleTheme()
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
                      >
                        {isDark ? <Sun size={14} /> : <Moon size={14} />}
                        {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                      </button>
                      <div className="my-1 h-px bg-[var(--surface-hover)]" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
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
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
              >
                ENTRAR
              </Link>
            )}
          </div>
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
        <nav className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t border-[var(--border)] bg-[var(--card)] px-2 py-2 lg:hidden">
          {clientNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all ${
                  isActive
                    ? 'text-[var(--accent-text)]'
                    : 'text-[var(--text-muted)]'
                }`
              }
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
