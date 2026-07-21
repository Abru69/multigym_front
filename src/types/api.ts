type ResponseList<T> = T extends Array<infer Item> ? Item[] : T[]

export interface ResponseDTO<T> {
  estatus: string
  mensaje: string
  lista?: ResponseList<T>
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

export type TenantStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED'

export interface TenantDTO {
  tenantId: string
  name: string
  subdomain: string
  status: TenantStatus
  planId: string | null
  trialEndsAt: string | null
  subscriptionEndsAt: string | null
  createdAt: string
  memberCount: number
  memberLimit: number
  planPrice: number
  isTrial: boolean
  announcementsEnabled?: boolean
  logoUrl?: string | null
}

export interface TenantPaymentDTO {
  id: string
  tenantId: string
  planId: string
  planName: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | string
  paymentMethod: string
  paymentProvider: string
  paymentReference?: string | null
  checkoutUrl?: string | null
  paidAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface TenantRenewalInfoDTO {
  tenantId: string
  name: string
  status: TenantStatus
  planId: string
  planName: string
  price: number
  currency: string
  trialEndsAt?: string | null
  subscriptionEndsAt?: string | null
  canRenew: boolean
  renewalReason: string
}

export interface TenantRenewalResultDTO {
  tenant: TenantDTO
  payment: TenantPaymentDTO
  previousSubscriptionEndsAt?: string | null
  newSubscriptionEndsAt: string
}

export interface TenantRenewalPaymentRequest {
  cardToken: string
  paymentMethodId: string
  issuerId?: string | null
  installments: number
  payerEmail: string
}

export interface MercadoPagoTenantConfigDTO {
  enabled: boolean
  connectionStatus: string
  mpUserId?: string | null
  publicKey?: string | null
  accessTokenConfigured: boolean
  refreshTokenConfigured: boolean
  webhookSecretConfigured: boolean
  accessTokenExpiresAt?: string | null
  notificationUrl?: string | null
  siteId?: string | null
  currency?: string | null
  processingMode?: string | null
  connectedAt?: string | null
  disconnectedAt?: string | null
  lastRefreshAt?: string | null
}

export interface MercadoPagoTenantConfigRequest {
  enabled: boolean
  publicKey?: string | null
  accessToken?: string | null
  refreshToken?: string | null
  webhookSecret?: string | null
  mpUserId?: string | null
  notificationUrl?: string | null
  siteId?: string | null
  currency?: string | null
  processingMode?: string | null
}

export interface MercadoPagoOAuthConnectDTO {
  authorizationUrl: string
  state: string
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
  avatarUrl?: string | null
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
  refundReference?: string
  refundErrorMessage?: string
  refundedAt?: string
  cancelledAt?: string
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
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'REFUND_FAILED'
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
  cardToken?: string
  paymentMethodId?: string
  issuerId?: string
  installments?: number
}

export interface OrderStatusRequest {
  status: string
}

export interface ManualRefundRequest {
  refundReference?: string
  note?: string
}

export type MarkRefundedRequest = ManualRefundRequest

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

// --- Check-In ---
export interface CheckInDTO {
  id: string
  memberId: string
  memberName?: string
  checkInTime: string
  checkOutTime?: string
  durationMinutes?: number
  checkInMethod: string
  notes?: string
}

export interface CheckInRequest {
  memberId: string
  notes?: string
}

export interface CheckInStatsDTO {
  today: { count: number; avgDuration: number }
  thisWeek: { count: number; avgDuration: number }
  thisMonth: { count: number; avgDuration: number }
  peakHour: number
}

// --- Announcements ---
export interface AnnouncementDTO {
  id: string
  title: string
  description?: string
  mediaType: 'IMAGE' | 'VIDEO' | 'TEXT'
  mediaUrl?: string
  linkUrl?: string
  position: 'HERO' | 'BANNER' | 'POPUP' | 'FOOTER'
  priority: number
  isActive: boolean
  startDate?: string
  endDate?: string
  viewCount: number
  clickCount: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface AnnouncementRequest {
  title: string
  description?: string
  mediaType: 'IMAGE' | 'VIDEO' | 'TEXT'
  mediaUrl?: string
  linkUrl?: string
  position: 'HERO' | 'BANNER' | 'POPUP' | 'FOOTER'
  priority: number
  isActive: boolean
  startDate?: string
  endDate?: string
}

// --- Reports ---
export interface TenantDashboardDTO {
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
  activeSubscriptions: number
  expiringSubscriptions: number
  monthlyRevenue: number
  totalRevenue: number
  todayCheckIns: number
  currentOccupancy: number
  peakHour: number
  activeProducts: number
  pendingOrders: number
}

export interface MemberReportDTO {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  newThisMonth: number
  monthlyTrend: Array<{ month: string; count: number }>
}

export interface SubscriptionReportDTO {
  active: number
  cancelled: number
  expired: number
  expiringIn7Days: number
  mrr: number
  monthlyTrend: Array<{ month: string; count: number }>
}

export interface CheckInReportDTO {
  todayCheckIns: number
  thisWeekCheckIns: number
  thisMonthCheckIns: number
  currentOccupancy: number
  avgDurationMinutes: number
  peakHour: number
  dailyTrend: Array<{ day: string; count: number }>
}

export interface ProductReportDTO {
  totalProducts: number
  lowStockProducts: number
  totalInventoryValue: number
  topByRevenue: Array<{ name: string; value: number }>
  topByQuantity: Array<{ name: string; value: number }>
}

export interface AnnouncementReportDTO {
  totalAnnouncements: number
  activeAnnouncements: number
  totalViews: number
  totalClicks: number
  avgClickRate: number
  topByViews: Array<{ title: string; views: number }>
}

export interface WorkoutReportDTO {
  totalWorkouts: number
  totalLogs: number
  avgCaloriesBurned: number
  avgDurationMinutes: number
  activeNutritionPlans: number
  workoutTrend: Array<{ month: string; count: number }>
}

// --- Platform Reports ---
export interface PlatformDashboardDTO {
  totalTenants: number
  activeTenants: number
  trialTenants: number
  pastDueTenants: number
  suspendedTenants: number
  cancelledTenants: number
  totalMRR: number
  totalRevenue: number
  arpu: number
  churnRate: number
  totalMembers: number
  totalActiveSubscriptions: number
  todayCheckIns: number
  monthlyTrend: Array<{ year: number; month: number; revenue: number; paymentCount: number }>
  expirationAlerts: TenantExpirationAlert[]
}

export interface TenantExpirationAlert {
  tenantId: string
  tenantName: string
  status: TenantStatus
  expiresAt: string
  type: 'TRIAL' | 'SUBSCRIPTION'
  daysUntilExpiry: number
}

export interface TenantHealthDTO {
  tenantId: string
  name: string
  status: TenantStatus
  memberCount: number
  isTrial: boolean
  subscriptionEndsAt: string | null
  daysUntilExpiry: number
}

// --- Platform Analytics (Etapa 6) ---
export interface TenantRevenueDTO {
  tenantId: string
  tenantName: string
  planId: string | null
  planName: string
  planPrice: number
  totalRevenue: number
  monthlyRevenue: number
  paymentCount: number
  failedPayments: number
  lastPaymentAt: string | null
}

export interface MrrReportDTO {
  totalMRR: number
  arr: number
  payingTenants: number
  trialTenants: number
  pastDueTenants: number
  suspendedTenants: number
  cancelledTenants: number
  tenants: TenantRevenueDTO[]
}

export interface ChurnRetentionDTO {
  churnRate: number
  churnedLast30Days: number
  churnedLast90Days: number
  retentionRate: number
  monthlyChurn: Array<{ year: number; month: number; churned: number; total: number }>
}

export interface PlanAnalyticsDTO {
  planId: string
  planName: string
  planPrice: number
  activeTenants: number
  totalTenants: number
  mrr: number
  totalRevenue: number
  totalPayments: number
}

export interface FailedPaymentReportDTO {
  totalFailed: number
  needsRetry: number
  failedAmount: number
  recentFailed: Array<{
    tenantId: string
    tenantName: string
    amount: number
    lastError: string
    retryCount: number
    createdAt: string
  }>
}

export interface PlatformAnalyticsDTO {
  mrr: MrrReportDTO
  churnRetention: ChurnRetentionDTO
  planBreakdown: PlanAnalyticsDTO[]
  failedPayments: FailedPaymentReportDTO
  arpuLtv: {
    arpu: number
    averageLifetimeMonths: number
    ltv: number
  }
}
