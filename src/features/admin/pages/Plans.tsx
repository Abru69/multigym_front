import { useState, useEffect, useCallback, useMemo } from 'react'
import { getPlans, createPlan, updatePlan, deletePlan, togglePlanStatus } from '@/lib/api'
import { Plus, Trash2, MoreVertical, Edit2, ToggleLeft, ToggleRight, CreditCard } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/DropdownMenu'
import { formatCurrency } from '@/lib/utils'
import type { PlanListItemDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

export default function PlansPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [plans, setPlans] = useState<PlanListItemDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanListItemDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlanListItemDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    durationMonths: '',
    maxWorkoutsPerWeek: '',
    maxClasses: '',
    accessHours: '',
    features: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await getPlans()
      if (response?.dto?.data) {
        setPlans(response.dto.data)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
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
    if (!form.durationMonths || Number(form.durationMonths) <= 0) errors.durationMonths = 'Duración inválida'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', durationMonths: '', maxWorkoutsPerWeek: '', maxClasses: '', accessHours: '', features: '' })
    setFormErrors({})
    setSelectedPlan(null)
    setShowModal(true)
  }

  const openEdit = (plan: PlanListItemDTO) => {
    setForm({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      durationMonths: plan.durationMonths.toString(),
      maxWorkoutsPerWeek: plan.maxWorkoutsPerWeek?.toString() || '',
      maxClasses: plan.maxClasses?.toString() || '',
      accessHours: plan.accessHours || '',
      features: plan.features || '',
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
        durationMonths: parseInt(form.durationMonths),
        maxWorkoutsPerWeek: form.maxWorkoutsPerWeek ? parseInt(form.maxWorkoutsPerWeek) : undefined,
        maxClasses: form.maxClasses ? parseInt(form.maxClasses) : undefined,
        accessHours: form.accessHours || undefined,
        features: form.features || undefined,
      }
      if (selectedPlan) {
        await updatePlan(selectedPlan.id, payload)
        addToast('Plan actualizado correctamente', 'success')
      } else {
        await createPlan(payload)
        addToast('Plan creado correctamente', 'success')
      }
      setShowModal(false)
      loadPlans()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (plan: PlanListItemDTO) => {
    try {
      await togglePlanStatus(plan.id)
      setPlans(plans.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p)))
      addToast(`${plan.name} ${plan.isActive ? 'desactivado' : 'activado'}`, 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al cambiar estado', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePlan(deleteTarget.id)
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
      <AdminHeader
        title="Planes de Membresía"
        subtitle={`${plans.length} planes configurados`}
        icon={CreditCard}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Plus size={16} /> Nuevo Plan
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
          <p className="flex-1 text-sm" style={{ color: '#b91c1c' }}>{error}</p>
          <button onClick={loadPlans} className="text-sm font-semibold hover:underline" style={{ color: '#b91c1c' }}>Reintentar</button>
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar planes..." />

      {isLoading ? (
        <LoadingState text="Cargando planes..." />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-16" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          <CreditCard size={48} style={{ color: 'var(--text-muted)' }} className="mb-4" />
          <p className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>No hay planes</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Crea tu primer plan de membresía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((plan) => (
            <div
              key={plan.id}
              className="bg-[var(--card)] rounded-2xl p-5 transition-all duration-200"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{plan.name}</h3>
                  {plan.description && <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{plan.description}</p>}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu
                    trigger={
                      <button className="rounded-lg p-1.5" style={{ color: 'var(--text-muted)' }}>
                        <MoreVertical size={16} />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => openEdit(plan)}><Edit2 size={14} /> Editar</DropdownItem>
                    <DropdownItem onClick={() => handleToggleStatus(plan)}>
                      {plan.isActive ? <><ToggleLeft size={14} /> Desactivar</> : <><ToggleRight size={14} /> Activar</>}
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem danger onClick={() => setDeleteTarget(plan)}><Trash2 size={14} /> Eliminar</DropdownItem>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>
                  {formatCurrency(plan.price)}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/ {plan.durationMonths} meses</p>
              </div>

              <div className="mt-4 space-y-2">
                {plan.maxWorkoutsPerWeek && (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{plan.maxWorkoutsPerWeek} entrenamientos/semana</p>
                )}
                {plan.maxClasses && (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{plan.maxClasses} clases/mes</p>
                )}
                {plan.accessHours && (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Acceso: {plan.accessHours}</p>
                )}
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: plan.isActive ? '#f0fdf4' : '#fef2f2', color: plan.isActive ? '#16a34a' : '#dc2626' }}
                >
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedPlan ? 'Editar Plan' : 'Nuevo Plan'} size="md">
        <div className="space-y-4">
          <FormField label="Nombre" required htmlFor="plan-name" error={formErrors.name}>
            <Input id="plan-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Plan Premium" error={!!formErrors.name} />
          </FormField>
          <FormField label="Descripción" htmlFor="plan-desc">
            <Input id="plan-desc" type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opcional" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Precio" required htmlFor="plan-price" error={formErrors.price}>
              <Input id="plan-price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" error={!!formErrors.price} />
            </FormField>
            <FormField label="Duración (meses)" required htmlFor="plan-duration" error={formErrors.durationMonths}>
              <Input id="plan-duration" type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} placeholder="1" error={!!formErrors.durationMonths} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Entrenamientos/semana" htmlFor="plan-workouts">
              <Input id="plan-workouts" type="number" value={form.maxWorkoutsPerWeek} onChange={(e) => setForm({ ...form, maxWorkoutsPerWeek: e.target.value })} placeholder="Opcional" />
            </FormField>
            <FormField label="Clases/mes" htmlFor="plan-classes">
              <Input id="plan-classes" type="number" value={form.maxClasses} onChange={(e) => setForm({ ...form, maxClasses: e.target.value })} placeholder="Opcional" />
            </FormField>
          </div>
          <FormField label="Horario de acceso" htmlFor="plan-hours">
            <Input id="plan-hours" type="text" value={form.accessHours} onChange={(e) => setForm({ ...form, accessHours: e.target.value })} placeholder="Ej: 6am-10pm" />
          </FormField>
          <FormField label="Características" htmlFor="plan-features">
            <Input id="plan-features" type="text" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Ej: WiFi, Estacionamiento, Locker" />
          </FormField>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setShowModal(false)} disabled={isSaving} className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
            {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'rgba(26,58,0,0.3)', borderTopColor: 'var(--accent-text)' }} />}
            Guardar
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar plan"
        message={`¿Estás seguro de eliminar "${deleteTarget?.name || ''}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
