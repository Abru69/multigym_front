import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchApi } from '@/lib/api'

export default function PlatformChangePassword() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    setSaving(true)
    try {
      await fetchApi('/platform/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      })
      navigate('/platform', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cambiar la contraseña.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border p-8">
        <h1 className="text-2xl font-bold">Cambia tu contraseña</h1>
        <p className="text-sm">Por seguridad debes cambiar la contraseña inicial antes de continuar.</p>
        <input className="w-full rounded border p-3" type="password" placeholder="Nueva contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded bg-black p-3 text-white" disabled={saving} type="submit">
          {saving ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </main>
  )
}
