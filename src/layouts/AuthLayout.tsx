import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTenantBranding } from '@/hooks/useTenantBranding'

export function AuthLayout() {
  const { branding } = useTenantBranding()

  return (
    <div className="mesh-bg relative flex min-h-screen items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[var(--accent)]/10 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-[var(--detail)]/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 text-lg font-black text-[var(--accent)] shadow-[0_0_20px_rgba(66,204,99,0.2)]">
            {branding.logoAbbr}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
              {branding.name}
            </h1>
            <p className="text-xs font-medium text-[var(--text-muted)]">{branding.tagline}</p>
          </div>
        </Link>

        {/* Glass Card */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[var(--card)]/90 to-[var(--surface)]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
