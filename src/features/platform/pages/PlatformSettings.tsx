import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Globe, Lock, Bell, AlertTriangle, RefreshCw, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input as UIInput } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card as UICard, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { usePlatformSettingsStore } from '../store/platformSettingsStore'
import type { LucideIcon } from 'lucide-react'

function settingsToMap(settings: { key: string; value: string }[]): Record<string, string> {
  const map: Record<string, string> = {}
  settings.forEach((s) => {
    map[s.key] = s.value
  })
  return map
}

function Toggle({
  label,
  sub,
  settingKey,
  local,
  updateLocal,
}: {
  label: string
  sub: string
  settingKey: string
  local: Record<string, string>
  updateLocal: (key: string, value: string) => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </p>
      </div>
      <button
        onClick={() => updateLocal(settingKey, local[settingKey] === 'true' ? 'false' : 'true')}
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{ background: local[settingKey] === 'true' ? 'var(--accent)' : 'var(--border)' }}
      >
        <div
          className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform"
          style={{
            transform: local[settingKey] === 'true' ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}

function SettingsInput({
  label,
  type = 'text',
  settingKey,
  local,
  updateLocal,
}: {
  label: string
  type?: string
  settingKey: string
  local: Record<string, string>
  updateLocal: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <UIInput
        type={type}
        value={local[settingKey] || ''}
        onChange={(e) => updateLocal(settingKey, e.target.value)}
      />
    </div>
  )
}

function SettingsSelect({
  label,
  options,
  settingKey,
  local,
  updateLocal,
}: {
  label: string
  options: { label: string; value: string }[]
  settingKey: string
  local: Record<string, string>
  updateLocal: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        value={local[settingKey] || ''}
        onChange={(e) => updateLocal(settingKey, e.target.value)}
        className="border-border bg-background text-text-primary focus:ring-accent flex h-11 w-full appearance-none rounded-xl border px-4 py-2 text-sm transition-colors outline-none focus:ring-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <UICard>
      <CardHeader className="border-border flex flex-row items-center gap-3 border-b pb-4">
        <div
          className="text-text-secondary flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: 'var(--input-bg)' }}
        >
          <Icon size={16} />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">{children}</CardContent>
    </UICard>
  )
}

export default function PlatformSettings() {
  const { settings, plans, isLoading, isSaving, loadSettings, saveSettings } =
    usePlatformSettingsStore()

  const [local, setLocal] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    if (settings.length > 0 && !initializedRef.current) {
      setLocal(settingsToMap(settings))
      initializedRef.current = true
    }
  }, [settings])

  const updateLocal = (key: string, value: string) => {
    setLocal((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    const entries: Record<string, string> = {}
    settings.forEach((s) => {
      if (local[s.key] !== undefined && local[s.key] !== s.value) {
        entries[s.key] = local[s.key]
      }
    })

    if (Object.keys(entries).length === 0) return

    const ok = await saveSettings(entries)
    if (ok) {
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleReset = async () => {
    const defaults: Record<string, string> = {
      platform_name: 'MultiGym Platform',
      platform_domain: 'multigym.com',
      support_email: 'soporte@multigym.com',
      timezone: 'America/Mexico_City',
      trial_days: '14',
      trial_default_plan_id: '',
      trial_require_card: 'false',
      trial_expiry_email: 'true',
      session_timeout_minutes: '480',
      require_2fa: 'false',
      log_ip_addresses: 'true',
      notification_email: 'admin@saas.com',
      notify_new_tenant: 'true',
      notify_failed_payment: 'true',
      weekly_report: 'false',
      maintenance_mode: 'false',
    }
    const ok = await saveSettings(defaults)
    if (ok) {
      setSaved(true)
      setHasChanges(false)
      initializedRef.current = false
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleToggleMaintenance = async () => {
    const current = local['maintenance_mode'] === 'true'
    const nextValue = current ? 'false' : 'true'
    const ok = await saveSettings({ maintenance_mode: nextValue })
    if (ok) {
      setLocal((prev) => ({ ...prev, maintenance_mode: nextValue }))
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  const planOptions = [
    { label: 'Sin plan por defecto', value: '' },
    ...plans
      .filter((plan) => plan.isActive)
      .map((plan) => ({
        label: `${plan.name} - $${plan.price}/mes`,
        value: plan.id,
      })),
  ]

  return (
    <div className="relative space-y-6 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Configuración de Plataforma
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Ajustes globales del sistema SaaS
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="from-accent to-detail gap-2 bg-gradient-to-br shadow-[0_10px_20px_rgba(0,0,255,0.2)] hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SettingsCard icon={Globe} title="General">
          <SettingsInput label="Nombre de la plataforma" settingKey="platform_name" local={local} updateLocal={updateLocal} />
          <SettingsInput label="Dominio principal" settingKey="platform_domain" local={local} updateLocal={updateLocal} />
          <SettingsInput label="Email de soporte" type="email" settingKey="support_email" local={local} updateLocal={updateLocal} />
          <SettingsSelect
            label="Zona horaria"
            settingKey="timezone"
            local={local}
            updateLocal={updateLocal}
            options={[
              { label: 'America/Mexico_City', value: 'America/Mexico_City' },
              { label: 'America/New_York', value: 'America/New_York' },
              { label: 'Europe/Madrid', value: 'Europe/Madrid' },
            ]}
          />
        </SettingsCard>

        <SettingsCard icon={Clock} title="Período Trial">
          <SettingsInput label="Duración del trial (días)" type="number" settingKey="trial_days" local={local} updateLocal={updateLocal} />
          <SettingsSelect
            label="Plan por defecto en trial"
            settingKey="trial_default_plan_id"
            local={local}
            updateLocal={updateLocal}
            options={planOptions}
          />
          <div className="pt-2">
            <Toggle
              label="Requerir tarjeta"
              sub="Exigir método de pago al registrarse"
              settingKey="trial_require_card"
              local={local}
              updateLocal={updateLocal}
            />
            <Toggle
              label="Email de expiración"
              sub="Notificar 3 días antes de expirar"
              settingKey="trial_expiry_email"
              local={local}
              updateLocal={updateLocal}
            />
          </div>
        </SettingsCard>

        <SettingsCard icon={Lock} title="Seguridad">
          <SettingsInput
            label="Tiempo de sesión (minutos)"
            type="number"
            settingKey="session_timeout_minutes"
            local={local}
            updateLocal={updateLocal}
          />
          <div className="pt-2">
            <Toggle
              label="Autenticación 2FA"
              sub="Requerir 2FA para panel plataforma"
              settingKey="require_2fa"
              local={local}
              updateLocal={updateLocal}
            />
            <Toggle
              label="Registro de IPs"
              sub="Guardar IP en log de auditoría"
              settingKey="log_ip_addresses"
              local={local}
              updateLocal={updateLocal}
            />
          </div>
        </SettingsCard>

        <SettingsCard icon={Bell} title="Notificaciones">
          <SettingsInput label="Email para alertas" type="email" settingKey="notification_email" local={local} updateLocal={updateLocal} />
          <div className="pt-2">
            <Toggle
              label="Nuevo tenant"
              sub="Alerta al crear gimnasio"
              settingKey="notify_new_tenant"
              local={local}
              updateLocal={updateLocal}
            />
            <Toggle
              label="Pago fallido"
              sub="Alerta cuando falla un cobro"
              settingKey="notify_failed_payment"
              local={local}
              updateLocal={updateLocal}
            />
            <Toggle
              label="Reporte semanal"
              sub="Enviar resumen semanal"
              settingKey="weekly_report"
              local={local}
              updateLocal={updateLocal}
            />
          </div>
        </SettingsCard>
      </div>

      {/* Danger Zone */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: 'var(--error-muted)', borderColor: 'var(--error)' }}
      >
        <div className="mb-6 flex items-center gap-3">
          <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--danger)' }}>
              Zona de Peligro
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Estas acciones son irreversibles.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <RefreshCw size={14} /> Resetear Configuración
          </button>
          <button
            onClick={handleToggleMaintenance}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
            style={{ color: 'var(--error)', border: '1px solid var(--error)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--error-muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <AlertTriangle size={14} />{' '}
            {local['maintenance_mode'] === 'true'
              ? 'Desactivar mantenimiento'
              : 'Poner plataforma en mantenimiento'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <span style={{ color: 'var(--success)' }}>✔</span> Configuración guardada correctamente
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
