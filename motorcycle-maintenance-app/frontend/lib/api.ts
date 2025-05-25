// frontend/lib/api.ts
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

console.log('Environment:', process.env.NODE_ENV)
console.log('NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL)
console.log('API_BASE_URL resolved to:', API_BASE_URL)

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor for debugging
apiClient.interceptors.request.use((config) => {
  console.log('Making request to:', (config.baseURL ?? '') + config.url)
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response?.data,
      status: error.response?.status
    })
    return Promise.reject(error)
  }
)

// Test function
export const testApi = {
  health: () => apiClient.get('/health'),
  test: () => apiClient.get('/test'),
}

// Motorcycle API
export const motorcycleApi = {
  getAll: (includeArchived = false) => 
    apiClient.get(`/motorcycles?include_archived=${includeArchived}`),
  
  getById: (id: number) => 
    apiClient.get(`/motorcycles/${id}`),
  
  create: (data: any) => 
    apiClient.post('/motorcycles', data),
  
  update: (id: number, data: any) => 
    apiClient.put(`/motorcycles/${id}`, data),
  
  delete: (id: number) => 
    apiClient.delete(`/motorcycles/${id}`),
  
  updateMileage: (id: number, mileage: number) => 
    apiClient.post(`/motorcycles/${id}/mileage`, { new_mileage: mileage }),
}

// Dashboard API
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getMaintenanceDue: (daysAhead = 60) => apiClient.get(`/dashboard/maintenance-due?days_ahead=${daysAhead}`),
}

// Maintenance API
export const maintenanceApi = {
  getAll: (motorcycleId?: number) => {
    const params = motorcycleId ? `?motorcycle_id=${motorcycleId}` : ''
    return apiClient.get(`/maintenance${params}`)
  },
  
  getById: (id: number) => 
    apiClient.get(`/maintenance/${id}`),
  
  create: (data: any) => 
    apiClient.post('/maintenance', data),
  
  update: (id: number, data: any) => 
    apiClient.put(`/maintenance/${id}`, data),
  
  delete: (id: number) => 
    apiClient.delete(`/maintenance/${id}`),
  
  getUpcoming: (motorcycleId?: number) => {
    const params = motorcycleId ? `?motorcycle_id=${motorcycleId}` : ''
    return apiClient.get(`/maintenance/upcoming${params}`)
  },
  
  bulkComplete: (ids: number[]) => 
    apiClient.post('/maintenance/bulk-complete', { maintenance_ids: ids }),
}

// Parts API
export const partsApi = {
  getAll: (motorcycleId?: number) => {
    const params = motorcycleId ? `?motorcycle_id=${motorcycleId}` : ''
    return apiClient.get(`/parts${params}`)
  },
  
  getById: (id: number) => 
    apiClient.get(`/parts/${id}`),
  
  create: (data: any) => 
    apiClient.post('/parts', data),
  
  update: (id: number, data: any) => 
    apiClient.put(`/parts/${id}`, data),
  
  delete: (id: number) => 
    apiClient.delete(`/parts/${id}`),
}

// Logs API
export const logsApi = {
  getAll: (motorcycleId?: number) => {
    const params = motorcycleId ? `?motorcycle_id=${motorcycleId}` : ''
    return apiClient.get(`/logs${params}`)
  },
  
  getById: (id: number) => 
    apiClient.get(`/logs/${id}`),
  
  create: (data: any) => 
    apiClient.post('/logs', data),
  
  update: (id: number, data: any) => 
    apiClient.put(`/logs/${id}`, data),
  
  delete: (id: number) => 
    apiClient.delete(`/logs/${id}`),
}

// Webhooks API
export const webhooksApi = {
  getAll: () => 
    apiClient.get('/webhooks'),
  
  getById: (id: number) => 
    apiClient.get(`/webhooks/${id}`),
  
  create: (data: any) => 
    apiClient.post('/webhooks', data),
  
  update: (id: number, data: any) => 
    apiClient.put(`/webhooks/${id}`, data),
  
  delete: (id: number) => 
    apiClient.delete(`/webhooks/${id}`),
  
  test: (id: number) => 
    apiClient.post(`/webhooks/${id}/test`),
}

export default apiClient

// Extended Parts API
export const partsApiExtended = {
  ...partsApi,
  
  use: (id: number, quantity: number) => 
    apiClient.post(`/parts/${id}/use`, { quantity }),
  
  restock: (id: number, quantity: number, unitPrice?: number) => 
    apiClient.post(`/parts/${id}/restock`, { quantity, unit_price: unitPrice }),
  
  getLowStock: (threshold = 5) => 
    apiClient.get(`/parts/low-stock?threshold=${threshold}`),
  
  getByCategory: (motorcycleId: number) => 
    apiClient.get(`/parts/categories/${motorcycleId}`),
}

