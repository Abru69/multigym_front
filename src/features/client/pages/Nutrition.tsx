import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Droplets,
  History,
  Info,
  Loader2,
  NotebookPen,
  Utensils,
} from 'lucide-react'
import { useNutritionStore } from '@/features/client/store/nutritionStore'
import {
  getMyNutritionAdherence,
  getMyNutritionPlanVersions,
  getNutritionPlanVersion,
  getRecipeById,
  getRecipes,
  getResponseItems,
  saveMyNutritionAdherence,
} from '@/lib/api'
import type {
  NutritionAdherenceStatus,
  NutritionMealAdherenceDTO,
  NutritionPlanDTO,
  NutritionPlanVersionDTO,
  RecipeDTO,
} from '@/types'
import { Modal } from '@/components/ui/Modal'

const GREEN = 'var(--accent)'
const DARK_GREEN = 'var(--text-primary)'
const PALE_GREEN = 'var(--accent-muted)'

const macroConfig = [
  { key: 'calories', label: 'Calorías', short: 'kcal', color: GREEN },
  { key: 'protein', label: 'Proteína', short: 'g', color: 'var(--success, #22c55e)' },
  { key: 'carbs', label: 'Carbohidratos', short: 'g', color: 'var(--info, #3b82f6)' },
  { key: 'fats', label: 'Grasas', short: 'g', color: 'var(--warning, #f59e0b)' },
] as const

const statusLabel: Record<NutritionAdherenceStatus, string> = {
  COMPLETED: 'Completada',
  PARTIAL: 'Parcial',
  SKIPPED: 'Omitida',
}

