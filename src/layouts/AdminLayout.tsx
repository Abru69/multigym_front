import { useAuthStore } from '@/features/auth/store/authStore'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getTenantHomeUrl } from '@/lib/tenant'
import { getTenantBillingRenewalInfo } from '@/lib/api'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { DashboardLayout, type NavItem, type NavSection } from '@/components/layout/DashboardLayout'
import { TenantLogo } from '@/components/tenant/TenantLogo'
import {
  LayoutDashboard,
  Package,
  Users,
  Dumbbell,
  CreditCard,
  Calendar,
  DollarSign,
  Store,
  Truck,
  Settings,
  Utensils,
  ClipboardList,
  Megaphone,
  BarChart3,
  Building2,
  Palette,
  ReceiptText,
} from 'lucide-react'
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
  { to: '/admin/mercadopago', icon: CreditCard, label: 'Mercado Pago', page: 'mercadopago' },
  { to: '/admin/billing', icon: ReceiptText, label: 'Facturación SaaS', page: 'billing' },
]

const ADMIN_NAV_SECTIONS: { label: string; pages: AdminPage[] }[] = [
  { label: 'Principal', pages: ['dashboard'] },
  {
    label: 'Gestión de Miembros',
    pages: ['users', 'checkins', 'plans', 'subscriptions', 'payments'],
  },
  { label: 'Entrenamiento y Bienestar', pages: ['exercises', 'nutrition'] },
  { label: 'Tienda y Operación', pages: ['inventory', 'pickups', 'shipments', 'delivery'] },
  { label: 'Organización', pages: ['branches', 'announcements'] },
  { label: 'Reportes y Configuración', pages: ['reports', 'branding', 'mercadopago', 'billing'] },
]

export function AdminLayout() {
  const { user, logout, tenantId } = useAuthStore()
  const { branding } = useTenantBranding()
  const location = useLocation()
  const navigate = useNavigate()

  const navSections: NavSection[] = ADMIN_NAV_SECTIONS.map((section) => ({
    label: section.label,
    items: section.pages
      .map((page) => ALL_NAV_ITEMS.find((item) => item.page === page))
      .filter((item): item is NavItem & { page: AdminPage } => Boolean(item))
      .filter((item) => canAccessPage(user?.role, item.page)),
  })).filter((section) => section.items.length > 0)
  const navItems = navSections.flatMap((section) => section.items)

  const handleLogout = async () => {
    const currentTenantId = tenantId || user?.tenantId
    await logout()
    window.location.href = getTenantHomeUrl(currentTenantId)
  }

  useEffect(() => {
    if (user?.role !== 'admin' || location.pathname === '/admin/billing') return

    let cancelled = false
    getTenantBillingRenewalInfo()
      .then((response) => {
        if (cancelled || !response.dto) return
        const info = response.dto
        const subscriptionExpired = info.subscriptionEndsAt
          ? new Date(info.subscriptionEndsAt).getTime() < Date.now()
          : false
        const blockedStatus = ['TRIAL_EXPIRED', 'PAST_DUE', 'INACTIVE'].includes(info.status)
        if (blockedStatus || subscriptionExpired) {
          navigate('/admin/billing', { replace: true })
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [location.pathname, navigate, user?.role])

  return (
    <>
      <InstallBanner />
      <DashboardLayout
        navItems={navItems}
        navSections={navSections}
        logo={<TenantLogo className="rounded-lg shadow-sm" />}
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
