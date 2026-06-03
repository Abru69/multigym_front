import { create } from "zustand"
import { persist } from "zustand/middleware"
import { fetchApi } from "@/lib/api"

interface PlatformAdmin {
  email: string
  name: string
  role: "SUPER_ADMIN" | string
}

interface PlatformAuthStore {
  admin: PlatformAdmin | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

interface LoginResponse {
  token: string;
  role: string;
}

export const usePlatformAuthStore = create<PlatformAuthStore>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await fetchApi<LoginResponse>("/platform/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          })

          if (response && response.token) {
            set({
              admin: { email, name: "Super Admin", role: response.role },
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          }
        } catch (error) {
          console.error("Login failed:", error)
        }

        set({ isLoading: false })
        return false
      },

      logout: () => {
        set({ admin: null, token: null, isAuthenticated: false })
      },
    }),
    { name: "platform-auth" }
  )
)
