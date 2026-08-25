import { useState, type ChangeEvent } from 'react'
import { AlertTriangle, FileUp, Search, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/components/ui/Toast'
import { createTestChargeback, getChargeback, uploadChargebackDocumentation } from '@/lib/api'
import type { ChargebackDTO } from '@/types'

export default function Chargebacks() {
  const addToast = useToastStore((state) => state.addToast)
  const [chargebackId, setChargebackId] = useState('')
  const [chargeback, setChargeback] = useState<ChargebackDTO | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [testOrderId, setTestOrderId] = useState('')

  const loadChargeback = async () => {
    if (!chargebackId.trim()) return
    setLoading(true)
    try {
      const response = await getChargeback(chargebackId.trim())
      setChargeback(response.dto || null)
      setFiles([])
    } catch (error) {
      setChargeback(null)
      addToast(error instanceof Error ? error.message : 'No se pudo consultar el contracargo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files || []))
  }

  const createTest = async () => {
    if (!testOrderId.trim()) return
    setLoading(true)
    try {
      const response = await createTestChargeback(testOrderId.trim())
      setChargeback(response.dto || null)
      setChargebackId(response.dto?.id || '')
      setFiles([])
      addToast('Contracargo de prueba creado', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo crear el contracargo de prueba', 'error')
    } finally {
      setLoading(false)
    }
  }

  const submitEvidence = async () => {
    if (!chargeback || files.length === 0) return
    setLoading(true)
    try {
      const response = await uploadChargebackDocumentation(chargeback.id, files)
      setChargeback(response.dto || chargeback)
      setFiles([])
      addToast('Evidencia enviada correctamente', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'No se pudo enviar la evidencia', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Contracargos</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Consulta un reclamo de Mercado Pago y carga la documentación solicitada.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Search size={16} className="text-[var(--accent)]" /> Consultar contracargo
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={chargebackId}
            onChange={(event) => setChargebackId(event.target.value)}
            placeholder="ID de contracargo de Mercado Pago"
            onKeyDown={(event) => event.key === 'Enter' && void loadChargeback()}
          />
          <Button onClick={() => void loadChargeback()} disabled={loading || !chargebackId.trim()}>
            {loading ? 'Consultando...' : 'Consultar'}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-[var(--warning)]/50 bg-[var(--warning-muted)] p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <AlertTriangle size={16} className="text-[var(--warning)]" /> Crear prueba de staging
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Solo funciona en dev/staging. No llama a Mercado Pago ni crea un reclamo real.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input value={testOrderId} onChange={(event) => setTestOrderId(event.target.value)} placeholder="ID interno de la orden" />
          <Button onClick={() => void createTest()} disabled={loading || !testOrderId.trim()}>Crear contracargo de prueba</Button>
        </div>
      </section>

      {chargeback && (
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-card)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Contracargo</p>
              <p className="mt-1 break-all font-mono text-sm text-[var(--text-primary)]">{chargeback.id}</p>
            </div>
            <span className="rounded-full bg-[var(--warning-muted)] px-3 py-1 text-xs font-bold text-[var(--warning)]">
              {chargeback.status || 'Sin estado'}
            </span>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Orden relacionada" value={chargeback.orderId || 'No disponible'} />
            <Info label="Documentación" value={chargeback.documentationStatus || 'No disponible'} />
            <Info label="Documentación requerida" value={chargeback.documentationRequired ? 'Sí' : 'No'} />
            <Info label="Cobertura aplicada" value={chargeback.coverageApplied ? 'Sí' : 'No'} />
          </div>
          <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <ShieldCheck size={16} className="text-[var(--accent)]" /> Evidencia
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Adjunta los archivos solicitados por Mercado Pago.</p>
            <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-3 py-3 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]">
              <FileUp size={16} />
              <span>{files.length ? `${files.length} archivo(s) seleccionado(s)` : 'Seleccionar archivos'}</span>
              <input type="file" multiple className="hidden" onChange={handleFiles} />
            </label>
            <div className="mt-3 flex justify-end">
              <Button onClick={() => void submitEvidence()} disabled={loading || files.length === 0}>
                {loading ? 'Enviando...' : 'Enviar evidencia'}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}
