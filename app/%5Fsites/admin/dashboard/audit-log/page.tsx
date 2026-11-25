'use client'

import { useDeferredValue, useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import {
  ActivityIcon,
  BotIcon,
  ChevronDownIcon,
  Clock3Icon,
  EyeIcon,
  GlobeIcon,
  RefreshCwIcon,
  SearchIcon,
  ServerCogIcon,
  ShieldAlertIcon,
  WorkflowIcon,
} from '@/components/ui/icons'
import { toast } from 'sonner'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import {
  getAdminAuditLogById,
  listAdminAuditLogs,
  type AdminAuditLogsQueryInput,
  type AdminAuditLogSummary,
} from '@/lib/admin-audit-logs-api'
import {
  formatAuditAction,
  formatAuditDateTime,
  formatAuditDuration,
  getAuditActorDisplayName,
  getAuditActorInitials,
  getAuditChannelTone,
  getAuditOutcomeTone,
  getAuditResourceLabel,
  getAuditSurfaceLabel,
  stringifyAuditJson,
} from '@/lib/admin-audit-format'
import { isAdminApiError } from '@/lib/api'
import { getAdminAnalytics } from '@/lib/admin-overview-api'
import {
  adminAuditLogsChannelFilterAtom,
  adminAuditLogsMethodFilterAtom,
  adminAuditLogsOutcomeFilterAtom,
  adminAuditLogsPageAtom,
  adminAuditLogsSearchInputAtom,
  adminAuditLogsSelectedAuditLogIdAtom,
  adminAuditLogsSortByAtom,
  adminAuditLogsSortOrderAtom,
  type AuditChannelFilterValue,
  type AuditMethodFilterValue,
  type AuditOutcomeFilterValue,
} from '@/lib/audit-log-page-state'
import { PageHeader } from '@/components/common/page-header'
import { KPICard } from '@/components/common/kpi-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const AUDIT_LOGS_QUERY_KEY = 'admin-audit-logs'
const AUDIT_LOG_QUERY_KEY = 'admin-audit-log'
const AUDIT_LOGS_PAGE_SIZE = 20

function buildAuditLogsQueryInput(query: {
  page: number
  limit: number
  search: string
  channel: AuditChannelFilterValue
  outcome: AuditOutcomeFilterValue
  method: AuditMethodFilterValue
  sortBy: AdminAuditLogsQueryInput['sortBy']
  sortOrder: AdminAuditLogsQueryInput['sortOrder']
}): AdminAuditLogsQueryInput {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search || undefined,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    channel: query.channel === 'all' ? undefined : query.channel,
    outcome: query.outcome === 'all' ? undefined : query.outcome,
    method: query.method === 'all' ? undefined : query.method,
  }
}

function getSurfaceIcon(log: Pick<AdminAuditLogSummary, 'channel'>) {
  switch (log.channel) {
    case 'HTTP':
      return GlobeIcon
    case 'SOCKET':
      return WorkflowIcon
    case 'QUEUE':
      return BotIcon
    case 'SYSTEM':
      return ServerCogIcon
    default:
      return ActivityIcon
  }
}

function getAverageDuration(logs: AdminAuditLogSummary[]) {
  const durations = logs
    .map((log) => log.durationMs)
    .filter((duration): duration is number => duration != null)

  if (durations.length === 0) {
    return null
  }

  return Math.round(
    durations.reduce((sum, duration) => sum + duration, 0) / durations.length,
  )
}

