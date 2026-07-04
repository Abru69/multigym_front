import { create } from 'zustand'
import { getAudits } from '@/lib/api'
import type { AuditLogDTO, PaginatedResult } from '@/types'

interface AuditFilters {
  action: string
  entityName: string
  tenantId: string
  fromDate: string
  toDate: string
}

interface PlatformLogsStore {
  logs: AuditLogDTO[]
  pagination: Pick<
    PaginatedResult<AuditLogDTO>,
    'page' | 'size' | 'totalElements' | 'totalPages' | 'first' | 'last'
  >
  filters: AuditFilters
  isLoading: boolean
  error: string | null
  loadLogs: () => Promise<void>
  setFilter: <K extends keyof AuditFilters>(key: K, value: AuditFilters[K]) => void
  clearFilters: () => void
  setPage: (page: number) => void
}

const DEFAULT_FILTERS: AuditFilters = {
  action: '',
  entityName: '',
  tenantId: '',
  fromDate: '',
  toDate: '',
}

const DEFAULT_PAGINATION = {
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
}

export const usePlatformLogsStore = create<PlatformLogsStore>()((set, get) => ({
  logs: [],
  pagination: DEFAULT_PAGINATION,
  filters: DEFAULT_FILTERS,
  isLoading: false,
  error: null,

  loadLogs: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters, pagination } = get()
      const response = await getAudits({
        action: filters.action || undefined,
        entityName: filters.entityName || undefined,
        tenantId: filters.tenantId || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        page: pagination.page,
        size: pagination.size,
      })
      const result = response?.dto
      if (result) {
        set({
          logs: result.data || [],
          pagination: {
            page: result.page,
            size: result.size,
            totalElements: result.totalElements,
            totalPages: result.totalPages,
            first: result.first,
            last: result.last,
          },
          isLoading: false,
        })
      } else {
        set({ logs: [], isLoading: false })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar auditoría'
      set({ error: message, isLoading: false })
    }
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 0 },
    }))
  },

  clearFilters: () => {
    set({ filters: DEFAULT_FILTERS, pagination: { ...get().pagination, page: 0 } })
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }))
  },
}))
