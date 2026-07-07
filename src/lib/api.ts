import { getTenantFromSubdomain } from './tenant'
import type {
  ResponseDTO,
  ProductDTO,
  ExerciseDTO,
  WorkoutDTO,
  TenantDTO,
  TenantSummaryDTO,
  SaasPlanDTO,
  TenantRequestDTO,
  PlatformUserDTO,
  PlatformUserRequestDTO,
  AuditLogDTO,
  PaginatedResult,
  MemberListItemDTO,
  PlanListItemDTO,
  SubscriptionListItemDTO,
  PaymentListItemDTO,
  WorkoutExerciseListItemDTO,
  WorkoutLogListItemDTO,
  TenantBillingSummaryDTO,
  RevenueReportDTO,
  PlatformSettingDTO,
  BranchDTO,
  TenantSettingDTO,
  OrderDTO,
} from '@/types'

export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  let token = ''

  const platformData = localStorage.getItem('platform-auth')
  if (platformData) {
    try {
      const parsed = JSON.parse(platformData)
      if (parsed.state && parsed.state.token) {
        token = parsed.state.token
      }
    } catch (e) {
      console.error('Failed to parse platform-auth', e)
    }
  }

  if (!token) {
    const tenantData = localStorage.getItem('auth-storage')
    if (tenantData) {
      try {
        const parsed = JSON.parse(tenantData)
        if (parsed.state && parsed.state.token) {
          token = parsed.state.token
        }
      } catch (e) {
        console.error('Failed to parse auth-storage', e)
      }
    }
  }

  const isTenantRequest = url.startsWith('/api/tenant/') || url.startsWith('/api/auth/')
  if (isTenantRequest) {
    const tenantData = localStorage.getItem('auth-storage')
    if (tenantData) {
      try {
        const parsed = JSON.parse(tenantData)
        if (parsed.state && parsed.state.token && parsed.state.token !== 'fake-token') {
          token = parsed.state.token
        }
      } catch {
        // keep platform token as fallback
      }
    }
  }

  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let tenantId = getTenantFromSubdomain()
  if (!tenantId) {
    const tenantData = localStorage.getItem('auth-storage')
    if (tenantData) {
      try {
        const parsed = JSON.parse(tenantData)
        if (parsed.state && parsed.state.tenantId) {
          tenantId = parsed.state.tenantId
        }
      } catch {
        // ignore
      }
    }
  }
  if (tenantId && !headers.has('X-Tenant-ID')) {
    headers.set('X-Tenant-ID', tenantId)
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(
      errorData?.mensaje || errorData?.message || `Request failed with status ${response.status}`
    )
  }

  if (response.status === 204) {
    return null as T
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return null as T
}

export const getProducts = () => fetchApi<ResponseDTO<PaginatedResult<ProductDTO>>>('/api/products')
export const createProduct = (data: Partial<ProductDTO>) =>
  fetchApi<ResponseDTO<ProductDTO>>('/api/products', { method: 'POST', body: JSON.stringify(data) })

export const getExercises = () =>
  fetchApi<ResponseDTO<PaginatedResult<ExerciseDTO>>>('/api/exercises')
export const createExercise = (data: Partial<ExerciseDTO>) =>
  fetchApi<ResponseDTO<ExerciseDTO>>('/api/exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getWorkouts = () => fetchApi<ResponseDTO<PaginatedResult<WorkoutDTO>>>('/api/workouts')
export const createWorkout = (data: Partial<WorkoutDTO>) =>
  fetchApi<ResponseDTO<WorkoutDTO>>('/api/workouts', { method: 'POST', body: JSON.stringify(data) })
export const deleteWorkout = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/workouts/${id}`, { method: 'DELETE' })

export const activateAccount = (data: { token: string; newPassword?: string }) =>
  fetchApi<ResponseDTO<unknown>>('/api/tenant/users/activate-account', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const logout = () => fetchApi<ResponseDTO<unknown>>('/api/auth/logout', { method: 'POST' })

export const refreshToken = () =>
  fetchApi<
    ResponseDTO<{
      accessToken: string
      type: string
      expiresIn: number
      tenantId: string
      role: string
    }>
  >('/api/auth/refresh-token', { method: 'POST' })

export const getTenants = () => fetchApi<ResponseDTO<PaginatedResult<TenantDTO>>>('/api/tenants')

export const getTenantsSummary = () =>
  fetchApi<ResponseDTO<TenantSummaryDTO>>('/api/tenants/summary')

export const getTenantBillingSummaries = () =>
  fetchApi<ResponseDTO<TenantBillingSummaryDTO>>('/api/tenants/billing-summaries')

export const createTenant = (data: TenantRequestDTO) =>
  fetchApi<ResponseDTO<TenantDTO>>('/api/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const deleteTenant = (tenantId: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/tenants/${tenantId}`, { method: 'DELETE' })

