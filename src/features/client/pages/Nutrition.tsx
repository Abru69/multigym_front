import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2, Circle, Clock, Utensils, Droplets, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const dailyMacros = {
  calories: { current: 1850, target: 2400 },
  protein: { current: 120, target: 160 },
  carbs: { current: 180, target: 250 },
  fats: { current: 55, target: 80 },
}

const mealPlan = [
  {
    id: 'm1',
    name: 'Desayuno',
    time: '07:30 AM',
    items: ['Avena con proteína y plátano', 'Café negro'],
    macros: { cal: 450, p: 35, c: 55, f: 10 },
    completed: true,
  },
  {
    id: 'm2',
    name: 'Snack AM',
    time: '11:00 AM',
    items: ['Yogurt griego', 'Almendras'],
    macros: { cal: 250, p: 20, c: 15, f: 12 },
    completed: true,
  },
  {
    id: 'm3',
    name: 'Comida',
    time: '02:30 PM',
    items: ['Pechuga de pollo a la plancha', 'Arroz integral', 'Brócoli'],
    macros: { cal: 650, p: 55, c: 70, f: 15 },
    completed: false,
  },
  {
    id: 'm4',
    name: 'Cena (Post-Entreno)',
    time: '08:00 PM',
    items: ['Salmón al horno', 'Batata', 'Ensalada verde'],
    macros: { cal: 500, p: 40, c: 45, f: 18 },
    completed: false,
  },
]

export default function Nutrition() {
  const [meals, setMeals] = useState(mealPlan)
  const [waterGlasses, setWaterGlasses] = useState(4)

  const toggleMeal = (id: string) => {
    setMeals(meals.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)))
  }

  const calcProgress = (current: number, target: number) =>
    Math.min(100, Math.round((current / target) * 100))

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase">
            Plan Nutricional
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Controla tus macros y construye tu físico desde la cocina.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-hover)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] shadow-sm backdrop-blur-xl">
          <Flame size={16} className="text-[var(--accent)]" />
          <span>Fase: Volumen Limpio</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl md:col-span-1"
        >
          <div className="mb-4 flex items-start justify-between">
            <span className="text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
              Calorías
            </span>
            <Flame size={16} className="text-warning" />
          </div>
          <div>
            <div className="mb-1 flex items-end gap-1">
              <span className="font-heading text-3xl leading-none font-black text-[var(--text-primary)]">
                {dailyMacros.calories.current}
              </span>
              <span className="pb-1 text-sm font-medium text-[var(--text-secondary)]">
                / {dailyMacros.calories.target}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">kcal consumidas</p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-hover)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${calcProgress(dailyMacros.calories.current, dailyMacros.calories.target)}%`,
              }}
              transition={{ duration: 1, delay: 0.2 }}
              className="bg-warning h-full rounded-full"
            />
          </div>
        </motion.div>

        {[
          {
            label: 'Proteína',
            ...dailyMacros.protein,
            color: 'bg-accent',
            textColor: 'text-accent',
          },
          {
            label: 'Carbos',
            ...dailyMacros.carbs,
            color: 'bg-[var(--info)]',
            textColor: 'text-[var(--info)]',
          },
          {
            label: 'Grasas',
            ...dailyMacros.fats,
            color: 'bg-[var(--info)]',
            textColor: 'text-[var(--info)]',
          },
        ].map((macro, i) => (
          <motion.div
            key={macro.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl"
          >
            <span className="mb-4 block text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
              {macro.label}
            </span>
            <div className="mb-4 flex items-end gap-1">
              <span className="font-heading text-2xl leading-none font-black text-[var(--text-primary)]">
                {macro.current}
              </span>
              <span className="pb-1 text-xs font-medium text-[var(--text-secondary)]">
                / {macro.target}g
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-[var(--surface-hover)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calcProgress(macro.current, macro.target)}%` }}
                transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                className={`h-full rounded-full ${macro.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <Utensils size={18} className="text-[var(--text-primary)]" />
            <h2 className="font-heading text-lg font-bold tracking-tight text-[var(--text-primary)] uppercase">
              Comidas de Hoy
            </h2>
          </div>

          <div className="space-y-3">
            {meals.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`rounded-xl border p-4 backdrop-blur-xl transition-all duration-300 ${
                  meal.completed
                    ? 'border-[var(--border)] bg-[var(--surface)] opacity-60'
                    : 'border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => toggleMeal(meal.id)}
                    className="mt-1 h-auto p-0 text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--accent)]"
                  >
                    {meal.completed ? (
                      <CheckCircle2 size={24} className="text-[var(--accent)]" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </Button>

                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3
                        className={`font-bold ${meal.completed ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}
                      >
                        {meal.name}
                      </h3>
                      <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-hover)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] backdrop-blur-sm">
                        <Clock size={12} />
                        {meal.time}
                      </div>
                    </div>

                    <ul className="mb-3 space-y-1 text-sm text-[var(--text-secondary)]">
                      {meal.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-[var(--accent)]/50" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                      <span className="text-warning">{meal.macros.cal} kcal</span>
                      <span>P: {meal.macros.p}g</span>
                      <span>C: {meal.macros.c}g</span>
                      <span>G: {meal.macros.f}g</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <h3 className="font-heading font-bold tracking-tight text-[var(--text-primary)] uppercase">
                Hidratación
              </h3>
              <Droplets size={18} className="text-[var(--info)]" />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => setWaterGlasses(i + 1)}
                  className={`h-12 w-10 rounded-lg p-0 ${
                    i < waterGlasses
                      ? 'border border-[var(--info)]/30 bg-[var(--info)]/15 text-[var(--info)] hover:bg-[var(--info)]/20 hover:text-[var(--info)]'
                      : 'border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-[var(--info)]/20 hover:text-[var(--info)]'
                  }`}
                >
                  <Droplets size={16} fill={i < waterGlasses ? 'currentColor' : 'none'} />
                </Button>
              ))}
            </div>
            <p className="text-center text-xs text-[var(--text-secondary)]">
              Meta: 2.5 Litros (8 vasos)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-5 backdrop-blur-xl"
          >
            <div className="flex gap-3">
              <Info size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <div>
                <h4 className="mb-2 text-sm font-bold tracking-wider text-[var(--accent)] uppercase">
                  Nota del Coach
                </h4>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Recuerda pesar tus alimentos en crudo y priorizar el descanso. Hoy toca pierna,
                  asegúrate de consumir todos tus carbohidratos en la comida pre y post entreno.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
