import { apiRequest, type ApiSuccessResponse } from '@/lib/api'
import type { ClientAuthenticatedUser, ClientAuthResponseData } from '@/lib/client-types'

export interface GoogleLoginInput {
  idToken: string
}

export interface AppleLoginInput {
  idToken: string
  name?: string | null
}

export type ClientAuthResponse = ApiSuccessResponse<ClientAuthResponseData>

export type ClientMeResponse = ApiSuccessResponse<{
  user: ClientAuthenticatedUser
}>

export async function loginWithGoogle(input: GoogleLoginInput) {
  return apiRequest<ClientAuthResponse>('/auth/google', {
    method: 'POST',
    body: input,
  })
}

export async function loginWithApple(input: AppleLoginInput) {
  return apiRequest<ClientAuthResponse>('/auth/apple', {
    method: 'POST',
    body: input,
  })
}

export async function reactivateWithGoogle(input: GoogleLoginInput) {
  return apiRequest<ClientAuthResponse>('/auth/reactivate/google', {
    method: 'POST',
    body: input,
  })
}

export async function reactivateWithApple(input: AppleLoginInput) {
  return apiRequest<ClientAuthResponse>('/auth/reactivate/apple', {
    method: 'POST',
    body: input,
  })
}

export async function refreshClientSession(refreshToken: string) {
  return apiRequest<ClientAuthResponse>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })
}

export async function fetchAuthenticatedClient(accessToken: string) {
  return apiRequest<ClientMeResponse>('/auth/me', {
    accessToken,
  })
}

export async function logoutClientSession(refreshToken: string) {
  return apiRequest<ApiSuccessResponse<Record<string, never>>>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  })
}
