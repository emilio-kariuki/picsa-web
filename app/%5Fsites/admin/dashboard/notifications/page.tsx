'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircleIcon,
  BellRingIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FilterIcon,
  Loader2Icon,
  MegaphoneIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  SparklesIcon,
  UserRoundIcon,
  UsersIcon,
  XCircleIcon,
} from '@/components/ui/icons'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/empty-state'
import { KPICard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { listAdminEvents, type AdminEventSummary } from '@/lib/admin-events-api'
import {
  createAdminSystemNotification,
  getAdminNotificationBatchById,
  getAdminNotificationOverview,
  listAdminNotificationBatches,
  type AdminNotificationAudienceType,
  type AdminNotificationBatchDetail,
  type AdminNotificationBatchSortBy,
  type AdminNotificationBatchStatus,
  type AdminNotificationBatchSummary,
  type AdminNotificationBatchesQueryInput,
} from '@/lib/admin-notifications-api'
import { listAdminUsers, type AdminUserSummary } from '@/lib/admin-users-api'
import { isAdminApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const NOTIFICATION_BATCHES_QUERY_KEY = 'admin-notification-batches'
const NOTIFICATION_BATCH_QUERY_KEY = 'admin-notification-batch'
const NOTIFICATION_EVENTS_QUERY_KEY = 'admin-notification-events'
const NOTIFICATION_OVERVIEW_QUERY_KEY = 'admin-notification-overview'
const NOTIFICATION_RECIPIENTS_QUERY_KEY = 'admin-notification-recipients'
const NOTIFICATIONS_PAGE_SIZE = 24

const statusStyles: Record<
  AdminNotificationBatchStatus,
  {
    label: string
    badgeClassName: string
    panelClassName: string
    icon: typeof Clock3Icon
  }
> = {
  PENDING: {
    label: 'Queued',
    badgeClassName: 'bg-amber-100 text-amber-800',
    panelClassName: 'border-amber-200/70 bg-amber-50/60 text-amber-800',
    icon: Clock3Icon,
  },
  PROCESSING: {
    label: 'Delivering',
    badgeClassName: 'bg-sky-100 text-sky-800',
    panelClassName: 'border-sky-200/70 bg-sky-50/60 text-sky-800',
    icon: Loader2Icon,
  },
  COMPLETED: {
    label: 'Completed',
    badgeClassName: 'bg-emerald-100 text-emerald-800',
    panelClassName: 'border-emerald-200/70 bg-emerald-50/60 text-emerald-800',
    icon: CheckCircle2Icon,
  },
  FAILED: {
    label: 'Failed',
    badgeClassName: 'bg-rose-100 text-rose-800',
    panelClassName: 'border-rose-200/70 bg-rose-50/60 text-rose-800',
    icon: XCircleIcon,
  },
}

const audienceStyles: Record<
  AdminNotificationAudienceType,
  {
    label: string
    description: string
    icon: typeof UsersIcon
    badgeClassName: string
  }
> = {
  ALL: {
    label: 'Everyone',
    description: 'All active users',
    icon: UsersIcon,
    badgeClassName: 'bg-violet-100 text-violet-800',
  },
  USER: {
    label: 'One user',
    description: 'Immediate direct notification',
    icon: UserRoundIcon,
    badgeClassName: 'bg-slate-100 text-slate-800',
  },
  USERS: {
    label: 'Selected users',
    description: 'Immediate targeted batch',
    icon: SparklesIcon,
    badgeClassName: 'bg-blue-100 text-blue-800',
  },
  EVENT: {
    label: 'One event',
    description: 'Immediate push to an event topic',
    icon: BellRingIcon,
    badgeClassName: 'bg-emerald-100 text-emerald-800',
  },
}

const sortOptions: Array<{
  value: AdminNotificationBatchSortBy
  label: string
}> = [
  { value: 'createdAt', label: 'Newest created' },
  { value: 'processedAt', label: 'Recently processed' },
  { value: 'status', label: 'Status' },
]

const sortOrderOptions = [
  { value: 'DESC', label: 'Newest first' },
  { value: 'ASC', label: 'Oldest first' },
] as const

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Not available'
  }

  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTimeAgo(value: string) {
  const timestamp = new Date(value).getTime()
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  if (diffDays === 1) {
    return 'Yesterday'
  }

  return `${diffDays}d ago`
}

function getInitials(name: string | null | undefined) {
  const parts = (name ?? '').split(/\s+/).filter(Boolean)

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NA'
  )
}

