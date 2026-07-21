import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import { AdminGuard } from './AdminGuard'
import { PlatformGuard } from './PlatformGuard'
import { TenantRouter } from './TenantRouter'
import { RoleGuard } from './RoleGuard'
import { ClientGuard } from './ClientGuard'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ClientLayout } from '@/layouts/ClientLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { PlatformLayout } from '@/layouts/PlatformLayout'
import { Spinner } from '@/components/ui/Spinner'
import {
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  ActivateAccount,
  MyRoutines,
  Nutrition,
  MyOrders,
  MemberProfile,
  AdminDashboard,
  Inventory,
  Users,
  Exercises,
  Plans,
  Subscriptions,
  Payments,
  Pickups,
  Shipments,
  DeliverySettings,
  NutritionPlans,
  CheckIns,
  Announcements,
  Reports,
  Branches,
  BrandingSettings,
  Billing,
  MercadoPagoSettings,
  Catalog,
  ProductDetail,
  Cart,
  Checkout,
  PlatformLogin,
  PlatformDashboard,
  PlatformTenants,
  PlatformUsers,
  PlatformSaaSPlans,
  PlatformBilling,
  PlatformLogs,
  PlatformSettings,
  PlatformReports,
  PlatformAnalytics,
  NotFound,
} from './lazyRoutes'

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense
    fallback={
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size={32} />
      </div>
    }
  >
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  // Platform Routes
  {
    path: '/platform/login',
    element: withSuspense(PlatformLogin),
  },
  {
    path: '/platform',
    element: (
      <PlatformGuard>
        <PlatformLayout />
      </PlatformGuard>
    ),
    children: [
      { index: true, element: withSuspense(PlatformDashboard) },
      { path: 'tenants', element: withSuspense(PlatformTenants) },
      { path: 'users', element: withSuspense(PlatformUsers) },
      { path: 'saas-plans', element: withSuspense(PlatformSaaSPlans) },
      { path: 'billing', element: withSuspense(PlatformBilling) },
      { path: 'logs', element: withSuspense(PlatformLogs) },
      { path: 'settings', element: withSuspense(PlatformSettings) },
      { path: 'reports', element: withSuspense(PlatformReports) },
      { path: 'analytics', element: withSuspense(PlatformAnalytics) },
    ],
  },

  // Root Route — Tenant-aware landing/dashboard
  {
    path: '/',
    element: <TenantRouter />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: withSuspense(Login) },
      { path: '/registro', element: withSuspense(Register) },
      { path: '/forgot-password', element: withSuspense(ForgotPassword) },
      { path: '/reset-password', element: withSuspense(ResetPassword) },
      { path: '/activate-account', element: withSuspense(ActivateAccount) },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: <RoleGuard page="dashboard">{withSuspense(AdminDashboard)}</RoleGuard>,
      },
      {
        path: 'inventario',
        element: <RoleGuard page="inventory">{withSuspense(Inventory)}</RoleGuard>,
      },
      { path: 'usuarios', element: <RoleGuard page="users">{withSuspense(Users)}</RoleGuard> },
      {
        path: 'ejercicios',
        element: <RoleGuard page="exercises">{withSuspense(Exercises)}</RoleGuard>,
      },
      { path: 'planes', element: <RoleGuard page="plans">{withSuspense(Plans)}</RoleGuard> },
      {
        path: 'suscripciones',
        element: <RoleGuard page="subscriptions">{withSuspense(Subscriptions)}</RoleGuard>,
      },
      { path: 'pagos', element: <RoleGuard page="payments">{withSuspense(Payments)}</RoleGuard> },
      { path: 'recogidas', element: <RoleGuard page="pickups">{withSuspense(Pickups)}</RoleGuard> },
      {
        path: 'envios',
        element: <RoleGuard page="shipments">{withSuspense(Shipments)}</RoleGuard>,
      },
      {
        path: 'entrega',
        element: <RoleGuard page="delivery">{withSuspense(DeliverySettings)}</RoleGuard>,
      },
      {
        path: 'nutricion',
        element: <RoleGuard page="nutrition">{withSuspense(NutritionPlans)}</RoleGuard>,
      },
      {
        path: 'check-ins',
        element: <RoleGuard page="checkins">{withSuspense(CheckIns)}</RoleGuard>,
      },
      {
        path: 'anuncios',
        element: <RoleGuard page="announcements">{withSuspense(Announcements)}</RoleGuard>,
      },
      { path: 'reportes', element: <RoleGuard page="reports">{withSuspense(Reports)}</RoleGuard> },
      {
        path: 'sucursales',
        element: <RoleGuard page="branches">{withSuspense(Branches)}</RoleGuard>,
      },
      {
        path: 'branding',
        element: <RoleGuard page="branding">{withSuspense(BrandingSettings)}</RoleGuard>,
      },
      {
        path: 'mercadopago',
        element: <RoleGuard page="mercadopago">{withSuspense(MercadoPagoSettings)}</RoleGuard>,
      },
      { path: 'billing', element: <RoleGuard page="billing">{withSuspense(Billing)}</RoleGuard> },
    ],
  },

  // Client Routes
  {
    path: '/app',
    element: (
      <ClientGuard>
        <AuthGuard>
          <ClientLayout />
        </AuthGuard>
      </ClientGuard>
    ),
    children: [
      { index: true, element: <Navigate to="rutinas" replace /> },
      { path: 'rutinas', element: withSuspense(MyRoutines) },
      { path: 'nutricion', element: withSuspense(Nutrition) },
      { path: 'mis-ordenes', element: withSuspense(MyOrders) },
      { path: 'perfil', element: withSuspense(MemberProfile) },
    ],
  },

  // Shop Routes
  {
    path: '/tienda',
    element: <ClientLayout />,
    children: [
      { index: true, element: withSuspense(Catalog) },
      { path: ':slug', element: withSuspense(ProductDetail) },
      { path: 'carrito', element: withSuspense(Cart) },
      {
        path: 'checkout',
        element: <AuthGuard>{withSuspense(Checkout)}</AuthGuard>,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: withSuspense(NotFound),
  },
])
