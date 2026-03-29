'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircleIcon,
  EyeIcon,
  FilterIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  TicketIcon,
  TriangleAlertIcon,
  UserPlusIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import {
  addAdminTicketComment,
  assignAdminTicket,
  getAdminTicketById,
  getAdminTicketOverview,
  handleAdminAccountDeletionRequest,
  listAdminTicketAgents,
  listAdminTickets,
  type AdminTicketAgent,
  type AdminTicketPriorityValue,
  type AdminTicketSortBy,
  type AdminTicketStatusValue,
  type AdminTicketSummary,
  type AdminTicketTypeValue,
  type AdminTicketsQueryInput,
  updateAdminTicketStatus,
} from '@/lib/admin-tickets-api'
import { isAdminApiError } from '@/lib/api'
import {
  adminTicketsAssignmentFilterAtom,
  adminTicketsPageAtom,
  adminTicketsPriorityFilterAtom,
  adminTicketsSearchInputAtom,
  adminTicketsSelectedTicketIdAtom,
  adminTicketsSortByAtom,
  adminTicketsSortOrderAtom,
  adminTicketsStatusFilterAtom,
  adminTicketsTypeFilterAtom,
  type TicketAssignmentFilterValue,
  type TicketPriorityFilterValue,
  type TicketStatusFilterValue,
  type TicketTypeFilterValue,
} from '@/lib/tickets-page-state'
import { cn } from '@/lib/utils'
import { currentUserAtom } from '@/lib/store'
import { EmptyState } from '@/components/common/empty-state'
import { KPICard } from '@/components/common/kpi-card'
import { PageHeader } from '@/components/common/page-header'
import { StatusBadge } from '@/components/common/status-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
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

const TICKETS_QUERY_KEY = 'admin-tickets'
const TICKET_QUERY_KEY = 'admin-ticket'
const TICKET_OVERVIEW_QUERY_KEY = 'admin-ticket-overview'
const TICKET_AGENTS_QUERY_KEY = 'admin-ticket-agents'
const TICKETS_PAGE_SIZE = 10

const statusOptions: Array<{
  value: AdminTicketStatusValue
  label: string
}> = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const priorityOptions: Array<{
  value: AdminTicketPriorityValue
  label: string
}> = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const typeOptions: Array<{
  value: AdminTicketTypeValue
  label: string
}> = [
  { value: 'account-deletion-request', label: 'Account deletion' },
  { value: 'general', label: 'General support' },
]

const sortOptions: Array<{
  value: AdminTicketSortBy
  label: string
}> = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Created' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
]

function formatDateTime(value: string | null) {
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
  const date = new Date(value)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.max(0, Math.floor(diffMs / 60000))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    return `${diffMins}m ago`
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  return `${diffDays}d ago`
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'NA'
}

function getErrorMessage(error: unknown, fallback: string) {
  if (isAdminApiError(error) || error instanceof Error) {
    return error.message
  }

  return fallback
}

function getStatusLabel(status: AdminTicketStatusValue) {
  return statusOptions.find((option) => option.value === status)?.label ?? status
}

function getTicketTypeLabel(type: AdminTicketTypeValue) {
  return typeOptions.find((option) => option.value === type)?.label ?? type
}

function buildTicketsQueryInput(query: {
  page: number
  limit: number
  search: string
  type: TicketTypeFilterValue
  status: TicketStatusFilterValue
  priority: TicketPriorityFilterValue
  assignment: TicketAssignmentFilterValue
  sortBy: AdminTicketSortBy
  sortOrder: 'ASC' | 'DESC'
}): AdminTicketsQueryInput {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search || undefined,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    type: query.type === 'all' ? undefined : query.type,
    status: query.status === 'all' ? undefined : query.status,
    priority: query.priority === 'all' ? undefined : query.priority,
    assigned:
      query.assignment === 'all'
        ? undefined
        : query.assignment === 'assigned',
  }
}

interface TicketDetailContentProps {
  ticket: AdminTicketSummary
  agents: AdminTicketAgent[]
  replyDraft: string
  deletionDecisionNote: string
  canReply: boolean
  isSendingReply: boolean
  isUpdatingStatus: boolean
  isUpdatingAssignment: boolean
  isHandlingDeletion: boolean
  onReplyDraftChange: (value: string) => void
  onDeletionDecisionNoteChange: (value: string) => void
  onReply: () => void
  onStatusChange: (status: AdminTicketStatusValue) => void
  onAssignmentChange: (agentId: string | null) => void
  onHandleAccountDeletion: (decision: 'approve' | 'reject') => void
}