export default function AuditLogPage() {
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()
  const [searchInput, setSearchInput] = useAtom(adminAuditLogsSearchInputAtom)
  const deferredSearch = useDeferredValue(searchInput.trim())
  const [page, setPage] = useAtom(adminAuditLogsPageAtom)
  const [channelFilter, setChannelFilter] = useAtom(adminAuditLogsChannelFilterAtom)
  const [outcomeFilter, setOutcomeFilter] = useAtom(adminAuditLogsOutcomeFilterAtom)
  const [methodFilter, setMethodFilter] = useAtom(adminAuditLogsMethodFilterAtom)
  const [sortBy, setSortBy] = useAtom(adminAuditLogsSortByAtom)
  const [sortOrder, setSortOrder] = useAtom(adminAuditLogsSortOrderAtom)
  const [selectedAuditLogId, setSelectedAuditLogId] = useAtom(adminAuditLogsSelectedAuditLogIdAtom)

  useEffect(() => {
    setPage(1)
  }, [
    channelFilter,
    deferredSearch,
    methodFilter,
    outcomeFilter,
    setPage,
    sortBy,
    sortOrder,
  ])

  const queryInput = useMemo(
    () =>
      buildAuditLogsQueryInput({
        page,
        limit: AUDIT_LOGS_PAGE_SIZE,
        search: deferredSearch,
        channel: channelFilter,
        outcome: outcomeFilter,
        method: methodFilter,
        sortBy,
        sortOrder,
      }),
    [
      channelFilter,
      deferredSearch,
      methodFilter,
      outcomeFilter,
      page,
      sortBy,
      sortOrder,
    ],
  )

  const auditLogsQuery = useQuery({
    queryKey: [AUDIT_LOGS_QUERY_KEY, queryInput],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminAuditLogs(accessToken, queryInput),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
    placeholderData: (previousData) => previousData,
  })

  const analyticsQuery = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) => getAdminAnalytics(accessToken)),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })
  const topRoutes = analyticsQuery.data?.data.analytics.topRoutes ?? []

  const selectedAuditLogQuery = useQuery({
    queryKey: [AUDIT_LOG_QUERY_KEY, selectedAuditLogId],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        getAdminAuditLogById(accessToken, selectedAuditLogId!),
      ),
    enabled: Boolean(
      selectedAuditLogId &&
        bootstrapStatus === 'ready' &&
        isAuthenticated,
    ),
  })

  const refreshAuditLogs = async () => {
    try {
      await auditLogsQuery.refetch()
      if (selectedAuditLogId) {
        await selectedAuditLogQuery.refetch()
      }
      toast.success('Audit logs refreshed')
    } catch (error) {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to refresh audit logs'
      toast.error(message)
    }
  }

  const logs = auditLogsQuery.data?.data.items ?? []
  const totalCount = auditLogsQuery.data?.data.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / AUDIT_LOGS_PAGE_SIZE))
  const selectedAuditLog = selectedAuditLogQuery.data?.data.auditLog ?? null
  const failureCount = logs.filter((log) => log.outcome === 'FAILURE').length
  const queueCount = logs.filter((log) => log.channel === 'QUEUE').length
  const averageDuration = getAverageDuration(logs)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, setPage, totalPages])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Trace every request surface, queue handoff, and chat event from one place."
        actions={
          <Button
            variant="outline"
            onClick={() => void refreshAuditLogs()}
            disabled={auditLogsQuery.isFetching || selectedAuditLogQuery.isFetching}
          >
            {auditLogsQuery.isFetching || selectedAuditLogQuery.isFetching ? (
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
          title="Matching entries"
          value={totalCount.toLocaleString()}
          change={Math.round((logs.length / Math.max(totalCount, 1)) * 100)}
          changeLabel="visible on this page"
          icon={<ActivityIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Failures in view"
          value={failureCount.toLocaleString()}
          change={Math.round((failureCount / Math.max(logs.length, 1)) * 100)}
          changeLabel="of visible rows"
          icon={<ShieldAlertIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Queue activity"
          value={queueCount.toLocaleString()}
          change={Math.round((queueCount / Math.max(logs.length, 1)) * 100)}
          changeLabel="of visible rows"
          icon={<BotIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Average duration"
          value={averageDuration == null ? '—' : formatAuditDuration(averageDuration)}
          icon={<Clock3Icon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
      </div>

      {topRoutes.length > 0 && (
        <Collapsible>
          <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between px-6 py-4 text-left">
                <div>
                  <h3 className="text-xl font-semibold leading-none tracking-tight">Top endpoints (30d)</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Most frequently hit API routes by authenticated users.
                  </p>
                </div>
                <ChevronDownIcon className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6">
                <div className="space-y-2">
                  {topRoutes.map((route) => (
                    <div
                      key={route.route}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
                    >
                      <code className="text-sm font-medium">{route.route}</code>
                      <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs">
                        {route.count.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      <Card className="border-border/70 bg-card/80 p-4 shadow-none">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search actions, routes, queues, errors, or actors"
                className="h-11 rounded-xl border-border/70 bg-background pl-10 shadow-none"
              />
            </div>
            <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/35 px-3 py-1.5 text-sm text-muted-foreground">
              Showing <span className="mx-1 font-semibold text-foreground">{logs.length}</span> of{' '}
              <span className="mx-1 font-semibold text-foreground">{totalCount}</span> entries
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Filter
              </span>
              <Select
                value={channelFilter}
                onValueChange={(value) => setChannelFilter(value as AuditChannelFilterValue)}
              >
                <SelectTrigger className="h-10 w-[155px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="HTTP">HTTP</SelectItem>
                  <SelectItem value="SOCKET">Socket</SelectItem>
                  <SelectItem value="QUEUE">Queue</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={outcomeFilter}
                onValueChange={(value) => setOutcomeFilter(value as AuditOutcomeFilterValue)}
              >
                <SelectTrigger className="h-10 w-[155px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All outcomes</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILURE">Failure</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={methodFilter}
                onValueChange={(value) => setMethodFilter(value as AuditMethodFilterValue)}
              >
                <SelectTrigger className="h-10 w-[145px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All methods</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
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
                  setSortBy(value as NonNullable<AdminAuditLogsQueryInput['sortBy']>)
                }
              >
                <SelectTrigger className="h-10 w-[170px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created date</SelectItem>
                  <SelectItem value="durationMs">Duration</SelectItem>
                  <SelectItem value="channel">Channel</SelectItem>
                  <SelectItem value="outcome">Outcome</SelectItem>
                  <SelectItem value="route">Route</SelectItem>
                  <SelectItem value="statusCode">Status code</SelectItem>
                  <SelectItem value="action">Action</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortOrder ?? 'DESC'}
                onValueChange={(value) =>
                  setSortOrder(value as NonNullable<AdminAuditLogsQueryInput['sortOrder']>)
                }
              >
                <SelectTrigger className="h-10 w-[155px] rounded-full border-border/70 bg-background shadow-none">
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
        {auditLogsQuery.isLoading ? (
          <div className="flex min-h-80 flex-col gap-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[160px]" />
                  <Skeleton className="h-3 w-[240px]" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="hidden h-4 w-[100px] sm:block" />
              </div>
            ))}
          </div>
        ) : auditLogsQuery.isError ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Unable to load audit logs</h2>
                <p className="text-sm text-muted-foreground">
                  {isAdminApiError(auditLogsQuery.error) || auditLogsQuery.error instanceof Error
                    ? auditLogsQuery.error.message
                    : 'Something went wrong while loading the audit log.'}
                </p>
              </div>
              <Button onClick={() => void auditLogsQuery.refetch()}>Try again</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-muted-foreground">
                        No audit entries matched your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => {
                      const SurfaceIcon = getSurfaceIcon(log)

                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatAuditDateTime(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 bg-muted/25 text-muted-foreground shadow-none">
                                <SurfaceIcon className="h-4 w-4" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <StatusBadge
                                    status={log.channel.toLowerCase()}
                                    colorClass={getAuditChannelTone(log.channel)}
                                  />
                                  {log.method ? (
                                    <Badge variant="outline" className="rounded-full">
                                      {log.method}
                                    </Badge>
                                  ) : null}
                                </div>
                                <p className="font-medium">{formatAuditAction(log.action)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>{getAuditActorInitials(log.actor)}</AvatarFallback>
                              </Avatar>
                              <div className="space-y-0.5">
                                <p className="font-medium">{getAuditActorDisplayName(log.actor)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {log.actor?.email ?? log.actorRole ?? 'System activity'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              <StatusBadge
                                status={log.outcome.toLowerCase()}
                                colorClass={getAuditOutcomeTone(log.outcome)}
                              />
                              <p className="text-sm text-muted-foreground">
                                {log.statusCode != null
                                  ? `HTTP ${log.statusCode}`
                                  : log.errorCode ?? 'No status code'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatAuditDuration(log.durationMs)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedAuditLogId(log.id)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Page {page} of {totalPages}
                </span>
                <Separator orientation="vertical" className="hidden h-4 sm:block" />
                <span>{failureCount.toLocaleString()} failures in view</span>
                <Separator orientation="vertical" className="hidden h-4 sm:block" />
                <span>{queueCount.toLocaleString()} queue entries in view</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Sheet
        open={Boolean(selectedAuditLogId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAuditLogId(null)
          }
        }}
      >
        <SheetContent side="right" className="w-full gap-0 overflow-hidden sm:max-w-3xl">
          <SheetHeader className="border-b border-border/70 bg-card">
            <SheetTitle>Audit entry details</SheetTitle>
            <SheetDescription>
              Review the execution context, redacted payload snapshots, and delivery outcome.
            </SheetDescription>
          </SheetHeader>

          {selectedAuditLogQuery.isLoading ? (
            <div className="mt-6 space-y-4 px-1">
              <Skeleton className="h-5 w-[200px]" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-20 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : selectedAuditLogQuery.isError ? (
            <div className="flex flex-1 items-center justify-center px-8 text-center">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">Unable to load audit entry</h2>
                  <p className="text-sm text-muted-foreground">
                    {isAdminApiError(selectedAuditLogQuery.error) || selectedAuditLogQuery.error instanceof Error
                      ? selectedAuditLogQuery.error.message
                      : 'Something went wrong while loading this audit entry.'}
                  </p>
                </div>
                <Button onClick={() => void selectedAuditLogQuery.refetch()}>Try again</Button>
              </div>
            </div>
          ) : selectedAuditLog ? (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={selectedAuditLog.channel.toLowerCase()}
                    colorClass={getAuditChannelTone(selectedAuditLog.channel)}
                  />
                  <StatusBadge
                    status={selectedAuditLog.outcome.toLowerCase()}
                    colorClass={getAuditOutcomeTone(selectedAuditLog.outcome)}
                  />
                  {selectedAuditLog.method ? (
                    <Badge variant="outline" className="rounded-full">
                      {selectedAuditLog.method}
                    </Badge>
                  ) : null}
                </div>

                <Card className="rounded-2xl border-border/70 bg-muted/15">
                  <CardHeader className="pb-4">
                    <CardTitle>{formatAuditAction(selectedAuditLog.action)}</CardTitle>
                    <CardDescription>
                      {getAuditSurfaceLabel(selectedAuditLog)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Occurred at</p>
                      <p className="font-medium">{formatAuditDateTime(selectedAuditLog.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Execution time</p>
                      <p className="font-medium">{formatAuditDuration(selectedAuditLog.durationMs)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Result</p>
                      <p className="font-medium">
                        {selectedAuditLog.statusCode != null
                          ? `HTTP ${selectedAuditLog.statusCode}`
                          : selectedAuditLog.errorCode ?? selectedAuditLog.outcome}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Context</p>
                      <p className="font-medium">{getAuditResourceLabel(selectedAuditLog)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/70 bg-muted/15">
                  <CardHeader className="pb-4">
                    <CardTitle>Actor</CardTitle>
                    <CardDescription>
                      The authenticated admin, user, or system actor associated with this entry.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background p-4">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback>{getAuditActorInitials(selectedAuditLog.actor)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="font-semibold">{getAuditActorDisplayName(selectedAuditLog.actor)}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAuditLog.actor?.email ?? selectedAuditLog.actorRole ?? 'System activity'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/70 bg-muted/15">
                  <CardHeader className="pb-4">
                    <CardTitle>Request surface</CardTitle>
                    <CardDescription>
                      The transport and execution details that describe where this event originated.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <p className="text-sm font-medium text-muted-foreground">Route</p>
                      <p className="mt-1 font-semibold">
                        {selectedAuditLog.route ?? 'Not recorded'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <p className="text-sm font-medium text-muted-foreground">Socket event</p>
                      <p className="mt-1 font-semibold">
                        {selectedAuditLog.socketEvent ?? 'Not recorded'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <p className="text-sm font-medium text-muted-foreground">Queue name</p>
                      <p className="mt-1 font-semibold">
                        {selectedAuditLog.queueName ?? 'Not recorded'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <p className="text-sm font-medium text-muted-foreground">Consumer</p>
                      <p className="mt-1 font-semibold">
                        {selectedAuditLog.consumerName ?? 'Not recorded'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <p className="text-sm font-medium text-muted-foreground">IP address</p>
                      <p className="mt-1 font-semibold">
                        {selectedAuditLog.ipAddress ?? 'Not recorded'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <p className="text-sm font-medium text-muted-foreground">User agent</p>
                      <p className="mt-1 line-clamp-2 font-semibold">
                        {selectedAuditLog.userAgent ?? 'Not recorded'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {selectedAuditLog.errorMessage ? (
                  <Card className="rounded-2xl border-rose-200 bg-rose-50/70">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-rose-950">Failure context</CardTitle>
                      <CardDescription className="text-rose-900/70">
                        This entry captured an error condition or business failure.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-6 text-rose-950">
                        {selectedAuditLog.errorMessage}
                      </p>
                    </CardContent>
                  </Card>
                ) : null}

                <Card className="rounded-2xl border-border/70 bg-muted/15">
                  <CardHeader className="pb-4">
                    <CardTitle>Payload snapshots</CardTitle>
                    <CardDescription>
                      Redacted request, response, and metadata captured for forensic review.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Request</Label>
                      <ScrollArea className="h-48 rounded-2xl border border-border/70 bg-background">
                        <pre className="p-4 text-xs leading-6 text-muted-foreground">
                          {stringifyAuditJson(selectedAuditLog.requestJson)}
                        </pre>
                      </ScrollArea>
                    </div>
                    <div className="space-y-2">
                      <Label>Response</Label>
                      <ScrollArea className="h-48 rounded-2xl border border-border/70 bg-background">
                        <pre className="p-4 text-xs leading-6 text-muted-foreground">
                          {stringifyAuditJson(selectedAuditLog.responseJson)}
                        </pre>
                      </ScrollArea>
                    </div>
                    <div className="space-y-2">
                      <Label>Metadata</Label>
                      <ScrollArea className="h-48 rounded-2xl border border-border/70 bg-background">
                        <pre className="p-4 text-xs leading-6 text-muted-foreground">
                          {stringifyAuditJson(selectedAuditLog.metadataJson)}
                        </pre>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
