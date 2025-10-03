import { apiClient, setTokens, clearTokens } from '@/lib/api'
import type { 
  LoginFormData, 
  SignupFormData, 
  AuthResponse, 
  ApiResponse,
  IUser 
} from '@/types'

export const authService = {
  async signup(data: SignupFormData): Promise<AuthResponse> {
    try {
      console.log('Auth service: Making signup request to /auth/signup with:', { name: data.name, email: data.email })
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password
      })

      console.log('Auth service: Signup response:', response.data)

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken } = response.data.data
        setTokens(accessToken, refreshToken)
        return response.data.data
      }

      throw new Error(response.data.message || 'Signup failed')
    } catch (error: unknown) {
      console.error('Auth service: Signup error:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message)
        }
        if (axiosError.response?.data?.errors) {
          const errorMessages = Object.values(axiosError.response.data.errors).flat().join(', ')
          throw new Error(errorMessages)
        }
      }
      throw new Error(error instanceof Error ? error.message : 'Signup failed')
    }
  },

  async login(data: LoginFormData): Promise<AuthResponse> {
    try {
      console.log('Auth service: Making login request to /auth/login with:', { email: data.email })
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)

      console.log('Auth service: Login response:', response.data)

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken } = response.data.data
        setTokens(accessToken, refreshToken)
        return response.data.data
      }

      throw new Error(response.data.message || 'Login failed')
    } catch (error: unknown) {
      console.error('Auth service: Login error:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message)
        }
        if (axiosError.response?.data?.errors) {
          const errorMessages = Object.values(axiosError.response.data.errors).flat().join(', ')
          throw new Error(errorMessages)
        }
      }
      throw new Error(error instanceof Error ? error.message : 'Login failed')
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {
        refreshToken: localStorage.getItem('refreshToken')
      })
    } catch (error) {
      // Log the error but don't throw - we still want to clear local tokens
      console.error('Logout error:', error)
    } finally {
      clearTokens()
    }
  },

  async getProfile(): Promise<IUser> {
    const response = await apiClient.get<ApiResponse<IUser>>('/auth/profile')

    if (response.data.success && response.data.data) {
      return response.data.data
    }

    throw new Error(response.data.message || 'Failed to fetch profile')
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken
    })

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data
      setTokens(accessToken, newRefreshToken)
      return response.data.data
    }

    throw new Error(response.data.message || 'Token refresh failed')
  }
}