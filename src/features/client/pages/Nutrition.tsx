import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Clock,
  Utensils,
  Droplets,
  Info,
  Loader2,
  History,
  ChevronDown,
} from 'lucide-react'
import { useNutritionStore } from '@/features/client/store/nutritionStore'
import {
  getMyNutritionPlanVersions,
  getNutritionPlanVersion,
  getResponseItems,
  getMyNutritionAdherence,
  saveMyNutritionAdherence,
  getRecipeById,
  getRecipes,
} from '@/lib/api'
import type {
  NutritionAdherenceStatus,
  NutritionMealAdherenceDTO,
  NutritionPlanDTO,
  NutritionPlanVersionDTO,
  RecipeDTO,
} from '@/types'
import { Modal } from '@/components/ui/Modal'

const macroConfig = [
  { key: 'calories', label: 'Calorías', color: 'var(--accent)', unit: 'kcal' },
  { key: 'protein', label: 'Proteína', color: 'var(--success, #22c55e)', unit: 'g' },
  { key: 'carbs', label: 'Carbos', color: 'var(--info, #3b82f6)', unit: 'g' },
  { key: 'fats', label: 'Grasas', color: 'var(--warning, #f59e0b)', unit: 'g' },
] as const

export default function Nutrition() {
  const {
    plan,
    mealCompletion,
    waterGlasses,
    isLoading,
    error,
    loadPlan,
    toggleMeal,
    setWaterGlasses,
  } = useNutritionStore()
  const [versions, setVersions] = useState<NutritionPlanVersionDTO[]>([])
  const [historicalPlan, setHistoricalPlan] = useState<NutritionPlanDTO | null>(null)
  const [selectedHistoryVersion, setSelectedHistoryVersion] = useState<number | null>(null)
  const [historyError, setHistoryError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [adherence, setAdherence] = useState<Record<string, NutritionMealAdherenceDTO>>({})
  const [versionId, setVersionId] = useState('')
  const [savingMeal, setSavingMeal] = useState<string | null>(null)
  const [mealNote, setMealNote] = useState<Record<string, string>>({})
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
    getRecipes({ active: true, size: 9999 }).then((response) => setRecipeCatalog(getResponseItems<RecipeDTO>(response))).catch(() => {})
  }, [loadPlan])

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
        const latest = await getNutritionPlanVersion(items[0].nutritionPlanId, items[0].versionNumber)
        if (latest.dto) {
          setHistoricalPlan(JSON.parse(latest.dto.snapshot) as NutritionPlanDTO)
          setSelectedHistoryVersion(items[0].versionNumber)
        }
      }
    } catch {
      setHistoricalPlan(plan)
      setHistoryError('No se pudo cargar el detalle histórico. Puedes consultar las versiones disponibles.')
    }
  }
  const viewVersion = async (version: NutritionPlanVersionDTO) => {
    const response = await getNutritionPlanVersion(version.nutritionPlanId, version.versionNumber)
    if (response.dto) {
      setHistoricalPlan(JSON.parse(response.dto.snapshot) as NutritionPlanDTO)
      setSelectedHistoryVersion(version.versionNumber)
    }
  }

  const calcProgress = (current: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0

  const meals = plan?.meals || []
  const today = new Date().toISOString().slice(0, 10)
  const statusFor = (mealId: string) => adherence[`${today}:${mealId}`]?.status
  const selectedOptionFor = (mealId: string) => selectedOptions[mealId] || adherence[`${today}:${mealId}`]?.selectedOptionId || meals.find((meal) => meal.id === mealId)?.options?.[0]?.id
  const openRecipe = async (recipeId?: string, recipeName?: string) => {
    try {
      if (recipeId) {
        const response = await getRecipeById(recipeId)
        if (response.dto) return setSelectedRecipe(response.dto)
      }
      const recipe = recipeCatalog.find((item) => item.name.trim().toLowerCase() === recipeName?.trim().toLowerCase())
      if (recipe) setSelectedRecipe(recipe)
    } catch { /* Detail is optional. */ }
  }
  const recipeNameForItem = (item: { recipeName?: string; foodName?: string }) => item.recipeName || recipeCatalog.find((recipe) => recipe.name.trim().toLowerCase() === item.foodName?.trim().toLowerCase())?.name
  const recipeIdForItem = (item: { recipeId?: string; foodName?: string }) => item.recipeId || recipeCatalog.find((recipe) => recipe.name.trim().toLowerCase() === item.foodName?.trim().toLowerCase())?.id
  const completedCount = meals.filter(
    (m) => statusFor(m.id) === 'COMPLETED' || (!statusFor(m.id) && mealCompletion[m.id])
  ).length

  const setMealStatus = async (
    mealId: string,
    status: NutritionAdherenceStatus,
    selectedOptionId?: string
  ) => {
    if (selectedOptionId) setSelectedOptions((current) => ({ ...current, [mealId]: selectedOptionId }))
    if (!versionId) return
    setSavingMeal(mealId)
    if (selectedOptionId) {
      setAdherence((current) => ({
        ...current,
        [`${today}:${mealId}`]: { ...(current[`${today}:${mealId}`] || {}), mealReference: mealId, selectedOptionId, status } as NutritionMealAdherenceDTO,
      }))
    }
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

  const dailyMacros = plan
    ? {
        calories: {
          current: meals.reduce((sum, m) => sum + (mealCompletion[m.id] ? m.calories : 0), 0),
          target: plan.targetCalories,
        },
        protein: {
          current: meals.reduce((sum, m) => sum + (mealCompletion[m.id] ? m.protein : 0), 0),
          target: plan.targetProtein,
        },
        carbs: {
          current: meals.reduce((sum, m) => sum + (mealCompletion[m.id] ? m.carbs : 0), 0),
          target: plan.targetCarbs,
        },
        fats: {
          current: meals.reduce((sum, m) => sum + (mealCompletion[m.id] ? m.fats : 0), 0),
          target: plan.targetFats,
        },
      }
    : {
        calories: { current: 0, target: 2400 },
        protein: { current: 0, target: 160 },
        carbs: { current: 0, target: 250 },
        fats: { current: 0, target: 80 },
      }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <Info size={42} className="mb-4 text-red-400" />
        <h1 className="mb-2 text-2xl font-black text-[var(--text-primary)]">
          No pudimos cargar tu plan
        </h1>
        <p className="mb-5 text-sm text-[var(--text-secondary)]">{error}</p>
        <button
          type="button"
          onClick={loadPlan}
          className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--accent-text)]"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <Utensils size={42} className="mb-4 text-[var(--text-muted)]" />
        <h1 className="mb-2 text-2xl font-black text-[var(--text-primary)]">
          Aún no tienes un plan nutricional
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          Tu nutriólogo todavía no te ha asignado un plan. Cuando esté disponible aparecerá aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Plan Nutricional
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {completedCount}/{meals.length} comidas completadas
          </p>
        </div>
        <button
          type="button"
          onClick={openHistory}
          className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]"
        >
          <History size={12} /> Historial
        </button>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
          {plan?.name || 'Sin plan asignado'}
        </span>
      </motion.div>

      {/* Macro Ring — Horizontal Compact */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {macroConfig.map((macro, i) => {
          const data = dailyMacros[macro.key as keyof typeof dailyMacros]
          const pct = calcProgress(data.current, data.target)
          return (
            <div
              key={macro.key}
              className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundColor: macro.color }}
              />
              <div className="relative">
                <p className="mb-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
                  {macro.label}
                </p>
                <div className="mb-3 flex items-center gap-3">
                  <div className="relative h-12 w-12">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="var(--surface-hover)"
                        strokeWidth="4"
                      />
                      <motion.circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke={macro.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={125.6}
                        initial={{ strokeDashoffset: 125.6 }}
                        animate={{ strokeDashoffset: 125.6 - (125.6 * pct) / 100 }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[var(--text-primary)]">
                      {pct}%
                    </span>
                  </div>
                  <div>
                    <p className="text-xl leading-none font-black text-[var(--text-primary)]">
                      {data.current}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      / {data.target}
                      {macro.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Meals + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Meal Timeline */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Utensils size={16} className="text-[var(--accent)]" />
            <h2 className="text-sm font-black tracking-wider text-[var(--text-primary)] uppercase">
              Comidas de Hoy
            </h2>
          </div>

          <div className="relative">
            <div className="absolute top-2 bottom-2 left-[19px] w-px bg-[var(--border)]" />

            <div className="space-y-2">
              {meals.map((meal, i) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="relative flex gap-4"
                >
                  <div className="relative z-10 mt-4 flex h-10 w-10 shrink-0 items-center justify-center">
                    <button
                      onClick={() =>
                        setMealStatus(
                          meal.id,
                          statusFor(meal.id) === 'COMPLETED' ? 'SKIPPED' : 'COMPLETED'
                        )
                      }
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      {statusFor(meal.id) === 'COMPLETED' ||
                      (!statusFor(meal.id) && mealCompletion[meal.id]) ? (
                        <CheckCircle2 size={24} className="text-[var(--accent)]" />
                      ) : (
                        <Circle size={24} className="text-[var(--text-muted)]" />
                      )}
                    </button>
                  </div>

                  <div
                    className={`flex-1 rounded-xl border p-4 transition-all ${
                      mealCompletion[meal.id]
                        ? 'border-[var(--border)] bg-[var(--surface)] opacity-60'
                        : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/30'
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap gap-1">
                      {(['COMPLETED', 'PARTIAL', 'SKIPPED'] as NutritionAdherenceStatus[]).map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={savingMeal === meal.id || !versionId}
                            onClick={() => setMealStatus(meal.id, status)}
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusFor(meal.id) === status ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'bg-[var(--surface)] text-[var(--text-muted)]'}`}
                          >
                            {status === 'COMPLETED'
                              ? 'Completa'
                              : status === 'PARTIAL'
                                ? 'Parcial'
                                : 'Omitida'}
                          </button>
                        )
                      )}
                    </div>
                    <input
                      aria-label={`Nota para ${meal.name}`}
                      value={
                        (mealNote[meal.id] ?? statusFor(meal.id))
                          ? (adherence[`${today}:${meal.id}`]?.notes ?? '')
                          : ''
                      }
                      onChange={(event) =>
                        setMealNote((current) => ({ ...current, [meal.id]: event.target.value }))
                      }
                      onBlur={() =>
                        statusFor(meal.id) && setMealStatus(meal.id, statusFor(meal.id)!)
                      }
                      placeholder="Nota opcional"
                      className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text-primary)]"
                    />
                    <div className="mb-2 flex items-center justify-between">
                      <h3
                        className={`font-bold ${
                          mealCompletion[meal.id]
                            ? 'text-[var(--text-secondary)] line-through'
                            : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {meal.name}
                      </h3>
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock size={12} />
                        {meal.time}
                      </span>
                      {(meal.options ?? []).length > 0 && <button type="button" onClick={() => setExpandedOptions((current) => ({ ...current, [meal.id]: !current[meal.id] }))} className="ml-auto mr-3 text-xs font-bold text-[var(--accent)]">Ver más opciones</button>}
                    </div>

                     <ul className="mb-3 space-y-1">
                        {(meal.options ?? []).find((option) => option.id === selectedOptionFor(meal.id))?.items.map((item) => <li key={item.id} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><span className="h-1 w-1 rounded-full bg-[var(--accent)]/40" />{recipeNameForItem(item) ? <button type="button" onClick={(event) => { event.stopPropagation(); openRecipe(recipeIdForItem(item), recipeNameForItem(item)) }} className="flex w-full cursor-pointer items-center justify-between rounded-md bg-[var(--accent)]/10 px-2 py-1 text-left text-xs font-bold text-[var(--accent)]"><span>{recipeNameForItem(item)}{item.quantity ? ` · ${item.quantity}` : ''}</span><span className="ml-2 whitespace-nowrap">Ver receta</span></button> : item.foodName || 'Elemento'}{!recipeNameForItem(item) && item.quantity ? ` · ${item.quantity}` : ''}</li>) || meal.foods.map((food, idx) => <li key={idx} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><span className="h-1 w-1 rounded-full bg-[var(--accent)]/40" />{food.name} — {food.quantity}</li>)}
                     </ul>
                     {(meal.options ?? []).length > 0 && (
                       <div className="mb-3 px-1">
                        {expandedOptions[meal.id] && (
                          <div className="mt-2 space-y-2">
                            {(meal.options ?? []).map((option) => (
                              <button
                                type="button"
                                key={option.id}
                                onClick={() =>
                                  setMealStatus(
                                    meal.id,
                                    statusFor(meal.id) || 'COMPLETED',
                                    option.id
                                  )
                                }
                                aria-pressed={selectedOptionFor(meal.id) === option.id}
                                className={`w-full rounded-lg border p-3 text-left text-xs ${selectedOptionFor(meal.id) === option.id ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--surface)]'}`}
                              >
                                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${selectedOptionFor(meal.id) === option.id ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--text-muted)]'}`}>
                                    {selectedOptionFor(meal.id) === option.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                  </span>
                                  <strong>{option.name}</strong>
                                </div>
                                <div className="mt-2 space-y-1">
                                  {option.items.map((item) => (
                                    <div key={item.id} className="text-[var(--text-muted)]">
                                      {recipeNameForItem(item) ? <button type="button" onClick={(event) => { event.stopPropagation(); openRecipe(recipeIdForItem(item), recipeNameForItem(item)) }} className="flex w-full cursor-pointer items-center justify-between rounded-md bg-[var(--accent)]/10 px-2 py-1 font-bold text-[var(--accent)]"><span>{recipeNameForItem(item)}{item.quantity ? ` · ${item.quantity}` : ''}</span><span className="ml-2 whitespace-nowrap">Ver receta</span></button> : item.foodName || 'Elemento'}
                                      {item.quantity ? ` · ${item.quantity}` : ''}
                                    </div>
                                  ))}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                      <span style={{ color: macroConfig[0].color }}>{meal.calories} kcal</span>
                      <span>P: {meal.protein}g</span>
                      <span>C: {meal.carbs}g</span>
                      <span>G: {meal.fats}g</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Hydration */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black tracking-wider text-[var(--text-primary)] uppercase">
                Hidratación
              </h3>
              <div className="text-[var(--info, #3b82f6)] flex items-center gap-1.5 text-xs">
                <Droplets size={14} />
                <span className="font-bold">{waterGlasses}/8</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setWaterGlasses(i + 1)}
                  className={`flex h-9 items-center justify-center rounded-lg border transition-all active:scale-95 sm:h-10 ${
                    i < waterGlasses
                      ? 'border-[var(--info, #3b82f6)]/30 bg-[var(--info, #3b82f6)]/10 text-[var(--info, #3b82f6)]'
                      : 'hover:border-[var(--info, #3b82f6)]/20 border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]'
                  }`}
                >
                  <Droplets size={14} fill={i < waterGlasses ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>

            <p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">
              Meta: 2.5 litros
            </p>
          </motion.div>

          {/* Coach Note */}
          {plan?.notes && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--accent)]/5 p-5"
            >
              <div className="flex gap-3">
                <Info size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <div>
                  <h4 className="mb-1.5 text-[10px] font-bold tracking-widest text-[var(--accent)] uppercase">
                    Nota del Coach
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {plan.notes}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
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
            <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-[var(--text-primary)]">{historicalPlan.name}</h3><p className="mt-1 text-sm text-[var(--text-secondary)]">{historicalPlan.targetCalories} kcal · P {historicalPlan.targetProtein}g · C {historicalPlan.targetCarbs}g · G {historicalPlan.targetFats}g</p></div><span className="text-xs font-bold text-[var(--accent)]">Versión {selectedHistoryVersion}</span></div>
              <div className="mt-3 space-y-2">{historicalPlan.meals.map((meal, index) => <div key={meal.id || index} className="rounded-lg bg-[var(--surface)] p-3"><div className="flex items-center justify-between text-sm font-bold text-[var(--text-primary)]"><span>{meal.name}</span><span className="text-xs font-normal text-[var(--text-muted)]">{meal.time}</span></div><div className="mt-1 text-xs text-[var(--text-secondary)]">{meal.foods.map((food, foodIndex) => <span key={food.id || foodIndex}>{food.name}{food.quantity ? ` · ${food.quantity}` : ''}{foodIndex < meal.foods.length - 1 ? ' | ' : ''}</span>)}</div>{meal.options?.map((option) => <div key={option.id || option.name} className="mt-2 rounded-lg border border-[var(--accent)]/20 p-2 text-xs"><p className="font-bold text-[var(--accent)]">Opción: {option.name}</p><p className="text-[var(--text-secondary)]">{option.items.map((item) => item.foodName || item.recipeName || 'Elemento').join(' · ')}</p></div>)}</div>)}</div>
            </div>
          )}
          {historyError && <p className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 p-3 text-xs text-[var(--warning)]">{historyError}</p>}
          {versions.map((version) => (
            <button
              key={version.id}
              type="button"
              onClick={() => viewVersion(version)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm ${selectedHistoryVersion === version.versionNumber ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--surface)]'}`}
            >
              <span className="font-bold text-[var(--text-primary)]">
                Versión {version.versionNumber}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date(version.createdAt).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </Modal>
      <Modal isOpen={Boolean(selectedRecipe)} onClose={() => setSelectedRecipe(null)} title={selectedRecipe?.name || 'Receta'} size="md">
        {selectedRecipe && <div className="space-y-4 text-sm text-[var(--text-secondary)]"><div className="grid grid-cols-2 gap-2 text-xs"><span>Porciones: <strong>{selectedRecipe.servings}</strong></span><span>Preparación: <strong>{selectedRecipe.preparationMinutes || '-'} min</strong></span><span>Calorías: <strong>{Math.round(selectedRecipe.caloriesPerServing)} kcal/porción</strong></span><span>Dificultad: <strong>{selectedRecipe.difficulty || '-'}</strong></span></div><div><h4 className="mb-2 font-bold text-[var(--text-primary)]">Ingredientes</h4><ul className="space-y-1">{(selectedRecipe.ingredients || []).map((item) => <li key={item.id || item.foodId}>• {item.foodName || 'Ingrediente'} · {item.grams} g</li>)}</ul></div>{selectedRecipe.instructions && <div><h4 className="mb-2 font-bold text-[var(--text-primary)]">Instrucciones</h4><p className="whitespace-pre-line">{selectedRecipe.instructions}</p></div>}{selectedRecipe.equivalencesPerServing && Object.keys(selectedRecipe.equivalencesPerServing).length > 0 && <div><h4 className="mb-2 font-bold text-[var(--text-primary)]">Equivalencias por porción</h4><p>{Object.entries(selectedRecipe.equivalencesPerServing).map(([group, value]) => `${group}: ${Number(value).toFixed(2)}`).join(' · ')}</p></div>}</div>}
      </Modal>
    </div>
  )
}
