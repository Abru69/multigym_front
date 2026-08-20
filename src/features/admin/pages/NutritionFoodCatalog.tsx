import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import {
  getFoodCatalog,
  createFoodCatalogItem,
  updateFoodCatalogItem,
  getFoodEquivalentGroups,
  getFoodEquivalences,
  createFoodEquivalence,
  getResponseItems,
} from '@/lib/api'
import type { FoodCatalogDTO, FoodEquivalentGroupDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '../components/FormField'
import { useToastStore } from '@/components/ui/Toast'
import { NutritionNav } from '../components/NutritionNav'

const EMPTY = {
  name: '',
  servingSize: 100,
  servingUnit: 'g',
  servingGrams: 100,
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  fiber: 0,
  category: '',
  brand: '',
}

export default function NutritionFoodCatalog() {
  const [foods, setFoods] = useState<FoodCatalogDTO[]>([])
  const [groups, setGroups] = useState<FoodEquivalentGroupDTO[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<any>(EMPTY)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FoodCatalogDTO | null>(null)
  const [saving, setSaving] = useState(false)
  const addToast = useToastStore((state) => state.addToast)
  const editFood = async (food: FoodCatalogDTO) => {
    setEditing(food)
    const equivalence = await getFoodEquivalences(food.id)
      .then(
        (res) =>
          getResponseItems<{
            group: { id: string }
            gramsPerEquivalent: number
            equivalentCount: number
          }>(res)[0]
      )
      .catch(() => undefined)
    setForm({
      name: food.name,
      servingSize: Number(food.servingSize || 0),
      servingUnit: food.servingUnit,
      servingGrams: Number(food.servingGrams || food.servingSize || 0),
      calories: Number(food.calories || 0),
      protein: Number(food.protein || 0),
      carbs: Number(food.carbs || 0),
      fats: Number(food.fats || 0),
      fiber: Number(food.fiber || 0),
      category: food.category || '',
      brand: food.brand || '',
      groupId: equivalence?.group.id || '',
      gramsPerEquivalent: equivalence?.gramsPerEquivalent || '',
      equivalentCount: equivalence?.equivalentCount || 1,
    })
    setOpen(true)
  }

  const load = () =>
    getFoodCatalog({ active: true, size: 9999 })
      .then((res) => setFoods(getResponseItems<FoodCatalogDTO>(res)))
      .catch(() => addToast('No se pudo cargar el catálogo', 'error'))
  useEffect(() => {
    load()
    getFoodEquivalentGroups()
      .then((res) => setGroups(getResponseItems<FoodEquivalentGroupDTO>(res)))
      .catch(() => {})
  }, [])

  const save = async () => {
    if (!form.name.trim()) return addToast('El nombre del alimento es requerido', 'error')
    setSaving(true)
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        source: editing?.source || 'NUTRITIONIST',
        country: '',
        active: editing?.active ?? true,
      }
      const response = editing
        ? await updateFoodCatalogItem(editing.id, payload)
        : await createFoodCatalogItem(payload)
      if (form.groupId && response.dto)
        await createFoodEquivalence(response.dto.id, {
          groupId: form.groupId,
          equivalentCount: Number(form.equivalentCount || 1),
          gramsPerEquivalent: Number(form.gramsPerEquivalent || form.servingGrams || 100),
          calories: Number(form.calories || 0),
          protein: Number(form.protein || 0),
          carbs: Number(form.carbs || 0),
          fats: Number(form.fats || 0),
        })
      addToast(editing ? 'Alimento actualizado' : 'Alimento dado de alta', 'success')
      setOpen(false)
      setForm(EMPTY)
      load()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo guardar el alimento', 'error')
    } finally {
      setSaving(false)
    }
  }

  const visible = foods.filter((food) =>
    [food.name, food.category, food.brand].some((value) =>
      value?.toLowerCase().includes(search.toLowerCase())
    )
  )
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader title="Alimentos" subtitle="Catálogo nutricional" />
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <NutritionNav />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              Catálogo de alimentos
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Registra y administra alimentos antes de crear planes nutricionales.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute top-3 left-3 text-[var(--text-muted)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alimento, categoría o marca"
              className="pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setForm(EMPTY)
              setOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)]"
          >
            <Plus size={16} /> Dar de alta alimento
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((food) => (
            <div
              key={food.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <strong className="text-[var(--text-primary)]">{food.name}</strong>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {food.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {food.servingSize} {food.servingUnit} · {food.calories} kcal
              </p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                P {food.protein}g · C {food.carbs}g · G {food.fats}g
              </p>
              <div className="mt-3 flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => editFood(food)}
                  className="text-[var(--accent)]"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateFoodCatalogItem(food.id, {
                        ...food,
                        source: food.source,
                        country: food.country || '',
                        active: !food.active,
                      })
                      addToast(
                        food.active ? 'Alimento desactivado' : 'Alimento activado',
                        'success'
                      )
                      load()
                    } catch {
                      addToast('No se pudo cambiar el estado', 'error')
                    }
                  }}
                  className="text-[var(--text-secondary)]"
                >
                  {food.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No hay alimentos registrados.</p>
          )}
        </div>
      </main>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar alimento' : 'Dar de alta alimento'}
        size="md"
      >
        <div className="space-y-3">
          <FormField label="Nombre" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Avena"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Porción">
              <Input
                type="number"
                value={form.servingSize}
                onChange={(e) => setForm({ ...form, servingSize: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Unidad">
              <Input
                value={form.servingUnit}
                onChange={(e) => setForm({ ...form, servingUnit: e.target.value })}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['calories', 'protein', 'carbs', 'fats'] as const).map((key) => (
              <FormField
                key={key}
                label={
                  key === 'calories'
                    ? 'Calorías'
                    : key === 'protein'
                      ? 'Proteína'
                      : key === 'carbs'
                        ? 'Carbohidratos'
                        : 'Grasas'
                }
              >
                <Input
                  type="number"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                />
              </FormField>
            ))}
          </div>
          <details className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <summary className="cursor-pointer list-none text-sm font-bold text-[var(--text-secondary)]">
              Equivalencias <span className="font-normal text-[var(--text-muted)]">(opcional)</span>
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormField label="Grupo de equivalencia">
                <select
                  value={form.groupId || ''}
                  onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                >
                  <option value="">Sin grupo</option>
                  {groups
                    .filter((group) => group.active)
                    .map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                </select>
              </FormField>
              <FormField label="Gramos/equiv.">
                <Input
                  type="number"
                  value={form.gramsPerEquivalent || ''}
                  onChange={(e) => setForm({ ...form, gramsPerEquivalent: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Equivalentes">
                <Input
                  type="number"
                  value={form.equivalentCount || 1}
                  onChange={(e) => setForm({ ...form, equivalentCount: Number(e.target.value) })}
                />
              </FormField>
            </div>
          </details>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)] disabled:opacity-50"
          >
            {saving ? 'Guardando...' : editing ? 'Actualizar alimento' : 'Guardar alimento'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
