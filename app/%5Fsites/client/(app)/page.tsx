'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRightIcon, CalendarDaysIcon, CheckIcon, ImageIcon, PlusIcon, UsersIcon, Clock3Icon } from '@/components/ui/icons'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientMetricCard, ClientPageHeader, ClientSectionHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import {
  approveEventJoinRequest,
  fetchEventJoinRequests,
  fetchHostedEvents,
  fetchMyImages,
  rejectEventJoinRequest,
} from '@/lib/client-api'
import { formatEventWindow, formatRelativeTime } from '@/lib/client-view'
import { cn } from '@/lib/utils'

export default function ClientDashboardPage() {
  const queryClient = useQueryClient()
  const { performAuthenticatedRequest } = useClientAuth()

  const hostedEventsQuery = useQuery({
    queryKey: ['client', 'hosted-events'],
    queryFn: () => performAuthenticatedRequest((token) => fetchHostedEvents(token)),
  })

  const recentUploadsQuery = useQuery({
    queryKey: ['client', 'dashboard', 'recent-uploads'],
    queryFn: () =>
      performAuthenticatedRequest((token) =>
        fetchMyImages(token, { limit: 6 }),
      ),
  })

  const pendingRequestsQuery = useQuery({
    queryKey: ['client', 'dashboard', 'pending-requests', hostedEventsQuery.data?.map((e) => e.id)],
    enabled: Boolean(hostedEventsQuery.data?.length),
    queryFn: async () => {
      const hostedEvents = hostedEventsQuery.data ?? []
      const responses = await Promise.all(
        hostedEvents.slice(0, 6).map(async (event) => {
          const requests = await performAuthenticatedRequest((token) => fetchEventJoinRequests(token, event.id))
          return requests.map((request) => ({
            ...request,
            eventId: event.id,
            eventName: event.name,
          }))
        }),
      )
      return responses.flat()
    },
  })

  const approveRequestMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      performAuthenticatedRequest((token) => approveEventJoinRequest(token, eventId, userId)),
    onSuccess: () => {
      toast.success('Join request approved')
      void queryClient.invalidateQueries({ queryKey: ['client', 'dashboard', 'pending-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['client', 'hosted-events'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to approve request')
    },
  })

  const rejectRequestMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      performAuthenticatedRequest((token) => rejectEventJoinRequest(token, eventId, userId)),
    onSuccess: () => {
      toast.success('Join request rejected')
      void queryClient.invalidateQueries({ queryKey: ['client', 'dashboard', 'pending-requests'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to reject request')
    },
  })

  const totalGuests = useMemo(
    () => hostedEventsQuery.data?.reduce((sum, event) => sum + event.memberCount, 0) ?? 0,
    [hostedEventsQuery.data],
  )

  if (hostedEventsQuery.isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        {/* KPI skeletons */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-start justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
              <Skeleton className="mt-4 h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
          ))}
        </div>
        {/* Content skeleton */}
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border border-border/60 bg-card p-0">
            <div className="border-b border-border px-5 py-4">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                    <div className="flex gap-3">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <Skeleton className="h-4 w-36" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const events = hostedEventsQuery.data ?? []

  // Empty state
  if (!events.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
          <CalendarDaysIcon className="h-7 w-7 text-accent" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-foreground">Create your first event</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Set up an event space, open the gallery, and start collecting photos from your guests.
        </p>
        <Button
          asChild
          className="mt-6 gap-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link href="/events/new">
            <PlusIcon className="h-4 w-4" />
            Create your first event
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ClientPageHeader
        title="Dashboard"
        description="Track your events, guests, and photo activity at a glance."
        actions={
          <Button asChild className="gap-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/events/new">
              <PlusIcon className="h-4 w-4" />
              New event
            </Link>
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ClientMetricCard
          label="Hosted events"
          value={String(events.length)}
          icon={CalendarDaysIcon}
          helper={events.length === 1 ? '1 event created' : `${events.length} events created`}
        />
        <ClientMetricCard
          label="Total guests"
          value={String(totalGuests)}
          icon={UsersIcon}
          helper={`Across ${events.length} event${events.length !== 1 ? 's' : ''}`}
        />
        <ClientMetricCard
          label="Pending joins"
          value={String(pendingRequestsQuery.data?.length ?? 0)}
          icon={Clock3Icon}
          helper="Awaiting your review"
        />
        <ClientMetricCard
          label="Recent uploads"
          value={String(recentUploadsQuery.data?.images.length ?? 0)}
          icon={ImageIcon}
          helper="Latest photos added"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Recent events */}
        <ClientSurface className="overflow-hidden p-0">
          <div className="border-b border-border px-5 py-4">
            <ClientSectionHeader
              title="Recent events"
              actions={
                <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  <Link href="/events">
                    View all
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />
          </div>
          <div className="divide-y divide-border">
            {events.slice(0, 5).map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent/5"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <CalendarDaysIcon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{event.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground truncate">
                      {event.description || 'No description'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UsersIcon className="h-3.5 w-3.5" />
                        {event.memberCount} guests
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDaysIcon className="h-3.5 w-3.5" />
                        {formatEventWindow(event.startAt, event.endAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge
                    variant="outline"
                    className="hidden border-border text-muted-foreground sm:inline-flex"
                  >
                    {event.settings.joinMode.replaceAll('_', ' ')}
                  </Badge>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
              </Link>
            ))}
          </div>
        </ClientSurface>

        {/* Right column */}
        <div className="space-y-6">
          {/* Pending join requests */}
          <ClientSurface className="overflow-hidden p-0">
            <div className="border-b border-border px-5 py-4">
              <ClientSectionHeader
                title="Pending join requests"
                description={
                  pendingRequestsQuery.data?.length
                    ? `${pendingRequestsQuery.data.length} awaiting review`
                    : 'Queue is clear'
                }
              />
            </div>
            <div className="p-4">
              {pendingRequestsQuery.data?.length ? (
                <div className="space-y-3">
                  {pendingRequestsQuery.data.slice(0, 5).map((request) => (
                    <div
                      key={`${request.eventId}:${request.userId}`}
                      className="rounded-xl border border-border/60 bg-background p-3.5 transition-colors hover:border-border"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                          {(request.user.name ?? request.user.email ?? 'G').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {request.user.name ?? request.user.email ?? 'Guest'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{request.eventName}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground/70">
                            {formatRelativeTime(request.requestedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 pl-12">
                        <Button
                          size="sm"
                          className="h-7 gap-1.5 rounded-lg bg-accent px-3 text-xs text-accent-foreground hover:bg-accent/90"
                          onClick={() =>
                            approveRequestMutation.mutate({
                              eventId: request.eventId,
                              userId: request.userId,
                            })
                          }
                        >
                          <CheckIcon className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg px-3 text-xs"
                          onClick={() =>
                            rejectRequestMutation.mutate({
                              eventId: request.eventId,
                              userId: request.userId,
                            })
                          }
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                    <UsersIcon className="h-5 w-5 text-accent/60" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">No pending requests</p>
                  <p className="mt-1 text-xs text-muted-foreground">New requests will appear here</p>
                </div>
              )}
            </div>
          </ClientSurface>

          {/* Recent uploads */}
          <ClientSurface className="overflow-hidden p-0">
            <div className="border-b border-border px-5 py-4">
              <ClientSectionHeader title="Recent uploads" />
            </div>
            <div className="p-4">
              {recentUploadsQuery.data?.images.length ? (
                <div className="grid grid-cols-3 gap-1">
                  {recentUploadsQuery.data.images.slice(0, 6).map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square overflow-hidden rounded-md border border-border/60 bg-secondary"
                    >
                      {image.accessUrl ? (
                        <img
                          src={image.accessUrl}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                    <ImageIcon className="h-5 w-5 text-accent/60" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">No uploads yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Photos will appear here once guests start uploading
                  </p>
                </div>
              )}
            </div>
          </ClientSurface>
        </div>
      </div>
    </div>
  )
}
