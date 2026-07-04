import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Globe, Lock, Bell, AlertTriangle, RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input as UIInput } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card as UICard, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
export default function PlatformSettings() {
  const [saved, setSaved] = useState(false)
  const [cfg, setCfg] = useState({
    platformName: 'MultiGym Platform',
    domain: 'multigym.com',
    supportEmail: 'soporte@multigym.com',
    timezone: 'America/Mexico_City',
    trialDays: 14,
    defaultTrialPlan: 'STARTER',
    requireCard: false,
    trialEmail: true,
    sessionTimeout: 480,
    twoFactor: false,
    logIp: true,
    notifyNew: true,
    notifyFail: true,
    weeklyReport: false,
    alertEmail: 'admin@saas.com',
  })

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const Toggle = ({ label, sub, checked, onChange }: any) => (
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
        onClick={onChange}
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{ background: checked ? 'var(--accent)' : 'var(--border)' }}
      >
        <div
          className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )

  const Input = ({ label, type = 'text', ...props }: any) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <UIInput type={type} {...props} />
    </div>
  )

  const Select = ({ label, options, ...props }: any) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        {...props}
        className="flex h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-[var(--text-primary)] transition-colors outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value} className="bg-[var(--surface)]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )

  const Card = ({ icon: Icon, title, children }: any) => (
    <UICard>
      <CardHeader className="flex flex-row items-center gap-3 border-b border-[var(--border)] pb-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)]"
          style={{ background: 'var(--input-bg)' }}
        >
          <Icon size={16} />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">{children}</CardContent>
    </UICard>
  )

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
          onClick={save}
          className="from-accent to-detail gap-2 bg-gradient-to-br shadow-[0_10px_20px_rgba(0,0,255,0.2)] hover:-translate-y-0.5"
        >
          <Save size={16} /> Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card icon={Globe} title="General">
          <Input
            label="Nombre de la plataforma"
            value={cfg.platformName}
            onChange={(e: any) => setCfg({ ...cfg, platformName: e.target.value })}
          />
          <Input
            label="Dominio principal"
            value={cfg.domain}
            onChange={(e: any) => setCfg({ ...cfg, domain: e.target.value })}
          />
          <Input
            label="Email de soporte"
            type="email"
            value={cfg.supportEmail}
            onChange={(e: any) => setCfg({ ...cfg, supportEmail: e.target.value })}
          />
          <Select
            label="Zona horaria"
            value={cfg.timezone}
            onChange={(e: any) => setCfg({ ...cfg, timezone: e.target.value })}
            options={[
              { label: 'America/Mexico_City', value: 'America/Mexico_City' },
              { label: 'America/New_York', value: 'America/New_York' },
              { label: 'Europe/Madrid', value: 'Europe/Madrid' },
            ]}
          />
        </Card>

        <Card icon={Clock} title="Período Trial">
          <Input
            label="Duración del trial (días)"
            type="number"
            value={cfg.trialDays}
            onChange={(e: any) => setCfg({ ...cfg, trialDays: e.target.value })}
          />
          <Select
            label="Plan por defecto en trial"
            value={cfg.defaultTrialPlan}
            onChange={(e: any) => setCfg({ ...cfg, defaultTrialPlan: e.target.value })}
            options={[
              { label: 'Starter', value: 'STARTER' },
              { label: 'Pro', value: 'PRO' },
            ]}
          />
          <div className="pt-2">
            <Toggle
              label="Requerir tarjeta"
              sub="Exigir método de pago al registrarse"
              checked={cfg.requireCard}
              onChange={() => setCfg({ ...cfg, requireCard: !cfg.requireCard })}
            />
            <Toggle
              label="Email de expiración"
              sub="Notificar 3 días antes de expirar"
              checked={cfg.trialEmail}
              onChange={() => setCfg({ ...cfg, trialEmail: !cfg.trialEmail })}
            />
          </div>
        </Card>

        <Card icon={Lock} title="Seguridad">
          <Input
            label="Tiempo de sesión (minutos)"
            type="number"
            value={cfg.sessionTimeout}
            onChange={(e: any) => setCfg({ ...cfg, sessionTimeout: e.target.value })}
          />
          <div className="pt-2">
            <Toggle
              label="Autenticación 2FA"
              sub="Requerir 2FA para panel plataforma"
              checked={cfg.twoFactor}
              onChange={() => setCfg({ ...cfg, twoFactor: !cfg.twoFactor })}
            />
            <Toggle
              label="Registro de IPs"
              sub="Guardar IP en log de auditoría"
              checked={cfg.logIp}
              onChange={() => setCfg({ ...cfg, logIp: !cfg.logIp })}
            />
          </div>
        </Card>

        <Card icon={Bell} title="Notificaciones">
          <Input
            label="Email para alertas"
            type="email"
            value={cfg.alertEmail}
            onChange={(e: any) => setCfg({ ...cfg, alertEmail: e.target.value })}
          />
          <div className="pt-2">
            <Toggle
              label="Nuevo tenant"
              sub="Alerta al crear gimnasio"
              checked={cfg.notifyNew}
              onChange={() => setCfg({ ...cfg, notifyNew: !cfg.notifyNew })}
            />
            <Toggle
              label="Pago fallido"
              sub="Alerta cuando falla un cobro"
              checked={cfg.notifyFail}
              onChange={() => setCfg({ ...cfg, notifyFail: !cfg.notifyFail })}
            />
            <Toggle
              label="Reporte semanal"
              sub="Enviar resumen semanal"
              checked={cfg.weeklyReport}
              onChange={() => setCfg({ ...cfg, weeklyReport: !cfg.weeklyReport })}
            />
          </div>
        </Card>
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
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <RefreshCw size={14} /> Resetear Configuración
          </button>
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
            style={{ color: 'var(--error)', border: '1px solid var(--error)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--error-muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <AlertTriangle size={14} /> Poner plataforma en mantenimiento
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
