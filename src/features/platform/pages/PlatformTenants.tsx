import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, X, Building2, MoreVertical, CheckCircle, PauseCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { fetchApi } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

interface Tenant {
  id: string; name: string; subdomain: string; plan: "STARTER"|"PRO"|"ENTERPRISE"
  status: "ACTIVE"|"TRIAL"|"SUSPENDED"|"CANCELLED"; members: number; revenue: string
  createdAt: string; email: string
}

const initialTenants: Tenant[] = [
  { id:"1", name:"FitZone Elite",   subdomain:"fitzone",    plan:"ENTERPRISE", status:"ACTIVE",    members:342, revenue:"$199", createdAt:"12 Ene 2026", email:"admin@fitzone.com"    },
  { id:"2", name:"Iron Temple",     subdomain:"irontemple", plan:"PRO",        status:"ACTIVE",    members:218, revenue:"$79",  createdAt:"28 Ene 2026", email:"ops@irontemple.mx"    },
  { id:"3", name:"PowerGym MX",    subdomain:"powergym",   plan:"STARTER",    status:"TRIAL",     members:47,  revenue:"$0",   createdAt:"14 Feb 2026", email:"hola@powergym.mx"     },
  { id:"4", name:"Titan Sports",   subdomain:"titan",      plan:"PRO",        status:"TRIAL",     members:93,  revenue:"$0",   createdAt:"20 Feb 2026", email:"info@titansports.com" },
  { id:"5", name:"Alpha Fitness",  subdomain:"alpha",      plan:"STARTER",    status:"SUSPENDED", members:12,  revenue:"$0",   createdAt:"05 Mar 2026", email:"admin@alphafitness.mx"},
  { id:"6", name:"Zeus Gym",       subdomain:"zeus",       plan:"PRO",        status:"ACTIVE",    members:175, revenue:"$79",  createdAt:"10 Mar 2026", email:"zeus@zeusgym.com"     },
  { id:"7", name:"Body Factory",   subdomain:"bodyfactory",plan:"ENTERPRISE", status:"ACTIVE",    members:512, revenue:"$199", createdAt:"15 Mar 2026", email:"hello@bodyfactory.io" },
  { id:"8", name:"GymPro CDMX",   subdomain:"gympro",     plan:"STARTER",    status:"TRIAL",     members:28,  revenue:"$0",   createdAt:"01 Abr 2026", email:"contact@gympro.mx"    },
]

const statusConfig = {
  ACTIVE:    { label:"Activo",     color:"var(--success)", icon: CheckCircle },
  TRIAL:     { label:"Trial",      color:"var(--warning)", icon: Clock },
  SUSPENDED: { label:"Suspendido", color:"var(--danger)",  icon: PauseCircle },
  CANCELLED: { label:"Cancelado",  color:"var(--text-muted)", icon: XCircle },
}

const planColors = { STARTER:"var(--info)", PRO:"var(--accent)", ENTERPRISE:"var(--warning)" }

