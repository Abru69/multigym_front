export type AdminPage =
  | 'dashboard'
  | 'users'
  | 'plans'
  | 'subscriptions'
  | 'payments'
  | 'nutrition'
  | 'inventory'
  | 'exercises'
  | 'pickups'
  | 'shipments'
  | 'delivery'
  | 'checkins'
  | 'announcements'
  | 'reports'
  | 'branches'
  | 'branding'
  | 'billing'

export type UserRole = 'admin' | 'client' | 'nutricionist' | 'staff' | 'receptionist' | 'seller'

const ROLE_PAGES: Record<UserRole, AdminPage[]> = {
  admin: [
    'dashboard', 'users', 'plans', 'subscriptions', 'payments',
    'nutrition', 'inventory', 'exercises', 'pickups', 'shipments', 'delivery',
    'checkins', 'announcements', 'reports', 'branches', 'branding', 'billing',
  ],
  nutricionist: ['nutrition'],
  staff: ['dashboard', 'users', 'inventory', 'exercises', 'checkins'],
  receptionist: ['dashboard', 'users', 'subscriptions', 'payments', 'checkins'],
  seller: ['dashboard', 'inventory', 'pickups', 'shipments', 'delivery'],
  client: [],
}

export function canAccessPage(role: string | undefined, page: AdminPage): boolean {
  const pages = ROLE_PAGES[role as UserRole]
  if (!pages) return false
  return pages.includes(page)
}

export function getAllowedPages(role: string | undefined): AdminPage[] {
  return ROLE_PAGES[role as UserRole] || []
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  CLIENT: 'Cliente',
  NUTRICIONIST: 'Nutriólogo',
  STAFF: 'Staff',
  RECEPTIONIST: 'Recepcionista',
  SELLER: 'Vendedor',
}

export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: 'rgba(170,255,0,0.15)', text: '#0a0a0a' },
  NUTRICIONIST: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  STAFF: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  RECEPTIONIST: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  SELLER: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
  CLIENT: { bg: 'rgba(102,102,102,0.15)', text: '#666666' },
}

const PAGE_ROUTE_MAP: Record<string, AdminPage> = {
  '/admin': 'dashboard',
  '/admin/usuarios': 'users',
  '/admin/planes': 'plans',
  '/admin/suscripciones': 'subscriptions',
  '/admin/pagos': 'payments',
  '/admin/nutricion': 'nutrition',
  '/admin/inventario': 'inventory',
  '/admin/ejercicios': 'exercises',
  '/admin/recogidas': 'pickups',
  '/admin/envios': 'shipments',
  '/admin/entrega': 'delivery',
  '/admin/check-ins': 'checkins',
  '/admin/anuncios': 'announcements',
  '/admin/reportes': 'reports',
  '/admin/sucursales': 'branches',
  '/admin/branding': 'branding',
  '/admin/billing': 'billing',
}

export function getPageFromPath(pathname: string): AdminPage | null {
  const path = pathname.replace(/\/+$/, '') || '/admin'
  return PAGE_ROUTE_MAP[path] || null
}
