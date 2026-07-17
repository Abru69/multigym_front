import { getAllowedPages } from '@/lib/permissions'

export const PAGE_ROUTE_INVERSE: Record<string, string> = {
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
  billing: '/admin/billing',
}

export function getDefaultRoute(role: string | undefined): string {
  const allowed = getAllowedPages(role)
  if (allowed.length === 0) return '/'
  return PAGE_ROUTE_INVERSE[allowed[0]] || '/admin'
}
