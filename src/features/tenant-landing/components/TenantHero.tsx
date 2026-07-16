import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getAllowedPages } from '@/lib/permissions'

export function TenantHero() {
  const { branding, tenantId } = useTenantBranding()
  const { isAuthenticated, user } = useAuthStore()
  const { hero, stats, heroVideo } = branding

  const hasAdminAccess = getAllowedPages(user?.role).length > 0

  const primaryCta = isAuthenticated
    ? hasAdminAccess
      ? hero.ctaAuthenticatedAdmin
      : hero.ctaAuthenticatedClient
    : hero.ctaText

  const primaryLink = isAuthenticated
    ? hasAdminAccess
      ? '/admin'
      : '/app/rutinas'
    : `/login?tenant=${tenantId}`

  return (
    <section className="relative overflow-hidden bg-[var(--bg-primary)] py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--detail)]/5" />

      {heroVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-15"
          poster={branding.heroImage}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : branding.heroImage ? (
        <img
          src={branding.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
      ) : null}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-4 py-1.5 text-sm font-medium text-[var(--accent)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
              {hero.badge}
            </div>

            <h1 className="mb-6 text-4xl leading-tight font-bold text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
              {hero.title} <span className="text-[var(--accent)]">{hero.titleAccent}</span>
            </h1>

            <p className="mb-8 max-w-lg text-lg text-[var(--text-secondary)]">{hero.subtitle}</p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to={primaryLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-base font-semibold text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
              >
                {primaryCta}
                <ArrowRight size={18} />
              </Link>
              {!isAuthenticated && (
                <Link
                  to={`/registro?tenant=${tenantId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 py-4 text-base font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <Play size={18} />
                  {hero.secondaryCta}
                </Link>
              )}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-[var(--border)] pt-8">
              {stats.map(([value, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-[var(--accent)]">{value}</div>
                  <div className="text-sm text-[var(--text-muted)]">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
              <div className="flex h-80 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--detail)]/10">
                {branding.heroImage && (
                  <img
                    src={branding.heroImage}
                    alt={branding.name}
                    className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] rounded-xl object-cover opacity-40"
                  />
                )}
                <div className="relative text-center">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt={branding.name}
                      className="mx-auto mb-4 h-20 w-20 rounded-2xl object-contain"
                    />
                  ) : (
                    <div className="mb-2 text-6xl">💪</div>
                  )}
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    {branding.name}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">{branding.tagline}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
