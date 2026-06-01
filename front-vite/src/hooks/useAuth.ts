import { useState, useEffect } from 'react'
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

export function useAuth() {
   const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true)

   const refresh = () => {
     const token = localStorage.getItem('token')
     if (token) {
       apiGet<ApiUser>('/auth/me', token)
         .then(apiUser => {
          
           setUser(mapUser(apiUser))
           setLoading(false)
         })
         .catch(() => {
           localStorage.removeItem('token')
           setUser(null)
           setLoading(false)
         })
     } else {
       setLoading(false)
     }
   }

   useEffect(() => {
     refresh()
   }, [])

   const login = async (email: string, password: string) => {
     const response = await apiPost<AuthResponse>('/auth/login', { email, password })
     localStorage.setItem('token', response.accessToken)
     setUser(mapUser(response))
     setLoading(false)
     return response
   }

   const register = async (username: string, email: string, password: string) => {
     const response = await apiPost<AuthResponse>('/auth/register', { username, email, password })
     localStorage.setItem('token', response.accessToken)
     setUser(mapUser(response))
     setLoading(false)
     return response
   }

   const logout = () => {
     localStorage.removeItem('token')
     setUser(null)
     setLoading(false)
   }

   return { user, loading, login, register, logout, refresh }
 }