import { createJSONStorage } from 'jotai/utils'

export type AdminUserRole = 'admin' | 'user'

export interface AdminAuthenticatedUser {
  id: string
  email: string | null
  name: string | null
  url: string | null
  pro: boolean
  active: boolean
  role: AdminUserRole
  emailVerifiedAt: string | null
  lastLoginAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface AuthResponseData {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  user: AdminAuthenticatedUser
}

export interface AdminAuthSession {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  currentUser: AdminAuthenticatedUser
}

export const ADMIN_AUTH_STORAGE_KEY = 'admin-auth-session'

export const adminAuthStorage = createJSONStorage<AdminAuthSession | null>(() => localStorage)

export function buildAdminAuthSession(data: AuthResponseData): AdminAuthSession {
  return {
    accessToken: data.accessToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
    refreshToken: data.refreshToken,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    currentUser: data.user,
  }
}

export function readStoredAdminAuthSession(): AdminAuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AdminAuthSession
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
    return null
  }
}

export function isAdminUser(user: AdminAuthenticatedUser | null | undefined): user is AdminAuthenticatedUser {
  return Boolean(user?.active && user.role === 'admin')
}

export function getAdminDisplayName(user: AdminAuthenticatedUser | null | undefined) {
  const name = user?.name?.trim()

  if (name) {
    return name
  }

  const emailName = user?.email?.split('@')[0]?.trim()

  if (emailName) {
    return emailName
  }

  return 'Admin User'
}

export function getAdminInitials(user: AdminAuthenticatedUser | null | undefined) {
  const displayName = getAdminDisplayName(user)
  const parts = displayName.split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return 'AD'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function resolveAdminNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/admin/dashboard'
  }

  return value
}
