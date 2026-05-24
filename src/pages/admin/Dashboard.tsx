import { motion } from "framer-motion"
import { Users, ShoppingBag, Dumbbell, TrendingUp, ArrowUpRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const stats = [
  { label: "Clientes Activos", value: "248", change: "+12%", icon: Users, color: "var(--accent)" },
  { label: "Ventas del Mes", value: "$45,200", change: "+8.3%", icon: ShoppingBag, color: "var(--success)" },
  { label: "Rutinas Creadas", value: "1,234", change: "+24", icon: Dumbbell, color: "var(--warning)" },
  { label: "Tasa Retención", value: "94%", change: "+2.1%", icon: TrendingUp, color: "#8B5CF6" },
]

const salesData = [
  { month: "Ene", ventas: 32000 },
  { month: "Feb", ventas: 28000 },
  { month: "Mar", ventas: 35000 },
  { month: "Abr", ventas: 42000 },
  { month: "May", ventas: 45200 },
  { month: "Jun", ventas: 38000 },
]

const recentActivity = [
  { text: "María García completó su rutina de pecho", time: "Hace 5 min" },
  { text: "Nuevo pedido: Gold Standard Whey × 2", time: "Hace 12 min" },
  { text: "Roberto Sánchez se registró como cliente", time: "Hace 1 hora" },
  { text: "Ana Torres actualizó su progreso de peso", time: "Hace 2 horas" },
  { text: "Venta completada: $1,299 MXN", time: "Hace 3 horas" },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Resumen general de Reto 4 Gym</p>
      </div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="p-5 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={20} />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: "var(--success)" }}>
                {s.change}
                <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Ventas Mensuales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()} MXN`, "Ventas"]}
                />
                <Line type="monotone" dataKey="ventas" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: "var(--accent)", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Actividad Reciente</h3>
          <div className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--accent)" }} />
                <div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{a.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
