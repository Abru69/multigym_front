import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/features/shop/store/cartStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useToastStore } from '@/components/ui/Toast'
import { fetchApi } from '@/lib/api'
import type { OrderDTO, ResponseDTO } from '@/types'
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
} from 'lucide-react'

const STEPS = [
  { key: 'shipping', label: 'Envío', icon: MapPin },
  { key: 'payment', label: 'Pago', icon: CreditCard },
  { key: 'success', label: 'Confirmación', icon: CheckCircle2 },
] as const

function StepIndicator({ currentStep }: { currentStep: string }) {
  const getStepIndex = (s: string) => {
    if (s === 'shipping') return 0
    if (s === 'payment') return 1
    return 2
  }
  const idx = getStepIndex(currentStep)

  return (
    <div className="mb-12 flex items-center justify-center">
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
                className={`mx-3 mb-6 h-0.5 w-16 transition-colors duration-300 sm:w-24 ${
                  i < idx ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Checkout() {
  const { items, total, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)
  const navigate = useNavigate()
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping')
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const subtotal = total()
  const shipping = subtotal > 1500 ? 0 : 150
  const finalTotal = subtotal + shipping

  useEffect(() => {
    if (items.length === 0 && step !== 'success') {
      navigate('/tienda/carrito')
    }
  }, [items.length, step, navigate])

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!user?.id) {
        throw new Error('Debes iniciar sesión para completar la compra')
      }

      const orderRes = await fetchApi<ResponseDTO<OrderDTO>>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          paymentMethod: 'CREDIT_CARD',
          shippingAmount: shipping,
        }),
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {step !== 'success' && <StepIndicator currentStep={step} />}

      <AnimatePresence mode="wait">
        {step === 'shipping' && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-black text-[var(--text-primary)]">
                Dirección de Envío
              </h2>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  setStep('payment')
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">Nombre</label>
                    <input
                      required
                      type="text"
                      placeholder="Juan"
                      className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">Apellidos</label>
                    <input
                      required
                      type="text"
                      placeholder="Pérez"
                      className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Calle y Número</label>
                  <input
                    required
                    type="text"
                    placeholder="Av. Principal 123"
                    className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">Código Postal</label>
                    <input
                      required
                      type="text"
                      placeholder="31000"
                      className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-primary)]">Ciudad</label>
                    <input
                      required
                      type="text"
                      placeholder="Chihuahua"
                      className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-6 h-12 w-full rounded-full bg-[var(--accent)] text-sm font-bold uppercase tracking-wide text-[var(--accent-text)] shadow-md transition-all hover:shadow-lg"
                >
                  Continuar al Pago
                </button>
              </form>
            </div>

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
                  <span>Envío</span>
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
              onClick={() => setStep('shipping')}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <ArrowLeft size={16} /> Volver a Envío
            </button>

            <h2 className="mb-6 font-heading text-xl font-black text-[var(--text-primary)]">
              Información de Pago
            </h2>

            <form onSubmit={handleSimulatePayment} className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10">
                      <CreditCard size={18} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">Tarjeta de Crédito / Débito</p>
                      <p className="text-xs text-[var(--text-muted)]">Ingresa los datos de tu tarjeta</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white shadow-lg">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="h-8 w-12 rounded bg-white/20" />
                      <CreditCard size={24} className="text-white/60" />
                    </div>
                    <p className="mb-6 font-mono text-lg tracking-widest">
                      **** **** **** ****
                    </p>
                    <div className="flex justify-between text-xs">
                      <div>
                        <p className="text-white/50">TITULAR</p>
                        <p className="font-semibold">TU NOMBRE</p>
                      </div>
                      <div>
                        <p className="text-white/50">VENCE</p>
                        <p className="font-semibold">MM/AA</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-primary)]">Nombre en la Tarjeta</label>
                      <input
                        required
                        type="text"
                        placeholder="Como aparece en la tarjeta"
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm uppercase text-[var(--text-primary)] transition-all placeholder:normal-case placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-primary)]">Número de Tarjeta</label>
                      <input
                        required
                        type="text"
                        maxLength={19}
                        placeholder="0000 0000 0000 0000"
                        className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 font-mono text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--text-primary)]">Vencimiento</label>
                        <input
                          required
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 font-mono text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--text-primary)]">CVC</label>
                        <input
                          required
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 font-mono text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <Lock size={12} />
                <span>Pago procesado de forma segura</span>
              </div>

              <button
                type="submit"
                disabled={loading}
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
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200,
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
              Tu orden ha sido confirmada. Te enviaremos un correo con los detalles del envío y
              número de rastreo.
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
