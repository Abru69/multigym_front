import { useTenantBranding } from '@/hooks/useTenantBranding'

interface TenantLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-lg',
}

export function TenantLogo({ size = 'md', className = '' }: TenantLogoProps) {
  const { branding } = useTenantBranding()
  const sizeClass = sizeClasses[size]

  if (branding.logoUrl) {
    return (
      <div className={`flex ${sizeClass} items-center justify-center overflow-hidden rounded-xl bg-[var(--card)] ${className}`}>
        <img
          src={branding.logoUrl}
          alt={branding.name}
          className="h-full w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className={`flex ${sizeClass} items-center justify-center rounded-xl bg-[var(--accent)] font-black text-[var(--accent-text)] ${className}`}>
      {branding.logoAbbr}
    </div>
  )
}
