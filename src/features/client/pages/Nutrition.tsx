import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2, Circle, Clock, Utensils, Droplets, Info } from 'lucide-react'

const dailyMacros = {
  calories: { current: 1850, target: 2400 },
  protein: { current: 120, target: 160 },
  carbs: { current: 180, target: 250 },
  fats: { current: 55, target: 80 },
}

const macroConfig = [
  { key: 'calories', label: 'Calorías', color: 'var(--accent)', unit: 'kcal' },
  { key: 'protein', label: 'Proteína', color: 'var(--success, #22c55e)', unit: 'g' },
  { key: 'carbs', label: 'Carbos', color: 'var(--info, #3b82f6)', unit: 'g' },
  { key: 'fats', label: 'Grasas', color: 'var(--warning, #f59e0b)', unit: 'g' },
] as const

const mealPlan = [
  {
    id: 'm1',
    name: 'Desayuno',
    time: '07:30',
    items: ['Avena con proteína y plátano', 'Café negro'],
    macros: { cal: 450, p: 35, c: 55, f: 10 },
    completed: true,
  },
  {
    id: 'm2',
    name: 'Snack AM',
    time: '11:00',
    items: ['Yogurt griego', 'Almendras'],
    macros: { cal: 250, p: 20, c: 15, f: 12 },
    completed: true,
  },
  {
    id: 'm3',
    name: 'Comida',
    time: '14:30',
    items: ['Pechuga de pollo a la plancha', 'Arroz integral', 'Brócoli'],
    macros: { cal: 650, p: 55, c: 70, f: 15 },
    completed: false,
  },
  {
    id: 'm4',
    name: 'Cena',
    time: '20:00',
    items: ['Salmón al horno', 'Batata', 'Ensalada verde'],
    macros: { cal: 500, p: 40, c: 45, f: 18 },
    completed: false,
  },
]

export default function Nutrition() {
  const [meals, setMeals] = useState(mealPlan)
  const [waterGlasses, setWaterGlasses] = useState(4)

  const toggleMeal = (id: string) => {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)))
  }

  const calcProgress = (current: number, target: number) =>
    Math.min(100, Math.round((current / target) * 100))

  const completedCount = meals.filter((m) => m.completed).length

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
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--text-secondary)]">
          Volumen Limpio
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
              {/* Subtle background accent */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundColor: macro.color }}
              />

              <div className="relative">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  {macro.label}
                </p>

                {/* Circular progress indicator */}
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
                    <p className="text-xl font-black leading-none text-[var(--text-primary)]">
                      {data.current}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      / {data.target}{macro.unit}
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
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
              Comidas de Hoy
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[var(--border)]" />

            <div className="space-y-2">
              {meals.map((meal, i) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="relative flex gap-4"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-4 flex h-10 w-10 shrink-0 items-center justify-center">
                    <button
                      onClick={() => toggleMeal(meal.id)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      {meal.completed ? (
                        <CheckCircle2 size={24} className="text-[var(--accent)]" />
                      ) : (
                        <Circle size={24} className="text-[var(--text-muted)]" />
                      )}
                    </button>
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 rounded-xl border p-4 transition-all ${
                      meal.completed
                        ? 'border-[var(--border)] bg-[var(--surface)] opacity-60'
                        : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/30'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3
                        className={`font-bold ${
                          meal.completed
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
                    </div>

                    <ul className="mb-3 space-y-1">
                      {meal.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                        >
                          <span className="h-1 w-1 rounded-full bg-[var(--accent)]/40" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <span style={{ color: macroConfig[0].color }}>
                        {meal.macros.cal} kcal
                      </span>
                      <span>P: {meal.macros.p}g</span>
                      <span>C: {meal.macros.c}g</span>
                      <span>G: {meal.macros.f}g</span>
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
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
                Hidratación
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[var(--info, #3b82f6)]">
                <Droplets size={14} />
                <span className="font-bold">{waterGlasses}/8</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setWaterGlasses(i + 1)}
                  className={`flex h-10 items-center justify-center rounded-lg border transition-all active:scale-95 ${
                    i < waterGlasses
                      ? 'border-[var(--info, #3b82f6)]/30 bg-[var(--info, #3b82f6)]/10 text-[var(--info, #3b82f6)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--info, #3b82f6)]/20'
                  }`}
                >
                  <Droplets
                    size={14}
                    fill={i < waterGlasses ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>

            <p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">
              Meta: 2.5 litros
            </p>
          </motion.div>

          {/* Coach Note */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-[var(--accent)]/15 bg-[var(--accent)]/5 p-5"
          >
            <div className="flex gap-3">
              <Info size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <div>
                <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  Nota del Coach
                </h4>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Prioriza el descanso hoy. Consume tus carbohidratos antes y después del entreno
                  para maximizar la recuperación.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
