import { useState, useEffect, useCallback } from 'react'
import { createBranch, deleteBranch, getBranches, toggleBranchStatus, updateBranch } from '@/lib/api'
import { Building2, MapPin, Phone, Pencil, Plus, Power, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/components/ui/Toast'
import type { BranchDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'

export default function BranchesPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [branches, setBranches] = useState<BranchDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<BranchDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', phone: '', isMain: false })
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getBranches()
      const data = res.lista || (res.dto ? [res.dto] : [])
      setBranches(data as BranchDTO[])
    } catch {
      addToast('Error al cargar sucursales', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  const openForm = (branch?: BranchDTO) => {
    setEditing(branch || null)
    setForm(branch ? { name: branch.name, address: branch.address || '', phone: branch.phone || '', isMain: branch.isMain } : { name: '', address: '', phone: '', isMain: false })
    setFormOpen(true)
  }
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true)
    try { if (editing) await updateBranch(editing.id, form); else await createBranch(form); setFormOpen(false); await loadData(); addToast('Sucursal guardada', 'success') }
    catch (error) { addToast(error instanceof Error ? error.message : 'Error al guardar sucursal', 'error') }
    finally { setSaving(false) }
  }
  const changeStatus = async (branch: BranchDTO) => { try { await toggleBranchStatus(branch.id); await loadData() } catch { addToast('Error al cambiar estado', 'error') } }
  const remove = async (branch: BranchDTO) => { if (!window.confirm(`¿Eliminar ${branch.name}?`)) return; try { await deleteBranch(branch.id); await loadData(); addToast('Sucursal eliminada', 'success') } catch { addToast('Error al eliminar sucursal', 'error') } }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  if (isLoading) return <LoadingState text="Cargando sucursales..." />

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      <AdminHeader
        title="Sucursales"
        subtitle={`${branches.length} sucursales registradas`}
        icon={Building2}
      />
      <Button onClick={() => openForm()} className="gap-2"><Plus size={16} /> Nueva sucursal</Button>

      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{
          border: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
          color: 'var(--text-secondary)',
        }}
      >
         Administra las sucursales disponibles para este gimnasio.
      </div>

      {branches.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hay sucursales"
          description="Aún no se han registrado sucursales para este tenant."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="rounded-2xl bg-[var(--card)] p-5 transition-all duration-200 hover:shadow-md"
              style={{ border: '1px solid var(--border)' }}
            >
                <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}
                  >
                    <Building2 size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {branch.name}
                    </h4>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: branch.isActive
                          ? 'rgba(34,197,94,0.1)'
                          : 'rgba(239,68,68,0.1)',
                        color: branch.isActive ? 'var(--success)' : 'var(--error)',
                      }}
                    >
                      {branch.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="flex gap-1"><button onClick={() => openForm(branch)} className="p-2"><Pencil size={14} /></button>{!branch.isMain && <><button onClick={() => void changeStatus(branch)} className="p-2"><Power size={14} /></button><button onClick={() => void remove(branch)} className="p-2 text-red-500"><Trash2 size={14} /></button></>}</div>
                </div>
              </div>

              <div className="mb-4 space-y-2">
                {branch.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {branch.address}
                    </span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {branch.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={save} className="w-full max-w-md space-y-4 rounded-2xl bg-[var(--card)] p-6"><div className="flex justify-between"><h2 className="font-bold">{editing ? 'Editar sucursal' : 'Nueva sucursal'}</h2><button type="button" onClick={() => setFormOpen(false)}><X size={18} /></button></div>{(['name', 'address', 'phone'] as const).map((field) => <input key={field} required={field === 'name'} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} placeholder={field === 'name' ? 'Nombre' : field === 'address' ? 'Dirección' : 'Teléfono'} className="w-full rounded-xl border p-3" />)}<label className="flex gap-2"><input type="checkbox" checked={form.isMain} disabled={Boolean(editing?.isMain)} onChange={(event) => setForm({ ...form, isMain: event.target.checked })} /> Sucursal principal</label><Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button></form></div>}
    </div>
  )
}
