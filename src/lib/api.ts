import { getTenantFromSubdomain } from './tenant'
import type { ResponseDTO, ProductDTO, ExerciseDTO, WorkoutDTO } from '@/types'

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

  const tenantId = getTenantFromSubdomain()
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

export const getProducts = () => fetchApi<ResponseDTO<ProductDTO>>('/api/products')
export const createProduct = (data: Partial<ProductDTO>) =>
  fetchApi<ResponseDTO<ProductDTO>>('/api/products', { method: 'POST', body: JSON.stringify(data) })

export const getExercises = () => fetchApi<ResponseDTO<ExerciseDTO>>('/api/exercises')
export const createExercise = (data: Partial<ExerciseDTO>) =>
  fetchApi<ResponseDTO<ExerciseDTO>>('/api/exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const getWorkouts = () => fetchApi<ResponseDTO<WorkoutDTO>>('/api/workouts')
export const createWorkout = (data: Partial<WorkoutDTO>) =>
  fetchApi<ResponseDTO<WorkoutDTO>>('/api/workouts', { method: 'POST', body: JSON.stringify(data) })
export const deleteWorkout = (id: string) =>
  fetchApi<ResponseDTO<unknown>>(`/api/workouts/${id}`, { method: 'DELETE' })

export const activateAccount = (data: { token: string; newPassword?: string }) =>
  fetchApi<ResponseDTO<unknown>>('/api/tenant/user/activate-account', {
    method: 'POST',
    body: JSON.stringify(data),
  })
