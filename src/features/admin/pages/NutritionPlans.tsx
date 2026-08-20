import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getNutritionPlans,
  createNutritionPlan,
  updateNutritionPlan,
  updateNutritionPlanStatus,
  deleteNutritionPlan,
  getClientUsers,
  getResponseItems,
  getFoodCatalog,
  getGlobalFoodCatalog,
  toFoodCatalogOption,
  createFoodCatalogItem,
  getFoodEquivalentGroups,
  getFoodEquivalences,
  createFoodEquivalentGroup,
  createFoodEquivalence,
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  getNutritionPlanVersions,
  getNutritionPlanVersion,
  getMemberNutritionAdherence,
  getMemberNutritionAdherenceSummary,
  getMealOptions,
  createMealOption,
  updateMealOption,
  deleteMealOption,
} from '@/lib/api'
import {
  Plus,
  Utensils,
  Edit2,
  Trash2,
  Clock,
  User,
  History,
  Activity,
  Play,
  Archive,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import type {
  NutritionPlanDTO,
  NutritionPlanRequest,
  NutritionPlanVersionDTO,
  MemberListItemDTO,
  UserDTO,
  FoodCatalogDTO,
  FoodCatalogOption,
  FoodEquivalentGroupDTO,
  FoodEquivalenceDTO,
  RecipeDTO,
  RecipeRequest,
  NutritionMealAdherenceDTO,
  NutritionAdherenceSummaryDTO,
  MealOptionDTO,
  MealOptionItemRequest,
} from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { NutritionNav } from '../components/NutritionNav'

interface MealForm {
  name: string
  time: string
  foods: Array<{
    name: string
    quantity: string
    calories: number
    protein: number
    carbs: number
    fats: number
  }>
  options: MealOptionDTO[]
}

const EMPTY_MEAL: MealForm = { name: '', time: '', foods: [], options: [] }

const EMPTY_FORM: NutritionPlanRequest = {
  memberId: '',
  name: '',
  targetCalories: 2000,
  targetProtein: 150,
  targetCarbs: 200,
  targetFats: 70,
  meals: [],
  notes: '',
  status: 'DRAFT',
  startsOn: '',
  endsOn: '',
}

export default function NutritionPlansPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [plans, setPlans] = useState<NutritionPlanDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal] = useState(false)
  const [planStep, setPlanStep] = useState<1 | 2 | 3>(1)
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
  const [foodCatalog, setFoodCatalog] = useState<FoodCatalogDTO[]>([])
  const [globalFoodCatalog, setGlobalFoodCatalog] = useState<FoodCatalogOption[]>([])
  const [foodSearch, setFoodSearch] = useState('')
  const [equivalentGroups, setEquivalentGroups] = useState<FoodEquivalentGroupDTO[]>([])
  const [equivalentGroup, setEquivalentGroup] = useState('')
  const [foodEquivalences, setFoodEquivalences] = useState<Record<number, string>>({})
  const [selectedCatalogFood, setSelectedCatalogFood] = useState<FoodCatalogDTO | null>(null)
  const [selectedEquivalences, setSelectedEquivalences] = useState<FoodEquivalenceDTO[]>([])
  const [showEquivalenceModal, setShowEquivalenceModal] = useState(false)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [groupForm, setGroupForm] = useState({ name: '', description: '' })
  const [equivalenceForm, setEquivalenceForm] = useState({
    groupId: '',
    equivalentCount: 1,
    gramsPerEquivalent: 100,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  })
  const [showFoodForm, setShowFoodForm] = useState(false)
  const [foodFormIndex, setFoodFormIndex] = useState<number | null>(null)
  const [foodForm, setFoodForm] = useState({
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
  })
  const [isCreatingFood, setIsCreatingFood] = useState(false)
  const [recipes, setRecipes] = useState<RecipeDTO[]>([])
  const [recipeSearch, setRecipeSearch] = useState('')
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<RecipeDTO | null>(null)
  const [recipeForm, setRecipeForm] = useState<RecipeRequest>({
    name: '',
    description: '',
    servings: 1,
    ingredients: [],
  })
  const [recipeFoodSearch, setRecipeFoodSearch] = useState('')
  const [isSavingRecipe, setIsSavingRecipe] = useState(false)
  const [historyPlan, setHistoryPlan] = useState<NutritionPlanDTO | null>(null)
  const [versions, setVersions] = useState<NutritionPlanVersionDTO[]>([])
  const [selectedVersion, setSelectedVersion] = useState<NutritionPlanVersionDTO | null>(null)
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [adherencePlanId, setAdherencePlanId] = useState('')
  const [adherence, setAdherence] = useState<NutritionMealAdherenceDTO[]>([])
  const [adherenceVersionIds, setAdherenceVersionIds] = useState<Set<string>>(new Set())
  const [adherenceSummary, setAdherenceSummary] = useState<NutritionAdherenceSummaryDTO | null>(
    null
  )
  const [loadingAdherence, setLoadingAdherence] = useState(false)
  const [optionForm, setOptionForm] = useState<{
    id?: string
    name: string
    items: MealOptionItemRequest[]
  }>({ name: '', items: [] })
  const [isSavingOption, setIsSavingOption] = useState(false)

  const selectedAdherencePlan = plans.find((plan) => plan.id === adherencePlanId)
  const loadAdherence = async (planId: string) => {
    setAdherencePlanId(planId)
    const plan = plans.find((item) => item.id === planId)
    if (!plan) {
      setAdherence([])
      setAdherenceSummary(null)
      return
    }
    setLoadingAdherence(true)
    try {
      const [progressResponse, summaryResponse] = await Promise.all([
        getMemberNutritionAdherence(plan.memberId),
        getMemberNutritionAdherenceSummary(plan.memberId),
      ])
      const versionResponse = await getNutritionPlanVersions(plan.id)
      const versionIds = new Set(
        getResponseItems<NutritionPlanVersionDTO>(versionResponse).map((version) => version.id)
      )
      setAdherenceVersionIds(versionIds)
      setAdherence(getResponseItems<NutritionMealAdherenceDTO>(progressResponse))
      setAdherenceSummary(summaryResponse.dto || null)
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo cargar la adherencia', 'error')
      setAdherence([])
      setAdherenceSummary(null)
    } finally {
      setLoadingAdherence(false)
    }
  }

  const adherenceByDate = useMemo(() => {
    const groups = new Map<string, NutritionMealAdherenceDTO[]>()
    adherence
      .filter((item) => adherenceVersionIds.has(item.nutritionPlanVersionId))
      .forEach((item) => groups.set(item.date, [...(groups.get(item.date) || []), item]))
    return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a))
  }, [adherence, adherenceVersionIds])

  const filteredAdherenceSummary = useMemo(() => {
    const items = adherence.filter((item) => adherenceVersionIds.has(item.nutritionPlanVersionId))
    const completed = items.filter((item) => item.status === 'COMPLETED').length
    const partial = items.filter((item) => item.status === 'PARTIAL').length
    const skipped = items.filter((item) => item.status === 'SKIPPED').length
    return {
      total: items.length,
      completed,
      partial,
      skipped,
      completionRate: items.length ? (completed / items.length) * 100 : 0,
    }
  }, [adherence, adherenceVersionIds])

  const getAdherenceMealLabel = (mealReference: string) => {
    const meal = plans
      .filter((plan) => plan.memberId === selectedAdherencePlan?.memberId)
      .flatMap((plan) => plan.meals)
      .find((item) => item.id === mealReference)
    return meal?.name || mealReference
  }

  const selectedHistorySnapshot = selectedVersion
    ? (JSON.parse(selectedVersion.snapshot) as NutritionPlanDTO)
    : null

  const openHistory = async (plan: NutritionPlanDTO) => {
    setHistoryPlan(plan)
    setSelectedVersion(null)
    setLoadingVersions(true)
    try {
      const response = await getNutritionPlanVersions(plan.id)
      const items = getResponseItems<NutritionPlanVersionDTO>(response)
      setVersions(items)
      if (items[0]) setSelectedVersion(items[0])
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo cargar el historial', 'error')
    } finally {
      setLoadingVersions(false)
    }
  }

  const loadVersion = async (version: NutritionPlanVersionDTO) => {
    if (!historyPlan) return
    try {
      const response = await getNutritionPlanVersion(historyPlan.id, version.versionNumber)
      setSelectedVersion(response.dto || version)
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo cargar la versión', 'error')
    }
  }

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await getNutritionPlans()
      setPlans(getResponseItems<NutritionPlanDTO>(response))
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
        setMembers(
          getResponseItems<UserDTO>(res)
            .filter((u) => u.memberDTO)
            .map((u) => ({
              id: u.memberDTO!.id,
              name: u.memberDTO!.name,
              phone: u.memberDTO!.phone,
              email: u.email,
              isActive: u.isActive,
            }))
        )
      })
      .catch(() => {})
    getFoodEquivalentGroups()
      .then((res) =>
        setEquivalentGroups(getResponseItems<FoodEquivalentGroupDTO>(res).filter((g) => g.active))
      )
      .catch(() => {})
    getGlobalFoodCatalog()
      .then((res) =>
        setGlobalFoodCatalog(
          getResponseItems<FoodCatalogDTO>(res).map((food) => toFoodCatalogOption(food, 'GLOBAL'))
        )
      )
      .catch(() => {})
  }, [loadData])

  useEffect(() => {
    getFoodCatalog({ active: true, equivalentGroup: equivalentGroup || undefined, size: 9999 })
      .then((res) => setFoodCatalog(getResponseItems<FoodCatalogDTO>(res)))
      .catch(() => {})
  }, [equivalentGroup])

  useEffect(() => {
    getRecipes({ search: recipeSearch.trim() || undefined, active: true, size: 20 })
      .then((res) => setRecipes(getResponseItems<RecipeDTO>(res)))
      .catch(() => setRecipes([]))
  }, [recipeSearch])

  const foodOptions = useMemo<FoodCatalogOption[]>(() => {
    const term = foodSearch.trim().toLowerCase()
    return [
      ...foodCatalog.map((food) => toFoodCatalogOption(food, 'TENANT')),
      ...globalFoodCatalog,
    ].filter(
      (food) =>
        !term ||
        [food.name, food.category, food.brand].some((value) => value?.toLowerCase().includes(term))
    )
  }, [foodCatalog, globalFoodCatalog, foodSearch])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(term) || (p.memberName || '').toLowerCase().includes(term)
    )
  }, [plans, debouncedSearch])

  const nutritionSummary = useMemo(() => {
    const membersWithPlans = new Set(plans.map((plan) => plan.memberId)).size
    const active = plans.filter((plan) => plan.status === 'ACTIVE').length
    const drafts = plans.filter((plan) => !plan.status || plan.status === 'DRAFT').length
    const averageMeals = plans.length
      ? Math.round(plans.reduce((total, plan) => total + plan.meals.length, 0) / plans.length)
      : 0
    return { active, drafts, membersWithPlans, averageMeals }
  }, [plans])

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
    setPlanStep(1)
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
        options: m.options || [],
      })),
      notes: plan.notes,
      status: plan.status || 'DRAFT',
      startsOn: plan.startsOn || '',
      endsOn: plan.endsOn || '',
    })
    setFormErrors({})
    setPlanStep(1)
    setShowModal(true)
  }

  const handlePlanNext = () => {
    if (planStep === 1 && !validateForm()) return
    setPlanStep((current) => (current === 3 ? 3 : ((current + 1) as 1 | 2 | 3)))
  }

  const handlePlanBack = () => {
    setPlanStep((current) => (current === 1 ? 1 : ((current - 1) as 1 | 2 | 3)))
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      let savedPlan: NutritionPlanDTO | undefined
      if (editingPlan) {
        const response = await updateNutritionPlan(editingPlan.id, {
          ...form,
          meals: form.meals.map(({ options: _options, ...meal }) => meal),
        })
        savedPlan = response.dto
        addToast('Plan actualizado correctamente', 'success')
      } else {
        const response = await createNutritionPlan({
          ...form,
          meals: form.meals.map(({ options: _options, ...meal }) => meal),
        })
        savedPlan = response.dto
        addToast('Plan creado correctamente', 'success')
      }
      if (savedPlan) {
        for (let mealIndex = 0; mealIndex < form.meals.length; mealIndex++) {
          const mealId = savedPlan.meals[mealIndex]?.id
          if (!mealId) continue
          for (const option of form.meals[mealIndex].options || []) {
            if (option.id.startsWith('draft-'))
              await createMealOption(savedPlan.id, mealId, {
                name: option.name,
                items: option.items,
              })
          }
        }
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
    setMealForm({ ...form.meals[index], options: [] })
    setOptionForm({ name: '', items: [] })
    if (editingPlan) {
      getMealOptions(editingPlan.id, (editingPlan.meals[index] as { id: string }).id)
        .then((response) => setMealForm((current) => ({ ...current, options: response.dto || [] })))
        .catch((err: unknown) =>
          addToast(
            err instanceof Error ? err.message : 'No se pudieron cargar las opciones',
            'error'
          )
        )
    }
    setShowMealModal(true)
  }

  const addOptionItem = (reference: 'foodId' | 'recipeId', id: string) => {
    if (!id) return
    const selectedName =
      reference === 'recipeId'
        ? recipes.find((recipe) => recipe.id === id)?.name
        : foodOptions.find((food) => food.id === id)?.name
    const quantity =
      reference === 'foodId'
        ? (() => {
            const food = foodOptions.find((item) => item.id === id)
            return food ? `${food.servingSize} ${food.servingUnit}` : ''
          })()
        : '1 porción'
    setOptionForm((current) => ({
      ...current,
      name: current.name.trim() || selectedName || '',
      items: [...current.items, { [reference]: id, quantity, sortOrder: current.items.length }],
    }))
  }

  const addMealFoodToOption = async (food: MealForm['foods'][number]) => {
    try {
      let catalogItem = foodOptions.find(
        (item) => item.name.toLowerCase() === food.name.trim().toLowerCase()
      )
      if (!catalogItem) {
        const response = await createFoodCatalogItem({
          name: food.name.trim(),
          servingSize: 100,
          servingUnit: 'g',
          servingGrams: 100,
          calories: Number(food.calories || 0),
          protein: Number(food.protein || 0),
          carbs: Number(food.carbs || 0),
          fats: Number(food.fats || 0),
          fiber: 0,
          category: '',
          brand: '',
          source: 'NUTRITIONIST',
          country: '',
          active: true,
        })
        if (!response.dto) throw new Error('No se pudo registrar el alimento en el catálogo')
        setFoodCatalog((current) => [...current, response.dto!])
        catalogItem = toFoodCatalogOption(response.dto, 'TENANT')
      }
      addOptionItem('foodId', catalogItem.id)
    } catch (err: unknown) {
      addToast(
        err instanceof Error ? err.message : 'No se pudo agregar el alimento a la opción',
        'error'
      )
    }
  }

  const registerMealFood = async (food: MealForm['foods'][number]) => {
    const name = food.name.trim()
    if (!name) return
    if (foodOptions.some((item) => item.name.trim().toLowerCase() === name.toLowerCase())) {
      addToast('Este alimento ya existe en el catálogo', 'warning')
      return
    }
    try {
      const response = await createFoodCatalogItem({
        name,
        servingSize: 100,
        servingUnit: 'g',
        servingGrams: 100,
        calories: Number(food.calories || 0),
        protein: Number(food.protein || 0),
        carbs: Number(food.carbs || 0),
        fats: Number(food.fats || 0),
        fiber: 0,
        category: '',
        brand: '',
        source: 'NUTRITIONIST',
        country: '',
        active: true,
      })
      if (!response.dto) throw new Error('No se recibió el alimento creado')
      setFoodCatalog((current) => [...current, response.dto!])
      addToast(`"${name}" registrado en Alimentos`, 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo registrar el alimento', 'error')
    }
  }

  const saveOption = async () => {
    if (!optionForm.name.trim() || optionForm.items.length === 0) {
      addToast('Completa el nombre y agrega al menos un alimento o receta', 'error')
      return
    }
    if (editingMealIndex === null) {
      const draftOption: MealOptionDTO = {
        id: `draft-${crypto.randomUUID()}`,
        name: optionForm.name.trim(),
        items: optionForm.items.map((item, index) => ({
          ...item,
          id: `draft-item-${crypto.randomUUID()}-${index}`,
        })),
      }
      setMealForm((current) => ({ ...current, options: [...current.options, draftOption] }))
      setOptionForm({ name: '', items: [] })
      addToast('Opción preparada; se guardará con la comida', 'success')
      return
    }
    if (!editingPlan) return
    const mealId = (editingPlan.meals[editingMealIndex!] as { id: string }).id
    setIsSavingOption(true)
    try {
      const response = optionForm.id
        ? await updateMealOption(editingPlan.id, mealId, optionForm.id, optionForm)
        : await createMealOption(editingPlan.id, mealId, optionForm)
      if (response.dto)
        setMealForm((current) => ({
          ...current,
          options: optionForm.id
            ? current.options.map((item) => (item.id === optionForm.id ? response.dto! : item))
            : [...current.options, response.dto!],
        }))
      setOptionForm({ name: '', items: [] })
      addToast(optionForm.id ? 'Opción actualizada' : 'Opción guardada', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo guardar la opción', 'error')
    } finally {
      setIsSavingOption(false)
    }
  }

  const removeOption = async (option: MealOptionDTO) => {
    if (!editingPlan || editingMealIndex === null) return
    const mealId = (editingPlan.meals[editingMealIndex] as { id: string }).id
    try {
      await deleteMealOption(editingPlan.id, mealId, option.id)
      setMealForm((current) => ({
        ...current,
        options: current.options.filter((item) => item.id !== option.id),
      }))
      addToast('Opción eliminada', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo eliminar la opción', 'error')
    }
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
      foods: [
        ...mealForm.foods,
        { name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0 },
      ],
    })
  }

  const addRecipeToMeal = (recipe: RecipeDTO) => {
    setMealForm((current) => ({
      ...current,
      foods: [
        ...current.foods,
        {
          name: recipe.name,
          quantity: `1 porción (${recipe.servings} porciones)`,
          calories: Number(recipe.caloriesPerServing || 0),
          protein: Number(recipe.proteinPerServing || 0),
          carbs: Number(recipe.carbsPerServing || 0),
          fats: Number(recipe.fatsPerServing || 0),
        },
      ],
    }))
    addToast(`Receta "${recipe.name}" agregada`, 'success')
  }

  const updateFood = (index: number, field: string, value: string | number) => {
    const updated = [...mealForm.foods]
    const item = { ...updated[index] }
    ;(item as Record<string, unknown>)[field] = value
    updated[index] = item as (typeof updated)[number]
    setMealForm({ ...mealForm, foods: updated })
  }

  const selectCatalogFood = async (index: number, id: string) => {
    const catalogItem = foodOptions.find((item) => item.id === id)
    if (!catalogItem) return
    const updated = [...mealForm.foods]
    updated[index] = {
      ...updated[index],
      name: catalogItem.name,
      quantity: `${catalogItem.servingSize} ${catalogItem.servingUnit}`,
      calories: catalogItem.calories,
      protein: catalogItem.protein,
      carbs: catalogItem.carbs,
      fats: catalogItem.fats,
    }
    setMealForm({ ...mealForm, foods: updated })
    try {
      const response = await getFoodEquivalences(id)
      const equivalence = getResponseItems<FoodEquivalenceDTO>(response)[0]
      if (equivalence) {
        setFoodEquivalences((current) => ({
          ...current,
          [index]: `${equivalence.gramsPerEquivalent} g por equivalente de ${equivalence.group.name}`,
        }))
      }
    } catch {
      // Equivalence metadata is optional; catalog selection remains usable.
    }
  }

  const openFoodForm = (index: number) => {
    setFoodFormIndex(index)
    setFoodForm({
      name: foodSearch.trim(),
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
    })
    setShowFoodForm(true)
  }

  const handleCreateFood = async () => {
    if (!foodForm.name.trim() || foodFormIndex === null) {
      addToast('Nombre del alimento requerido', 'error')
      return
    }
    setIsCreatingFood(true)
    try {
      const response = await createFoodCatalogItem({
        ...foodForm,
        source: 'NUTRITIONIST',
        country: '',
        active: true,
      })
      const created = response.dto
      if (!created) throw new Error('No se recibió el alimento creado')
      setFoodCatalog((current) => [...current, created])
      await selectCatalogFood(foodFormIndex, created.id)
      setFoodSearch('')
      setShowFoodForm(false)
      addToast('Alimento personalizado creado', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al crear alimento', 'error')
    } finally {
      setIsCreatingFood(false)
    }
  }

  const removeFood = (index: number) => {
    setMealForm({ ...mealForm, foods: mealForm.foods.filter((_, i) => i !== index) })
  }

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    return member?.name || memberId
  }

  const recipeFoodOptions = foodOptions.filter(
    (food) =>
      !recipeFoodSearch.trim() ||
      [food.name, food.category, food.brand].some((value) =>
        value?.toLowerCase().includes(recipeFoodSearch.trim().toLowerCase())
      )
  )
  const openCreateRecipe = () => {
    setEditingRecipe(null)
    setRecipeForm({ name: '', description: '', servings: 1, ingredients: [] })
    setRecipeFoodSearch('')
    setShowRecipeModal(true)
  }
  const openEditRecipe = async (recipe: RecipeDTO) => {
    try {
      const response = await getRecipeById(recipe.id)
      const detail = response.dto || recipe
      setEditingRecipe(detail)
      setRecipeForm({
        name: detail.name,
        description: detail.description || '',
        servings: detail.servings,
        active: detail.active,
        ingredients: (detail.ingredients || []).map((item) => ({
          foodId: item.foodId,
          quantity: Number(item.quantity),
          grams: Number(item.grams),
        })),
      })
      setShowRecipeModal(true)
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo cargar la receta', 'error')
    }
  }
  const saveRecipe = async () => {
    if (
      !recipeForm.name.trim() ||
      recipeForm.servings <= 0 ||
      recipeForm.ingredients.length === 0 ||
      recipeForm.ingredients.some((item) => item.grams <= 0 || item.quantity <= 0)
    )
      return addToast('Completa nombre, porciones e ingredientes válidos', 'error')
    setIsSavingRecipe(true)
    try {
      const response = editingRecipe
        ? await updateRecipe(editingRecipe.id, recipeForm)
        : await createRecipe(recipeForm)
      if (response.dto)
        setRecipes((current) =>
          editingRecipe
            ? current.map((item) => (item.id === response.dto!.id ? response.dto! : item))
            : [response.dto!, ...current]
        )
      addToast(editingRecipe ? 'Receta actualizada' : 'Receta creada', 'success')
      setShowRecipeModal(false)
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al guardar receta', 'error')
    } finally {
      setIsSavingRecipe(false)
    }
  }

  const openEquivalenceManager = async (food: FoodCatalogDTO) => {
    setSelectedCatalogFood(food)
    setShowEquivalenceModal(true)
    try {
      const response = await getFoodEquivalences(food.id)
      setSelectedEquivalences(getResponseItems<FoodEquivalenceDTO>(response))
    } catch (err: unknown) {
      addToast(
        err instanceof Error ? err.message : 'No se pudieron cargar las equivalencias',
        'error'
      )
    }
  }

  const handleCreateGroup = async () => {
    if (!groupForm.name.trim()) return addToast('Nombre del grupo requerido', 'error')
    try {
      const response = await createFoodEquivalentGroup(groupForm)
      const group = response.dto
      if (group) setEquivalentGroups((current) => [...current, group])
      setGroupForm({ name: '', description: '' })
      setShowGroupForm(false)
      addToast('Grupo creado correctamente', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al crear grupo', 'error')
    }
  }

  const handleCreateEquivalence = async () => {
    if (!selectedCatalogFood || !equivalenceForm.groupId)
      return addToast('Selecciona un grupo', 'error')
    try {
      const response = await createFoodEquivalence(selectedCatalogFood.id, equivalenceForm)
      if (response.dto) setSelectedEquivalences((current) => [...current, response.dto!])
      addToast('Equivalencia agregada', 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al agregar equivalencia', 'error')
    }
  }

  const changePlanStatus = async (
    plan: NutritionPlanDTO,
    status: NonNullable<NutritionPlanDTO['status']>
  ) => {
    try {
      await updateNutritionPlanStatus(plan.id, {
        status,
        startsOn: plan.startsOn,
        endsOn: plan.endsOn,
      })
      await loadData()
      addToast(status === 'ACTIVE' ? 'Plan activado' : 'Plan archivado', 'success')
    } catch (err: unknown) {
      addToast(
        err instanceof Error ? err.message : 'No se pudo actualizar el estado del plan',
        'error'
      )
    }
  }

  const columns: DataTableColumn<NutritionPlanDTO>[] = [
    {
      key: 'name',
      label: 'Plan',
      sortable: true,
      render: (plan) => (
        <div className="min-w-[180px]">
          <p className="font-bold text-[var(--text-primary)]">{plan.name}</p>
          {plan.notes && (
            <p className="mt-0.5 max-w-[220px] truncate text-xs text-[var(--text-muted)]">
              {plan.notes}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'memberName',
      label: 'Miembro',
      sortable: true,
      render: (plan) => (
        <div className="flex min-w-[170px] items-center gap-2">
          <User size={14} className="shrink-0 text-[var(--text-muted)]" />
          <span className="truncate text-[var(--text-secondary)]">
            {plan.memberName || getMemberName(plan.memberId)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (plan) => (
        <div className="min-w-[120px]">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${plan.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400' : plan.status === 'ARCHIVED' ? 'bg-slate-500/15 text-slate-400' : plan.status === 'SCHEDULED' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'}`}
          >
            {plan.status === 'ACTIVE'
              ? 'Activo'
              : plan.status === 'ARCHIVED'
                ? 'Archivado'
                : plan.status === 'SCHEDULED'
                  ? 'Programado'
                  : 'Borrador'}
          </span>
          {plan.startsOn && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">Desde {plan.startsOn}</p>
          )}
        </div>
      ),
    },
    {
      key: 'targetCalories',
      label: 'Kcal',
      sortable: true,
      className: 'whitespace-nowrap text-center',
      headerClassName: 'text-center',
      render: (plan) => (
        <span className="font-bold text-[var(--accent)]">{plan.targetCalories}</span>
      ),
    },
    {
      key: 'objectives',
      label: 'Objetivo diario',
      sortable: false,
      render: (plan) => (
        <div className="min-w-[150px]">
          <p className="font-bold text-[var(--accent)]">{plan.targetCalories} kcal</p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            P {plan.targetProtein}g · C {plan.targetCarbs}g · G {plan.targetFats}g
          </p>
        </div>
      ),
    },
    {
      key: 'meals',
      label: 'Comidas',
      sortable: false,
      className: 'whitespace-nowrap text-center text-[var(--text-secondary)]',
      headerClassName: 'text-center',
      render: (plan) => `${plan.meals.length} ${plan.meals.length === 1 ? 'comida' : 'comidas'}`,
    },
    {
      key: 'actions',
      label: 'Acciones',
      className: 'whitespace-nowrap text-right',
      headerClassName: 'text-right',
      render: (plan) => (
        <div className="flex justify-end gap-1">
          {plan.status !== 'ACTIVE' && (
            <button
              type="button"
              onClick={() => changePlanStatus(plan, 'ACTIVE')}
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-emerald-500/10 hover:text-emerald-400"
              title="Activar plan"
            >
              <Play size={15} />
            </button>
          )}
          {plan.status !== 'ARCHIVED' && (
            <button
              type="button"
              onClick={() => changePlanStatus(plan, 'ARCHIVED')}
              className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-slate-500/10 hover:text-slate-300"
              title="Archivar plan"
            >
              <Archive size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => openEditModal(plan)}
            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--accent)]"
            aria-label={`Editar ${plan.name}`}
            title="Editar plan"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => openHistory(plan)}
            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--accent)]"
            aria-label={`Historial de ${plan.name}`}
            title="Ver historial"
          >
            <History size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(plan)}
            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Eliminar ${plan.name}`}
            title="Eliminar plan"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Planes Nutricionales"
        subtitle="Gestiona los planes de nutrición de tus clientes"
        icon={Utensils}
      />

      <NutritionNav />

      <section aria-label="Resumen de nutrición" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Planes activos', nutritionSummary.active, 'text-emerald-400'],
          ['Borradores', nutritionSummary.drafts, 'text-amber-400'],
          ['Miembros con plan', nutritionSummary.membersWithPlans, 'text-[var(--accent)]'],
          ['Comidas promedio', nutritionSummary.averageMeals, 'text-sky-400'],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <p className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
              {label}
            </p>
            <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
          <button onClick={loadData} className="ml-3 font-bold underline">
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre o miembro..."
          />
        </div>
        <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
          {filtered.length} plan{filtered.length !== 1 ? 'es' : ''}
        </span>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
        >
          <Plus size={16} /> Nuevo Plan
        </button>
      </div>

      {isLoading ? (
        <LoadingState text="Cargando planes..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No hay planes nutricionales"
          description="Crea el primer plan nutricional para tus clientes"
          action={
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-text)]"
            >
              <Plus size={16} />
              Crear Plan
            </button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(plan) => plan.id}
          emptyIcon={Utensils}
          emptyTitle="No hay planes nutricionales"
          emptyDescription="Crea el primer plan nutricional para tus clientes"
        />
      )}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-black text-[var(--text-primary)]">
              <Activity size={17} className="text-[var(--accent)]" /> Adherencia nutricional
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Revisa el cumplimiento de comidas por miembro y plan.
            </p>
          </div>
          <select
            value={adherencePlanId}
            onChange={(event) => loadAdherence(event.target.value)}
            className="min-w-[220px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          >
            <option value="">Seleccionar miembro / plan...</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.memberName || getMemberName(plan.memberId)} — {plan.name}
              </option>
            ))}
          </select>
        </div>
        {!adherencePlanId ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
            Selecciona un plan para ver el detalle de adherencia.
          </p>
        ) : loadingAdherence ? (
          <LoadingState text="Cargando adherencia..." />
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ['Total', filteredAdherenceSummary.total, 'text-[var(--text-primary)]'],
                ['Completadas', filteredAdherenceSummary.completed, 'text-[var(--success)]'],
                ['Parciales', filteredAdherenceSummary.partial, 'text-[var(--warning)]'],
                ['Omitidas', filteredAdherenceSummary.skipped, 'text-red-400'],
                [
                  'Cumplimiento',
                  `${Math.round(filteredAdherenceSummary.completionRate)}%`,
                  'text-[var(--accent)]',
                ],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-xl bg-[var(--surface)] p-3">
                  <p className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                    {label}
                  </p>
                  <p className={`mt-1 text-xl font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            {selectedAdherencePlan && (
              <p className="text-xs text-[var(--text-muted)]">
                {selectedAdherencePlan.memberName || getMemberName(selectedAdherencePlan.memberId)}{' '}
                · {selectedAdherencePlan.name}
              </p>
            )}
            {adherenceByDate.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Aún no hay registros de comidas.</p>
            ) : (
              <div className="space-y-3">
                {adherenceByDate.map(([date, meals]) => (
                  <div
                    key={date}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {new Date(`${date}T00:00:00`).toLocaleDateString('es-MX', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {meals.length} comida{meals.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between rounded-lg bg-[var(--card)] px-3 py-2 text-xs"
                        >
                          <span className="font-semibold text-[var(--text-secondary)]">
                            {getAdherenceMealLabel(meal.mealReference)}
                          </span>
                          <span
                            className={
                              meal.status === 'COMPLETED'
                                ? 'text-[var(--success)]'
                                : meal.status === 'PARTIAL'
                                  ? 'text-[var(--warning)]'
                                  : 'text-red-400'
                            }
                          >
                            {meal.status === 'COMPLETED'
                              ? 'Completada'
                              : meal.status === 'PARTIAL'
                                ? 'Parcial'
                                : 'Omitida'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <Modal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        title={editingRecipe ? 'Editar receta' : 'Nueva receta'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={recipeForm.name}
              onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
              placeholder="Nombre de receta"
            />
            <Input
              type="number"
              min="1"
              value={recipeForm.servings}
              onChange={(e) => setRecipeForm({ ...recipeForm, servings: Number(e.target.value) })}
              placeholder="Porciones"
            />
          </div>
          <textarea
            value={recipeForm.description}
            onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
            placeholder="Instrucciones"
            rows={2}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text-primary)]"
          />
          <Input
            value={recipeFoodSearch}
            onChange={(e) => setRecipeFoodSearch(e.target.value)}
            placeholder="Buscar alimento..."
          />
          {recipeForm.ingredients.map((ingredient, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_90px_90px_auto]">
              <select
                value={ingredient.foodId}
                onChange={(e) =>
                  setRecipeForm({
                    ...recipeForm,
                    ingredients: recipeForm.ingredients.map((item, i) =>
                      i === index ? { ...item, foodId: e.target.value } : item
                    ),
                  })
                }
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-xs text-[var(--text-primary)]"
              >
                <option value="">Alimento...</option>
                {recipeFoodOptions.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                value={ingredient.quantity}
                onChange={(e) =>
                  setRecipeForm({
                    ...recipeForm,
                    ingredients: recipeForm.ingredients.map((item, i) =>
                      i === index ? { ...item, quantity: Number(e.target.value) } : item
                    ),
                  })
                }
                placeholder="Cantidad"
              />
              <Input
                type="number"
                value={ingredient.grams}
                onChange={(e) =>
                  setRecipeForm({
                    ...recipeForm,
                    ingredients: recipeForm.ingredients.map((item, i) =>
                      i === index ? { ...item, grams: Number(e.target.value) } : item
                    ),
                  })
                }
                placeholder="Gramos"
              />
              <button
                type="button"
                onClick={() =>
                  setRecipeForm({
                    ...recipeForm,
                    ingredients: recipeForm.ingredients.filter((_, i) => i !== index),
                  })
                }
                className="text-xs text-red-400"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setRecipeForm({
                ...recipeForm,
                ingredients: [...recipeForm.ingredients, { foodId: '', quantity: 1, grams: 100 }],
              })
            }
            className="rounded-lg bg-[var(--accent)]/10 px-3 py-2 text-xs font-bold text-[var(--accent)]"
          >
            Agregar ingrediente
          </button>
          {editingRecipe && (
            <p className="text-xs font-bold text-[var(--accent)]">
              Por porción: {Math.round(editingRecipe.caloriesPerServing)} kcal · P{' '}
              {Number(editingRecipe.proteinPerServing).toFixed(1)}g · C{' '}
              {Number(editingRecipe.carbsPerServing).toFixed(1)}g · G{' '}
              {Number(editingRecipe.fatsPerServing).toFixed(1)}g
            </p>
          )}
          <button
            type="button"
            onClick={saveRecipe}
            disabled={isSavingRecipe}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)]"
          >
            Guardar receta
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showEquivalenceModal}
        onClose={() => setShowEquivalenceModal(false)}
        title={`Equivalencias: ${selectedCatalogFood?.name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {selectedEquivalences.map((equivalence) => (
              <div
                key={equivalence.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm"
              >
                <span className="font-bold text-[var(--text-primary)]">
                  {equivalence.group.name}
                </span>
                <span className="text-[var(--text-secondary)]">
                  {equivalence.gramsPerEquivalent} g · {equivalence.calories} kcal
                </span>
              </div>
            ))}
            {selectedEquivalences.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No hay equivalencias registradas.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <select
              value={equivalenceForm.groupId}
              onChange={(e) => setEquivalenceForm({ ...equivalenceForm, groupId: e.target.value })}
              className="col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs text-[var(--text-primary)] sm:col-span-4"
            >
              <option value="">Grupo...</option>
              {equivalentGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {(
              [
                'equivalentCount',
                'gramsPerEquivalent',
                'calories',
                'protein',
                'carbs',
                'fats',
              ] as const
            ).map((field) => (
              <Input
                key={field}
                type="number"
                value={equivalenceForm[field]}
                onChange={(e) =>
                  setEquivalenceForm({ ...equivalenceForm, [field]: Number(e.target.value) })
                }
                placeholder={
                  field === 'gramsPerEquivalent'
                    ? 'Gramos'
                    : field === 'equivalentCount'
                      ? 'Cantidad'
                      : field
                }
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleCreateEquivalence}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)]"
          >
            Agregar equivalencia
          </button>
        </div>
      </Modal>

      {/* Create/Edit Plan Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPlan ? 'Editar Plan Nutricional' : 'Nuevo Plan Nutricional'}
        size="2xl"
      >
        <div className="space-y-5">
          <div
            className="grid grid-cols-3 gap-2 rounded-xl bg-[var(--surface)] p-1"
            aria-label="Pasos del plan nutricional"
          >
            {[
              [1, 'Datos básicos'],
              [2, 'Comidas'],
              [3, 'Revisión'],
            ].map(([step, label]) => (
              <button
                key={step}
                type="button"
                onClick={() => setPlanStep(step as 1 | 2 | 3)}
                className={`rounded-lg px-2 py-2 text-xs font-bold transition-colors ${planStep === step ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              >
                <span className="mr-1.5">{step}.</span>
                {label}
              </button>
            ))}
          </div>

          <div className={planStep === 1 ? 'space-y-5' : 'hidden'}>
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
          </div>

          <div
            className={`${planStep === 1 ? '' : 'hidden'} grid grid-cols-1 gap-4 sm:grid-cols-2`}
          >
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

          <div className={planStep === 3 ? 'space-y-5' : 'hidden'}>
            <FormField label="Notas del Coach">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                placeholder="Instrucciones adicionales para el cliente..."
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Estado">
                <select
                  value={form.status || 'DRAFT'}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as NutritionPlanRequest['status'] })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)]"
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="SCHEDULED">Programado</option>
                  <option value="ACTIVE">Activo</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
              </FormField>
              <FormField label="Fecha de inicio">
                <Input
                  type="date"
                  value={form.startsOn || ''}
                  onChange={(e) => setForm({ ...form, startsOn: e.target.value })}
                />
              </FormField>
              <FormField label="Fecha de fin">
                <Input
                  type="date"
                  value={form.endsOn || ''}
                  onChange={(e) => setForm({ ...form, endsOn: e.target.value })}
                />
              </FormField>
            </div>
          </div>

          {/* Meals Section */}
          <div className={planStep === 2 ? '' : 'hidden'}>
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
                          {meal.time} —{' '}
                          {meal.foods.length +
                            (meal.options || []).reduce(
                              (total, option) => total + option.items.length,
                              0
                            )}{' '}
                          elemento
                          {meal.foods.length +
                            (meal.options || []).reduce(
                              (total, option) => total + option.items.length,
                              0
                            ) !==
                          1
                            ? 's'
                            : ''}
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
            onClick={planStep === 1 ? () => setShowModal(false) : handlePlanBack}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--surface)]"
          >
            {planStep === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          <button
            onClick={planStep === 3 ? handleSave : handlePlanNext}
            disabled={isSaving}
            className="rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-[var(--accent-text)] hover:opacity-90 disabled:opacity-50"
          >
            {isSaving
              ? 'Guardando...'
              : planStep === 3
                ? editingPlan
                  ? 'Actualizar plan'
                  : 'Crear plan'
                : 'Continuar'}
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

          <details className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <summary className="mb-2 cursor-pointer list-none text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
              Opciones de sustitución{' '}
              <span className="ml-1 font-normal normal-case">(opcional)</span>
            </summary>
            {mealForm.options.length > 0 && (
              <div className="mb-3 space-y-1">
                {mealForm.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between rounded-md bg-[var(--surface)] px-2 py-1.5 text-xs"
                  >
                    <span className="min-w-0 truncate text-[var(--text-primary)]">
                      <strong>{option.name}</strong> · {option.items.length} elemento
                      {option.items.length === 1 ? '' : 's'}
                    </span>
                    <span className="ml-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOptionForm({
                            id: option.id,
                            name: option.name,
                            items: option.items.map((item) => ({
                              foodId: item.foodId,
                              recipeId: item.recipeId,
                              quantity: item.quantity,
                              sortOrder: item.sortOrder,
                            })),
                          })
                        }
                        className="text-[var(--accent)] hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOption(option)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Quitar
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mb-2 text-[11px] text-[var(--text-muted)]">
              Agrega al menos un alimento o receta y ajusta la cantidad antes de guardar.
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Input
                value={optionForm.name}
                onChange={(e) => setOptionForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="Nombre de la opción"
              />
              <button
                type="button"
                onClick={saveOption}
                disabled={isSavingOption || optionForm.items.length === 0}
                className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-[var(--accent-text)] disabled:opacity-40"
              >
                {isSavingOption
                  ? 'Guardando...'
                  : editingPlan
                    ? 'Guardar opción'
                    : 'Agregar opción'}
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <select
                value=""
                onChange={(e) => addOptionItem('foodId', e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
              >
                <option value="">Agregar alimento</option>
                {foodOptions.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name}
                  </option>
                ))}
              </select>
              <select
                value=""
                onChange={(e) => addOptionItem('recipeId', e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
              >
                <option value="">Agregar receta</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
            </div>
            {optionForm.items.length > 0 && (
              <div className="mt-2 space-y-1">
                {optionForm.items.map((item, index) => (
                  <div
                    key={`${item.foodId || item.recipeId}-${index}`}
                    className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {item.foodId
                        ? foodOptions.find((food) => food.id === item.foodId)?.name
                        : recipes.find((recipe) => recipe.id === item.recipeId)?.name}
                    </span>
                    <input
                      value={item.quantity || ''}
                      onChange={(e) =>
                        setOptionForm((current) => ({
                          ...current,
                          items: current.items.map((value, i) =>
                            i === index ? { ...value, quantity: e.target.value } : value
                          ),
                        }))
                      }
                      placeholder="Cantidad"
                      className="w-24 rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOptionForm((current) => ({
                          ...current,
                          items: current.items.filter((_, i) => i !== index),
                        }))
                      }
                      className="text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </details>

          {/* Foods */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
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
            <select
              value={equivalentGroup}
              onChange={(e) => setEquivalentGroup(e.target.value)}
              className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="">Todos los grupos de equivalencia</option>
              {equivalentGroups.map((group) => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
            <Input
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              placeholder="Buscar alimentos globales y personalizados..."
            />

            <p className="mt-3 text-[10px] text-[var(--text-muted)]">
              Las recetas se asignan únicamente desde las opciones de comida.
            </p>

            {mealForm.foods.length === 0 ? (
              <p className="text-center text-xs text-[var(--text-muted)]">Sin alimentos</p>
            ) : (
              <div className="space-y-2">
                {mealForm.foods.map((food, fi) => (
                  <div
                    key={fi}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"
                  >
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
                      <select
                        defaultValue=""
                        onChange={(e) => selectCatalogFood(fi, e.target.value)}
                        className="col-span-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      >
                        <option value="">Seleccionar del catálogo (opcional)</option>
                        {foodOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                            {item.category ? ` — ${item.category}` : ''} (
                            {item.catalogSource === 'GLOBAL' ? 'Global' : 'Personalizado'})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => registerMealFood(food)}
                        className="col-span-2 text-left text-[10px] font-bold text-[var(--accent)] hover:underline"
                      >
                        Registrar este alimento en el catálogo
                      </button>
                      {foodEquivalences[fi] && (
                        <p className="col-span-2 text-[10px] text-[var(--accent)]">
                          Porción equivalente: {foodEquivalences[fi]}
                        </p>
                      )}
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

      <Modal
        isOpen={showFoodForm}
        onClose={() => setShowFoodForm(false)}
        title="Crear alimento personalizado"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            Se guardará en el catálogo de tu gimnasio y se seleccionará en esta comida.
          </p>
          <Input
            value={foodForm.name}
            onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
            placeholder="Nombre del alimento"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={foodForm.servingSize}
              onChange={(e) => setFoodForm({ ...foodForm, servingSize: Number(e.target.value) })}
              placeholder="Porción"
            />
            <Input
              value={foodForm.servingUnit}
              onChange={(e) => setFoodForm({ ...foodForm, servingUnit: e.target.value })}
              placeholder="Unidad (g, ml...)"
            />
            <Input
              type="number"
              value={foodForm.servingGrams}
              onChange={(e) => setFoodForm({ ...foodForm, servingGrams: Number(e.target.value) })}
              placeholder="Gramos por porción"
            />
            {(['calories', 'protein', 'carbs', 'fats', 'fiber'] as const).map((field) => (
              <Input
                key={field}
                type="number"
                value={foodForm[field]}
                onChange={(e) => setFoodForm({ ...foodForm, [field]: Number(e.target.value) })}
                placeholder={
                  field === 'calories'
                    ? 'Kcal'
                    : field === 'protein'
                      ? 'Proteína (g)'
                      : field === 'carbs'
                        ? 'Carbohidratos (g)'
                        : field === 'fats'
                          ? 'Grasas (g)'
                          : 'Fibra (g)'
                }
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={() => setShowFoodForm(false)}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold text-[var(--text-secondary)]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateFood}
              disabled={isCreatingFood}
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--accent-text)] disabled:opacity-50"
            >
              {isCreatingFood ? 'Creando...' : 'Crear y seleccionar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!historyPlan}
        onClose={() => setHistoryPlan(null)}
        title={`Historial: ${historyPlan?.name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {loadingVersions ? (
            <p className="text-sm text-[var(--text-muted)]">Cargando versiones...</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No hay versiones anteriores.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {versions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => loadVersion(version)}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold ${selectedVersion?.id === version.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)]'}`}
                >
                  Versión {version.versionNumber}
                  <span className="ml-2 font-normal">
                    {new Date(version.createdAt).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedHistorySnapshot && (
            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">
                  {selectedHistorySnapshot.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {selectedHistorySnapshot.targetCalories} kcal · P{' '}
                  {selectedHistorySnapshot.targetProtein}g · C {selectedHistorySnapshot.targetCarbs}
                  g · G {selectedHistorySnapshot.targetFats}g
                </p>
              </div>
              {selectedHistorySnapshot.meals.map((meal, index) => (
                <div key={meal.id || index} className="rounded-lg bg-[var(--card)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-primary)]">{meal.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{meal.time}</span>
                  </div>
                  {meal.foods.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-[var(--text-secondary)]">
                      {meal.foods.map((food, foodIndex) => (
                        <p key={food.id || foodIndex}>
                          {food.name} · {food.quantity || '-'} · {food.calories || 0} kcal
                        </p>
                      ))}
                    </div>
                  )}
                  {meal.options?.map((option) => (
                    <div
                      key={option.id || option.name}
                      className="mt-2 rounded-lg border border-[var(--accent)]/20 p-2 text-xs"
                    >
                      <p className="font-bold text-[var(--accent)]">Opción: {option.name}</p>
                      {option.items.map((item, itemIndex) => (
                        <p key={item.id || itemIndex} className="text-[var(--text-secondary)]">
                          {item.foodName || item.recipeName || 'Elemento'} · {item.quantity || '-'}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
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
