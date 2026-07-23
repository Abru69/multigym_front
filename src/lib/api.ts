import { getTenantFromLocation } from './tenant'
import type {
  ResponseDTO,
  ProductDTO,
  ExerciseDTO,
  WorkoutDTO,
  TenantDTO,
  TenantPaymentDTO,
  TenantRenewalInfoDTO,
  TenantRenewalPaymentRequest,
  TenantRenewalResultDTO,
  MercadoPagoTenantConfigDTO,
  MercadoPagoTenantConfigRequest,
  MercadoPagoOAuthConnectDTO,
  PlatformMercadoPagoStatusDTO,
  PlatformMercadoPagoConfigDTO,
  PlatformMercadoPagoConfigRequest,
  ExerciseCatalogDTO,
  ExerciseCatalogFacetsDTO,
  ExerciseLibraryItemDTO,
  TenantSummaryDTO,
  SaasPlanDTO,
  TenantRequestDTO,
  PlatformUserDTO,
  PlatformUserRequestDTO,
  AuditLogDTO,
  PaginatedResult,
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
  MemberListItemDTO,
  MemberRequest,
  SaasPlanRequest,
  SubscriptionPlanChangeRequest,
  OrderRequest,
  OrderStatusRequest,
  ManualRefundRequest,
  WorkoutRequest,
  WorkoutExerciseRequest,
  HealthDTO,
  ReadinessDTO,
  UserDTO,
  NutritionPlanDTO,
  NutritionPlanRequest,
  TenantUserRequest,
  ProductRequest,
  CheckInDTO,
  CheckInRequest,
  CheckInStatsDTO,
  AnnouncementDTO,
  AnnouncementRequest,
  TenantDashboardDTO,
  MemberReportDTO,
  SubscriptionReportDTO,
  CheckInReportDTO,
  ProductReportDTO,
  AnnouncementReportDTO,
  WorkoutReportDTO,
  PlatformDashboardDTO,
  TenantHealthDTO,
  PlatformAnalyticsDTO,
  MrrReportDTO,
  ChurnRetentionDTO,
  PlanAnalyticsDTO,
  FailedPaymentReportDTO,
} from '@/types'

export async function fetchApi<T>(
  url: string,
  options: RequestInit & {
    skipAuthRedirect?: boolean
    skipAuthHeader?: boolean
    retryAuth?: boolean
  } = {}
): Promise<T> {
  const { skipAuthRedirect, skipAuthHeader, retryAuth, ...fetchOptions } = options
  const isPlatformRequest =
    url.startsWith('/platform/') ||
    url.startsWith('/platform-api/') ||
    url.startsWith('/api/tenants') ||
    url.startsWith('/api/saas-plans') ||
    url.startsWith('/api/platform-settings') ||
    url.startsWith('/api/audits') ||
    url.startsWith('/api/platform/')
  // Las llamadas de auth (login, reset) y de branding no deben disparar el
  // redirect destructivo de 401: el llamador maneja el error.
  const isAuthOrBrandingCall =
    url.startsWith('/api/auth/') ||
    url.startsWith('/api/public/tenant-branding') ||
    url.startsWith('/api/public/tenants/') ||
    url.startsWith('/api/announcements/active') ||
    url.startsWith('/api/tenant-settings') ||
    url.startsWith('/platform/auth/')
  const suppressRedirect = skipAuthRedirect || isAuthOrBrandingCall
  let token = ''

  if (isPlatformRequest) {
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
  } else {
    const tenantData = localStorage.getItem('auth-storage')
    if (tenantData) {
      try {
        const parsed = JSON.parse(tenantData)
        if (parsed.state && parsed.state.token && parsed.state.token !== 'fake-token') {
          token = parsed.state.token
        }
      } catch (e) {
        console.error('Failed to parse auth-storage', e)
      }
    }
  }

  const headers = new Headers(options.headers)
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !skipAuthHeader) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!isPlatformRequest) {
    const tenantId = getTenantFromLocation()
    if (tenantId && !headers.has('X-Tenant-ID')) {
      headers.set('X-Tenant-ID', tenantId)
    }
  }

  const response = await fetch(url, { ...fetchOptions, headers })

  if (response.status === 401) {
    if (suppressRedirect) {
      // No destruir la sesión ni redirigir: el llamador maneja el error
      // (p.ej. login con credenciales incorrectas, o fetch de branding sin token).
      throw new Error('No autorizado')
    }

    if (!isPlatformRequest && !retryAuth && token) {
      const refreshedToken = await tryRefreshToken(token)
      if (refreshedToken) {
        return fetchApi<T>(url, { ...options, retryAuth: true })
      }
    }

    if (isPlatformRequest) {
      localStorage.removeItem('platform-auth')
      window.location.href = '/platform/login'
    } else {
      const hasPlatformToken = !!localStorage.getItem('platform-auth')
      localStorage.removeItem('auth-storage')
      if (hasPlatformToken) {
        window.location.href = '/platform/login'
      } else {
        window.location.href = '/login'
      }
    }
    throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.')
  }

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

