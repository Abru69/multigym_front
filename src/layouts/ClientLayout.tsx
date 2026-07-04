import { useState } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/features/shop/store/cartStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  Dumbbell,
  TrendingUp,
  ShoppingBag,
  User,
  ShoppingCart,
  Utensils,
  LogOut,
} from 'lucide-react'
import { getTenantUrl } from '@/lib/tenant'

const clientNav = [
  { to: '/app/rutinas', icon: Dumbbell, label: 'Rutinas' },
  { to: '/app/nutricion', icon: Utensils, label: 'Nutrición' },
  { to: '/app/progreso', icon: TrendingUp, label: 'Progreso' },
  { to: '/tienda', icon: ShoppingBag, label: 'Tienda' },
]

export function ClientLayout() {
  const cartCount = useCartStore((s) => s.itemCount())
  const { isAuthenticated, user, logout, tenantId } = useAuthStore()
  const { branding } = useTenantBranding()
  const location = useLocation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const portalLink = user?.role === 'admin' ? '/admin' : '/app/rutinas'

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
    <div className="relative flex min-h-screen flex-col bg-[var(--bg-primary)]">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[300px] bg-[var(--ambient-glow)]" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 text-xs font-black text-[var(--accent)] shadow-[0_0_12px_rgba(66,204,99,0.15)]">
                {branding.logoAbbr}
              </div>
              <span className="hidden text-sm font-bold tracking-tight text-[var(--text-primary)] sm:block">
                {branding.name}
              </span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden items-center gap-1 lg:flex">
                {clientNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--detail)] text-white shadow-[0_0_12px_rgba(66,204,99,0.3)]'
                          : 'text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)]'
                      }`
                    }
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
              className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-[var(--text-secondary)] backdrop-blur-md transition-all hover:bg-white/[0.08]"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--detail)] text-[10px] font-bold text-white shadow-[0_0_8px_rgba(66,204,99,0.4)]">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] py-1.5 pr-3.5 pl-2.5 text-xs font-bold text-[var(--text-primary)] backdrop-blur-md transition-all hover:border-white/[0.15] hover:bg-white/[0.08]"
                >
                  <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--detail)] text-white">
                    {user?.avatar ? (
                      <img src={user.avatar} className="h-full w-full object-cover" alt={user.name} />
                    ) : (
                      <User size={12} />
                    )}
                  </div>
                  <span className="hidden truncate sm:block">
                    Bienvenido, {user?.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                    >
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          navigate(portalLink)
                        }}
                        className="block w-full px-4 py-2 text-left text-sm font-medium text-[var(--text-primary)] backdrop-blur-md transition-all hover:bg-white/[0.06]"
                      >
                        Mi Portal
                      </button>
                      <div className="my-1 h-px bg-white/[0.06]" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-[var(--error)] backdrop-blur-md transition-all hover:bg-[var(--error)]/10"
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
                className="rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--detail)] px-4 py-1.5 text-sm font-bold text-white shadow-[0_0_12px_rgba(66,204,99,0.3)] transition-all hover:shadow-[0_0_20px_rgba(66,204,99,0.4)] active:scale-[0.97]"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 pb-20 lg:pb-4">
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
        <nav className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t border-white/[0.06] bg-white/[0.03] px-2 py-2 backdrop-blur-2xl lg:hidden">
          {clientNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--detail)] text-white shadow-[0_0_12px_rgba(66,204,99,0.3)]'
                    : 'text-[var(--text-muted)] hover:bg-white/[0.04]'
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
