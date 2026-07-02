import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X, Shield, Headphones, Code, MoreVertical } from 'lucide-react'
import { usePlatformUsersStore } from '../store/platformUsersStore'
import { ConfirmDialog } from '@/features/admin/components/ConfirmDialog'
import type { PlatformUserDTO, PlatformUserRequestDTO } from '@/types'

type Role = 'SUPER_ADMIN' | 'SUPPORT' | 'DEVOPS'

const roleConfig: Record<Role, { icon: React.ElementType; color: string; label: string }> = {
  SUPER_ADMIN: { icon: Shield, color: 'var(--warning)', label: 'Super Admin' },
  SUPPORT: { icon: Headphones, color: 'var(--info)', label: 'Soporte' },
  DEVOPS: { icon: Code, color: 'var(--success)', label: 'DevOps' },
}

export default function PlatformUsers() {
  const { users, isLoading, error, loadUsers, createUser, updateUser, toggleStatus, deleteUser } =
    usePlatformUsersStore()

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PlatformUserDTO | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<PlatformUserDTO | null>(null)
  const [form, setForm] = useState<PlatformUserRequestDTO>({
    email: '',
    password: '',
    name: '',
    lastName: '',
    role: 'SUPPORT',
  })

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.lastName && u.lastName.toLowerCase().includes(search.toLowerCase()))
  )

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const openCreate = () => {
    setForm({ email: '', password: '', name: '', lastName: '', role: 'SUPPORT' })
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (u: PlatformUserDTO) => {
    setForm({
      email: u.email,
      name: u.name,
      lastName: u.lastName || '',
      role: u.role,
    })
    setEditing(u)
    setShowModal(true)
    setOpenMenu(null)
  }

  const handleToggleStatus = async (u: PlatformUserDTO) => {
    const ok = await toggleStatus(u.id)
    if (ok) {
      showToast(`${u.email} ${u.isActive ? 'desactivado' : 'activado'}`)
    }
    setOpenMenu(null)
  }

  const confirmDelete = (u: PlatformUserDTO) => {
    setDeleteTarget(u)
    setOpenMenu(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const ok = await deleteUser(deleteTarget.id)
    if (ok) {
      showToast(`${deleteTarget.email} eliminado`)
    }
    setDeleteTarget(null)
  }

  const save = async () => {
    if (editing) {
      const ok = await updateUser(editing.id, form)
      if (ok) showToast('Cambios guardados')
    } else {
      const ok = await createUser(form)
      if (ok) showToast('Usuario creado')
    }
    setShowModal(false)
  }

  const roleCounts = (Object.keys(roleConfig) as Role[]).map((r) => ({
    role: r,
    count: users.filter((u) => u.role === r).length,
    ...roleConfig[r],
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Usuarios de Plataforma
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Administra los accesos al panel de gestión
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{
            background: 'var(--accent)',
            color: 'var(--text-on-primary)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'var(--error)/10',
            color: 'var(--error)',
            border: '1px solid var(--error)',
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {roleCounts.map((r) => (
          <div
            key={r.role}
            className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${r.color}15`, color: r.color }}
            >
              <r.icon size={18} />
            </div>
            <div>
              <p
                className="text-xl leading-none font-black"
                style={{ color: 'var(--text-primary)' }}
              >
                {r.count}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {r.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Search size={15} style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuario..."
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
            />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Usuario', 'Rol', 'Estado', 'Último acceso', 'Creado', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rc = roleConfig[u.role]
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b transition-colors last:border-b-0"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--surface-hover)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-black"
                          style={{
                            background: 'linear-gradient(135deg,var(--accent),var(--detail))',
                            color: 'var(--text-on-primary)',
                          }}
                        >
                          {u.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {u.name} {u.lastName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: rc.color }}
                      >
                        <rc.icon size={12} />
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{
                          background: `${u.isActive ? 'var(--success)' : 'var(--text-muted)'}18`,
                          color: u.isActive ? 'var(--success)' : 'var(--text-muted)',
                        }}
                      >
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Nunca'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="relative px-4 py-3">
                      <button
                        onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                        className="rounded-lg p-1.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <MoreVertical size={16} />
                      </button>
                      <AnimatePresence>
                        {openMenu === u.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-0 z-10 w-40 rounded-xl py-1 shadow-lg"
                            style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              top: '100%',
                            }}
                          >
                            {[
                              { label: '✏️ Editar', fn: () => openEdit(u) },
                              {
                                label: u.isActive ? '⏸ Desactivar' : '▶ Activar',
                                fn: () => handleToggleStatus(u),
                              },
                              {
                                label: '🗑 Eliminar',
                                fn: () => confirmDelete(u),
                                danger: true,
                              },
                            ].map((item) => (
                              <button
                                key={item.label}
                                onClick={item.fn}
                                className="block w-full px-4 py-2 text-left text-sm transition-colors"
                                style={{
                                  color: item.danger ? 'var(--danger)' : 'var(--text-secondary)',
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = 'var(--surface-hover)')
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = 'transparent')
                                }
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
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'var(--overlay)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Juan"
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={form.lastName || ''}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="García"
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="juan@saas.com"
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                {!editing && (
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-xs font-semibold"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={form.password || ''}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-1.5 block text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Rol
                  </label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="SUPPORT">Soporte</option>
                    <option value="DEVOPS">DevOps</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  disabled={isLoading}
                  className="rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'var(--accent)', color: 'var(--text-on-primary)' }}
                >
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar a ${deleteTarget?.email}? Esta acción no se puede deshacer.`}
        isLoading={isLoading}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-6 bottom-6 z-50 rounded-xl px-4 py-3 text-sm font-semibold"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            ✅ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
