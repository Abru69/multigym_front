import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getNutritionPlans,
  createNutritionPlan,
  updateNutritionPlan,
  deleteNutritionPlan,
  getClientUsers,
} from '@/lib/api'
import { Plus, Utensils, Edit2, Trash2, Clock, Flame, User } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import type { NutritionPlanDTO, NutritionPlanRequest, MemberListItemDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

interface MealForm {
  name: string
  time: string
  foods: Array<{ name: string; quantity: string; calories: number; protein: number; carbs: number; fats: number }>
}

const EMPTY_MEAL: MealForm = { name: '', time: '', foods: [] }

const EMPTY_FORM: NutritionPlanRequest = {
  memberId: '',
  name: '',
  targetCalories: 2000,
  targetProtein: 150,
  targetCarbs: 200,
  targetFats: 70,
  meals: [],
  notes: '',
}

export default function NutritionPlansPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [plans, setPlans] = useState<NutritionPlanDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<NutritionPlanDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NutritionPlanDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<NutritionPlanRequest>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [members, setMembers] = useState<MemberListItemDTO[]>([])
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null)
  const [mealForm, setMealForm] = useState<MealForm>(EMPTY_MEAL)
  const [showMealModal, setShowMealModal] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await getNutritionPlans()
      if (response?.dto?.data) {
        setPlans(response.dto.data)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes nutricionales')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
    getClientUsers()
      .then((res) => {
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
      })
      .catch(() => {})
  }, [loadData])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.memberName || '').toLowerCase().includes(term)
    )
  }, [plans, debouncedSearch])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.memberId) errors.memberId = 'Selecciona un miembro'
    if (!form.name.trim()) errors.name = 'Nombre del plan requerido'
    if (form.targetCalories <= 0) errors.targetCalories = 'Calorías deben ser mayores a 0'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openCreateModal = () => {
    setEditingPlan(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowModal(true)
  }

  const openEditModal = (plan: NutritionPlanDTO) => {
    setEditingPlan(plan)
    setForm({
      memberId: plan.memberId,
      name: plan.name,
      targetCalories: plan.targetCalories,
      targetProtein: plan.targetProtein,
      targetCarbs: plan.targetCarbs,
      targetFats: plan.targetFats,
      meals: plan.meals.map((m) => ({
        name: m.name,
        time: m.time,
        foods: m.foods.map((f) => ({
          name: f.name,
          quantity: f.quantity,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fats: f.fats,
        })),
      })),
      notes: plan.notes,
    })
    setFormErrors({})
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      if (editingPlan) {
        await updateNutritionPlan(editingPlan.id, form)
        addToast('Plan actualizado correctamente', 'success')
      } else {
        await createNutritionPlan(form)
        addToast('Plan creado correctamente', 'success')
      }
      setShowModal(false)
      loadData()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteNutritionPlan(deleteTarget.id)
      setPlans(plans.filter((p) => p.id !== deleteTarget.id))
      addToast('Plan eliminado', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const openAddMeal = () => {
    setEditingMealIndex(null)
    setMealForm(EMPTY_MEAL)
    setShowMealModal(true)
  }

  const openEditMeal = (index: number) => {
    setEditingMealIndex(index)
    setMealForm({ ...form.meals[index] })
    setShowMealModal(true)
  }

  const handleSaveMeal = () => {
    if (!mealForm.name.trim()) {
      addToast('Nombre de la comida requerido', 'error')
      return
    }
    if (mealForm.foods.some((f) => !f.name.trim())) {
      addToast('Todos los alimentos deben tener nombre', 'error')
      return
    }
    const updatedMeals = [...form.meals]
    if (editingMealIndex !== null) {
      updatedMeals[editingMealIndex] = mealForm
    } else {
      updatedMeals.push(mealForm)
    }
    setForm({ ...form, meals: updatedMeals })
    setShowMealModal(false)
  }

  const handleRemoveMeal = (index: number) => {
    setForm({ ...form, meals: form.meals.filter((_, i) => i !== index) })
  }

  const addFoodToMeal = () => {
    setMealForm({
      ...mealForm,
      foods: [...mealForm.foods, { name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0 }],
    })
  }

  const updateFood = (index: number, field: string, value: string | number) => {
    const updated = [...mealForm.foods]
    const item = { ...updated[index] }
    ;(item as Record<string, unknown>)[field] = value
    updated[index] = item as typeof updated[number]
    setMealForm({ ...mealForm, foods: updated })
  }

  const removeFood = (index: number) => {
    setMealForm({ ...mealForm, foods: mealForm.foods.filter((_, i) => i !== index) })
  }

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    return member?.name || memberId
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Planes Nutricionales"
        subtitle="Gestiona los planes de nutrición de tus clientes"
        icon={Utensils}
        action={
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]">
            <Plus size={16} />
            Nuevo Plan
          </button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
          <button onClick={loadData} className="ml-3 font-bold underline">
            Reintentar
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre o miembro..." />
        </div>
        <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
          {filtered.length} plan{filtered.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {isLoading ? (
        <LoadingState text="Cargando planes..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No hay planes nutricionales"
          description="Crea el primer plan nutricional para tus clientes"
          action={
            <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-text)]">
              <Plus size={16} />
              Crear Plan
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((plan) => (
            <div
              key={plan.id}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--accent)]/30"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{plan.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <User size={12} />
                    {plan.memberName || getMemberName(plan.memberId)}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--accent)]"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(plan)}
                    className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-4 gap-2">
                {[
                  { label: 'Kcal', value: plan.targetCalories, color: 'var(--accent)' },
                  { label: 'Prot', value: `${plan.targetProtein}g`, color: 'var(--success, #22c55e)' },
                  { label: 'Carbs', value: `${plan.targetCarbs}g`, color: 'var(--info, #3b82f6)' },
                  { label: 'Grasas', value: `${plan.targetFats}g`, color: 'var(--warning, #f59e0b)' },
                ].map((macro) => (
                  <div key={macro.label} className="rounded-lg bg-[var(--surface)] p-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {macro.label}
                    </p>
                    <p className="text-sm font-black" style={{ color: macro.color }}>
                      {macro.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1">
                  <Utensils size={12} />
                  {plan.meals.length} comida{plan.meals.length !== 1 ? 's' : ''}
                </div>
                {plan.notes && (
                  <div className="flex items-center gap-1">
                    <Flame size={12} />
                    <span className="truncate max-w-[100px]">{plan.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Plan Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPlan ? 'Editar Plan Nutricional' : 'Nuevo Plan Nutricional'}
        size="lg"
      >
        <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-2">
          <FormField label="Miembro" required error={formErrors.memberId}>
            <select
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="">Seleccionar miembro...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.email}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Nombre del Plan" required error={formErrors.name}>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Volumen Limpio"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Calorías Diarias" required error={formErrors.targetCalories}>
              <Input
                type="number"
                value={form.targetCalories}
                onChange={(e) => setForm({ ...form, targetCalories: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Proteína (g)">
              <Input
                type="number"
                value={form.targetProtein}
                onChange={(e) => setForm({ ...form, targetProtein: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Carbohidratos (g)">
              <Input
                type="number"
                value={form.targetCarbs}
                onChange={(e) => setForm({ ...form, targetCarbs: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Grasas (g)">
              <Input
                type="number"
                value={form.targetFats}
                onChange={(e) => setForm({ ...form, targetFats: Number(e.target.value) })}
              />
            </FormField>
          </div>

          <FormField label="Notas del Coach">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              placeholder="Instrucciones adicionales para el cliente..."
            />
          </FormField>

          {/* Meals Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Comidas ({form.meals.length})
              </h4>
              <button
                type="button"
                onClick={openAddMeal}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/20"
              >
                <Plus size={12} />
                Agregar Comida
              </button>
            </div>

            {form.meals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
                No hay comidas agregadas. Haz clic en "Agregar Comida" para comenzar.
              </div>
            ) : (
              <div className="space-y-2">
                {form.meals.map((meal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{meal.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {meal.time} — {meal.foods.length} alimento{meal.foods.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditMeal(index)}
                        className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--accent)]"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveMeal(index)}
                        className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button
            onClick={() => setShowModal(false)}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--surface)]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-[var(--accent-text)] hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : editingPlan ? 'Actualizar' : 'Crear Plan'}
          </button>
        </div>
      </Modal>

      {/* Meal Modal */}
      <Modal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        title={editingMealIndex !== null ? 'Editar Comida' : 'Agregar Comida'}
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Nombre" required>
            <select
              value={mealForm.name}
              onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="">Seleccionar...</option>
              <option value="Desayuno">Desayuno</option>
              <option value="Snack AM">Snack AM</option>
              <option value="Comida">Comida</option>
              <option value="Snack PM">Snack PM</option>
              <option value="Cena">Cena</option>
              <option value="Pre-entreno">Pre-entreno</option>
              <option value="Post-entreno">Post-entreno</option>
            </select>
          </FormField>
          <FormField label="Hora">
            <Input
              type="time"
              value={mealForm.time}
              onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
            />
          </FormField>

          {/* Foods */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Alimentos
              </h4>
              <button
                type="button"
                onClick={addFoodToMeal}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface)] px-2 py-1 text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--card)]"
              >
                <Plus size={10} />
                Agregar
              </button>
            </div>

            {mealForm.foods.length === 0 ? (
              <p className="text-center text-xs text-[var(--text-muted)]">Sin alimentos</p>
            ) : (
              <div className="space-y-2">
                {mealForm.foods.map((food, fi) => (
                  <div key={fi} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">
                        Alimento {fi + 1}
                      </span>
                      <button
                        onClick={() => removeFood(fi)}
                        className="text-[10px] text-red-400 hover:text-red-300"
                      >
                        Quitar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        value={food.name}
                        onChange={(e) => updateFood(fi, 'name', e.target.value)}
                        placeholder="Nombre"
                        className="col-span-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      <input
                        value={food.quantity}
                        onChange={(e) => updateFood(fi, 'quantity', e.target.value)}
                        placeholder="Ej: 100g, 2 tazas"
                        className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      <input
                        type="number"
                        value={food.calories || ''}
                        onChange={(e) => updateFood(fi, 'calories', Number(e.target.value))}
                        placeholder="Kcal"
                        className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      <input
                        type="number"
                        value={food.protein || ''}
                        onChange={(e) => updateFood(fi, 'protein', Number(e.target.value))}
                        placeholder="Prot (g)"
                        className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      <input
                        type="number"
                        value={food.carbs || ''}
                        onChange={(e) => updateFood(fi, 'carbs', Number(e.target.value))}
                        placeholder="Carbs (g)"
                        className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                      <input
                        type="number"
                        value={food.fats || ''}
                        onChange={(e) => updateFood(fi, 'fats', Number(e.target.value))}
                        placeholder="Grasas (g)"
                        className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button
            onClick={() => setShowMealModal(false)}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--surface)]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveMeal}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-text)] hover:opacity-90"
          >
            Guardar Comida
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Plan Nutricional"
        message={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
