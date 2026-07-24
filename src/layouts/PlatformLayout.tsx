import { useNavigate } from 'react-router-dom'
import { usePlatformAuthStore } from '@/features/platform/store/platformAuthStore'
import { DashboardLayout, type NavItem } from '@/components/layout/DashboardLayout'
import { LayoutDashboard, Building2, Users, CreditCard, FileText, Settings, Package, BarChart3, TrendingUp, WalletCards } from 'lucide-react'

const navItems: NavItem[] = [
  { to: '/platform', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/platform/tenants', icon: Building2, label: 'Gimnasios' },
  { to: '/platform/users', icon: Users, label: 'Usuarios' },
  { to: '/platform/saas-plans', icon: Package, label: 'Planes SaaS' },
  { to: '/platform/billing', icon: CreditCard, label: 'Facturación' },
  { to: '/platform/mercadopago', icon: WalletCards, label: 'MP SaaS' },
  { to: '/platform/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/platform/reports', icon: BarChart3, label: 'Reportes' },
  { to: '/platform/logs', icon: FileText, label: 'Auditoría' },
  { to: '/platform/settings', icon: Settings, label: 'Configuración' },
]

export function PlatformLayout() {
  const { admin, logout } = usePlatformAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/platform/login')
  }

  return (
    <DashboardLayout
      navItems={navItems}
      logo={
        <img
          src="/branding/multigym-isotipo-transparent.png"
          alt="MultiGym"
          className="h-9 w-9 rounded-xl object-contain"
        />
      }
      title="MultiGym"
      subtitle="Platform"
      user={
        admin
          ? {
              name: admin.name,
              email: admin.email,
              initials: admin.name?.slice(0, 2).toUpperCase() ?? 'SA',
            }
          : null
      }
      onLogout={handleLogout}
    />
  )
}
