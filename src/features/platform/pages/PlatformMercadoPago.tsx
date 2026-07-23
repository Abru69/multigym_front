import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle, Save, Shield, WalletCards } from 'lucide-react'
import { getPlatformMercadoPagoConfig, savePlatformMercadoPagoConfig } from '@/lib/api'
import type { PlatformMercadoPagoConfigDTO, PlatformMercadoPagoConfigRequest } from '@/types'
import { useToastStore } from '@/components/ui/Toast'

type FormState = {
  enabled: boolean
  publicKey: string
  accessToken: string
  webhookSecret: string
  notificationUrl: string
  siteId: string
  currency: string
  processingMode: string
  oauthClientId: string
  oauthClientSecret: string
  oauthRedirectUrl: string
}

const emptyForm: FormState = {
  enabled: false,
  publicKey: '',
  accessToken: '',
  webhookSecret: '',
  notificationUrl: '',
  siteId: 'MLM',
  currency: 'MXN',
  processingMode: 'automatic',
  oauthClientId: '',
  oauthClientSecret: '',
  oauthRedirectUrl: '',
}

export default function PlatformMercadoPago() {
  const addToast = useToastStore((state) => state.addToast)
  const [config, setConfig] = useState<PlatformMercadoPagoConfigDTO | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadConfig()
  }, [])

  const loadConfig = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await getPlatformMercadoPagoConfig()
      const next = res.dto || null
      setConfig(next)
      setForm({
        enabled: next?.enabled ?? false,
        publicKey: next?.publicKey || '',
        accessToken: '',
        webhookSecret: '',
        notificationUrl: next?.notificationUrl || '',
        siteId: next?.siteId || 'MLM',
        currency: next?.currency || 'MXN',
        processingMode: next?.processingMode || 'automatic',
        oauthClientId: next?.oauthClientId || '',
        oauthClientSecret: '',
        oauthRedirectUrl: next?.oauthRedirectUrl || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar Mercado Pago SaaS')
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const payload: PlatformMercadoPagoConfigRequest = {
        enabled: form.enabled,
        publicKey: form.publicKey,
        notificationUrl: form.notificationUrl,
        siteId: form.siteId,
        currency: form.currency,
        processingMode: form.processingMode,
        oauthClientId: form.oauthClientId,
        oauthRedirectUrl: form.oauthRedirectUrl,
      }
      if (form.accessToken.trim()) payload.accessToken = form.accessToken
      if (form.webhookSecret.trim()) payload.webhookSecret = form.webhookSecret
      if (form.oauthClientSecret.trim()) payload.oauthClientSecret = form.oauthClientSecret

      const res = await savePlatformMercadoPagoConfig(payload)
      const next = res.dto || null
      setConfig(next)
      setForm((prev) => ({
        ...prev,
        enabled: next?.enabled ?? prev.enabled,
        publicKey: next?.publicKey || '',
        accessToken: '',
        webhookSecret: '',
        notificationUrl: next?.notificationUrl || '',
        siteId: next?.siteId || 'MLM',
        currency: next?.currency || 'MXN',
        processingMode: next?.processingMode || 'automatic',
        oauthClientId: next?.oauthClientId || '',
        oauthClientSecret: '',
        oauthRedirectUrl: next?.oauthRedirectUrl || '',
      }))
      addToast('Mercado Pago SaaS actualizado', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al guardar Mercado Pago SaaS', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-transparent border-t-[var(--accent)]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--danger)] bg-[var(--surface)] p-6 text-center">
        <AlertCircle size={32} className="mx-auto mb-2 text-[var(--danger)]" />
        <p className="font-semibold text-[var(--text-primary)]">Error al cargar configuración</p>
        <p className="text-sm text-[var(--text-muted)]">{error}</p>
      </div>
    )
  }

  const isStagingHost = window.location.hostname.includes('staging')
  const isLiveAccessToken = config?.accessTokenMode === 'LIVE'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wider text-[var(--accent)] uppercase">Cuenta MultiGym</p>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Mercado Pago SaaS</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
            Configuración global usada para cobrar mensualidades, renovaciones y pagos SaaS de los
            gimnasios a MultiGym. No modifica las cuentas Mercado Pago de cada tenant.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--text-on-primary)] disabled:opacity-60"
        >
          <Save size={16} /> {isSaving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatusCard label="Cuenta activa" ok={!!config?.effectiveEnabled} />
        <StatusCard label="Access token" ok={!!config?.accessTokenConfigured} />
        <StatusCard label="Webhook secret" ok={!!config?.webhookSecretConfigured} />
        <StatusCard label="OAuth app" ok={!!config?.oauthConfigured} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ModeCard label="Public key" mode={config?.publicKeyMode || 'MISSING'} />
        <ModeCard label="Access token" mode={config?.accessTokenMode || 'MISSING'} />
      </div>

      {config?.usingEnvFallback && (
        <div className="flex gap-3 rounded-2xl border border-[var(--warning)] bg-[var(--surface)] p-4">
          <Shield size={20} className="mt-0.5 text-[var(--warning)]" />
          <div>
            <p className="font-bold text-[var(--text-primary)]">Usando fallback de .env</p>
            <p className="text-sm text-[var(--text-muted)]">
              Todavía no existe una configuración guardada en base de datos. Al guardar esta pantalla,
              la configuración persistente pasará a ser la fuente principal.
            </p>
          </div>
        </div>
      )}

      {isStagingHost && isLiveAccessToken && (
        <div className="flex gap-3 rounded-2xl border border-[var(--danger)] bg-[var(--surface)] p-4">
          <AlertCircle size={20} className="mt-0.5 text-[var(--danger)]" />
          <div>
            <p className="font-bold text-[var(--text-primary)]">Access token live en staging</p>
            <p className="text-sm text-[var(--text-muted)]">
              Para pruebas en staging usa un access token sandbox de Mercado Pago que empiece con TEST.
              Mercado Pago rechazó el pago porque el backend está usando credenciales live.
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
            <WalletCards size={20} />
          </div>
          <div>
            <h2 className="font-black text-[var(--text-primary)]">Credenciales de cobro SaaS</h2>
            <p className="text-sm text-[var(--text-muted)]">Los secretos configurados no se muestran de vuelta.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-bold text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => updateField('enabled', event.target.checked)}
            />
            Habilitar cobros SaaS con Mercado Pago
          </label>
          <TextField label="Public key" value={form.publicKey} onChange={(v) => updateField('publicKey', v)} />
          <TextField
            label="Access token"
            value={form.accessToken}
            onChange={(v) => updateField('accessToken', v)}
            placeholder={config?.accessTokenConfigured ? 'Configurado. Escribe uno nuevo para reemplazarlo.' : ''}
            secret
          />
          <TextField
            label="Webhook secret"
            value={form.webhookSecret}
            onChange={(v) => updateField('webhookSecret', v)}
            placeholder={config?.webhookSecretConfigured ? 'Configurado. Escribe uno nuevo para reemplazarlo.' : ''}
            secret
          />
          <TextField label="Webhook URL" value={form.notificationUrl} onChange={(v) => updateField('notificationUrl', v)} />
          <TextField label="Site ID" value={form.siteId} onChange={(v) => updateField('siteId', v)} />
          <TextField label="Moneda" value={form.currency} onChange={(v) => updateField('currency', v)} />
          <TextField label="Processing mode" value={form.processingMode} onChange={(v) => updateField('processingMode', v)} />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="font-black text-[var(--text-primary)]">OAuth para conectar tenants</h2>
        <p className="mb-5 text-sm text-[var(--text-muted)]">
          App OAuth de Mercado Pago usada para que cada gimnasio conecte su propia cuenta.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="OAuth client ID" value={form.oauthClientId} onChange={(v) => updateField('oauthClientId', v)} />
          <TextField
            label="OAuth client secret"
            value={form.oauthClientSecret}
            onChange={(v) => updateField('oauthClientSecret', v)}
            placeholder={config?.oauthClientSecretConfigured ? 'Configurado. Escribe uno nuevo para reemplazarlo.' : ''}
            secret
          />
          <TextField label="OAuth redirect URL" value={form.oauthRedirectUrl} onChange={(v) => updateField('oauthRedirectUrl', v)} />
        </div>
      </section>
    </form>
  )
}

function StatusCard({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-[var(--text-primary)]">{label}</span>
        {ok ? <CheckCircle size={18} className="text-[var(--success)]" /> : <AlertCircle size={18} className="text-[var(--warning)]" />}
      </div>
      <p className="mt-2 text-xs text-[var(--text-muted)]">{ok ? 'Configurado' : 'Pendiente'}</p>
    </div>
  )
}

function ModeCard({ label, mode }: { label: string; mode: string }) {
  const color = mode === 'TEST' ? 'var(--success)' : mode === 'LIVE' ? 'var(--danger)' : 'var(--warning)'
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-sm font-bold text-[var(--text-primary)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Modo detectado</p>
      <span className="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-black" style={{ background: `${color}20`, color }}>
        {mode}
      </span>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  secret,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  secret?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">{label}</span>
      <input
        type={secret ? 'password' : 'text'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
      />
    </label>
  )
}