async function tryRefreshToken(token: string): Promise<string | null> {
  try {
    const headers = new Headers({ Authorization: `Bearer ${token}` })
    const tenantId = getTenantFromLocation()
    if (tenantId) headers.set('X-Tenant-ID', tenantId)

    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers,
    })
    if (!response.ok) return null

    const body = (await response.json()) as ResponseDTO<{
      accessToken: string
      type: string
      expiresIn: number
      tenantId: string
      role: string
    }>
    const nextToken = body.dto?.accessToken
    if (!nextToken) return null

    const stored = localStorage.getItem('auth-storage')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    parsed.state = { ...parsed.state, token: nextToken, isAuthenticated: true }
    localStorage.setItem('auth-storage', JSON.stringify(parsed))
    return nextToken
  } catch {
    return null
  }
}

export const getProducts = (params?: { name?: string; page?: number; size?: number }) => {
  const q = new URLSearchParams()
  if (params?.name) q.set('name', params.name)
  if (params?.page !== undefined) q.set('page', String(params.page))
  if (params?.size !== undefined) q.set('size', String(params.size))
  const qs = q.toString()
  return fetchApi<ResponseDTO<PaginatedResult<ProductDTO>>>(`/api/products${qs ? '?' + qs : ''}`)
}
export const createProduct = (data: ProductRequest) =>
  fetchApi<ResponseDTO<ProductDTO>>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getExercises = () =>
  fetchApi<ResponseDTO<PaginatedResult<ExerciseDTO>>>('/api/exercises')
export const createExercise = (data: Partial<ExerciseDTO>) =>
  fetchApi<ResponseDTO<ExerciseDTO>>('/api/exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getExerciseCatalog = (params?: {
  name?: string
  bodyPart?: string
  muscleGroup?: string
  equipment?: string
  target?: string
  lang?: string
  page?: number
  size?: number
}) => {
  const q = new URLSearchParams()
  q.set('lang', params?.lang || 'es')
  if (params?.name) q.set('name', params.name)
  if (params?.bodyPart) q.set('bodyPart', params.bodyPart)
  if (params?.muscleGroup) q.set('muscleGroup', params.muscleGroup)
  if (params?.equipment) q.set('equipment', params.equipment)
  if (params?.target) q.set('target', params.target)
  if (params?.page !== undefined) q.set('page', String(params.page))
  if (params?.size !== undefined) q.set('size', String(params.size))
  const qs = q.toString()
  return fetchApi<ResponseDTO<PaginatedResult<ExerciseCatalogDTO>>>(
    `/api/exercise-catalog${qs ? '?' + qs : ''}`
  )
}

export const getExerciseCatalogFacets = (params?: { lang?: string }) => {
  const q = new URLSearchParams()
  q.set('lang', params?.lang || 'es')
  return fetchApi<ResponseDTO<ExerciseCatalogFacetsDTO>>(`/api/exercise-catalog/facets?${q.toString()}`)
}

