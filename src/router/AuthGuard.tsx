import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"
import type { ReactNode } from "react"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
