import { useAuthStore } from '@/features/auth/store/authStore'
import { getTenantUrl } from '@/lib/tenant'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { DashboardLayout, type NavItem } from '@/components/layout/DashboardLayout'
import { LayoutDashboard, Package, Users, Dumbbell, CreditCard, Calendar, DollarSign, Store, Truck, Settings, Utensils, ClipboardList, Megaphone, BarChart3, Building2, Palette } from 'lucide-react'
import { canAccessPage, type AdminPage } from '@/lib/permissions'
import { InstallBanner } from '@/components/ui/InstallBanner'

const ALL_NAV_ITEMS: (NavItem & { page: AdminPage })[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, page: 'dashboard' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuarios', page: 'users' },
  { to: '/admin/check-ins', icon: ClipboardList, label: 'Asistencia', page: 'checkins' },
  { to: '/admin/planes', icon: CreditCard, label: 'Planes', page: 'plans' },
  { to: '/admin/suscripciones', icon: Calendar, label: 'Suscripciones', page: 'subscriptions' },
  { to: '/admin/pagos', icon: DollarSign, label: 'Pagos', page: 'payments' },
  { to: '/admin/nutricion', icon: Utensils, label: 'Nutrición', page: 'nutrition' },
  { to: '/admin/recogidas', icon: Store, label: 'Recogidas', page: 'pickups' },
  { to: '/admin/envios', icon: Truck, label: 'Envíos', page: 'shipments' },
  { to: '/admin/entrega', icon: Settings, label: 'Métodos de Entrega', page: 'delivery' },
  { to: '/admin/inventario', icon: Package, label: 'Inventario', page: 'inventory' },
  { to: '/admin/sucursales', icon: Building2, label: 'Sucursales', page: 'branches' },
  { to: '/admin/ejercicios', icon: Dumbbell, label: 'Ejercicios y Rutinas', page: 'exercises' },
  { to: '/admin/anuncios', icon: Megaphone, label: 'Anuncios', page: 'announcements' },
  { to: '/admin/reportes', icon: BarChart3, label: 'Reportes', page: 'reports' },
  { to: '/admin/branding', icon: Palette, label: 'Colores de Marca', page: 'branding' },
]

export function AdminLayout() {
  const { user, logout, tenantId } = useAuthStore()
  const { branding } = useTenantBranding()

  const navItems = ALL_NAV_ITEMS.filter((item) =>
    canAccessPage(user?.role, item.page)
  )

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
    <>
      <InstallBanner />
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
    </>
  )
}
