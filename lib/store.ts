import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { adminAuthStorage, type AdminAuthSession } from '@/lib/auth'
import { clientAuthStorage, type ClientAuthSession } from '@/lib/client-auth'
import type { Notification } from './types'

// Sidebar state
export const sidebarCollapsedAtom = atomWithStorage('sidebar-collapsed', false)

// Notifications state
export const notificationsAtom = atom<Notification[]>([])
export const unreadCountAtom = atom((get) => {
  const notifications = get(notificationsAtom)
  return notifications.filter((n) => !n.read).length
})

// Selected items for bulk actions
export const selectedNotificationIdsAtom = atom<Set<string>>(new Set<string>())
export const selectedUserIdsAtom = atom<Set<string>>(new Set<string>())

// Filter states
export const notificationFilterAtom = atom<'all' | 'unread' | 'starred' | 'archived'>('all')
export const notificationTypeFilterAtom = atom<string[]>([])

// Search states
export const globalSearchAtom = atom('')
export const userSearchAtom = atom('')
export const eventSearchAtom = atom('')
export const mediaSearchAtom = atom('')

// View mode states
export const mediaViewModeAtom = atomWithStorage<'grid' | 'list'>('media-view-mode', 'grid')

// Theme
export const themeAtom = atomWithStorage<'light' | 'dark' | 'system'>('theme', 'system')

export const adminAuthSessionAtom = atomWithStorage<AdminAuthSession | null>(
  'admin-auth-session',
  null,
  adminAuthStorage,
)

export const adminAuthBootstrapStatusAtom = atom<'idle' | 'loading' | 'ready'>('idle')

export const currentUserAtom = atom((get) => get(adminAuthSessionAtom)?.currentUser ?? null)

export const isAuthenticatedAtom = atom((get) => {
  const session = get(adminAuthSessionAtom)
  const currentUser = get(currentUserAtom)

  return Boolean(
    session?.accessToken &&
      session.refreshToken &&
      currentUser?.active &&
      currentUser.role === 'admin',
  )
})

export const clientAuthSessionAtom = atomWithStorage<ClientAuthSession | null>(
  'client-auth-session',
  null,
  clientAuthStorage,
)

export const clientAuthBootstrapStatusAtom = atom<'idle' | 'loading' | 'ready'>('idle')

export const clientCurrentUserAtom = atom((get) => get(clientAuthSessionAtom)?.currentUser ?? null)

export const isClientAuthenticatedAtom = atom((get) => {
  const session = get(clientAuthSessionAtom)
  const currentUser = get(clientCurrentUserAtom)

  return Boolean(session?.accessToken && session.refreshToken && currentUser?.active)
})
