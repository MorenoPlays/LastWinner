import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import type { User } from '@/lib/types'

interface ApiUser {
  id: string
  username: string
  email: string
  role: string
  avatarUrl?: string | null
  phoneNumber?: string | null
  country?: string | null
  bio?: string | null
  createdAt?: string
}

interface AuthResponse {
  id: string
  username: string
  email: string
  role: string
  accessToken: string
}

function mapUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    username: apiUser.username,
    display_name: apiUser.username,
    avatar_url: apiUser.avatarUrl || null,
    country: apiUser.country || null,
    email: apiUser.email,
    phoneNumber: apiUser.phoneNumber || null,
    createdAt: apiUser.createdAt,
    bio: apiUser.bio || null,
    role: apiUser.role,
  }
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (username: string, email: string, password: string) => Promise<AuthResponse>
  logout: () => void
  refresh: () => Promise<void>
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const apiUser = await apiGet<ApiUser>('/auth/me', token)
      setUser(mapUser(apiUser))
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      refresh()
    }
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiPost<AuthResponse>('/auth/login', { email, password })
    localStorage.setItem('token', response.accessToken)
    setUser(mapUser(response))
    setLoading(false)
    return response
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    const response = await apiPost<AuthResponse>('/auth/register', { username, email, password })
    localStorage.setItem('token', response.accessToken)
    setUser(mapUser(response))
    setLoading(false)
    return response
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
    setLoading(false)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, setUser }),
    [user, loading, login, register, logout, refresh]
  )

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
