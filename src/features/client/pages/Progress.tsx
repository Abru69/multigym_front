import { motion } from 'framer-motion'
import { mockProgress } from '@/data/routines'
import { formatDateShort } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'
import { TrendingDown, Target, Activity } from 'lucide-react'

const weightData = mockProgress.map((p) => ({
  date: formatDateShort(p.date),
  peso: p.weight,
  grasa: p.bodyFat,
}))

const latestMeasurements = mockProgress[mockProgress.length - 1]?.measurements
const radarData = latestMeasurements
  ? [
      { subject: 'Pecho', value: latestMeasurements.chest ?? 0 },
      { subject: 'Cintura', value: latestMeasurements.waist ?? 0 },
      { subject: 'Cadera', value: latestMeasurements.hips ?? 0 },
      { subject: 'Brazos', value: latestMeasurements.arms ? latestMeasurements.arms * 2 : 0 },
      { subject: 'Piernas', value: latestMeasurements.legs ?? 0 },
    ]
  : []

const first = mockProgress[0]
const last = mockProgress[mockProgress.length - 1]
const weightChange = first && last && first.weight && last.weight ? last.weight - first.weight : 0
const fatChange = first && last && first.bodyFat && last.bodyFat ? last.bodyFat - first.bodyFat : 0

export default function Progress() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
          Mi Progreso
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Seguimiento de tu transformación</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: TrendingDown,
            label: 'Peso',
            value: `${last?.weight ?? 0} kg`,
            change: `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`,
            color: 'var(--accent)',
          },
          {
            icon: Target,
            label: '% Grasa',
            value: `${last?.bodyFat ?? 0}%`,
            change: `${fatChange > 0 ? '+' : ''}${fatChange.toFixed(1)}%`,
            color: 'var(--success)',
          },
          {
            icon: Activity,
            label: 'Registros',
            value: String(mockProgress.length),
            change: 'últimos 5 meses',
            color: 'var(--warning)',
          },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center backdrop-blur-xl"
          >
            <s.icon size={20} className="mx-auto mb-2" style={{ color: s.color }} />
            <p className="text-lg font-black text-[var(--text-primary)]">{s.value}</p>
            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{s.label}</p>
            <p className="mt-1 text-[10px] font-medium" style={{ color: s.color }}>
              {s.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Weight chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl"
      >
        <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Evolución de Peso</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                }}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="var(--accent)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--accent)', r: 4 }}
                name="Peso (kg)"
              />
              <Line
                type="monotone"
                dataKey="grasa"
                stroke="var(--warning)"
                strokeWidth={2}
                dot={{ fill: 'var(--warning)', r: 3 }}
                name="% Grasa"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Radar */}
      {radarData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl"
        >
          <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Medidas Corporales (cm)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                />
                <Radar
                  name="Medidas"
                  dataKey="value"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 backdrop-blur-xl"
      >
        <h3 className="mb-4 font-semibold text-[var(--text-primary)]">Historial</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Fecha', 'Peso', '% Grasa', 'Pecho', 'Cintura', 'Cadera'].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-left text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockProgress.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)]">
                  <td className="py-3 text-[var(--text-secondary)]">{formatDateShort(p.date)}</td>
                  <td className="py-3 font-medium text-[var(--text-primary)]">{p.weight} kg</td>
                  <td className="py-3 text-[var(--text-secondary)]">{p.bodyFat}%</td>
                  <td className="py-3 text-[var(--text-secondary)]">{p.measurements?.chest} cm</td>
                  <td className="py-3 text-[var(--text-secondary)]">{p.measurements?.waist} cm</td>
                  <td className="py-3 text-[var(--text-secondary)]">{p.measurements?.hips} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
