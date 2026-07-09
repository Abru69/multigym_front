import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import { AdminGuard } from './AdminGuard'
import { PlatformGuard } from './PlatformGuard'
import { TenantRouter } from './TenantRouter'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ClientLayout } from '@/layouts/ClientLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { PlatformLayout } from '@/layouts/PlatformLayout'
import { Spinner } from '@/components/ui/Spinner'

// Auth Pages
const Login = lazy(() => import('@/features/auth/pages/Login'))
const Register = lazy(() => import('@/features/auth/pages/Register'))
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPassword'))
const ActivateAccount = lazy(() => import('@/features/auth/pages/ActivateAccount'))

// Client Pages
const MyRoutines = lazy(() => import('@/features/client/pages/MyRoutines'))
const Nutrition = lazy(() => import('@/features/client/pages/Nutrition'))
const MyOrders = lazy(() => import('@/features/client/pages/MyOrders'))
const MemberProfile = lazy(() => import('@/features/client/pages/MemberProfile'))

// Admin Pages
const AdminDashboard = lazy(() => import('@/features/admin/pages/Dashboard'))
const Inventory = lazy(() => import('@/features/admin/pages/Inventory'))
const Users = lazy(() => import('@/features/admin/pages/Users'))
const Exercises = lazy(() => import('@/features/admin/pages/Exercises'))
const Plans = lazy(() => import('@/features/admin/pages/Plans'))
const Subscriptions = lazy(() => import('@/features/admin/pages/Subscriptions'))
const Payments = lazy(() => import('@/features/admin/pages/Payments'))
const Pickups = lazy(() => import('@/features/admin/pages/Pickups'))
const Shipments = lazy(() => import('@/features/admin/pages/Shipments'))
const DeliverySettings = lazy(() => import('@/features/admin/pages/DeliverySettings'))

// Shop Pages
const Catalog = lazy(() => import('@/features/shop/pages/Catalog'))
const ProductDetail = lazy(() => import('@/features/shop/pages/ProductDetail'))
const Cart = lazy(() => import('@/features/shop/pages/Cart'))
const Checkout = lazy(() => import('@/features/shop/pages/Checkout'))

// Platform Pages
const PlatformLogin = lazy(() => import('@/features/platform/pages/PlatformLogin'))
const PlatformDashboard = lazy(() => import('@/features/platform/pages/PlatformDashboard'))
const PlatformTenants = lazy(() => import('@/features/platform/pages/PlatformTenants'))
const PlatformUsers = lazy(() => import('@/features/platform/pages/PlatformUsers'))
const PlatformSaaSPlans = lazy(() => import('@/features/platform/pages/PlatformSaaSPlans'))
const PlatformBilling = lazy(() => import('@/features/platform/pages/PlatformBilling'))
const PlatformLogs = lazy(() => import('@/features/platform/pages/PlatformLogs'))
const PlatformSettings = lazy(() => import('@/features/platform/pages/PlatformSettings'))

// 404 Page
const NotFound = lazy(() => import('@/pages/NotFound'))

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense
    fallback={
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
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
      { index: true, element: withSuspense(AdminDashboard) },
      { path: 'inventario', element: withSuspense(Inventory) },
      { path: 'usuarios', element: withSuspense(Users) },
      { path: 'ejercicios', element: withSuspense(Exercises) },
      { path: 'planes', element: withSuspense(Plans) },
      { path: 'suscripciones', element: withSuspense(Subscriptions) },
      { path: 'pagos', element: withSuspense(Payments) },
      { path: 'recogidas', element: withSuspense(Pickups) },
      { path: 'envios', element: withSuspense(Shipments) },
      { path: 'entrega', element: withSuspense(DeliverySettings) },
    ],
  },

  // Client Routes
  {
    path: '/app',
    element: (
      <AuthGuard>
        <ClientLayout />
      </AuthGuard>
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
