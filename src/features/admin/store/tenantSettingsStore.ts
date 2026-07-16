import { create } from 'zustand'
import { fetchApi } from '@/lib/api'
import type { TenantSettingDTO, ResponseDTO } from '@/types'

interface TenantColors {
  brandColor: string | null
  accentColor: string | null
  faviconUrl: string | null
  bannerUrl: string | null
}

interface TenantSettingsStore {
  colors: TenantColors
  allSettings: TenantSettingDTO[]
  isLoading: boolean
  loaded: boolean
  loadSettings: () => Promise<void>
}

function parseColors(settings: TenantSettingDTO[]): TenantColors {
  const map = new Map(settings.map((s) => [s.key, s.value]))
  return {
    brandColor: map.get('brand_color') || null,
    accentColor: map.get('accent_color') || null,
    faviconUrl: map.get('favicon_url') || null,
    bannerUrl: map.get('banner_url') || null,
  }
}

function isValidColor(c: string | null): boolean {
  if (!c) return false
  return /^#[0-9a-fA-F]{6}$/.test(c) || /^#[0-9a-fA-F]{3}$/.test(c)
}

export const useTenantSettingsStore = create<TenantSettingsStore>()((set) => ({
  colors: {
    brandColor: null,
    accentColor: null,
    faviconUrl: null,
    bannerUrl: null,
  },
  allSettings: [],
  isLoading: false,
  loaded: false,

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
      })
    } catch {
      // Silently fail — will use hardcoded fallback
      set({ isLoading: false, loaded: true })
    }
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
