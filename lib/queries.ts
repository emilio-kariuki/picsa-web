import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  users,
  roles,
  notifications as mockNotifications,
  tickets,
  rcSubscriptions,
  rcTransactions,
  rcOverview,
  events,
  eventAttendees,
  mediaAssets,
  mediaAlbums,
  auditLog,
  analyticsData,
  conversionData,
  trafficSources,
  revenueData,
  userGrowthData,
} from './mock-data'
import type {
  User,
  Role,
  Notification,
  Ticket,
  RCSubscription,
  RCTransaction,
  Event,
  EventAttendee,
  MediaAsset,
  MediaAlbum,
  AuditLogEntry,
} from './types'

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Query keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  roles: ['roles'] as const,
  notifications: ['notifications'] as const,
  tickets: ['tickets'] as const,
  ticket: (id: string) => ['tickets', id] as const,
  subscriptions: ['subscriptions'] as const,
  transactions: ['transactions'] as const,
  revenueOverview: ['revenue-overview'] as const,
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  eventAttendees: (eventId: string) => ['events', eventId, 'attendees'] as const,
  mediaAssets: ['media-assets'] as const,
  mediaAlbums: ['media-albums'] as const,
  auditLog: ['audit-log'] as const,
  analytics: ['analytics'] as const,
  conversion: ['conversion'] as const,
  trafficSources: ['traffic-sources'] as const,
  revenue: ['revenue'] as const,
  userGrowth: ['user-growth'] as const,
}

// Users
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      await delay(300)
      return users
    },
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: async () => {
      await delay(200)
      return users.find((u) => u.id === id)
    },
    enabled: !!id,
  })
}

// Roles
export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: async () => {
      await delay(200)
      return roles
    },
  })
}

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      await delay(300)
      return mockNotifications
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await delay(100)
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(queryKeys.notifications, (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    },
  })
}

// Tickets
export function useTickets() {
  return useQuery({
    queryKey: queryKeys.tickets,
    queryFn: async () => {
      await delay(300)
      return tickets
    },
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: queryKeys.ticket(id),
    queryFn: async () => {
      await delay(200)
      return tickets.find((t) => t.id === id)
    },
    enabled: !!id,
  })
}

// RevenueCat / Payments
export function useSubscriptions() {
  return useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: async () => {
      await delay(300)
      return rcSubscriptions
    },
  })
}

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions,
    queryFn: async () => {
      await delay(300)
      return rcTransactions
    },
  })
}

export function useRevenueOverview() {
  return useQuery({
    queryKey: queryKeys.revenueOverview,
    queryFn: async () => {
      await delay(200)
      return rcOverview
    },
  })
}

// Events
export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: async () => {
      await delay(300)
      return events
    },
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: async () => {
      await delay(200)
      return events.find((e) => e.id === id)
    },
    enabled: !!id,
  })
}

export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: queryKeys.eventAttendees(eventId),
    queryFn: async () => {
      await delay(200)
      return eventAttendees.filter((a) => a.eventId === eventId)
    },
    enabled: !!eventId,
  })
}

// Media
export function useMediaAssets() {
  return useQuery({
    queryKey: queryKeys.mediaAssets,
    queryFn: async () => {
      await delay(300)
      return mediaAssets
    },
  })
}

export function useMediaAlbums() {
  return useQuery({
    queryKey: queryKeys.mediaAlbums,
    queryFn: async () => {
      await delay(200)
      return mediaAlbums
    },
  })
}

// Audit Log
export function useAuditLog() {
  return useQuery({
    queryKey: queryKeys.auditLog,
    queryFn: async () => {
      await delay(300)
      return auditLog
    },
  })
}

// Analytics
export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: async () => {
      await delay(200)
      return analyticsData
    },
  })
}

export function useConversionData() {
  return useQuery({
    queryKey: queryKeys.conversion,
    queryFn: async () => {
      await delay(200)
      return conversionData
    },
  })
}

export function useTrafficSources() {
  return useQuery({
    queryKey: queryKeys.trafficSources,
    queryFn: async () => {
      await delay(200)
      return trafficSources
    },
  })
}

export function useRevenueData() {
  return useQuery({
    queryKey: queryKeys.revenue,
    queryFn: async () => {
      await delay(200)
      return revenueData
    },
  })
}

export function useUserGrowthData() {
  return useQuery({
    queryKey: queryKeys.userGrowth,
    queryFn: async () => {
      await delay(200)
      return userGrowthData
    },
  })
}