export const getExerciseLibrary = (params?: { name?: string; muscleGroup?: string; size?: number; lang?: string }) => {
  const q = new URLSearchParams()
  q.set('lang', params?.lang || 'es')
  if (params?.name) q.set('name', params.name)
  if (params?.muscleGroup) q.set('muscleGroup', params.muscleGroup)
  if (params?.size !== undefined) q.set('size', String(params.size))
  const qs = q.toString()
  return fetchApi<ResponseDTO<ExerciseLibraryItemDTO[]>>(`/api/exercise-library${qs ? '?' + qs : ''}`)
}

export const updateExerciseCatalogTranslation = (
  id: string,
  data: { nameEs?: string | null; nameEn?: string | null }
) =>
  fetchApi<ResponseDTO<ExerciseCatalogDTO>>(`/api/platform/exercise-catalog/${id}/translation?lang=es`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const getWorkouts = (params?: {
  title?: string
  memberId?: string
  page?: number
  size?: number
}) => {
  const q = new URLSearchParams()
  if (params?.title) q.set('title', params.title)
  if (params?.memberId) q.set('memberId', params.memberId)
  if (params?.page !== undefined) q.set('page', String(params.page))
  if (params?.size !== undefined) q.set('size', String(params.size))
  const qs = q.toString()
  return fetchApi<ResponseDTO<PaginatedResult<WorkoutDTO>>>(`/api/workouts${qs ? '?' + qs : ''}`)
}
export const createWorkout = (data: {
  memberId: string
  title: string
  startsAt: string
  endsAt: string
}) =>
  fetchApi<ResponseDTO<WorkoutDTO>>('/api/workouts', { method: 'POST', body: JSON.stringify(data) })
export const deleteWorkout = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/workouts/${id}`, { method: 'DELETE' })

export const activateAccount = (data: { token: string; newPassword?: string }) =>
  fetchApi<ResponseDTO<unknown>>('/api/tenant/users/activate-account', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const logout = (token?: string, tenantId?: string | null) =>
  fetchApi<ResponseDTO<unknown>>('/api/auth/logout', {
    method: 'POST',
    skipAuthRedirect: true,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
    },
  })

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
  fetchApi<ResponseDTO<TenantBillingSummaryDTO[]>>('/api/tenants/billing-summaries')

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

// --- Plans ---
export const getPlans = () => fetchApi<ResponseDTO<PaginatedResult<PlanListItemDTO>>>('/api/plans')
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
  fetchApi<ResponseDTO<SubscriptionListItemDTO[]>>(`/api/subscriptions/member/${memberId}`)

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
  fetchApi<ResponseDTO<PaymentListItemDTO[]>>(`/api/payments/subscription/${subscriptionId}`)

// --- Workout Exercises ---
export const getWorkoutExercises = (workoutId: string) =>
  fetchApi<ResponseDTO<PaginatedResult<WorkoutExerciseListItemDTO>>>(
    `/api/workout-exercises/${workoutId}`
  )
export const createWorkoutExercise = (data: {
  workoutId: string
  exerciseId?: string
  catalogExerciseId?: string
  dayOfWeek?: string
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
  data: Partial<WorkoutExerciseRequest> & { workoutId: string }
) =>
  fetchApi<ResponseDTO<WorkoutExerciseListItemDTO>>(`/api/workout-exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteWorkoutExercise = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/workout-exercises/${id}`, { method: 'DELETE' })

// --- Workout Logs ---
export const getWorkoutLogs = (workoutId: string) =>
  fetchApi<ResponseDTO<PaginatedResult<WorkoutLogListItemDTO>>>(`/api/workout-logs/${workoutId}`)
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
  fetchApi<ResponseDTO<RevenueReportDTO[]>>(`/api/tenants/${tenantId}/billing/revenue`)

export const getPlatformSettings = () =>
  fetchApi<ResponseDTO<PlatformSettingDTO[]>>('/api/platform-settings')

export const updatePlatformSettings = (entries: Record<string, string>) =>
  fetchApi<ResponseDTO<PlatformSettingDTO[]>>('/api/platform-settings', {
    method: 'PUT',
    body: JSON.stringify({ entries }),
  })

// --- Branches ---
export const getBranches = () => fetchApi<ResponseDTO<BranchDTO[]>>('/api/branches')

// --- Tenant Settings ---
export const getTenantSettings = () =>
  fetchApi<ResponseDTO<TenantSettingDTO[]>>('/api/tenant-settings')

export const updateTenantSettings = (entries: Record<string, string>) =>
  fetchApi<ResponseDTO<TenantSettingDTO>>('/api/tenant-settings', {
    method: 'PUT',
    body: JSON.stringify({ entries }),
  })

export const uploadTenantLogo = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return fetchApi<ResponseDTO<{ logoUrl: string }>>('/api/tenant/logo', {
    method: 'PATCH',
    body: formData,
  })
}

export const uploadMyAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return fetchApi<ResponseDTO<UserDTO>>('/api/tenant/users/me/avatar', {
    method: 'PATCH',
    body: formData,
  })
}

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

export const retryOrderRefund = (orderId: string) =>
  fetchApi<ResponseDTO<OrderDTO>>(`/api/orders/${orderId}/refund/retry`, {
    method: 'PATCH',
  })

export const markOrderRefunded = (orderId: string, data: ManualRefundRequest = {}) =>
  fetchApi<ResponseDTO<OrderDTO>>(`/api/orders/${orderId}/refund/mark-refunded`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

// --- Health ---
export const getHealth = () => fetchApi<ResponseDTO<HealthDTO>>('/api/health')
export const getReadiness = () => fetchApi<ResponseDTO<ReadinessDTO>>('/api/readiness')

// --- Members ---
export const getMembers = () =>
  fetchApi<ResponseDTO<PaginatedResult<MemberListItemDTO>>>('/api/members')
export const getMemberById = (id: string) =>
  fetchApi<ResponseDTO<MemberListItemDTO>>(`/api/members/${id}`)
export const createMember = (data: MemberRequest) =>
  fetchApi<ResponseDTO<MemberListItemDTO>>('/api/members', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateMember = (id: string, data: MemberRequest) =>
  fetchApi<ResponseDTO<MemberListItemDTO>>(`/api/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteMember = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/members/${id}`, { method: 'DELETE' })

// --- Exercises (detail) ---
export const getExerciseById = (id: string) =>
  fetchApi<ResponseDTO<ExerciseDTO>>(`/api/exercises/${id}`)

// --- Workouts (detail + update) ---
export const getWorkoutById = (id: string) =>
  fetchApi<ResponseDTO<WorkoutDTO>>(`/api/workouts/${id}`)
export const updateWorkout = (id: string, data: WorkoutRequest) =>
  fetchApi<ResponseDTO<WorkoutDTO>>(`/api/workouts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

// --- Workout Exercises (detail) ---
export const getWorkoutExerciseDetail = (id: string) =>
  fetchApi<ResponseDTO<WorkoutExerciseListItemDTO>>(`/api/workout-exercises/detail/${id}`)

// --- Workout Logs (delete) ---
export const deleteWorkoutLog = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/workout-logs/${id}`, { method: 'DELETE' })

// --- Subscriptions (update, plan change, delete, detail, expired) ---
export const updateSubscription = (
  id: string,
  data: { memberId: string; planId: string; startDate: string; endDate: string }
) =>
  fetchApi<ResponseDTO<SubscriptionListItemDTO>>(`/api/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const changeSubscriptionPlan = (id: string, data: SubscriptionPlanChangeRequest) =>
  fetchApi<ResponseDTO<SubscriptionListItemDTO>>(`/api/subscriptions/${id}/plan`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
export const deleteSubscription = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/subscriptions/${id}`, { method: 'DELETE' })
export const getSubscriptionById = (id: string) =>
  fetchApi<ResponseDTO<SubscriptionListItemDTO>>(`/api/subscriptions/${id}`)
export const getExpiredSubscriptions = () =>
  fetchApi<ResponseDTO<SubscriptionListItemDTO[]>>('/api/subscriptions/expired')

// --- Payments (update, delete, detail) ---
export const updatePayment = (
  id: string,
  data: { subscriptionId: string; amount: number; paymentMethod: string; reference?: string }
) =>
  fetchApi<ResponseDTO<PaymentListItemDTO>>(`/api/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deletePayment = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/payments/${id}`, { method: 'DELETE' })
export const getPaymentById = (id: string) =>
  fetchApi<ResponseDTO<PaymentListItemDTO>>(`/api/payments/${id}`)

// --- Orders (list, my, detail, update, status, delete) ---
export const getOrders = (params?: {
  status?: string
  userId?: string
  page?: number
  size?: number
}) => {
  const q = new URLSearchParams()
  if (params?.status) q.set('status', params.status)
  if (params?.userId) q.set('userId', params.userId)
  if (params?.page !== undefined) q.set('page', String(params.page))
  if (params?.size !== undefined) q.set('size', String(params.size))
  const qs = q.toString()
  return fetchApi<ResponseDTO<PaginatedResult<OrderDTO>>>(`/api/orders${qs ? '?' + qs : ''}`)
}
export const getMyOrders = () => fetchApi<ResponseDTO<PaginatedResult<OrderDTO>>>('/api/orders/my')
export const getOrderById = (id: string) => fetchApi<ResponseDTO<OrderDTO>>(`/api/orders/${id}`)
export const updateOrder = (id: string, data: OrderRequest) =>
  fetchApi<ResponseDTO<OrderDTO>>(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const updateOrderStatus = (id: string, data: OrderStatusRequest) =>
  fetchApi<ResponseDTO<OrderDTO>>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
export const deleteOrder = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/orders/${id}`, { method: 'DELETE' })

// --- SaaS Plans (detail, create, update, delete, toggle) ---
export const getSaasPlanById = (id: string) =>
  fetchApi<ResponseDTO<SaasPlanDTO>>(`/api/saas-plans/${id}`)
export const createSaasPlan = (data: SaasPlanRequest) =>
  fetchApi<ResponseDTO<SaasPlanDTO>>('/api/saas-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateSaasPlan = (id: string, data: SaasPlanRequest) =>
  fetchApi<ResponseDTO<SaasPlanDTO>>(`/api/saas-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteSaasPlan = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/saas-plans/${id}`, { method: 'DELETE' })
export const toggleSaasPlanStatus = (id: string) =>
  fetchApi<ResponseDTO<SaasPlanDTO>>(`/api/saas-plans/${id}/status`, { method: 'PATCH' })

// --- Tenants (detail, expired) ---
export const getTenantById = (tenantId: string) =>
  fetchApi<ResponseDTO<TenantDTO>>(`/api/tenants/${tenantId}`)
export const getExpiredTenants = () => fetchApi<ResponseDTO<TenantDTO[]>>('/api/tenants/expired')
export const getTenantRenewalInfo = (tenantId: string) =>
  fetchApi<ResponseDTO<TenantRenewalInfoDTO>>(`/api/public/tenants/${tenantId}/renewal-info`, {
    skipAuthRedirect: true,
  })
export const getTenantRenewalPayments = (tenantId: string) =>
  fetchApi<ResponseDTO<TenantPaymentDTO[]>>(`/api/tenants/${tenantId}/renewal/payments`)
export const simulateTenantRenewalPayment = (tenantId: string) =>
  fetchApi<ResponseDTO<TenantRenewalResultDTO>>(
    `/api/tenants/${tenantId}/renewal/simulate-payment`,
    { method: 'POST' }
  )
export const processTenantRenewalMercadoPagoPayment = (
  tenantId: string,
  data: TenantRenewalPaymentRequest
) =>
  fetchApi<ResponseDTO<TenantRenewalResultDTO>>(
    `/api/tenants/${tenantId}/renewal/mercadopago-payment`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )

export const getTenantBillingRenewalInfo = () =>
  fetchApi<ResponseDTO<TenantRenewalInfoDTO>>('/api/tenant/billing/renewal-info')

export const getTenantBillingPayments = () =>
  fetchApi<ResponseDTO<TenantPaymentDTO[]>>('/api/tenant/billing/payments')

export const processTenantBillingRenewalMercadoPagoPayment = (data: TenantRenewalPaymentRequest) =>
  fetchApi<ResponseDTO<TenantRenewalResultDTO>>('/api/tenant/billing/renewal/mercadopago-payment', {
    method: 'POST',
    body: JSON.stringify(data),
  })

// --- Mercado Pago tenant config ---
export const getMercadoPagoConfig = () =>
  fetchApi<ResponseDTO<MercadoPagoTenantConfigDTO>>('/api/mercadopago/config')

export const saveMercadoPagoConfig = (data: MercadoPagoTenantConfigRequest) =>
  fetchApi<ResponseDTO<MercadoPagoTenantConfigDTO>>('/api/mercadopago/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const startMercadoPagoOAuthConnect = () =>
  fetchApi<ResponseDTO<MercadoPagoOAuthConnectDTO>>('/api/mercadopago/oauth/connect', {
    method: 'POST',
  })

export const refreshMercadoPagoOAuth = () =>
  fetchApi<ResponseDTO<MercadoPagoTenantConfigDTO>>('/api/mercadopago/oauth/refresh', {
    method: 'POST',
  })

export const disconnectMercadoPagoOAuth = () =>
  fetchApi<ResponseDTO<MercadoPagoTenantConfigDTO>>('/api/mercadopago/oauth/disconnect', {
    method: 'POST',
  })

export const getPlatformMercadoPagoStatus = () =>
  fetchApi<ResponseDTO<PlatformMercadoPagoStatusDTO>>('/api/platform/mercadopago/status')

export const getPlatformMercadoPagoConfig = () =>
  fetchApi<ResponseDTO<PlatformMercadoPagoConfigDTO>>('/api/platform/mercadopago/config')

export const savePlatformMercadoPagoConfig = (data: PlatformMercadoPagoConfigRequest) =>
  fetchApi<ResponseDTO<PlatformMercadoPagoConfigDTO>>('/api/platform/mercadopago/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const getTenantMercadoPagoConfig = (tenantId: string) =>
  fetchApi<ResponseDTO<MercadoPagoTenantConfigDTO>>(`/api/tenants/${tenantId}/mercadopago/config`)

export const saveTenantMercadoPagoConfig = (
  tenantId: string,
  data: MercadoPagoTenantConfigRequest
) =>
  fetchApi<ResponseDTO<MercadoPagoTenantConfigDTO>>(`/api/tenants/${tenantId}/mercadopago/config`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const disableTenantMercadoPago = (tenantId: string) =>
  fetchApi<ResponseDTO<MercadoPagoTenantConfigDTO>>(
    `/api/tenants/${tenantId}/mercadopago/disable`,
    { method: 'POST' }
  )

// --- Branches (detail) ---
export const getBranchById = (id: string) => fetchApi<ResponseDTO<BranchDTO>>(`/api/branches/${id}`)

// --- Tenant Users (detail) ---
export const getTenantUserById = (userId: string) =>
  fetchApi<ResponseDTO<UserDTO>>(`/api/tenant/users/${userId}`)

export const createTenantUser = (data: TenantUserRequest) =>
  fetchApi<ResponseDTO<UserDTO>>('/api/tenant/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateTenantUser = (userId: string, data: TenantUserRequest) =>
  fetchApi<ResponseDTO<UserDTO>>(`/api/tenant/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const toggleTenantUserStatus = (userId: string) =>
  fetchApi<ResponseDTO<UserDTO>>(`/api/tenant/users/${userId}/status`, { method: 'PATCH' })

export const deleteTenantUser = (userId: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/tenant/users/${userId}`, { method: 'DELETE' })

// --- Client Members (excludes admins) ---
export const getClientUsers = () =>
  fetchApi<ResponseDTO<PaginatedResult<UserDTO>>>(
    '/api/tenant/users?role=CLIENT&isActive=true&size=9999'
  )

// --- Nutrition Plans ---
export const getNutritionPlans = (params?: { search?: string; page?: number; size?: number }) => {
  const q = new URLSearchParams()
  if (params?.search) q.set('search', params.search)
  if (params?.page !== undefined) q.set('page', String(params.page))
  if (params?.size !== undefined) q.set('size', String(params.size))
  const qs = q.toString()
  return fetchApi<ResponseDTO<PaginatedResult<NutritionPlanDTO>>>(
    `/api/nutrition${qs ? '?' + qs : ''}`
  )
}
export const getNutritionPlanByMember = (memberId: string) =>
  fetchApi<ResponseDTO<NutritionPlanDTO>>(`/api/nutrition/member/${memberId}`)
export const getMyNutritionPlan = () => fetchApi<ResponseDTO<NutritionPlanDTO>>('/api/nutrition/my')
export const createNutritionPlan = (data: NutritionPlanRequest) =>
  fetchApi<ResponseDTO<NutritionPlanDTO>>('/api/nutrition', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateNutritionPlan = (id: string, data: NutritionPlanRequest) =>
  fetchApi<ResponseDTO<NutritionPlanDTO>>(`/api/nutrition/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteNutritionPlan = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/nutrition/${id}`, { method: 'DELETE' })
export const assignNutritionPlan = (planId: string, memberId: string) =>
  fetchApi<ResponseDTO<NutritionPlanDTO>>(`/api/nutrition/${planId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ memberId }),
  })

// --- Check-Ins ---
export const checkIn = (data: CheckInRequest) =>
  fetchApi<ResponseDTO<CheckInDTO>>('/api/check-ins', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const checkOut = (id: string) =>
  fetchApi<ResponseDTO<CheckInDTO>>(`/api/check-ins/${id}/checkout`, { method: 'PATCH' })
export const getCheckIns = (params?: {
  memberId?: string
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
}) => {
  const q = new URLSearchParams()
  if (params?.memberId) q.set('memberId', params.memberId)
  if (params?.fromDate) q.set('fromDate', params.fromDate)
  if (params?.toDate) q.set('toDate', params.toDate)
  if (params?.page !== undefined) q.set('page', String(params.page))
  if (params?.size !== undefined) q.set('size', String(params.size))
  const qs = q.toString()
  return fetchApi<ResponseDTO<PaginatedResult<CheckInDTO>>>(`/api/check-ins${qs ? '?' + qs : ''}`)
}
export const getCheckInsByMember = (memberId: string) =>
  fetchApi<ResponseDTO<CheckInDTO[]>>(`/api/check-ins/member/${memberId}`)
export const getActiveCheckIns = () => fetchApi<ResponseDTO<CheckInDTO[]>>('/api/check-ins/active')
export const getOccupancy = () => fetchApi<ResponseDTO<number>>('/api/check-ins/occupancy')
export const getCheckInStats = () => fetchApi<ResponseDTO<CheckInStatsDTO>>('/api/check-ins/stats')

// --- Announcements ---
export const getAnnouncements = (params?: {
  position?: string
  active?: boolean
  search?: string
  page?: number
  size?: number
}) => {
  const q = new URLSearchParams()
  if (params?.position) q.set('position', params.position)
  if (params?.active !== undefined) q.set('active', String(params.active))
  if (params?.search) q.set('search', params.search)
  if (params?.page !== undefined) q.set('page', String(params.page))
  if (params?.size !== undefined) q.set('size', String(params.size))
  const qs = q.toString()
  return fetchApi<ResponseDTO<PaginatedResult<AnnouncementDTO>>>(
    `/api/announcements${qs ? '?' + qs : ''}`
  )
}
export const getActiveAnnouncements = () =>
  fetchApi<ResponseDTO<AnnouncementDTO[]>>('/api/announcements/active', { skipAuthRedirect: true })
export const getActiveAnnouncementsByPosition = (position: string) =>
  fetchApi<ResponseDTO<AnnouncementDTO[]>>(`/api/announcements/active/${position}`, {
    skipAuthRedirect: true,
  })
export const getAnnouncementById = (id: string) =>
  fetchApi<ResponseDTO<AnnouncementDTO>>(`/api/announcements/${id}`)
export const createAnnouncement = (data: AnnouncementRequest) =>
  fetchApi<ResponseDTO<AnnouncementDTO>>('/api/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateAnnouncement = (id: string, data: AnnouncementRequest) =>
  fetchApi<ResponseDTO<AnnouncementDTO>>(`/api/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteAnnouncement = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/announcements/${id}`, { method: 'DELETE' })
export const trackAnnouncementView = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/announcements/${id}/view`, {
    method: 'PATCH',
    skipAuthRedirect: true,
  })
export const trackAnnouncementClick = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/announcements/${id}/click`, {
    method: 'PATCH',
    skipAuthRedirect: true,
  })

// --- Tenant Reports ---
export const getTenantDashboardReport = () =>
  fetchApi<ResponseDTO<TenantDashboardDTO>>('/api/reports/dashboard')
export const getRevenueReportData = (params?: { fromDate?: string; toDate?: string }) => {
  const q = new URLSearchParams()
  if (params?.fromDate) q.set('fromDate', params.fromDate)
  if (params?.toDate) q.set('toDate', params.toDate)
  const qs = q.toString()
  return fetchApi<ResponseDTO<RevenueReportDTO>>(`/api/reports/revenue${qs ? '?' + qs : ''}`)
}
export const getMemberReport = () => fetchApi<ResponseDTO<MemberReportDTO>>('/api/reports/members')
export const getSubscriptionReport = () =>
  fetchApi<ResponseDTO<SubscriptionReportDTO>>('/api/reports/subscriptions')
export const getCheckInReport = () =>
  fetchApi<ResponseDTO<CheckInReportDTO>>('/api/reports/check-ins')
export const getProductReport = () =>
  fetchApi<ResponseDTO<ProductReportDTO>>('/api/reports/products')
export const getAnnouncementReport = () =>
  fetchApi<ResponseDTO<AnnouncementReportDTO>>('/api/reports/announcements')
export const getWorkoutReport = () =>
  fetchApi<ResponseDTO<WorkoutReportDTO>>('/api/reports/workouts')

// --- Branches (CRUD) ---
export const createBranch = (data: { name: string; address?: string; phone?: string }) =>
  fetchApi<ResponseDTO<BranchDTO>>('/api/branches', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const updateBranch = (
  id: string,
  data: { name: string; address?: string; phone?: string; isActive?: boolean }
) =>
  fetchApi<ResponseDTO<BranchDTO>>(`/api/branches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
export const deleteBranch = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/branches/${id}`, { method: 'DELETE' })

// --- Platform Reports ---
export const getPlatformDashboardReport = () =>
  fetchApi<ResponseDTO<PlatformDashboardDTO>>('/api/platform/reports/dashboard')
export const getTenantsHealth = () =>
  fetchApi<ResponseDTO<TenantHealthDTO[]>>('/api/platform/reports/tenants/health')

// --- Platform Analytics (Etapa 6) ---
export const getPlatformAnalytics = () =>
  fetchApi<ResponseDTO<PlatformAnalyticsDTO>>('/api/platform/reports/analytics')
export const getMrrReport = () => fetchApi<ResponseDTO<MrrReportDTO>>('/api/platform/reports/mrr')
export const getChurnRetention = () =>
  fetchApi<ResponseDTO<ChurnRetentionDTO>>('/api/platform/reports/churn-retention')
export const getPlanAnalytics = () =>
  fetchApi<ResponseDTO<PlanAnalyticsDTO[]>>('/api/platform/reports/plan-analytics')
export const getFailedPayments = () =>
  fetchApi<ResponseDTO<FailedPaymentReportDTO>>('/api/platform/reports/failed-payments')
export const exportPlatformDashboard = async (format: string): Promise<Blob> => {
  const url = `/api/platform/reports/dashboard/export?format=${format}`
  const platformData = localStorage.getItem('platform-auth')
  let token = ''
  if (platformData) {
    try {
      token = JSON.parse(platformData).state?.token || ''
    } catch {
      /* ignore */
    }
  }
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new Error('Export failed')
  return response.blob()
}
export const exportPlatformAnalytics = async (format: string): Promise<Blob> => {
  const url = `/api/platform/reports/analytics/export?format=${format}`
  const platformData = localStorage.getItem('platform-auth')
  let token = ''
  if (platformData) {
    try {
      token = JSON.parse(platformData).state?.token || ''
    } catch {
      /* ignore */
    }
  }
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) throw new Error('Export failed')
  return response.blob()
}
