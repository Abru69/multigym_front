import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchApi } from '@/lib/api'
import type { ResponseDTO, PlatformLoginResponse } from '@/types'

interface PlatformAdmin {
  email: string
  name: string
  role: 'SUPER_ADMIN' | string
}

interface PlatformAuthStore {
  admin: PlatformAdmin | null
  token: string | null
  isAuthenticated: boolean
  mustChangePassword: boolean
  hasHydrated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

export const usePlatformAuthStore = create<PlatformAuthStore>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      mustChangePassword: false,
      hasHydrated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })

        try {
          const response = await fetchApi<ResponseDTO<PlatformLoginResponse>>(
            '/platform/auth/login',
            {
              method: 'POST',
              body: JSON.stringify({ email, password }),
            }
          )

          if (response && response.dto && response.dto.accessToken) {
            set({
              admin: { email, name: 'Super Admin', role: response.dto.role },
              token: response.dto.accessToken,
              isAuthenticated: true,
              mustChangePassword: response.dto.mustChangePassword,
              isLoading: false,
            })
            return true
          }
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
        return false
      },

      logout: async () => {
        // Do not send the tenant token to /api/auth/logout. The backend does
        // not currently document a platform logout endpoint.
       set({ admin: null, token: null, isAuthenticated: false, mustChangePassword: false })
      },
    }),
    {
      name: 'platform-auth',
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true
      },
    }
  )
)
