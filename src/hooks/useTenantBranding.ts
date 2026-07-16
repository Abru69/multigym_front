import { useEffect, useLayoutEffect, useMemo } from 'react'
import { getTenantFromSubdomain } from '@/lib/tenant'
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
  const tenantId = useMemo(() => getTenantFromSubdomain(), [])
  const baseBranding = useMemo(() => resolveBranding(tenantId), [tenantId])
  const isTenantContext = tenantId !== null

  const { colors: apiColors, loaded, loadSettings } = useTenantSettingsStore()

  // Fetch tenant settings from backend on mount (only in tenant context)
  useEffect(() => {
    if (isTenantContext && !loaded) {
      loadSettings()
    }
  }, [isTenantContext, loaded, loadSettings])

  // Merge: API colors override hardcoded when valid
  const branding: TenantBranding = useMemo(() => {
    if (!loaded || !isTenantContext) return baseBranding

    const hasBrandColor = isValidColor(apiColors.brandColor)
    const hasAccentColor = isValidColor(apiColors.accentColor)

    if (!hasBrandColor && !hasAccentColor) return baseBranding

    // brand_color becomes the primary accent
    const primary = hasBrandColor ? apiColors.brandColor! : baseBranding.colors.accent
    const palette = deriveColorPalette(primary)

    // accent_color becomes the detail/secondary accent
    const detail = hasAccentColor ? apiColors.accentColor! : baseBranding.colors.detail

    return {
      ...baseBranding,
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
    root.style.setProperty('--color-accent', colors.accent)
    root.style.setProperty('--color-accent-hover', colors.accentHover)
    root.style.setProperty('--color-accent-light', colors.accentLight)
    root.style.setProperty('--color-accent-muted', colors.accentMuted)
    root.style.setProperty('--color-detail', colors.detail)

    // :root fallback variables
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-hover', colors.accentHover)
    root.style.setProperty('--accent-light', colors.accentLight)
    root.style.setProperty('--accent-muted', colors.accentMuted)
    root.style.setProperty('--detail', colors.detail)

    // accent-text: derivado de la luminancia del acento (consistente en ambos temas)
    root.style.setProperty('--accent-text', colors.accentText)
    root.style.setProperty('--color-accent-text', colors.accentText)

    // Update glow shadow
    root.style.setProperty('--shadow-glow', `0 0 20px ${colors.accentMuted}`)
  }, [branding])

  return { branding, tenantId, isTenantContext }
}
