import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fetchApi } from "@/lib/api"
import { getInitials } from "@/lib/utils"
import { Search, MoreVertical, UserPlus, Mail, Phone, X, ShieldCheck, Dumbbell, Zap, PlusCircle, Loader2, Trash2, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

// Types matching backend DTOs
interface MemberDTO {
  id: string
  name: string
  phone: string
}

interface UserDTO {
  id: string
  email: string
  role: string
  isActive: boolean
  memberDTO: MemberDTO | null
}

interface ResponseDTO<T> {
  estatus: string
  mensaje: string
  lista: any[]
  dto: T
  codError: string
}

export default function UsersPage() {
  const [clients, setClients] = useState<UserDTO[]>([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState("")
  const navigate = useNavigate()

  // Form State
  const [form, setForm] = useState({ email: "", password: "", role: "CLIENT", status: true })

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  // Fetch users from backend
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetchApi<ResponseDTO<null>>("/api/tenant/user/getAll")
      if (response && response.lista) {
        setClients(response.lista as UserDTO[])
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios")
      console.error("Failed to load users:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filtered = clients.filter((u) => {
    const name = u.memberDTO?.name || u.email
    return name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  })

  const handleSaveUser = async () => {
    if (!form.email) return alert("Email es requerido.")

    setIsSaving(true)
    try {
      if (selectedUser) {
        // UPDATE user
        await fetchApi<UserDTO>(`/api/tenant/user/update/${selectedUser.id}`, {
          method: "PUT",
          body: JSON.stringify({
            email: form.email,
            password: form.password || undefined,
            role: form.role,
            status: form.status,
          }),
        })
        showToast("✅ Usuario actualizado")
      } else {
        // CREATE user
        await fetchApi<ResponseDTO<any>>("/api/tenant/user", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            role: form.role,
            status: form.status,
          }),
        })
        showToast("✅ Usuario creado")
      }
      setShowModal(false)
      loadUsers()
    } catch (err: any) {
      showToast(`❌ Error: ${err.message || "No se pudo guardar"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const openCreate = () => {
    setForm({ email: "", password: "", role: "CLIENT", status: true })
    setSelectedUser(null)
    setShowModal(true)
  }

  const openEdit = (user: UserDTO) => {
    setForm({ email: user.email, password: "", role: user.role, status: user.isActive })
    setSelectedUser(user)
    setShowModal(true)
    setOpenMenuId(null)
  }

  const toggleStatus = async (user: UserDTO) => {
    setOpenMenuId(null)
    try {
      await fetchApi<UserDTO>(`/api/tenant/user/${user.id}/status`, {
        method: "PATCH",
      })
      setClients(clients.map(c => c.id === user.id ? { ...c, isActive: !c.isActive } : c))
      showToast(`✅ ${user.memberDTO?.name || user.email} ${user.isActive ? "desactivado" : "activado"}`)
    } catch (err: any) {
      showToast(`❌ Error: ${err.message || "No se pudo cambiar estado"}`)
    }
  }

  const deleteUser = async (user: UserDTO) => {
    if (!confirm(`¿Eliminar a ${user.memberDTO?.name || user.email}? Esta acción no se puede deshacer.`)) return
    setOpenMenuId(null)
    try {
      await fetchApi(`/api/tenant/user/delete/${user.id}`, {
        method: "DELETE",
      })
      setClients(clients.filter(c => c.id !== user.id))
      showToast(`✅ ${user.memberDTO?.name || user.email} eliminado`)
    } catch (err: any) {
      showToast(`❌ Error: ${err.message || "No se pudo eliminar"}`)
    }
  }

  const getName = (user: UserDTO) => user.memberDTO?.name || user.email.split("@")[0]

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Clientes</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{clients.length} usuarios registrados en el gimnasio</p>
        </div>
        <Button onClick={openCreate} className="gap-2 accent-glow">
          <UserPlus size={16} />
          Nuevo Usuario
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "var(--error-muted)", border: "1px solid var(--error)" }}>
          <AlertCircle size={16} style={{ color: "var(--danger)" }} />
          <span className="text-sm" style={{ color: "var(--danger)" }}>{error}</span>
          <button onClick={loadUsers} className="ml-auto text-xs font-bold px-3 py-1 rounded-lg" style={{ background: "var(--input-bg)", color: "var(--text-primary)" }}>Reintentar</button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <Input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <ShieldCheck size={16} style={{ color: "var(--success)" }} />
          <span style={{ color: "var(--text-primary)" }}>Activos: {clients.filter(c => c.isActive).length}</span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      )}

      {/* Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl relative transition-all group"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}
            >
              {/* Header / Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black" style={{ background: "linear-gradient(135deg, var(--accent), var(--detail))", color: "var(--accent-text)" }}>
                  {getInitials(getName(user))}
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all" style={{ color: "var(--text-muted)", background: "var(--input-bg)" }}>
                    <MoreVertical size={16} />
                  </button>
                  <AnimatePresence>
                    {openMenuId === user.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute right-0 top-full mt-2 z-10 w-48 py-1 rounded-xl shadow-lg overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <button onClick={() => openEdit(user)} className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]" style={{ color: "var(--text-primary)" }}>✏️ Editar Perfil</button>
                        <button onClick={() => navigate(`/admin/rutinas?userId=${user.id}`)} className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]" style={{ color: "var(--accent)" }}><PlusCircle size={14} /> Rutina Personalizada</button>
                        <button onClick={() => toggleStatus(user)} className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]" style={{ color: "var(--text-primary)" }}>{user.isActive ? "⏸ Desactivar" : "▶ Activar"}</button>
                        <button onClick={() => deleteUser(user)} className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]" style={{ color: "var(--danger)" }}><Trash2 size={14} /> Eliminar</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Info */}
              <div>
                <p className="font-bold text-base leading-tight truncate" style={{ color: "var(--text-primary)" }}>{getName(user)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: user.isActive ? "var(--accent-muted)" : "var(--error-muted)", color: user.isActive ? "var(--success)" : "var(--danger)" }}>
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  <Mail size={14} style={{ color: "var(--text-muted)" }} /> <span className="truncate">{user.email}</span>
                </div>
                {user.memberDTO?.phone && (
                  <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    <Phone size={14} style={{ color: "var(--text-muted)" }} /> {user.memberDTO.phone}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <motion.button onClick={() => navigate(`/admin/rutinas?userId=${user.id}`)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all" style={{ background: "var(--accent-muted)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
                <Dumbbell size={14} /> Crear Rutina
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && !error && (
        <div className="text-center py-16">
          <UserPlus size={40} className="mx-auto mb-4 opacity-30" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No hay usuarios registrados</p>
        </div>
      )}

      {/* User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "var(--overlay)", backdropFilter: "blur(8px)" }} onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>{selectedUser ? "Editar Usuario" : "Nuevo Usuario"}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-[var(--surface-hover)]" style={{ color: "var(--text-muted)" }}><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Correo Electrónico</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="usuario@ejemplo.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Contraseña {selectedUser && <span className="normal-case font-normal text-text-muted">(dejar vacío para no cambiar)</span>}</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Rol</Label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent transition-colors appearance-none cursor-pointer">
                      <option value="CLIENT">Cliente</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="isActive" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} className="w-4 h-4 rounded accent-accent" />
                      <Label htmlFor="isActive" className="cursor-pointer mb-0">Activo</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 text-sm font-bold border-none bg-background text-text-secondary">Cancelar</Button>
                <Button onClick={handleSaveUser} disabled={isSaving} className="flex-1 gap-2 accent-glow">
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Guardar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Routine Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "var(--overlay)", backdropFilter: "blur(8px)" }} onClick={() => setShowAssignModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md rounded-3xl p-6 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }} onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                <Zap size={32} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Asignar Rutina</h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Selecciona una rutina de la biblioteca para asignarla a <strong>{getName(selectedUser!)}</strong>.</p>
              
              <div className="space-y-3 mb-8 text-left">
                {["Volumen Limpio 4 Días", "Definición Extrema", "Full Body Principiantes"].map((r, idx) => (
                  <button key={idx} onClick={() => { alert(`Rutina "${r}" asignada a ${getName(selectedUser!)}`); setShowAssignModal(false) }} className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
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

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-semibold z-50"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", boxShadow: "var(--shadow-md)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
