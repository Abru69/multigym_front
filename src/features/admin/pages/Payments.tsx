import { useState, useEffect, useCallback, useMemo } from 'react'
import { getPayments, createPayment } from '@/lib/api'
import { Plus, DollarSign } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'
import type { PaymentListItemDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

export default function PaymentsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [payments, setPayments] = useState<PaymentListItemDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ subscriptionId: '', amount: '', paymentMethod: 'EFECTIVO', reference: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await getPayments()
      if (response?.dto?.data) {
        setPayments(response.dto.data)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar pagos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return payments.filter((p) => {
      return (
        p.paymentMethod.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term) ||
        (p.reference || '').toLowerCase().includes(term)
      )
    })
  }, [payments, debouncedSearch])

  const totalAmount = useMemo(() => payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0), [payments])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.subscriptionId) errors.subscriptionId = 'ID de suscripción requerido'
    if (!form.amount || Number(form.amount) <= 0) errors.amount = 'Monto inválido'
    if (!form.paymentMethod) errors.paymentMethod = 'Método de pago requerido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      await createPayment({
        subscriptionId: form.subscriptionId,
        amount: parseFloat(form.amount),
        paymentMethod: form.paymentMethod,
        reference: form.reference || undefined,
      })
      addToast('Pago registrado correctamente', 'success')
      setShowModal(false)
      loadPayments()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al registrar pago', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { bg: '#f0fdf4', color: '#16a34a' }
      case 'PENDING': return { bg: '#fefce8', color: '#ca8a04' }
      case 'FAILED': return { bg: '#fef2f2', color: '#dc2626' }
      case 'REFUNDED': return { bg: '#eff6ff', color: '#2563eb' }
      default: return { bg: '#f1f5f9', color: '#64748b' }
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    catch { return d }
  }

  const methodLabel = (m: string) => {
    switch (m) {
      case 'EFECTIVO': return 'Efectivo'
      case 'TARJETA_CREDITO': return 'Tarjeta Crédito'
      case 'TARJETA_DEBITO': return 'Tarjeta Débito'
      case 'TRANSFERENCIA': return 'Transferencia'
      default: return m
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      <AdminHeader
        title="Pagos"
        subtitle={`${payments.length} pagos registrados — Total: ${formatCurrency(totalAmount)}`}
        icon={DollarSign}
        action={
          <button
            onClick={() => { setForm({ subscriptionId: '', amount: '', paymentMethod: 'EFECTIVO', reference: '' }); setFormErrors({}); setShowModal(true) }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Plus size={16} /> Registrar Pago
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
          <p className="flex-1 text-sm" style={{ color: '#b91c1c' }}>{error}</p>
          <button onClick={loadPayments} className="text-sm font-semibold hover:underline" style={{ color: '#b91c1c' }}>Reintentar</button>
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por método, estado o referencia..." />

      {isLoading ? (
        <LoadingState text="Cargando pagos..." />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-16" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          <DollarSign size={48} style={{ color: 'var(--text-muted)' }} className="mb-4" />
          <p className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>No hay pagos</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Los pagos registrados aparecerán aquí.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['Monto', 'Método', 'Estado', 'Referencia', 'Fecha', 'ID Suscripción'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pay) => {
                const sc = statusColor(pay.status)
                return (
                  <tr key={pay.id} className="border-b transition-colors duration-150" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-5 py-3.5 font-bold" style={{ color: 'var(--accent)' }}>{formatCurrency(pay.amount)}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-primary)' }}>{methodLabel(pay.paymentMethod)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: sc.bg, color: sc.color }}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{pay.reference || '—'}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{formatDate(pay.paymentDate)}</td>
                    <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{pay.subscriptionId.slice(0, 8)}...</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Registrar Pago" size="md">
        <div className="space-y-4">
          <FormField label="ID de Suscripción" required htmlFor="pay-sub" error={formErrors.subscriptionId}>
            <Input id="pay-sub" type="text" value={form.subscriptionId} onChange={(e) => setForm({ ...form, subscriptionId: e.target.value })} placeholder="UUID de la suscripción" error={!!formErrors.subscriptionId} />
          </FormField>
          <FormField label="Monto" required htmlFor="pay-amount" error={formErrors.amount}>
            <Input id="pay-amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" error={!!formErrors.amount} />
          </FormField>
          <FormField label="Método de Pago" required htmlFor="pay-method">
            <select
              id="pay-method"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="flex h-11 w-full appearance-none rounded-xl px-4 py-2 text-sm transition-all duration-200 focus:ring-2 focus:outline-none"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
              <option value="TARJETA_DEBITO">Tarjeta Débito</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </FormField>
          <FormField label="Referencia" htmlFor="pay-ref">
            <Input id="pay-ref" type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Opcional" />
          </FormField>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setShowModal(false)} disabled={isSaving} className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}>
            Cancelar
          </button>
          <button onClick={handleCreate} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
            {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'rgba(26,58,0,0.3)', borderTopColor: 'var(--accent-text)' }} />}
            Registrar
          </button>
        </div>
      </Modal>
    </div>
  )
}
