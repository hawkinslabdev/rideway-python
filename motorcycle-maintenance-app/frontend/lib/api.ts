// frontend/lib/api.ts
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8060/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth (when we add it later)
apiClient.interceptors.request.use((config) => {
  // Add auth token here when implemented
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

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