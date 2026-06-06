import { Navigate } from "react-router-dom"
import { usePlatformAuthStore } from "@/features/platform/store/platformAuthStore"

export function PlatformGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = usePlatformAuthStore()
  if (!isAuthenticated) return <Navigate to="/platform/login" replace />
  return <>{children}</>
}
