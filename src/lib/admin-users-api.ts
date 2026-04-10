import { adminApiRequest, type ApiSuccessResponse } from '@/lib/api'

export type AdminUserRoleValue = 'admin' | 'user'
export type AdminUserSortOrder = 'ASC' | 'DESC'

export interface AdminUsersQueryInput {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'name' | 'role'
  sortOrder?: AdminUserSortOrder
  role?: AdminUserRoleValue
  active?: boolean
  pro?: boolean
  createdFrom?: string
  createdTo?: string
}

export interface AdminUserSummary {
  id: string
  email: string | null
  name: string | null
  url: string | null
  pro: boolean
  active: boolean
  role: AdminUserRoleValue
  emailVerifiedAt: string | null
  lastLoginAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface AdminSubscriptionSummary {
  isPro: boolean
  activeEntitlementIds: string[]
  activeProductId: string | null
  store: string | null
  managementUrl: string | null
  expiresAt: string | null
  willRenew: boolean
  lastSyncedAt: string | null
}

export interface AdminUserDetail extends AdminUserSummary {
  authProviders: string[]
  subscription: AdminSubscriptionSummary
  counts: {
    hostedEventsCount: number
    memberEventsCount: number
    imageCount: number
    unreadNotificationCount: number
  }
}

export interface AdminPaginatedData<T> {
  items: T[]
  page: number
  limit: number
  totalCount: number
}

export type AdminUsersResponse = ApiSuccessResponse<AdminPaginatedData<AdminUserSummary>>
export type AdminUserResponse = ApiSuccessResponse<{ user: AdminUserDetail }>

export interface UpdateAdminUserStatusInput {
  active: boolean
  reason: string
}

export interface UpdateAdminUserRoleInput {
  role: AdminUserRoleValue
  reason: string
}

function buildUsersQueryString(query: AdminUsersQueryInput) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === '') {
      continue
    }

    searchParams.set(key, typeof value === 'boolean' ? String(value) : value)
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export async function listAdminUsers(accessToken: string, query: AdminUsersQueryInput) {
  return adminApiRequest<AdminUsersResponse>(`/admin/users${buildUsersQueryString(query)}`, {
    accessToken,
  })
}

export async function getAdminUserById(accessToken: string, userId: string) {
  return adminApiRequest<AdminUserResponse>(`/admin/users/${userId}`, {
    accessToken,
  })
}

export async function updateAdminUserStatus(
  accessToken: string,
  userId: string,
  input: UpdateAdminUserStatusInput,
) {
  return adminApiRequest<AdminUserResponse>(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    accessToken,
    body: {
      active: input.active,
      reason: input.reason,
    },
  })
}

export async function updateAdminUserRole(
  accessToken: string,
  userId: string,
  input: UpdateAdminUserRoleInput,
) {
  return adminApiRequest<AdminUserResponse>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    accessToken,
    body: {
      role: input.role,
      reason: input.reason,
    },
  })
}

export async function syncAdminUserSubscription(accessToken: string, userId: string) {
  return adminApiRequest<AdminUserResponse>(`/admin/users/${userId}/subscription/sync`, {
    method: 'POST',
    accessToken,
  })
}
