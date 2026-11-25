import { atom } from 'jotai'
import type { AdminUserRoleValue, AdminUserSummary } from '@/lib/admin-users-api'

export type RoleFilterValue = 'all' | AdminUserRoleValue
export type StatusFilterValue = 'all' | 'active' | 'inactive'
export type ProFilterValue = 'all' | 'pro' | 'free'

export type UserActionState =
  | {
      type: 'role'
      user: AdminUserSummary
      nextRole: AdminUserRoleValue
    }
  | {
      type: 'status'
      user: AdminUserSummary
      nextActive: boolean
    }
  | null

export const adminUsersSearchInputAtom = atom('')
export const adminUsersPageAtom = atom(1)
export const adminUsersRoleFilterAtom = atom<RoleFilterValue>('all')
export const adminUsersStatusFilterAtom = atom<StatusFilterValue>('all')
export const adminUsersProFilterAtom = atom<ProFilterValue>('all')
export const adminUsersSortByAtom = atom<'createdAt' | 'updatedAt' | 'email' | 'name' | 'role'>('createdAt')
export const adminUsersSortOrderAtom = atom<'ASC' | 'DESC'>('DESC')
export const adminUsersSelectedUserIdAtom = atom<string | null>(null)
export const adminUsersActionAtom = atom<UserActionState>(null)
export const adminUsersActionReasonAtom = atom('')
