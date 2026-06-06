import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useCartStore } from "@/features/shop/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, Loader2, ArrowLeft, CreditCard, Lock, Package } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Card, CardContent } from "@/components/ui/Card"

export default function Checkout() {
  const { items, total, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [step, setStep] = useState<"shipping" | "payment" | "success">("shipping")
  const [loading, setLoading] = useState(false)

  const subtotal = total()
  const shipping = subtotal > 1500 ? 0 : 150
  const finalTotal = subtotal + shipping

  if (items.length === 0 && step !== "success") {
    navigate("/tienda/carrito")
    return null
  }

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate network request
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
    setStep("success")
    clearCart()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Steps Progress */}
      {step !== "success" && (
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${step === "shipping" || step === "payment" ? "bg-[var(--accent)] text-[var(--accent-text)]" : "bg-[var(--surface)] text-[var(--text-muted)]"}`}>
              1
            </div>
            <span className={`text-sm font-medium ${step === "shipping" || step === "payment" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>Envío</span>
            <div className="w-10 h-0.5 bg-[var(--border)]" />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${step === "payment" ? "bg-[var(--accent)] text-[var(--accent-text)]" : "bg-[var(--surface)] text-[var(--text-muted)]"}`}>
              2
            </div>
            <span className={`text-sm font-medium ${step === "payment" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>Pago</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "shipping" && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Dirección de Envío</h2>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep("payment") }}>
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
                <Button type="submit" className="w-full mt-6 h-12 text-base">
                  Continuar al Pago
                </Button>
              </form>
            </div>
            
            {/* Order Summary Sidebar */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl h-fit">
              <h3 className="font-bold text-lg mb-4 text-[var(--text-primary)]">Resumen</h3>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-[var(--background)] overflow-hidden shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{item.product.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Cant: {item.quantity}</p>
                    </div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Envío</span>
                  <span>{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 text-[var(--text-primary)]">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-md mx-auto"
          >
            <Button variant="ghost" onClick={() => setStep("shipping")} className="mb-6 -ml-4">
              <ArrowLeft size={16} className="mr-2" /> Volver a Envío
            </Button>
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)]">Información de Pago</h2>
            
            <form onSubmit={handleSimulatePayment} className="space-y-4">
              <div className="p-4 rounded-xl border border-[var(--accent)] bg-[rgba(204,255,0,0.05)] relative overflow-hidden mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard size={20} className="text-[var(--accent)]" />
                  <span className="font-semibold text-[var(--text-primary)]">Tarjeta de Crédito / Débito</span>
                </div>
                
                <div className="space-y-4 relative z-10">
                  <div className="space-y-1.5">
                    <Label>Número de Tarjeta</Label>
                    <Input required type="text" maxLength={19} placeholder="0000 0000 0000 0000" className="font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Vencimiento</Label>
                      <Input required type="text" maxLength={5} placeholder="MM/YY" className="font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>CVC</Label>
                      <Input required type="password" maxLength={4} placeholder="•••" className="font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-text-muted mb-6">
                <Lock size={12} />
                <span>Pago procesado de forma segura</span>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 text-base gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : `Pagar ${formatCurrency(finalTotal)}`}
              </Button>
            </form>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-10"
          >
            <div className="w-20 h-20 rounded-full bg-[rgba(0,204,136,0.1)] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-[var(--success)]" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">¡Pago Exitoso!</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              Tu orden ha sido confirmada. Te enviaremos un correo con los detalles del envío y número de rastreo.
            </p>
            <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-xl mb-8 flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded bg-[var(--background)] flex items-center justify-center text-[var(--text-muted)]">
                <Package size={20} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-0.5">Número de Orden</p>
                <p className="font-mono font-semibold text-sm text-[var(--text-primary)]">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/tienda")} className="w-full mt-8">
              Volver a la Tienda
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
