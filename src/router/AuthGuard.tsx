import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getTenantFromLocation } from '@/lib/tenant'
import type { ReactNode } from 'react'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const tenantId = getTenantFromLocation()

  if (!isAuthenticated) {
    const params = new URLSearchParams()
    if (tenantId) params.set('tenant', tenantId)
    params.set('returnTo', `${location.pathname}${location.search}`)
    return <Navigate to={`/login?${params.toString()}`} replace />
  }

  return <>{children}</>
}
