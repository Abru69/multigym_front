import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getDefaultRoute } from './routes'
import type { ReactNode } from 'react'

export function ClientGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  if (!hasHydrated) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'client') {
    return <Navigate to={getDefaultRoute(user?.role)} replace />
  }

  return <>{children}</>
}
