import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/api'
import { Plus, Megaphone, Edit2, Trash2, Eye, MousePointerClick, Image, Video, FileText } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import type { AnnouncementDTO, AnnouncementRequest } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'

const positionLabels: Record<string, string> = {
  HERO: 'Hero/Banner',
  SIDEBAR: 'Sidebar',
  POPUP: 'Popup',
  BANNER: 'Banner',
}

const mediaIcons: Record<string, typeof Image> = {
  IMAGE: Image,
  VIDEO: Video,
  TEXT: FileText,
}

const EMPTY_FORM: AnnouncementRequest = {
  title: '',
  description: '',
  mediaType: 'IMAGE',
  mediaUrl: '',
  linkUrl: '',
  position: 'HERO',
  priority: 0,
  isActive: true,
  startDate: '',
  endDate: '',
}

export default function AnnouncementsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<AnnouncementDTO | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<AnnouncementRequest>(EMPTY_FORM)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getAnnouncements({ size: 100 })
      setAnnouncements(res.dto?.data || [])
    } catch {
      addToast('Error al cargar anuncios', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return announcements.filter((a) => a.title.toLowerCase().includes(term))
  }, [announcements, debouncedSearch])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingItem(null)
    setShowModal(true)
  }

  const openEdit = (item: AnnouncementDTO) => {
    setForm({
      title: item.title,
      description: item.description || '',
      mediaType: item.mediaType,
      mediaUrl: item.mediaUrl || '',
      linkUrl: item.linkUrl || '',
      position: item.position,
      priority: item.priority,
      isActive: item.isActive,
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
    })
    setEditingItem(item)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      addToast('El título es requerido', 'error')
      return
    }
    try {
      setIsSaving(true)
      if (editingItem) {
        await updateAnnouncement(editingItem.id, form)
        addToast('Anuncio actualizado', 'success')
      } else {
        await createAnnouncement(form)
        addToast('Anuncio creado', 'success')
      }
      setShowModal(false)
      loadData()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al guardar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteAnnouncement(deleteTarget.id)
      addToast('Anuncio eliminado', 'success')
      loadData()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  if (isLoading) return <LoadingState text="Cargando anuncios..." />

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      <AdminHeader
        title="Anuncios"
        subtitle={`${announcements.length} anuncios — ${announcements.filter((a) => a.isActive).length} activos`}
        icon={Megaphone}
        action={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Plus size={16} /> Nuevo Anuncio
          </button>
        }
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar anuncios..." />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No hay anuncios"
          description="Crea tu primer anuncio para mostrar a tus clientes."
          action={
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Plus size={16} /> Crear anuncio
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const MediaIcon = mediaIcons[item.mediaType] || Image
            return (
              <div
                key={item.id}
                className="bg-[var(--card)] rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
                style={{ border: '1px solid var(--border)' }}
              >
                {item.mediaUrl && item.mediaType === 'IMAGE' && (
                  <div className="h-32 bg-[var(--surface)] flex items-center justify-center">
                    <img src={item.mediaUrl} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                )}
                {!item.mediaUrl && (
                  <div className="h-20 flex items-center justify-center" style={{ backgroundColor: 'var(--surface)' }}>
                    <MediaIcon size={32} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: item.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: item.isActive ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {item.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                      {positionLabels[item.position] || item.position}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
                      {item.mediaType}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Eye size={12} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointerClick size={12} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.clickCount}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>P:{item.priority}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => openEdit(item)}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
                      style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    >
                      <Edit2 size={12} /> Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
                      style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Editar Anuncio' : 'Nuevo Anuncio'}
        size="md"
      >
        <div className="space-y-4">
          <FormField label="Título" htmlFor="ann-title" required>
            <Input
              id="ann-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Título del anuncio"
            />
          </FormField>

          <FormField label="Descripción" htmlFor="ann-desc">
            <textarea
              id="ann-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción del anuncio"
              rows={3}
              className="flex w-full rounded-xl px-4 py-2 text-sm transition-all duration-200 hover:border-[var(--border)] focus:ring-2 focus:outline-none"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo de medio" htmlFor="ann-media">
              <select
                id="ann-media"
                value={form.mediaType}
                onChange={(e) => setForm({ ...form, mediaType: e.target.value as AnnouncementRequest['mediaType'] })}
                className="flex h-11 w-full appearance-none rounded-xl px-4 py-2 text-sm transition-all"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}
              >
                <option value="IMAGE">Imagen</option>
                <option value="VIDEO">Video</option>
                <option value="TEXT">Texto</option>
              </select>
            </FormField>
            <FormField label="Posición" htmlFor="ann-position">
              <select
                id="ann-position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value as AnnouncementRequest['position'] })}
                className="flex h-11 w-full appearance-none rounded-xl px-4 py-2 text-sm transition-all"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}
              >
                <option value="HERO">Hero/Banner</option>
                <option value="SIDEBAR">Sidebar</option>
                <option value="POPUP">Popup</option>
                <option value="BANNER">Banner</option>
              </select>
            </FormField>
          </div>

          <FormField label="URL del medio" htmlFor="ann-media-url">
            <Input
              id="ann-media-url"
              type="url"
              value={form.mediaUrl}
              onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
              placeholder="https://..."
            />
          </FormField>

          <FormField label="URL de enlace" htmlFor="ann-link">
            <Input
              id="ann-link"
              type="url"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              placeholder="https://..."
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Fecha inicio" htmlFor="ann-start">
              <Input
                id="ann-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </FormField>
            <FormField label="Fecha fin" htmlFor="ann-end">
              <Input
                id="ann-end"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Prioridad" htmlFor="ann-priority">
              <Input
                id="ann-priority"
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                min={0}
              />
            </FormField>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Activo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setShowModal(false)}
            disabled={isSaving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
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
            {editingItem ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar anuncio"
        message={`¿Estás seguro de eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
