import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useDeferredValue, useEffect, useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArchiveIcon,
  EyeIcon,
  FolderKanbanIcon,
  GlobeIcon,
  ImageIcon,
  LockIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SearchIcon,
  UsersIcon,
} from '@/components/ui/icons'
import { toast } from 'sonner'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import {
  type AdminEventsQueryInput,
  type AdminEventStatusValue,
  type AdminEventSummary,
  listAdminEvents,
  updateAdminEventStatus,
} from '@/lib/admin-events-api'
import { getAdminOverview } from '@/lib/admin-overview-api'
import {
  formatEventDateTime,
  formatEventJoinMode,
  getEventHostDisplayName,
  getEventHostInitials,
} from '@/lib/admin-events-format'
import {
  adminEventsActionAtom,
  adminEventsActionReasonAtom,
  adminEventsJoinModeFilterAtom,
  adminEventsPageAtom,
  adminEventsPrivacyFilterAtom,
  adminEventsSearchInputAtom,
  adminEventsSortByAtom,
  adminEventsSortOrderAtom,
  adminEventsStatusFilterAtom,
  type EventJoinModeFilterValue,
  type EventPrivacyFilterValue,
  type EventStatusFilterValue,
} from '@/lib/events-page-state'
import { isAdminApiError } from '@/lib/api'
import { PageHeader } from '@/components/common/page-header'
import { KPICard } from '@/components/common/kpi-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

const EVENTS_QUERY_KEY = 'admin-events'
const OVERVIEW_QUERY_KEY = 'admin-overview'
const EVENTS_PAGE_SIZE = 20

function buildEventsQueryInput(query: {
  page: number
  limit: number
  search: string
  status: EventStatusFilterValue
  joinMode: EventJoinModeFilterValue
  privacy: EventPrivacyFilterValue
  sortBy: AdminEventsQueryInput['sortBy']
  sortOrder: AdminEventsQueryInput['sortOrder']
}): AdminEventsQueryInput {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search || undefined,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    status: query.status === 'all' ? undefined : query.status,
    joinMode: query.joinMode === 'all' ? undefined : query.joinMode,
    isPrivate:
      query.privacy === 'all'
        ? undefined
        : query.privacy === 'private',
  }
}

