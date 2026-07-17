import { lazy } from 'react'

// Auth Pages
export const Login = lazy(() => import('@/features/auth/pages/Login'))
export const Register = lazy(() => import('@/features/auth/pages/Register'))
export const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'))
export const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPassword'))
export const ActivateAccount = lazy(() => import('@/features/auth/pages/ActivateAccount'))

// Client Pages
export const MyRoutines = lazy(() => import('@/features/client/pages/MyRoutines'))
export const Nutrition = lazy(() => import('@/features/client/pages/Nutrition'))
export const MyOrders = lazy(() => import('@/features/client/pages/MyOrders'))
export const MemberProfile = lazy(() => import('@/features/client/pages/MemberProfile'))

// Admin Pages
export const AdminDashboard = lazy(() => import('@/features/admin/pages/Dashboard'))
export const Inventory = lazy(() => import('@/features/admin/pages/Inventory'))
export const Users = lazy(() => import('@/features/admin/pages/Users'))
export const Exercises = lazy(() => import('@/features/admin/pages/Exercises'))
export const Plans = lazy(() => import('@/features/admin/pages/Plans'))
export const Subscriptions = lazy(() => import('@/features/admin/pages/Subscriptions'))
export const Payments = lazy(() => import('@/features/admin/pages/Payments'))
export const Pickups = lazy(() => import('@/features/admin/pages/Pickups'))
export const Shipments = lazy(() => import('@/features/admin/pages/Shipments'))
export const DeliverySettings = lazy(() => import('@/features/admin/pages/DeliverySettings'))
export const NutritionPlans = lazy(() => import('@/features/admin/pages/NutritionPlans'))
export const CheckIns = lazy(() => import('@/features/admin/pages/CheckIns'))
export const Announcements = lazy(() => import('@/features/admin/pages/Announcements'))
export const Reports = lazy(() => import('@/features/admin/pages/Reports'))
export const Branches = lazy(() => import('@/features/admin/pages/Branches'))
export const BrandingSettings = lazy(() => import('@/features/admin/pages/BrandingSettings'))
export const Billing = lazy(() => import('@/features/admin/pages/Billing'))

// Shop Pages
export const Catalog = lazy(() => import('@/features/shop/pages/Catalog'))
export const ProductDetail = lazy(() => import('@/features/shop/pages/ProductDetail'))
export const Cart = lazy(() => import('@/features/shop/pages/Cart'))
export const Checkout = lazy(() => import('@/features/shop/pages/Checkout'))

// Platform Pages
export const PlatformLogin = lazy(() => import('@/features/platform/pages/PlatformLogin'))
export const PlatformDashboard = lazy(() => import('@/features/platform/pages/PlatformDashboard'))
export const PlatformTenants = lazy(() => import('@/features/platform/pages/PlatformTenants'))
export const PlatformUsers = lazy(() => import('@/features/platform/pages/PlatformUsers'))
export const PlatformSaaSPlans = lazy(() => import('@/features/platform/pages/PlatformSaaSPlans'))
export const PlatformBilling = lazy(() => import('@/features/platform/pages/PlatformBilling'))
export const PlatformLogs = lazy(() => import('@/features/platform/pages/PlatformLogs'))
export const PlatformSettings = lazy(() => import('@/features/platform/pages/PlatformSettings'))
export const PlatformReports = lazy(() => import('@/features/platform/pages/PlatformReports'))
export const PlatformAnalytics = lazy(() => import('@/features/platform/pages/PlatformAnalyticsPage'))

// 404 Page
export const NotFound = lazy(() => import('@/pages/NotFound'))