export const toggleTenantStatus = (tenantId: string) =>
  fetchApi<ResponseDTO<TenantDTO>>(`/api/tenants/${tenantId}/status`, { method: 'PATCH' })

export const getSaasPlans = () =>
  fetchApi<ResponseDTO<PaginatedResult<SaasPlanDTO>>>('/api/saas-plans')

export const getPlatformUsers = () =>
  fetchApi<ResponseDTO<PaginatedResult<PlatformUserDTO>>>('/platform-api/users')

export const createPlatformUser = (data: PlatformUserRequestDTO) =>
  fetchApi<ResponseDTO<PlatformUserDTO>>('/platform-api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updatePlatformUser = (id: string, data: PlatformUserRequestDTO) =>
  fetchApi<ResponseDTO<PlatformUserDTO>>(`/platform-api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const togglePlatformUserStatus = (id: string) =>
  fetchApi<ResponseDTO<PlatformUserDTO>>(`/platform-api/users/${id}/status`, { method: 'PATCH' })

export const deletePlatformUser = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/platform-api/users/${id}`, { method: 'DELETE' })

// --- Members ---
export const getMembers = () =>
  fetchApi<ResponseDTO<PaginatedResult<MemberListItemDTO>>>('/api/members')
export const createMember = (data: { userId: string; name: string; phone: string }) =>
  fetchApi<ResponseDTO<MemberListItemDTO>>('/api/members', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateMember = (id: string, data: { name: string; phone: string }) =>
  fetchApi<ResponseDTO<MemberListItemDTO>>(`/api/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteMember = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/members/${id}`, { method: 'DELETE' })
export const getMemberById = (id: string) =>
  fetchApi<ResponseDTO<MemberListItemDTO>>(`/api/members/${id}`)

// --- Plans ---
export const getPlans = () =>
  fetchApi<ResponseDTO<PaginatedResult<PlanListItemDTO>>>('/api/plans')
export const createPlan = (data: {
  name: string
  description?: string
  price: number
  durationMonths: number
  maxWorkoutsPerWeek?: number
  maxClasses?: number
  accessHours?: string
  features?: string
}) =>
  fetchApi<ResponseDTO<PlanListItemDTO>>('/api/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updatePlan = (
  id: string,
  data: {
    name: string
    description?: string
    price: number
    durationMonths: number
    maxWorkoutsPerWeek?: number
    maxClasses?: number
    accessHours?: string
    features?: string
  }
) =>
  fetchApi<ResponseDTO<PlanListItemDTO>>(`/api/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deletePlan = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/plans/${id}`, { method: 'DELETE' })
export const togglePlanStatus = (id: string) =>
  fetchApi<ResponseDTO<PlanListItemDTO>>(`/api/plans/${id}/status`, { method: 'PATCH' })
export const getPlanById = (id: string) =>
  fetchApi<ResponseDTO<PlanListItemDTO>>(`/api/plans/${id}`)

// --- Subscriptions ---
export const getSubscriptions = () =>
  fetchApi<ResponseDTO<PaginatedResult<SubscriptionListItemDTO>>>('/api/subscriptions')
export const createSubscription = (data: {
  memberId: string
  planId: string
  startDate: string
  endDate: string
}) =>
  fetchApi<ResponseDTO<SubscriptionListItemDTO>>('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const cancelSubscription = (id: string) =>
  fetchApi<ResponseDTO<SubscriptionListItemDTO>>(`/api/subscriptions/${id}/cancel`, {
    method: 'PATCH',
  })
export const getSubscriptionsByMember = (memberId: string) =>
  fetchApi<ResponseDTO<PaginatedResult<SubscriptionListItemDTO>>>(
    `/api/subscriptions/member/${memberId}`
  )

// --- Payments ---
export const getPayments = () =>
  fetchApi<ResponseDTO<PaginatedResult<PaymentListItemDTO>>>('/api/payments')
export const createPayment = (data: {
  subscriptionId: string
  amount: number
  paymentMethod: string
  reference?: string
}) =>
  fetchApi<ResponseDTO<PaymentListItemDTO>>('/api/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const getPaymentsBySubscription = (subscriptionId: string) =>
  fetchApi<ResponseDTO<PaginatedResult<PaymentListItemDTO>>>(
    `/api/payments/subscription/${subscriptionId}`
  )

// --- Workout Exercises ---
export const getWorkoutExercises = (workoutId: string) =>
  fetchApi<ResponseDTO<PaginatedResult<WorkoutExerciseListItemDTO>>>(
    `/api/workout-exercises/${workoutId}`
  )
export const createWorkoutExercise = (data: {
  workoutId: string
  exerciseId: string
  dayOfWeek: string
  sets: number
  reps: string
  restSeconds: number
  orderIndex: number
}) =>
  fetchApi<ResponseDTO<WorkoutExerciseListItemDTO>>('/api/workout-exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateWorkoutExercise = (
  id: string,
  data: {
    dayOfWeek?: string
    sets?: number
    reps?: string
    restSeconds?: number
    orderIndex?: number
  }
) =>
  fetchApi<ResponseDTO<WorkoutExerciseListItemDTO>>(`/api/workout-exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteWorkoutExercise = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/workout-exercises/${id}`, { method: 'DELETE' })

// --- Workout Logs ---
export const getWorkoutLogs = (workoutId: string) =>
  fetchApi<ResponseDTO<PaginatedResult<WorkoutLogListItemDTO>>>(
    `/api/workout-logs/${workoutId}`
  )
export const createWorkoutLog = (data: {
  workoutId: string
  durationMinutes: number
  caloriesBurned: number
}) =>
  fetchApi<ResponseDTO<WorkoutLogListItemDTO>>('/api/workout-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateWorkoutLog = (
  id: string,
  data: { durationMinutes?: number; caloriesBurned?: number }
) =>
  fetchApi<ResponseDTO<WorkoutLogListItemDTO>>(`/api/workout-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export interface AuditFilters {
  action?: string
  entityName?: string
  tenantId?: string
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
}

export const getAudits = (filters: AuditFilters = {}) => {
  const params = new URLSearchParams()
  if (filters.action) params.set('action', filters.action)
  if (filters.entityName) params.set('entityName', filters.entityName)
  if (filters.tenantId) params.set('tenantId', filters.tenantId)
  if (filters.fromDate) params.set('fromDate', filters.fromDate)
  if (filters.toDate) params.set('toDate', filters.toDate)
  params.set('page', String(filters.page ?? 0))
  params.set('size', String(filters.size ?? 20))
  return fetchApi<ResponseDTO<PaginatedResult<AuditLogDTO>>>(`/api/audits?${params.toString()}`)
}

export const getBillingSummary = (tenantId: string) =>
  fetchApi<ResponseDTO<TenantBillingSummaryDTO>>(`/api/tenants/${tenantId}/billing/summary`)

export const getRevenueReport = (tenantId: string) =>
  fetchApi<ResponseDTO<RevenueReportDTO>>(`/api/tenants/${tenantId}/billing/revenue`)

export const getPlatformSettings = () =>
  fetchApi<ResponseDTO<PlatformSettingDTO>>('/api/platform-settings')

export const updatePlatformSettings = (entries: Record<string, string>) =>
  fetchApi<ResponseDTO<PlatformSettingDTO>>('/api/platform-settings', {
    method: 'PUT',
    body: JSON.stringify({ entries }),
  })

// --- Branches ---
export const getBranches = () =>
  fetchApi<ResponseDTO<BranchDTO[]>>('/api/branches')

// --- Tenant Settings ---
export const getTenantSettings = () =>
  fetchApi<ResponseDTO<TenantSettingDTO[]>>('/api/tenant-settings')

export const updateTenantSettings = (entries: Record<string, string>) =>
  fetchApi<ResponseDTO<TenantSettingDTO>>('/api/tenant-settings', {
    method: 'PUT',
    body: JSON.stringify({ entries }),
  })

// --- Orders ---
export const markOrderReady = (orderId: string) =>
  fetchApi<ResponseDTO<OrderDTO>>(`/api/orders/${orderId}/ready`, {
    method: 'PATCH',
  })

export const markOrderComplete = (orderId: string) =>
  fetchApi<ResponseDTO<OrderDTO>>(`/api/orders/${orderId}/complete`, {
    method: 'PATCH',
  })

export const cancelOrder = (orderId: string) =>
  fetchApi<ResponseDTO<OrderDTO>>(`/api/orders/${orderId}/cancel`, {
    method: 'PATCH',
  })
