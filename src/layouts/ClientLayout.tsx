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
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--header-bg)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-black"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              {branding.logoAbbr}
            </div>
            <span
              className="hidden text-sm font-bold sm:block"
              style={{ color: 'var(--text-primary)' }}
            >
              {branding.name}
            </span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden items-center gap-1 lg:flex">
              {clientNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    boxShadow: isActive ? 'var(--shadow-md)' : 'none',
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
            className="relative rounded-lg p-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 rounded-lg py-1.5 pr-3.5 pl-2.5 text-xs font-bold transition-colors"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl py-1 shadow-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        navigate(portalLink)
                      }}
                      className="block w-full px-4 py-2 text-left text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--surface-hover)')
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Mi Portal
                    </button>
                    <div className="h-px" style={{ background: 'var(--border)' }} />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
                      style={{ color: 'var(--error)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--error-muted)')
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
              className="rounded-lg px-4 py-1.5 text-sm font-medium transition-all"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
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
          className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around px-2 py-2 lg:hidden"
          style={{
            background: 'var(--header-bg)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--border)',
          }}
        >
          {clientNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors"
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
                background: isActive ? 'var(--accent)' : 'transparent',
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
