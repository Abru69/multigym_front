import { lazy, Suspense } from 'react'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { Spinner } from '@/components/ui/Spinner'

const TenantLandingPage = lazy(() => import('@/features/tenant-landing/pages/TenantLandingPage'))
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

  // No tenant subdomain — show main MultiGym SaaS landing
  if (!isTenantContext) {
    return (
      <SuspenseWrapper>
        <Landing />
      </SuspenseWrapper>
    )
  }

  // Tenant subdomain — always show tenant landing (auth-aware)
  return (
    <SuspenseWrapper>
      <TenantLandingPage />
    </SuspenseWrapper>
  )
}
