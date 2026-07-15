import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getAllowedPages } from '@/lib/permissions'
import type { ReactNode } from 'react'

const PAGE_ROUTE_INVERSE: Record<string, string> = {
  dashboard: '/admin',
  users: '/admin/usuarios',
  plans: '/admin/planes',
  subscriptions: '/admin/suscripciones',
  payments: '/admin/pagos',
  nutrition: '/admin/nutricion',
  inventory: '/admin/inventario',
  exercises: '/admin/ejercicios',
  pickups: '/admin/recogidas',
  shipments: '/admin/envios',
  delivery: '/admin/entrega',
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const allowed = getAllowedPages(user?.role)
  if (allowed.length === 0) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export function getDefaultRoute(role: string | undefined): string {
  const allowed = getAllowedPages(role)
  if (allowed.length === 0) return '/'
  return PAGE_ROUTE_INVERSE[allowed[0]] || '/admin'
}
