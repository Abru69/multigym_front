import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getTenantFromLocation } from '@/lib/tenant'
import type { ReactNode } from 'react'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const tenantId = getTenantFromLocation()

  if (!isAuthenticated) {
    return <Navigate to={tenantId ? `/login?tenant=${tenantId}` : '/login'} state={{ from: location }} replace />
  }

  return <>{children}</>
}
