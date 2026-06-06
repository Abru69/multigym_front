/**
 * Multi-tenant SaaS utilities
 * 
 * Tenant resolution via subdomain:
 *   gym1.localhost:5173 → tenantId = "gym1"
 *   gym1.multigym.com   → tenantId = "gym1"
 *   localhost:5173       → tenantId = null (platform context)
 */

export function getTenantFromSubdomain(): string | null {
  const hostname = window.location.hostname // e.g. "gym1.localhost" or "gym1.multigym.com"

  // localhost without subdomain → platform context
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null
  }

  const parts = hostname.split(".")

  // gym1.localhost → ["gym1", "localhost"] → "gym1"
  // gym1.multigym.com → ["gym1", "multigym", "com"] → "gym1"
  // localhost → ["localhost"] → null
  if (parts.length >= 2) {
    const subdomain = parts[0]
    // Avoid treating "www" as a tenant
    if (subdomain === "www") return null
    return subdomain
  }

  return null
}

/**
 * Check if we're in a tenant context (gym subdomain) vs platform context
 */
export function isTenantContext(): boolean {
  return getTenantFromSubdomain() !== null
}

/**
 * Get the platform base URL (without subdomain)
 */
export function getPlatformUrl(): string {
  const protocol = window.location.protocol
  const port = window.location.port ? `:${window.location.port}` : ""
  return `${protocol}//localhost${port}`
}

/**
 * Get a tenant-specific URL
 */
export function getTenantUrl(tenantId: string): string {
  const protocol = window.location.protocol
  const port = window.location.port ? `:${window.location.port}` : ""
  return `${protocol}//${tenantId}.localhost${port}`
}
