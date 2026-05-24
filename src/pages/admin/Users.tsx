import { motion } from "framer-motion"
import { mockUsers } from "@/data/users"
import { formatDate, getInitials } from "@/lib/utils"
import { Search, MoreVertical, UserPlus, Mail, Phone } from "lucide-react"
import { useState } from "react"

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const clients = mockUsers.filter((u) => u.role === "client")
  const filtered = clients.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Usuarios</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{clients.length} clientes registrados</p>
        </div>
        <button onClick={() => alert("Módulo de creación de clientes en desarrollo.")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--accent)", color: "var(--accent-text)" }}>
          <UserPlus size={16} />
          Nuevo Cliente
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl group transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: user.isActive ? "rgba(0,204,136,0.1)" : "rgba(255,77,77,0.1)",
                      color: user.isActive ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <button onClick={() => alert(`Opciones de administrador para ${user.name}`)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }}>
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                <Mail size={13} />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <Phone size={13} />
                  {user.phone}
                </div>
              )}
            </div>

            {user.currentPlan && (
              <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: "var(--background)" }}>
                <span style={{ color: "var(--text-muted)" }}>Plan: </span>
                <span className="font-medium" style={{ color: "var(--accent)" }}>{user.currentPlan}</span>
              </div>
            )}

            <p className="text-[11px] mt-3" style={{ color: "var(--text-muted)" }}>
              Miembro desde {formatDate(user.joinDate)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
