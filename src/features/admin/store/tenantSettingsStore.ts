import { create } from 'zustand'
import { fetchApi } from '@/lib/api'
import type { TenantSettingDTO, ResponseDTO } from '@/types'

interface TenantColors {
  brandColor: string | null
  accentColor: string | null
  logoUrl: string | null
  faviconUrl: string | null
  bannerUrl: string | null
}

const EMPTY_COLORS: TenantColors = {
  brandColor: null,
  accentColor: null,
  logoUrl: null,
  faviconUrl: null,
  bannerUrl: null,
}

function getBrandingCacheKey(tenantId?: string | null) {
  return tenantId ? `tenant-branding:${tenantId}` : null
}

function readCachedColors(tenantId?: string | null): TenantColors | null {
  const key = getBrandingCacheKey(tenantId)
  if (!key) return null
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    const parsed = JSON.parse(cached) as Partial<TenantColors>
    return {
      brandColor: parsed.brandColor || null,
      accentColor: parsed.accentColor || null,
      logoUrl: parsed.logoUrl || null,
      faviconUrl: parsed.faviconUrl || null,
      bannerUrl: parsed.bannerUrl || null,
    }
  } catch {
    return null
  }
}

function writeCachedColors(tenantId: string | null | undefined, colors: TenantColors) {
  const key = getBrandingCacheKey(tenantId)
  if (!key) return
  localStorage.setItem(key, JSON.stringify(colors))
}

interface TenantSettingsStore {
  colors: TenantColors
  allSettings: TenantSettingDTO[]
  isLoading: boolean
  loaded: boolean
  loadedTenantId: string | null
  loadSettings: () => Promise<void>
  loadPublicBranding: (tenantId?: string | null) => Promise<void>
  setBrandingColors: (brandColor: string, accentColor: string, tenantId?: string | null) => void
  setLogoUrl: (logoUrl: string, tenantId?: string | null) => void
}

function parseColors(settings: TenantSettingDTO[]): TenantColors {
  const map = new Map(settings.map((s) => [s.key, s.value]))
  return {
    brandColor: map.get('brand_color') || null,
    accentColor: map.get('accent_color') || null,
    logoUrl: map.get('logo_url') || null,
    faviconUrl: map.get('favicon_url') || null,
    bannerUrl: map.get('banner_url') || null,
  }
}

function isValidColor(c: string | null): boolean {
  if (!c) return false
  return /^#[0-9a-fA-F]{6}$/.test(c) || /^#[0-9a-fA-F]{3}$/.test(c)
}

