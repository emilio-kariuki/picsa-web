'use client'

import { useMemo, useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BellIcon, CheckCheckIcon, CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { ClientMetricCard, ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/client-api'
import { formatRelativeTime, getNotificationTypeLabel } from '@/lib/client-view'

export default function ClientNotificationsPage() {
  const queryClient = useQueryClient()
  const { performAuthenticatedRequest } = useClientAuth()
  const [unreadOnly, setUnreadOnly] = useState(false)

  const notificationsQuery = useInfiniteQuery({
    queryKey: ['client', 'notifications', { unreadOnly }],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      performAuthenticatedRequest((token) =>
        fetchNotifications(token, {
          cursor: pageParam,
          limit: 15,
          unreadOnly,
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      performAuthenticatedRequest((token) => markNotificationRead(token, notificationId)),
    onSuccess: () => {
      toast.success('Notification marked as read')
      void queryClient.invalidateQueries({ queryKey: ['client', 'notifications'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to update notification')
    },
  })

  const markAllMutation = useMutation({
    mutationFn: () =>
      performAuthenticatedRequest((token) => markAllNotificationsRead(token)),
    onSuccess: () => {
      toast.success('All notifications marked as read')
      void queryClient.invalidateQueries({ queryKey: ['client', 'notifications'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to mark all as read')
    },
  })

  const notifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.notifications) ?? [],
    [notificationsQuery.data],
  )

  const unreadCount = notificationsQuery.data?.pages[0]?.unreadCount ?? 0

  if (notificationsQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Loading your notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ClientPageHeader
        eyebrow="Notifications"
        title="A calm view of everything worth your attention"
        description="Catch invite activity, join decisions, system updates, and the moments where your event needs a quick host response."
        actions={
          <Button
            variant="outline"
            className="rounded-full border-border/80 bg-background/70"
            disabled={!notifications.length || markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            <CheckCheckIcon className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ClientMetricCard label="Unread" value={String(unreadCount)} helper="What still needs your eye right now." />
        <ClientMetricCard label="Loaded" value={String(notifications.length)} helper="Notifications fetched into this view." />
        <ClientSurface className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Filter</p>
            <p className="mt-2 font-serif text-2xl font-semibold tracking-tight">Unread only</p>
          </div>
          <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} />
        </ClientSurface>
      </div>

      <ClientSurface>
        {notifications.length ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-[1.5rem] border p-5 transition-colors ${
                  notification.readAt
                    ? 'border-border/70 bg-secondary/35'
                    : 'border-accent/30 bg-accent/10'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1">
                        {getNotificationTypeLabel(notification.type)}
                      </Badge>
                      {!notification.readAt ? (
                        <Badge className="rounded-full bg-accent px-3 py-1 text-accent-foreground">Unread</Badge>
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{notification.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.body}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.readAt ? (
                    <Button
                      size="sm"
                      className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                      onClick={() => markReadMutation.mutate(notification.id)}
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}

            {notificationsQuery.hasNextPage ? (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  className="rounded-full border-border/80 bg-background/70"
                  onClick={() => void notificationsQuery.fetchNextPage()}
                  disabled={notificationsQuery.isFetchingNextPage}
                >
                  {notificationsQuery.isFetchingNextPage ? 'Loading more...' : 'Load more notifications'}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <Empty className="rounded-[1.5rem] border-border/70 bg-secondary/35 p-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BellIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No notifications here</EmptyTitle>
              <EmptyDescription>
                Switch off the unread filter or wait for guest, invite, and system updates to arrive.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </ClientSurface>
    </div>
  )
}
