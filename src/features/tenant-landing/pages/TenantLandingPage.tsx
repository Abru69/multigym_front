import { Link } from 'react-router-dom'
import { Dumbbell, ShoppingBag, Package, LogOut } from 'lucide-react'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getAllowedPages } from '@/lib/permissions'
import { TenantHero } from '../components/TenantHero'
import { TenantAnnouncements } from '../components/TenantAnnouncements'
import { GymSchedule } from '../components/GymSchedule'
import { Trainers } from '../components/Trainers'
import { GymPlans } from '../components/GymPlans'
import { TenantFooter } from '../components/TenantFooter'
import { MemberPlanSummary } from '../components/MemberPlanSummary'
import { getTenantHomeUrl } from '@/lib/tenant'
import { TenantLogo } from '@/components/tenant/TenantLogo'

export default function TenantLandingPage() {
  const { branding, tenantId } = useTenantBranding()
  const { isAuthenticated, user, logout } = useAuthStore()
  const isClient = user?.role === 'client'

  const portalLink = getAllowedPages(user?.role).length > 0 ? '/admin' : '/app/rutinas'

  const handleLogout = async () => {
    const currentTenantId = tenantId || user?.tenantId
    await logout()
    window.location.href = getTenantHomeUrl(currentTenantId)
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:h-16 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <TenantLogo />
            <span className="max-w-[120px] truncate text-sm font-bold text-[var(--text-primary)] sm:text-lg">
              {branding.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#horarios" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
              Horarios
            </a>
            <a href="#entrenadores" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
              Entrenadores
            </a>
            <a href="#planes" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
              Planes
            </a>
            <Link to="/tienda" className="text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
              Tienda
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {isAuthenticated ? (
              <>
                {isClient && (
                  <nav className="hidden items-center gap-1 sm:flex">
                    <Link to="/app/rutinas" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">
                      <Dumbbell size={14} />
                      Rutinas
                    </Link>
                    <Link to="/tienda" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">
                      <ShoppingBag size={14} />
                      Tienda
                    </Link>
                    <Link to="/app/mis-ordenes" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]">
                      <Package size={14} />
                      Mis Órdenes
                    </Link>
                  </nav>
                )}
                <Link
                  to={portalLink}
                  className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-text)] shadow-sm transition-all hover:brightness-110 active:scale-[0.98] sm:px-4 sm:text-sm"
                >
                  Mi Portal
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
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
                  className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-text)] shadow-lg transition-all hover:brightness-110 active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  Unirme
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={isAuthenticated && isClient ? 'pb-20 lg:pb-0' : undefined}>
        <TenantHero />

        {isAuthenticated && isClient && <MemberPlanSummary />}

        <TenantAnnouncements position="HERO" />
        <TenantAnnouncements position="POPUP" />
        <TenantAnnouncements position="BANNER" />
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

      <TenantAnnouncements position="FOOTER" />
      <TenantFooter />
    </div>
  )
}
