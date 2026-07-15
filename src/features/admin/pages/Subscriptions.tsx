import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getSubscriptions,
  createSubscription,
  cancelSubscription,
  updateSubscription,
  changeSubscriptionPlan,
  deleteSubscription,
  getClientUsers,
  getPlans,
} from '@/lib/api'
import { Plus, XCircle, Calendar, Edit2, Trash2, RefreshCw } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToastStore } from '@/components/ui/Toast'
import type { SubscriptionListItemDTO, MemberListItemDTO, PlanListItemDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

export default function SubscriptionsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [subscriptions, setSubscriptions] = useState<SubscriptionListItemDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal] = useState(false)
  const [editingSub, setEditingSub] = useState<SubscriptionListItemDTO | null>(null)
  const [cancelTarget, setCancelTarget] = useState<SubscriptionListItemDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionListItemDTO | null>(null)
  const [planChangeTarget, setPlanChangeTarget] = useState<SubscriptionListItemDTO | null>(null)
  const [newPlanId, setNewPlanId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ memberId: '', planId: '', startDate: '', endDate: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [members, setMembers] = useState<MemberListItemDTO[]>([])
  const [plans, setPlans] = useState<PlanListItemDTO[]>([])

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await getSubscriptions()
      if (response?.dto?.data) {
        setSubscriptions(response.dto.data)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar suscripciones')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    getClientUsers().then((res) => {
      if (res?.dto?.data) {
        setMembers(
          res.dto.data
            .filter((u) => u.memberDTO)
            .map((u) => ({
              id: u.memberDTO!.id,
              name: u.memberDTO!.name,
              phone: u.memberDTO!.phone,
              email: u.email,
              isActive: u.isActive,
            }))
        )
      }
    }).catch(() => {})
    getPlans().then((res) => {
      if (res?.dto?.data) setPlans(res.dto.data)
    }).catch(() => {})
  }, [loadData])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return subscriptions.filter((s) => {
      const memberName = s.member?.name || ''
      return memberName.toLowerCase().includes(term) || s.status.toLowerCase().includes(term)
    })
  }, [subscriptions, debouncedSearch])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.memberId) errors.memberId = 'Selecciona un miembro'
    if (!form.planId) errors.planId = 'Selecciona un plan'
    if (!form.startDate) errors.startDate = 'Fecha de inicio requerida'
    if (!form.endDate) errors.endDate = 'Fecha de fin requerida'
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      errors.endDate = 'La fecha de fin debe ser posterior a la de inicio'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      await createSubscription({
        memberId: form.memberId,
        planId: form.planId,
        startDate: form.startDate,
        endDate: form.endDate,
      })
      addToast('Suscripción creada correctamente', 'success')
      setShowModal(false)
      loadData()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al crear', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      await cancelSubscription(cancelTarget.id)
      setSubscriptions(
        subscriptions.map((s) => (s.id === cancelTarget.id ? { ...s, status: 'CANCELLED' } : s))
      )
      addToast('Suscripción cancelada', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al cancelar', 'error')
    } finally {
      setCancelTarget(null)
    }
  }

  const handleEdit = async () => {
    if (!editingSub || !validateForm()) return
    setIsSaving(true)
    try {
      await updateSubscription(editingSub.id, {
        memberId: form.memberId,
        planId: form.planId,
        startDate: form.startDate,
        endDate: form.endDate,
      })
      addToast('Suscripción actualizada', 'success')
      setShowModal(false)
      setEditingSub(null)
      loadData()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al actualizar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePlanChange = async () => {
    if (!planChangeTarget || !newPlanId) return
    setIsSaving(true)
    try {
      await changeSubscriptionPlan(planChangeTarget.id, { planId: newPlanId })
      addToast('Plan cambiado correctamente', 'success')
      setPlanChangeTarget(null)
      setNewPlanId('')
      loadData()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al cambiar plan', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSubscription(deleteTarget.id)
      setSubscriptions(subscriptions.filter((s) => s.id !== deleteTarget.id))
      addToast('Suscripción eliminada', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const openEditModal = (sub: SubscriptionListItemDTO) => {
    setEditingSub(sub)
    setForm({
      memberId: sub.member?.id || '',
      planId: sub.plan?.id || '',
      startDate: sub.startDate?.slice(0, 10) || '',
      endDate: sub.endDate?.slice(0, 10) || '',
    })
    setFormErrors({})
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingSub(null)
    setForm({ memberId: '', planId: '', startDate: '', endDate: '' })
    setFormErrors({})
    setShowModal(true)
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#f0fdf4', color: '#16a34a' }
      case 'EXPIRED': return { bg: '#fef2f2', color: '#dc2626' }
      case 'CANCELLED': return { bg: '#fefce8', color: '#ca8a04' }
      default: return { bg: '#f1f5f9', color: '#64748b' }
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) }
    catch { return d }
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      <AdminHeader
        title="Suscripciones"
        subtitle={`${subscriptions.length} suscripciones`}
        icon={Calendar}
        action={
          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Plus size={16} /> Nueva Suscripción
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
          <p className="flex-1 text-sm" style={{ color: '#b91c1c' }}>{error}</p>
          <button onClick={loadData} className="text-sm font-semibold hover:underline" style={{ color: '#b91c1c' }}>Reintentar</button>
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por miembro o estado..." />

      {isLoading ? (
        <LoadingState text="Cargando suscripciones..." />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-16" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          <Calendar size={48} style={{ color: 'var(--text-muted)' }} className="mb-4" />
          <p className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>No hay suscripciones</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Crea la primera suscripción para un miembro.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['Miembro', 'Plan', 'Inicio', 'Fin', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => {
                const sc = statusColor(sub.status)
                return (
                  <tr key={sub.id} className="border-b transition-colors duration-150" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{sub.member?.name || 'N/A'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub.member?.email || ''}</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text-primary)' }}>{sub.plan?.name || 'N/A'}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{formatDate(sub.startDate)}</td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{formatDate(sub.endDate)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: sc.bg, color: sc.color }}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {sub.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => openEditModal(sub)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                              style={{ color: 'var(--accent)' }}
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => { setPlanChangeTarget(sub); setNewPlanId(sub.plan?.id || '') }}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                              style={{ color: '#2563eb' }}
                              title="Cambiar plan"
                            >
                              <RefreshCw size={14} />
                            </button>
                            <button
                              onClick={() => setCancelTarget(sub)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                              style={{ color: '#dc2626' }}
                              title="Cancelar"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteTarget(sub)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                          style={{ color: '#9ca3af' }}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingSub(null) }} title={editingSub ? 'Editar Suscripción' : 'Nueva Suscripción'} size="md">
        <div className="space-y-4">
          <FormField label="Miembro" required htmlFor="sub-member" error={formErrors.memberId}>
            <Select
              id="sub-member"
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              options={members.map((m) => ({ value: m.id, label: m.name || m.email }))}
              placeholder="Selecciona un miembro"
              error={!!formErrors.memberId}
            />
          </FormField>
          <FormField label="Plan" required htmlFor="sub-plan" error={formErrors.planId}>
            <Select
              id="sub-plan"
              value={form.planId}
              onChange={(e) => setForm({ ...form, planId: e.target.value })}
              options={plans.map((p) => ({ value: p.id, label: `${p.name} — $${p.price}` }))}
              placeholder="Selecciona un plan"
              error={!!formErrors.planId}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fecha de Inicio" required htmlFor="sub-start" error={formErrors.startDate}>
              <Input id="sub-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} error={!!formErrors.startDate} />
            </FormField>
            <FormField label="Fecha de Fin" required htmlFor="sub-end" error={formErrors.endDate}>
              <Input id="sub-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} error={!!formErrors.endDate} />
            </FormField>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { setShowModal(false); setEditingSub(null) }} disabled={isSaving} className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}>
            Cancelar
          </button>
          <button onClick={editingSub ? handleEdit : handleCreate} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
            {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'rgba(26,58,0,0.3)', borderTopColor: 'var(--accent-text)' }} />}
            {editingSub ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancelar suscripción"
        message={`¿Cancelar la suscripción de ${cancelTarget?.member?.name || ''}? El plan ${cancelTarget?.plan?.name || ''} dejará de estar activo.`}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar suscripción"
        message={`¿Eliminar permanentemente la suscripción de ${deleteTarget?.member?.name || ''}? Esta acción no se puede deshacer.`}
      />

      <Modal isOpen={!!planChangeTarget} onClose={() => { setPlanChangeTarget(null); setNewPlanId('') }} title="Cambiar Plan" size="sm">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Cambiar el plan de <strong>{planChangeTarget?.member?.name || ''}</strong> de <strong>{planChangeTarget?.plan?.name || ''}</strong> a:
          </p>
          <FormField label="Nuevo Plan" required htmlFor="plan-change-id">
            <Select
              id="plan-change-id"
              value={newPlanId}
              onChange={(e) => setNewPlanId(e.target.value)}
              options={plans.map((p) => ({ value: p.id, label: `${p.name} — $${p.price}` }))}
              placeholder="Selecciona un plan"
            />
          </FormField>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { setPlanChangeTarget(null); setNewPlanId('') }} disabled={isSaving} className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}>
            Cancelar
          </button>
          <button onClick={handlePlanChange} disabled={isSaving || !newPlanId} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
            {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'rgba(26,58,0,0.3)', borderTopColor: 'var(--accent-text)' }} />}
            Cambiar Plan
          </button>
        </div>
      </Modal>
    </div>
  )
}
