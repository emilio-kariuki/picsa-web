'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, CalendarDaysIcon, PlusIcon, UsersIcon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ClientMetricCard, ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import { fetchHostedEvents } from '@/lib/client-api'
import { formatDateShort, formatEventWindow, getJoinModeLabel } from '@/lib/client-view'

export default function ClientEventsPage() {
  const { performAuthenticatedRequest } = useClientAuth()

  const hostedEventsQuery = useQuery({
    queryKey: ['client', 'hosted-events'],
    queryFn: () => performAuthenticatedRequest((token) => fetchHostedEvents(token)),
  })

  const metrics = useMemo(() => {
    const events = hostedEventsQuery.data ?? []
    const totalGuests = events.reduce((sum, event) => sum + event.memberCount, 0)
    const privateCount = events.filter((event) => event.settings.isPrivate).length
    return { totalGuests, privateCount }
  }, [hostedEventsQuery.data])

  if (hostedEventsQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading your events…</p>
        </div>
      </div>
    )
  }

  const events = hostedEventsQuery.data ?? []

  if (!events.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
          <CalendarDaysIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-foreground">No hosted events yet</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Create your first event to start collecting photos and managing guests.
        </p>
        <Button
          asChild
          className="mt-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link href="/events/new">
            <PlusIcon className="h-4 w-4" />
            Create event
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ClientPageHeader
        title="Events"
        description="All the events you're currently hosting."
        actions={
          <Button asChild className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/events/new">
              <PlusIcon className="h-4 w-4" />
              New event
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <ClientMetricCard label="Total events" value={String(events.length)} />
        <ClientMetricCard label="Total guests" value={String(metrics.totalGuests)} />
        <ClientMetricCard label="Private events" value={String(metrics.privateCount)} />
      </div>

      {/* Desktop table */}
      <ClientSurface className="hidden overflow-hidden p-0 lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Event</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Join mode</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Guests</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Window</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Updated</th>
              <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((event) => (
              <tr key={event.id} className="group transition-colors hover:bg-secondary/40">
                <td className="px-5 py-4">
                  <p className="font-medium text-foreground">{event.name}</p>
                  <p className="mt-0.5 max-w-xs truncate text-sm text-muted-foreground">
                    {event.description || 'No description'}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {getJoinModeLabel(event.settings.joinMode)}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-sm text-foreground">{event.memberCount}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {formatEventWindow(event.startAt, event.endAt)}
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {formatDateShort(event.updatedAt)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-accent">
                    <Link href={`/events/${event.id}`}>
                      Open
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ClientSurface>

      {/* Mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-colors hover:bg-secondary/40"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{event.name}</p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
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
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        ))}
      </div>
    </div>
  )
}
