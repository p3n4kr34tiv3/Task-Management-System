import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '@/services/authService'
import { getAccessToken, clearTokens } from '@/lib/api'
import type { IUser, AuthContextType } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAccessToken()
        if (token) {
          // Try to get user profile
          const userProfile = await authService.getProfile()
          setUser(userProfile)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        // Clear invalid tokens
        clearTokens()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      console.log('Attempting login with email:', email)
      const authResponse = await authService.login({ email, password })
      console.log('Login successful:', authResponse)
      setUser(authResponse.user)
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof Error) {
        throw new Error(error.message)
      } else {
        throw new Error('Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      console.log('Attempting signup with:', { name, email })
      const authResponse = await authService.signup({ 
        name, 
        email, 
        password
      })
      console.log('Signup successful:', authResponse)
      setUser(authResponse.user)
    } catch (error) {
      console.error('Signup error:', error)
      if (error instanceof Error) {
        throw new Error(error.message)
      } else {
        throw new Error('Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = (): void => {
    setLoading(true)
    authService.logout().finally(() => {
      setUser(null)
      setLoading(false)
    })
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}