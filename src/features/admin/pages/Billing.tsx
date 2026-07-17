import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { CreditCard, Loader2, ReceiptText, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import {
  getTenantBillingPayments,
  getTenantBillingRenewalInfo,
  processTenantBillingRenewalMercadoPagoPayment,
} from '@/lib/api'
import { getMercadoPago } from '@/lib/mercadopago'
import { formatCurrency } from '@/lib/utils'
import type { TenantPaymentDTO, TenantRenewalInfoDTO } from '@/types'
import { useAuthStore } from '@/features/auth/store/authStore'
import { LoadingState } from '../components/LoadingState'

const isMercadoPagoTestMode = import.meta.env.VITE_MP_PUBLIC_KEY?.startsWith('TEST-')

export default function Billing() {
  const addToast = useToastStore((s) => s.addToast)
  const { user } = useAuthStore()
  const [renewalInfo, setRenewalInfo] = useState<TenantRenewalInfoDTO | null>(null)
  const [payments, setPayments] = useState<TenantPaymentDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const [mpReady, setMpReady] = useState(false)
  const [cardholderName, setCardholderName] = useState(isMercadoPagoTestMode ? 'APRO' : '')
  const [cardNumber, setCardNumber] = useState(isMercadoPagoTestMode ? '4075 5957 1648 3764' : '')
  const [cardExpiry, setCardExpiry] = useState(isMercadoPagoTestMode ? '11/30' : '')
  const [cardCvc, setCardCvc] = useState(isMercadoPagoTestMode ? '123' : '')
  const [payerEmail, setPayerEmail] = useState(user?.email || '')

  useEffect(() => {
    loadBilling()
  }, [])

  useEffect(() => {
    try {
      getMercadoPago()
      setMpReady(true)
    } catch (err) {
      setMpReady(false)
      addToast(err instanceof Error ? err.message : 'Mercado Pago no está configurado', 'warning')
    }
  }, [addToast])

  useEffect(() => {
    if (user?.email && !payerEmail) {
      setPayerEmail(user.email)
    }
  }, [user?.email, payerEmail])

  const loadBilling = async () => {
    setIsLoading(true)
    try {
      const [infoRes, paymentsRes] = await Promise.all([
        getTenantBillingRenewalInfo(),
        getTenantBillingPayments(),
      ])
      setRenewalInfo(infoRes.dto || null)
      setPayments(paymentsRes.lista || paymentsRes.dto || [])
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al cargar facturación', 'error')
    } finally {
      setIsLoading(false)
    }
  }

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

  const payRenewal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!renewalInfo?.canRenew) return

    setIsPaying(true)
    try {
      const cardDigits = cardNumber.replace(/\D/g, '')
      const [expirationMonth, expirationYearShort] = cardExpiry.split('/')
      if (cardDigits.length < 13) throw new Error('Ingresa un número de tarjeta válido')
      if (!expirationMonth || !expirationYearShort) throw new Error('Ingresa el vencimiento en formato MM/YY')
      if (!cardCvc.trim()) throw new Error('Ingresa el CVC')
      if (!cardholderName.trim()) throw new Error('Ingresa el nombre del titular')
      if (!payerEmail.trim()) throw new Error('Ingresa el email del pagador')

      const expirationYear = expirationYearShort.length === 2 ? `20${expirationYearShort}` : expirationYearShort
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp: any = getMercadoPago()
      const tokenResponse = await mp.createCardToken({
        cardNumber: cardDigits,
        cardholderName: cardholderName.trim(),
        cardExpirationMonth: expirationMonth,
        cardExpirationYear: expirationYear,
        securityCode: cardCvc.trim(),
        identificationType: 'RFC',
        identificationNumber: 'CACX7605101P8',
      })
      const cardToken = tokenResponse?.id || tokenResponse?.token
      if (!cardToken) {
        throw new Error('No se pudo tokenizar la tarjeta. Verifica los datos e intenta de nuevo.')
      }

      const response = await processTenantBillingRenewalMercadoPagoPayment({
        cardToken,
        paymentMethodId: getPaymentMethodId(cardDigits),
        issuerId: null,
        installments: 1,
        payerEmail: payerEmail.trim(),
      })

      if (response.dto?.payment.status === 'COMPLETED') {
        addToast('Suscripción renovada correctamente', 'success')
      } else {
        addToast(`Pago registrado con estado ${response.dto?.payment.status || 'pendiente'}`, 'warning')
      }
      await loadBilling()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al procesar la renovación', 'error')
    } finally {
      setIsPaying(false)
    }
  }

  if (isLoading) return <LoadingState text="Cargando facturación..." />

  const canPay = Boolean(renewalInfo?.canRenew && mpReady && !isPaying)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Facturación</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Administra la suscripción SaaS de tu gimnasio y renueva con Mercado Pago.
          </p>
        </div>
        <Button variant="outline" onClick={loadBilling} disabled={isLoading || isPaying}>
          Actualizar
        </Button>
      </div>

      {renewalInfo && (
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Suscripción SaaS</p>
                <h2 className="mt-1 text-xl font-black text-[var(--text-primary)]">{renewalInfo.name}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{renewalInfo.planName}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard label="Estado" value={renewalInfo.status} />
              <InfoCard label="Precio mensual" value={`${formatCurrency(renewalInfo.price)} ${renewalInfo.currency}`} />
              <InfoCard label="Fin de prueba" value={formatDateTime(renewalInfo.trialEndsAt)} />
              <InfoCard label="Fin de suscripción" value={formatDateTime(renewalInfo.subscriptionEndsAt)} />
            </div>

            <div className={`mt-5 rounded-2xl border p-4 ${renewalInfo.canRenew ? 'border-[var(--success)]/40 bg-[var(--success)]/10' : 'border-[var(--warning)]/40 bg-[var(--warning)]/10'}`}>
              <div className="flex gap-3">
                {renewalInfo.canRenew ? (
                  <CheckCircle2 className="mt-0.5 text-[var(--success)]" size={20} />
                ) : (
                  <AlertTriangle className="mt-0.5 text-[var(--warning)]" size={20} />
                )}
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {renewalInfo.canRenew ? 'Renovación disponible' : 'Renovación no disponible'}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{renewalInfo.renewalReason}</p>
                </div>
              </div>
            </div>

            {isMercadoPagoTestMode && (
              <div className="mt-5 rounded-2xl border border-[var(--info)]/40 bg-[var(--info)]/10 p-4 text-sm text-[var(--text-secondary)]">
                Modo sandbox: usa APRO, Visa 4075 5957 1648 3764, CVV 123, vencimiento 11/30.
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-text)]">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-black text-[var(--text-primary)]">Pago con Mercado Pago</h3>
                <p className="text-xs text-[var(--text-muted)]">Cargo único para renovar 1 mes</p>
              </div>
            </div>

            <form onSubmit={payRenewal} className="space-y-4">
              <Field label="Email pagador">
                <Input type="email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} disabled={!renewalInfo.canRenew || isPaying} />
              </Field>
              <Field label="Nombre del titular">
                <Input value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} disabled={!renewalInfo.canRenew || isPaying} />
              </Field>
              <Field label="Número de tarjeta">
                <Input inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} disabled={!renewalInfo.canRenew || isPaying} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Vencimiento">
                  <Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} disabled={!renewalInfo.canRenew || isPaying} />
                </Field>
                <Field label="CVC">
                  <Input inputMode="numeric" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} disabled={!renewalInfo.canRenew || isPaying} />
                </Field>
              </div>

              <Button type="submit" disabled={!canPay} className="w-full gap-2">
                {isPaying ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                {isPaying ? 'Procesando...' : `Renovar por ${formatCurrency(renewalInfo.price)}`}
              </Button>
            </form>
          </section>
        </div>
      )}

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-5 flex items-center gap-3">
          <ReceiptText className="text-[var(--accent)]" size={22} />
          <h3 className="font-black text-[var(--text-primary)]">Historial de pagos</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <th className="py-3 pr-4">Fecha</th>
                <th className="py-3 pr-4">Plan</th>
                <th className="py-3 pr-4">Monto</th>
                <th className="py-3 pr-4">Estado</th>
                <th className="py-3 pr-4">Proveedor</th>
                <th className="py-3 pr-4">Referencia</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[var(--text-muted)]">Sin pagos registrados</td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-3 pr-4 text-[var(--text-secondary)]">{formatDateTime(payment.paidAt || payment.createdAt)}</td>
                    <td className="py-3 pr-4 font-semibold text-[var(--text-primary)]">{payment.planName}</td>
                    <td className="py-3 pr-4 text-[var(--text-primary)]">{formatCurrency(payment.amount)} {payment.currency}</td>
                    <td className="py-3 pr-4"><StatusBadge status={payment.status} /></td>
                    <td className="py-3 pr-4 text-[var(--text-secondary)]">{payment.paymentProvider}</td>
                    <td className="max-w-[220px] truncate py-3 pr-4 text-[var(--text-muted)]">{payment.paymentReference || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isOk = status === 'COMPLETED'
  const isPending = status === 'PENDING' || status === 'AUTHORIZED'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${isOk ? 'bg-[var(--success)]/15 text-[var(--success)]' : isPending ? 'bg-[var(--warning)]/15 text-[var(--warning)]' : 'bg-[var(--danger)]/15 text-[var(--danger)]'}`}>
      {status}
    </span>
  )
}

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
