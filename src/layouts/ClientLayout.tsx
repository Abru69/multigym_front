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
import { getTenantHomeUrl } from '@/lib/tenant'
import { useTheme } from '@/hooks/useTheme'
import { getAllowedPages } from '@/lib/permissions'
import { InstallBanner } from '@/components/ui/InstallBanner'
import { TenantLogo } from '@/components/tenant/TenantLogo'

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
    window.location.href = getTenantHomeUrl(currentTenantId)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg-secondary)]">
      <InstallBanner />
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-xl supports-[backdrop-filter]:bg-[var(--card)]/80">
        <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <TenantLogo />
            <span className="hidden text-sm font-bold tracking-tight text-[var(--text-primary)] sm:inline">
              {branding?.name || 'MULTIGYM'}
            </span>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <nav className="hidden items-center gap-1 lg:flex">
              {clientNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-b-2 border-[var(--accent)] font-semibold text-[var(--accent-text)]'
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
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/tienda/carrito"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-hover)] active:scale-95"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-[var(--accent-text)]">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] pl-1.5 pr-3 text-xs font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] active:scale-95"
                >
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-[var(--accent)] text-[var(--accent-text)]">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        className="h-full w-full object-cover"
                        alt={user.name ?? ''}
                      />
                    ) : (
                      <User size={14} />
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
                className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-bold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97] sm:px-4"
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
        <nav className="fixed right-0 bottom-0 left-0 z-30 border-t border-[var(--border)] bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--card)]/80 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-1.5 pb-1">
            {clientNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 transition-all ${
                    isActive
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-muted)] active:scale-95'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                        isActive
                          ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span
                      className={`text-[10px] font-semibold leading-none ${
                        isActive ? 'text-[var(--accent)]' : ''
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
