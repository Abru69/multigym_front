import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchApi } from '@/lib/api'
import {
  UserPlus,
  Mail,
  Phone,
  ShieldCheck,
  Dumbbell,
  Trash2,
  MoreVertical,
  Edit2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { useToastStore } from '@/components/ui/Toast'
import type { ResponseDTO, UserDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

export default function UsersPage() {
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  const [clients, setClients] = useState<UserDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserDTO | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'CLIENT',
    status: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await fetchApi<ResponseDTO<UserDTO>>('/api/tenant/user/getAll')
      if (response && response.lista) {
        setClients(response.lista)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return clients.filter((u) => {
      const name = u.memberDTO?.name || u.email
      return name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    })
  }, [clients, debouncedSearch])

  const activeCount = useMemo(() => clients.filter((c) => c.isActive).length, [clients])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.email) errors.email = 'El email es requerido'
    if (!form.email.includes('@')) errors.email = 'Email inválido'
    if (!selectedUser && !form.password) errors.password = 'La contraseña es requerida'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveUser = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      if (selectedUser) {
        await fetchApi<UserDTO>(`/api/tenant/user/update/${selectedUser.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email,
            password: form.password || undefined,
            role: form.role,
            status: form.status,
          }),
        })
        addToast('Usuario actualizado correctamente', 'success')
      } else {
        await fetchApi<ResponseDTO<unknown>>('/api/tenant/user', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email,
            password: form.password,
            role: form.role,
            status: form.status,
          }),
        })
        addToast('Usuario creado correctamente', 'success')
      }
      setShowModal(false)
      loadUsers()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const openCreate = () => {
    setForm({ name: '', phone: '', email: '', password: '', role: 'CLIENT', status: true })
    setFormErrors({})
    setSelectedUser(null)
    setShowModal(true)
  }

  const openEdit = (user: UserDTO) => {
    setForm({
      name: user.memberDTO?.name || '',
      phone: user.memberDTO?.phone || '',
      email: user.email,
      password: '',
      role: user.role,
      status: user.isActive,
    })
    setFormErrors({})
    setSelectedUser(user)
    setShowModal(true)
    setOpenMenuId(null)
  }

  const toggleStatus = async (user: UserDTO) => {
    setOpenMenuId(null)
    try {
      await fetchApi<UserDTO>(`/api/tenant/user/${user.id}/status`, { method: 'PATCH' })
      setClients(clients.map((c) => (c.id === user.id ? { ...c, isActive: !c.isActive } : c)))
      addToast(
        `${user.memberDTO?.name || user.email} ${user.isActive ? 'desactivado' : 'activado'}`,
        'success'
      )
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al cambiar estado', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await fetchApi(`/api/tenant/user/delete/${deleteTarget.id}`, { method: 'DELETE' })
      setClients(clients.filter((c) => c.id !== deleteTarget.id))
      addToast(`${deleteTarget.memberDTO?.name || deleteTarget.email} eliminado`, 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const getName = (user: UserDTO) => user.memberDTO?.name || user.email.split('@')[0]

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Clientes"
        subtitle={`${clients.length} usuarios registrados — ${activeCount} activos`}
        icon={ShieldCheck}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg transition-all hover:brightness-110"
          >
            <UserPlus size={16} /> Nuevo Usuario
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3">
          <p className="flex-1 text-sm text-[var(--error)]">{error}</p>
          <button
            onClick={loadUsers}
            className="text-sm font-semibold text-[var(--error)] hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o email..."
          className="flex-1"
        />
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
          <ShieldCheck size={16} className="text-[var(--success)]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Activos: {activeCount}
          </span>
        </div>
      </div>

      {isLoading ? (
        <LoadingState text="Cargando usuarios..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No hay usuarios"
          description="Comienza agregando tu primer cliente al gimnasio."
          action={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)]"
            >
              <UserPlus size={16} /> Agregar Usuario
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--accent)]/30 hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      background: user.isActive ? 'var(--accent-muted)' : 'var(--error-muted)',
                      color: user.isActive ? 'var(--success)' : 'var(--error)',
                    }}
                  >
                    {getName(user).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                      {getName(user)}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(openMenuId === user.id ? null : user.id)
                    }}
                    className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                    aria-label="Más opciones"
                    aria-expanded={openMenuId === user.id}
                  >
                    <MoreVertical size={16} />
                  </button>
                  <AnimatePresence>
                    {openMenuId === user.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-xl"
                      >
                        <button
                          onClick={() => openEdit(user)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/ejercicios?tab=routines&userId=${user.id}`)
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--accent)] hover:bg-[var(--surface-hover)]"
                        >
                          <Dumbbell size={14} /> Crear Rutina
                        </button>
                        <button
                          onClick={() => toggleStatus(user)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                        >
                          {user.isActive ? '⏸ Desactivar' : '▶ Activar'}
                        </button>
                        <div className="my-1 h-px bg-[var(--border)]" />
                        <button
                          onClick={() => {
                            setOpenMenuId(null)
                            setDeleteTarget(user)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--error)]/10"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    background: user.isActive ? 'var(--accent-muted)' : 'var(--error-muted)',
                    color: user.isActive ? 'var(--success)' : 'var(--error)',
                  }}
                >
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <span className="rounded-full bg-[var(--surface-hover)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                  {user.role}
                </span>
              </div>

              <div className="mb-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Mail size={12} className="flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.memberDTO?.phone && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Phone size={12} className="flex-shrink-0" aria-hidden="true" />
                    <span>{user.memberDTO.phone}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(`/admin/ejercicios?tab=routines&userId=${user.id}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-transparent py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <Dumbbell size={14} /> Crear Rutina
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Nombre Completo" htmlFor="user-name">
            <input
              id="user-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Juan Pérez"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
            />
          </FormField>

          <FormField label="Teléfono" htmlFor="user-phone">
            <input
              id="user-phone"
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ej: 555-1234"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
            />
          </FormField>

          <FormField
            label="Correo Electrónico"
            required
            htmlFor="user-email"
            error={formErrors.email}
          >
            <input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="usuario@ejemplo.com"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
            />
          </FormField>

          <FormField
            label={selectedUser ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            required={!selectedUser}
            htmlFor="user-password"
            error={formErrors.password}
          >
            <input
              id="user-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Rol" htmlFor="user-role">
              <select
                id="user-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="h-10 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
              >
                <option value="CLIENT">Cliente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </FormField>

            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                />
                <span className="text-sm font-semibold text-[var(--text-primary)]">Activo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border)] pt-4">
          <button
            onClick={() => setShowModal(false)}
            disabled={isSaving}
            className="rounded-xl border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveUser}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] shadow-[var(--accent)]/25 shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isSaving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            Guardar
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar a ${deleteTarget ? getName(deleteTarget) : ''}? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
