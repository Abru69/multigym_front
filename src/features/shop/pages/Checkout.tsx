import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/features/shop/store/cartStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useToastStore } from '@/components/ui/Toast'
import { fetchApi } from '@/lib/api'
import { getMercadoPago } from '@/lib/mercadopago'
import type { OrderDTO, ResponseDTO, BranchDTO, TenantSettingDTO, OrderRequest } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  CheckCircle2,
  Loader2,
  ArrowLeft,
  CreditCard,
  Lock,
  Package,
  Check,
  MapPin,
  Store,
  Truck,
} from 'lucide-react'

const STEPS = [
  { key: 'method', label: 'Entrega', icon: MapPin },
  { key: 'details', label: 'Detalles', icon: Store },
  { key: 'payment', label: 'Pago', icon: CreditCard },
  { key: 'success', label: 'Confirmación', icon: CheckCircle2 },
] as const

const isMercadoPagoTestMode = import.meta.env.VITE_MP_PUBLIC_KEY?.startsWith('TEST-')

function StepIndicator({ currentStep }: { currentStep: string }) {
  const getStepIndex = (s: string) => {
    const idx = STEPS.findIndex((st) => st.key === s)
    return idx >= 0 ? idx : 0
  }
  const idx = getStepIndex(currentStep)

  return (
    <div className="mb-8 sm:mb-12">
      {/* Desktop */}
      <div className="hidden items-center justify-center sm:flex">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    i < idx
                      ? 'bg-[var(--success)] text-white shadow-sm'
                      : i === idx
                        ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-md'
                        : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                  }`}
                >
                  {i < idx ? <Check size={20} /> : i + 1}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    i <= idx ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-3 mb-6 h-0.5 w-16 transition-colors duration-300 lg:w-24 ${
                    i < idx ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Mobile - compact */}
      <div className="flex items-center justify-center sm:hidden">
        <div className="flex w-full max-w-sm items-center gap-1 px-4">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    i < idx
                      ? 'bg-[var(--success)] text-white'
                      : i === idx
                        ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                        : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                  }`}
                >
                  {i < idx ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`text-[9px] font-semibold ${
                    i <= idx ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mb-5 h-0.5 flex-1 transition-colors duration-300 ${
                    i < idx ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  const { items, total, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)
  const navigate = useNavigate()

  const [step, setStep] = useState<'method' | 'details' | 'payment' | 'success'>('method')
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [mpReady, setMpReady] = useState(false)

  const [confettiOffsets] = useState(() =>
    Array.from({ length: 6 }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
    }))
  )

  const [branches, setBranches] = useState<BranchDTO[]>([])
  const [deliveryMethods, setDeliveryMethods] = useState({ pickup: true, shipping: true })
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'SHIPPING'>('PICKUP')
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingPostalCode, setShippingPostalCode] = useState('')
  const [cardholderName, setCardholderName] = useState(isMercadoPagoTestMode ? 'APRO' : '')
  const [cardNumber, setCardNumber] = useState(isMercadoPagoTestMode ? '4075 5957 1648 3764' : '')
  const [cardExpiry, setCardExpiry] = useState(isMercadoPagoTestMode ? '11/30' : '')
  const [cardCvc, setCardCvc] = useState(isMercadoPagoTestMode ? '123' : '')
  const [cardholderEmail, setCardholderEmail] = useState(user?.email || '')

  const subtotal = total()
  const shipping = deliveryMethod === 'SHIPPING' ? (subtotal > 1500 ? 0 : 150) : 0
  const finalTotal = subtotal + shipping

  useEffect(() => {
    if (items.length === 0 && step !== 'success') {
      navigate('/tienda/carrito')
    }
  }, [items.length, step, navigate])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [branchesRes, settingsRes] = await Promise.all([
          fetchApi<ResponseDTO<BranchDTO[]>>('/api/branches'),
          fetchApi<ResponseDTO<TenantSettingDTO[]>>('/api/tenant-settings'),
        ])
        setBranches(branchesRes.dto || branchesRes.lista || [])

        const settings = settingsRes.dto || settingsRes.lista || []
        const pickupEnabled = settings.find((s) => s.key === 'delivery_pickup_enabled')
        const shippingEnabled = settings.find((s) => s.key === 'delivery_shipping_enabled')

        const pickup = pickupEnabled ? pickupEnabled.value === 'true' : true
        const shipping = shippingEnabled ? shippingEnabled.value === 'true' : true

        setDeliveryMethods({ pickup, shipping })

        if (pickup && !shipping) setDeliveryMethod('PICKUP')
        else if (!pickup && shipping) setDeliveryMethod('SHIPPING')
        else if (pickup) setDeliveryMethod('PICKUP')
        else setDeliveryMethod('SHIPPING')
      } catch (err) {
        console.error('Failed to load delivery options:', err)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedBranch(branches[0].id)
    }
  }, [branches, selectedBranch])

  useEffect(() => {
    let timer = 0
    try {
      getMercadoPago()
      timer = window.setTimeout(() => setMpReady(true), 0)
    } catch (err) {
      console.error('Failed to init MercadoPago:', err)
      addToast('Error al inicializar MercadoPago', 'error')
    }
    return () => window.clearTimeout(timer)
  }, [addToast])

  useEffect(() => {
    if (user?.email && !cardholderEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCardholderEmail(user.email)
    }
  }, [user?.email, cardholderEmail])

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ')

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  const getPaymentMethodId = (digits: string) => {
    if (/^4/.test(digits)) return 'visa'
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'master'
    if (/^3[47]/.test(digits)) return 'amex'
    return 'visa'
  }

  const processPayment = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    setLoading(true)
    try {
      if (!user?.id) {
        throw new Error('Debes iniciar sesión para completar la compra')
      }
      if (deliveryMethod === 'PICKUP' && !selectedBranch) {
        throw new Error('Selecciona una sucursal para recoger tu pedido')
      }
      if (deliveryMethod === 'SHIPPING') {
        if (!shippingAddress.trim()) throw new Error('Ingresa la dirección de envío')
        if (!shippingCity.trim()) throw new Error('Ingresa la ciudad')
        if (!shippingPostalCode.trim()) throw new Error('Ingresa el código postal')
      }

      const cardDigits = cardNumber.replace(/\D/g, '')
      const [expirationMonth, expirationYearShort] = cardExpiry.split('/')
      if (cardDigits.length < 13) throw new Error('Ingresa un número de tarjeta válido')
      if (!expirationMonth || !expirationYearShort) throw new Error('Ingresa el vencimiento en formato MM/YY')
      if (!cardCvc.trim()) throw new Error('Ingresa el CVC')
      if (!cardholderName.trim()) throw new Error('Ingresa el nombre del titular')
      if (!cardholderEmail.trim()) throw new Error('Ingresa el email del titular')

      const expirationYear = expirationYearShort.length === 2 ? `20${expirationYearShort}` : expirationYearShort
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp: any = getMercadoPago()
      const tokenResponse = await mp.createCardToken({
        cardNumber: cardDigits,
        cardholderName: cardholderName.trim(),
        cardExpirationMonth: expirationMonth,
        cardExpirationYear: expirationYear,
        securityCode: cardCvc.trim(),
      })
      const cardToken = tokenResponse?.id || tokenResponse?.token
      if (!cardToken) {
        console.error('MercadoPago token response:', tokenResponse)
        throw new Error('No se pudo tokenizar la tarjeta. Verifica los datos e intenta de nuevo.')
      }

      const orderBody: OrderRequest = {
        userId: user.id,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod: 'CREDIT_CARD',
        shippingAmount: shipping,
        deliveryMethod,
        cardToken,
        paymentMethodId: getPaymentMethodId(cardDigits),
        installments: 1,
        ...(deliveryMethod === 'PICKUP'
          ? { branchId: selectedBranch }
          : { shippingAddress, shippingCity, shippingPostalCode }),
      }

      const orderRes = await fetchApi<ResponseDTO<OrderDTO>>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderBody),
      })
      const orderId = orderRes.dto?.id || ''
      setOrderNumber(orderId.slice(0, 8).toUpperCase())

      setStep('success')
      clearCart()
    } catch (err) {
      console.error('Checkout error:', err)
      addToast(err instanceof Error ? err.message : 'Error al procesar el pago. Intenta de nuevo.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const canProceedToDetails = () => {
    if (deliveryMethod === 'PICKUP') return selectedBranch !== ''
    return shippingAddress !== '' && shippingCity !== '' && shippingPostalCode !== ''
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {step !== 'success' && <StepIndicator currentStep={step} />}

      <AnimatePresence mode="wait">
        {/* STEP 1: Delivery Method */}
        {step === 'method' && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-lg space-y-6"
          >
            <h2 className="font-heading text-xl font-black text-[var(--text-primary)]">
              Método de Entrega
            </h2>

            <div className="space-y-4">
              {deliveryMethods.pickup && (
                <button
                  onClick={() => setDeliveryMethod('PICKUP')}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-md'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      deliveryMethod === 'PICKUP'
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Store size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--text-primary)]">Recoger en Sucursal</p>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Elige la sucursal más cercana y recoge tu pedido
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[var(--success)]">Gratis</p>
                  </div>
                  {deliveryMethod === 'PICKUP' && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]">
                      <Check size={14} className="text-[var(--accent-text)]" />
                    </div>
                  )}
                </button>
              )}

              {deliveryMethods.shipping && (
                <button
                  onClick={() => setDeliveryMethod('SHIPPING')}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                    deliveryMethod === 'SHIPPING'
                      ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-md'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                      deliveryMethod === 'SHIPPING'
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Truck size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--text-primary)]">Envío a Domicilio</p>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Recibe tu pedido en la puerta de tu casa
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {subtotal > 1500 ? (
                        <span className="font-semibold text-[var(--success)]">Envío gratis</span>
                      ) : (
                        <>Envío: {formatCurrency(150)}</>
                      )}
                    </p>
                  </div>
                  {deliveryMethod === 'SHIPPING' && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]">
                      <Check size={14} className="text-[var(--accent-text)]" />
                    </div>
                  )}
                </button>
              )}
            </div>

            <button
              onClick={() => setStep('details')}
              className="mt-6 h-12 w-full rounded-full bg-[var(--accent)] text-sm font-bold uppercase tracking-wide text-[var(--accent-text)] shadow-md transition-all hover:shadow-lg"
            >
              Continuar
            </button>
          </motion.div>
        )}

        {/* STEP 2: Details (Branch or Address) */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            <div className="space-y-6">
              <button
                onClick={() => setStep('method')}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <ArrowLeft size={16} /> Cambiar método
              </button>

              {deliveryMethod === 'PICKUP' ? (
                <>
                  <h2 className="font-heading text-xl font-black text-[var(--text-primary)]">
                    Selecciona Sucursal
                  </h2>
                  <div className="space-y-3">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => setSelectedBranch(branch.id)}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                          selectedBranch === branch.id
                            ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-md'
                            : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-hover)]'
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            selectedBranch === branch.id
                              ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                              : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                          }`}
                        >
                          <Store size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[var(--text-primary)]">{branch.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{branch.address}</p>
                          {branch.phone && (
                            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{branch.phone}</p>
                          )}
                        </div>
                        {selectedBranch === branch.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]">
                            <Check size={14} className="text-[var(--accent-text)]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-heading text-xl font-black text-[var(--text-primary)]">
                    Dirección de Envío
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="shipping-address" className="text-xs font-semibold text-[var(--text-primary)]">Calle y Número</label>
                      <input
                        id="shipping-address"
                        required
                        type="text"
                        placeholder="Av. Principal 123"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="shipping-postal" className="text-xs font-semibold text-[var(--text-primary)]">Código Postal</label>
                        <input
                          id="shipping-postal"
                          required
                          type="text"
                          placeholder="31000"
                          value={shippingPostalCode}
                          onChange={(e) => setShippingPostalCode(e.target.value)}
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="shipping-city" className="text-xs font-semibold text-[var(--text-primary)]">Ciudad</label>
                        <input
                          id="shipping-city"
                          required
                          type="text"
                          placeholder="Chihuahua"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => setStep('payment')}
                disabled={!canProceedToDetails()}
                className="mt-6 h-12 w-full rounded-full bg-[var(--accent)] text-sm font-bold uppercase tracking-wide text-[var(--accent-text)] shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continuar al Pago
              </button>
            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="mb-4 font-heading text-lg font-black text-[var(--text-primary)]">Resumen</h3>
              <div className="scrollbar-hide mb-6 max-h-60 space-y-3 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-hover)]">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[var(--text-primary)]">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">Cant: {item.quantity}</p>
                    </div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-[var(--border)] pt-4 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{deliveryMethod === 'PICKUP' ? 'Recogida' : 'Envío'}</span>
                  <span>{shipping === 0 ? 'Gratis' : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between pt-2 font-heading text-lg font-black text-[var(--text-primary)]">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Payment */}
        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-lg"
          >
            <button
              onClick={() => setStep('details')}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <ArrowLeft size={16} /> Volver a Detalles
            </button>

            <h2 className="mb-6 font-heading text-xl font-black text-[var(--text-primary)]">
              Información de Pago
            </h2>

            <form onSubmit={processPayment} className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10">
                      <CreditCard size={18} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">Tarjeta de Crédito / Débito</p>
                      <p className="text-xs text-[var(--text-muted)]">Pago procesado por MercadoPago</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {isMercadoPagoTestMode && (
                    <div className="mb-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-xs text-[var(--text-secondary)]">
                      <p className="font-bold text-[var(--text-primary)]">Modo prueba Mercado Pago México</p>
                      <p>Usa titular <span className="font-mono font-bold">APRO</span> para aprobar el pago.</p>
                      <p>Visa: <span className="font-mono">4075 5957 1648 3764</span>, CVV <span className="font-mono">123</span>, vencimiento <span className="font-mono">11/30</span>.</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="cardholder-name" className="text-xs font-semibold text-[var(--text-primary)]">Nombre en la Tarjeta</label>
                      <input
                        id="cardholder-name"
                        required
                        type="text"
                        placeholder="Como aparece en la tarjeta"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm uppercase text-[var(--text-primary)] transition-all placeholder:normal-case placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="card-number" className="text-xs font-semibold text-[var(--text-primary)]">Número de Tarjeta</label>
                      <input
                        id="card-number"
                        required
                        inputMode="numeric"
                        autoComplete="cc-number"
                        type="text"
                        maxLength={19}
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 font-mono text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="card-expiry" className="text-xs font-semibold text-[var(--text-primary)]">Vencimiento</label>
                        <input
                          id="card-expiry"
                          required
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 font-mono text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="card-cvc" className="text-xs font-semibold text-[var(--text-primary)]">CVC</label>
                        <input
                          id="card-cvc"
                          required
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 font-mono text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="cardholder-email" className="text-xs font-semibold text-[var(--text-primary)]">Email</label>
                      <input
                        id="cardholder-email"
                        required
                        type="email"
                        placeholder="tu@email.com"
                        value={cardholderEmail}
                        onChange={(e) => setCardholderEmail(e.target.value)}
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <Lock size={12} />
                <span>Pago seguro procesado por MercadoPago</span>
              </div>

              <button
                type="submit"
                disabled={loading || !mpReady || (deliveryMethod === 'PICKUP' && !selectedBranch) || (deliveryMethod === 'SHIPPING' && !canProceedToDetails())}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-sm font-bold uppercase tracking-wide text-[var(--accent-text)] shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  `Pagar ${formatCurrency(finalTotal)}`
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mx-auto max-w-md py-10 text-center"
          >
            <div className="relative mx-auto mb-8">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--success)]/10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 size={48} className="text-[var(--success)]" />
                </motion.div>
              </div>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    x: confettiOffsets[i].x,
                    y: confettiOffsets[i].y,
                  }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                  className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      i % 3 === 0
                        ? 'var(--accent)'
                        : i % 3 === 1
                          ? 'var(--success)'
                          : '#fbbf24',
                  }}
                />
              ))}
            </div>

            <h2 className="mb-3 font-heading text-2xl font-black text-[var(--text-primary)]">
              ¡Pago Exitoso!
            </h2>
            <p className="mb-10 text-sm text-[var(--text-secondary)]">
              {deliveryMethod === 'PICKUP'
                ? 'Tu orden está siendo preparada. Te notificaremos cuando esté lista para recoger.'
                : 'Tu orden ha sido confirmada. Te enviaremos un correo con los detalles del envío.'}
            </p>

            <div className="mb-10 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-hover)]">
                <Package size={20} className="text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="mb-0.5 text-xs text-[var(--text-muted)]">Número de Orden</p>
                <p className="font-mono text-sm font-bold text-[var(--text-primary)]">
                  #{orderNumber}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/tienda')}
              className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-3.5 text-sm font-bold text-[var(--text-primary)] transition-all hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"
            >
              Volver a la Tienda
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
