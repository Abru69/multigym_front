import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Download,
  Plus,
  Edit2,
  Key,
  Pause,
  Trash2,
  Globe,
  Building,
  ShieldAlert,
} from 'lucide-react'

interface LogEntry {
  id: string
  action: string
  entity: string
  user: string
  userType: string
  ip: string
  time: string
  type: string
}

const logs: LogEntry[] = [
  {
    id: '1',
    action: 'Nuevo tenant creado',
    entity: 'PowerGym MX',
    user: 'Carlos Herrera',
    userType: 'PLATFORM',
    ip: '187.xxx.xx.1',
    time: 'Hoy 12:34',
    type: 'create',
  },
  {
    id: '2',
    action: 'Login de plataforma',
    entity: 'Super Admin',
    user: 'Carlos Herrera',
    userType: 'PLATFORM',
    ip: '187.xxx.xx.1',
    time: 'Hoy 12:30',
    type: 'login',
  },
  {
    id: '3',
    action: 'Plan actualizado',
    entity: 'Iron Temple',
    user: 'Ana Martínez',
    userType: 'PLATFORM',
    ip: '201.xx.xx.42',
    time: 'Hoy 11:15',
    type: 'update',
  },
  {
    id: '4',
    action: 'Tenant suspendido',
    entity: 'Alpha Fitness',
    user: 'Carlos Herrera',
    userType: 'PLATFORM',
    ip: '187.xxx.xx.1',
    time: 'Ayer 18:22',
    type: 'suspend',
  },
  {
    id: '5',
    action: 'Usuario plataforma creado',
    entity: 'Pedro Gómez',
    user: 'Carlos Herrera',
    userType: 'PLATFORM',
    ip: '187.xxx.xx.1',
    time: 'Ayer 16:05',
    type: 'create',
  },
  {
    id: '6',
    action: 'Configuración actualizada',
    entity: 'Plataforma',
    user: 'Luis Ramírez',
    userType: 'PLATFORM',
    ip: '200.xx.xx.10',
    time: 'Ayer 14:30',
    type: 'update',
  },
  {
    id: '7',
    action: 'Nuevo tenant creado',
    entity: 'Titan Sports',
    user: 'María Torres',
    userType: 'PLATFORM',
    ip: '201.xx.xx.90',
    time: 'Hace 2d',
    type: 'create',
  },
  {
    id: '8',
    action: 'Login de plataforma',
    entity: 'Super Admin',
    user: 'Carlos Herrera',
    userType: 'PLATFORM',
    ip: '187.xxx.xx.1',
    time: 'Hace 2d',
    type: 'login',
  },
  {
    id: '9',
    action: 'Plan ENTERPRISE asignado',
    entity: 'Body Factory',
    user: 'María Torres',
    userType: 'PLATFORM',
    ip: '201.xx.xx.90',
    time: 'Hace 3d',
    type: 'update',
  },
  {
    id: '10',
    action: 'Tenant eliminado',
    entity: 'OldGym Pro',
    user: 'Carlos Herrera',
    userType: 'PLATFORM',
    ip: '187.xxx.xx.1',
    time: 'Hace 5d',
    type: 'delete',
  },
]

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  create: { icon: Plus, color: 'var(--success)', label: 'Creación' },
  update: { icon: Edit2, color: 'var(--info)', label: 'Actualización' },
  login: { icon: Key, color: 'var(--accent)', label: 'Accesos' },
  suspend: { icon: Pause, color: 'var(--warning)', label: 'Suspensión' },
  delete: { icon: Trash2, color: 'var(--danger)', label: 'Eliminación' },
}

export default function PlatformLogs() {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('ALL')

  const filtered = logs.filter((l) => {
    const s = search.toLowerCase()
    const matchS =
      l.action.toLowerCase().includes(s) ||
      l.entity.toLowerCase().includes(s) ||
      l.user.toLowerCase().includes(s)
    const matchT = activeType === 'ALL' || l.type === activeType
    return matchS && matchT
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Logs de Auditoría
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Registro de todas las acciones en la plataforma
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
          style={{
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--input-bg)')}
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex min-w-52 flex-1 items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar acción, entidad, usuario..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveType('ALL')}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
            style={{
              background: activeType === 'ALL' ? 'var(--accent-muted)' : 'var(--surface)',
              color: activeType === 'ALL' ? 'var(--accent)' : 'var(--text-secondary)',
              border: activeType === 'ALL' ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}
          >
            <ShieldAlert size={14} /> Todos
          </button>
          {Object.entries(typeConfig).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setActiveType(k)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
              style={{
                background: activeType === k ? `${v.color}20` : 'var(--surface)',
                color: activeType === k ? v.color : 'var(--text-secondary)',
                border: activeType === k ? `1px solid ${v.color}40` : '1px solid var(--border)',
              }}
            >
              <v.icon size={14} /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {filtered.length > 0 ? (
          <div className="space-y-0">
            {filtered.map((log, i) => {
              const tc = typeConfig[log.type]
              const isLast = i === filtered.length - 1
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex gap-4"
                >
                  {/* Timeline */}
                  <div className="flex w-6 flex-shrink-0 flex-col items-center">
                    <div
                      className="z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                      style={{
                        background: `${tc.color}15`,
                        color: tc.color,
                        border: `1px solid ${tc.color}30`,
                      }}
                    >
                      <tc.icon size={12} />
                    </div>
                    {!isLast && (
                      <div className="my-1 w-px flex-1" style={{ background: 'var(--border)' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`min-w-0 flex-1 pb-6 ${isLast ? '' : ''}`}>
                    <div className="mb-1.5 flex items-start justify-between gap-4">
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {log.action}
                        </p>
                        <p
                          className="mt-1 flex items-center gap-1.5 text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Building size={12} /> {log.entity}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-semibold whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {log.time}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <div
                          className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
                          style={{
                            background: 'var(--text-muted)',
                            color: 'var(--text-on-primary)',
                          }}
                        >
                          {log.user[0]}
                        </div>
                        {log.user}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                        style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                      >
                        {log.userType}
                      </span>
                      <span
                        className="flex items-center gap-1 font-mono text-[10px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Globe size={10} /> {log.ip}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Search
              size={32}
              className="mx-auto mb-3 opacity-20"
              style={{ color: 'var(--text-muted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No se encontraron registros de auditoría.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
