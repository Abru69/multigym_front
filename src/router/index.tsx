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
const Progress = lazy(() => import('@/features/client/pages/Progress'))
const Nutrition = lazy(() => import('@/features/client/pages/Nutrition'))

// Admin Pages
const AdminDashboard = lazy(() => import('@/features/admin/pages/Dashboard'))
const Inventory = lazy(() => import('@/features/admin/pages/Inventory'))
const Users = lazy(() => import('@/features/admin/pages/Users'))
const Exercises = lazy(() => import('@/features/admin/pages/Exercises'))

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
      { path: 'progreso', element: withSuspense(Progress) },
      { path: 'nutricion', element: withSuspense(Nutrition) },
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
