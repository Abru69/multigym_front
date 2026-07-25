import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Register() {
  const [form, setForm] = useState({ gymName: '', subdomain: '', adminName: '', adminEmail: '', adminPhone: '', planId: '' })
  const [plans, setPlans] = useState<{ id: string; name: string; price: number; trialDays: number }[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/public/saas-plans')
      .then((response) => response.json())
      .then((response) => {
        const activePlans = response.lista ?? []
        setPlans(activePlans)
        if (activePlans[0]) setForm((current) => ({ ...current, planId: activePlans[0].id }))
      })
      .catch(() => setError('No se pudieron cargar los planes disponibles'))
  }, [])

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/public/tenant-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.mensaje || 'No se pudo enviar la solicitud')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-5 text-[var(--accent)]" size={52} />
        <h2 className="mb-2 font-heading text-2xl font-black text-[var(--text-primary)]">Solicitud recibida</h2>
        <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          Revisaremos los datos de tu gimnasio. Te contactaremos cuando tu cuenta sea aprobada por nuestro equipo.
        </p>
        <Link to="/login"><Button className="w-full rounded-2xl py-3 text-sm font-bold">Volver al inicio de sesión</Button></Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)]">
        <ArrowLeft size={14} /> Volver a MultiGym
      </Link>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/10">
          <Building2 size={28} className="text-[var(--accent)]" />
        </div>
        <h2 className="mb-1 font-heading text-2xl font-black text-[var(--text-primary)]">Registra tu gimnasio</h2>
        <p className="text-sm text-[var(--text-secondary)]">Envía tu solicitud y nuestro equipo la revisará.</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {[
          ['gymName', 'Nombre del gimnasio', 'Ej. FitZone Elite', 'text'],
          ['subdomain', 'Subdominio deseado', 'fitzone', 'text'],
          ['adminName', 'Nombre del administrador', 'Juan Pérez', 'text'],
          ['adminEmail', 'Correo del administrador', 'juan@ejemplo.com', 'email'],
          ['adminPhone', 'Teléfono', '+52 614 555 0000', 'tel'],
        ].map(([field, label, placeholder, type]) => (
          <label key={field} className="block text-xs font-semibold text-[var(--text-secondary)]">
            {label}
            <input
              required
              type={type}
              value={form[field as keyof typeof form]}
              onChange={(event) => update(field as keyof typeof form, event.target.value)}
              placeholder={placeholder}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-[var(--accent)]"
              style={{ color: '#07142f', WebkitTextFillColor: '#07142f' }}
            />
          </label>
        ))}
        <label className="block text-xs font-semibold text-[var(--text-secondary)]">
          Plan solicitado
          <select
            required
            value={form.planId}
            onChange={(event) => update('planId', event.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--accent)]"
            style={{ color: '#07142f' }}
          >
            <option value="" disabled>Selecciona un plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} · ${plan.price.toLocaleString('es-MX')} · {plan.trialDays} días de prueba
              </option>
            ))}
          </select>
        </label>
        {error && <p className="rounded-xl bg-red-500/10 p-3 text-xs text-red-400">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full rounded-xl py-3 text-sm font-bold">
          {loading ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Enviar solicitud'}
        </Button>
      </form>
    </div>
  )
}
