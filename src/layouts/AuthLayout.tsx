import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function AuthLayout() {
  const { branding } = useTenantBranding()

  return (
    <div
      className="relative flex min-h-screen items-center justify-center p-4"
      style={{
        background: `
          radial-gradient(ellipse at 20% 50%, var(--accent-muted) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, var(--accent-muted) 0%, transparent 50%),
          var(--bg-primary)
        `,
      }}
    >
      {/* Theme toggle in corner */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {branding.logoAbbr}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {branding.name}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {branding.tagline}
            </p>
          </div>
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}
