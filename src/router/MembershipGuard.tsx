import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getSubscriptionsByMember } from '@/lib/api'

export function MembershipGuard({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    getSubscriptionsByMember(user?.memberId || user?.id || '')
      .then((response) => {
        const subscriptions = response.lista ?? response.dto ?? []
        if (mounted) setAllowed(subscriptions.some((subscription) => subscription.status === 'ACTIVE'))
      })
      .catch(() => { if (mounted) setAllowed(false) })
    return () => { mounted = false }
  }, [user?.id, user?.memberId])

  if (allowed === null) return <div className="p-8 text-center text-sm text-[var(--text-muted)]">Validando membresía...</div>
  return allowed ? <>{children}</> : <Navigate to="/app/perfil" replace />
}
