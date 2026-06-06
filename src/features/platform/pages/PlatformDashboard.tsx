import { motion } from "framer-motion"
import { Building2, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const metrics = [
  { label: "Gymnasios Activos",  value: "12",    change: "+3",    up: true,  icon: Building2,    color: "var(--accent)" },
  { label: "Total Miembros",     value: "1,427", change: "+18%",  up: true,  icon: Users,        color: "var(--success)" },
  { label: "MRR",                value: "$6,240",change: "+12%",  up: true,  icon: DollarSign,   color: "var(--warning)" },
  { label: "Tasa Retención",     value: "94.2%", change: "+1.3%", up: true,  icon: TrendingUp,   color: "#8B5CF6" },
]

const growthData = [
  { month: "Ene", tenants: 3,  mrr: 870 },
  { month: "Feb", tenants: 4,  mrr: 1160 },
  { month: "Mar", tenants: 5,  mrr: 1450 },
  { month: "Abr", tenants: 7,  mrr: 2030 },
  { month: "May", tenants: 9,  mrr: 2610 },
  { month: "Jun", tenants: 10, mrr: 3200 },
  { month: "Jul", tenants: 11, mrr: 4560 },
  { month: "Ago", tenants: 12, mrr: 6240 },
]

const planDist = [
  { name: "Starter",    value: 4, color: "#60a5fa" },
  { name: "Pro",        value: 5, color: "var(--accent)" },
  { name: "Enterprise", value: 3, color: "var(--warning)" },
]

const recentTenants = [
  { name: "FitZone Elite",  plan: "ENTERPRISE", status: "ACTIVE", date: "12 Ene", members: 342 },
  { name: "PowerGym MX",   plan: "STARTER",    status: "TRIAL",  date: "14 Feb", members: 47  },
  { name: "Titan Sports",   plan: "PRO",        status: "TRIAL",  date: "20 Feb", members: 93  },
  { name: "Zeus Gym",       plan: "PRO",        status: "ACTIVE", date: "10 Mar", members: 175 },
  { name: "Body Factory",   plan: "ENTERPRISE", status: "ACTIVE", date: "15 Mar", members: 512 },
]

const activity = [
  { text: "Nuevo gimnasio registrado: PowerGym MX",     time: "hace 2h",  dot: "var(--success)" },
  { text: "Plan actualizado: Iron Temple → Pro",         time: "hace 5h",  dot: "var(--accent)"  },
  { text: "Pago procesado: Body Factory $199",           time: "hace 7h",  dot: "var(--warning)" },
  { text: "Tenant suspendido: Alpha Fitness",            time: "ayer",     dot: "var(--danger)"  },
  { text: "Nuevo usuario de plataforma: Ana Martínez",   time: "ayer",     dot: "var(--success)" },
  { text: "Reporte mensual generado",                    time: "hace 2d",  dot: "var(--text-muted)" },
]

const statusColor: Record<string, string> = {
  ACTIVE:    "var(--success)",
  TRIAL:     "var(--warning)",
  SUSPENDED: "var(--danger)",
}

const planColor: Record<string, string> = {
  STARTER:    "#60a5fa",
  PRO:        "var(--accent)",
  ENTERPRISE: "var(--warning)",
}

export default function PlatformDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Vista general de la plataforma MultiGym SaaS
        </p>
      </div>

      {/* Metrics */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <motion.div
            key={m.label}
            variants={fadeUp}
            className="p-5 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${m.color}18`, color: m.color }}
              >
                <m.icon size={20} />
              </div>
              <span
                className="flex items-center gap-0.5 text-xs font-bold"
                style={{ color: m.up ? "var(--success)" : "var(--danger)" }}
              >
                {m.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {m.change}
              </span>
            </div>
            <p className="text-3xl font-black mb-0.5" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>
              {m.value}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Crecimiento de la Plataforma</h3>
            <Activity size={16} style={{ color: "var(--text-muted)" }} />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--text-primary)" }}
                  formatter={(v: any, name: any) => [name === "mrr" ? `$${v}` : v, name === "mrr" ? "MRR" : "Tenants"]}
                />
                <Area yAxisId="left" type="monotone" dataKey="mrr" stroke="var(--accent)" strokeWidth={2.5} fill="url(#mrrGrad)" dot={false} />
                <Area yAxisId="right" type="monotone" dataKey="tenants" stroke="var(--warning)" strokeWidth={2} fill="none" dot={{ fill: "var(--warning)", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie - plan distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Distribución de Planes</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planDist} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">
                  {planDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {planDist.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span style={{ color: "var(--text-secondary)" }}>{p.name}</span>
                </div>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{p.value} gyms</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tenants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="lg:col-span-2 p-6 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Gimnasios Recientes</h3>
            <a href="/platform/tenants" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Ver todos →</a>
          </div>
          <div className="space-y-3">
            {recentTenants.map((t) => (
              <div key={t.name} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: "rgba(0,0,255,0.1)", color: "var(--accent)" }}
                >
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{t.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.members} miembros · {t.date}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${planColor[t.plan]}18`, color: planColor[t.plan] }}>
                  {t.plan}
                </span>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor[t.status] }} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>Actividad Reciente</h3>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: a.dot }} />
                  {i < activity.length - 1 && <div className="flex-1 w-px mt-1" style={{ background: "var(--border)" }} />}
                </div>
                <div>
                  <p className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>{a.text}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
