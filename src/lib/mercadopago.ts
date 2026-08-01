declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: any
    MP_DEVICE_SESSION_ID?: string
  }
}

export function getMercadoPagoDeviceSessionId(): string | undefined {
  return window.MP_DEVICE_SESSION_ID
}

export function loadMercadoPagoDeviceFingerprint(): Promise<void> {
  if (window.MP_DEVICE_SESSION_ID || document.querySelector('script[data-mp-device]')) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://www.mercadopago.com/v2/security.js'
    script.async = true
    script.dataset.mpDevice = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar la protección antifraude de Mercado Pago'))
    document.head.appendChild(script)
  })
}

const mpInstances = new Map<string, unknown>()

export function getMercadoPago(publicKeyOverride?: string | null) {
  const publicKey = publicKeyOverride || import.meta.env.VITE_MP_PUBLIC_KEY
  if (!publicKey) {
    throw new Error('Mercado Pago public key no está configurada')
  }

  const cached = mpInstances.get(publicKey)
  if (cached) return cached

  const mpInstance = new window.MercadoPago(publicKey, {
    locale: 'es-MX',
  })
  mpInstances.set(publicKey, mpInstance)
  return mpInstance
}
