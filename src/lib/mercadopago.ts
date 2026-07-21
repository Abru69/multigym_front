declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: any
  }
}

const mpInstances = new Map<string, unknown>()

export function getMercadoPago(publicKeyOverride?: string | null) {
  const publicKey = publicKeyOverride || import.meta.env.VITE_MP_PUBLIC_KEY
  if (!publicKey) {
    throw new Error('VITE_MP_PUBLIC_KEY no está configurada en .env.local')
  }

  const cached = mpInstances.get(publicKey)
  if (cached) return cached

  const mpInstance = new window.MercadoPago(publicKey, {
    locale: 'es-MX',
  })
  mpInstances.set(publicKey, mpInstance)
  return mpInstance
}
