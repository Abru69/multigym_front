export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "client"
  phone?: string
  joinDate: string
  isActive: boolean
  currentPlan?: string
  tenantId?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
