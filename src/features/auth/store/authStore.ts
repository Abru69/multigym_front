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

function normalizeRole(value: string | undefined): UserRole | null {
  const normalized = value
    ?.trim()
    .toUpperCase()
    .replace(/^ROLE_/, '')
  return normalized ? ROLE_MAP[normalized] || null : null
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
  setUserAvatar: (avatar: string) => void
  updateUserProfile: (data: { name: string; phone: string }) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
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
            headers: { 'X-Tenant-ID': tenantId },
            body: JSON.stringify({ email, password, tenantId }),
          })

          if (response && response.dto && response.dto.accessToken) {
            const role = normalizeRole(response.dto.role)
            if (!role) {
              throw new Error('El backend devolvió un rol no reconocido.')
            }

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
              role,
              joinDate: new Date().toISOString(),
              isActive: userDTO?.isActive ?? true,
              memberId: userDTO?.memberDTO?.id || undefined,
              avatar: userDTO?.avatarUrl || undefined,
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
        const { token, tenantId } = get()

        // Clear local auth before navigation so a slow API request cannot
        // remount the tenant landing page with the old session.
        set({ user: null, token: null, tenantId: null, isAuthenticated: false })

        // Invalidate the server session without blocking the UI logout.
        void apiLogout(token || undefined, tenantId).catch(() => undefined)
      },

      register: async (_name: string, _email: string, _password: string) => {
        // Registration is handled by gym admins via TenantUserController
        // Public self-registration is not available in this SaaS model
        set({ isLoading: true })
        await new Promise((r) => setTimeout(r, 500))
        set({ isLoading: false })
        return false
      },

      setUserAvatar: (avatar: string) => {
        set((state) => ({
          user: state.user ? { ...state.user, avatar } : state.user,
        }))
      },

      updateUserProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : state.user,
        }))
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Si no hay token válido, invalidar la sesión rehidratada para
        // evitar que los guards pasen con estado podrido de una sesión caducada.
        if (state && (!state.token || state.token === 'fake-token')) {
          state.user = null
          state.token = null
          state.tenantId = null
          state.isAuthenticated = false
        }
      },
    }
  )
)