export default function Nutrition() {
  const { plan, mealCompletion, waterGlasses, isLoading, error, loadPlan, setWaterGlasses } =
    useNutritionStore()
  const [versions, setVersions] = useState<NutritionPlanVersionDTO[]>([])
  const [historicalPlan, setHistoricalPlan] = useState<NutritionPlanDTO | null>(null)
  const [selectedHistoryVersion, setSelectedHistoryVersion] = useState<number | null>(null)
  const [historyError, setHistoryError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [adherence, setAdherence] = useState<Record<string, NutritionMealAdherenceDTO>>({})
  const [versionId, setVersionId] = useState('')
  const [savingMeal, setSavingMeal] = useState<string | null>(null)
  const [mealNote, setMealNote] = useState<Record<string, string>>({})
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({})
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({})
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDTO | null>(null)
  const [recipeCatalog, setRecipeCatalog] = useState<RecipeDTO[]>([])

  useEffect(() => {
    loadPlan()
    getMyNutritionPlanVersions()
      .then((response) => {
        const items = getResponseItems<NutritionPlanVersionDTO>(response)
        if (items[0]) setVersionId(items[0].id)
      })
      .catch(() => {})
    getMyNutritionAdherence()
      .then((response) => {
        const items = getResponseItems<NutritionMealAdherenceDTO>(response)
        setAdherence(
          Object.fromEntries(items.map((item) => [`${item.date}:${item.mealReference}`, item]))
        )
      })
      .catch(() => {})
    getRecipes({ active: true, size: 9999 })
      .then((response) => setRecipeCatalog(getResponseItems<RecipeDTO>(response)))
      .catch(() => {})
  }, [loadPlan])

  const today = new Date().toISOString().slice(0, 10)
  const meals = plan?.meals || []
  const metricsFor = (meal: (typeof meals)[number]) => {
    const foods = meal.foods.reduce(
      (totals, food) => ({
        calories: totals.calories + (food.calories ?? 0),
        protein: totals.protein + (food.protein ?? 0),
        carbs: totals.carbs + (food.carbs ?? 0),
        fats: totals.fats + (food.fats ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
    return {
      calories: meal.calories ?? foods.calories,
      protein: meal.protein ?? foods.protein,
      carbs: meal.carbs ?? foods.carbs,
      fats: meal.fats ?? foods.fats,
    }
  }
  const statusFor = (mealId: string) => adherence[`${today}:${mealId}`]?.status
  const selectedOptionFor = (mealId: string) =>
    selectedOptions[mealId] ||
    adherence[`${today}:${mealId}`]?.selectedOptionId ||
    meals.find((meal) => meal.id === mealId)?.options?.[0]?.id
  const completionWeight = (mealId: string) => {
    const status = statusFor(mealId)
    if (status === 'COMPLETED') return 1
    if (status === 'PARTIAL') return 0.5
    return !status && mealCompletion[mealId] ? 1 : 0
  }
  const completedCount = meals.filter((meal) => completionWeight(meal.id) === 1).length
  const completedWeight = meals.reduce((sum, meal) => sum + completionWeight(meal.id), 0)
  const dayProgress = meals.length ? Math.round((completedWeight / meals.length) * 100) : 0
  const calcProgress = (current: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0

  const dailyMacros = plan
    ? macroConfig.reduce(
        (result, macro) => {
          const key = macro.key as 'calories' | 'protein' | 'carbs' | 'fats'
          result[key] = {
            current: Math.round(
              meals.reduce(
                (sum, meal) => sum + metricsFor(meal)[key] * completionWeight(meal.id),
                0
              )
            ),
            target:
              plan[
                key === 'calories'
                  ? 'targetCalories'
                  : (`target${key[0].toUpperCase()}${key.slice(1)}` as
                      'targetProtein' | 'targetCarbs' | 'targetFats')
              ],
          }
          return result
        },
        {} as Record<'calories' | 'protein' | 'carbs' | 'fats', { current: number; target: number }>
      )
    : {
        calories: { current: 0, target: 0 },
        protein: { current: 0, target: 0 },
        carbs: { current: 0, target: 0 },
        fats: { current: 0, target: 0 },
      }

  const recipeNameForItem = (item: object) => {
    const value = item as { recipeName?: string; foodName?: string; name?: string }
    return (
      value.recipeName ||
      recipeCatalog.find(
        (recipe) =>
          recipe.name.trim().toLowerCase() === (value.foodName || value.name)?.trim().toLowerCase()
      )?.name
    )
  }
  const recipeIdForItem = (item: object) => {
    const value = item as { recipeId?: string; foodName?: string; name?: string }
    return (
      value.recipeId ||
      recipeCatalog.find(
        (recipe) =>
          recipe.name.trim().toLowerCase() === (value.foodName || value.name)?.trim().toLowerCase()
      )?.id
    )
  }
  const openRecipe = async (recipeId?: string, recipeName?: string) => {
    try {
      if (recipeId) {
        const response = await getRecipeById(recipeId)
        if (response.dto) return setSelectedRecipe(response.dto)
      }
      const recipe = recipeCatalog.find(
        (item) => item.name.trim().toLowerCase() === recipeName?.trim().toLowerCase()
      )
      if (recipe) setSelectedRecipe(recipe)
    } catch {
      // Recipe details are optional.
    }
  }

  const setMealStatus = async (
    mealId: string,
    status: NutritionAdherenceStatus,
    selectedOptionId?: string
  ) => {
    if (selectedOptionId)
      setSelectedOptions((current) => ({ ...current, [mealId]: selectedOptionId }))
    if (!versionId) return
    setSavingMeal(mealId)
    try {
      const response = await saveMyNutritionAdherence({
        date: today,
        nutritionPlanVersionId: versionId,
        mealReference: mealId,
        status,
        notes: mealNote[mealId] || undefined,
        selectedOptionId,
      })
      if (response.dto)
        setAdherence((current) => ({ ...current, [`${today}:${mealId}`]: response.dto! }))
    } finally {
      setSavingMeal(null)
    }
  }

  const openHistory = async () => {
    setShowHistory(true)
    setHistoricalPlan(null)
    setSelectedHistoryVersion(null)
    setHistoryError('')
    try {
      const response = await getMyNutritionPlanVersions()
      const items = getResponseItems<NutritionPlanVersionDTO>(response)
      setVersions(items)
      if (items[0]) {
        const latest = await getNutritionPlanVersion(
          items[0].nutritionPlanId,
          items[0].versionNumber
        )
        if (latest.dto) {
          setHistoricalPlan(JSON.parse(latest.dto.snapshot) as NutritionPlanDTO)
          setSelectedHistoryVersion(items[0].versionNumber)
        }
      }
    } catch {
      setHistoricalPlan(plan)
      setHistoryError(
        'No se pudo cargar el detalle histórico. Puedes consultar las versiones disponibles.'
      )
    }
  }
  const viewVersion = async (version: NutritionPlanVersionDTO) => {
    const response = await getNutritionPlanVersion(version.nutritionPlanId, version.versionNumber)
    if (response.dto) {
      setHistoricalPlan(JSON.parse(response.dto.snapshot) as NutritionPlanDTO)
      setSelectedHistoryVersion(version.versionNumber)
    }
  }

  if (isLoading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: GREEN }} />
      </div>
    )
  if (error)
    return (
      <EmptyNutrition
        icon={<Info size={42} />}
        title="No pudimos cargar tu plan"
        message={error}
        action={
          <button
            type="button"
            onClick={loadPlan}
            className="rounded-lg px-5 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: GREEN }}
          >
            Reintentar
          </button>
        }
      />
    )
  if (!plan)
    return (
      <EmptyNutrition
        icon={<Utensils size={42} />}
        title="Aún no tienes un plan nutricional"
        message="Tu nutriólogo todavía no te ha asignado un plan. Cuando esté disponible aparecerá aquí."
      />
    )

  return (
    <div className="min-h-full bg-[var(--bg-secondary)] px-4 py-6 text-[var(--text-primary)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-7">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p
              className="mb-2 text-xs font-bold tracking-[0.18em] uppercase"
              style={{ color: GREEN }}
            >
              Mi alimentación
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Plan de alimentación</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Sigue tu plan y alcanza tus objetivos un día a la vez.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)]">
              {plan.name}
            </span>
            <button
              type="button"
              onClick={openHistory}
              className="flex items-center gap-2 rounded-lg border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent)]"
            >
              <History size={14} /> Historial
            </button>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)]"
        >
          <div className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-7">
            <div className="relative mx-auto h-36 w-36 shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="58" fill="none" stroke={PALE_GREEN} strokeWidth="13" />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="58"
                  fill="none"
                  stroke={GREEN}
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeDasharray="364.4"
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 - (364.4 * dayProgress) / 100 }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-3xl font-black" style={{ color: DARK_GREEN }}>
                  {dayProgress}%
                </strong>
                <span className="text-xs font-bold text-[var(--text-muted)]">del día</span>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold" style={{ color: GREEN }}>
                    Tu progreso de hoy
                  </p>
                  <h2
                    className="mt-1 text-2xl font-black"
                    style={{ fontFamily: 'Blogger Sans, Arial, sans-serif' }}
                  >
                    {dayProgress >= 75
                      ? 'Vas muy bien'
                      : dayProgress > 0
                        ? 'Sigue avanzando'
                        : 'Comienza tu día'}
                  </h2>
                </div>
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{ backgroundColor: PALE_GREEN, color: GREEN }}
                >
                  {completedCount} de {meals.length} comidas
                </span>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                Registra cada comida para llevar un seguimiento de tu plan y mantenerte enfocado en
                tus objetivos.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {macroConfig.map((macro) => {
                  const data = dailyMacros[macro.key]
                  return (
                    <div key={macro.key} className="rounded-xl bg-[var(--surface)] p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[var(--text-muted)]">
                          {macro.label}
                        </span>
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: macro.color }}
                        />
                      </div>
                      <strong className="text-lg font-black">
                        {data.current}
                        <small className="ml-1 text-[10px] font-bold text-[var(--text-muted)]">
                          / {data.target}
                          {macro.short}
                        </small>
                      </strong>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${calcProgress(data.current, data.target)}%` }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: macro.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-7 lg:grid-cols-[1fr_280px]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-bold tracking-[0.16em] uppercase"
                  style={{ color: GREEN }}
                >
                  Tu día
                </p>
                <h2 className="mt-1 text-2xl font-black">Comidas de hoy</h2>
              </div>
              <span className="text-right text-xs font-bold text-[var(--text-muted)]">
                {new Date().toLocaleDateString('es-MX', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
            <div className="space-y-4">
              {meals.map((meal, index) => {
                const status = statusFor(meal.id)
                const completed = completionWeight(meal.id) === 1
                const expanded = expandedMeals[meal.id] ?? index === 0
                const metrics = metricsFor(meal)
                const selectedOption = (meal.options ?? []).find(
                  (option) => option.id === selectedOptionFor(meal.id)
                )
                const items = selectedOption?.items
                return (
                  <motion.article
                    key={meal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.04 }}
                    className={`overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] transition ${completed ? 'ring-1 ring-[var(--accent)]/30' : ''}`}
                  >
                    <div className="flex items-center gap-3 p-4 sm:p-5">
                      <button
                        type="button"
                        disabled={savingMeal === meal.id || !versionId}
                        onClick={() => setMealStatus(meal.id, completed ? 'SKIPPED' : 'COMPLETED')}
                        aria-label={
                          completed
                            ? `Marcar ${meal.name} como omitida`
                            : `Marcar ${meal.name} como completada`
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] transition hover:scale-105"
                        style={{ color: completed ? GREEN : 'var(--text-muted)' }}
                      >
                        {savingMeal === meal.id ? (
                          <Loader2 size={21} className="animate-spin" />
                        ) : completed ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`truncate text-base font-black sm:text-lg ${completed ? 'text-[var(--text-secondary)] line-through' : ''}`}
                          >
                            {meal.name}
                          </h3>
                          {status && (
                            <span
                              className="rounded-full bg-[var(--surface)] px-2 py-1 text-[10px] font-bold"
                              style={{ color: status === 'COMPLETED' ? GREEN : 'var(--warning)' }}
                            >
                              {statusLabel[status]}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[var(--text-muted)]">
                          <Clock3 size={13} /> {meal.time} <span className="mx-1">·</span>{' '}
                          {metrics.calories || 0} kcal
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMeals((current) => ({ ...current, [meal.id]: !expanded }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)]"
                        aria-label={expanded ? 'Ocultar detalle' : 'Ver detalle'}
                      >
                        {expanded ? <ChevronDown size={19} /> : <ChevronRight size={19} />}
                      </button>
                    </div>
                    {expanded && (
                      <div className="border-t border-[var(--border)] px-4 pt-4 pb-4 sm:px-5">
                        <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-[var(--surface)] p-3">
                          <MacroValue label="Proteína" value={`${metrics.protein || 0}g`} />
                          <MacroValue label="Carbos" value={`${metrics.carbs || 0}g`} />
                          <MacroValue label="Grasas" value={`${metrics.fats || 0}g`} />
                        </div>
                        <div className="space-y-2">
                          {(items || meal.foods).map((item, itemIndex) => {
                            const recipeName = recipeNameForItem(item)
                            return (
                              <div
                                key={item.id || itemIndex}
                                className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                              >
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: GREEN }}
                                />
                                <span className="min-w-0 flex-1 text-[var(--text-secondary)]">
                                  {recipeName ||
                                    ('name' in item ? item.name : item.foodName || 'Elemento')}
                                  <small className="ml-1 text-xs text-[var(--text-muted)]">
                                    {item.quantity ? `· ${item.quantity}` : ''}
                                  </small>
                                </span>
                                {recipeName && (
                                  <button
                                    type="button"
                                    onClick={() => openRecipe(recipeIdForItem(item), recipeName)}
                                    className="shrink-0 text-xs font-bold"
                                    style={{ color: GREEN }}
                                  >
                                    Ver receta
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="mr-auto text-[11px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                            ¿Cómo te fue?
                          </span>
                          {(['COMPLETED', 'PARTIAL', 'SKIPPED'] as NutritionAdherenceStatus[]).map(
                            (itemStatus) => (
                              <button
                                key={itemStatus}
                                type="button"
                                disabled={savingMeal === meal.id || !versionId}
                                onClick={() => setMealStatus(meal.id, itemStatus)}
                                className="rounded-lg border px-3 py-2 text-[11px] font-bold transition"
                                style={
                                  status === itemStatus
                                    ? { borderColor: GREEN, backgroundColor: GREEN, color: 'white' }
                                    : {
                                        borderColor: 'var(--border)',
                                        backgroundColor: 'var(--card)',
                                        color: 'var(--text-secondary)',
                                      }
                                }
                              >
                                {statusLabel[itemStatus]}
                              </button>
                            )
                          )}
                        </div>
                        {(meal.options ?? []).length > 0 && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedOptions((current) => ({
                                  ...current,
                                  [meal.id]: !current[meal.id],
                                }))
                              }
                              className="flex items-center gap-1 text-xs font-bold"
                              style={{ color: GREEN }}
                            >
                              <ChevronDown
                                size={14}
                                className={expandedOptions[meal.id] ? 'rotate-180' : ''}
                              />{' '}
                              Ver opciones de esta comida
                            </button>
                            {expandedOptions[meal.id] && (
                              <div className="mt-2 space-y-2">
                                {meal.options?.map((option) => (
                                  <button
                                    type="button"
                                    key={option.id}
                                    onClick={() =>
                                      setMealStatus(meal.id, status || 'COMPLETED', option.id)
                                    }
                                    className="w-full rounded-xl border p-3 text-left text-xs transition"
                                    style={
                                      selectedOptionFor(meal.id) === option.id
                                        ? { borderColor: GREEN, backgroundColor: PALE_GREEN }
                                        : {
                                            borderColor: 'var(--border)',
                                            backgroundColor: 'var(--surface)',
                                          }
                                    }
                                  >
                                    <strong className="block text-[var(--text-primary)]">
                                      {option.name}
                                    </strong>
                                    <span className="mt-1 block text-[var(--text-muted)]">
                                      {option.items
                                        .map(
                                          (item) =>
                                            `${item.foodName || item.recipeName || 'Elemento'}${item.quantity ? ` · ${item.quantity}` : ''}`
                                        )
                                        .join(' · ')}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3">
                          <NotebookPen size={14} className="text-[var(--text-muted)]" />
                          <input
                            aria-label={`Nota para ${meal.name}`}
                            value={
                              mealNote[meal.id] ?? adherence[`${today}:${meal.id}`]?.notes ?? ''
                            }
                            onChange={(event) =>
                              setMealNote((current) => ({
                                ...current,
                                [meal.id]: event.target.value,
                              }))
                            }
                            onBlur={() => status && setMealStatus(meal.id, status)}
                            placeholder="Agregar una nota opcional"
                            className="min-w-0 flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                          />
                        </div>
                      </div>
                    )}
                  </motion.article>
                )
              })}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-bold tracking-wider uppercase"
                    style={{ color: GREEN }}
                  >
                    Meta diaria
                  </p>
                  <h3 className="mt-1 text-xl font-black">Hidratación</h3>
                </div>
                <Droplets size={25} className="text-[var(--info)]" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setWaterGlasses(index + 1)}
                    aria-label={`Registrar ${index + 1} vasos`}
                    className="flex h-10 items-center justify-center rounded-lg border transition"
                    style={
                      index < waterGlasses
                        ? {
                            borderColor: 'var(--info)',
                            backgroundColor: 'var(--info-muted)',
                            color: 'var(--info)',
                          }
                        : {
                            borderColor: 'var(--border)',
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text-muted)',
                          }
                    }
                  >
                    <Droplets size={16} fill={index < waterGlasses ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs font-bold text-[var(--text-muted)]">
                {waterGlasses} de 8 vasos registrados
              </p>
            </section>
            {plan.notes && (
              <section className="rounded-[20px] p-5" style={{ backgroundColor: PALE_GREEN }}>
                <div className="mb-3 flex items-center gap-2" style={{ color: GREEN }}>
                  <Info size={17} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    Mensaje de tu nutriólogo
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{plan.notes}</p>
              </section>
            )}
          </aside>
        </div>
      </div>

      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="Historial del plan"
        size="lg"
      >
        <div className="space-y-3">
          {historicalPlan && (
            <div className="rounded-xl p-4" style={{ backgroundColor: PALE_GREEN }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black" style={{ color: DARK_GREEN }}>
                    {historicalPlan.name}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {historicalPlan.targetCalories} kcal · P {historicalPlan.targetProtein}g · C{' '}
                    {historicalPlan.targetCarbs}g · G {historicalPlan.targetFats}g
                  </p>
                </div>
                <span className="text-xs font-bold" style={{ color: GREEN }}>
                  Versión {selectedHistoryVersion}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {historicalPlan.meals.map((meal, index) => (
                  <div
                    key={meal.id || index}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
                  >
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>{meal.name}</span>
                      <span className="text-xs font-normal text-[var(--text-muted)]">
                        {meal.time}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {meal.foods.map(
                        (food, foodIndex) =>
                          `${food.name}${food.quantity ? ` · ${food.quantity}` : ''}${foodIndex < meal.foods.length - 1 ? ' | ' : ''}`
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {historyError && (
            <p className="rounded-lg bg-[var(--warning-muted)] p-3 text-xs text-[var(--warning)]">
              {historyError}
            </p>
          )}
          {versions.map((version) => (
            <button
              key={version.id}
              type="button"
              onClick={() => viewVersion(version)}
              className="flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm"
              style={
                selectedHistoryVersion === version.versionNumber
                  ? { borderColor: GREEN, backgroundColor: PALE_GREEN }
                  : { borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }
              }
            >
              <span className="font-bold">Versión {version.versionNumber}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date(version.createdAt).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </Modal>
      <Modal
        isOpen={Boolean(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
        title={selectedRecipe?.name || 'Receta'}
        size="md"
      >
        {selectedRecipe && (
          <div className="space-y-4 text-sm text-[var(--text-secondary)]">
            <div
              className="grid grid-cols-2 gap-2 rounded-xl p-3 text-xs"
              style={{ backgroundColor: PALE_GREEN }}
            >
              <span>
                Porciones: <strong>{selectedRecipe.servings}</strong>
              </span>
              <span>
                Preparación: <strong>{selectedRecipe.preparationMinutes || '-'} min</strong>
              </span>
              <span>
                Calorías: <strong>{Math.round(selectedRecipe.caloriesPerServing)} kcal</strong>
              </span>
              <span>
                Dificultad: <strong>{selectedRecipe.difficulty || '-'}</strong>
              </span>
            </div>
            <div>
              <h4 className="mb-2 font-black" style={{ color: DARK_GREEN }}>
                Ingredientes
              </h4>
              <ul className="space-y-1">
                {(selectedRecipe.ingredients || []).map((item) => (
                  <li key={item.id || item.foodId}>
                    • {item.foodName || 'Ingrediente'} · {item.grams} g
                  </li>
                ))}
              </ul>
            </div>
            {selectedRecipe.instructions && (
              <div>
                <h4 className="mb-2 font-black" style={{ color: DARK_GREEN }}>
                  Instrucciones
                </h4>
                <p className="whitespace-pre-line">{selectedRecipe.instructions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function MacroValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

function EmptyNutrition({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode
  title: string
  message: string
  action?: React.ReactNode
}) {
  return (
    <div
      className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center"
      style={{ color: DARK_GREEN }}
    >
      <div className="mb-4 rounded-full p-5" style={{ backgroundColor: PALE_GREEN, color: GREEN }}>
        {icon}
      </div>
      <h1 className="mb-2 text-2xl font-black">{title}</h1>
      <p className="mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">{message}</p>
      {action}
    </div>
  )
}
