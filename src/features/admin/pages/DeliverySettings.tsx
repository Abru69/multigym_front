import { useState, useEffect } from 'react'
import { fetchApi } from '@/lib/api'
import type { TenantSettingDTO, ResponseDTO } from '@/types'
import { useToastStore } from '@/components/ui/Toast'
import { Store, Truck, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function DeliverySettings() {
  const [, setSettings] = useState<TenantSettingDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const [pickupEnabled, setPickupEnabled] = useState(true)
  const [shippingEnabled, setShippingEnabled] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const res = await fetchApi<ResponseDTO<TenantSettingDTO[]>>('/api/tenant-settings')
        const list = res.lista || (Array.isArray(res.dto) ? res.dto : [])
        setSettings(list)

        const pickup = list.find((s) => s.key === 'delivery_pickup_enabled')
        const shipping = list.find((s) => s.key === 'delivery_shipping_enabled')

        setPickupEnabled(pickup ? pickup.value === 'true' : true)
        setShippingEnabled(shipping ? shipping.value === 'true' : true)
      } catch (err) {
        console.error('Failed to load settings:', err)
        addToast('Error al cargar configuración', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaved(false)
      await fetchApi('/api/tenant-settings', {
        method: 'PUT',
        body: JSON.stringify({
          entries: {
            delivery_pickup_enabled: String(pickupEnabled),
            delivery_shipping_enabled: String(shippingEnabled),
          },
        }),
      })
      setSaved(true)
      addToast('Configuración guardada', 'success')
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      addToast('Error al guardar configuración', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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
          Métodos de Entrega
        </h1>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Configura los métodos de entrega disponibles para tus clientes
        </p>
      </div>

      <div className="space-y-4">
        {/* Pickup Toggle */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  pickupEnabled
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                }`}
              >
                <Store size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Recogida en Sucursal</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Los clientes eligen una sucursal y recogen su pedido
                </p>
              </div>
            </div>
            <button
              onClick={() => setPickupEnabled(!pickupEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                pickupEnabled ? 'bg-[var(--success)]' : 'bg-[var(--surface-hover)]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  pickupEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {pickupEnabled && (
            <div className="mt-3 ml-16 rounded-xl bg-[var(--surface)] px-3 py-2">
              <p className="text-[11px] text-[var(--text-secondary)]">
                El cliente verá las sucursales disponibles en el checkout y podrá elegir la más
                cercana.
              </p>
            </div>
          )}
        </div>

        {/* Shipping Toggle */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  shippingEnabled
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                }`}
              >
                <Truck size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Envío a Domicilio</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  El pedido se envía a la dirección del cliente
                </p>
              </div>
            </div>
            <button
              onClick={() => setShippingEnabled(!shippingEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                shippingEnabled ? 'bg-[var(--success)]' : 'bg-[var(--surface-hover)]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  shippingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {shippingEnabled && (
            <div className="mt-3 ml-16 rounded-xl bg-[var(--surface)] px-3 py-2">
              <p className="text-[11px] text-[var(--text-secondary)]">
                El cliente ingresará su dirección durante el checkout. Envío gratis para compras
                mayores a $1,500.
              </p>
            </div>
          )}
        </div>

        {/* Warning */}
        {!pickupEnabled && !shippingEnabled && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Sin métodos de entrega</p>
              <p className="text-xs text-amber-600">
                Debes tener al menos un método de entrega habilitado para que los clientes puedan
                realizar compras.
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || (!pickupEnabled && !shippingEnabled)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-sm font-bold tracking-wide text-[var(--accent-text)] uppercase shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  )
}
