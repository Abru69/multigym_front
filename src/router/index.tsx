import { createBrowserRouter, Navigate } from "react-router-dom"
import { AuthGuard } from "./AuthGuard"
import { AdminGuard } from "./AdminGuard"
import { PlatformGuard } from "./PlatformGuard"

// Layouts
import { AdminLayout } from "@/layouts/AdminLayout"
import { ClientLayout } from "@/layouts/ClientLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { PlatformLayout } from "@/layouts/PlatformLayout"

// Pages
import Landing from "@/features/client/pages/Landing"
import Login from "@/features/auth/pages/Login"
import Register from "@/features/auth/pages/Register"
import ForgotPassword from "@/features/auth/pages/ForgotPassword"
import ResetPassword from "@/features/auth/pages/ResetPassword"
import ActivateAccount from "@/features/auth/pages/ActivateAccount"
import AdminDashboard from "@/features/admin/pages/Dashboard"
import Inventory from "@/features/admin/pages/Inventory"
import Users from "@/features/admin/pages/Users"
import Exercises from "@/features/admin/pages/Exercises"
import RoutineBuilder from "@/features/admin/pages/RoutineBuilder"
import MyRoutines from "@/features/client/pages/MyRoutines"
import Progress from "@/features/client/pages/Progress"
import Nutrition from "@/features/client/pages/Nutrition"
import Catalog from "@/features/shop/pages/Catalog"
import ProductDetail from "@/features/shop/pages/ProductDetail"
import Cart from "@/features/shop/pages/Cart"
import Checkout from "@/features/shop/pages/Checkout"

// Platform Pages
import PlatformLogin from "@/features/platform/pages/PlatformLogin"
import PlatformDashboard from "@/features/platform/pages/PlatformDashboard"
import PlatformTenants from "@/features/platform/pages/PlatformTenants"
import PlatformUsers from "@/features/platform/pages/PlatformUsers"
import PlatformBilling from "@/features/platform/pages/PlatformBilling"
import PlatformLogs from "@/features/platform/pages/PlatformLogs"
import PlatformSettings from "@/features/platform/pages/PlatformSettings"

export const router = createBrowserRouter([
  // --- Platform Routes ---
  {
    path: "/platform/login",
    element: <PlatformLogin />,
  },
  {
    path: "/platform",
    element: (
      <PlatformGuard>
        <PlatformLayout />
      </PlatformGuard>
    ),
    children: [
      { index: true, element: <PlatformDashboard /> },
      { path: "tenants", element: <PlatformTenants /> },
      { path: "users", element: <PlatformUsers /> },
      { path: "billing", element: <PlatformBilling /> },
      { path: "logs", element: <PlatformLogs /> },
      { path: "settings", element: <PlatformSettings /> },
    ],
  },
  // --- App Routes ---
  {
    path: "/",
    element: <Landing />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/registro", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/activate-account", element: <ActivateAccount /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "inventario", element: <Inventory /> },
      { path: "usuarios", element: <Users /> },
      { path: "ejercicios", element: <Exercises /> },
    ],
  },
  {
    path: "/app",
    element: (
      <AuthGuard>
        <ClientLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="rutinas" replace /> },
      { path: "rutinas", element: <MyRoutines /> },
      { path: "progreso", element: <Progress /> },
      { path: "nutricion", element: <Nutrition /> },
    ],
  },
  {
    path: "/tienda",
    element: <ClientLayout />,
    children: [
      { index: true, element: <Catalog /> },
      { path: ":slug", element: <ProductDetail /> },
      { path: "carrito", element: <Cart /> },
      {
        path: "checkout",
        element: (
          <AuthGuard>
            <Checkout />
          </AuthGuard>
        ),
      },
    ],
  },
])
