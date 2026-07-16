import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTheme } from '@/hooks/useTheme'
import { getMyOrders, getSubscriptionsByMember } from '@/lib/api'
import type { OrderDTO, SubscriptionListItemDTO } from '@/types/api'
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Settings,
  Package,
  Calendar,
  Sun,
  Moon,
  Save,
  Eye,
  EyeOff,
  ChevronRight,
  LogOut,
  Crown,
} from 'lucide-react'

export default function MemberProfile() {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useTheme()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [email] = useState(user?.email ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [subscription, setSubscription] = useState<SubscriptionListItemDTO | null>(null)
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        if (user?.id) {
          const [subRes, ordersRes] = await Promise.all([
            getSubscriptionsByMember(user.id),
            getMyOrders(),
          ])
          const subs = subRes.lista ?? subRes.dto ?? []
          const active = subs.find((s) => s.status === 'ACTIVE') ?? subs[0] ?? null
          setSubscription(active)
          setOrders(ordersRes.dto?.data ?? [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id])

  const handleSaveProfile = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) return
    setChangingPassword(true)
    await new Promise((r) => setTimeout(r, 800))
    setChangingPassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const fadeUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35 },
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Avatar Header */}
      <motion.div {...fadeUp} className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--accent)] text-3xl font-black text-[var(--accent-text)]">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name ?? ''}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          {subscription?.status === 'ACTIVE' && (
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] border-2 border-[var(--bg-primary)]">
              <Crown size={14} className="text-[var(--accent-text)]" />
            </div>
          )}
        </div>
        <h1 className="text-xl font-black text-[var(--text-primary)]">
          {user?.name ?? 'Usuario'}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
            <Calendar size={12} />
            Miembro desde {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }) : '—'}
          </span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Órdenes', value: orders.length, icon: Package },
          { label: 'Total Gastado', value: `$${totalSpent.toFixed(0)}`, icon: CreditCard },
          { label: 'Plan', value: subscription?.plan?.name ?? 'Sin plan', icon: Crown },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-4"
          >
            <stat.icon size={18} className="mb-2 text-[var(--accent)]" />
            <span className="text-lg font-black text-[var(--text-primary)]">
              {stat.value}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Personal Info */}
      <motion.section
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)]"
      >
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
            <User size={16} className="text-[var(--accent)]" />
            Información Personal
          </h2>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Nombre completo
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                id="profile-email"
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm font-medium text-[var(--text-muted)] opacity-60"
              />
            </div>
          </div>
          <div>
            <label htmlFor="profile-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Teléfono
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Tu número de teléfono"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </motion.section>

      {/* Change Password */}
      <motion.section
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.15 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)]"
      >
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
            <Shield size={16} className="text-[var(--accent)]" />
            Cambiar Contraseña
          </h2>
        </div>
        <div className="space-y-4 p-5">
          {[
            { label: 'Contraseña actual', value: currentPassword, onChange: setCurrentPassword },
            { label: 'Nueva contraseña', value: newPassword, onChange: setNewPassword },
            { label: 'Confirmar contraseña', value: confirmPassword, onChange: setConfirmPassword },
          ].map((field) => (
            <div key={field.label}>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {field.label}
              </label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-10 text-sm font-medium text-[var(--text-primary)] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
            >
              {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPasswords ? 'Ocultar' : 'Mostrar'}
            </button>
            <button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] active:scale-[0.97] disabled:opacity-40"
            >
              <Shield size={14} />
              {changingPassword ? 'Cambiando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </motion.section>

      {/* Current Plan */}
      <motion.section
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.2 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)]"
      >
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
            <CreditCard size={16} className="text-[var(--accent)]" />
            Mi Plan
          </h2>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            </div>
          ) : subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-black text-[var(--text-primary)]">
                  {subscription.plan?.name ?? 'Plan'}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {subscription.plan?.durationMonths} meses · ${subscription.plan?.price}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Vence: {new Date(subscription.endDate).toLocaleDateString('es-MX')}
                </p>
              </div>
              <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent)]">
                {subscription.status}
              </span>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[var(--text-muted)]">No tienes un plan activo</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Settings */}
      <motion.section
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.25 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)]"
      >
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
            <Settings size={16} className="text-[var(--accent)]" />
            Configuración
          </h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--surface-hover)]"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Sun size={18} className="text-[var(--accent)]" /> : <Moon size={18} className="text-[var(--accent)]" />}
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Modo {isDark ? 'Claro' : 'Oscuro'}
              </span>
            </div>
            <ChevronRight size={16} className="text-[var(--text-muted)]" />
          </button>
          <button className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--surface-hover)]">
            <div className="flex items-center gap-3">
              <Package size={18} className="text-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Historial de Órdenes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-muted)]">{orders.length}</span>
              <ChevronRight size={16} className="text-[var(--text-muted)]" />
            </div>
          </button>
          <button
            onClick={async () => {
              await logout()
              const tid = window.location.pathname.match(/^\/([^/]+)/)?.[1]
              window.location.href = tid ? `/${tid}/login` : '/'
            }}
            className="flex w-full items-center gap-3 px-5 py-4 text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </motion.section>

      {/* Bottom spacer for mobile nav */}
      <div className="h-4" />
    </div>
  )
}
