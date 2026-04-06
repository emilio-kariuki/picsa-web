'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  SendIcon,
  UserPlusIcon,
} from '@/components/ui/icons'
import { toast } from 'sonner'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import {
  addAdminTicketComment,
  assignAdminTicket,
  getAdminTicketById,
  handleAdminAccountDeletionRequest,
  listAdminTicketAgents,
  updateAdminTicketStatus,
  type AdminTicketAgent,
  type AdminTicketStatusValue,
  type AdminTicketSummary,
} from '@/lib/admin-tickets-api'
import { isAdminApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { currentUserAtom } from '@/lib/store'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

const TICKET_QUERY_KEY = 'admin-ticket'
const TICKETS_QUERY_KEY = 'admin-tickets'
const TICKET_OVERVIEW_QUERY_KEY = 'admin-ticket-overview'
const TICKET_AGENTS_QUERY_KEY = 'admin-ticket-agents'

const statusOptions: Array<{
  value: AdminTicketStatusValue
  label: string
}> = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const typeLabels: Record<string, string> = {
  'account-deletion-request': 'Account deletion',
  'general': 'General support',
}

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

interface TicketDetailPageProps {
  params: Promise<{
    ticketId: string
  }>
}

export default function TicketDetailPage(props: TicketDetailPageProps) {
  const { ticketId } = use(props.params)
  const queryClient = useQueryClient()
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()
  const currentUser = useAtomValue(currentUserAtom)
  const [replyDraft, setReplyDraft] = useState('')
  const [deletionDecisionNote, setDeletionDecisionNote] = useState('')

  const ticketQuery = useQuery({
    queryKey: [TICKET_QUERY_KEY, ticketId],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        getAdminTicketById(accessToken, ticketId),
      ),
    enabled: Boolean(ticketId && bootstrapStatus === 'ready' && isAuthenticated),
  })

  const agentsQuery = useQuery({
    queryKey: [TICKET_AGENTS_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminTicketAgents(accessToken),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const invalidateTicketData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [TICKETS_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [TICKET_OVERVIEW_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [TICKET_QUERY_KEY, ticketId] }),
    ])
  }

  const statusMutation = useMutation({
    mutationFn: async (status: AdminTicketStatusValue) =>
      performAuthenticatedRequest((accessToken) =>
        updateAdminTicketStatus(accessToken, ticketId, { status }),
      ),
    onSuccess: async (_, status) => {
      await invalidateTicketData()
      toast.success(`Ticket marked ${getStatusLabel(status).toLowerCase()}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to update ticket status'))
    },
  })

  const assignmentMutation = useMutation({
    mutationFn: async (agentId: string | null) =>
      performAuthenticatedRequest((accessToken) =>
        assignAdminTicket(accessToken, ticketId, { agentId }),
      ),
    onSuccess: async (_, agentId) => {
      await invalidateTicketData()
      toast.success(agentId ? 'Ticket assigned' : 'Ticket unassigned')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to update the assignee'))
    },
  })

  const replyMutation = useMutation({
    mutationFn: async (content: string) =>
      performAuthenticatedRequest((accessToken) =>
        addAdminTicketComment(accessToken, ticketId, { content }),
      ),
    onSuccess: async () => {
      await invalidateTicketData()
      setReplyDraft('')
      toast.success('Reply added to ticket')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Unable to send the reply'))
    },
  })

  const deletionDecisionMutation = useMutation({
    mutationFn: async (input: { decision: 'approve' | 'reject'; note?: string }) =>
      performAuthenticatedRequest((accessToken) =>
        handleAdminAccountDeletionRequest(accessToken, ticketId, input),
      ),
    onSuccess: async (_, variables) => {
      await invalidateTicketData()
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

  const ticket = ticketQuery.data?.data.ticket ?? null
  const agents = agentsQuery.data?.data.agents ?? []
  const canReply = Boolean(currentUser && replyDraft.trim().length >= 2)

  const handleReply = async () => {
    if (!ticket || !currentUser || !replyDraft.trim()) {
      return
    }

    try {
      await replyMutation.mutateAsync(replyDraft.trim())
    } catch {}
  }

  const handleDeletionDecision = async (decision: 'approve' | 'reject') => {
    if (!ticket) {
      return
    }

    try {
      await deletionDecisionMutation.mutateAsync({
        decision,
        note: deletionDecisionNote.trim() || undefined,
      })
    } catch {}
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket?.ticketNumber ?? 'Ticket details'}
        description="Review the full thread, update ownership, and respond from one place."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/tickets">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to tickets
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => void ticketQuery.refetch()}
              disabled={ticketQuery.isFetching}
            >
              {ticketQuery.isFetching ? (
                <Spinner className="mr-2 size-4" />
              ) : (
                <RefreshCwIcon className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        }
      />

      {ticketQuery.isLoading ? (
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardContent className="flex min-h-80 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-6" />
              <p className="text-sm text-muted-foreground">Loading ticket details...</p>
            </div>
          </CardContent>
        </Card>
      ) : ticketQuery.isError ? (
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardContent className="flex min-h-64 items-center justify-center px-6 text-center">
            <div className="space-y-4">
              <AlertCircleIcon className="mx-auto h-8 w-8 text-destructive" />
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Unable to load ticket</h2>
                <p className="text-sm text-muted-foreground">
                  {getErrorMessage(ticketQuery.error, 'Something went wrong while loading this ticket.')}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/tickets">Return to tickets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : ticket ? (
        <TicketDetailContent
          ticket={ticket}
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
          onStatusChange={(status) => statusMutation.mutate(status)}
          onAssignmentChange={(agentId) => assignmentMutation.mutate(agentId)}
          onHandleAccountDeletion={(decision) => void handleDeletionDecision(decision)}
        />
      ) : null}
    </div>
  )
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {isDeletionRequest && (
            <Badge
              variant="secondary"
              className="bg-rose-100 text-rose-900 hover:bg-rose-100"
            >
              {typeLabels[ticket.type] ?? ticket.type}
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
