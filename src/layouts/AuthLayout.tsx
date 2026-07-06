import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTenantBranding } from '@/hooks/useTenantBranding'

export function AuthLayout() {
  const { branding } = useTenantBranding()

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-[var(--accent)]/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-[var(--detail)]/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 text-lg font-black text-[var(--accent)] shadow-[0_0_16px_rgba(66,204,99,0.15)]">
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
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--depth-3)] backdrop-blur-2xl sm:p-8">
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}
