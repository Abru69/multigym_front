import { create } from "zustand"
import type { User } from "@/types"
import { mockUsers } from "@/data/users"

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginAs: (role: "admin" | "client") => void
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<boolean>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 800))
    const found = mockUsers.find((u) => u.email === email)
    if (found) {
      set({ user: found, isAuthenticated: true, isLoading: false })
      return true
    }
    set({ isLoading: false })
    return false
  },

  loginAs: (role: "admin" | "client") => {
    const user = mockUsers.find((u) => u.role === role)!
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
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
    set({ user: newUser, isAuthenticated: true, isLoading: false })
    return true
  },
}))
