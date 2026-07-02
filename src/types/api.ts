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
