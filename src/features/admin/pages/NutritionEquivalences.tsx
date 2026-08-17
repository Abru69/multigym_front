import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { createFoodEquivalentGroup, getFoodEquivalentGroups, getResponseItems } from '@/lib/api'
import type { FoodEquivalentGroupDTO, FoodEquivalentGroupRequest } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '../components/FormField'
import { useToastStore } from '@/components/ui/Toast'

const tabs = [
  ['Alimentos', '/admin/nutricion/alimentos'],
  ['Recetas', '/admin/nutricion/recetas'],
  ['Equivalencias', '/admin/nutricion/equivalencias'],
  ['Planes', '/admin/nutricion'],
] as const
export default function NutritionEquivalences() {
  const [groups, setGroups] = useState<FoodEquivalentGroupDTO[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FoodEquivalentGroupRequest>({ name: '', description: '' })
  const [open, setOpen] = useState(false)
  const addToast = useToastStore((state) => state.addToast)
  const load = () =>
    getFoodEquivalentGroups()
      .then((res) => setGroups(getResponseItems<FoodEquivalentGroupDTO>(res)))
      .catch(() => addToast('No se pudieron cargar las equivalencias', 'error'))
  useEffect(() => {
    load()
  }, [])
  const save = async () => {
    if (!form.name.trim()) return addToast('El nombre del grupo es requerido', 'error')
    try {
      await createFoodEquivalentGroup({ ...form, name: form.name.trim() })
      addToast('Grupo de equivalencia creado', 'success')
      setOpen(false)
      setForm({ name: '', description: '' })
      load()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'No se pudo crear el grupo', 'error')
    }
  }
  const visible = groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader title="Equivalencias" subtitle="Grupos de equivalencia nutricional" />
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <nav className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-1">
          {tabs.map(([label, to]) => (
            <NavLink
              key={label}
              end={to === '/admin/nutricion'}
              to={to}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap ${isActive ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute top-3 left-3 text-[var(--text-muted)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar grupo de equivalencia"
              className="pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)]"
          >
            <Plus size={16} /> Dar de alta grupo
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((group) => (
            <div
              key={group.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <strong className="text-[var(--text-primary)]">{group.name}</strong>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {group.description || 'Sin descripción'}
              </p>
              <span className="mt-3 inline-block text-[10px] text-[var(--text-muted)]">
                {group.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No hay grupos registrados.</p>
          )}
        </div>
      </main>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Dar de alta grupo" size="sm">
        <div className="space-y-3">
          <FormField label="Nombre" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Cereales"
            />
          </FormField>
          <FormField label="Descripción">
            <Input
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>
          <button
            type="button"
            onClick={save}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--accent-text)]"
          >
            Guardar grupo
          </button>
        </div>
      </Modal>
    </div>
  )
}
