import { useState, useEffect } from 'react'
import { fetchApi, uploadTenantLogo } from '@/lib/api'
import {
  useTenantSettingsStore,
  deriveColorPalette,
  isValidColor,
} from '@/features/admin/store/tenantSettingsStore'
import { getTenantFromLocation } from '@/lib/tenant'
import { Image, Palette, Save, Loader2, CheckCircle2, Upload } from 'lucide-react'
import type { TenantSettingDTO, ResponseDTO } from '@/types'
import { useToastStore } from '@/components/ui/Toast'

export default function BrandingSettings() {
  const addToast = useToastStore((s) => s.addToast)
  const { colors, setBrandingColors, setLogoUrl } = useTenantSettingsStore()
  const [brandColor, setBrandColor] = useState('#1976D2')
  const [accentColor, setAccentColor] = useState('#FFC107')
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchApi<ResponseDTO<TenantSettingDTO[]>>('/api/tenant-settings')
        const settings = res.lista || (Array.isArray(res.dto) ? res.dto : [])
        const map = new Map(settings.map((s) => [s.key, s.value]))
        if (map.get('brand_color')) setBrandColor(map.get('brand_color')!)
        if (map.get('accent_color')) setAccentColor(map.get('accent_color')!)
      } catch {
        // use defaults
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleLogoUpload = async (file?: File) => {
    if (!file) return
    try {
      setUploadingLogo(true)
      const res = await uploadTenantLogo(file)
      const nextLogoUrl = res.dto?.logoUrl
      if (!nextLogoUrl) throw new Error('Logo URL missing')
      setUploadedLogoUrl(nextLogoUrl)
      setLogoUrl(nextLogoUrl, getTenantFromLocation())
      addToast('Logo actualizado', 'success')
    } catch {
      addToast('Error al subir logo', 'error')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaved(false)
      await fetchApi('/api/tenant-settings', {
        method: 'PUT',
        body: JSON.stringify({
          entries: {
            brand_color: brandColor,
            accent_color: accentColor,
          },
        }),
      })
      setBrandingColors(brandColor, accentColor, getTenantFromLocation())
      setSaved(true)
      addToast('Colores de marca actualizados', 'success')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      addToast('Error al guardar colores', 'error')
    } finally {
      setSaving(false)
    }
  }

  const brandPalette = isValidColor(brandColor) ? deriveColorPalette(brandColor) : null
  const accentPalette = isValidColor(accentColor) ? deriveColorPalette(accentColor) : null
  const logoUrl = uploadedLogoUrl || colors.logoUrl || ''

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-xs text-[var(--text-muted)]">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-black text-[var(--text-primary)]">
          Colores de Marca
        </h1>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Configura los colores principales de tu gimnasio. Se aplican en toda la plataforma.
        </p>
      </div>

      <div className="space-y-4">
        {/* Logo */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo del gimnasio"
                  className="h-full w-full object-contain"
                />
              ) : (
                <Image size={22} className="text-[var(--accent)]" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">Logo del Gimnasio</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Se muestra en el home, login, panel admin y portal cliente.
              </p>
            </div>
          </div>

          <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--surface-hover)]">
            {uploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploadingLogo ? 'Subiendo logo...' : 'Subir Logo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingLogo}
              onChange={(e) => {
                void handleLogoUpload(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </label>
        </div>

        {/* Brand Color */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              <Palette size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">Color Primario</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Color principal de la marca (botones, acentos, headers)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="h-12 w-12 cursor-pointer rounded-xl border-0 p-0"
            />
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="flex h-11 flex-1 rounded-xl px-4 py-2 font-mono text-sm transition-all duration-200 hover:border-[var(--border)] focus:ring-2 focus:outline-none"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--text-primary)',
              }}
              placeholder="#1976D2"
            />
          </div>

          {/* Preview */}
          {brandPalette && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                Preview:
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: brandColor }}
                  title="Principal"
                />
                <div
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: brandPalette.hover }}
                  title="Hover"
                />
                <div
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: brandPalette.light }}
                  title="Light"
                />
                <div
                  className="h-6 w-6 rounded-md border border-[var(--border)]"
                  style={{ backgroundColor: brandPalette.muted }}
                  title="Muted"
                />
                <div
                  className="flex h-6 items-center rounded-md px-2 text-[10px] font-bold"
                  style={{ backgroundColor: brandColor, color: brandPalette.text }}
                >
                  Aa
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accent Color */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              <Palette size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">Color Secundario</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Color de acento complementario (detalles, badges, highlights)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-12 w-12 cursor-pointer rounded-xl border-0 p-0"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="flex h-11 flex-1 rounded-xl px-4 py-2 font-mono text-sm transition-all duration-200 hover:border-[var(--border)] focus:ring-2 focus:outline-none"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--text-primary)',
              }}
              placeholder="#FFC107"
            />
          </div>

          {accentPalette && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                Preview:
              </span>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: accentColor }}
                  title="Principal"
                />
                <div
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: accentPalette.hover }}
                  title="Hover"
                />
                <div
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: accentPalette.light }}
                  title="Light"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <p className="mb-3 text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
            Vista Previa
          </p>
          <div className="space-y-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all"
              style={{ backgroundColor: brandColor, color: brandPalette?.text || '#fff' }}
            >
              Botón Principal
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 text-sm font-bold transition-all"
              style={{ borderColor: brandColor, color: brandColor }}
            >
              Botón Secundario
            </button>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                Badge Secundario
              </span>
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
              >
                Badge Primario
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-sm font-bold tracking-wide text-[var(--accent-text)] uppercase shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar Colores'}
        </button>
      </div>
    </div>
  )
}
