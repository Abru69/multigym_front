import { Outlet } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { useTenantBranding } from '@/hooks/useTenantBranding'
import { TenantLogo } from '@/components/tenant/TenantLogo'

export function AuthLayout() {
  const { branding, isTenantContext } = useTenantBranding()
  const platformBrandStyle = !isTenantContext
    ? ({
        '--accent': '#1769e8',
        '--accent-hover': '#1256c7',
        '--accent-light': '#6ea4ff',
        '--accent-muted': 'rgba(23, 105, 232, 0.14)',
        '--accent-text': '#ffffff',
        '--detail': '#22ad55',
        '--bg-primary': '#07142f',
        '--bg-secondary': '#0b1c3e',
        '--surface': '#0d2146',
        '--card': '#0a1937',
        '--header-bg': '#07142f',
        '--text-primary': '#f4f8ff',
        '--text-secondary': '#b7c7df',
        '--text-muted': '#7f96b8',
        '--border': '#19345d',
      } as CSSProperties)
    : undefined

  return (
    <div style={platformBrandStyle} className="flex min-h-dvh">
      {/* Left Side - Image (hidden on mobile, visible lg+) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&h=1200&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            {branding.name || 'MULTIGYM'}
          </h1>
          <p className="text-lg text-white/70">{branding.tagline || 'La plataforma para tu gimnasio'}</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[var(--card)] p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
            {isTenantContext ? (
              <TenantLogo size="lg" />
            ) : (
              <img
                src="/branding/multigym-isotipo-transparent.png"
                alt="MultiGym"
                className="h-16 w-16 rounded-2xl object-contain"
              />
            )}
            <span className="text-xl font-black tracking-tight text-[var(--text-primary)]">
              {branding.name || 'MULTIGYM'}
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
