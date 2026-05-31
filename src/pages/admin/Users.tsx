import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { mockUsers } from "@/data/users"
import { formatDate, getInitials } from "@/lib/utils"
import { Search, MoreVertical, UserPlus, Mail, Phone, X, ShieldCheck, Dumbbell, Zap, PlusCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
export default function UsersPage() {
  const [clients, setClients] = useState(mockUsers.filter((u) => u.role === "client"))
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const navigate = useNavigate()

  // Form State
  const [form, setForm] = useState({ name: "", email: "", phone: "", plan: "Básico", isActive: true })

  const filtered = clients.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  const handleSaveUser = () => {
    if (!form.name || !form.email) return alert("Nombre y email son requeridos.")
    if (selectedUser) {
      setClients(clients.map(c => c.id === selectedUser.id ? { ...c, ...form } : c))
    } else {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: "client" as const,
        isActive: form.isActive,
        joinDate: new Date().toISOString(),
        currentPlan: form.plan,
      }
      setClients([newUser, ...clients])
    }
    setShowModal(false)
  }

  const openCreate = () => {
    setForm({ name: "", email: "", phone: "", plan: "Básico", isActive: true })
    setSelectedUser(null)
    setShowModal(true)
  }

  const openEdit = (user: any) => {
    setForm({ name: user.name, email: user.email, phone: user.phone || "", plan: user.currentPlan || "Básico", isActive: user.isActive })
    setSelectedUser(user)
    setShowModal(true)
    setOpenMenuId(null)
  }

  const openAssign = (user: any) => {
    setSelectedUser(user)
    setShowAssignModal(true)
    setOpenMenuId(null)
  }

  const toggleStatus = (user: any) => {
    setClients(clients.map(c => c.id === user.id ? { ...c, isActive: !c.isActive } : c))
    setOpenMenuId(null)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Clientes</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{clients.length} clientes registrados en el gimnasio</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all" style={{ background: "var(--accent)", color: "var(--accent-text)", boxShadow: "0 0 20px rgba(0,0,255,0.3)" }}>
          <UserPlus size={16} />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border)"}
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <ShieldCheck size={16} style={{ color: "var(--success)" }} />
          <span style={{ color: "var(--text-primary)" }}>Activos: {clients.filter(c => c.isActive).length}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((user, i) => (
          <motion.div
            key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl relative transition-all group"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
          >
            {/* Header / Avatar */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black" style={{ background: "linear-gradient(135deg, var(--accent), var(--detail))", color: "var(--accent-text)" }}>
                {getInitials(user.name)}
              </div>
              <div className="relative">
                <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all" style={{ color: "var(--text-muted)", background: "rgba(255,255,255,0.05)" }}>
                  <MoreVertical size={16} />
                </button>
                <AnimatePresence>
                  {openMenuId === user.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-full mt-2 z-10 w-48 py-1 rounded-xl shadow-lg overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <button onClick={() => openEdit(user)} className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-primary)" }}>✏️ Editar Perfil</button>
                      <button onClick={() => navigate(`/admin/rutinas?userId=${user.id}`)} className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--accent)" }}><PlusCircle size={14} /> Rutina Personalizada</button>
                      <button onClick={() => toggleStatus(user)} className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5" style={{ color: "var(--text-primary)" }}>{user.isActive ? "⏸ Desactivar" : "▶ Activar"}</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Info */}
            <div>
              <p className="font-bold text-base leading-tight truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: user.isActive ? "rgba(0,204,136,0.15)" : "rgba(255,77,77,0.15)", color: user.isActive ? "var(--success)" : "var(--danger)" }}>
                {user.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                <Mail size={14} style={{ color: "var(--text-muted)" }} /> <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  <Phone size={14} style={{ color: "var(--text-muted)" }} /> {user.phone}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px dashed var(--border)" }}>
              <div className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.05)", color: "var(--detail)" }}>
                {user.currentPlan || "Plan Básico"}
              </div>
              <p className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>{formatDate(user.joinDate)}</p>
            </div>

            {/* Action Overlay Button */}
            <motion.button onClick={() => navigate(`/admin/rutinas?userId=${user.id}`)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all" style={{ background: "rgba(0,0,255,0.1)", color: "var(--accent)", border: "1px solid rgba(0,0,255,0.2)" }}>
              <Dumbbell size={14} /> Crear Rutina
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>{selectedUser ? "Editar Cliente" : "Nuevo Cliente"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-white/10" style={{ color: "var(--text-muted)" }}><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Nombre Completo</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-colors" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="Ej: Juan Pérez" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Correo Electrónico</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-colors" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="juan@ejemplo.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Teléfono</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-colors" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="555-1234" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Plan</label>
                    <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none appearance-none" style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                      <option value="Básico">Básico</option>
                      <option value="Premium">Premium</option>
                      <option value="Elite">Elite</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded accent-[var(--accent)]" />
                  <label htmlFor="isActive" className="text-sm font-bold cursor-pointer" style={{ color: "var(--text-primary)" }}>Cuenta Activa</label>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors" style={{ background: "var(--background)", color: "var(--text-secondary)" }}>Cancelar</button>
                <button onClick={handleSaveUser} className="flex-1 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] active:scale-95" style={{ background: "var(--accent)", color: "var(--accent-text)", boxShadow: "0 0 20px rgba(0,0,255,0.3)" }}>Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Routine Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setShowAssignModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl p-6 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 25px 50px -12px rgba(0,0,255,0.15)" }} onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(0,0,255,0.1)", color: "var(--accent)" }}>
                <Zap size={32} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Asignar Rutina</h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Selecciona una rutina de la biblioteca para asignarla a <strong>{selectedUser?.name}</strong>.</p>
              
              <div className="space-y-3 mb-8 text-left">
                {["Volumen Limpio 4 Días", "Definición Extrema", "Full Body Principiantes"].map((r, idx) => (
                  <button key={idx} onClick={() => { alert(`Rutina "${r}" asignada a ${selectedUser?.name}`); setShowAssignModal(false) }} className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                    <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{r}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style={{ background: "var(--surface)", color: "var(--accent)" }}>Seleccionar</span>
                  </button>
                ))}
              </div>

              <button onClick={() => setShowAssignModal(false)} className="text-sm font-bold py-2" style={{ color: "var(--text-secondary)" }}>Cancelar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
