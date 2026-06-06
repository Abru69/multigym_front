import { getTenantFromSubdomain } from "./tenant"

export async function fetchApi<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Smart token resolution for multi-tenant SaaS architecture
  let token = "";

  // Try platform-auth first (SuperAdmin context)
  const platformData = localStorage.getItem("platform-auth");
  if (platformData) {
    try {
      const parsed = JSON.parse(platformData);
      if (parsed.state && parsed.state.token) {
        token = parsed.state.token;
      }
    } catch (e) {
      console.error("Failed to parse platform-auth", e);
    }
  }

  // If no platform token, try tenant auth (gym admin/client context)
  if (!token) {
    const tenantData = localStorage.getItem("auth-storage");
    if (tenantData) {
      try {
        const parsed = JSON.parse(tenantData);
        if (parsed.state && parsed.state.token) {
          token = parsed.state.token;
        }
      } catch (e) {
        console.error("Failed to parse auth-storage", e);
      }
    }
  }

  // For tenant-specific requests, prefer tenant token over platform token
  const isTenantRequest = url.startsWith("/api/tenant/") || url.startsWith("/api/auth/");
  if (isTenantRequest) {
    const tenantData = localStorage.getItem("auth-storage");
    if (tenantData) {
      try {
        const parsed = JSON.parse(tenantData);
        if (parsed.state && parsed.state.token && parsed.state.token !== "fake-token") {
          token = parsed.state.token;
        }
      } catch (e) {
        // keep platform token as fallback
      }
    }
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Auto-resolve tenant from subdomain and send as header
  const tenantId = getTenantFromSubdomain();
  if (tenantId && !headers.has("X-Tenant-ID")) {
    headers.set("X-Tenant-ID", tenantId);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.mensaje || errorData?.message || `Request failed with status ${response.status}`);
  }

  // Handle empty responses (204 No Content, etc.)
  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return null as T;
}
