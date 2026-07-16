import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getSaasPlans,
  createSaasPlan,
  updateSaasPlan,
  deleteSaasPlan,
  toggleSaasPlanStatus,
} from '@/lib/api'
import {
  Plus,
  Trash2,
  MoreVertical,
  Edit2,
  ToggleLeft,
  ToggleRight,
  CreditCard,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/DropdownMenu'
import { formatCurrency } from '@/lib/utils'
import type { SaasPlanDTO } from '@/types'
import { SearchBar } from '@/features/admin/components/SearchBar'
import { LoadingState } from '@/features/admin/components/LoadingState'
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog'
import { FormField } from '@/features/admin/components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

export default function PlatformSaaSPlansPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [plans, setPlans] = useState<SaasPlanDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SaasPlanDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SaasPlanDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    memberLimit: '',
    trialDays: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await getSaasPlans()
      if (response?.dto?.data) {
        setPlans(response.dto.data)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes SaaS')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlans()
  }, [loadPlans])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return plans.filter((p) => p.name.toLowerCase().includes(term))
  }, [plans, debouncedSearch])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.name) errors.name = 'El nombre es requerido'
    if (!form.price || Number(form.price) <= 0) errors.price = 'Precio inválido'
    if (!form.memberLimit || Number(form.memberLimit) <= 0)
      errors.memberLimit = 'Límite de miembros inválido'
    if (form.trialDays === '' || Number(form.trialDays) < 0) errors.trialDays = 'Días de trial inválidos'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', memberLimit: '', trialDays: '14' })
    setFormErrors({})
    setSelectedPlan(null)
    setShowModal(true)
  }

  const openEdit = (plan: SaasPlanDTO) => {
    setForm({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      memberLimit: plan.memberLimit.toString(),
      trialDays: plan.trialDays.toString(),
    })
    setFormErrors({})
    setSelectedPlan(plan)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        memberLimit: parseInt(form.memberLimit),
        trialDays: parseInt(form.trialDays),
      }
      if (selectedPlan) {
        await updateSaasPlan(selectedPlan.id, payload)
        addToast('Plan SaaS actualizado correctamente', 'success')
      } else {
        await createSaasPlan(payload)
        addToast('Plan SaaS creado correctamente', 'success')
      }
      setShowModal(false)
      loadPlans()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (plan: SaasPlanDTO) => {
    try {
      await toggleSaasPlanStatus(plan.id)
      setPlans(plans.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p)))
      addToast(`${plan.name} ${plan.isActive ? 'desactivado' : 'activado'}`, 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al cambiar estado', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSaasPlan(deleteTarget.id)
      setPlans(plans.filter((p) => p.id !== deleteTarget.id))
      addToast(`${deleteTarget.name} eliminado`, 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            Planes SaaS
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {plans.length} planes configurados
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          <Plus size={16} /> Nuevo Plan SaaS
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}
        >
          <p className="flex-1 text-sm" style={{ color: '#b91c1c' }}>
            {error}
          </p>
          <button
            onClick={loadPlans}
            className="text-sm font-semibold hover:underline"
            style={{ color: '#b91c1c' }}
          >
            Reintentar
          </button>
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar planes SaaS..." />

      {isLoading ? (
        <LoadingState text="Cargando planes SaaS..." />
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-16"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
        >
          <CreditCard size={48} style={{ color: 'var(--text-muted)' }} className="mb-4" />
          <p
            className="mb-1 text-lg font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            No hay planes SaaS
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Crea tu primer plan SaaS para gimnasios.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl p-5 transition-all duration-200"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {plan.description}
                    </p>
                  )}
                </div>
                <div
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <DropdownMenu
                    trigger={
                      <button className="rounded-lg p-1.5" style={{ color: 'var(--text-muted)' }}>
                        <MoreVertical size={16} />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => openEdit(plan)}>
                      <Edit2 size={14} /> Editar
                    </DropdownItem>
                    <DropdownItem onClick={() => handleToggleStatus(plan)}>
                      {plan.isActive ? (
                        <>
                          <ToggleLeft size={14} /> Desactivar
                        </>
                      ) : (
                        <>
                          <ToggleRight size={14} /> Activar
                        </>
                      )}
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem danger onClick={() => setDeleteTarget(plan)}>
                      <Trash2 size={14} /> Eliminar
                    </DropdownItem>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-4">
                <p
                  className="text-3xl font-black"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--accent)',
                  }}
                >
                  {formatCurrency(plan.price)}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  / mes
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Límite: {plan.memberLimit} miembros
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Trial: {plan.trialDays} días
                </p>
              </div>

              <div
                className="mt-4 flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: plan.isActive ? '#f0fdf4' : '#fef2f2',
                    color: plan.isActive ? '#16a34a' : '#dc2626',
                  }}
                >
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedPlan ? 'Editar Plan SaaS' : 'Nuevo Plan SaaS'}
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Nombre" required htmlFor="saas-name" error={formErrors.name}>
            <Input
              id="saas-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Plan Enterprise"
              error={!!formErrors.name}
            />
          </FormField>
          <FormField label="Descripción" htmlFor="saas-desc">
            <Input
              id="saas-desc"
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Opcional"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Precio mensual" required htmlFor="saas-price" error={formErrors.price}>
              <Input
                id="saas-price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                error={!!formErrors.price}
              />
            </FormField>
            <FormField
              label="Límite de miembros"
              required
              htmlFor="saas-limit"
              error={formErrors.memberLimit}
            >
              <Input
                id="saas-limit"
                type="number"
                value={form.memberLimit}
                onChange={(e) => setForm({ ...form, memberLimit: e.target.value })}
                placeholder="100"
                error={!!formErrors.memberLimit}
              />
            </FormField>
          </div>
          <FormField
            label="Días de trial"
            required
            htmlFor="saas-trial"
            error={formErrors.trialDays}
          >
            <Input
              id="saas-trial"
              type="number"
              value={form.trialDays}
              onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
              placeholder="14"
              error={!!formErrors.trialDays}
            />
          </FormField>
        </div>
        <div
          className="mt-6 flex justify-end gap-3 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setShowModal(false)}
            disabled={isSaving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--text-primary)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {isSaving && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                style={{
                  borderColor: 'rgba(26,58,0,0.3)',
                  borderTopColor: 'var(--accent-text)',
                }}
              />
            )}
            Guardar
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar plan SaaS"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name || ''}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
