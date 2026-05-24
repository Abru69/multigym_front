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
import Landing from "@/pages/Landing"
import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/Register"
import AdminDashboard from "@/pages/admin/Dashboard"
import Inventory from "@/pages/admin/Inventory"
import Users from "@/pages/admin/Users"
import RoutineBuilder from "@/pages/admin/RoutineBuilder"
import MyRoutines from "@/pages/client/MyRoutines"
import Progress from "@/pages/client/Progress"
import Nutrition from "@/pages/client/Nutrition"
import Catalog from "@/pages/shop/Catalog"
import ProductDetail from "@/pages/shop/ProductDetail"
import Cart from "@/pages/shop/Cart"
import Checkout from "@/pages/shop/Checkout"

// Platform Pages
import PlatformLogin from "@/pages/platform/PlatformLogin"
import PlatformDashboard from "@/pages/platform/PlatformDashboard"
import PlatformTenants from "@/pages/platform/PlatformTenants"
import PlatformUsers from "@/pages/platform/PlatformUsers"
import PlatformBilling from "@/pages/platform/PlatformBilling"
import PlatformLogs from "@/pages/platform/PlatformLogs"
import PlatformSettings from "@/pages/platform/PlatformSettings"

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
      { path: "rutinas", element: <RoutineBuilder /> },
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
