import { useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { useRoutineStore } from '@/features/client/store/routineStore'
import { getTenantHomeUrl } from '@/lib/tenant'
import { TenantLogo } from '@/components/tenant/TenantLogo'
import { MemberSummary } from '../components/MemberSummary'
import { MemberRoutines } from '../components/MemberRoutines'
import { MemberShop } from '../components/MemberShop'
import { MemberNav } from '../components/MemberNav'

export default function TenantDashboard() {
  const { user, logout, tenantId } = useAuthStore()
  const { branding } = useTenantBranding()
  const { loadRoutines } = useRoutineStore()

  useEffect(() => {
    loadRoutines()
  }, [loadRoutines])

  const handleLogout = async () => {
    const currentTenantId = tenantId || user?.tenantId
    await logout()
    window.location.href = getTenantHomeUrl(currentTenantId)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <TenantLogo />
            <span className="text-lg font-bold text-[var(--text-primary)]">{branding.name}</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/app/rutinas"
              className="hidden text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:block"
            >
              Mis Rutinas
            </Link>
            <Link
              to="/tienda"
              className="hidden text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:block"
            >
              Tienda
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10 text-xs font-bold text-[var(--accent)]">
                {user?.name?.slice(0, 2).toUpperCase() ?? 'M'}
              </div>
              <span className="hidden text-sm font-medium text-[var(--text-primary)] sm:block">
                {user?.name?.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--error)]"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:block">
          <MemberSummary />
          <div className="grid gap-8 lg:grid-cols-2">
            <MemberRoutines />
            <MemberShop />
          </div>
        </div>

        <div className="lg:hidden">
          <Outlet />
        </div>
      </main>

      <MemberNav />
    </div>
  )
}