// Extended Maintenance API
export const maintenanceApiExtended = {
  ...maintenanceApi,
  
  getHistory: (motorcycleId: number, serviceType?: string) => {
    const params = serviceType ? `?service_type=${serviceType}` : ''
    return apiClient.get(`/maintenance/history/${motorcycleId}${params}`)
  },
  
  getCosts: (motorcycleId?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (motorcycleId) params.append('motorcycle_id', motorcycleId.toString())
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/maintenance/costs?${params.toString()}`)
  },
  
  getOverdue: (motorcycleId?: number) => {
    const params = motorcycleId ? `?motorcycle_id=${motorcycleId}` : ''
    return apiClient.get(`/maintenance/overdue${params}`)
  },
}

// Extended Logs API
export const logsApiExtended = {
  ...logsApi,
  
  getSummary: (motorcycleId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/logs/summary/${motorcycleId}?${params.toString()}`)
  },
  
  getFuelStats: (motorcycleId?: number) => {
    const params = motorcycleId ? `?motorcycle_id=${motorcycleId}` : ''
    return apiClient.get(`/logs/fuel/statistics${params}`)
  },
}

// Extended Dashboard API
export const dashboardApiExtended = {
  ...dashboardApi,
  
  getFleetSummary: () => apiClient.get('/dashboard/fleet-summary'),
  
  getMotorcycleOverview: (motorcycleId: number) => 
    apiClient.get(`/dashboard/motorcycle/${motorcycleId}`),
}

// Export/Import API
export const dataApi = {
  exportCsv: (entity: 'motorcycles' | 'maintenance' | 'parts' | 'logs') => 
    apiClient.get(`/export/${entity}/csv`, { responseType: 'blob' }),
  
  exportJson: (entity: 'motorcycles' | 'maintenance' | 'parts' | 'logs') => 
    apiClient.get(`/export/${entity}/json`, { responseType: 'blob' }),
  
  exportPdf: (reportType: 'summary' | 'maintenance' | 'expenses') => 
    apiClient.get(`/export/report/${reportType}`, { responseType: 'blob' }),
  
  importData: (file: File, entity: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entity', entity)
    return apiClient.post('/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

// File upload helper
export const uploadFile = async (file: File, type: 'receipt' | 'photo' | 'document'): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  
  const response = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  return response.data.url
}

// Bulk operations
export const bulkOperations = {
  updateMileage: (updates: Array<{ motorcycleId: number, mileage: number }>) => 
    apiClient.post('/bulk/update-mileage', { updates }),
  
  completeMaintenance: (maintenanceIds: number[]) => 
    apiClient.post('/maintenance/bulk-complete', { maintenance_ids: maintenanceIds }),
  
  archiveMotorcycles: (motorcycleIds: number[]) => 
    apiClient.post('/bulk/archive-motorcycles', { motorcycle_ids: motorcycleIds }),
}

// Search API
export const searchApi = {
  global: (query: string) => 
    apiClient.get(`/search?q=${encodeURIComponent(query)}`),
  
  motorcycles: (query: string) => 
    apiClient.get(`/search/motorcycles?q=${encodeURIComponent(query)}`),
  
  parts: (query: string) => 
    apiClient.get(`/search/parts?q=${encodeURIComponent(query)}`),
  
  maintenance: (query: string) => 
    apiClient.get(`/search/maintenance?q=${encodeURIComponent(query)}`),
}

// Statistics API
export const statisticsApi = {
  getYearlyReport: (year: number) => 
    apiClient.get(`/statistics/yearly/${year}`),
  
  getMonthlyTrends: (months: number = 12) => 
    apiClient.get(`/statistics/trends?months=${months}`),
  
  getServiceTypeStats: () => 
    apiClient.get('/statistics/service-types'),
  
  getExpenseBreakdown: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return apiClient.get(`/statistics/expenses?${params.toString()}`)
  },
}

// Notification preferences
export const notificationApi = {
  getPreferences: () => 
    apiClient.get('/notifications/preferences'),
  
  updatePreferences: (preferences: any) => 
    apiClient.put('/notifications/preferences', preferences),
  
  testNotification: (type: string) => 
    apiClient.post('/notifications/test', { type }),
}

// Update the default export to include all extended APIs
export const api = {
  motorcycles: motorcycleApi,
  maintenance: maintenanceApiExtended,
  parts: partsApiExtended,
  logs: logsApiExtended,
  dashboard: dashboardApiExtended,
  webhooks: webhooksApi,
  data: dataApi,
  bulk: bulkOperations,
  search: searchApi,
  statistics: statisticsApi,
  notifications: notificationApi,
  upload: uploadFile,
}