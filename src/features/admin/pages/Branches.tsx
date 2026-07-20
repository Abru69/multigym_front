import { useState, useEffect, useCallback } from 'react'
import { getBranches } from '@/lib/api'
import { Building2, MapPin, Phone } from 'lucide-react'
import { useToastStore } from '@/components/ui/Toast'
import type { BranchDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'

export default function BranchesPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [branches, setBranches] = useState<BranchDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{
          border: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
          color: 'var(--text-secondary)',
        }}
      >
        Las sucursales son administradas por el equipo de la plataforma. Esta sección es de solo
        lectura.
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
    </div>
  )
}
