export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3001'

export interface ApiResponse<T> {
  data: T
  message?: string
}

function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function apiGet<T>(endpoint: string, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(token),
  })
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  return response.json()
}

export async function apiPost<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  return response.json()
}

export async function apiPut<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
     method: 'PUT',
     headers: getAuthHeaders(token),
     body: JSON.stringify(data),
   })
   if (!response.ok) {
     throw new Error(`API Error: ${response.statusText}`)
   }
   return response.json()
 }

export async function apiPatch<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
     method: 'PATCH',
     headers: getAuthHeaders(token),
     body: JSON.stringify(data),
   })
   if (!response.ok) {
     throw new Error(`API Error: ${response.statusText}`)
   }
   return response.json()
 }

export async function apiDelete<T>(endpoint: string, token?: string): Promise<T> {
   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
     method: 'DELETE',
     headers: getAuthHeaders(token),
   })
   if (!response.ok) {
     throw new Error(`API Error: ${response.statusText}`)
   }
   return response.json()
 }

export async function apiSetMatchWinner(matchId: string, winnerId: string, token?: string): Promise<unknown> {
   const response = await fetch(`${API_BASE_URL}/match/${matchId}/winner`, {
     method: 'PATCH',
     headers: getAuthHeaders(token),
     body: JSON.stringify({ winnerId }),
   })
   if (!response.ok) {
     throw new Error(`API Error: ${response.statusText}`)
   }
   return response.json()
 }