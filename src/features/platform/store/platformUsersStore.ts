import { create } from 'zustand'
import {
  getPlatformUsers,
  createPlatformUser as apiCreatePlatformUser,
  updatePlatformUser as apiUpdatePlatformUser,
  togglePlatformUserStatus as apiTogglePlatformUserStatus,
  deletePlatformUser as apiDeletePlatformUser,
} from '@/lib/api'
import type { PlatformUserDTO, PlatformUserRequestDTO } from '@/types'

interface PlatformUsersStore {
  users: PlatformUserDTO[]
  isLoading: boolean
  error: string | null
  loadUsers: () => Promise<void>
  createUser: (data: PlatformUserRequestDTO) => Promise<boolean>
  updateUser: (id: string, data: PlatformUserRequestDTO) => Promise<boolean>
  toggleStatus: (id: string) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
}

export const usePlatformUsersStore = create<PlatformUsersStore>()((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  loadUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await getPlatformUsers()
      set({ users: response?.dto?.data || [], isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuarios'
      set({ error: message, isLoading: false })
    }
  },

  createUser: async (data) => {
    try {
      await apiCreatePlatformUser(data)
      await get().loadUsers()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear usuario'
      set({ error: message })
      return false
    }
  },

  updateUser: async (id, data) => {
    try {
      await apiUpdatePlatformUser(id, data)
      await get().loadUsers()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar usuario'
      set({ error: message })
      return false
    }
  },

  toggleStatus: async (id) => {
    try {
      await apiTogglePlatformUserStatus(id)
      await get().loadUsers()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado'
      set({ error: message })
      return false
    }
  },

  deleteUser: async (id) => {
    try {
      await apiDeletePlatformUser(id)
      await get().loadUsers()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar usuario'
      set({ error: message })
      return false
    }
  },
}))
