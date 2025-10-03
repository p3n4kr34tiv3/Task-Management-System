import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, AuthResponse, RefreshTokenRequest } from '@/types'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management
let accessToken: string | null = localStorage.getItem('accessToken')
let refreshToken: string | null = localStorage.getItem('refreshToken')

export const setTokens = (access: string, refresh: string) => {
  accessToken = access
  refreshToken = refresh
  localStorage.setItem('accessToken', access)
  localStorage.setItem('refreshToken', refresh)
}

export const clearTokens = () => {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export const getAccessToken = () => accessToken

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken } as RefreshTokenRequest
          )

          if (refreshResponse.data.success) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data
            setTokens(newAccessToken, newRefreshToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          clearTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, redirect to login
        clearTokens()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// API methods
export const apiClient = {
  // Generic methods
  get: <T>(url: string, params?: object): Promise<AxiosResponse<T>> =>
    api.get(url, { params }),
  
  post: <T>(url: string, data?: object): Promise<AxiosResponse<T>> =>
    api.post(url, data),
  
  put: <T>(url: string, data?: object): Promise<AxiosResponse<T>> =>
    api.put(url, data),
  
  patch: <T>(url: string, data?: object): Promise<AxiosResponse<T>> =>
    api.patch(url, data),
  
  delete: <T>(url: string): Promise<AxiosResponse<T>> =>
    api.delete(url),
}

export default api