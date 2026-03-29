'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRightIcon, CalendarDaysIcon, CheckIcon, PlusIcon, UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { ClientMetricCard, ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import {
  approveEventJoinRequest,
  fetchEventJoinRequests,
  fetchHostedEvents,
  fetchMyImages,
  rejectEventJoinRequest,
} from '@/lib/client-api'
import { formatEventWindow, formatRelativeTime } from '@/lib/client-view'

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
        fetchMyImages(token, {
          limit: 6,
        }),
      ),
  })

  const pendingRequestsQuery = useQuery({
    queryKey: ['client', 'dashboard', 'pending-requests', hostedEventsQuery.data?.map((event) => event.id)],
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* <ClientPageHeader
        eyebrow=""
        title=''
        // title="Your event command center"
        // description="See what is active, what needs your attention, and where the latest photos are landing."
        actions={
          <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
            <Link href="/events/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New event
            </Link>
          </Button>
        }
      /> */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mt-5">
        <ClientMetricCard
          label="Hosted events"
          value={String(hostedEventsQuery.data?.length ?? 0)}
          // helper="Every active event under your care."
        />
        <ClientMetricCard
          label="Guests"
          value={String(totalGuests)}
          // helper="People currently inside your hosted spaces."
        />
        <ClientMetricCard
          label="Pending joins"
          value={String(pendingRequestsQuery.data?.length ?? 0)}
          // helper="Requests that still need a host decision."
        />
        <ClientMetricCard
          label="Recent uploads"
          value={String(recentUploadsQuery.data?.images.length ?? 0)}
          // helper="A snapshot of your latest gallery activity."
        />
      </div>

      {hostedEventsQuery.data?.length ? (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <ClientSurface>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Recent events</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Keep momentum on the moments that matter</h2>
              </div>
              <Button asChild variant="outline" className="rounded-full border-border/80 bg-background/70">
                <Link href="/events">
                  View all
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {hostedEventsQuery.data.slice(0, 4).map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group rounded-[1.5rem] border border-border/70 bg-secondary/50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(35,30,27,0.10)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-foreground transition-colors group-hover:text-accent">
                        {event.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.description || 'No description yet.'}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-accent/35 bg-accent/10 px-3 py-1 text-accent">
                      {event.settings.joinMode.replaceAll('_', ' ')}
                    </Badge>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1">
                      <UsersIcon className="h-4 w-4 text-accent" />
                      {event.memberCount} guests
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1">
                      <CalendarDaysIcon className="h-4 w-4 text-accent" />
                      {formatEventWindow(event.startAt, event.endAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </ClientSurface>

          <div className="space-y-6">
            <ClientSurface>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Pending join requests</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Guests waiting on you</h2>
              </div>

              <div className="space-y-4">
                {pendingRequestsQuery.data?.length ? (
                  pendingRequestsQuery.data.slice(0, 5).map((request) => (
                    <div key={`${request.eventId}:${request.userId}`} className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{request.user.name ?? request.user.email ?? 'Guest request'}</p>
                          <p className="text-sm text-muted-foreground">{request.eventName}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            {formatRelativeTime(request.requestedAt)}
                          </p>
                        </div>
                        <Badge variant="outline" className="rounded-full border-border/70 bg-background/80">
                          Awaiting review
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                          onClick={() =>
                            approveRequestMutation.mutate({
                              eventId: request.eventId,
                              userId: request.userId,
                            })
                          }
                        >
                          <CheckIcon className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-border/80 bg-background/70"
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
                  ))
                ) : (
                  <Empty className="rounded-[1.5rem] border-border/70 bg-secondary/35 p-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UsersIcon className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>Nothing waiting right now</EmptyTitle>
                      <EmptyDescription>Your join queue is clear. New requests will show up here.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            </ClientSurface>

            <ClientSurface>
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Recent uploads</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Fresh from the gallery</h2>
              </div>

              {recentUploadsQuery.data?.images.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {recentUploadsQuery.data.images.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-[1.25rem] border border-border/70 bg-secondary/35">
                      <div className="aspect-[4/5] bg-muted">
                        {image.accessUrl ? (
                          <img src={image.accessUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Processing...
                          </div>
                        )}
                      </div>
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{formatRelativeTime(image.createdAt)}</p>
                        <p className="mt-1">{image.status === 'READY' ? 'Ready to share' : 'Still processing'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty className="rounded-[1.5rem] border-border/70 bg-secondary/35 p-8">
                  <EmptyContent>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <CalendarDaysIcon className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No uploads yet</EmptyTitle>
                      <EmptyDescription>Create an event and open the gallery to start collecting images.</EmptyDescription>
                    </EmptyHeader>
                  </EmptyContent>
                </Empty>
              )}
            </ClientSurface>
          </div>
        </div>
      ) : (
        <ClientSurface className="p-0">
          <div className="grid gap-8 rounded-[1.75rem] p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">First event</p>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Build the first space your guests will remember.
              </h2>
              <p className="max-w-xl text-base leading-8 text-muted-foreground">
                Create the event, set the join rules, and open the gallery when you are ready. The rest of the workspace comes alive as soon as uploads and guest requests start flowing in.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                  <Link href="/events/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create your first event
                  </Link>
                </Button>
              </div>
            </div>

            <Empty className="rounded-[1.75rem] border-border/70 bg-secondary/45 p-10">
              <EmptyContent>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarDaysIcon className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No hosted events yet</EmptyTitle>
                  <EmptyDescription>
                    Start with one warm, welcoming event space and let the gallery grow from there.
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          </div>
        </ClientSurface>
      )}
    </div>
  )
}