export default function PlatformTenants() {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [showModal, setShowModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant|null>(null)
  const [openMenu, setOpenMenu] = useState<string|null>(null)
  const [toast, setToast] = useState("")
  const [form, setForm] = useState({ name:"", subdomain:"", email:"", plan:"STARTER", status:"TRIAL", adminName:"", adminPassword:"", adminPhone:"" })
  const [isSaving, setIsSaving] = useState(false)

  const filtered = tenants.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.subdomain.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "ALL" || t.status === filter
    return matchSearch && matchFilter
  })

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const openCreate = () => {
    setForm({ name:"", subdomain:"", email:"", plan:"STARTER", status:"TRIAL", adminName:"", adminPassword:"", adminPhone:"" })
    setEditingTenant(null); setShowModal(true)
  }

  const openEdit = (t: Tenant) => {
    setForm({ name:t.name, subdomain:t.subdomain, email:t.email, plan:t.plan, status:t.status, adminName:"", adminPassword:"", adminPhone:"" })
    setEditingTenant(t); setShowModal(true); setOpenMenu(null)
  }

  const toggleStatus = (t: Tenant) => {
    const next = t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    setTenants(ts => ts.map(x => x.id === t.id ? { ...x, status: next as any } : x))
    showToast(`${t.name} ${next === "ACTIVE" ? "activado" : "suspendido"}`)
    setOpenMenu(null)
  }

  const deleteTenant = (t: Tenant) => {
    setTenants(ts => ts.filter(x => x.id !== t.id))
    showToast(`${t.name} eliminado`); setOpenMenu(null)
  }

  const save = async () => {
    if (editingTenant) {
      setTenants(ts => ts.map(x => x.id === editingTenant.id ? { ...x, ...form } as Tenant : x))
      showToast("Cambios guardados")
      setShowModal(false)
    } else {
      setIsSaving(true)
      try {
        await fetchApi("/api/tenants", {
          method: "POST",
          body: JSON.stringify({
            tenantId: form.subdomain,
            name: form.name,
            subdomain: form.subdomain,
            adminEmail: form.email,
            adminPassword: form.adminPassword || "admin123",
            adminName: form.adminName || form.name,
            adminPhone: form.adminPhone || "",
          }),
        })
        const newT: Tenant = {
          id: Date.now().toString(), ...form as any, members: 0, revenue: "$0",
          createdAt: new Date().toLocaleDateString("es-MX", { day:"numeric", month:"short", year:"numeric" })
        }
        setTenants(ts => [newT, ...ts])
        showToast("✅ Gimnasio creado en el servidor")
        setShowModal(false)
      } catch (err: any) {
        showToast(`❌ Error: ${err.message || "No se pudo crear el gimnasio"}`)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const stats = [
    { label:"Total", count: tenants.length, color:"var(--text-secondary)" },
    { label:"Activos", count: tenants.filter(t=>t.status==="ACTIVE").length, color:"var(--success)" },
    { label:"Trial",  count: tenants.filter(t=>t.status==="TRIAL").length,  color:"var(--warning)" },
    { label:"Suspendidos", count: tenants.filter(t=>t.status==="SUSPENDED").length, color:"var(--danger)" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color:"var(--text-primary)", fontFamily:"var(--font-heading)" }}>Gimnasios</h1>
          <p className="text-sm mt-0.5" style={{ color:"var(--text-muted)" }}>Gestiona todos los tenants de la plataforma</p>
        </div>
        <Button onClick={openCreate} className="accent-glow gap-2">
          <Plus size={16} /> Nuevo Gimnasio
        </Button>
      </div>

      {/* Stat pills */}
      <div className="flex gap-3 flex-wrap">
        {stats.map(s => (
          <div key={s.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm cursor-pointer transition-all"
            style={{ background:"var(--surface)", border:"1px solid var(--border)" }}
            onClick={() => setFilter(s.label === "Total" ? "ALL" : s.label.toUpperCase().replace("SUSPENDIDOS","SUSPENDED"))}
          >
            <span className="w-2 h-2 rounded-full" style={{ background:s.color }} />
            <span style={{ color:"var(--text-primary)", fontWeight:700 }}>{s.count}</span>
            <span style={{ color:"var(--text-muted)" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 flex-1 min-w-52 px-3 py-2.5 rounded-xl"
          style={{ background:"var(--surface)", border:"1px solid var(--border)" }}
        >
          <Search size={15} style={{ color:"var(--text-muted)" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar gimnasio..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color:"var(--text-primary)" }}
          />
        </div>
        <div className="flex gap-1">
          {["ALL","ACTIVE","TRIAL","SUSPENDED"].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filter === f ? "var(--accent-muted)" : "var(--surface)",
                color: filter === f ? "var(--accent)" : "var(--text-secondary)",
                border: filter === f ? "1px solid var(--accent)" : "1px solid var(--border)",
              }}
            >
              {f === "ALL" ? "Todos" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom:"1px solid var(--border)" }}>
              {["Gimnasio","Subdominio","Plan","Miembros","Estado","Ingresos/mes","Acciones"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color:"var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const sc = statusConfig[t.status]
              return (
                <motion.tr
                  key={t.id}
                  initial={{ opacity:0, x:-10 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b last:border-b-0 transition-colors"
                  style={{ borderColor:"var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{ background:"var(--accent-muted)", color:"var(--accent)" }}>
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>{t.name}</p>
                        <p className="text-xs" style={{ color:"var(--text-muted)" }}>{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color:"var(--text-muted)" }}>{t.subdomain}.multigym.com</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background:`${planColors[t.plan]}18`, color:planColors[t.plan] }}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color:"var(--text-secondary)" }}>
                    {t.members.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color:sc.color }}>
                      <sc.icon size={12} />{sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color:"var(--success)" }}>
                    {t.revenue}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color:"var(--text-muted)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <MoreVertical size={16} />
                    </button>
                    <AnimatePresence>
                      {openMenu === t.id && (
                        <motion.div
                          initial={{ opacity:0, scale:0.9, y:-5 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9 }}
                          className="absolute right-0 z-10 py-1 rounded-xl w-44 shadow-lg"
                          style={{ background:"var(--surface)", border:"1px solid var(--border)", top:"100%" }}
                        >
                          {[
                            { label:"✏️ Editar", fn:() => openEdit(t) },
                            { label: t.status==="ACTIVE" ? "⏸ Suspender" : "▶ Activar", fn:() => toggleStatus(t) },
                            { label:"🗑 Eliminar", fn:() => deleteTenant(t), danger:true },
                          ].map(item => (
                            <button key={item.label}
                              onClick={item.fn}
                              className="block w-full text-left px-4 py-2 text-sm transition-colors"
                              style={{ color: item.danger ? "var(--danger)" : "var(--text-secondary)" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              {item.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color:"var(--text-muted)" }}>
            <Building2 size={32} className="mx-auto mb-3 opacity-40" />
            <p>Sin resultados</p>
          </div>
        )}
      </div>

      <p className="text-xs text-right" style={{ color:"var(--text-muted)" }}>
        Mostrando {filtered.length} de {tenants.length} gimnasios
      </p>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:"var(--overlay)", backdropFilter:"blur(6px)" }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              className="w-full max-w-lg rounded-2xl p-6"
              style={{ background:"var(--surface)", border:"1px solid var(--border)", boxShadow:"var(--shadow-lg)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold" style={{ color:"var(--text-primary)" }}>
                  {editingTenant ? "Editar Gimnasio" : "Nuevo Gimnasio"}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ color:"var(--text-muted)" }}><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label:"Nombre", key:"name", placeholder:"Ej: FitZone Elite" },
                  { label:"Subdominio", key:"subdomain", placeholder:"fitzone" },
                  { label:"Email de contacto", key:"email", placeholder:"admin@gym.com", type:"email" },
                ].map(f => (
                  <div key={f.key} className={f.key === "email" ? "col-span-2" : ""}>
                    <Label>{f.label}</Label>
                    <Input
                      type={f.type ?? "text"}
                      value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                {!editingTenant && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1.5" style={{ color:"var(--detail)" }}>Datos del Administrador</label>
                      <div className="h-px w-full" style={{ background:"var(--border)" }} />
                    </div>
                    {[
                      { label:"Nombre del Admin", key:"adminName", placeholder:"Juan Pérez" },
                      { label:"Contraseña Admin", key:"adminPassword", placeholder:"admin123", type:"password" },
                      { label:"Teléfono Admin", key:"adminPhone", placeholder:"+52 614 555 0000" },
                    ].map(f => (
                      <div key={f.key}>
                        <Label>{f.label}</Label>
                        <Input
                          type={f.type ?? "text"}
                          value={(form as any)[f.key]}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                        />
                      </div>
                    ))}
                  </>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:"var(--text-secondary)" }}>Plan</label>
                  <select
                    value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--border)", color:"var(--text-primary)" }}
                  >
                    <option value="STARTER">Starter — $29/mes</option>
                    <option value="PRO">Pro — $79/mes</option>
                    <option value="ENTERPRISE">Enterprise — $199/mes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:"var(--text-secondary)" }}>Estado</label>
                  <select
                    value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--border)", color:"var(--text-primary)" }}
                  >
                    <option value="TRIAL">Trial</option>
                    <option value="ACTIVE">Activo</option>
                    <option value="SUSPENDED">Suspendido</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button onClick={() => setShowModal(false)} variant="secondary">
                  Cancelar
                </Button>
                <Button onClick={save} disabled={isSaving} className="gap-2">
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  {editingTenant ? "Guardar" : "Crear Gimnasio"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
            className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-semibold z-50"
            style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text-primary)", boxShadow:"var(--shadow-lg)" }}
          >
            ✅ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
