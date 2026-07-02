export interface ResponseDTO<T> {
  estatus: string
  mensaje: string
  lista?: T[]
  dto?: T
  codError?: string
}

export interface LoginResponse {
  accessToken: string
  type: string
  expiresIn: number
  tenantId: string
  role: string
}

export interface PlatformLoginResponse {
  accessToken: string
  role: string
}

export interface TenantDTO {
  tenantId: string
  name: string
  subdomain: string
  status: 'ACTIVE' | 'INACTIVE'
  planId: string | null
  trialEndsAt: string | null
  createdAt: string
}

export interface SaasPlanDTO {
  id: string
  name: string
  description: string | null
  price: number
  memberLimit: number
  trialDays: number
  isActive: boolean
}

export interface TenantRequestDTO {
  tenantId: string
  name: string
  subdomain: string
  adminEmail: string
  adminPassword: string
  adminName: string
  adminPhone: string
  planId: string
}

export interface MemberDTO {
  id: string
  name: string
  phone: string
}

export interface UserDTO {
  id: string
  email: string
  role: string
  isActive: boolean
  memberDTO: MemberDTO | null
}

export interface DashboardDTO {
  activeClients: number
  monthlySales: string
  totalWorkouts: number
  clientsWithoutWorkout: number
  activeClientsChange: string
  monthlySalesChange: string
  totalWorkoutsChange: string
  clientsWithoutWorkoutChange: string
  salesData: ChartDataDTO[]
  recentActivity: ActivityDTO[]
}

export interface ChartDataDTO {
  month: string
  ventas: number
}

export interface ActivityDTO {
  text: string
  time: string
  type: string
}

export interface ProductDTO {
  id: string
  name: string
  price: number
  stock: number
}

export interface ExerciseDTO {
  id: string
  name: string
  muscleGroup: string
}

export interface PlatformUserDTO {
  id: string
  email: string
  name: string
  lastName: string | null
  role: 'SUPER_ADMIN' | 'SUPPORT' | 'DEVOPS'
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

export interface PlatformUserRequestDTO {
  email: string
  password?: string
  name: string
  lastName?: string
  role: 'SUPER_ADMIN' | 'SUPPORT' | 'DEVOPS'
}

export interface WorkoutDTO {
  id: string
  title: string
  startsAt: string
  endsAt: string
  member?: { id: string }
  exercises?: Array<{
    exercise: { id: string }
    dayOfWeek: string
    sets: number
    reps: string
    restSeconds: number
    orderIndex: number
  }>
}
