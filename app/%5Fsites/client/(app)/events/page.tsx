'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, CalendarDaysIcon, PlusIcon, UsersIcon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

    return {
      totalGuests,
      privateCount,
    }
  }, [hostedEventsQuery.data])

  if (hostedEventsQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    )
  }

  const events = hostedEventsQuery.data ?? []

  return (
    <div className="space-y-6">
      <ClientPageHeader
        eyebrow="Hosted events"
        title="All the gatherings you are running"
        description="Track active events, keep an eye on guest counts, and jump into the gallery or people management without losing the landing-page warmth."
        // actions={
          // <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          //   <Link href="/events/new">
          //     <PlusIcon className="mr-2 h-4 w-4" />
          //     New event
          //   </Link>
          // </Button>
        // }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ClientMetricCard label="Hosted events" value={String(events.length)} helper="Every event you currently own." />
        <ClientMetricCard label="Guests total" value={String(metrics.totalGuests)} helper="Combined active membership across your events." />
        <ClientMetricCard label="Private events" value={String(metrics.privateCount)} helper="Spaces that stay invitation-first." />
      </div>

      <ClientSurface className="overflow-hidden">
        {events.length ? (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Desktop table</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Hosted event roster</h2>
              </div>
              <p className="text-sm text-muted-foreground">{events.length} events</p>
            </div>

            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/70">
                    <TableHead className="px-4">Event</TableHead>
                    <TableHead className="px-4">Join mode</TableHead>
                    <TableHead className="px-4">Guests</TableHead>
                    <TableHead className="px-4">Window</TableHead>
                    <TableHead className="px-4">Updated</TableHead>
                    <TableHead className="px-4 text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="border-border/60">
                      <TableCell className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{event.name}</p>
                          <p className="max-w-md text-sm text-muted-foreground">
                            {event.description || 'No description yet.'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <Badge variant="outline" className="rounded-full border-accent/35 bg-accent/10 px-3 py-1 text-accent">
                          {getJoinModeLabel(event.settings.joinMode)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4">{event.memberCount}</TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground">
                        {formatEventWindow(event.startAt, event.endAt)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground">
                        {formatDateShort(event.updatedAt)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right">
                        <Button asChild variant="ghost" className="rounded-full">
                          <Link href={`/events/${event.id}`}>
                            Open
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(35,30,27,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-2xl font-semibold tracking-tight text-foreground">{event.name}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.description || 'No description yet.'}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-accent/35 bg-accent/10 px-3 py-1 text-accent">
                      {getJoinModeLabel(event.settings.joinMode)}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
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
          </>
        ) : (
          <div className="rounded-[1.5rem] border border-border/70 bg-secondary/35 p-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">No hosted events</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight">Create your first event</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              Once you create an event, this table becomes the place to revisit every gallery, guest list, and permission setting.
            </p>
            <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
              <Link href="/events/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create event
              </Link>
            </Button>
          </div>
        )}
      </ClientSurface>
    </div>
  )
}
