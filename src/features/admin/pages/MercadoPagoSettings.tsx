import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/components/ui/Toast'
import {
  disconnectMercadoPagoOAuth,
  getMercadoPagoConfig,
  refreshMercadoPagoOAuth,
  saveMercadoPagoConfig,
  startMercadoPagoOAuthConnect,
} from '@/lib/api'
import type { MercadoPagoTenantConfigDTO } from '@/types'
import { LoadingState } from '../components/LoadingState'

export default function MercadoPagoSettings() {
  const addToast = useToastStore((s) => s.addToast)
  const [config, setConfig] = useState<MercadoPagoTenantConfigDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isSavingWebhookSecret, setIsSavingWebhookSecret] = useState(false)
  const [webhookSecret, setWebhookSecret] = useState('')
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null)

  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getMercadoPagoConfig()
      setConfig(response.dto || null)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al cargar Mercado Pago', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const connect = async () => {
    setIsConnecting(true)
    try {
      const response = await startMercadoPagoOAuthConnect()
      const nextAuthorizationUrl = response.dto?.authorizationUrl
      if (!nextAuthorizationUrl) throw new Error('No se pudo iniciar la conexión con Mercado Pago')
      setAuthorizationUrl(nextAuthorizationUrl)
      window.location.assign(nextAuthorizationUrl)
    } catch (err) {
      setIsConnecting(false)
      addToast(err instanceof Error ? err.message : 'Error al conectar Mercado Pago', 'error')
    }
  }

  const refresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await refreshMercadoPagoOAuth()
      setConfig(response.dto || null)
      addToast('Credenciales de Mercado Pago actualizadas', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al refrescar Mercado Pago', 'error')
    } finally {
      setIsRefreshing(false)
    }
  }

  const disconnect = async () => {
    if (!window.confirm('Esto desconectará Mercado Pago de este gimnasio. ¿Continuar?')) return
    setIsDisconnecting(true)
    try {
      const response = await disconnectMercadoPagoOAuth()
      setConfig(response.dto || null)
      addToast('Mercado Pago desconectado', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al desconectar Mercado Pago', 'error')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const saveWebhookSecret = async (event: FormEvent) => {
    event.preventDefault()
    const nextWebhookSecret = webhookSecret.trim()
    if (!nextWebhookSecret) {
      addToast('Pega el webhook secret de Mercado Pago antes de guardar', 'error')
      return
    }

    setIsSavingWebhookSecret(true)
    try {
      const response = await saveMercadoPagoConfig({
        enabled: config?.enabled ?? true,
        webhookSecret: nextWebhookSecret,
      })
      setConfig(response.dto || null)
      setWebhookSecret('')
      addToast('Webhook secret guardado', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al guardar webhook secret', 'error')
    } finally {
      setIsSavingWebhookSecret(false)
    }
  }

  if (isLoading) return <LoadingState text="Cargando Mercado Pago..." />

  const connected = Boolean(
    config?.enabled && config.connectionStatus === 'CONNECTED' && config.publicKey
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Mercado Pago</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Conecta la cuenta que recibirá los pagos de tienda y membresías de este gimnasio.
          </p>
        </div>
        <Button variant="outline" onClick={loadConfig} disabled={isLoading}>
          Actualizar
        </Button>
      </div>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
              <CreditCard size={28} />
            </div>
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-[var(--text-muted)] uppercase">
                Estado de integración
              </p>
              <h2 className="mt-1 text-xl font-black text-[var(--text-primary)]">
                {connected ? 'Cuenta conectada' : 'Sin conexión activa'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
                La conexión se realiza con OAuth para evitar capturar tokens secretos en el panel.
                Los tokens no se muestran y se guardan únicamente en el backend del tenant.
              </p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{
              background: connected ? 'var(--success-muted)' : 'var(--warning-muted)',
              color: connected ? 'var(--success)' : 'var(--warning)',
            }}
          >
            {connected ? <CheckCircle2 size={14} /> : <ShieldCheck size={14} />}
            {connected ? 'Activo' : 'Pendiente'}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Public key"
            value={config?.publicKey ? maskValue(config.publicKey) : 'No configurada'}
          />
          <InfoCard label="Cuenta MP" value={config?.mpUserId || 'No conectada'} />
          <InfoCard
            label="Access token"
            value={config?.accessTokenConfigured ? 'Guardado' : 'No guardado'}
          />
          <InfoCard
            label="Webhook secret"
            value={config?.webhookSecretConfigured ? 'Guardado' : 'No guardado'}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={connect} disabled={isConnecting} className="gap-2">
            {isConnecting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ExternalLink size={16} />
            )}
            {connected ? 'Reconectar cuenta' : 'Conectar Mercado Pago'}
          </Button>
          {authorizationUrl && (
            <a
              href={authorizationUrl}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)]"
            >
              Abrir Mercado Pago
            </a>
          )}
          <Button
            variant="outline"
            onClick={refresh}
            disabled={!config?.refreshTokenConfigured || isRefreshing}
            className="gap-2"
          >
            {isRefreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refrescar token
          </Button>
          <Button
            variant="destructive"
            onClick={disconnect}
            disabled={!connected || isDisconnecting}
            className="gap-2"
          >
            {isDisconnecting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Unplug size={16} />
            )}
            Desconectar
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-lg font-black text-[var(--text-primary)]">Webhook recomendado</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Configura esta URL en Mercado Pago para que el backend actualice órdenes, membresías y
          pagos automáticamente. Habilita al menos el tópico{' '}
          <span className="font-mono">payment</span>.
        </p>
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 font-mono text-xs text-[var(--text-secondary)]">
          {config?.notificationUrl || 'Conecta Mercado Pago para ver la URL sugerida.'}
        </div>
        <form onSubmit={saveWebhookSecret} className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <textarea
            name="webhookSecret"
            value={webhookSecret}
            onChange={(event) => setWebhookSecret(event.target.value)}
            placeholder={
              config?.webhookSecretConfigured
                ? 'Webhook secret ya guardado. Pega uno nuevo para reemplazarlo.'
                : 'Pega aquí el webhook secret de Mercado Pago'
            }
            autoComplete="new-password"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            rows={3}
            className="min-h-24 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 font-mono text-sm text-[var(--text-primary)] transition-all duration-300 placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 focus-visible:outline-none"
          />
          <Button type="submit" disabled={isSavingWebhookSecret || !webhookSecret.trim()}>
            {isSavingWebhookSecret ? 'Guardando...' : 'Guardar secret'}
          </Button>
        </form>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          El secret no se vuelve a mostrar después de guardarlo. Sólo se usa para validar la
          firma de las notificaciones entrantes.
        </p>
      </section>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-bold text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold break-all text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

function maskValue(value: string) {
  if (value.length <= 12) return value
  return `${value.slice(0, 8)}...${value.slice(-4)}`
}
