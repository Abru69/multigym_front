import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getCheckIns,
  checkIn,
  checkOut,
  getActiveCheckIns,
  getCheckInStats,
  getClientUsers,
} from '@/lib/api'
import { LogIn, LogOut, Clock, Users, TrendingUp, QrCode, User, Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useToastStore } from '@/components/ui/Toast'
import type { CheckInDTO, CheckInStatsDTO, UserDTO } from '@/types'
import { AdminHeader } from '../components/AdminHeader'
import { SearchBar } from '../components/SearchBar'
import { LoadingState } from '../components/LoadingState'
import { useDebounce } from '@/hooks/useDebounce'

function formatTime(dateStr?: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CheckInsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [checkins, setCheckins] = useState<CheckInDTO[]>([])
  const [activeCheckins, setActiveCheckins] = useState<CheckInDTO[]>([])
  const [stats, setStats] = useState<CheckInStatsDTO | null>(null)
  const [users, setUsers] = useState<UserDTO[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [checkinsRes, activeRes, statsRes, usersRes] = await Promise.all([
        getCheckIns({ size: 100 }),
        getActiveCheckIns(),
        getCheckInStats(),
        getClientUsers(),
      ])
      setCheckins(checkinsRes.dto?.data || [])
      setActiveCheckins(activeRes.dto || [])
      setStats(statsRes.dto || null)
      setUsers(usersRes.dto?.data || [])
    } catch {
      addToast('Error al cargar datos de asistencia', 'error')
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
    return checkins.filter((c) => {
      const name = c.memberName || ''
      return name.toLowerCase().includes(term)
    })
  }, [checkins, debouncedSearch])

  const handleCheckIn = async () => {
    if (!selectedUserId) {
      addToast('Selecciona un miembro', 'error')
      return
    }
    try {
      setIsCheckingIn(true)
      await checkIn({ memberId: selectedUserId })
      addToast('Check-in registrado correctamente', 'success')
      setShowCheckInModal(false)
      setSelectedUserId('')
      loadData()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al registrar check-in', 'error')
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async (id: string) => {
    try {
      await checkOut(id)
      addToast('Check-out registrado', 'success')
      loadData()
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Error al registrar check-out', 'error')
    }
  }

  if (isLoading) return <LoadingState text="Cargando asistencia..." />

  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="space-y-6">
      <AdminHeader
        title="Asistencia"
        subtitle={`${activeCheckins.length} miembros actualmente en el gym`}
        icon={LogIn}
        action={
          <button
            onClick={() => setShowCheckInModal(true)}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <LogIn size={16} /> Registrar Check-In
          </button>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div
            className="rounded-2xl bg-[var(--card)] p-5"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
              >
                <Users size={20} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Hoy
                </p>
                <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                  {stats.today.count}
                </p>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl bg-[var(--card)] p-5"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}
              >
                <TrendingUp size={20} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Esta semana
                </p>
                <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                  {stats.thisWeek.count}
                </p>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl bg-[var(--card)] p-5"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(168,85,247,0.1)' }}
              >
                <Clock size={20} style={{ color: '#a855f7' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Este mes
                </p>
                <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                  {stats.thisMonth.count}
                </p>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl bg-[var(--card)] p-5"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
              >
                <QrCode size={20} style={{ color: 'var(--warning)' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Hora pico
                </p>
                <p className="text-xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                  {stats.peakHour}:00
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Check-ins */}
      {activeCheckins.length > 0 && (
        <div
          className="rounded-2xl bg-[var(--card)] p-6"
          style={{ border: '1px solid var(--border)' }}
        >
          <h3 className="mb-4 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Ahora en el Gym ({activeCheckins.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeCheckins.map((ci) => (
              <div
                key={ci.id}
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
              >
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                <span className="text-sm font-medium">{ci.memberName || 'Miembro'}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatTime(ci.checkInTime)}
                </span>
                <button
                  onClick={() => handleCheckOut(ci.id)}
                  className="ml-1 rounded-lg p-1 transition-colors hover:bg-[var(--error-muted-bg)]"
                  title="Check-out"
                >
                  <LogOut size={14} style={{ color: 'var(--error)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre..." />

      {/* Check-in History Table */}
      <div
        className="overflow-hidden rounded-2xl bg-[var(--card)]"
        style={{ border: '1px solid var(--border)' }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Historial de Asistencia
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Miembro
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Fecha
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Entrada
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Salida
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Duración
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Método
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No hay registros de asistencia
                  </td>
                </tr>
              ) : (
                filtered.map((ci) => (
                  <tr
                    key={ci.id}
                    className="transition-colors hover:bg-[var(--surface)]"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                        >
                          <User size={14} />
                        </div>
                        <span className="text-sm font-medium">{ci.memberName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">{formatDate(ci.checkInTime)}</td>
                    <td className="px-6 py-3 text-sm font-semibold">
                      {formatTime(ci.checkInTime)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {ci.checkOutTime ? (
                        formatTime(ci.checkOutTime)
                      ) : (
                        <span className="text-xs" style={{ color: '#22c55e' }}>
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {ci.durationMinutes ? `${ci.durationMinutes} min` : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
                      >
                        {ci.checkInMethod || 'QR'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {!ci.checkOutTime && (
                        <button
                          onClick={() => handleCheckOut(ci.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                          style={{
                            border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <LogOut size={12} /> Check-out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In Modal */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title="Registrar Check-In"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="member-select"
              className="mb-2 block text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Seleccionar Miembro
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <select
                id="member-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex h-11 w-full appearance-none rounded-xl py-2 pr-4 pl-10 text-sm transition-all duration-200 hover:border-[var(--border)] focus:ring-2 focus:outline-none"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Seleccionar miembro...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.memberDTO?.name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div
          className="mt-6 flex justify-end gap-3 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setShowCheckInModal(false)}
            disabled={isCheckingIn}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--text-primary)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn || !selectedUserId}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {isCheckingIn && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: 'rgba(26,58,0,0.3)', borderTopColor: 'var(--accent-text)' }}
              />
            )}
            <LogIn size={16} /> Registrar
          </button>
        </div>
      </Modal>
    </div>
  )
}
