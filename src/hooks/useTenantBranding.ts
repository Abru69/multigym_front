import { useEffect, useMemo } from 'react'
import { getTenantFromSubdomain } from '@/lib/tenant'
import { resolveBranding, type TenantBranding } from '@/lib/tenantConfig'

/**
 * React hook that resolves the current tenant's branding from the subdomain
 * and applies the color overrides as CSS custom properties on :root.
 *
 * Usage:
 *   const { branding, tenantId, isTenantContext } = useTenantBranding()
 */
export function useTenantBranding() {
  const tenantId = useMemo(() => getTenantFromSubdomain(), [])
  const branding = useMemo(() => resolveBranding(tenantId), [tenantId])
  const isTenantContext = tenantId !== null

  // Apply color overrides to CSS custom properties
  useEffect(() => {
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

    // accent-text: dark in light mode, accentText in dark mode
    const applyAccentText = () => {
      const isDark = root.getAttribute('data-theme') !== 'light'
      root.style.setProperty('--accent-text', isDark ? colors.accentText : '#1c1917')
      root.style.setProperty('--color-accent-text', isDark ? colors.accentText : '#1c1917')
    }
    applyAccentText()

    // Watch for theme changes
    const observer = new MutationObserver(applyAccentText)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    // Update glow shadow
    root.style.setProperty('--shadow-glow', `0 0 20px ${colors.accentMuted}`)

    // Update page title
    document.title = `${branding.name} | ${branding.tagline}`

    return () => {
      observer.disconnect()
      // Cleanup: remove inline styles when unmounting (optional)
      const props = [
        '--color-accent',
        '--color-accent-hover',
        '--color-accent-light',
        '--color-accent-muted',
        '--color-accent-text',
        '--color-detail',
        '--accent',
        '--accent-hover',
        '--accent-light',
        '--accent-muted',
        '--accent-text',
        '--detail',
        '--shadow-glow',
      ]
      props.forEach((p) => root.style.removeProperty(p))
    }
  }, [branding])

  return { branding, tenantId, isTenantContext }
}
