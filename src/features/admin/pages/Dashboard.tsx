import { motion } from "framer-motion"
import { Users, ShoppingBag, Dumbbell, TrendingUp, ArrowUpRight, Plus, Package, Zap, Activity, Loader2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import "./styles/Dashboard.css"
import { useState, useEffect, useCallback } from "react"
import { fetchApi } from "@/lib/api"

interface ChartDataDTO {
  month: string;
  ventas: number;
}

interface ActivityDTO {
  text: string;
  time: string;
  type: string;
}

interface DashboardDTO {
  activeClients: number;
  monthlySales: string;
  totalWorkouts: number;
  clientsWithoutWorkout: number;
  activeClientsChange: string;
  monthlySalesChange: string;
  totalWorkoutsChange: string;
  clientsWithoutWorkoutChange: string;
  salesData: ChartDataDTO[];
  recentActivity: ActivityDTO[];
}

interface ResponseDTO<T> {
  estatus: string;
  mensaje: string;
  dto: T;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export default function AdminDashboard() {
  const navigate = useNavigate()
  
  const [data, setData] = useState<DashboardDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetchApi<ResponseDTO<DashboardDTO>>("/api/tenant/dashboard")
      if (response && response.dto) {
        // Reverse chart data so oldest is first (from DB we get 5 months ago down to 0)
        response.dto.salesData = response.dto.salesData.reverse();
        setData(response.dto)
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar métricas del dashboard")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-danger">
        {error || "No se pudo cargar el dashboard"}
      </div>
    )
  }

  const stats = [
    { label: "Clientes Activos", value: data.activeClients.toString(), change: data.activeClientsChange, icon: Users, color: "var(--accent)" },
    { label: "Ventas del Mes", value: data.monthlySales, change: data.monthlySalesChange, icon: ShoppingBag, color: "var(--success)" },
    { label: "Rutinas Creadas", value: data.totalWorkouts.toString(), change: data.totalWorkoutsChange, icon: Dumbbell, color: "var(--warning)" },
    { label: "Sin Rutina Activa", value: data.clientsWithoutWorkout.toString(), change: data.clientsWithoutWorkoutChange, icon: Zap, color: "var(--danger)" },
  ]

  return (
    <div className="admin-page-container">
      {/* Header & Quick Actions */}
      <div className="admin-page-header xl:items-end">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Resumen general y control operativo</p>
        </div>
        <div className="dashboard-quick-actions">
          <Button variant="outline" onClick={() => navigate("/admin/usuarios")} className="gap-2 text-accent border-accent/20 bg-accent/10 hover:bg-accent/20">
            <Users size={14} /> Nuevo Cliente
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/ejercicios?tab=routines")} className="gap-2 text-warning border-warning/20 bg-warning/10 hover:bg-warning/20">
            <Dumbbell size={14} /> Crear Rutina
          </Button>
          <Button onClick={() => navigate("/admin/inventario")} className="gap-2 accent-glow">
            <Package size={14} /> Agregar Producto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="dashboard-stats-grid">
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp} className="dashboard-stat-card">
            <div className="dashboard-stat-icon-bg">
              <s.icon size={100} style={{ color: s.color }} />
            </div>
            <div className="dashboard-stat-header">
              <div className="dashboard-stat-icon-box" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={24} />
              </div>
              <span className="dashboard-stat-badge">
                {s.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="dashboard-stat-value">{s.value}</p>
            <p className="dashboard-stat-label">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="dashboard-charts-grid">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="dashboard-chart-card">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="dashboard-card-title">Ingresos Mensuales</h3>
            <Activity size={18} style={{ color: "var(--text-muted)" }} />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="dashboard-recent-card">
          <h3 className="dashboard-card-title mb-6">Actividad en Vivo</h3>
          <div className="dashboard-activity-list">
            {data.recentActivity.map((a, i) => (
              <div key={i} className="dashboard-activity-item">
                <div className="dashboard-activity-dot-container">
                  <div className="dashboard-activity-dot" style={{ background: a.type === "shop" ? "var(--success)" : a.type === "user" ? "var(--warning)" : "var(--accent)", boxShadow: `0 0 10px ${a.type === "shop" ? "var(--success)" : a.type === "user" ? "var(--warning)" : "var(--accent)"}80` }} />
                  {i < data.recentActivity.length - 1 && <div className="dashboard-activity-line" />}
                </div>
                <div className="pb-2">
                  <p className="dashboard-activity-text">{a.text}</p>
                  <p className="dashboard-activity-time">{a.time}</p>
                </div>
              </div>
            ))}
            {data.recentActivity.length === 0 && (
              <p className="text-sm text-center text-text-muted">No hay actividad reciente.</p>
            )}
          </div>
          <Button variant="outline" className="w-full mt-6 border-dashed text-accent border-border hover:bg-[var(--surface-hover)]">
            Ver Historial Completo
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
