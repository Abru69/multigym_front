import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchApi } from '@/lib/api'
import { UserPlus, ShieldCheck, Dumbbell, Trash2, MoreVertical, Edit2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/DropdownMenu'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import type { ResponseDTO, UserDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
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
    loadUsers()
  }, [loadUsers])

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
        await fetchApi(`/api/tenant/users/${selectedUser.id}`, {
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
        await fetchApi(`/api/tenant/users`, {
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

  const columns: DataTableColumn<UserDTO>[] = useMemo(
    () => [
      {
        key: 'usuario',
        label: 'Usuario',
        sortable: true,
        render: (user) => (
          <div className="flex items-center gap-3">
            <Avatar name={getName(user)} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                {getName(user)}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        label: 'Rol',
        sortable: true,
        render: (user) => (
          <Badge variant={user.role === 'ADMIN' ? 'glass-accent' : 'glass'}>
            {user.role === 'ADMIN' ? 'Admin' : 'Cliente'}
          </Badge>
        ),
      },
      {
        key: 'isActive',
        label: 'Estado',
        sortable: true,
        render: (user) => (
          <Badge variant={user.isActive ? 'success' : 'destructive'}>
            {user.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        ),
      },
      {
        key: 'phone',
        label: 'Teléfono',
        render: (user) => (
          <span className="text-[var(--text-secondary)]">{user.memberDTO?.phone || '—'}</span>
        ),
      },
      {
        key: 'acciones',
        label: 'Acciones',
        className: 'w-[50px]',
        render: (user) => (
          <DropdownMenu
            trigger={
              <button
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-1.5 text-[var(--text-muted)] backdrop-blur-md transition-all hover:bg-white/[0.08] hover:text-[var(--text-primary)]"
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
              onClick={() => navigate(`/admin/ejercicios?tab=routines&userId=${user.id}`)}
              className="text-[var(--accent)]"
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
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clients]
  )

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Clientes"
        subtitle={`${clients.length} usuarios registrados — ${activeCount} activos`}
        icon={ShieldCheck}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(66,204,99,0.25)] transition-all hover:shadow-[0_0_32px_rgba(66,204,99,0.4)] active:scale-[0.97]"
          >
            <UserPlus size={16} /> Nuevo Usuario
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3 backdrop-blur-xl">
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
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 backdrop-blur-xl">
          <ShieldCheck size={16} className="text-[var(--success)]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Activos: {activeCount}
          </span>
        </div>
      </div>

      {isLoading ? (
        <LoadingState text="Cargando usuarios..." />
      ) : (
        <DataTable<UserDTO>
          columns={columns}
          data={filtered}
          keyExtractor={(user) => user.id}
          emptyIcon={UserPlus}
          emptyTitle="No hay usuarios"
          emptyDescription="Comienza agregando tu primer cliente al gimnasio."
        />
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
            <Input
              id="user-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Juan Pérez"
            />
          </FormField>

          <FormField label="Teléfono" htmlFor="user-phone">
            <Input
              id="user-phone"
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ej: 555-1234"
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

          <FormField
            label={selectedUser ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            required={!selectedUser}
            htmlFor="user-password"
            error={formErrors.password}
          >
            <Input
              id="user-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              error={!!formErrors.password}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Rol" htmlFor="user-role">
              <select
                id="user-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="flex h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-primary)] transition-all duration-300 hover:border-[var(--border-hover)] focus-visible:border-[var(--accent)] focus-visible:shadow-[0_0_16px_rgba(66,204,99,0.08)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/20 focus-visible:outline-none"
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
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveUser}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(66,204,99,0.25)] transition-all hover:shadow-[0_0_32px_rgba(66,204,99,0.4)] active:scale-[0.97]"
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
