import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTenantBranding } from '@/hooks/useTenantBranding'

export function TenantBanner() {
  const { branding } = useTenantBranding()
  const banners = branding.banners

  if (!banners || banners.length === 0) return null

  const banner = banners[0]

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative overflow-hidden rounded-2xl"
        style={{
          border: '1px solid var(--border)',
          background: `linear-gradient(135deg, var(--card) 0%, var(--surface) 100%)`,
        }}
      >
        <div className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:p-10">
          {/* Text content */}
          <div className="flex-1 text-center sm:text-left">
            <h3
              className="mb-2 text-2xl font-black tracking-tight sm:text-3xl"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {banner.title}
            </h3>
            <p
              className="mb-5 text-sm leading-relaxed sm:text-base"
              style={{ color: 'var(--text-secondary)' }}
            >
              {banner.subtitle}
            </p>
            {banner.link && banner.buttonText && (
              <a
                href={banner.link}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-text)',
                }}
              >
                {banner.buttonText}
                <ArrowRight size={16} />
              </a>
            )}
          </div>

          {/* Image */}
          {banner.image && (
            <div className="relative h-48 w-full overflow-hidden rounded-xl sm:h-56 sm:w-72">
              <img
                src={banner.image}
                alt={banner.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, var(--card) 0%, transparent 30%)',
                }}
              />
            </div>
          )}
        </div>

        {/* Decorative accent line */}
        <div
          className="absolute bottom-0 left-0 h-1 w-full"
          style={{
            background: 'linear-gradient(to right, var(--accent), transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
