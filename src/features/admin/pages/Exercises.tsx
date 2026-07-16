import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Dumbbell, Plus, Edit2, Trash2, Layers } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToastStore } from '@/components/ui/Toast'
import { getExercises, createExercise, fetchApi } from '@/lib/api'
import { MUSCLE_GROUPS } from '@/data/constants'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FormField } from '../components/FormField'
import { useDebounce } from '@/hooks/useDebounce'
import RoutineLibrary from './RoutineLibrary'

interface Exercise {
  id: string
  name: string
  muscleGroup: string
}

interface CustomGroup {
  name: string
  description: string
  imageUrl: string
}

export default function Exercises() {
  const addToast = useToastStore((s) => s.addToast)
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'exercises' | 'routines'>(
    tabParam === 'routines' ? 'routines' : 'exercises'
  )

  const handleTabChange = (tab: 'exercises' | 'routines') => {
    setActiveTab(tab)
    setSearchParams(tab === 'exercises' ? {} : { tab })
  }

  const [exercisesList, setExercisesList] = useState<Exercise[]>([])
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('customMuscleGroups') || '[]')
      return stored.map((g: unknown) =>
        typeof g === 'string' ? { name: g, description: '', imageUrl: '' } : g
      )
    } catch {
      return []
    }
  })

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formName, setFormName] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [newGroupForm, setNewGroupForm] = useState({ name: '', description: '', imageUrl: '' })
  const [newGroupErrors, setNewGroupErrors] = useState<Record<string, string>>({})
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null)

  const loadExercises = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getExercises()
      setExercisesList(response.dto?.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExercises()
  }, [loadExercises])

  const ALL_GROUPS = useMemo(() => [...MUSCLE_GROUPS, ...customGroups], [customGroups])

  const currentGroupExercises = useMemo(
    () => exercisesList.filter((e) => e.muscleGroup === selectedGroup),
    [exercisesList, selectedGroup]
  )

  const filteredExercises = useMemo(() => {
    const term = debouncedSearch.toLowerCase()
    return currentGroupExercises.filter((e) => e.name.toLowerCase().includes(term))
  }, [currentGroupExercises, debouncedSearch])

  const validateExerciseForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formName) errors.name = 'El nombre es requerido'
    if (!selectedGroup) errors.group = 'Selecciona un grupo'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateExerciseForm()) {
      addToast('Completa los campos obligatorios', 'error')
      return
    }
    setIsSaving(true)
    try {
      await createExercise({ name: formName, muscleGroup: selectedGroup! })
      addToast('Ejercicio creado correctamente', 'success')
      loadExercises()
      setIsCreating(false)
      setFormName('')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Error al guardar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const closeModal = () => {
    setSelectedGroup(null)
    setIsCreating(false)
    setSearch('')
    setFormName('')
    setFormErrors({})
  }

  const validateNewGroupForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!newGroupForm.name.trim()) errors.name = 'El nombre es requerido'
    else if (customGroups.some((g) => g.name.toLowerCase() === newGroupForm.name.trim().toLowerCase())) {
      errors.name = 'Ya existe un grupo con ese nombre'
    }
    setNewGroupErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveNewGroup = () => {
    if (!validateNewGroupForm()) return
    const newGroup: CustomGroup = {
      name: newGroupForm.name.trim(),
      description: newGroupForm.description.trim(),
      imageUrl: newGroupForm.imageUrl.trim(),
    }
    const updatedGroups = [...customGroups, newGroup]
    setCustomGroups(updatedGroups)
    localStorage.setItem('customMuscleGroups', JSON.stringify(updatedGroups))
    addToast('Grupo muscular creado', 'success')
    setIsCreatingGroup(false)
    setNewGroupForm({ name: '', description: '', imageUrl: '' })
  }

  const handleEditExercise = async () => {
    if (!editingExercise || !formName.trim()) return
    setIsSaving(true)
    try {
      await fetchApi(`/api/exercises/${editingExercise.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: formName.trim(), muscleGroup: selectedGroup! }),
      })
      addToast('Ejercicio actualizado', 'success')
      loadExercises()
      setEditingExercise(null)
      setFormName('')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Error al actualizar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteExercise = async () => {
    if (!deleteTarget) return
    try {
      await fetchApi(`/api/exercises/${deleteTarget.id}`, { method: 'DELETE' })
      setExercisesList(exercisesList.filter((e) => e.id !== deleteTarget.id))
      addToast(`${deleteTarget.name} eliminado`, 'success')
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Error al eliminar', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex w-full shrink-0 rounded-xl bg-[var(--surface)] p-1 sm:w-fit">
        <button
          onClick={() => handleTabChange('exercises')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all sm:px-6 ${
            activeTab === 'exercises'
              ? 'bg-[var(--card)] shadow-sm text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Grupos Musculares
        </button>
        <button
          onClick={() => handleTabChange('routines')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all sm:px-6 ${
            activeTab === 'routines'
              ? 'bg-[var(--card)] shadow-sm text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Plantillas de Rutinas
        </button>
      </div>

      {activeTab === 'exercises' ? (
        <>
          <AdminHeader
            title="Grupos Musculares"
            subtitle={`${exercisesList.length} ejercicios registrados en la biblioteca`}
            icon={Layers}
            action={
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
              >
                <Plus size={16} /> Agregar Grupo
              </button>
            }
          />

          {isLoading ? (
            <LoadingState text="Cargando ejercicios..." />
          ) : ALL_GROUPS.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 py-20">
              <Dumbbell size={48} className="mb-4 text-[var(--text-muted)]" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Sin grupos musculares
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Crea tu primer grupo muscular para organizar los ejercicios.
              </p>
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
              >
                <Plus size={16} /> Crear Grupo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ALL_GROUPS.map((group) => {
                const count = exercisesList.filter((e) => e.muscleGroup === group.name).length
                return (
                  <div
                    key={group.name}
                    onClick={() => setSelectedGroup(group.name)}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-lg"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedGroup(group.name)
                      }
                    }}
                    aria-label={`Ver ejercicios de ${group.name}`}
                  >
                    <div className="relative h-40 overflow-hidden bg-[var(--surface)]">
                      {group.imageUrl ? (
                        <img
                          src={group.imageUrl}
                          alt={group.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Dumbbell
                            size={40}
                            className="text-[var(--accent)] opacity-40"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    <div className="p-5">
                      <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">{group.name}</h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
                        {group.description || 'Explora los ejercicios de este grupo muscular.'}
                      </p>
                      <div className="mt-3">
                        <span className="inline-flex items-center rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-bold text-[var(--accent-text)]">
                          {count} {count === 1 ? 'ejercicio' : 'ejercicios'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Exercise List Modal */}
          <Modal
            isOpen={!!selectedGroup}
            onClose={closeModal}
            title={
              isCreating
                ? editingExercise
                  ? 'Editar Ejercicio'
                  : 'Nuevo Ejercicio'
                : `Ejercicios: ${selectedGroup}`
            }
            size="lg"
          >
            {isCreating ? (
              <div className="space-y-4">
                <FormField
                  label="Nombre del Ejercicio"
                  required
                  error={formErrors.name}
                  htmlFor="ex-name"
                >
                  {/* eslint-disable jsx-a11y/no-autofocus */}
                  <input
                    id="ex-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Press de Banca Inclinado"
                    autoFocus
                    className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                  />
                  {/* eslint-enable jsx-a11y/no-autofocus */}
                </FormField>
                <FormField
                  label="Grupo Muscular"
                  required
                  error={formErrors.group}
                  htmlFor="ex-group"
                >
                  <input
                    id="ex-group"
                    type="text"
                    value={selectedGroup || ''}
                    disabled
                    className="h-10 w-full cursor-not-allowed rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-muted)] opacity-60"
                  />
                </FormField>
                <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setEditingExercise(null)
                      setFormName('')
                    }}
                    disabled={isSaving}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] active:scale-[0.97] disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingExercise ? handleEditExercise : handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
                  >
                    {isSaving && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-text)]/30 border-t-[var(--accent-text)]" />
                    )}
                    {isSaving
                      ? 'Guardando...'
                      : editingExercise
                        ? 'Actualizar'
                        : 'Guardar Ejercicio'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar en este grupo..."
                    className="flex-1"
                  />
                  <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
                  >
                    <Plus size={16} /> Nuevo
                  </button>
                </div>

                {filteredExercises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Dumbbell size={40} className="mb-3 text-[var(--text-muted)]" />
                    <h4 className="font-bold text-[var(--text-primary)]">Sin ejercicios</h4>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {search
                        ? 'No se encontraron ejercicios con ese nombre.'
                        : 'No hay ejercicios en este grupo. Crea el primero.'}
                    </p>
                    {!search && (
                      <button
                        onClick={() => setIsCreating(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
                      >
                        <Plus size={16} /> Crear Ejercicio
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 transition-all hover:bg-[var(--surface-hover)]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)]">
                          <Dumbbell
                            size={18}
                            className="text-[var(--accent)]"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                            {exercise.name}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setEditingExercise(exercise)
                              setFormName(exercise.name)
                              setIsCreating(true)
                            }}
                            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--text-muted)] transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--accent)]"
                            aria-label={`Editar ${exercise.name}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(exercise)}
                            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--text-muted)] transition-all hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`Eliminar ${exercise.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* New Group Modal */}
          <Modal
            isOpen={isCreatingGroup}
            onClose={() => setIsCreatingGroup(false)}
            title="Nuevo Grupo Muscular"
            size="sm"
          >
            <div className="space-y-4">
              <FormField
                label="Nombre del Grupo"
                required
                error={newGroupErrors.name}
                htmlFor="group-name"
              >
                {/* eslint-disable jsx-a11y/no-autofocus */}
                <input
                  id="group-name"
                  type="text"
                  value={newGroupForm.name}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                  placeholder="Ej. Antebrazos"
                  autoFocus
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
                {/* eslint-enable jsx-a11y/no-autofocus */}
              </FormField>
              <FormField label="Descripción" htmlFor="group-desc">
                <input
                  id="group-desc"
                  type="text"
                  value={newGroupForm.description}
                  onChange={(e) =>
                    setNewGroupForm({ ...newGroupForm, description: e.target.value })
                  }
                  placeholder="Ej. Ejercicios para fortalecer el agarre."
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
              </FormField>
              <FormField label="URL de Imagen" htmlFor="group-img">
                <input
                  id="group-img"
                  type="url"
                  value={newGroupForm.imageUrl}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
              </FormField>
              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => setIsCreatingGroup(false)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] active:scale-[0.97]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNewGroup}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)] transition-all hover:opacity-90 active:scale-[0.97]"
                >
                  Guardar
                </button>
              </div>
            </div>
          </Modal>

          {/* Delete Confirmation */}
          <ConfirmDialog
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteExercise}
            title="Eliminar ejercicio"
            message={`¿Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
          />
        </>
      ) : (
        <RoutineLibrary />
      )}
    </div>
  )
}