function getDisplayName(user: Pick<AdminUserSummary, 'name' | 'email' | 'id'>) {
  return user.name?.trim() || user.email || user.id
}

function getErrorMessage(error: unknown, fallback: string) {
  if (isAdminApiError(error) || error instanceof Error) {
    return error.message
  }

  return fallback
}

function buildNotificationsQueryInput(query: {
  page: number
  limit: number
  search: string
  sortBy: AdminNotificationBatchSortBy
  sortOrder: 'ASC' | 'DESC'
}): AdminNotificationBatchesQueryInput {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search || undefined,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  }
}

function NotificationBatchDetailSheet({
  batch,
  open,
  onOpenChange,
  isLoading,
  errorMessage,
}: {
  batch: AdminNotificationBatchDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  errorMessage?: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl p-4">
        <SheetHeader>
          <SheetTitle>Batch Details</SheetTitle>
          <SheetDescription>
            Inspect delivery status, audience scope, and any errors returned by the live admin
            notification pipeline.
          </SheetDescription>
        </SheetHeader>

        {isLoading && !batch ? (
          <div className="flex min-h-70 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : errorMessage && !batch ? (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : !batch ? (
          <div className="mt-6">
            <EmptyState
              icon={<BellRingIcon className="h-5 w-5" />}
              title="No batch selected"
              description="Choose a notification batch from the list to inspect its live details."
            />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="space-y-4 rounded-3xl border border-border/70 bg-muted/20 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn('border-0', statusStyles[batch.status].badgeClassName)}>
                  {statusStyles[batch.status].label}
                </Badge>
                <Badge className={cn('border-0', audienceStyles[batch.audienceType].badgeClassName)}>
                  {audienceStyles[batch.audienceType].label}
                </Badge>
                <Badge variant="outline">{batch.totalRecipients.toLocaleString()} recipients</Badge>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">{batch.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{batch.body}</p>
              </div>

              {batch.processingError && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  {batch.processingError}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDateTime(batch.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Processed</p>
                    <p className="font-medium">{formatDateTime(batch.processedAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Queue state</p>
                    <p className="font-medium">{statusStyles[batch.status].label}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Audience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Scope</p>
                    <p className="font-medium">{audienceStyles[batch.audienceType].label}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Description</p>
                    <p className="font-medium">{audienceStyles[batch.audienceType].description}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Recipients</p>
                    <p className="font-medium">{batch.totalRecipients.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Created By</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(batch.createdBy.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {batch.createdBy.name || batch.createdBy.email || 'Unknown admin'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{batch.createdBy.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Payload</CardTitle>
                <CardDescription>Structured metadata that shipped with this notification.</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(batch.data).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payload data was attached to this batch.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(batch.data).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3"
                      >
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {key}
                        </p>
                        <p className="mt-2 wrap-break-word text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

interface ComposerState {
  audienceType: AdminNotificationAudienceType
  title: string
  body: string
}

const initialComposerState: ComposerState = {
  audienceType: 'ALL',
  title: '',
  body: '',
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [sortBy, setSortBy] = useState<AdminNotificationBatchSortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeState, setComposeState] = useState<ComposerState>(initialComposerState)
  const [recipientSearch, setRecipientSearch] = useState('')
  const deferredRecipientSearch = useDeferredValue(recipientSearch)
  const [eventSearch, setEventSearch] = useState('')
  const deferredEventSearch = useDeferredValue(eventSearch)
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<AdminUserSummary[]>([])
  const [selectedEvent, setSelectedEvent] = useState<AdminEventSummary | null>(null)

  const queryInput = useMemo(
    () =>
      buildNotificationsQueryInput({
        page,
        limit: NOTIFICATIONS_PAGE_SIZE,
        search: deferredSearch.trim(),
        sortBy,
        sortOrder,
      }),
    [deferredSearch, page, sortBy, sortOrder],
  )

  useEffect(() => {
    setPage(1)
  }, [deferredSearch, sortBy, sortOrder])

  const batchesQuery = useQuery({
    queryKey: [NOTIFICATION_BATCHES_QUERY_KEY, queryInput],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminNotificationBatches(accessToken, queryInput),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const overviewQuery = useQuery({
    queryKey: [NOTIFICATION_OVERVIEW_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) => getAdminNotificationOverview(accessToken)),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const selectedBatchQuery = useQuery({
    queryKey: [NOTIFICATION_BATCH_QUERY_KEY, selectedBatchId],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        getAdminNotificationBatchById(accessToken, selectedBatchId as string),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated && Boolean(selectedBatchId),
  })

  const recipientsQuery = useQuery({
    queryKey: [
      NOTIFICATION_RECIPIENTS_QUERY_KEY,
      composeOpen,
      composeState.audienceType,
      deferredRecipientSearch,
    ],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminUsers(accessToken, {
          page: 1,
          limit: 20,
          search: deferredRecipientSearch.trim() || undefined,
          sortBy: 'name',
          sortOrder: 'ASC',
          active: true,
        }),
      ),
    enabled:
      composeOpen &&
      bootstrapStatus === 'ready' &&
      isAuthenticated &&
      (composeState.audienceType === 'USER' || composeState.audienceType === 'USERS'),
  })

  const eventsQuery = useQuery({
    queryKey: [
      NOTIFICATION_EVENTS_QUERY_KEY,
      composeOpen,
      composeState.audienceType,
      deferredEventSearch,
    ],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminEvents(accessToken, {
          page: 1,
          limit: 20,
          search: deferredEventSearch.trim() || undefined,
          sortBy: 'updatedAt',
          sortOrder: 'DESC',
          status: 'ACTIVE',
        }),
      ),
    enabled:
      composeOpen &&
      bootstrapStatus === 'ready' &&
      isAuthenticated &&
      composeState.audienceType === 'EVENT',
  })

  const createBatchMutation = useMutation({
    mutationFn: async () =>
      performAuthenticatedRequest((accessToken) =>
        createAdminSystemNotification(accessToken, {
          audienceType: composeState.audienceType,
          title: composeState.title.trim(),
          body: composeState.body.trim(),
          userId: composeState.audienceType === 'USER' ? selectedUser?.id : undefined,
          userIds:
            composeState.audienceType === 'USERS'
              ? selectedUsers.map((user) => user.id)
              : undefined,
          eventId: composeState.audienceType === 'EVENT' ? selectedEvent?.id : undefined,
        }),
      ),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_BATCHES_QUERY_KEY],
      })
      void queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_OVERVIEW_QUERY_KEY],
      })
      setSelectedBatchId(response.data.batch.id)
      toast.success(response.message)
      handleComposeOpenChange(false)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to create the notification batch'))
    },
  })

  const batches = batchesQuery.data?.data.items ?? []
  const paginatedData = batchesQuery.data?.data
  const overview = overviewQuery.data?.data.overview
  const totalPages = Math.max(1, Math.ceil((paginatedData?.totalCount ?? 0) / NOTIFICATIONS_PAGE_SIZE))
  const visibleFrom = paginatedData ? (paginatedData.page - 1) * paginatedData.limit + 1 : 0
  const visibleTo = paginatedData
    ? Math.min(paginatedData.page * paginatedData.limit, paginatedData.totalCount)
    : 0
  const inFlightCount = (overview?.pendingCount ?? 0) + (overview?.processingCount ?? 0)

  const selectedBatch =
    selectedBatchQuery.data?.data.batch ??
    batches.find((batch) => batch.id === selectedBatchId) ??
    null

  const canSubmitComposer =
    composeState.title.trim().length >= 3 &&
    composeState.body.trim().length >= 3 &&
    (composeState.audienceType === 'ALL' ||
      (composeState.audienceType === 'USER' && Boolean(selectedUser)) ||
      (composeState.audienceType === 'USERS' && selectedUsers.length > 0) ||
      (composeState.audienceType === 'EVENT' && Boolean(selectedEvent)))

  function handleComposeOpenChange(open: boolean) {
    setComposeOpen(open)

    if (!open) {
      setComposeState(initialComposerState)
      setRecipientSearch('')
      setEventSearch('')
      setSelectedUser(null)
      setSelectedUsers([])
      setSelectedEvent(null)
    }
  }

  function handleAudienceTypeChange(value: AdminNotificationAudienceType) {
    setComposeState((current) => ({
      ...current,
      audienceType: value,
    }))
    setRecipientSearch('')
    setEventSearch('')
    setSelectedUser(null)
    setSelectedUsers([])
    setSelectedEvent(null)
  }

  function handleToggleSelectedUser(user: AdminUserSummary) {
    setSelectedUsers((current) => {
      const exists = current.some((item) => item.id === user.id)

      if (exists) {
        return current.filter((item) => item.id !== user.id)
      }

      return [...current, user]
    })
  }

  async function refreshNotifications() {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [NOTIFICATION_BATCHES_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [NOTIFICATION_OVERVIEW_QUERY_KEY] }),
        selectedBatchId
          ? queryClient.invalidateQueries({
              queryKey: [NOTIFICATION_BATCH_QUERY_KEY, selectedBatchId],
            })
          : Promise.resolve(),
      ])

      toast.success('Notifications refreshed')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to refresh notifications'))
    }
  }

  function handleSubmitComposer() {
    if (!canSubmitComposer || createBatchMutation.isPending) {
      return
    }

    void createBatchMutation.mutateAsync()
  }

  const hasAnyError = batchesQuery.isError || overviewQuery.isError
  const recipients = recipientsQuery.data?.data.items ?? []
  const events = eventsQuery.data?.data.items ?? []
  const recipientsMessage = getErrorMessage(
    recipientsQuery.error,
    'Unable to load recipient suggestions right now.',
  )
  const eventsMessage = getErrorMessage(
    eventsQuery.error,
    'Unable to load event suggestions right now.',
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Monitor real system notification batches, queue health, and delivery outcomes across the platform."
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void refreshNotifications()}
              disabled={
                batchesQuery.isFetching || overviewQuery.isFetching || selectedBatchQuery.isFetching
              }
            >
              <RefreshCwIcon
                className={cn(
                  'mr-2 h-4 w-4',
                  (batchesQuery.isFetching || overviewQuery.isFetching || selectedBatchQuery.isFetching) &&
                    'animate-spin',
                )}
              />
              Refresh
            </Button>
            <Button onClick={() => handleComposeOpenChange(true)}>
              <SendIcon className="mr-2 h-4 w-4" />
              New broadcast
            </Button>
          </div>
        )}
      />

      {hasAnyError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircleIcon className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-destructive">
                Some notification data could not be loaded.
              </p>
              <p className="text-muted-foreground">
                {getErrorMessage(
                  batchesQuery.error ?? overviewQuery.error,
                  'A live notifications endpoint returned an error.',
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Batches"
          value={overview?.totalCount ?? paginatedData?.totalCount ?? '—'}
          icon={<MegaphoneIcon className="h-5 w-5 text-violet-700" />}
          className="border-violet-200/70 bg-violet-50/40"
        />
        <KPICard
          title="In Flight"
          value={overview ? inFlightCount : '—'}
          icon={<Clock3Icon className="h-5 w-5 text-amber-700" />}
          className="border-amber-200/70 bg-amber-50/40"
        />
        <KPICard
          title="Completed"
          value={overview?.completedCount ?? '—'}
          icon={<CheckCircle2Icon className="h-5 w-5 text-emerald-700" />}
          className="border-emerald-200/70 bg-emerald-50/40"
        />
        <KPICard
          title="Failed"
          value={overview?.failedCount ?? '—'}
          icon={<XCircleIcon className="h-5 w-5 text-rose-700" />}
          className="border-rose-200/70 bg-rose-50/40"
        />
      </div>

      {overview && inFlightCount > 0 && (
        <Card className="overflow-hidden border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(255,255,255,0.9))]">
          <CardContent className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900">Delivery queue active</p>
              <p className="text-sm text-amber-900/80">
                {inFlightCount.toLocaleString()} live batch
                {inFlightCount === 1 ? '' : 'es'} are still being processed by the notification
                pipeline.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-900/80">
              <Badge className="border-0 bg-amber-200/70 text-amber-900">
                {overview.pendingCount.toLocaleString()} queued
              </Badge>
              <Badge className="border-0 bg-sky-100 text-sky-900">
                {overview.processingCount.toLocaleString()} delivering
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
          <Card className="border-border/70">
            <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 lg:max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search titles and message bodies..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as AdminNotificationBatchSortBy)}>
                  <SelectTrigger className="min-w-45">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'ASC' | 'DESC')}>
                  <SelectTrigger className="min-w-37.5">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOrderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {batchesQuery.isLoading ? (
            <Card className="border-border/70">
              <CardContent className="flex min-h-80 items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Spinner className="h-5 w-5" />
                  Loading live notification batches...
                </div>
              </CardContent>
            </Card>
          ) : batches.length === 0 ? (
            <Card className="border-border/70">
              <CardContent className="py-16">
                <EmptyState
                  icon={<BellRingIcon className="h-6 w-6" />}
                  title={deferredSearch ? 'No matching batches' : 'No notification batches yet'}
                  description={
                    deferredSearch
                      ? 'Try a different search term to widen the live results.'
                      : 'Send your first broadcast to create a durable notification batch and start tracking delivery.'
                  }
                  action={
                    <Button onClick={() => handleComposeOpenChange(true)}>
                      <SendIcon className="mr-2 h-4 w-4" />
                      New broadcast
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-border/70">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Notification</TableHead>
                          <TableHead>Audience</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Recipients</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Processed</TableHead>
                          <TableHead>Created by</TableHead>
                          <TableHead className="w-28 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batches.map((batch) => {
                          const statusStyle = statusStyles[batch.status]
                          const audienceStyle = audienceStyles[batch.audienceType]
                          const StatusIcon = statusStyle.icon

                          return (
                            <TableRow
                              key={batch.id}
                              className={cn(selectedBatchId === batch.id && 'bg-muted/40')}
                            >
                              <TableCell className="align-top">
                                <div className="min-w-70 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">{batch.title}</p>
                                    {batch.processingError && (
                                      <Badge variant="destructive">Issue</Badge>
                                    )}
                                  </div>
                                  <p className="max-w-xl whitespace-normal text-sm text-muted-foreground">
                                    {batch.body}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="align-top">
                                <div className="space-y-2">
                                  <Badge className={cn('border-0', audienceStyle.badgeClassName)}>
                                    {audienceStyle.label}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="align-top">
                                <div className="space-y-2 ">
                                  <Badge className={cn('border-0', statusStyle.badgeClassName)}>
                                    <span className="inline-flex items-center gap-1.5">
                                      <StatusIcon
                                        className={cn(
                                          'h-3.5 w-3.5',
                                          batch.status === 'PROCESSING' && 'animate-spin',
                                        )}
                                      />
                                      {statusStyle.label}
                                    </span>
                                  </Badge>
                                  {batch.processingError && (
                                    <p className="max-w-55 whitespace-normal text-sm text-destructive">
                                      {batch.processingError}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="align-top text-sm text-muted-foreground">
                                {batch.totalRecipients.toLocaleString()}
                              </TableCell>
                              <TableCell className="align-top">
                                <div className="flex min-w-45 items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(batch.createdBy.name)}</AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="truncate font-medium">
                                      {batch.createdBy.name || batch.createdBy.email}
                                    </p>
                                    <p className="truncate text-sm text-muted-foreground">
                                      {batch.createdBy.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="align-top text-sm text-muted-foreground">
                                <div className="space-y-1">
                                  <p>{formatDateTime(batch.createdAt)}</p>
                                  <p>{formatTimeAgo(batch.createdAt)}</p>
                                </div>
                              </TableCell>
                              <TableCell className="align-top text-sm text-muted-foreground">
                                {batch.processedAt ? formatDateTime(batch.processedAt) : 'Waiting'}
                              </TableCell>
                              
                              <TableCell className="align-top text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedBatchId(batch.id)}
                                >
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {visibleFrom.toLocaleString()}-{visibleTo.toLocaleString()} of{' '}
                    {(paginatedData?.totalCount ?? 0).toLocaleString()} live batches
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page <= 1 || batchesQuery.isFetching}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={page >= totalPages || batchesQuery.isFetching}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
      </div>

      <NotificationBatchDetailSheet
        batch={selectedBatch}
        open={Boolean(selectedBatchId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBatchId(null)
          }
        }}
        isLoading={selectedBatchQuery.isLoading}
        errorMessage={
          selectedBatchQuery.isError
            ? getErrorMessage(
                selectedBatchQuery.error,
                'Unable to load this notification batch.',
              )
            : undefined
        }
      />

      <Dialog open={composeOpen} onOpenChange={handleComposeOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Broadcast</DialogTitle>
            <DialogDescription>
              Create a real system notification batch and send it through the live admin pipeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              Broadcasts sent to everyone are queued asynchronously. Single-user, selected-user,
              and event notifications are delivered immediately and recorded as targeted batches.
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notification-audience">Audience</Label>
              <Select
                value={composeState.audienceType}
                onValueChange={(value) => handleAudienceTypeChange(value as AdminNotificationAudienceType)}
              >
                <SelectTrigger id="notification-audience">
                  <SelectValue placeholder="Choose an audience" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(audienceStyles).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {audienceStyles[composeState.audienceType].description}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notification-title">Title</Label>
              <Input
                id="notification-title"
                value={composeState.title}
                onChange={(event) =>
                  setComposeState((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="System maintenance update"
                maxLength={120}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notification-body">Message</Label>
              <Textarea
                id="notification-body"
                value={composeState.body}
                onChange={(event) =>
                  setComposeState((current) => ({
                    ...current,
                    body: event.target.value,
                  }))
                }
                placeholder="Let users know what changed, what to expect, and whether any action is needed."
                maxLength={1000}
                rows={6}
              />
            </div>

            {(composeState.audienceType === 'USER' || composeState.audienceType === 'USERS') && (
              <div className="space-y-4 rounded-3xl border border-border/70 p-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipient-search">Recipients</Label>
                  <Input
                    id="recipient-search"
                    value={recipientSearch}
                    onChange={(event) => setRecipientSearch(event.target.value)}
                    placeholder="Search active users by name or email"
                  />
                </div>

                {composeState.audienceType === 'USER' && selectedUser && (
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Selected recipient
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={selectedUser.url ?? undefined} />
                        <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{getDisplayName(selectedUser)}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {selectedUser.email || selectedUser.id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {composeState.audienceType === 'USERS' && selectedUsers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Selected recipients
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map((user) => (
                        <Badge
                          key={user.id}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleToggleSelectedUser(user)}
                        >
                          {getDisplayName(user)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <ScrollArea className="h-64 rounded-2xl border border-border/70 bg-background">
                  <div className="space-y-2 p-2">
                    {recipientsQuery.isLoading ? (
                      <div className="flex h-40 items-center justify-center">
                        <Spinner className="h-5 w-5" />
                      </div>
                    ) : recipientsQuery.isError ? (
                      <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-destructive">
                        {recipientsMessage}
                      </div>
                    ) : recipients.length === 0 ? (
                      <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        No active users match this search.
                      </div>
                    ) : (
                      recipients.map((user) => {
                        const isSelectedSingle = selectedUser?.id === user.id
                        const isSelectedMany = selectedUsers.some((item) => item.id === user.id)
                        const isSelected =
                          composeState.audienceType === 'USER'
                            ? isSelectedSingle
                            : isSelectedMany

                        return (
                          <div
                            key={user.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              if (composeState.audienceType === 'USER') {
                                setSelectedUser(user)
                              } else {
                                handleToggleSelectedUser(user)
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter' && event.key !== ' ') {
                                return
                              }

                              event.preventDefault()

                              if (composeState.audienceType === 'USER') {
                                setSelectedUser(user)
                              } else {
                                handleToggleSelectedUser(user)
                              }
                            }}
                            className={cn(
                              'flex w-full cursor-pointer items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors',
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border/70 hover:bg-muted/40',
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {composeState.audienceType === 'USERS' ? (
                                <Checkbox
                                  checked={isSelectedMany}
                                  className="pointer-events-none"
                                />
                              ) : (
                                <div
                                  className={cn(
                                    'h-4 w-4 rounded-full border',
                                    isSelectedSingle && 'border-primary bg-primary',
                                  )}
                                />
                              )}
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.url ?? undefined} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{getDisplayName(user)}</p>
                                <p className="truncate text-sm text-muted-foreground">
                                  {user.email || user.id}
                                </p>
                              </div>
                            </div>
                            {isSelected && <Badge variant="secondary">Selected</Badge>}
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {composeState.audienceType === 'EVENT' && (
              <div className="space-y-4 rounded-3xl border border-border/70 p-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-search">Event</Label>
                  <Input
                    id="event-search"
                    value={eventSearch}
                    onChange={(event) => setEventSearch(event.target.value)}
                    placeholder="Search active events by name or slug"
                  />
                </div>

                {selectedEvent && (
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Selected event
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="font-medium">{selectedEvent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Host: {selectedEvent.host.name || selectedEvent.host.email || selectedEvent.host.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedEvent.memberCount + 1).toLocaleString()} expected recipients
                      </p>
                    </div>
                  </div>
                )}

                <ScrollArea className="h-64 rounded-2xl border border-border/70 bg-background">
                  <div className="space-y-2 p-2">
                    {eventsQuery.isLoading ? (
                      <div className="flex h-40 items-center justify-center">
                        <Spinner className="h-5 w-5" />
                      </div>
                    ) : eventsQuery.isError ? (
                      <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-destructive">
                        {eventsMessage}
                      </div>
                    ) : events.length === 0 ? (
                      <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        No active events match this search.
                      </div>
                    ) : (
                      events.map((event) => {
                        const isSelected = selectedEvent?.id === event.id

                        return (
                          <div
                            key={event.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedEvent(event)}
                            onKeyDown={(keyboardEvent) => {
                              if (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' ') {
                                return
                              }

                              keyboardEvent.preventDefault()
                              setSelectedEvent(event)
                            }}
                            className={cn(
                              'flex w-full cursor-pointer items-start justify-between rounded-2xl border px-3 py-3 text-left transition-colors',
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border/70 hover:bg-muted/40',
                            )}
                          >
                            <div className="min-w-0 space-y-1">
                              <p className="truncate font-medium">{event.name}</p>
                              <p className="truncate text-sm text-muted-foreground">
                                Host: {event.host.name || event.host.email || event.host.id}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {event.memberCount + 1} expected recipients
                              </p>
                            </div>
                            {isSelected && <Badge variant="secondary">Selected</Badge>}
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleComposeOpenChange(false)}
              disabled={createBatchMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitComposer} disabled={!canSubmitComposer || createBatchMutation.isPending}>
              {createBatchMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                <>
                  <SendIcon className="mr-2 h-4 w-4" />
                  {composeState.audienceType === 'ALL' ? 'Queue broadcast' : 'Send notification'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
