import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Dumbbell, FileJson, Loader2, Search, Upload } from 'lucide-react'
import { fetchApi } from '@/lib/api'
import type { ExerciseCatalogDTO, ExerciseCatalogImportResultDTO, PaginatedResult, ResponseDTO } from '@/types'
import { Button } from '@/components/ui/Button'

export default function PlatformExerciseCatalog() {
  const MAX_FILE_SIZE = 50 * 1024 * 1024
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ExerciseCatalogImportResultDTO | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalog, setCatalog] = useState<PaginatedResult<ExerciseCatalogDTO> | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const loadCatalog = async (nextPage = page, name = search) => {
    setCatalogLoading(true)
    try {
      const query = new URLSearchParams({ page: String(nextPage), size: '25' })
      if (name.trim()) query.set('name', name.trim())
      const response = await fetchApi<ResponseDTO<PaginatedResult<ExerciseCatalogDTO>>>(
        `/api/platform/exercise-catalog?${query.toString()}`
      )
      setCatalog(response.dto ?? null)
      setPage(nextPage)
    } catch {
      setCatalog(null)
    } finally {
      setCatalogLoading(false)
    }
  }

  useEffect(() => { void loadCatalog(0, '') }, [])

  const handleFileChange = (selectedFile: File | null) => {
    setResult(null)
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setError('El archivo supera el límite de 50 MB')
      return
    }
    setError('')
    setFile(selectedFile)
  }

  const importCatalog = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await fetchApi<ResponseDTO<ExerciseCatalogImportResultDTO>>(
        '/api/platform/exercise-catalog/import',
        { method: 'POST', body }
      )
      setResult(response.dto ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar el catálogo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Catálogo de Ejercicios</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Importa o actualiza el catálogo global disponible para los gimnasios.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">Catálogo disponible</h2>
            <p className="text-xs text-[var(--text-muted)]">
              {catalog?.totalElements ?? 0} ejercicios globales registrados
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
            <Search size={15} className="text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') void loadCatalog(0) }}
              placeholder="Buscar ejercicio..."
              className="w-56 bg-transparent text-sm text-[var(--text-primary)] outline-none"
            />
          </div>
        </div>
        {catalogLoading ? <p className="py-8 text-center text-sm text-[var(--text-muted)]">Cargando catálogo...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--text-muted)]">
                <tr><th className="px-3 py-3">Ejercicio</th><th className="px-3 py-3">Grupo muscular</th><th className="px-3 py-3">Equipo</th><th className="px-3 py-3">Instrucciones ES</th><th className="px-3 py-3">Estado</th></tr>
              </thead>
              <tbody>
                {(catalog?.data ?? []).map((exercise) => (
                  <tr key={exercise.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">{exercise.displayName}</td>
                    <td className="px-3 py-3 text-[var(--text-secondary)]">{exercise.muscleGroupLabel || exercise.muscleGroup || '-'}</td>
                    <td className="px-3 py-3 text-[var(--text-secondary)]">{exercise.equipmentLabel || exercise.equipment || '-'}</td>
                    <td className="px-3 py-3 text-[var(--text-secondary)]">{exercise.instructionsEs ? 'Sí' : 'No'}</td>
                    <td className="px-3 py-3"><span className={exercise.active ? 'text-green-500' : 'text-red-500'}>{exercise.active ? 'Activo' : 'Inactivo'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!catalog?.data?.length && <p className="py-8 text-center text-sm text-[var(--text-muted)]">No hay ejercicios para mostrar.</p>}
            {!!catalog?.data?.length && catalog.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-4">
                <span className="text-xs text-[var(--text-muted)]">
                  Página {catalog.page + 1} de {catalog.totalPages} · {catalog.totalElements} ejercicios
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" disabled={catalog.first || catalogLoading} onClick={() => void loadCatalog(page - 1)}>
                    Anterior
                  </Button>
                  <Button type="button" variant="secondary" disabled={catalog.last || catalogLoading} onClick={() => void loadCatalog(page + 1)}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--accent-muted)] p-3 text-[var(--accent)]"><Dumbbell size={22} /></div>
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">Importar archivo JSON</h2>
            <p className="text-xs text-[var(--text-muted)]">El archivo se guarda en `public.exercise_catalog`.</p>
          </div>
        </div>

        <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)} />
        <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-10 text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent)]">
          {file ? <FileJson className="text-[var(--accent)]" size={30} /> : <Upload className="text-[var(--text-muted)]" size={30} />}
          <span className="font-semibold">{file ? file.name : 'Seleccionar archivo JSON'}</span>
          {file && <span className="text-xs text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB · máximo 50 MB</span>}
        </button>

        {error && <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        {result && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-green-500/10 p-4 text-sm text-green-600">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div><p className="font-bold">Importación completada</p><p>Procesados: {result.processed} · Creados: {result.created} · Actualizados: {result.updated}</p></div>
          </div>
        )}

        <Button type="button" onClick={importCatalog} disabled={!file || loading} className="mt-5 gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {loading ? 'Importando...' : 'Importar catálogo'}
        </Button>
      </section>
    </div>
  )
}
