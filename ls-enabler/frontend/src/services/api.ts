import axios, { AxiosResponse } from 'axios'
import { ApiResponse, FormData } from '../types'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth tokens, etc.
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Generic API methods
export const apiService = {
  // Generic POST request
  async post<T = any>(endpoint: string, data: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await api.post(endpoint, data)
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Operation successful'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred'
      }
    }
  },

  // Generic GET request
  async get<T = any>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.get(endpoint, { params })
      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred'
      }
    }
  },

  // File upload with FormData
  async uploadFile<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'File uploaded successfully'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Upload failed'
      }
    }
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health')
      return response.status === 200
    } catch {
      return false
    }
  }
}

// Module-specific services
export const rfiService = {
  create: (data: FormData) => apiService.post('/api/rfi/create', data),
  search: (params: any) => apiService.get('/api/rfi/search', params),
  update: (data: FormData) => apiService.post('/api/rfi/update', data),
}

export const rejectService = {
  process: (data: FormData) => apiService.post('/api/reject/process', data),
  search: (params: any) => apiService.get('/api/reject/search', params),
  appeal: (data: FormData) => apiService.post('/api/reject/appeal', data),
}

export const fsService = {
  upload: (formData: FormData) => apiService.uploadFile('/api/fs/upload', formData),
  search: (params: any) => apiService.get('/api/fs/search', params),
  manage: (data: FormData) => apiService.post('/api/fs/manage', data),
}

export const trbService = {
  submit: (formData: FormData) => apiService.uploadFile('/api/trb/submit', formData),
  status: (params: any) => apiService.get('/api/trb/status', params),
  assign: (data: FormData) => apiService.post('/api/trb/assign', data),
}

export default api