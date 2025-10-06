'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type {
  AuthContextType,
  User,
  Family,
  LoginCredentials,
  RegisterData,
  OAuthProvider,
} from '@/types/auth'
import {
  loginWithCredentials,
  registerUser,
  initiateOAuthLogin,
  logoutUser,
  getCurrentUser,
  getStoredTokens,
  getStoredUser,
  getStoredFamily,
  clearStoredTokens,
} from '@/lib/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initAuth = async () => {
      const tokens = getStoredTokens()
      
      if (tokens) {
        try {
          // Try to get current user data from API
          const data = await getCurrentUser()
          setUser(data.user)
          setFamily(data.family)
        } catch (error) {
          // If token is invalid, try stored data
          const storedUser = getStoredUser()
          const storedFamily = getStoredFamily()
          
          if (storedUser && storedFamily) {
            setUser(storedUser)
            setFamily(storedFamily)
          } else {
            // Clear invalid tokens
            clearStoredTokens()
          }
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const data = await loginWithCredentials(credentials)
      setUser(data.user)
      setFamily(data.family)
    } catch (error) {
      throw error
    }
  }, [])

  const loginWithOAuth = useCallback(async (provider: OAuthProvider) => {
    try {
      await initiateOAuthLogin(provider)
      // OAuth will redirect, so this won't execute
    } catch (error) {
      throw error
    }
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    try {
      const authData = await registerUser(data)
      setUser(authData.user)
      setFamily(authData.family)
    } catch (error) {
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } finally {
      setUser(null)
      setFamily(null)
    }
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      const data = await getCurrentUser()
      setUser(data.user)
      setFamily(data.family)
    } catch (error) {
      // If refresh fails, logout
      await logout()
      throw error
    }
  }, [logout])

  const value: AuthContextType = {
    user,
    family,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithOAuth,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
