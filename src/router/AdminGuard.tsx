import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import type { ReactNode } from "react"

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== "admin") {
    return <Navigate to="/app/rutinas" replace />
  }

  return <>{children}</>
}
