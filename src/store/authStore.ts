import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"
import { fetchApi } from "@/lib/api"
import { mockUsers } from "@/data/users"

interface LoginResponse {
  accessToken: string;
  type: string;
  expiresIn: number;
  tenantId: string;
  role: string;
}

interface ResponseDTO<T> {
  estatus: string;
  mensaje: string;
  lista: any[];
  dto: T;
  codError: string;
}

interface AuthStore {
  user: User | null
  token: string | null
  tenantId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, tenantId: string) => Promise<boolean>
  loginAs: (role: "admin" | "client") => void
  logout: () => void
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
          const response = await fetchApi<ResponseDTO<LoginResponse>>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password, tenantId }),
          })

          if (response && response.dto && response.dto.accessToken) {
            const role = response.dto.role.toLowerCase() === "admin" ? "admin" : "client";
            
            const loggedUser: User = {
              id: email, 
              name: email.split("@")[0],
              email: email,
              role: role as "admin" | "client",
              joinDate: new Date().toISOString(),
              isActive: true,
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
          console.error("Login failed:", error)
        }

        set({ isLoading: false })
        return false
      },

      loginAs: (role: "admin" | "client") => {
        const user = mockUsers.find((u) => u.role === role)!
        set({ user, token: "fake-token", tenantId: "public", isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, token: null, tenantId: null, isAuthenticated: false })
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true })
        await new Promise((r) => setTimeout(r, 800))
        const newUser: User = {
          id: `client-${Date.now()}`,
          name,
          email,
          role: "client",
          joinDate: new Date().toISOString(),
          isActive: true,
        }
        set({ user: newUser, token: "fake-token", tenantId: "public", isAuthenticated: true, isLoading: false })
        return true
      },
    }),
    { name: "auth-storage" }
  )
)
