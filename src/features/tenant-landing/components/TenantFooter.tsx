import { Zap } from 'lucide-react'
import { useTenantBranding } from '@/hooks/useTenantBranding'

export function TenantFooter() {
  const { branding } = useTenantBranding()

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--detail)] text-[var(--text-on-primary)]">
              <Zap size={20} />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">{branding.name}</span>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            {branding.address && (
              <span className="text-sm text-[var(--text-muted)]">{branding.address}</span>
            )}
            {branding.phone && (
              <span className="text-sm text-[var(--text-muted)]">{branding.phone}</span>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row">
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} {branding.name}. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <span className="text-sm text-[var(--text-muted)]">Instagram</span>
            <span className="text-sm text-[var(--text-muted)]">Facebook</span>
            <span className="text-sm text-[var(--text-muted)]">WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
