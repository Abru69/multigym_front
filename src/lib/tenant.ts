/**
 * Multi-tenant SaaS utilities
 *
 * Tenant resolution via subdomain:
 *   gym1.localhost:5173 → tenantId = "gym1"
 *   gym1.multigym.com   → tenantId = "gym1"
 *   localhost:5173       → tenantId = null (platform context)
 */

export function getTenantFromSubdomain(): string | null {
  const hostname = window.location.hostname

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null
  }

  // Check if it's an IP address
  const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)
  if (isIpAddress) {
    return null
  }

  // Handle nip.io dynamically (e.g. tenant1.192.168.0.34.nip.io)
  if (hostname.endsWith('.nip.io')) {
    const parts = hostname.split('.')
    // Bare nip.io (192.168.0.34.nip.io) has 6 parts. Tenant makes it 7.
    if (parts.length > 6) {
      return parts[0]
    }
    return null
  }

  const parts = hostname.split('.')
  if (parts.length >= 2) {
    const subdomain = parts[0]
    if (subdomain === 'www') return null
    return subdomain
  }

  return null
}

export function getTenantFromLocation(): string | null {
  const subdomainTenant = getTenantFromSubdomain()
  if (subdomainTenant) return subdomainTenant

  const queryTenant = new URLSearchParams(window.location.search).get('tenant')?.trim()
  if (queryTenant) return queryTenant

  const tenantData = localStorage.getItem('auth-storage')
  if (tenantData) {
    try {
      const parsed = JSON.parse(tenantData)
      const storedTenant = parsed?.state?.tenantId?.trim()
      if (storedTenant) return storedTenant
    } catch {
      // ignore invalid persisted auth state
    }
  }

  return null
}

export function isTenantContext(): boolean {
  return getTenantFromLocation() !== null
}

function getBaseDomain(): string {
  const hostname = window.location.hostname

  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'localhost'

  const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)
  if (isIpAddress) {
    // Upgrade bare IPs to nip.io so subdomains work on mobile
    return `${hostname}.nip.io`
  }

  if (hostname.endsWith('.nip.io')) {
    const parts = hostname.split('.')
    if (parts.length > 6) {
      return parts.slice(1).join('.')
    }
    return hostname
  }

  const parts = hostname.split('.')
  if (parts.length >= 2) {
    // gym1.multigym.com -> multigym.com
    // Note: This is naive and won't work perfectly for .co.uk, but fine for .localhost and .com
    if (parts[1] === 'localhost') return 'localhost'
    return parts.slice(1).join('.')
  }

  return hostname
}

export function getPlatformUrl(): string {
  const protocol = window.location.protocol
  const port = window.location.port ? `:${window.location.port}` : ''
  return `${protocol}//${getBaseDomain()}${port}`
}

export function getTenantUrl(tenantId: string): string {
  const protocol = window.location.protocol
  const port = window.location.port ? `:${window.location.port}` : ''
  return `${protocol}//${tenantId}.${getBaseDomain()}${port}`
}
