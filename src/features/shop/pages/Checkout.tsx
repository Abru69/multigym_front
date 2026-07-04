import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/features/shop/store/cartStore'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2, Loader2, ArrowLeft, CreditCard, Lock, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'

export default function Checkout() {
  const { items, total, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping')
  const [loading, setLoading] = useState(false)

  const subtotal = total()
  const shipping = subtotal > 1500 ? 0 : 150
  const finalTotal = subtotal + shipping

  if (items.length === 0 && step !== 'success') {
    navigate('/tienda/carrito')
    return null
  }

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate network request
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
    setStep('success')
    clearCart()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Steps Progress */}
      {step !== 'success' && (
        <div className="mb-10 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step === 'shipping' || step === 'payment' ? 'bg-[var(--accent)] text-white' : 'bg-white/[0.06] text-[var(--text-muted)]'}`}
            >
              1
            </div>
            <span
              className={`text-sm font-medium ${step === 'shipping' || step === 'payment' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
            >
              Envío
            </span>
            <div className="h-0.5 w-10 bg-white/[0.08]" />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step === 'payment' ? 'bg-[var(--accent)] text-white' : 'bg-white/[0.06] text-[var(--text-muted)]'}`}
            >
              2
            </div>
            <span
              className={`text-sm font-medium ${step === 'payment' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
            >
              Pago
            </span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'shipping' && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Dirección de Envío</h2>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  setStep('payment')
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Nombre</Label>
                    <Input required type="text" placeholder="Juan" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Apellidos</Label>
                    <Input required type="text" placeholder="Pérez" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Calle y Número</Label>
                  <Input required type="text" placeholder="Av. Principal 123" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Código Postal</Label>
                    <Input required type="text" placeholder="31000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ciudad</Label>
                    <Input required type="text" placeholder="Chihuahua" />
                  </div>
                </div>
                <Button type="submit" className="mt-6 h-12 w-full text-base">
                  Continuar al Pago
                </Button>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="h-fit rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">Resumen</h3>
              <div className="scrollbar-hide mb-6 max-h-60 space-y-3 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-white/[0.04]">
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
              <div className="space-y-2 border-t border-white/[0.06] pt-4 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between pt-2 text-lg font-bold text-[var(--text-primary)]">
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mx-auto max-w-md"
          >
            <Button variant="ghost" onClick={() => setStep('shipping')} className="mb-6 -ml-4">
              <ArrowLeft size={16} className="mr-2" /> Volver a Envío
            </Button>
            <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">
              Información de Pago
            </h2>

            <form onSubmit={handleSimulatePayment} className="space-y-4">
              <div className="relative mb-6 overflow-hidden rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <CreditCard size={20} className="text-[var(--accent)]" />
                  <span className="font-semibold text-[var(--text-primary)]">
                    Tarjeta de Crédito / Débito
                  </span>
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="space-y-1.5">
                    <Label>Número de Tarjeta</Label>
                    <Input
                      required
                      type="text"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Vencimiento</Label>
                      <Input
                        required
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>CVC</Label>
                      <Input
                        required
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <Lock size={12} />
                <span>Pago procesado de forma segura</span>
              </div>

              <Button type="submit" disabled={loading} className="h-12 w-full gap-2 text-base">
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  `Pagar ${formatCurrency(finalTotal)}`
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md py-10 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/10 backdrop-blur">
              <CheckCircle2 size={40} className="text-[var(--success)]" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">¡Pago Exitoso!</h2>
            <p className="mb-8 text-sm text-[var(--text-secondary)]">
              Tu orden ha sido confirmada. Te enviaremos un correo con los detalles del envío y
              número de rastreo.
            </p>
            <div className="mb-8 flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-left backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-white/[0.04] text-[var(--text-muted)]">
                <Package size={20} />
              </div>
              <div>
                <p className="mb-0.5 text-xs text-[var(--text-muted)]">Número de Orden</p>
                <p className="font-mono text-sm font-semibold text-[var(--text-primary)]">
                  #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/tienda')} className="mt-8 w-full">
              Volver a la Tienda
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
