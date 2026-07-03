import { lazy, Suspense } from 'react'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Spinner } from '@/components/ui/Spinner'

const TenantLandingPage = lazy(
  () => import('@/features/tenant-landing/pages/TenantLandingPage')
)
const TenantDashboard = lazy(
  () => import('@/features/tenant-landing/pages/TenantDashboard')
)
const Landing = lazy(() => import('@/features/landing/pages/LandingPage'))

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size={32} />
      </div>
    }
  >
    {children}
  </Suspense>
)

export function TenantRouter() {
  const { isTenantContext } = useTenantBranding()
  const { isAuthenticated } = useAuthStore()

  // No tenant subdomain — show main MultiGym SaaS landing
  if (!isTenantContext) {
    return (
      <SuspenseWrapper>
        <Landing />
      </SuspenseWrapper>
    )
  }

  // Tenant subdomain + authenticated — show member dashboard
  if (isAuthenticated) {
    return (
      <SuspenseWrapper>
        <TenantDashboard />
      </SuspenseWrapper>
    )
  }

  // Tenant subdomain + not authenticated — show tenant landing
  return (
    <SuspenseWrapper>
      <TenantLandingPage />
    </SuspenseWrapper>
  )
}
