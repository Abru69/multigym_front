import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PlatformAdmin {
  email: string
  name: string
  role: "SUPER_ADMIN"
}

interface PlatformAuthStore {
  admin: PlatformAdmin | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const usePlatformAuthStore = create<PlatformAuthStore>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        await new Promise((r) => setTimeout(r, 700))

        if (email === "admin@saas.com" && password === "admin123") {
          set({
            admin: { email, name: "Super Admin", role: "SUPER_ADMIN" },
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        }

        set({ isLoading: false })
        return false
      },

      logout: () => {
        set({ admin: null, isAuthenticated: false })
      },
    }),
    { name: "platform-auth" }
  )
)
