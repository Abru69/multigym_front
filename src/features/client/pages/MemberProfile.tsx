import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTheme } from '@/hooks/useTheme'
import { createPayment, getMercadoPagoConfig, getMyOrders, getPlans, getSubscriptionsByMember, requestSubscriptionPlanChange, updateTenantUser, uploadMyAvatar } from '@/lib/api'
import { getMercadoPago, getMercadoPagoDeviceSessionId, loadMercadoPagoDeviceFingerprint } from '@/lib/mercadopago'
import { useToastStore } from '@/components/ui/Toast'
import { getTenantUrl } from '@/lib/tenant'
import type { OrderDTO, PlanListItemDTO, SubscriptionListItemDTO } from '@/types/api'
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
  Camera,
} from 'lucide-react'

export default function MemberProfile() {
  const { user, logout, tenantId, setUserAvatar, updateUserProfile } = useAuthStore()
  const addToast = useToastStore((state) => state.addToast)
  const { isDark, toggleTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [email] = useState(user?.email ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const changingPassword = false

  const [subscription, setSubscription] = useState<SubscriptionListItemDTO | null>(null)
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentMode, setPaymentMode] = useState<'CARD' | 'BRANCH' | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [plans, setPlans] = useState<PlanListItemDTO[]>([])
  const [requestedPlanId, setRequestedPlanId] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        if (user?.id) {
           const [subRes, ordersRes, plansRes] = await Promise.all([
             getSubscriptionsByMember(user.memberId || user.id),
             getMyOrders(),
             getPlans(),
           ])
          const subs = subRes.lista ?? subRes.dto ?? []
           const payable = subs.find((s) => s.status === 'PENDING_PAYMENT')
           const active = payable ?? subs.find((s) => s.status === 'ACTIVE') ?? subs[0] ?? null
           setSubscription(active)
           setOrders(ordersRes.dto?.data ?? [])
           setPlans((plansRes.dto?.data ?? []).filter((plan) => plan.isActive))
           if (window.location.hostname.includes('staging')) {
             setCardName('APRO APRO')
             setCardNumber('4075 5957 1648 3764')
             setCardExpiry('11/30')
             setCardCvc('123')
           }
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id, user?.memberId])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      if (!user) return
      await updateTenantUser(user.id, {
        email: user.email,
        name,
        phone,
        role: user.role.toUpperCase(),
      })
      updateUserProfile({ name, phone })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      addToast('Perfil actualizado correctamente', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo actualizar el perfil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (file?: File) => {
    if (!file) return
    setAvatarUploading(true)
    setAvatarError(null)
    try {
      const response = await uploadMyAvatar(file)
      const avatar = response.dto?.avatarUrl
      if (avatar) {
        setUserAvatar(avatar)
      }
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'No se pudo actualizar el avatar')
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) return
    addToast(
      'El cambio de contraseña requiere un endpoint de backend pendiente de integrar.',
      'warning'
    )
  }

  const submitMembershipPayment = async () => {
    if (!subscription || paying) return
    setPaying(true)
    try {
      if (paymentMode === 'BRANCH') {
        await createPayment({ subscriptionId: subscription.id, amount: Number(subscription.plan?.price || 0), paymentMethod: 'CASH', reference: 'PENDING_BRANCH' })
        addToast('Solicitud registrada. Realiza el pago en sucursal.', 'success')
        setPaymentMode(null)
        return
      }
      const digits = cardNumber.replace(/\D/g, '')
      const [month, year] = cardExpiry.split('/')
      const normalizedMonth = Number(month)
      const normalizedYear = Number(year?.length === 2 ? `20${year}` : year)
      const now = new Date()
      const payerEmail = user?.email?.trim() || ''
      const nameParts = cardName.trim().split(/\s+/)
      const payerFirstName = nameParts.shift() || ''
      const payerLastName = nameParts.join(' ')
      if (!/^\S+@\S+\.\S+$/.test(payerEmail)) throw new Error('Ingresa un correo válido para el pago')
      if (digits.length < 13 || digits.length > 19 || !/^(0[1-9]|1[0-2])$/.test(month) || !/^\d{2,4}$/.test(year || '') || !cardCvc || !/^\d{3,4}$/.test(cardCvc) || !payerFirstName || !payerLastName) {
        throw new Error('Completa nombre, apellido y datos válidos de la tarjeta')
      }
      if (normalizedYear < now.getFullYear() || (normalizedYear === now.getFullYear() && normalizedMonth < now.getMonth() + 1)) {
        throw new Error('La tarjeta está vencida')
      }
      const config = await getMercadoPagoConfig()
      if (!config.dto?.publicKey) throw new Error('Mercado Pago no está configurado para este gimnasio')
      const mp: any = getMercadoPago(config.dto.publicKey)
      const token = await mp.createCardToken({ cardNumber: digits, cardholderName: cardName, cardExpirationMonth: month, cardExpirationYear: year.length === 2 ? `20${year}` : year, securityCode: cardCvc })
      await loadMercadoPagoDeviceFingerprint()
      const cardToken = token?.id || token?.token
      const paymentMethodId = token?.payment_method_id
      const deviceSessionId = getMercadoPagoDeviceSessionId()
      if (!cardToken || !paymentMethodId || !deviceSessionId) throw new Error('No se pudo validar la información de seguridad del pago')
      await createPayment({ subscriptionId: subscription.id, amount: Number(subscription.plan?.price || 0), paymentMethod: 'CREDIT_CARD', cardToken, paymentMethodId, issuerId: token?.issuer_id, installments: 1, payerEmail, payerFirstName, payerLastName, deviceSessionId })
      addToast('Pago de membresía procesado correctamente', 'success')
      setPaymentMode(null)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo procesar el pago', 'error')
    } finally {
      setPaying(false)
    }
  }

  const requestPlanChange = async () => {
    if (!subscription || !requestedPlanId) return
    try {
      const response = await requestSubscriptionPlanChange(subscription.id, requestedPlanId)
      setSubscription(response.dto || subscription)
      setRequestedPlanId('')
      addToast('Solicitud creada. Debes pagar el nuevo plan.', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo solicitar el cambio', 'error')
    }
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => handleAvatarChange(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--bg-primary)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm transition-all hover:bg-[var(--surface-hover)] disabled:opacity-60"
            aria-label="Cambiar avatar"
          >
            <Camera size={15} />
          </button>
          {subscription?.status === 'ACTIVE' && (
            <div className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg-primary)] bg-[var(--accent)]">
              <Crown size={14} className="text-[var(--accent-text)]" />
            </div>
          )}
        </div>
        <h1 className="text-xl font-black text-[var(--text-primary)]">{user?.name ?? 'Usuario'}</h1>
        <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
        {avatarUploading && (
          <p className="mt-2 text-xs font-bold text-[var(--accent)]">Subiendo avatar...</p>
        )}
        {avatarError && <p className="mt-2 text-xs font-bold text-red-500">{avatarError}</p>}
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
            <Calendar size={12} />
            Miembro desde{' '}
            {user?.joinDate
              ? new Date(user.joinDate).toLocaleDateString('es-MX', {
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
          </span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {[
          { label: 'Órdenes', value: orders.length, icon: Package },
          { label: 'Total Gastado', value: `$${totalSpent.toFixed(0)}`, icon: CreditCard },
          { label: 'Plan', value: subscription?.plan?.name ?? 'Sin plan', icon: Crown },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 sm:flex-col sm:items-center sm:px-3 sm:py-4"
          >
            <stat.icon size={18} className="text-[var(--accent)] sm:mb-2" />
            <span className="text-base font-black text-[var(--text-primary)] sm:text-lg">{stat.value}</span>
            <span className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
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
          <h2 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--text-primary)] uppercase">
            <User size={16} className="text-[var(--accent)]" />
            Información Personal
          </h2>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase"
            >
              Nombre completo
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pr-4 pl-10 text-sm font-medium text-[var(--text-primary)] transition-all outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="profile-email"
              className="mb-1.5 block text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                id="profile-email"
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pr-4 pl-10 text-sm font-medium text-[var(--text-muted)] opacity-60"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="profile-phone"
              className="mb-1.5 block text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase"
            >
              Teléfono
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Tu número de teléfono"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pr-4 pl-10 text-sm font-medium text-[var(--text-primary)] transition-all outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
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
          <h2 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--text-primary)] uppercase">
            <Shield size={16} className="text-[var(--accent)]" />
            Cambiar Contraseña
          </h2>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Esta operación quedará disponible cuando el backend exponga el endpoint de cambio de
            contraseña.
          </p>
        </div>
        <div className="space-y-4 p-5">
          {[
            { label: 'Contraseña actual', value: currentPassword, onChange: setCurrentPassword },
            { label: 'Nueva contraseña', value: newPassword, onChange: setNewPassword },
            { label: 'Confirmar contraseña', value: confirmPassword, onChange: setConfirmPassword },
          ].map((field) => (
            <div key={field.label}>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
                {field.label}
              </label>
              <div className="relative">
                <Shield
                  size={16}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pr-10 pl-10 text-sm font-medium text-[var(--text-primary)] transition-all outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
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
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                newPassword !== confirmPassword
              }
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
          <h2 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--text-primary)] uppercase">
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
             <div>
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
               {(subscription.status === 'ACTIVE' || subscription.status === 'PENDING_PAYMENT') && (
                 <div className="mt-4 rounded-xl bg-[var(--surface)] p-3">
                   <p className="text-xs font-bold text-[var(--text-primary)]">{subscription.status === 'PENDING_PAYMENT' ? 'Completa el pago de tu membresía' : 'Pagar renovación'}</p>
                   <p className="mt-1 text-xs text-[var(--text-muted)]">{subscription.plan?.price} por {subscription.plan?.durationMonths} meses</p>
                   <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setPaymentMode(paymentMode === 'CARD' ? null : 'CARD')} className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-bold text-[var(--accent-text)]">Pago en línea</button>
                     <button type="button" onClick={() => setPaymentMode(paymentMode === 'BRANCH' ? null : 'BRANCH')} className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--text-primary)]">Pagar en sucursal</button>
                   </div>
                   {paymentMode === 'CARD' && (
                     <div className="mt-3 grid gap-2 sm:grid-cols-2">
                       <input value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Nombre del titular" className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs" />
                       <input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="Número de tarjeta" className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs" />
                       <input value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} placeholder="MM/YY" className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs" />
                       <input value={cardCvc} onChange={(event) => setCardCvc(event.target.value)} placeholder="CVC" className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs" />
                       <button type="button" onClick={() => void submitMembershipPayment()} disabled={paying} className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-bold text-[var(--accent-text)] disabled:opacity-50 sm:col-span-2">{paying ? 'Procesando...' : 'Pagar ahora'}</button>
                     </div>
                   )}
                    {paymentMode === 'BRANCH' && (
                     <button type="button" onClick={() => void submitMembershipPayment()} disabled={paying} className="mt-3 w-full rounded-xl border border-[var(--accent)] px-3 py-2 text-xs font-bold text-[var(--accent)] disabled:opacity-50">{paying ? 'Registrando...' : 'Solicitar pago en sucursal'}</button>
                    )}
                    {subscription.status === 'ACTIVE' && plans.some((plan) => plan.id !== subscription.plan?.id) && (
                      <div className="mt-4 border-t border-[var(--border)] pt-3">
                        <p className="text-xs font-bold text-[var(--text-primary)]">Solicitar cambio de plan</p>
                        <div className="mt-2 flex gap-2">
                          <select value={requestedPlanId} onChange={(event) => setRequestedPlanId(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-xs text-[var(--text-primary)]">
                            <option value="">Selecciona un plan</option>
                            {plans.filter((plan) => plan.id !== subscription.plan?.id).map((plan) => <option key={plan.id} value={plan.id}>{plan.name} - ${plan.price}</option>)}
                          </select>
                          <button type="button" onClick={() => void requestPlanChange()} disabled={!requestedPlanId} className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-bold text-[var(--accent-text)] disabled:opacity-50">Solicitar</button>
                        </div>
                      </div>
                    )}
                 </div>
               )}
             </div>
          ) : (
            <div className="py-6 text-center">
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
          <h2 className="flex items-center gap-2 text-sm font-black tracking-wider text-[var(--text-primary)] uppercase">
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
              {isDark ? (
                <Sun size={18} className="text-[var(--accent)]" />
              ) : (
                <Moon size={18} className="text-[var(--accent)]" />
              )}
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
              const currentTenantId = tenantId || user?.tenantId
              await logout()
              window.location.href = currentTenantId ? getTenantUrl(currentTenantId) : '/'
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
