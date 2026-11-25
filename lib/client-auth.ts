import { createJSONStorage } from 'jotai/utils'
import type { ClientAuthenticatedUser, ClientAuthResponseData, ClientAuthSession } from '@/lib/client-types'

export type { ClientAuthSession } from '@/lib/client-types'

export const CLIENT_AUTH_STORAGE_KEY = 'client-auth-session'

export const clientAuthStorage = createJSONStorage<ClientAuthSession | null>(() => localStorage)

export function buildClientAuthSession(data: ClientAuthResponseData): ClientAuthSession {
  return {
    accessToken: data.accessToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
    refreshToken: data.refreshToken,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    currentUser: data.user,
  }
}

export function readStoredClientAuthSession(): ClientAuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(CLIENT_AUTH_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as ClientAuthSession
  } catch {
    window.localStorage.removeItem(CLIENT_AUTH_STORAGE_KEY)
    return null
  }
}

export function isActiveClientUser(
  user: ClientAuthenticatedUser | null | undefined,
): user is ClientAuthenticatedUser {
  return Boolean(user?.active)
}

export function getClientDisplayName(user: ClientAuthenticatedUser | null | undefined) {
  const name = user?.name?.trim()

  if (name) {
    return name
  }

  const emailName = user?.email?.split('@')[0]?.trim()

  if (emailName) {
    return emailName
  }

  return 'Picsa User'
}

export function getClientInitials(user: ClientAuthenticatedUser | null | undefined) {
  const displayName = getClientDisplayName(user)
  const parts = displayName.split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return 'PU'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function resolveClientNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/'
  }

  return value
}
