import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { canAccessPage, getPageFromPath, type AdminPage } from '@/lib/permissions'
import { getDefaultRoute } from './routes'
import type { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  page: AdminPage
}

export function RoleGuard({ children, page }: RoleGuardProps) {
  const { user } = useAuthStore()

  if (!canAccessPage(user?.role, page)) {
    return <Navigate to={getDefaultRoute(user?.role)} replace />
  }

  return <>{children}</>
}

export function PathRoleGuard({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  const page = getPageFromPath(window.location.pathname)

  if (page && !canAccessPage(user?.role, page)) {
    return <Navigate to={getDefaultRoute(user?.role)} replace />
  }

  return <>{children}</>
}
