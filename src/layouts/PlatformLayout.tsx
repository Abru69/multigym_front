import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { usePlatformAuthStore } from '@/features/platform/store/platformAuthStore'
import { DashboardLayout, type NavItem } from '@/components/layout/DashboardLayout'
import { LayoutDashboard, Building2, Users, CreditCard, FileText, Settings, Package, BarChart3, TrendingUp, WalletCards, Dumbbell } from 'lucide-react'

const navItems: NavItem[] = [
  { to: '/platform', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/platform/tenants', icon: Building2, label: 'Gimnasios' },
  { to: '/platform/exercise-catalog', icon: Dumbbell, label: 'Catálogo Ejercicios' },
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
    <div
      className="platform-theme"
      style={{
        '--accent': '#1769e8',
        '--accent-hover': '#1256c7',
        '--accent-light': '#6ea4ff',
        '--accent-muted': 'rgba(23, 105, 232, 0.14)',
        '--accent-text': '#ffffff',
        '--primary': '#1769e8',
        '--primary-hover': '#1256c7',
        '--color-primary': '#1769e8',
        '--color-primary-hover': '#1256c7',
        '--color-accent': '#1769e8',
        '--color-accent-hover': '#1256c7',
        '--detail': '#22ad55',
        '--gradient-accent': 'linear-gradient(135deg, #1769e8 0%, #1256c7 100%)',
        '--sidebar-active': 'rgba(23, 105, 232, 0.14)',
        '--sidebar-active-text': '#1769e8',
        '--warning': '#f4f8ff',
        '--warning-muted': 'rgba(244, 248, 255, 0.12)',
      } as CSSProperties}
    >
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
    </div>
  )
}
