import { useState, useEffect, useCallback, useMemo } from 'react'
import { getMembers, updateMember, deleteMember, fetchApi } from '@/lib/api'
import { UserPlus, Trash2, MoreVertical, Edit2, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import { DropdownMenu, DropdownItem, DropdownSeparator } from '@/components/ui/DropdownMenu'
import type { ResponseDTO, MemberListItemDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

export default function MembersPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [members, setMembers] = useState<MemberListItemDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberListItemDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MemberListItemDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', phone: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await getMembers()
      if (response?.dto?.data) {
        setMembers(response.dto.data)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar miembros')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return members.filter((m) => {
      return (
        m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)
      )
    })
  }, [members, debouncedSearch])

  const activeCount = useMemo(() => members.filter((m) => m.isActive).length, [members])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.name) errors.name = 'El nombre es requerido'
    if (!form.phone) errors.phone = 'El teléfono es requerido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openEdit = (member: MemberListItemDTO) => {
    setForm({ name: member.name, phone: member.phone })
    setFormErrors({})
    setSelectedMember(member)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!validateForm() || !selectedMember) return
    setIsSaving(true)
    try {
      await updateMember(selectedMember.id, { name: form.name, phone: form.phone })
      addToast('Miembro actualizado correctamente', 'success')
      setShowModal(false)
      loadMembers()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMember(deleteTarget.id)
      setMembers(members.filter((m) => m.id !== deleteTarget.id))
      addToast(`${deleteTarget.name} eliminado`, 'success')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl font-black">
            Miembros
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {members.length} miembros — {activeCount} activos
          </p>
        </div>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}
        >
          <p className="flex-1 text-sm" style={{ color: '#b91c1c' }}>{error}</p>
          <button onClick={loadMembers} className="text-sm font-semibold hover:underline" style={{ color: '#b91c1c' }}>
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre o email..." className="flex-1" />
        <span
          className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          {filtered.length}
        </span>
      </div>

      {isLoading ? (
        <LoadingState text="Cargando miembros..." />
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-16"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
        >
          <UserPlus size={48} style={{ color: 'var(--text-muted)' }} className="mb-4" />
          <p className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            No hay miembros
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Los miembros del gimnasio aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <div
              key={member.id}
              onClick={() => openEdit(member)}
              className="group bg-[var(--card)] rounded-2xl p-5 transition-all duration-200 cursor-pointer"
              style={{ border: '1px solid var(--border)' }}
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
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: 56, height: 56, backgroundColor: 'var(--accent)', color: 'var(--accent-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    <span className="text-lg font-black">{getInitials(member.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{member.email}</p>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu
                    trigger={
                      <button
                        className="rounded-lg p-1.5 transition-all duration-200"
                        style={{ border: '1px solid transparent', color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                        aria-label="Más opciones"
                      >
                        <MoreVertical size={16} />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => openEdit(member)}>
                      <Edit2 size={14} /> Editar
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem danger onClick={() => setDeleteTarget(member)}>
                      <Trash2 size={14} /> Eliminar
                    </DropdownItem>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: member.isActive ? '#f0fdf4' : '#fef2f2', color: member.isActive ? '#16a34a' : '#dc2626' }}
                >
                  {member.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {member.phone || 'Sin teléfono'}
                </span>
                <span className="text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: 'var(--accent)' }}>
                  Ver detalles <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Editar Miembro" size="md">
        <div className="space-y-4">
          <FormField label="Nombre Completo" htmlFor="member-name">
            <Input id="member-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Juan Pérez" />
          </FormField>
          <FormField label="Teléfono" required htmlFor="member-phone" error={formErrors.phone}>
            <Input id="member-phone" type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Ej: 555-1234" error={!!formErrors.phone} />
          </FormField>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setShowModal(false)}
            disabled={isSaving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'rgba(26,58,0,0.3)', borderTopColor: 'var(--accent-text)' }} />}
            Guardar
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar miembro"
        message={`¿Estás seguro de eliminar a ${deleteTarget?.name || ''}? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
