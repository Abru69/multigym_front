import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getAllowedPages } from '@/lib/permissions'
import { getTenantFromLocation } from '@/lib/tenant'
import type { ReactNode } from 'react'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const tenantId = getTenantFromLocation()
  const location = useLocation()

  if (!hasHydrated) return null

  if (!isAuthenticated) {
    const params = new URLSearchParams()
    if (tenantId) params.set('tenant', tenantId)
    params.set('returnTo', `${location.pathname}${location.search}`)
    return <Navigate to={`/login?${params.toString()}`} replace />
  }

  const allowed = getAllowedPages(user?.role)
  if (allowed.length === 0) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
