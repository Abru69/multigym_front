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
  memberCount: number
  memberLimit: number
  planPrice: number
  isTrial: boolean
}

export interface TenantSummaryDTO {
  tenantCount: number
  activeTenantCount: number
  trialTenantCount: number
  totalMemberCount: number
  totalMemberLimit: number
  mrr: number
  retentionRate: number
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
  imageUrl?: string
  brand?: string
  category?: string
  image?: string
  rating?: number
  reviewCount?: number
  description?: string
  flavor?: string
  weight?: string
  tags?: string[]
  nutritionFacts?: Array<{ label: string; value: string; dailyValue?: string }>
  servingSize?: string
  servings?: number
}

export interface ExerciseDTO {
  id: string
  name: string
  muscleGroup: string
  imageUrl?: string
  videoUrl?: string
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

export interface OrderDTO {
  id: string
  user?: UserDTO
  total: number | string
  status: string
  items?: OrderItemDTO[]
  paymentMethod?: string
  paymentReference?: string
  paymentStatus?: string
  createdAt?: string
  paymentDate?: string
  deliveryMethod?: string
  branchId?: string
  branchName?: string
  shippingAddress?: string
  shippingCity?: string
  shippingPostalCode?: string
}

export interface OrderItemDTO {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number | string
  subtotal: number | string
}

export interface BranchDTO {
  id: string
  name: string
  address: string
  phone: string
  isActive: boolean
}

export interface TenantSettingDTO {
  key: string
  value: string
  type: string
  description: string
}

export interface AuditLogDTO {
  id: string
  tenantId: string | null
  tenantName: string | null
  userId: string | null
  userType: string | null
  action: string
  entityName: string
  entityId: string | null
  metadata: string | null
  ipAddress: string | null
  createdAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface MemberListItemDTO {
  id: string
  name: string
  phone: string
  email: string
  isActive: boolean
}

export interface PlanListItemDTO {
  id: string
  name: string
  description: string | null
  price: number
  durationMonths: number
  maxWorkoutsPerWeek: number | null
  maxClasses: number | null
  accessHours: string | null
  features: string | null
  isActive: boolean
}

export type PlanDTO = PlanListItemDTO

export interface SubscriptionListItemDTO {
  id: string
  member: MemberListItemDTO | null
  plan: PlanListItemDTO | null
  startDate: string
  endDate: string
  status: string
}

export interface PaymentListItemDTO {
  id: string
  subscriptionId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  status: string
  reference: string | null
}

export interface WorkoutExerciseListItemDTO {
  id: string
  workoutId: string
  exercise: ExerciseDTO
  dayOfWeek: string
  sets: number
  reps: string
  restSeconds: number
  orderIndex: number
}

export interface WorkoutLogListItemDTO {
  id: string
  workoutId: string
  durationMinutes: number
  caloriesBurned: number
  completedAt: string
}

export interface MemberRequest {
  userId: string
  name: string
  phone: string
}

export interface PlanRequest {
  name: string
  description?: string
  price: number
  durationMonths: number
  maxWorkoutsPerWeek?: number
  maxClasses?: number
  accessHours?: string
  features?: string
}

export interface SubscriptionRequest {
  memberId: string
  planId: string
  startDate: string
  endDate: string
}

export interface PaymentRequest {
  subscriptionId: string
  amount: number
  paymentMethod: string
  reference?: string
}

export interface WorkoutExerciseRequest {
  workoutId: string
  exerciseId: string
  dayOfWeek?: string
  sets: number
  reps: string
  restSeconds: number
  orderIndex: number
}

export interface WorkoutLogRequest {
  workoutId: string
  durationMinutes: number
  caloriesBurned: number
}

export interface SubscriptionDTO {
  id: string
  member: MemberDTO
  plan: PlanDTO
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
}

export interface PaymentDTO {
  id: string
  subscriptionId: string
  amount: number
  paymentDate: string | null
  paymentMethod: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED'
  reference: string | null
}

export interface TenantBillingSummaryDTO {
  tenantId: string
  tenantName: string
  totalPaid: number
  activeSubscriptionId: string | null
  activePlanName: string | null
  paymentCount: number
  lastPaymentDate: string | null
}

export interface RevenueReportDTO {
  year: number
  month: number
  totalRevenue: number
  paymentCount: number
}

export interface PlatformSettingDTO {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean'
  description: string | null
}

export interface SaasPlanRequest {
  name: string
  description?: string
  price: number
  memberLimit: number
  trialDays: number
}

export interface SubscriptionPlanChangeRequest {
  planId: string
}

export interface ProductRequest {
  name: string
  price: number
  stock: number
  imageUrl?: string
}

export interface TenantUserRequest {
  email: string
  password?: string
  name: string
  phone: string
  role: string
  status?: boolean
}

export interface OrderRequest {
  userId: string
  items: Array<{ productId: string; quantity: number }>
  paymentMethod: string
  shippingAmount?: number
  deliveryMethod: string
  branchId?: string
  shippingAddress?: string
  shippingCity?: string
  shippingPostalCode?: string
}

export interface OrderStatusRequest {
  status: string
}

export interface WorkoutRequest {
  memberId: string
  title: string
  startsAt: string
  endsAt: string
}

export interface HealthDTO {
  status: string
  timestamp: string
}

export interface ReadinessDTO {
  timestamp: string
  database: string
  redis: string
}

// --- Nutrition ---
export interface FoodItemDTO {
  id: string
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

export interface MealDTO {
  id: string
  name: string
  time: string
  foods: FoodItemDTO[]
  calories: number
  protein: number
  carbs: number
  fats: number
}

export interface NutritionPlanDTO {
  id: string
  memberId: string
  memberName?: string
  name: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFats: number
  meals: MealDTO[]
  notes: string
  createdAt?: string
  updatedAt?: string
}

export interface NutritionPlanRequest {
  memberId: string
  name: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFats: number
  meals: MealRequest[]
  notes: string
}

export interface MealRequest {
  name: string
  time: string
  foods: FoodItemRequest[]
}

export interface FoodItemRequest {
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fats: number
}