function TicketDetailContent({
  ticket,
  agents,
  replyDraft,
  deletionDecisionNote,
  canReply,
  isSendingReply,
  isUpdatingStatus,
  isUpdatingAssignment,
  isHandlingDeletion,
  onReplyDraftChange,
  onDeletionDecisionNoteChange,
  onReply,
  onStatusChange,
  onAssignmentChange,
  onHandleAccountDeletion,
}: TicketDetailContentProps) {
  const isDeletionRequest = ticket.type === 'account-deletion-request'
  const hasLinkedAccount = Boolean(ticket.customer.linkedUserId)
  const accountIsActive = ticket.customer.isActive === true

  return (
    <div className="space-y-6 pb-6">
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {isDeletionRequest && (
            <Badge
              variant="secondary"
              className="bg-rose-100 text-rose-900 hover:bg-rose-100"
            >
              {getTicketTypeLabel(ticket.type)}
            </Badge>
          )}
          <StatusBadge status={ticket.priority} />
          <StatusBadge status={ticket.status} />
          {ticket.awaitingStaffResponse && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-900 hover:bg-amber-100"
            >
              Awaiting staff response
            </Badge>
          )}
          <Badge variant="outline">{ticket.commentCount} comments</Badge>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-snug">{ticket.subject}</h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {ticket.description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customer</CardTitle>
            <CardDescription>
              Who opened the request and when it last moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={ticket.customer.avatar} />
                <AvatarFallback>{getInitials(ticket.customer.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{ticket.customer.name}</p>
                <p className="text-sm text-muted-foreground">{ticket.customer.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Created {formatDateTime(ticket.createdAt)}</p>
              <p>Last updated {formatDateTime(ticket.updatedAt)}</p>
              <p>
                Last reply{' '}
                {ticket.lastCommentAt ? formatDateTime(ticket.lastCommentAt) : 'No replies yet'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Workflow</CardTitle>
            <CardDescription>
              Reassign owners and move the ticket through the queue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={ticket.status}
                onValueChange={(value) => onStatusChange(value as AdminTicketStatusValue)}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned to</Label>
              <Select
                value={ticket.assignedTo?.id ?? 'unassigned'}
                onValueChange={(value) =>
                  onAssignmentChange(value === 'unassigned' ? null : value)
                }
                disabled={isUpdatingAssignment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-3 text-sm text-muted-foreground">
              {ticket.assignedTo
                ? `${ticket.assignedTo.name} owns this thread right now.`
                : 'No owner has been assigned yet.'}
            </div>
          </CardContent>
        </Card>
      </div>

      {isDeletionRequest && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Deletion request</CardTitle>
            <CardDescription>
              Approving this request permanently deletes the linked Picsa account and its data, then closes the ticket.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {hasLinkedAccount ? 'Linked to a Picsa account' : 'No linked Picsa account'}
              </Badge>
              {hasLinkedAccount && (
                <Badge
                  variant="secondary"
                  className={
                    accountIsActive
                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-100'
                      : 'bg-muted text-muted-foreground hover:bg-muted'
                  }
                >
                  {accountIsActive ? 'Account active' : 'Account access locked'}
                </Badge>
              )}
            </div>

            <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-3 text-sm text-muted-foreground">
              {hasLinkedAccount
                ? 'Approving will permanently delete this user account and all associated data. Rejecting will restore access to the account.'
                : 'This request came in without a linked Picsa account, so approval is disabled until support verifies the customer manually.'}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-deletion-note">Resolution note (optional)</Label>
              <Textarea
                id="ticket-deletion-note"
                rows={3}
                placeholder="Add context for the audit trail or the support team."
                value={deletionDecisionNote}
                onChange={(event) => onDeletionDecisionNoteChange(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => onHandleAccountDeletion('reject')}
                disabled={isHandlingDeletion}
              >
                Reject request
              </Button>
              <Button
                onClick={() => onHandleAccountDeletion('approve')}
                disabled={isHandlingDeletion || !hasLinkedAccount}
              >
                Approve & permanently delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conversation</CardTitle>
          <CardDescription>
            Reply as staff and keep a running thread of customer communication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {ticket.comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 px-5 py-8 text-center">
              <MessageSquareIcon className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-3 font-medium">No replies yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send the first staff response to start the thread.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ticket.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'flex-1 rounded-2xl border px-4 py-3',
                      comment.author.isStaff
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : 'border-border/70 bg-muted/40',
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{comment.author.name}</span>
                      <Badge
                        variant={comment.author.isStaff ? 'default' : 'secondary'}
                        className={
                          comment.author.isStaff
                            ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                            : ''
                        }
                      >
                        {comment.author.isStaff ? 'Staff' : 'Customer'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <Label htmlFor="ticket-reply">Reply</Label>
            <Textarea
              id="ticket-reply"
              rows={4}
              placeholder="Share the next step, ask for more details, or confirm the resolution."
              value={replyDraft}
              onChange={(event) => onReplyDraftChange(event.target.value)}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Replies are added as staff comments in this admin workflow.
              </p>
              <Button onClick={onReply} disabled={!canReply || isSendingReply}>
                {isSendingReply ? (
                  <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="mr-2 h-4 w-4" />
                )}
                Send reply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TicketsPage() {
  const queryClient = useQueryClient()
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()
  const currentUser = useAtomValue(currentUserAtom)
  const [searchInput, setSearchInput] = useAtom(adminTicketsSearchInputAtom)
  const deferredSearch = useDeferredValue(searchInput.trim())
  const [page, setPage] = useAtom(adminTicketsPageAtom)
  const [typeFilter, setTypeFilter] = useAtom(adminTicketsTypeFilterAtom)
  const [statusFilter, setStatusFilter] = useAtom(adminTicketsStatusFilterAtom)
  const [priorityFilter, setPriorityFilter] = useAtom(adminTicketsPriorityFilterAtom)
  const [assignmentFilter, setAssignmentFilter] = useAtom(adminTicketsAssignmentFilterAtom)
  const [sortBy, setSortBy] = useAtom(adminTicketsSortByAtom)
  const [sortOrder, setSortOrder] = useAtom(adminTicketsSortOrderAtom)
  const [selectedTicketId, setSelectedTicketId] = useAtom(adminTicketsSelectedTicketIdAtom)
  const [replyDraft, setReplyDraft] = useState('')
  const [deletionDecisionNote, setDeletionDecisionNote] = useState('')

  useEffect(() => {
    setPage(1)
  }, [assignmentFilter, deferredSearch, priorityFilter, setPage, sortBy, sortOrder, statusFilter, typeFilter])

  useEffect(() => {
    setReplyDraft('')
    setDeletionDecisionNote('')
  }, [selectedTicketId])

  const queryInput = useMemo(
    () =>
      buildTicketsQueryInput({
        page,
        limit: TICKETS_PAGE_SIZE,
        search: deferredSearch,
        type: typeFilter,
        status: statusFilter,
        priority: priorityFilter,
        assignment: assignmentFilter,
        sortBy,
        sortOrder,
      }),
    [assignmentFilter, deferredSearch, page, priorityFilter, sortBy, sortOrder, statusFilter, typeFilter],
  )

  const ticketsQuery = useQuery({
    queryKey: [TICKETS_QUERY_KEY, queryInput],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminTickets(accessToken, queryInput),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
    placeholderData: (previousData) => previousData,
  })

  const overviewQuery = useQuery({
    queryKey: [TICKET_OVERVIEW_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        getAdminTicketOverview(accessToken),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const agentsQuery = useQuery({
    queryKey: [TICKET_AGENTS_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminTicketAgents(accessToken),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const selectedTicketQuery = useQuery({
    queryKey: [TICKET_QUERY_KEY, selectedTicketId],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        getAdminTicketById(accessToken, selectedTicketId!),
      ),
    enabled: Boolean(selectedTicketId && bootstrapStatus === 'ready' && isAuthenticated),
  })

  const invalidateTicketData = async (ticketId?: string | null) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [TICKET_OVERVIEW_QUERY_KEY] }),
      ticketId
        ? queryClient.invalidateQueries({
            queryKey: [TICKET_QUERY_KEY, ticketId],
          })
        : Promise.resolve(),
    ])
  }

  const statusMutation = useMutation({
    mutationFn: async (input: {
      ticketId: string
      status: AdminTicketStatusValue
    }) =>
      performAuthenticatedRequest((accessToken) =>
        updateAdminTicketStatus(accessToken, input.ticketId, {
          status: input.status,
        }),
      ),
    onSuccess: async (_, variables) => {
      await invalidateTicketData(variables.ticketId)
      toast.success(`Ticket marked ${getStatusLabel(variables.status).toLowerCase()}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to update ticket status'))
    },
  })

  const assignmentMutation = useMutation({
    mutationFn: async (input: {
      ticketId: string
      agentId: string | null
    }) =>
      performAuthenticatedRequest((accessToken) =>
        assignAdminTicket(accessToken, input.ticketId, {
          agentId: input.agentId,
        }),
      ),
    onSuccess: async (_, variables) => {
      await invalidateTicketData(variables.ticketId)
      toast.success(variables.agentId ? 'Ticket assigned' : 'Ticket unassigned')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to update the assignee'))
    },
  })

  const replyMutation = useMutation({
    mutationFn: async (input: {
      ticketId: string
      content: string
    }) =>
      performAuthenticatedRequest((accessToken) =>
        addAdminTicketComment(accessToken, input.ticketId, {
          content: input.content,
        }),
      ),
    onSuccess: async (_, variables) => {
      await invalidateTicketData(variables.ticketId)
      toast.success('Reply added to ticket')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to send the reply'))
    },
  })

  const deletionDecisionMutation = useMutation({
    mutationFn: async (input: {
      ticketId: string
      decision: 'approve' | 'reject'
      note?: string
    }) =>
      performAuthenticatedRequest((accessToken) =>
        handleAdminAccountDeletionRequest(accessToken, input.ticketId, {
          decision: input.decision,
          note: input.note,
        }),
      ),
    onSuccess: async (_, variables) => {
      await invalidateTicketData(variables.ticketId)
      setDeletionDecisionNote('')
      toast.success(
        variables.decision === 'approve'
          ? 'Deletion request approved and account access updated'
          : 'Deletion request rejected',
      )
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to handle deletion request'))
    },
  })

  const tickets = ticketsQuery.data?.data.items ?? []
  const overview = overviewQuery.data?.data.overview
  const agents = agentsQuery.data?.data.agents ?? []
  const selectedTicket =
    selectedTicketQuery.data?.data.ticket ??
    tickets.find((ticket) => ticket.id === selectedTicketId) ??
    null
  const totalCount = ticketsQuery.data?.data.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / TICKETS_PAGE_SIZE))
  const inViewAwaitingCount = tickets.filter((ticket) => ticket.awaitingStaffResponse).length
  const inViewUnassignedCount = tickets.filter((ticket) => !ticket.assignedTo).length
  const canReply = Boolean(currentUser && replyDraft.trim().length >= 2)

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, setPage, totalPages])

  const activeFilterCount = [
    deferredSearch.length > 0,
    typeFilter !== 'all',
    statusFilter !== 'all',
    priorityFilter !== 'all',
    assignmentFilter !== 'all',
    sortBy !== 'updatedAt',
    sortOrder !== 'DESC',
  ].filter(Boolean).length

  const refreshTickets = async () => {
    try {
      await Promise.all([
        ticketsQuery.refetch(),
        overviewQuery.refetch(),
        agentsQuery.refetch(),
        selectedTicketId ? selectedTicketQuery.refetch() : Promise.resolve(),
      ])
      toast.success('Tickets refreshed')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to refresh tickets'))
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    setTypeFilter('all')
    setStatusFilter('all')
    setPriorityFilter('all')
    setAssignmentFilter('all')
    setSortBy('updatedAt')
    setSortOrder('DESC')
    setPage(1)
  }

  const handleReply = async () => {
    if (!selectedTicket || !currentUser || !replyDraft.trim()) {
      return
    }

    try {
      await replyMutation.mutateAsync({
        ticketId: selectedTicket.id,
        content: replyDraft.trim(),
      })
      setReplyDraft('')
    } catch {}
  }

  const handleDeletionDecision = async (
    decision: 'approve' | 'reject',
  ) => {
    if (!selectedTicket) {
      return
    }

    try {
      await deletionDecisionMutation.mutateAsync({
        ticketId: selectedTicket.id,
        decision,
        note: deletionDecisionNote.trim() || undefined,
      })
    } catch {}
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets"
        description="Triage support requests, assign owners, and keep customer conversations moving."
        actions={(
          <Button
            variant="outline"
            onClick={() => void refreshTickets()}
            disabled={ticketsQuery.isFetching || overviewQuery.isFetching}
          >
            <RefreshCwIcon
              className={cn(
                'mr-2 h-4 w-4',
                (ticketsQuery.isFetching || overviewQuery.isFetching) && 'animate-spin',
              )}
            />
            Refresh
          </Button>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KPICard
          title="Open"
          value={overview?.openCount ?? '—'}
          icon={<TicketIcon className="h-5 w-5 text-sky-600" />}
        />
        <KPICard
          title="Urgent"
          value={overview?.urgentCount ?? '—'}
          icon={<TriangleAlertIcon className="h-5 w-5 text-rose-600" />}
        />
        <KPICard
          title="Unassigned"
          value={overview?.unassignedCount ?? '—'}
          icon={<UserPlusIcon className="h-5 w-5 text-amber-600" />}
        />
        <KPICard
          title="Awaiting Reply"
          value={overview?.awaitingStaffResponseCount ?? '—'}
          icon={<MessageSquareIcon className="h-5 w-5 text-emerald-600" />}
        />
        <KPICard
          title="Deletion Requests"
          value={overview?.deletionRequestCount ?? '—'}
          icon={<AlertCircleIcon className="h-5 w-5 text-rose-600" />}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b border-border/70">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FilterIcon className="h-5 w-5 text-muted-foreground" />
                Ticket queue
              </CardTitle>
              <CardDescription className="mt-1">
                Search by ticket number, subject, customer, or description.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {totalCount.toLocaleString()} matching
              </Badge>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-7">
            <div className="relative xl:col-span-2">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search tickets"
                className="pl-9"
              />
            </div>

            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TicketTypeFilterValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatusFilterValue)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as TicketPriorityFilterValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={assignmentFilter}
              onValueChange={(value) =>
                setAssignmentFilter(value as TicketAssignmentFilterValue)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ownership</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as AdminTicketSortBy)}>
              <SelectTrigger>
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
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {activeFilterCount > 0
                ? `${activeFilterCount} active filters applied`
                : 'Showing the full ticket queue'}
            </div>

            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'ASC' | 'DESC')}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Descending</SelectItem>
                <SelectItem value="ASC">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {ticketsQuery.isLoading ? (
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3 text-center">
              <Spinner className="size-6" />
              <p className="text-sm text-muted-foreground">Loading tickets...</p>
            </div>
          </CardContent>
        ) : ticketsQuery.isError ? (
          <CardContent className="py-16">
            <div className="mx-auto max-w-md rounded-2xl border border-dashed px-6 py-8 text-center">
              <AlertCircleIcon className="mx-auto h-8 w-8 text-destructive" />
              <h2 className="mt-4 text-lg font-semibold">Unable to load tickets</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {getErrorMessage(ticketsQuery.error, 'Something went wrong while loading tickets.')}
              </p>
              <Button className="mt-5" variant="outline" onClick={() => void refreshTickets()}>
                Try again
              </Button>
            </div>
          </CardContent>
        ) : tickets.length === 0 ? (
          <CardContent className="py-10">
            <EmptyState
              icon={<TicketIcon className="h-6 w-6" />}
              title={activeFilterCount > 0 ? 'No tickets match this view' : 'No live tickets yet'}
              description={
                activeFilterCount > 0
                  ? 'Try broadening the filters or clearing the search to bring more support requests into view.'
                  : 'This queue is connected to the live backend. Tickets will appear here as soon as they are created.'
              }
              action={
                activeFilterCount > 0 ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Reset filters
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned to</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="align-top">
                        <div className="min-w-[220px] space-y-2">
                          <div>
                            <p className="font-medium">{ticket.ticketNumber}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {ticket.subject}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {ticket.type === 'account-deletion-request' && (
                              <Badge
                                variant="secondary"
                                className="bg-rose-100 text-rose-900 hover:bg-rose-100"
                              >
                                {getTicketTypeLabel(ticket.type)}
                              </Badge>
                            )}
                            {ticket.awaitingStaffResponse && (
                              <Badge
                                variant="secondary"
                                className="bg-amber-100 text-amber-900 hover:bg-amber-100"
                              >
                                Awaiting reply
                              </Badge>
                            )}
                            <Badge variant="outline">{ticket.commentCount} comments</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex min-w-[220px] items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={ticket.customer.avatar} />
                            <AvatarFallback>
                              {getInitials(ticket.customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{ticket.customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {ticket.customer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <StatusBadge status={ticket.priority} />
                      </TableCell>
                      <TableCell className="align-top">
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="align-top">
                        {ticket.assignedTo ? (
                          <div className="flex min-w-[180px] items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={ticket.assignedTo.avatar} />
                              <AvatarFallback>
                                {getInitials(ticket.assignedTo.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{ticket.assignedTo.name}</p>
                              <p className="text-xs text-muted-foreground">Assigned</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="min-w-[120px]">
                          <p className="text-sm font-medium">{formatTimeAgo(ticket.updatedAt)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(ticket.updatedAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedTicketId(ticket.id)}>
                              <EyeIcon className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Assign
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                assignmentMutation.mutate({
                                  ticketId: ticket.id,
                                  agentId: null,
                                })
                              }
                            >
                              <UserPlusIcon className="mr-2 h-4 w-4" />
                              Unassign
                            </DropdownMenuItem>
                            {agents.map((agent) => (
                              <DropdownMenuItem
                                key={agent.id}
                                onClick={() =>
                                  assignmentMutation.mutate({
                                    ticketId: ticket.id,
                                    agentId: agent.id,
                                  })
                                }
                              >
                                <UserPlusIcon className="mr-2 h-4 w-4" />
                                {agent.name}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Update status
                            </DropdownMenuLabel>
                            {statusOptions.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() =>
                                  statusMutation.mutate({
                                    ticketId: ticket.id,
                                    status: option.value,
                                  })
                                }
                              >
                                {option.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Page {page} of {totalPages}
                </span>
                <Separator orientation="vertical" className="hidden h-4 sm:block" />
                <span>{inViewAwaitingCount.toLocaleString()} awaiting reply in view</span>
                <Separator orientation="vertical" className="hidden h-4 sm:block" />
                <span>{inViewUnassignedCount.toLocaleString()} unassigned in view</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || ticketsQuery.isFetching}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || ticketsQuery.isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Sheet
        open={Boolean(selectedTicketId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicketId(null)
          }
        }}
      >
        <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="border-b border-border/70 bg-card">
            <SheetTitle>
              {selectedTicket ? selectedTicket.ticketNumber : 'Ticket details'}
            </SheetTitle>
            <SheetDescription>
              Review the full thread, update ownership, and respond from one place.
            </SheetDescription>
          </SheetHeader>

          {selectedTicketQuery.isLoading && !selectedTicket ? (
            <div className="mt-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="size-6" />
                <p className="text-sm text-muted-foreground">Loading ticket details...</p>
              </div>
            </div>
          ) : selectedTicketQuery.isError && !selectedTicket ? (
            <div className="mx-6 my-8 rounded-2xl border border-dashed px-6 py-8 text-center">
              <AlertCircleIcon className="mx-auto h-8 w-8 text-destructive" />
              <p className="mt-4 font-medium">Unable to load ticket details</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {getErrorMessage(
                  selectedTicketQuery.error,
                  'Something went wrong while loading this ticket.',
                )}
              </p>
            </div>
          ) : selectedTicket ? (
            <div className="px-6 pt-6">
              <TicketDetailContent
                ticket={selectedTicket}
                agents={agents}
                replyDraft={replyDraft}
                deletionDecisionNote={deletionDecisionNote}
                canReply={canReply}
                isSendingReply={replyMutation.isPending}
                isUpdatingStatus={statusMutation.isPending}
                isUpdatingAssignment={assignmentMutation.isPending}
                isHandlingDeletion={deletionDecisionMutation.isPending}
                onReplyDraftChange={setReplyDraft}
                onDeletionDecisionNoteChange={setDeletionDecisionNote}
                onReply={() => void handleReply()}
                onStatusChange={(status) =>
                  statusMutation.mutate({
                    ticketId: selectedTicket.id,
                    status,
                  })
                }
                onAssignmentChange={(agentId) =>
                  assignmentMutation.mutate({
                    ticketId: selectedTicket.id,
                    agentId,
                  })
                }
                onHandleAccountDeletion={(decision) =>
                  void handleDeletionDecision(decision)
                }
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
