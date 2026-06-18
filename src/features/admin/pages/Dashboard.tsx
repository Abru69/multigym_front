import { motion } from "framer-motion"
import { Users, ShoppingBag, Dumbbell, TrendingUp, ArrowUpRight, Plus, Package, Zap, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"

const stats = [
  { label: "Clientes Activos", value: "248", change: "+12%", icon: Users, color: "var(--accent)" },
  { label: "Ventas del Mes", value: "$45,200", change: "+8.3%", icon: ShoppingBag, color: "var(--success)" },
  { label: "Rutinas Creadas", value: "1,234", change: "+24", icon: Dumbbell, color: "var(--warning)" },
  { label: "Sin Rutina Activa", value: "18", change: "-5%", icon: Zap, color: "var(--danger)" },
]

const salesData = [
  { month: "Ene", ventas: 32000 }, { month: "Feb", ventas: 28000 }, { month: "Mar", ventas: 35000 },
  { month: "Abr", ventas: 42000 }, { month: "May", ventas: 45200 }, { month: "Jun", ventas: 38000 },
]

const recentActivity = [
  { text: "María García completó su rutina de pecho", time: "Hace 5 min", type: "workout" },
  { text: "Nuevo pedido: Gold Standard Whey × 2", time: "Hace 12 min", type: "shop" },
  { text: "Roberto Sánchez se registró como cliente", time: "Hace 1 hora", type: "user" },
  { text: "Ana Torres actualizó su progreso de peso", time: "Hace 2 horas", type: "workout" },
  { text: "Venta completada: $1,299 MXN", time: "Hace 3 horas", type: "shop" },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Quick Actions */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Resumen general y control operativo de Reto 4 Gym</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/usuarios")} className="gap-2 text-accent border-accent/20 bg-accent/10 hover:bg-accent/20">
            <Users size={14} /> Nuevo Cliente
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/rutinas")} className="gap-2 text-warning border-warning/20 bg-warning/10 hover:bg-warning/20">
            <Dumbbell size={14} /> Crear Rutina
          </Button>
          <Button onClick={() => navigate("/admin/inventario")} className="gap-2 accent-glow">
            <Package size={14} /> Agregar Producto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp} className="p-5 rounded-3xl relative overflow-hidden group" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <s.icon size={100} style={{ color: s.color }} />
            </div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={24} />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full" style={{ background: "var(--accent-muted)", color: "var(--success)" }}>
                {s.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-3xl font-black mb-1 relative z-10" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>{s.value}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider relative z-10" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-2 p-6 rounded-3xl flex flex-col" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="font-black uppercase tracking-tight text-lg" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Ingresos Mensuales</h3>
            <Activity size={18} style={{ color: "var(--text-muted)" }} />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", color: "var(--text-primary)", fontSize: 13, fontWeight: "bold", boxShadow: "var(--shadow-lg)" }}
                  itemStyle={{ color: "var(--accent)" }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()} MXN`, "Ventas"]}
                />
                <Line type="monotone" dataKey="ventas" stroke="var(--accent)" strokeWidth={4} dot={{ fill: "var(--surface)", stroke: "var(--accent)", strokeWidth: 3, r: 6 }} activeDot={{ r: 8, fill: "var(--accent)", stroke: "var(--surface)", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-3xl" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
          <h3 className="font-black uppercase tracking-tight text-lg mb-6" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Actividad en Vivo</h3>
          <div className="space-y-5">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 transition-transform group-hover:scale-125" style={{ background: a.type === "shop" ? "var(--success)" : a.type === "user" ? "var(--warning)" : "var(--accent)", boxShadow: `0 0 10px ${a.type === "shop" ? "var(--success)" : a.type === "user" ? "var(--warning)" : "var(--accent)"}80` }} />
                  {i < recentActivity.length - 1 && <div className="flex-1 w-px mt-2" style={{ background: "var(--border)" }} />}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>{a.text}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--text-muted)" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6 border-dashed text-accent border-border hover:bg-[var(--surface-hover)]">
            Ver Historial Completo
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
