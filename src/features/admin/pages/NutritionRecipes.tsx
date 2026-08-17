import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { createRecipe, getFoodCatalog, getRecipes, getResponseItems, updateRecipe } from '@/lib/api'
import type { FoodCatalogDTO, RecipeDTO, RecipeRequest } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '../components/FormField'
import { useToastStore } from '@/components/ui/Toast'

const EMPTY: RecipeRequest = {
  name: '',
  description: '',
  servings: 1,
  active: true,
  ingredients: [],
}
const tabs = [
  ['Alimentos', '/admin/nutricion/alimentos'],
  ['Recetas', '/admin/nutricion/recetas'],
  ['Equivalencias', '/admin/nutricion/equivalencias'],
  ['Planes', '/admin/nutricion'],
] as const

export default function NutritionRecipes() {
  const [recipes, setRecipes] = useState<RecipeDTO[]>([])
  const [foods, setFoods] = useState<FoodCatalogDTO[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<RecipeRequest>(EMPTY)
  const [editing, setEditing] = useState<RecipeDTO | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const addToast = useToastStore((state) => state.addToast)
  const load = () =>
    getRecipes({ active: true, size: 9999 })
      .then((res) => setRecipes(getResponseItems<RecipeDTO>(res)))
      .catch(() => addToast('No se pudieron cargar las recetas', 'error'))
  useEffect(() => {
    load()
    getFoodCatalog({ active: true, size: 9999 })
      .then((res) => setFoods(getResponseItems<FoodCatalogDTO>(res)))
      .catch(() => {})
  }, [])
  const save = async () => {
    if (!form.name.trim() || form.ingredients.length === 0)
      return addToast('Completa el nombre y agrega ingredientes', 'error')
    setSaving(true)
    try {
      const response = editing ? await updateRecipe(editing.id, form) : await createRecipe(form)
      if (response.dto)
        setRecipes((current) =>
          editing
            ? current.map((item) => (item.id === response.dto!.id ? response.dto! : item))
            : [response.dto!, ...current]
        )
      addToast(editing ? 'Receta actualizada' : 'Receta creada', 'success')
      setOpen(false)
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo guardar la receta', 'error')
    } finally {
      setSaving(false)
    }
  }
  const visible = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader title="Recetas" subtitle="Recetas nutricionales" />
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <nav className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1">
          {tabs.map(([label, to]) =>
            false ? (
              <span
                key={label}
                className="rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap text-[var(--text-muted)]"
              >
                {label} · próximamente
              </span>
            ) : (
              <NavLink
                key={label}
                end={to === '/admin/nutricion'}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap ${isActive ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]'}`
                }
              >
                {label}
              </NavLink>
            )
          )}
        </nav>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute top-3 left-3 text-[var(--text-muted)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar receta"
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
            <Plus size={16} /> Dar de alta receta
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((recipe) => (
            <div
              key={recipe.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <strong className="text-[var(--text-primary)]">{recipe.name}</strong>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {recipe.servings} porciones · {Math.round(recipe.caloriesPerServing)} kcal por
                porción
              </p>
              {recipe.equivalencesPerServing && Object.keys(recipe.equivalencesPerServing).length > 0 && <p className="mt-2 text-xs text-[var(--text-secondary)]">Equivalencias: {Object.entries(recipe.equivalencesPerServing).map(([group, value]) => `${group} ${Number(value).toFixed(2)}`).join(' · ')}</p>}
              <button
                type="button"
                onClick={() => {
                  setEditing(recipe)
                  setForm({
                    name: recipe.name,
                    description: recipe.description || '',
                    servings: recipe.servings,
                    active: recipe.active,
                    imageUrl: recipe.imageUrl || undefined,
                    preparationMinutes: recipe.preparationMinutes || undefined,
                    diners: recipe.diners || undefined,
                    difficulty: recipe.difficulty || undefined,
                    category: recipe.category || undefined,
                    tags: recipe.tags || undefined,
                    instructions: recipe.instructions || undefined,
                    ingredients: (recipe.ingredients || []).map((item) => ({
                      foodId: item.foodId,
                      quantity: Number(item.quantity),
                      grams: Number(item.grams),
                    })),
                  })
                  setOpen(true)
                }}
                className="mt-3 text-xs font-bold text-[var(--accent)]"
              >
                Editar
              </button>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No hay recetas registradas.</p>
          )}
        </div>
      </main>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar receta' : 'Dar de alta receta'}
        size="md"
      >
        <div className="space-y-3">
          <FormField label="Nombre" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Porciones">
            <Input
              type="number"
              value={form.servings}
              onChange={(e) => setForm({ ...form, servings: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Descripción"><Input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-3"><FormField label="Preparación (min)"><Input type="number" value={form.preparationMinutes || ''} onChange={(e) => setForm({ ...form, preparationMinutes: Number(e.target.value) })} /></FormField><FormField label="Comensales"><Input type="number" value={form.diners || ''} onChange={(e) => setForm({ ...form, diners: Number(e.target.value) })} /></FormField></div>
          <div className="grid grid-cols-2 gap-3"><FormField label="Dificultad"><Input value={form.difficulty || ''} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} placeholder="Fácil, media..." /></FormField><FormField label="Categoría"><Input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Desayunos" /></FormField></div>
          <FormField label="Etiquetas"><Input value={form.tags || ''} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="alto en proteína, sin gluten" /></FormField>
          <FormField label="Instrucciones"><textarea value={form.instructions || ''} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={4} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]" /></FormField>
          <FormField label="Ingrediente" required>
            <select
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
              value=""
              onChange={(e) =>
                e.target.value &&
                setForm({
                  ...form,
                  ingredients: [
                    ...form.ingredients,
                    { foodId: e.target.value, quantity: 1, grams: 100 },
                  ],
                })
              }
            >
              <option value="">Agregar alimento del catálogo</option>
              {foods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </select>
          </FormField>
          {form.ingredients.map((item, index) => (
            <div key={`${item.foodId}-${index}`} className="flex items-center gap-2 text-xs">
              <span className="flex-1">{foods.find((food) => food.id === item.foodId)?.name}</span>
              <Input
                type="number"
                value={item.grams}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ingredients: form.ingredients.map((value, i) =>
                      i === index ? { ...value, grams: Number(e.target.value) } : value
                    ),
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== index) })
                }
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)]"
          >
            {saving ? 'Guardando...' : 'Guardar receta'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
