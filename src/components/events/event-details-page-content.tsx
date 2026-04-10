import { Link } from '@tanstack/react-router'
import { useAtom, useSetAtom } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, ArchiveIcon, RefreshCwIcon } from '@/components/ui/icons'
import { toast } from 'sonner'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { getAdminEventById, updateAdminEventStatus } from '@/lib/admin-events-api'
import { isAdminApiError } from '@/lib/api'
import {
  adminEventsActionAtom,
  adminEventsActionReasonAtom,
} from '@/lib/events-page-state'
import { PageHeader } from '@/components/common/page-header'
import { AdminEventDetailContent } from '@/components/events/admin-event-detail-content'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

const EVENT_QUERY_KEY = 'admin-event'
const EVENTS_QUERY_KEY = 'admin-events'
const OVERVIEW_QUERY_KEY = 'admin-overview'

export function EventDetailsPageContent({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient()
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()
  const [eventAction, setEventAction] = useAtom(adminEventsActionAtom)
  const [actionReason, setActionReason] = useAtom(adminEventsActionReasonAtom)
  const clearActionReason = useSetAtom(adminEventsActionReasonAtom)

  const eventQuery = useQuery({
    queryKey: [EVENT_QUERY_KEY, eventId],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        getAdminEventById(accessToken, eventId),
      ),
    enabled: Boolean(
      eventId &&
        bootstrapStatus === 'ready' &&
        isAuthenticated,
    ),
  })

  const statusMutation = useMutation({
    mutationFn: async (input: {
      eventId: string
      status: 'ACTIVE' | 'ARCHIVED'
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
        queryClient.invalidateQueries({ queryKey: [EVENT_QUERY_KEY, variables.eventId] }),
        queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] }),
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

  const event = eventQuery.data?.data.event
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
        title={event?.name ?? 'Event details'}
        description="Review event state, host context, moderation pressure, and room metadata."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/admin/dashboard/events">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to events
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => void eventQuery.refetch()}
              disabled={eventQuery.isFetching}
            >
              {eventQuery.isFetching ? (
                <Spinner className="mr-2 size-4" />
              ) : (
                <RefreshCwIcon className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            {event ? (
              <Button
                onClick={() => {
                  clearActionReason('')
                  setEventAction({
                    event,
                    nextStatus: event.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE',
                  })
                }}
              >
                <ArchiveIcon className="mr-2 h-4 w-4" />
                {event.status === 'ACTIVE' ? 'Archive event' : 'Restore event'}
              </Button>
            ) : null}
          </>
        }
      />

      {eventQuery.isLoading ? (
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardContent className="flex min-h-105 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-6" />
              <p className="text-sm text-muted-foreground">Loading event details...</p>
            </div>
          </CardContent>
        </Card>
      ) : eventQuery.isError ? (
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardContent className="flex min-h-80 items-center justify-center px-6 text-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Unable to load event</h2>
                <p className="text-sm text-muted-foreground">
                  {isAdminApiError(eventQuery.error) || eventQuery.error instanceof Error
                    ? eventQuery.error.message
                    : 'Something went wrong while loading this event.'}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/admin/dashboard/events">Return to events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : event ? (
        <Card className="rounded-3xl border-border/70 bg-card/90 shadow-none">
          <CardContent className="p-6">
            <AdminEventDetailContent event={event} />
          </CardContent>
        </Card>
      ) : null}

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
                <Label htmlFor="event-detail-status-reason">Reason</Label>
                <Textarea
                  id="event-detail-status-reason"
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
