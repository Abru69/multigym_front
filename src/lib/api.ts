export async function fetchApi<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Get token from local storage
  // The Zustand persist key for platform auth is "platform-auth"
  // For client auth it might be "auth-storage" etc.
  
  let token = "";

  const isPlatformRequest = url.startsWith("/platform");
  const storageKey = isPlatformRequest ? "platform-auth" : "auth-storage";
  const authData = localStorage.getItem(storageKey);

  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      if (parsed.state && parsed.state.token) {
        token = parsed.state.token;
      }
    } catch (e) {
      console.error(`Failed to parse ${storageKey}`, e);
    }
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return null as T;
}
