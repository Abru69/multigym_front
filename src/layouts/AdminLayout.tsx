import { Zap } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getTenantUrl } from '@/lib/tenant'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { DashboardLayout, type NavItem } from '@/components/layout/DashboardLayout'
import { LayoutDashboard, Package, Users, Dumbbell } from 'lucide-react'

const navItems: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/inventario', icon: Package, label: 'Inventario' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/admin/ejercicios', icon: Dumbbell, label: 'Ejercicios y Rutinas' },
]

export function AdminLayout() {
  const { user, logout, tenantId } = useAuthStore()
  const { branding } = useTenantBranding()

  const handleLogout = async () => {
    const currentTenantId = tenantId || user?.tenantId
    await logout()
    if (currentTenantId) {
      window.location.href = getTenantUrl(currentTenantId)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <DashboardLayout
      navItems={navItems}
      logo={
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-black text-[var(--accent-text)] shadow-sm">
          {branding.logoAbbr}
        </div>
      }
      title={branding.name}
      subtitle="Admin Panel"
      user={
        user
          ? {
              name: user.name,
              email: user.email,
              initials: user.name?.slice(0, 2).toUpperCase() ?? 'AD',
            }
          : null
      }
      onLogout={handleLogout}
    />
  )
}
