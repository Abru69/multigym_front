import { useState } from "react"
import { motion } from "framer-motion"
import { Flame, CheckCircle2, Circle, Clock, Utensils, Droplets, Info } from "lucide-react"
import { Button } from "@/components/ui/Button"

// Mock data for nutrition
const dailyMacros = {
  calories: { current: 1850, target: 2400 },
  protein: { current: 120, target: 160 }, // grams
  carbs: { current: 180, target: 250 },
  fats: { current: 55, target: 80 }
}

const mealPlan = [
  {
    id: "m1",
    name: "Desayuno",
    time: "07:30 AM",
    items: ["Avena con proteína y plátano", "Café negro"],
    macros: { cal: 450, p: 35, c: 55, f: 10 },
    completed: true,
  },
  {
    id: "m2",
    name: "Snack AM",
    time: "11:00 AM",
    items: ["Yogurt griego", "Almendras"],
    macros: { cal: 250, p: 20, c: 15, f: 12 },
    completed: true,
  },
  {
    id: "m3",
    name: "Comida",
    time: "02:30 PM",
    items: ["Pechuga de pollo a la plancha", "Arroz integral", "Brócoli"],
    macros: { cal: 650, p: 55, c: 70, f: 15 },
    completed: false,
  },
  {
    id: "m4",
    name: "Cena (Post-Entreno)",
    time: "08:00 PM",
    items: ["Salmón al horno", "Batata", "Ensalada verde"],
    macros: { cal: 500, p: 40, c: 45, f: 18 },
    completed: false,
  }
]

export default function Nutrition() {
  const [meals, setMeals] = useState(mealPlan)
  const [waterGlasses, setWaterGlasses] = useState(4)

  const toggleMeal = (id: string) => {
    setMeals(meals.map(m => m.id === id ? { ...m, completed: !m.completed } : m))
  }

  // Calculate progress percentage safely
  const calcProgress = (current: number, target: number) => Math.min(100, Math.round((current / target) * 100))

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-[var(--text-primary)] uppercase tracking-tight">
            Plan Nutricional
          </h1>
          <p className="text-text-secondary text-sm">
            Controla tus macros y construye tu físico desde la cocina.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-bold text-[var(--text-primary)] shadow-sm">
          <Flame size={16} className="text-accent" />
          <span>Fase: Volumen Limpio</span>
        </div>
      </div>

      {/* Macros Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calories Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="col-span-2 md:col-span-1 bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Calorías</span>
            <Flame size={16} className="text-warning" />
          </div>
          <div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-3xl font-heading font-black text-[var(--text-primary)] leading-none">{dailyMacros.calories.current}</span>
              <span className="text-sm font-medium text-text-secondary pb-1">/ {dailyMacros.calories.target}</span>
            </div>
            <p className="text-xs text-text-secondary">kcal consumidas</p>
          </div>
          
          <div className="mt-4 h-2 bg-background rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${calcProgress(dailyMacros.calories.current, dailyMacros.calories.target)}%` }} transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-warning rounded-full"
            />
          </div>
        </motion.div>

        {/* Macros: Protein, Carbs, Fats */}
        {[
          { label: "Proteína", ...dailyMacros.protein, color: "bg-accent", textColor: "text-accent" },
          { label: "Carbos", ...dailyMacros.carbs, color: "bg-blue-500", textColor: "text-blue-500" },
          { label: "Grasas", ...dailyMacros.fats, color: "bg-purple-500", textColor: "text-purple-500" }
        ].map((macro, i) => (
          <motion.div 
            key={macro.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + (i * 0.05) }}
            className="bg-surface border border-border rounded-2xl p-5"
          >
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-4">{macro.label}</span>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-2xl font-heading font-black text-[var(--text-primary)] leading-none">{macro.current}</span>
              <span className="text-xs font-medium text-text-secondary pb-1">/ {macro.target}g</span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${calcProgress(macro.current, macro.target)}%` }} transition={{ duration: 1, delay: 0.3 + (i * 0.1) }}
                className={`h-full rounded-full ${macro.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Meal Plan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Utensils size={18} style={{ color: "var(--text-primary)" }} />
            <h2 className="text-lg font-heading font-bold text-[var(--text-primary)] uppercase tracking-tight">Comidas de Hoy</h2>
          </div>
          
          <div className="space-y-3">
            {meals.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (i * 0.1) }}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  meal.completed 
                    ? "bg-surface/50 border-border opacity-60" 
                    : "bg-surface border-border hover:border-accent/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  <Button 
                    variant="ghost"
                    onClick={() => toggleMeal(meal.id)}
                    className="mt-1 p-0 h-auto text-text-muted hover:text-accent hover:bg-transparent"
                  >
                    {meal.completed ? <CheckCircle2 size={24} className="text-accent" /> : <Circle size={24} />}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className={`font-bold ${meal.completed ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
                        {meal.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-medium bg-background px-2 py-1 rounded-md text-text-secondary border border-border">
                        <Clock size={12} />
                        {meal.time}
                      </div>
                    </div>
                    
                    <ul className="text-sm text-text-secondary space-y-1 mb-3">
                      {meal.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-accent/50" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold tracking-wider uppercase text-text-muted">
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Hydration */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-surface border border-border rounded-2xl p-5"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-heading font-bold text-[var(--text-primary)] uppercase tracking-tight">Hidratación</h3>
              <Droplets size={18} className="text-blue-400" />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => setWaterGlasses(i + 1)}
                  className={`w-10 h-12 p-0 rounded-lg ${
                    i < waterGlasses 
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-400" 
                      : "bg-background text-text-muted border-border hover:border-blue-500/20 hover:text-blue-400"
                  }`}
                >
                  <Droplets size={16} fill={i < waterGlasses ? "currentColor" : "none"} />
                </Button>
              ))}
            </div>
            <p className="text-xs text-text-secondary text-center">
              Meta: 2.5 Litros (8 vasos)
            </p>
          </motion.div>

          {/* Coach Note */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-accent/10 border border-accent/20 rounded-2xl p-5"
          >
            <div className="flex gap-3">
              <Info size={20} className="text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Nota del Coach</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Recuerda pesar tus alimentos en crudo y priorizar el descanso. Hoy toca pierna, asegúrate de consumir todos tus carbohidratos en la comida pre y post entreno.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
