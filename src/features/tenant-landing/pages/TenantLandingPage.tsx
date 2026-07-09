import { Link } from 'react-router-dom'
import { Zap, Dumbbell, ShoppingBag, Package, LogOut } from 'lucide-react'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { useAuthStore } from '@/features/auth/store/authStore'
import { TenantHero } from '../components/TenantHero'
import { GymSchedule } from '../components/GymSchedule'
import { Trainers } from '../components/Trainers'
import { GymPlans } from '../components/GymPlans'
import { TenantFooter } from '../components/TenantFooter'

export default function TenantLandingPage() {
  const { branding, tenantId } = useTenantBranding()
  const { isAuthenticated, user, logout } = useAuthStore()

  const portalLink = user?.role === 'admin' ? '/admin' : '/app/rutinas'

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--detail)] text-[var(--text-on-primary)]">
              <Zap size={18} />
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)]">{branding.name}</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#horarios"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Horarios
            </a>
            <a
              href="#entrenadores"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Entrenadores
            </a>
            <a
              href="#planes"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Planes
            </a>
            <Link
              to="/tienda"
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Tienda
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <nav className="hidden items-center gap-1 sm:flex">
                  <Link
                    to="/app/rutinas"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  >
                    <Dumbbell size={14} />
                    Rutinas
                  </Link>
                  <Link
                    to="/tienda"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  >
                    <ShoppingBag size={14} />
                    Tienda
                  </Link>
                  <Link
                    to="/app/mis-ordenes"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  >
                    <Package size={14} />
                    Mis Órdenes
                  </Link>
                </nav>
                <Link
                  to={portalLink}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  Mi Portal
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to={`/login?tenant=${tenantId}`}
                  className="hidden text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:block"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to={`/registro?tenant=${tenantId}`}
                  className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  Unirme
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <TenantHero />
        <div id="horarios">
          <GymSchedule />
        </div>
        <div id="entrenadores">
          <Trainers />
        </div>
        <div id="planes">
          <GymPlans />
        </div>
      </main>

      <TenantFooter />
    </div>
  )
}
