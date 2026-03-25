import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'
import type { AdminAuthenticatedUser, AuthResponseData } from '@/lib/auth'

export interface PasswordLoginInput {
  email: string
  password: string
}

export type AuthResponse = ApiSuccessResponse<AuthResponseData>

export type MeResponse = ApiSuccessResponse<{
  user: AdminAuthenticatedUser
}>

export async function loginWithPassword(input: PasswordLoginInput) {
  return adminApiRequest<AuthResponse>('/auth/login/password', {
    method: 'POST',
    body: {
      email: input.email,
      password: input.password,
    },
  })
}

export async function refreshAdminSession(refreshToken: string) {
  return adminApiRequest<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })
}

export async function fetchAuthenticatedAdmin(accessToken: string) {
  return adminApiRequest<MeResponse>('/auth/me', {
    accessToken,
  })
}

export async function logoutAdminSession(refreshToken: string) {
  return adminApiRequest<ApiSuccessResponse<Record<string, never>>>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  })
}