export const useTenantSettingsStore = create<TenantSettingsStore>()((set, get) => ({
  colors: EMPTY_COLORS,
  allSettings: [],
  isLoading: false,
  loaded: false,
  loadedTenantId: null,

  loadSettings: async () => {
    // Skip if not authenticated (login page causes infinite redirect on 401)
    const hasToken = (() => {
      try {
        const data = localStorage.getItem('auth-storage')
        if (!data) return false
        const parsed = JSON.parse(data)
        return !!parsed?.state?.token && parsed.state.token !== 'fake-token'
      } catch {
        return false
      }
    })()
    if (!hasToken) {
      set({ loaded: true })
      return
    }

    const hostname = window.location.hostname
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    if (isLocalhost) {
      set({ loaded: true })
      return
    }

    try {
      set({ isLoading: true })
      const res = await fetchApi<ResponseDTO<TenantSettingDTO[]>>('/api/tenant-settings', {
        skipAuthRedirect: true,
      })
      const settings = res.lista || []
      set({
        allSettings: settings,
        colors: parseColors(settings),
        isLoading: false,
        loaded: true,
        loadedTenantId: null,
      })
    } catch {
      // Silently fail — will use hardcoded fallback
      set({ isLoading: false, loaded: true })
    }
  },

  loadPublicBranding: async (tenantId?: string | null) => {
    const cachedColors = readCachedColors(tenantId)
    if (cachedColors) {
      set({ colors: cachedColors, isLoading: true, loaded: true, loadedTenantId: tenantId || null })
    }

    try {
      set({ isLoading: true })
      const headers = new Headers()
      if (tenantId) headers.set('X-Tenant-ID', tenantId)
      const res = await fetchApi<ResponseDTO<TenantSettingDTO[]>>(`/api/public/tenant-branding?t=${Date.now()}`, {
        cache: 'no-store',
        headers,
        skipAuthRedirect: true,
        skipAuthHeader: true,
      })
      const settings = res.lista || []
      if (settings.length === 0 && cachedColors) {
        set({ isLoading: false, loaded: true, loadedTenantId: tenantId || null })
        return
      }
      const colors = parseColors(settings)
      writeCachedColors(tenantId, colors)
      set({
        allSettings: settings,
        colors,
        isLoading: false,
        loaded: true,
        loadedTenantId: tenantId || null,
      })
    } catch {
      set({ isLoading: false, loaded: true, loadedTenantId: tenantId || null })
    }
  },

  setBrandingColors: (brandColor: string, accentColor: string, tenantId?: string | null) => {
    const { colors, allSettings } = get()
    const upsertSetting = (settings: TenantSettingDTO[], key: string, value: string) => {
      const next = settings.filter((setting) => setting.key !== key)
      next.push({ key, value, type: 'string', description: key })
      return next
    }

    const nextColors = {
      ...colors,
      brandColor,
      accentColor,
    }
    writeCachedColors(tenantId, nextColors)

    set({
      colors: nextColors,
      allSettings: upsertSetting(upsertSetting(allSettings, 'brand_color', brandColor), 'accent_color', accentColor),
      isLoading: false,
      loaded: true,
      loadedTenantId: tenantId || null,
    })
  },

  setLogoUrl: (logoUrl: string, tenantId?: string | null) => {
    const { colors, allSettings } = get()
    const nextColors = { ...colors, logoUrl }
    writeCachedColors(tenantId, nextColors)

    set({
      colors: nextColors,
      allSettings: [
        ...allSettings.filter((setting) => setting.key !== 'logo_url'),
        { key: 'logo_url', value: logoUrl, type: 'string', description: 'Tenant logo URL' },
      ],
      isLoading: false,
      loaded: true,
      loadedTenantId: tenantId || null,
    })
  },
}))

/**
 * Derive a full accent color palette from a single hex color.
 * Generates hover, light, muted, and text variants.
 */
export function deriveColorPalette(hex: string) {
  // Normalizar hex corto (#abc) a 6 dígitos (#aabbcc)
  let normalized = hex.trim()
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    normalized =
      '#' +
      normalized
        .slice(1)
        .split('')
        .map((ch) => ch + ch)
        .join('')
  }

  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)

  // Darker version for hover (80% brightness)
  const hover = `#${Math.round(r * 0.85).toString(16).padStart(2, '0')}${Math.round(g * 0.85).toString(16).padStart(2, '0')}${Math.round(b * 0.85).toString(16).padStart(2, '0')}`

  // Light version (blend 80% toward white)
  const light = `#${Math.round(r + (255 - r) * 0.8).toString(16).padStart(2, '0')}${Math.round(g + (255 - g) * 0.8).toString(16).padStart(2, '0')}${Math.round(b + (255 - b) * 0.8).toString(16).padStart(2, '0')}`

  // Muted version (blend 85% toward dark bg)
  const muted = `#${Math.round(r * 0.15).toString(16).padStart(2, '0')}${Math.round(g * 0.15).toString(16).padStart(2, '0')}${Math.round(b * 0.15).toString(16).padStart(2, '0')}`

  // Luminance to decide text color
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const text = luminance > 0.5 ? '#1c1917' : '#ffffff'

  return { hover, light, muted, text }
}

export { isValidColor }
