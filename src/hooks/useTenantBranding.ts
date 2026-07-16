import { useEffect, useLayoutEffect, useMemo } from 'react'
import { getTenantFromLocation } from '@/lib/tenant'
import { resolveBranding, type TenantBranding } from '@/lib/tenantConfig'
import { useTenantSettingsStore, deriveColorPalette, isValidColor } from '@/features/admin/store/tenantSettingsStore'

/**
 * React hook that resolves the current tenant's branding.
 *
 * Resolution order for colors:
 *   1. Backend TenantSettings (brand_color, accent_color) via API
 *   2. Hardcoded TENANT_CONFIGS[tenantId] in tenantConfig.ts
 *   3. DEFAULT_BRANDING
 *
 * Usage:
 *   const { branding, tenantId, isTenantContext } = useTenantBranding()
 */
export function useTenantBranding() {
  const tenantId = useMemo(() => getTenantFromLocation(), [])
  const baseBranding = useMemo(() => resolveBranding(tenantId), [tenantId])
  const isTenantContext = tenantId !== null

  const { colors: apiColors, loaded, loadedTenantId, loadPublicBranding } = useTenantSettingsStore()

  // Fetch tenant settings from backend on mount (only in tenant context)
  useEffect(() => {
    if (isTenantContext && (!loaded || loadedTenantId !== tenantId)) {
      loadPublicBranding(tenantId)
    }
  }, [isTenantContext, loaded, loadedTenantId, loadPublicBranding, tenantId])

  // Merge: API colors override hardcoded when valid
  const branding: TenantBranding = useMemo(() => {
    if (!loaded || !isTenantContext) return baseBranding

    const hasBrandColor = isValidColor(apiColors.brandColor)
    const hasAccentColor = isValidColor(apiColors.accentColor)

    if (!hasBrandColor && !hasAccentColor) {
      return {
        ...baseBranding,
        logoUrl: apiColors.logoUrl || baseBranding.logoUrl,
        heroImage: apiColors.bannerUrl || baseBranding.heroImage,
      }
    }

    // brand_color becomes the primary accent
    const primary = hasBrandColor ? apiColors.brandColor! : baseBranding.colors.accent
    const palette = deriveColorPalette(primary)

    // accent_color becomes the detail/secondary accent
    const detail = hasAccentColor ? apiColors.accentColor! : baseBranding.colors.detail

    return {
      ...baseBranding,
      logoUrl: apiColors.logoUrl || baseBranding.logoUrl,
      heroImage: apiColors.bannerUrl || baseBranding.heroImage,
      colors: {
        accent: primary,
        accentHover: palette.hover,
        accentLight: palette.light,
        accentMuted: palette.muted,
        accentText: palette.text,
        detail,
      },
    }
  }, [baseBranding, apiColors, loaded, isTenantContext])

  // Apply color overrides to CSS custom properties (before paint)
  useLayoutEffect(() => {
    const root = document.documentElement
    const { colors } = branding

    // Tailwind @theme variables
    root.style.setProperty('--color-primary', colors.accent)
    root.style.setProperty('--color-primary-hover', colors.accentHover)
    root.style.setProperty('--color-primary-light', colors.accentLight)
    root.style.setProperty('--color-accent', colors.accent)
    root.style.setProperty('--color-accent-hover', colors.accentHover)
    root.style.setProperty('--color-accent-light', colors.accentLight)
    root.style.setProperty('--color-accent-muted', colors.accentMuted)
    root.style.setProperty('--color-detail', colors.detail)

    // :root fallback variables
    root.style.setProperty('--primary', colors.accent)
    root.style.setProperty('--primary-hover', colors.accentHover)
    root.style.setProperty('--primary-light', colors.accentLight)
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-hover', colors.accentHover)
    root.style.setProperty('--accent-light', colors.accentLight)
    root.style.setProperty('--accent-muted', colors.accentMuted)
    root.style.setProperty('--detail', colors.detail)

    // accent-text: derivado de la luminancia del acento (consistente en ambos temas)
    root.style.setProperty('--accent-text', colors.accentText)
    root.style.setProperty('--color-accent-text', colors.accentText)
    root.style.setProperty('--text-on-primary', colors.accentText)

    root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`)
    root.style.setProperty('--gradient-accent-subtle', `linear-gradient(135deg, ${colors.accentMuted} 0%, var(--surface) 100%)`)
    root.style.setProperty('--sidebar-active', colors.accentMuted)
    root.style.setProperty('--sidebar-active-text', colors.accent)

    // Update glow shadow
    root.style.setProperty('--shadow-glow', `0 0 20px ${colors.accentMuted}`)
  }, [branding])

  useEffect(() => {
    if (!apiColors.faviconUrl) return
    const selector = 'link[rel="icon"]'
    let link = document.querySelector<HTMLLinkElement>(selector)
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = apiColors.faviconUrl
  }, [apiColors.faviconUrl])

  return { branding, tenantId, isTenantContext }
}
