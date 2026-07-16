import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getAllowedPages } from '@/lib/permissions'
import { getTenantFromLocation } from '@/lib/tenant'
import type { ReactNode } from 'react'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const tenantId = getTenantFromLocation()

  if (!isAuthenticated) {
    return <Navigate to={tenantId ? `/login?tenant=${tenantId}` : '/login'} replace />
  }

  const allowed = getAllowedPages(user?.role)
  if (allowed.length === 0) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