function EventsPage() {
  const queryClient = useQueryClient()
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()
  const [searchInput, setSearchInput] = useAtom(adminEventsSearchInputAtom)
  const deferredSearch = useDeferredValue(searchInput.trim())
  const [page, setPage] = useAtom(adminEventsPageAtom)
  const [statusFilter, setStatusFilter] = useAtom(adminEventsStatusFilterAtom)
  const [joinModeFilter, setJoinModeFilter] = useAtom(adminEventsJoinModeFilterAtom)
  const [privacyFilter, setPrivacyFilter] = useAtom(adminEventsPrivacyFilterAtom)
  const [sortBy, setSortBy] = useAtom(adminEventsSortByAtom)
  const [sortOrder, setSortOrder] = useAtom(adminEventsSortOrderAtom)
  const [eventAction, setEventAction] = useAtom(adminEventsActionAtom)
  const [actionReason, setActionReason] = useAtom(adminEventsActionReasonAtom)
  const clearActionReason = useSetAtom(adminEventsActionReasonAtom)

  useEffect(() => {
    setPage(1)
  }, [deferredSearch, joinModeFilter, privacyFilter, sortBy, sortOrder, statusFilter])

  const queryInput = useMemo(
    () =>
      buildEventsQueryInput({
        page,
        limit: EVENTS_PAGE_SIZE,
        search: deferredSearch,
        status: statusFilter,
        joinMode: joinModeFilter,
        privacy: privacyFilter,
        sortBy,
        sortOrder,
      }),
    [
      deferredSearch,
      joinModeFilter,
      page,
      privacyFilter,
      sortBy,
      sortOrder,
      statusFilter,
    ],
  )

  const eventsQuery = useQuery({
    queryKey: [EVENTS_QUERY_KEY, queryInput],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminEvents(accessToken, queryInput),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
    placeholderData: (previousData) => previousData,
  })

  const overviewQuery = useQuery({
    queryKey: [OVERVIEW_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) => getAdminOverview(accessToken)),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const refreshEvents = async () => {
    try {
      await Promise.all([eventsQuery.refetch(), overviewQuery.refetch()])
      toast.success('Events refreshed')
    } catch (error) {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to refresh events'
      toast.error(message)
    }
  }

  const statusMutation = useMutation({
    mutationFn: async (input: {
      eventId: string
      status: AdminEventStatusValue
      reason: string
    }) =>
      performAuthenticatedRequest((accessToken) =>
        updateAdminEventStatus(accessToken, input.eventId, {
          status: input.status,
          reason: input.reason,
        }),
      ),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: ['admin-event', variables.eventId] }),
        queryClient.invalidateQueries({ queryKey: [OVERVIEW_QUERY_KEY] }),
      ])
      setEventAction(null)
      clearActionReason('')
      toast.success(
        variables.status === 'ARCHIVED'
          ? 'Event archived'
          : 'Event restored',
      )
    },
    onError: (error) => {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to update event status'
      toast.error(message)
    },
  })

  const events = eventsQuery.data?.data.items ?? []
  const overview = overviewQuery.data?.data.overview
  const totalCount = eventsQuery.data?.data.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / EVENTS_PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const activeInView = events.filter((event) => event.status === 'ACTIVE').length
  const archivedInView = events.filter((event) => event.status === 'ARCHIVED').length
  const privateInView = events.filter((event) => event.isPrivate).length
  const canSubmitAction = actionReason.trim().length >= 3

  const handleConfirmAction = async () => {
    if (!eventAction || !canSubmitAction) {
      return
    }

    await statusMutation.mutateAsync({
      eventId: eventAction.event.id,
      status: eventAction.nextStatus,
      reason: actionReason.trim(),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Review hosted events, restore archived spaces, and inspect operational event state."
        actions={
          <Button
            variant="outline"
            onClick={() => void refreshEvents()}
            disabled={eventsQuery.isFetching || overviewQuery.isFetching}
          >
            {eventsQuery.isFetching || overviewQuery.isFetching ? (
              <Spinner className="mr-2 size-4" />
            ) : (
              <RefreshCwIcon className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Matching events"
          value={totalCount.toLocaleString()}
          change={overview ? Math.round((totalCount / Math.max(overview.totalEvents, 1)) * 100) : 0}
          changeLabel="of total inventory"
          icon={<FolderKanbanIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Active events"
          value={(overview?.activeEvents ?? activeInView).toLocaleString()}
          change={overview ? Math.round((overview.activeEvents / Math.max(overview.totalEvents, 1)) * 100) : 0}
          changeLabel="currently live"
          icon={<UsersIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Archived events"
          value={(overview?.archivedEvents ?? archivedInView).toLocaleString()}
          change={overview ? Math.round((overview.archivedEvents / Math.max(overview.totalEvents, 1)) * 100) : 0}
          changeLabel="in storage"
          icon={<ArchiveIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Private in view"
          value={privateInView.toLocaleString()}
          change={Math.round((privateInView / Math.max(events.length, 1)) * 100)}
          changeLabel="of visible rows"
          icon={<LockIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
      </div>

      <Card className="border-border/70 bg-card/80 p-4 shadow-none">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by event name, slug, or id"
                className="h-11 rounded-xl border-border/70 bg-background pl-10 shadow-none"
              />
            </div>
            <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/35 px-3 py-1.5 text-sm text-muted-foreground">
              Showing <span className="mx-1 font-semibold text-foreground">{events.length}</span> of{' '}
              <span className="mx-1 font-semibold text-foreground">{totalCount}</span> events
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Filter
              </span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as EventStatusFilterValue)}
              >
                <SelectTrigger className="h-10 w-37.5 rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={joinModeFilter}
                onValueChange={(value) => setJoinModeFilter(value as EventJoinModeFilterValue)}
              >
                <SelectTrigger className="h-10 w-47.5 rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Join mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All join modes</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="APPROVAL_REQUIRED">Approval required</SelectItem>
                  <SelectItem value="INVITE_ONLY">Invite only</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={privacyFilter}
                onValueChange={(value) => setPrivacyFilter(value as EventPrivacyFilterValue)}
              >
                <SelectTrigger className="h-10 w-37.5 rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All privacy</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Sort
              </span>
              <Select
                value={sortBy ?? 'createdAt'}
                onValueChange={(value) =>
                  setSortBy(value as NonNullable<AdminEventsQueryInput['sortBy']>)
                }
              >
                <SelectTrigger className="h-10 w-41.25 rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created date</SelectItem>
                  <SelectItem value="updatedAt">Updated date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="memberCount">Members</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortOrder ?? 'DESC'}
                onValueChange={(value) =>
                  setSortOrder(value as NonNullable<AdminEventsQueryInput['sortOrder']>)
                }
              >
                <SelectTrigger className="h-10 w-38.75 rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESC">Newest first</SelectItem>
                  <SelectItem value="ASC">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        {eventsQuery.isLoading ? (
          <div className="flex min-h-80 flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-45" />
                  <Skeleton className="h-3 w-30" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="hidden h-4 w-22.5 sm:block" />
              </div>
            ))}
          </div>
        ) : eventsQuery.isError ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Unable to load events</h2>
                <p className="text-sm text-muted-foreground">
                  {isAdminApiError(eventsQuery.error) || eventsQuery.error instanceof Error
                    ? eventsQuery.error.message
                    : 'Something went wrong while loading the event list.'}
                </p>
              </div>
              <Button onClick={() => void eventsQuery.refetch()}>Try again</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Limits</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                        No events matched your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Link
                            to="/admin/dashboard/events/$eventId"
                            params={{ eventId: event.id }}
                            className="block w-full text-left"                          >
                            <div className="space-y-1.5 max-w-sm">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{event.name}</p>
                                
                              </div>
                              <p className="line-clamp-1 text-sm text-muted-foreground">
                                {event.description || ''}
                              </p>
                              {/* <p className="text-xs text-muted-foreground">/{event.url}</p> */}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={event.host.url ?? undefined} />
                              <AvatarFallback>{getEventHostInitials(event)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <p className="font-medium">{getEventHostDisplayName(event)}</p>
                              <p className="text-sm text-muted-foreground">
                                {event.host.email ?? 'No email address'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{formatEventJoinMode(event.joinMode)}</Badge>
                            <Badge variant="secondary" className="gap-1">
                              {event.isPrivate ? (
                                <LockIcon className="h-3.5 w-3.5" />
                              ) : (
                                <GlobeIcon className="h-3.5 w-3.5" />
                              )}
                              {event.isPrivate ? 'Private' : 'Public'}
                            </Badge>
                            <StatusBadge status={event.status.toLowerCase()} />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {event.memberCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="space-y-1">
                            <p>{event.maxGuests.toLocaleString()} guests</p>
                            <p>{event.maxImages.toLocaleString()} images</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatEventDateTime(event.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link to="/admin/dashboard/events/$eventId" params={{ eventId: event.id }}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  clearActionReason('')
                                  setEventAction({
                                    event,
                                    nextStatus:
                                      event.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE',
                                  })
                                }}
                              >
                                <ArchiveIcon className="mr-2 h-4 w-4" />
                                {event.status === 'ACTIVE' ? 'Archive event' : 'Restore event'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || eventsQuery.isFetching}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || eventsQuery.isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Dialog open={Boolean(eventAction)} onOpenChange={(open) => !open && setEventAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {eventAction?.nextStatus === 'ARCHIVED' ? 'Archive event' : 'Restore event'}
            </DialogTitle>
            <DialogDescription>
              {eventAction?.nextStatus === 'ARCHIVED'
                ? 'Move this event out of the active surface while preserving its data.'
                : 'Bring this event back into the active event inventory.'}
            </DialogDescription>
          </DialogHeader>

          {eventAction ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="font-medium">{eventAction.event.name}</p>
                <p className="text-sm text-muted-foreground">/{eventAction.event.url}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-status-reason">Reason</Label>
                <Textarea
                  id="event-status-reason"
                  value={actionReason}
                  onChange={(event) => setActionReason(event.target.value)}
                  placeholder="Add a short reason for this status change"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This reason is stored in the audit trail.
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEventAction(null)}
              disabled={statusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmAction()}
              disabled={!canSubmitAction || statusMutation.isPending}
            >
              {statusMutation.isPending ? <Spinner className="mr-2 size-4" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const Route = createFileRoute('/admin/dashboard/events')({
  component: EventsPage,
})

