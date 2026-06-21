import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fetchApi } from "@/lib/api"
import { getInitials } from "@/lib/utils"
import { Search, MoreVertical, UserPlus, Mail, Phone, X, ShieldCheck, Dumbbell, Zap, PlusCircle, Loader2, Trash2, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import "./styles/Users.css"

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
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", role: "CLIENT", status: true })

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
            name: form.name,
            phone: form.phone,
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
            name: form.name,
            phone: form.phone,
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
    setForm({ name: "", phone: "", email: "", password: "", role: "CLIENT", status: true })
    setSelectedUser(null)
    setShowModal(true)
  }

  const openEdit = (user: UserDTO) => {
    setForm({ name: user.memberDTO?.name || "", phone: user.memberDTO?.phone || "", email: user.email, password: "", role: user.role, status: user.isActive })
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
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Clientes</h1>
          <p className="admin-page-subtitle">{clients.length} usuarios registrados en el gimnasio</p>
        </div>
        <Button onClick={openCreate} className="gap-2 accent-glow">
          <UserPlus size={16} />
          Nuevo Usuario
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="users-error-banner">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
          <button onClick={loadUsers} className="ml-auto text-xs font-bold px-3 py-1 rounded-lg bg-[var(--input-bg)] text-[var(--text-primary)]">Reintentar</button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="pl-10"
          />
        </div>
        <div className="users-stats-box">
          <ShieldCheck size={16} className="text-success" />
          <span className="text-text-primary">Activos: {clients.filter(c => c.isActive).length}</span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      )}

      {/* Grid */}
      {!isLoading && (
        <div className="users-grid">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="user-card"
            >
              {/* Header / Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="user-avatar">
                  {getInitials(getName(user))}
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} className="user-menu-btn">
                    <MoreVertical size={16} />
                  </button>
                  <AnimatePresence>
                    {openMenuId === user.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="user-dropdown">
                        <button onClick={() => openEdit(user)} className="user-dropdown-item primary">✏️ Editar Perfil</button>
                        <button onClick={() => navigate(`/admin/ejercicios?tab=routines&userId=${user.id}`)} className="user-dropdown-item accent"><PlusCircle size={14} /> Rutina Personalizada</button>
                        <button onClick={() => toggleStatus(user)} className="user-dropdown-item primary">{user.isActive ? "⏸ Desactivar" : "▶ Activar"}</button>
                        <button onClick={() => deleteUser(user)} className="user-dropdown-item danger"><Trash2 size={14} /> Eliminar</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Info */}
              <div>
                <p className="font-bold text-base leading-tight truncate text-text-primary">{getName(user)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="user-status-badge" style={{ background: user.isActive ? "var(--accent-muted)" : "var(--error-muted)", color: user.isActive ? "var(--success)" : "var(--danger)" }}>
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                  <span className="user-role-badge">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="user-info-text">
                  <Mail size={14} className="text-text-muted" /> <span className="truncate">{user.email}</span>
                </div>
                {user.memberDTO?.phone && (
                  <div className="user-info-text">
                    <Phone size={14} className="text-text-muted" /> {user.memberDTO.phone}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button onClick={() => navigate(`/admin/ejercicios?tab=routines&userId=${user.id}`)} className="user-action-btn">
                <Dumbbell size={14} /> Crear Rutina
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && !error && (
        <div className="text-center py-16">
          <UserPlus size={40} className="mx-auto mb-4 opacity-30 text-text-muted" />
          <p className="text-sm text-text-muted">No hay usuarios registrados</p>
        </div>
      )}

      {/* User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="admin-modal-content !max-w-md !overflow-visible" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">{selectedUser ? "Editar Usuario" : "Nuevo Usuario"}</h2>
                <button onClick={() => setShowModal(false)} className="admin-close-btn"><X size={20} /></button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <Label className="admin-form-label">Nombre Completo</Label>
                  <Input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Juan Pérez" />
                </div>
                <div className="admin-form-group">
                  <Label className="admin-form-label">Teléfono</Label>
                  <Input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Ej: 555-1234" />
                </div>
                <div className="admin-form-group">
                  <Label className="admin-form-label">Correo Electrónico</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="usuario@ejemplo.com" />
                </div>
                <div className="admin-form-group">
                  <Label className="admin-form-label">Contraseña {selectedUser && <span className="normal-case font-normal text-text-muted">(dejar vacío para no cambiar)</span>}</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="admin-form-group">
                    <Label className="admin-form-label">Rol</Label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent transition-colors appearance-none cursor-pointer">
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

              <div className="admin-modal-header border-t">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 text-sm font-bold border-none bg-[var(--background)] text-text-secondary">Cancelar</Button>
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
          <div className="admin-modal-overlay" onClick={() => setShowAssignModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="admin-modal-content !max-w-md text-center p-6" onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[var(--accent-muted)] text-[var(--accent)]">
                <Zap size={32} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2 text-text-primary font-heading">Asignar Rutina</h2>
              <p className="text-sm mb-6 text-text-muted">Selecciona una rutina de la biblioteca para asignarla a <strong className="text-text-primary">{getName(selectedUser!)}</strong>.</p>
              
              <div className="space-y-3 mb-8 text-left">
                {["Volumen Limpio 4 Días", "Definición Extrema", "Full Body Principiantes"].map((r, idx) => (
                  <button key={idx} onClick={() => { alert(`Rutina "${r}" asignada a ${getName(selectedUser!)}`); setShowAssignModal(false) }} className="routine-option-btn">
                    <span className="font-bold text-sm text-text-primary">{r}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[var(--surface)] text-[var(--accent)]">Seleccionar</span>
                  </button>
                ))}
              </div>

              <button onClick={() => setShowAssignModal(false)} className="text-sm font-bold py-2 text-text-secondary">Cancelar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="users-toast"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
