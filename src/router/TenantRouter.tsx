import { lazy, Suspense, useEffect, useState } from 'react'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { Spinner } from '@/components/ui/Spinner'
import { getPlatformUrl, getTenantFromLocation } from '@/lib/tenant'

const TenantLandingPage = lazy(() => import('@/features/tenant-landing/pages/TenantLandingPage'))
const Landing = lazy(() => import('@/features/landing/pages/LandingPage'))

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size={32} />
      </div>
    }
  >
    {children}
  </Suspense>
)

function UnknownTenant() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#07142f] px-6 text-center text-[#f4f8ff]">
      <img src="/branding/multigym-isotipo-transparent.png" alt="MultiGym" className="mb-6 h-20 w-20 object-contain" />
      <div className="mb-5 rounded-full border border-[#22ad55]/30 bg-[#22ad55]/10 px-3 py-1 text-xs font-bold tracking-[0.18em] text-[#22ad55] uppercase">
        Subdominio inválido
      </div>
      <h1 className="mb-2 text-3xl font-black">Gimnasio no encontrado</h1>
      <p className="mb-8 max-w-md text-[#b7c7df]">
        El subdominio que intentas visitar no corresponde a un gimnasio registrado en MultiGym.
      </p>
      <a href={getPlatformUrl()} className="rounded-xl bg-[#1769e8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1256c7]">
        Ir a MultiGym
      </a>
    </div>
  )
}

export function TenantRouter() {
  const { isTenantContext } = useTenantBranding()
  const tenantId = getTenantFromLocation()
  const [tenantState, setTenantState] = useState<'loading' | 'valid' | 'invalid'>('loading')

  useEffect(() => {
    if (!isTenantContext || !tenantId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTenantState('valid')
      return
    }

    let cancelled = false
    fetch(`/api/public/tenants/${encodeURIComponent(tenantId)}`)
      .then((response) => {
        if (!cancelled) setTenantState(response.ok ? 'valid' : 'invalid')
      })
      .catch(() => {
        if (!cancelled) setTenantState('invalid')
      })

    return () => {
      cancelled = true
    }
  }, [isTenantContext, tenantId])

  // No tenant subdomain — show main MultiGym SaaS landing
  if (!isTenantContext) {
    return (
      <SuspenseWrapper>
        <Landing />
      </SuspenseWrapper>
    )
  }

  if (tenantState === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size={32} />
      </div>
    )
  }

  if (tenantState === 'invalid') {
    return <UnknownTenant />
  }

  // Tenant subdomain — always show tenant landing (auth-aware)
  return (
    <SuspenseWrapper>
      <TenantLandingPage />
    </SuspenseWrapper>
  )
}
