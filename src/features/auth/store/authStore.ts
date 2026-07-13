import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, ResponseDTO, LoginResponse, UserDTO } from '@/types'
import { fetchApi, logout as apiLogout } from '@/lib/api'
import type { UserRole } from '@/lib/permissions'

const ROLE_MAP: Record<string, UserRole> = {
  ADMIN: 'admin',
  CLIENT: 'client',
  NUTRICIONIST: 'nutricionist',
  STAFF: 'staff',
  RECEPTIONIST: 'receptionist',
  SELLER: 'seller',
}

interface AuthStore {
  user: User | null
  token: string | null
  tenantId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, tenantId: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<boolean>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tenantId: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, tenantId: string) => {
        set({ isLoading: true })

        try {
          const response = await fetchApi<ResponseDTO<LoginResponse>>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, tenantId }),
          })

          if (response && response.dto && response.dto.accessToken) {
            const rawRole = response.dto.role?.toUpperCase() || 'CLIENT'
            const role = ROLE_MAP[rawRole] || 'client'

            // Extract real user data from response.lista[0] if available
            const userDTO =
              response.lista && response.lista.length > 0
                ? (response.lista[0] as unknown as UserDTO)
                : null

            const loggedUser: User = {
              id: userDTO?.id || email,
              name: userDTO?.memberDTO?.name || email.split('@')[0],
              email: userDTO?.email || email,
              phone: userDTO?.memberDTO?.phone || undefined,
              role: role as 'admin' | 'client',
              joinDate: new Date().toISOString(),
              isActive: userDTO?.isActive ?? true,
            }

            set({
              user: loggedUser,
              token: response.dto.accessToken,
              tenantId: response.dto.tenantId,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          }
        } catch (error) {
          console.error('Login failed:', error)
          set({ isLoading: false })
          throw error
        }

        set({ isLoading: false })
        return false
      },

      logout: async () => {
        try {
          await apiLogout()
        } catch {
          // Ignore logout errors — still clear local state
        }
        set({ user: null, token: null, tenantId: null, isAuthenticated: false })
      },

      register: async (_name: string, _email: string, _password: string) => {
        // Registration is handled by gym admins via TenantUserController
        // Public self-registration is not available in this SaaS model
        set({ isLoading: true })
        await new Promise((r) => setTimeout(r, 500))
        set({ isLoading: false })
        return false
      },
    }),
    { name: 'auth-storage' }
  )
)
