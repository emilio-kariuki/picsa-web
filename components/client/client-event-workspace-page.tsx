'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CameraIcon,
  CheckIcon,
  CopyIcon,
  ImageIcon,
  MailPlusIcon,
  Trash2Icon,
  UserCheckIcon,
  UsersIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClientEventForm } from '@/components/client/client-event-form'
import { ClientImageUploader } from '@/components/client/client-image-uploader'
import { ClientMetricCard, ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import {
  approveEventJoinRequest,
  approveImage,
  createEventInvitation,
  createImageShareLink,
  deleteEvent,
  deleteImage,
  fetchAppConfig,
  fetchEvent,
  fetchEventImages,
  fetchEventJoinRequests,
  fetchEventParticipants,
  rejectEventJoinRequest,
  rejectImage,
  revokeEventInvitation,
  updateEvent,
  uploadEventDisplayPicture,
  uploadEventImages,
} from '@/lib/client-api'
import type { ClientEventInvitation, ClientEventInput, ClientImage } from '@/lib/client-types'
import {
  buildClientManageLink,
  formatBytes,
  formatDateShort,
  formatDateTime,
  formatEventWindow,
  formatRelativeTime,
  getImageStatusLabel,
  getJoinModeLabel,
  readStoredInvitations,
  summarizeSettings,
  writeStoredInvitations,
} from '@/lib/client-view'

function statusBadgeClass(image: ClientImage) {
  if (image.status === 'FAILED' || image.moderationStatus === 'REJECTED') {
    return 'border-rose-300 bg-rose-500/10 text-rose-600 dark:border-rose-400/30 dark:text-rose-300'
  }

  if (image.status === 'UPLOADING' || image.status === 'PROCESSING' || image.moderationStatus === 'PENDING') {
    return 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:text-amber-300'
  }

  return 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-300'
}

export function ClientEventWorkspacePage({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient()
  const { performAuthenticatedRequest } = useClientAuth()
  const [invitationEmail, setInvitationEmail] = useState('')
  const [storedInvitations, setStoredInvitations] = useState<ClientEventInvitation[]>([])

  useEffect(() => {
    setStoredInvitations(readStoredInvitations(eventId))
  }, [eventId])

  const eventQuery = useQuery({
    queryKey: ['client', 'event', eventId],
    queryFn: () => performAuthenticatedRequest((token) => fetchEvent(token, eventId)),
  })

  const participantsQuery = useQuery({
    queryKey: ['client', 'event-participants', eventId],
    queryFn: () => performAuthenticatedRequest((token) => fetchEventParticipants(token, eventId)),
  })

  const joinRequestsQuery = useQuery({
    queryKey: ['client', 'event-join-requests', eventId],
    queryFn: () => performAuthenticatedRequest((token) => fetchEventJoinRequests(token, eventId)),
  })

  const appConfigQuery = useQuery({
    queryKey: ['client', 'app-config'],
    queryFn: fetchAppConfig,
  })

  const galleryQuery = useInfiniteQuery({
    queryKey: ['client', 'event-images', eventId],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      performAuthenticatedRequest((token) =>
        fetchEventImages(token, eventId, {
          cursor: pageParam,
          limit: 18,
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const refreshWorkspace = () => {
    void queryClient.invalidateQueries({ queryKey: ['client', 'event', eventId] })
    void queryClient.invalidateQueries({ queryKey: ['client', 'event-participants', eventId] })
    void queryClient.invalidateQueries({ queryKey: ['client', 'event-join-requests', eventId] })
    void queryClient.invalidateQueries({ queryKey: ['client', 'event-images', eventId] })
    void queryClient.invalidateQueries({ queryKey: ['client', 'hosted-events'] })
    void queryClient.invalidateQueries({ queryKey: ['client', 'dashboard', 'pending-requests'] })
    void queryClient.invalidateQueries({ queryKey: ['client', 'dashboard', 'recent-uploads'] })
    void queryClient.invalidateQueries({ queryKey: ['client', 'my-images'] })
  }

  const updateEventMutation = useMutation({
    mutationFn: (input: ClientEventInput) =>
      performAuthenticatedRequest((token) => updateEvent(token, eventId, input)),
    onSuccess: () => {
      toast.success('Event updated')
      refreshWorkspace()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to update event')
    },
  })

  const uploadDisplayPictureMutation = useMutation({
    mutationFn: (file: File) =>
      performAuthenticatedRequest((token) => uploadEventDisplayPicture(token, eventId, file)),
    onSuccess: () => {
      toast.success('Display picture updated')
      refreshWorkspace()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to update display picture')
    },
  })

  const uploadImagesMutation = useMutation({
    mutationFn: (files: File[]) =>
      performAuthenticatedRequest((token) =>
        uploadEventImages(token, eventId, files, {
          hd: true,
          isPrivate: false,
        }),
      ),
    onSuccess: (result) => {
      toast.success(
        result.summary.rejectedCount
          ? `Uploaded ${result.summary.acceptedCount} images, ${result.summary.rejectedCount} were rejected.`
          : `Uploaded ${result.summary.acceptedCount} images for processing.`,
      )
      refreshWorkspace()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to upload images')
    },
  })

  const approveJoinRequestMutation = useMutation({
    mutationFn: (userId: string) =>
      performAuthenticatedRequest((token) => approveEventJoinRequest(token, eventId, userId)),
    onSuccess: () => {
      toast.success('Join request approved')
      refreshWorkspace()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to approve request')
    },
  })

  const rejectJoinRequestMutation = useMutation({
    mutationFn: (userId: string) =>
      performAuthenticatedRequest((token) => rejectEventJoinRequest(token, eventId, userId)),
    onSuccess: () => {
      toast.success('Join request rejected')
      refreshWorkspace()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to reject request')
    },
  })

  const createInvitationMutation = useMutation({
    mutationFn: (email: string) =>
      performAuthenticatedRequest((token) => createEventInvitation(token, eventId, email)),
    onSuccess: (invitation) => {
      const nextInvitations = [invitation, ...storedInvitations.filter((entry) => entry.id !== invitation.id)]
      setStoredInvitations(nextInvitations)
      writeStoredInvitations(eventId, nextInvitations)
      setInvitationEmail('')
      toast.success('Invitation sent')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to send invitation')
    },
  })

  const revokeInvitationMutation = useMutation({
    mutationFn: (invitationId: string) =>
      performAuthenticatedRequest((token) => revokeEventInvitation(token, eventId, invitationId)),
    onSuccess: (_result, invitationId) => {
      const nextInvitations = storedInvitations.filter((entry) => entry.id !== invitationId)
      setStoredInvitations(nextInvitations)
      writeStoredInvitations(eventId, nextInvitations)
      toast.success('Invitation revoked')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to revoke invitation')
    },
  })

  const shareImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      performAuthenticatedRequest((token) => createImageShareLink(token, imageId)),
    onSuccess: async (share) => {
      try {
        await navigator.clipboard.writeText(share.shareUrl)
        toast.success('Share link copied')
      } catch {
        toast.success('Share link created')
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to create share link')
    },
  })

  const approveImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      performAuthenticatedRequest((token) => approveImage(token, imageId)),
    onSuccess: () => {
      toast.success('Image approved')
      refreshWorkspace()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to approve image')
    },
  })

  const rejectImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      performAuthenticatedRequest((token) => rejectImage(token, imageId)),
    onSuccess: () => {
      toast.success('Image rejected')
      refreshWorkspace()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to reject image')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      performAuthenticatedRequest((token) => deleteImage(token, imageId)),
    onSuccess: () => {
      toast.success('Image deleted')
      refreshWorkspace()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to delete image')
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: () => performAuthenticatedRequest((token) => deleteEvent(token, eventId)),
    onSuccess: () => {
      toast.success('Event deleted')
      void queryClient.invalidateQueries({ queryKey: ['client', 'hosted-events'] })
      window.location.assign('/events')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to delete event')
    },
  })

  const galleryImages = useMemo(
    () => galleryQuery.data?.pages.flatMap((page) => page.images) ?? [],
    [galleryQuery.data],
  )

  if (eventQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Loading event workspace...</p>
        </div>
      </div>
    )
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <ClientSurface className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Event unavailable</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight">We could not load this event</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {eventQuery.error instanceof Error ? eventQuery.error.message : 'Try again in a moment.'}
        </p>
        <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/events">Back to events</Link>
        </Button>
      </ClientSurface>
    )
  }

  const event = eventQuery.data
  const manageLink = buildClientManageLink(event.id)

  return (
    <div className="space-y-6">
      <ClientPageHeader
        eyebrow="Event workspace"
        title={event.name}
        description={event.description ?? 'Shape the guest flow, moderate the gallery, and keep the event polished from one place.'}
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-full border-border/80 bg-background/70"
              onClick={async () => {
                await navigator.clipboard.writeText(manageLink)
                toast.success('Workspace link copied')
              }}
            >
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy workspace link
            </Button>
            <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
              <Link href="/events">
                All events
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <ClientMetricCard label="Guests" value={String(event.memberCount)} helper="Current people inside the event." />
        <ClientMetricCard label="Join mode" value={getJoinModeLabel(event.settings.joinMode)} helper="How access is controlled right now." />
        <ClientMetricCard label="Gallery items" value={String(galleryImages.length)} helper="Images loaded into this workspace view." />
        <ClientMetricCard label="Pending joins" value={String(joinRequestsQuery.data?.length ?? 0)} helper="Requests waiting for approval or decline." />
      </div>

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="h-auto w-full justify-start rounded-[1.25rem] bg-secondary/60 p-1">
          <TabsTrigger value="overview" className="rounded-[1rem] px-4 py-2">Overview</TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-[1rem] px-4 py-2">Gallery</TabsTrigger>
          <TabsTrigger value="people" className="rounded-[1rem] px-4 py-2">People</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-[1rem] px-4 py-2">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ClientSurface className="overflow-hidden p-0">
              <div className="relative aspect-[16/9] bg-secondary/50">
                {event.displayPictureUrl ? (
                  <img src={event.displayPictureUrl} alt={event.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                    <div>
                      <CameraIcon className="mx-auto h-10 w-10" />
                      <p className="mt-3 text-sm">No display picture yet</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-border/70 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Display picture</p>
                    <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Lead with a photo that feels like the event</h2>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-border/80 bg-background/70"
                    onClick={() => document.getElementById('event-cover-upload')?.click()}
                    disabled={uploadDisplayPictureMutation.isPending}
                  >
                    <CameraIcon className="mr-2 h-4 w-4" />
                    {uploadDisplayPictureMutation.isPending ? 'Uploading...' : 'Upload cover'}
                  </Button>
                </div>
                <input
                  id="event-cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(changeEvent) => {
                    const file = changeEvent.target.files?.[0]
                    if (!file) {
                      return
                    }

                    uploadDisplayPictureMutation.mutate(file)
                    changeEvent.target.value = ''
                  }}
                />
              </div>
            </ClientSurface>

            <div className="space-y-6">
              <ClientSurface>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Event snapshot</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
                    <p className="text-sm font-semibold text-foreground">Event timing</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{formatEventWindow(event.startAt, event.endAt)}</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
                    <p className="text-sm font-semibold text-foreground">Workspace link</p>
                    <p className="mt-2 break-all text-sm leading-6 text-muted-foreground">{manageLink}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summarizeSettings(event.settings).map((entry) => (
                      <Badge key={entry} variant="outline" className="rounded-full border-accent/35 bg-accent/10 px-3 py-1 text-accent">
                        {entry}
                      </Badge>
                    ))}
                  </div>
                </div>
              </ClientSurface>

              <ClientSurface>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Host notes</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Details your guests will feel</h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-border/70 bg-secondary/45 px-4 py-3">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium text-foreground">{formatDateShort(event.createdAt)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-border/70 bg-secondary/45 px-4 py-3">
                    <dt className="text-muted-foreground">Last updated</dt>
                    <dd className="font-medium text-foreground">{formatDateShort(event.updatedAt)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-border/70 bg-secondary/45 px-4 py-3">
                    <dt className="text-muted-foreground">Slug</dt>
                    <dd className="font-medium text-foreground">{event.url}</dd>
                  </div>
                </dl>
              </ClientSurface>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <ClientSurface>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Event gallery</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Collect and curate every image</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Drop in new uploads, review what needs attention, and share the highlights with confidence.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Batch limit: {appConfigQuery.data?.uploads.imageBatchMaxFiles ?? '...'} files
              </p>
            </div>

            <ClientImageUploader
              disabled={uploadImagesMutation.isPending}
              maxFiles={appConfigQuery.data?.uploads.imageBatchMaxFiles}
              onUpload={async (files) => {
                await uploadImagesMutation.mutateAsync(files)
              }}
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {galleryImages.map((image) => (
                <div key={image.id} className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-secondary/35">
                  <div className="aspect-[4/5] bg-muted">
                    {image.accessUrl ? (
                      <img src={image.accessUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        {getImageStatusLabel(image)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline" className={`rounded-full px-3 py-1 ${statusBadgeClass(image)}`}>
                        {getImageStatusLabel(image)}
                      </Badge>
                      <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {formatRelativeTime(image.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{formatBytes(image.sizeBytes)}</p>
                      <p className="mt-1">{image.uploader.name ?? image.uploader.email ?? 'Uploader'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {image.viewerCanShare ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-border/80 bg-background/70"
                          onClick={() => shareImageMutation.mutate(image.id)}
                        >
                          Share
                        </Button>
                      ) : null}
                      {image.viewerCanApprove ? (
                        <Button
                          size="sm"
                          className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                          onClick={() => approveImageMutation.mutate(image.id)}
                        >
                          Approve
                        </Button>
                      ) : null}
                      {image.viewerCanReject ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-border/80 bg-background/70"
                          onClick={() => rejectImageMutation.mutate(image.id)}
                        >
                          Reject
                        </Button>
                      ) : null}
                      {image.viewerCanDelete ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300"
                          onClick={() => deleteImageMutation.mutate(image.id)}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!galleryImages.length ? (
              <Empty className="mt-6 rounded-[1.5rem] border-border/70 bg-secondary/35 p-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ImageIcon className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No gallery images yet</EmptyTitle>
                  <EmptyDescription>Upload a first batch and the event gallery will appear here.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : null}

            {galleryQuery.hasNextPage ? (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="rounded-full border-border/80 bg-background/70"
                  onClick={() => void galleryQuery.fetchNextPage()}
                  disabled={galleryQuery.isFetchingNextPage}
                >
                  {galleryQuery.isFetchingNextPage ? 'Loading more...' : 'Load more images'}
                </Button>
              </div>
            ) : null}
          </ClientSurface>
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ClientSurface>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Invitations</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Invite someone specific</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Send a direct invitation by email. Invites issued from this browser stay listed below so you can revoke them quickly.
              </p>

              <div className="mt-5 space-y-3">
                <Label htmlFor="invite-email">Guest email</Label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="invite-email"
                    type="email"
                    value={invitationEmail}
                    onChange={(event) => setInvitationEmail(event.target.value)}
                    placeholder="guest@example.com"
                    className="rounded-2xl"
                  />
                  <Button
                    className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                    disabled={!invitationEmail.trim() || createInvitationMutation.isPending}
                    onClick={() => createInvitationMutation.mutate(invitationEmail.trim())}
                  >
                    <MailPlusIcon className="mr-2 h-4 w-4" />
                    {createInvitationMutation.isPending ? 'Sending...' : 'Send invite'}
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {storedInvitations.length ? (
                  storedInvitations.map((invitation) => (
                    <div key={invitation.id} className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{invitation.email}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Expires {formatDateTime(invitation.expiresAt)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300"
                          onClick={() => revokeInvitationMutation.mutate(invitation.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <Empty className="rounded-[1.5rem] border-border/70 bg-secondary/35 p-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MailPlusIcon className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No browser-saved invites yet</EmptyTitle>
                      <EmptyDescription>Issued invitations will show here after you send them from this workspace.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            </ClientSurface>

            <div className="space-y-6">
              <ClientSurface>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Join requests</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">People waiting for access</h2>

                {joinRequestsQuery.data?.length ? (
                  <div className="mt-5 space-y-4">
                    {joinRequestsQuery.data.map((request) => (
                      <div key={request.userId} className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{request.user.name ?? request.user.email ?? 'Guest request'}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{request.user.email ?? 'No email available'}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                              Requested {formatRelativeTime(request.requestedAt)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                              onClick={() => approveJoinRequestMutation.mutate(request.userId)}
                            >
                              <UserCheckIcon className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full border-border/80 bg-background/70"
                              onClick={() => rejectJoinRequestMutation.mutate(request.userId)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty className="mt-5 rounded-[1.5rem] border-border/70 bg-secondary/35 p-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UserCheckIcon className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No pending requests</EmptyTitle>
                      <EmptyDescription>When guests request access, they will appear here for review.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </ClientSurface>

              <ClientSurface>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Participants</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Everyone already inside</h2>

                <div className="mt-5">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/70">
                        <TableHead className="px-3">Guest</TableHead>
                        <TableHead className="px-3">Role</TableHead>
                        <TableHead className="px-3">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(participantsQuery.data ?? []).map((participant) => (
                        <TableRow key={participant.user.id} className="border-border/60">
                          <TableCell className="px-3 py-4">
                            <div>
                              <p className="font-medium text-foreground">{participant.user.name ?? participant.user.email ?? 'Guest'}</p>
                              <p className="text-sm text-muted-foreground">{participant.user.email ?? 'No email on file'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-4">
                            <Badge variant="outline" className="rounded-full border-accent/35 bg-accent/10 px-3 py-1 text-accent">
                              {participant.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-4 text-muted-foreground">
                            {formatDateShort(participant.joinedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {!participantsQuery.data?.length ? (
                  <Empty className="mt-5 rounded-[1.5rem] border-border/70 bg-secondary/35 p-8">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UsersIcon className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyTitle>No participants yet</EmptyTitle>
                      <EmptyDescription>Approved guests and accepted invitations will show up here.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : null}
              </ClientSurface>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <ClientSurface>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Event settings</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Refine the event details</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Adjust the schedule, guest permissions, and moderation rules without losing the feel of the experience.
            </p>

            <div className="mt-6">
              <ClientEventForm
                initialEvent={event}
                submitLabel={updateEventMutation.isPending ? 'Saving changes...' : 'Save changes'}
                isSubmitting={updateEventMutation.isPending}
                onSubmit={async (input) => {
                  await updateEventMutation.mutateAsync(input)
                }}
              />
            </div>
          </ClientSurface>

          <ClientSurface className="border-rose-300/60 bg-rose-500/5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600 dark:text-rose-300">Danger zone</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Delete this event</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Deleting an event removes its management surface. Make sure you are done with the gallery and guest flow before using this.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-5 rounded-full">
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[1.5rem] border-border/70">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {event.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the event from your hosted list. If you are sure, continue with deletion.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="rounded-full bg-destructive text-white hover:bg-destructive/90"
                    onClick={() => deleteEventMutation.mutate()}
                  >
                    {deleteEventMutation.isPending ? 'Deleting...' : 'Delete event'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </ClientSurface>
        </TabsContent>
      </Tabs>
    </div>
  )
}
