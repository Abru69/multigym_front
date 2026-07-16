import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchApi } from '@/lib/api'
import {
  UserPlus,
  Dumbbell,
  Trash2,
  MoreVertical,
  Edit2,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/DropdownMenu'
import type { ResponseDTO, UserDTO } from '@/types'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/permissions'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

type RoleFilter = 'ALL' | 'ADMIN' | 'CLIENT' | 'NUTRICIONIST' | 'STAFF' | 'RECEPTIONIST' | 'SELLER'

export default function UsersPage() {
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  const [clients, setClients] = useState<UserDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'CLIENT',
    status: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await fetchApi<ResponseDTO<{ data: UserDTO[] }>>('/api/tenant/users')
      if (response?.dto?.data) {
        setClients(response.dto.data)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers()
  }, [loadUsers])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return clients.filter((u) => {
      const name = u.memberDTO?.name || u.email
      const matchesSearch =
        name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      const matchesRole =
        roleFilter === 'ALL' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [clients, debouncedSearch, roleFilter])

  const activeCount = useMemo(() => clients.filter((c) => c.isActive).length, [clients])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.name) errors.name = 'El nombre es requerido'
    if (!form.phone) errors.phone = 'El teléfono es requerido'
    if (!form.email) errors.email = 'El email es requerido'
    if (!form.email.includes('@')) errors.email = 'Email inválido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveUser = async () => {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      if (selectedUser) {
        await fetchApi(`/api/tenant/users/${selectedUser.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email,
            role: form.role,
            status: form.status,
          }),
        })
        addToast('Usuario actualizado correctamente', 'success')
      } else {
        await fetchApi(`/api/tenant/users`, {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email,
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
    setForm({ name: '', phone: '', email: '', role: 'CLIENT', status: true })
    setFormErrors({})
    setSelectedUser(null)
    setShowModal(true)
  }

  const openEdit = (user: UserDTO) => {
    setForm({
      name: user.memberDTO?.name || '',
      phone: user.memberDTO?.phone || '',
      email: user.email,
      role: user.role,
      status: user.isActive,
    })
    setFormErrors({})
    setSelectedUser(user)
    setShowModal(true)
  }

  const toggleStatus = async (user: UserDTO) => {
    try {
      await fetchApi(`/api/tenant/users/${user.id}/status`, { method: 'PATCH' })
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
      await fetchApi(`/api/tenant/users/${deleteTarget.id}`, { method: 'DELETE' })
      setClients(clients.filter((c) => c.id !== deleteTarget.id))
      addToast(`${deleteTarget.memberDTO?.name || deleteTarget.email} eliminado`, 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const getName = (user: UserDTO) => user.memberDTO?.name || user.email.split('@')[0]

  const getInitials = (user: UserDTO) => {
    const name = getName(user)
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const roleFilters: { key: RoleFilter; label: string }[] = [
    { key: 'ALL', label: 'Todos' },
    { key: 'ADMIN', label: 'Admin' },
    { key: 'CLIENT', label: 'Cliente' },
    { key: 'NUTRICIONIST', label: 'Nutriólogo' },
    { key: 'STAFF', label: 'Staff' },
    { key: 'RECEPTIONIST', label: 'Recepcionista' },
    { key: 'SELLER', label: 'Vendedor' },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            style={{ fontFamily: 'var(--font-heading)' }}
            className="text-2xl font-black"
          >
            Clientes
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {clients.length} usuarios registrados — {activeCount} activos
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          <UserPlus size={16} /> Nuevo Cliente
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}
        >
          <p className="flex-1 text-sm" style={{ color: '#b91c1c' }}>{error}</p>
          <button
            onClick={loadUsers}
            className="text-sm font-semibold hover:underline"
            style={{ color: '#b91c1c' }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o email..."
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          {roleFilters.map((rf) => (
            <button
              key={rf.key}
              onClick={() => setRoleFilter(rf.key)}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor:
                  roleFilter === rf.key ? 'var(--accent)' : 'var(--card)',
                color:
                  roleFilter === rf.key ? 'var(--accent-text)' : 'var(--text-secondary)',
                border:
                  roleFilter === rf.key
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border)',
              }}
            >
              {rf.label}
            </button>
          ))}
          <span
            className="ml-2 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
            }}
          >
            {filtered.length}
          </span>
        </div>
      </div>

      {/* User Cards Grid */}
      {isLoading ? (
        <LoadingState text="Cargando usuarios..." />
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-16"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
        >
          <UserPlus size={48} style={{ color: 'var(--text-muted)' }} className="mb-4" />
          <p
            className="text-lg font-bold mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            No hay usuarios
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Comienza agregando tu primer cliente al gimnasio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((user) => (
            <div
              key={user.id}
              onClick={() => openEdit(user)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openEdit(user)
                }
              }}
              role="button"
              tabIndex={0}
              className="group bg-[var(--card)] rounded-2xl p-5 transition-all duration-200 cursor-pointer"
              style={{
                border: '1px solid var(--border)',
                borderLeftWidth: 3,
                borderLeftColor:
                  ROLE_COLORS[user.role]?.bg || 'var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 56,
                      height: 56,
                      backgroundColor: 'var(--accent)',
                      color: 'var(--accent-text)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    <span className="text-lg font-black">{getInitials(user)}</span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-bold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {getName(user)}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Dropdown */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <DropdownMenu
                    trigger={
                      <button
                        className="rounded-lg p-1.5 transition-all duration-200"
                        style={{
                          border: '1px solid transparent',
                          color: 'var(--text-muted)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.color = 'var(--text-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'transparent'
                          e.currentTarget.style.color = 'var(--text-muted)'
                        }}
                        aria-label="Más opciones"
                      >
                        <MoreVertical size={16} />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => openEdit(user)}>
                      <Edit2 size={14} /> Editar
                    </DropdownItem>
                    <DropdownItem
                      onClick={() =>
                        navigate(`/admin/ejercicios?tab=routines&userId=${user.id}`)
                      }
                      className="text-[var(--accent-text)]"
                    >
                      <Dumbbell size={14} /> Crear Rutina
                    </DropdownItem>
                    <DropdownItem onClick={() => toggleStatus(user)}>
                      {user.isActive ? '⏸ Desactivar' : '▶ Activar'}
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem danger onClick={() => setDeleteTarget(user)}>
                      <Trash2 size={14} /> Eliminar
                    </DropdownItem>
                  </DropdownMenu>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mt-3">
                {(() => {
                  const colors = ROLE_COLORS[user.role] || ROLE_COLORS.CLIENT
                  const label = ROLE_LABELS[user.role] || user.role
                  return (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {label}
                    </span>
                  )
                })()}
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: user.isActive ? '#f0fdf4' : '#fef2f2',
                    color: user.isActive ? '#16a34a' : '#dc2626',
                  }}
                >
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Bottom row */}
              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: '1px solid #f1f5f9' }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {user.memberDTO?.phone || 'Sin teléfono'}
                </span>
                <span
                  className="text-xs font-semibold flex items-center gap-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                  style={{ color: 'var(--accent)' }}
                >
                  Ver detalles <ChevronRight size={12} />
                </span>
              </div>
            </div>
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
          <FormField label="Nombre Completo" htmlFor="user-name" error={formErrors.name} required>
            <Input
              id="user-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Juan Pérez"
              error={!!formErrors.name}
            />
          </FormField>

          <FormField label="Teléfono" htmlFor="user-phone" error={formErrors.phone} required>
            <Input
              id="user-phone"
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ej: 555-1234"
              error={!!formErrors.phone}
            />
          </FormField>

          <FormField
            label="Correo Electrónico"
            required
            htmlFor="user-email"
            error={formErrors.email}
          >
            <Input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="usuario@ejemplo.com"
              error={!!formErrors.email}
            />
          </FormField>

          {!selectedUser && (
            <p className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
              Se enviará un correo de activación al nuevo usuario para que establezca su contraseña.
            </p>
          )}

          {selectedUser && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await fetchApi(`/api/tenant/users/${selectedUser.id}/reset-password`, { method: 'POST' })
                  addToast('Correo de restablecimiento enviado', 'success')
                } catch (err: unknown) {
                  addToast(err instanceof Error ? err.message : 'Error al enviar restablecimiento', 'error')
                }
              }}
              className="w-full rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all hover:opacity-80"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-muted)' }}
            >
              Enviar correo de restablecimiento de contraseña
            </button>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Rol" htmlFor="user-role">
              <select
                id="user-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="flex h-11 w-full appearance-none rounded-xl px-4 py-2 text-sm transition-all duration-200 hover:border-[var(--border)] focus:ring-2 focus:outline-none"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--text-primary)',
                  '--tw-ring-color': 'var(--accent)',
                } as React.CSSProperties}
              >
                <option value="CLIENT">Cliente</option>
                <option value="ADMIN">Administrador</option>
                <option value="NUTRICIONIST">Nutriólogo</option>
                <option value="STAFF">Staff</option>
                <option value="RECEPTIONIST">Recepcionista</option>
                <option value="SELLER">Vendedor</option>
              </select>
            </FormField>

            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.checked })}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Activo
                </span>
              </label>
            </div>
          </div>
        </div>

        <div
          className="mt-6 flex justify-end gap-3 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setShowModal(false)}
            disabled={isSaving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
            style={{
              border: '1px solid var(--border)',
backgroundColor: 'var(--card)',
                  color: 'var(--text-primary)',
                }}
              >
                Cancelar
          </button>
          <button
            onClick={handleSaveUser}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
            }}
          >
            {isSaving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'rgba(26,58,0,0.3)', borderTopColor: 'var(--accent-text)' }} />
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
