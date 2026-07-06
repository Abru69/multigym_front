import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, Plus, Edit2, Trash2, Layers } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToastStore } from '@/components/ui/Toast'
import { getExercises, createExercise, fetchApi } from '@/lib/api'
import type { ResponseDTO } from '@/types'
import { MUSCLE_GROUPS } from '@/data/constants'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
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
      {/* Tabs */}
      <div className="flex w-full shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-sm backdrop-blur-xl sm:w-fit">
        <button
          onClick={() => handleTabChange('exercises')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all sm:px-6 ${
            activeTab === 'exercises'
              ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--detail)] text-white shadow-[0_0_16px_rgba(66,204,99,0.3)]'
              : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]'
          }`}
        >
          Grupos Musculares
        </button>
        <button
          onClick={() => handleTabChange('routines')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all sm:px-6 ${
            activeTab === 'routines'
              ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--detail)] text-white shadow-[0_0_16px_rgba(66,204,99,0.3)]'
              : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]'
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
                className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
              >
                <Plus size={16} /> Agregar Grupo
              </button>
            }
          />

          {isLoading ? (
            <LoadingState text="Cargando ejercicios..." />
          ) : ALL_GROUPS.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Sin grupos musculares"
              description="Crea tu primer grupo muscular para organizar los ejercicios."
              action={
                <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
                >
                  <Plus size={16} /> Crear Grupo
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ALL_GROUPS.map((group, idx) => {
                const count = exercisesList.filter((e) => e.muscleGroup === group.name).length
                return (
                  <motion.div
                    key={group.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedGroup(group.name)}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all hover:border-[var(--accent)]/30 hover:shadow-[0_0_32px_rgba(66,204,99,0.08)]"
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
                    {group.imageUrl ? (
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={group.imageUrl}
                          alt={group.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-[var(--surface)]">
                        <Dumbbell
                          size={32}
                          className="text-[var(--accent)] opacity-40"
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{group.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">
                        {group.description || 'Explora los ejercicios de este grupo muscular.'}
                      </p>
                      <div className="mt-3 inline-flex rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-2.5 py-1">
                        <span className="text-[10px] font-bold text-[var(--accent)]">
                          {count} {count === 1 ? 'ejercicio' : 'ejercicios'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
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
                  <input
                    id="ex-name"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Press de Banca Inclinado"
                    autoFocus
                    className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                  />
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
                    className="h-10 w-full cursor-not-allowed rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text-muted)] opacity-60"
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
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97] disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingExercise ? handleEditExercise : handleSave}
                    disabled={isSaving}
                    className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
                  >
                    {isSaving && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
                    className="glass-btn-primary inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
                  >
                    <Plus size={16} /> Nuevo
                  </button>
                </div>

                {filteredExercises.length === 0 ? (
                  <EmptyState
                    icon={Dumbbell}
                    title="Sin ejercicios"
                    description={
                      search
                        ? 'No se encontraron ejercicios con ese nombre.'
                        : 'No hay ejercicios en este grupo. Crea el primero.'
                    }
                    action={
                      !search ? (
                        <button
                          onClick={() => setIsCreating(true)}
                          className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold"
                        >
                          <Plus size={16} /> Crear Ejercicio
                        </button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {filteredExercises.map((exercise) => (
                        <motion.div
                          key={exercise.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 backdrop-blur-xl transition-all hover:bg-[var(--surface-hover)]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
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
                              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--text-muted)] backdrop-blur-md transition-all hover:bg-white/[0.08] hover:text-[var(--accent)]"
                              aria-label={`Editar ${exercise.name}`}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(exercise)}
                              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--text-muted)] backdrop-blur-md transition-all hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                              aria-label={`Eliminar ${exercise.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
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
                <input
                  id="group-name"
                  type="text"
                  value={newGroupForm.name}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                  placeholder="Ej. Antebrazos"
                  autoFocus
                  className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
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
                  className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
              </FormField>
              <FormField label="URL de Imagen" htmlFor="group-img">
                <input
                  id="group-img"
                  type="url"
                  value={newGroupForm.imageUrl}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="h-10 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm text-[var(--text-primary)] backdrop-blur-xl placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                />
              </FormField>
              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => setIsCreatingGroup(false)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNewGroup}
                  className="glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
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
