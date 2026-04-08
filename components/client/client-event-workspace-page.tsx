'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CameraIcon,
  CheckIcon,
  CopyIcon,
  ImageIcon,
  Link2Icon,
  LockIcon,
  MailPlusIcon,
  SparklesIcon,
  Trash2Icon,
  UserCheckIcon,
  UsersIcon,
  XIcon,
} from '@/components/ui/icons'
import QRCode from 'qrcode'
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
  claimEventPassForEvent,
  createEventInvitation,
  createEventPassCheckoutSession,
  createImageShareLink,
  deleteEvent,
  deleteImage,
  fetchAppConfig,
  fetchEvent,
  fetchEventPasses,
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
  buildClientGuestLink,
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

const galleryActionButtonClass =
  'h-8 w-8 rounded-[0.65rem] border border-white/16 bg-black/42 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white'

function getGalleryImageStyle(image: ClientImage): CSSProperties | undefined {
  if (!image.width || !image.height || image.width <= 0 || image.height <= 0) {
    return undefined
  }

  return {
    aspectRatio: `${image.width} / ${image.height}`,
  }
}

function getGalleryUploaderLabel(image: ClientImage) {
  return image.uploader.name ?? image.uploader.email ?? 'Uploader'
}

function EventJoinQrCard({
  eventName,
  joinLink,
  joinModeLabel,
}: {
  eventName: string
  joinLink: string
  joinModeLabel: string
}) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    void QRCode.toDataURL(joinLink, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#120c09',
        light: '#F4ECE5',
      },
    })
      .then((value) => {
        if (isActive) {
          setQrCodeDataUrl(value)
        }
      })
      .catch(() => {
        if (isActive) {
          setQrCodeDataUrl(null)
        }
      })

    return () => {
      isActive = false
    }
  }, [joinLink])

  return (
    <div className="mt-5 flex w-full flex-col gap-4 rounded-[1.1rem] border border-border/70 bg-secondary/45 p-4 sm:flex-row sm:items-center">
      <div className="flex h-[138px] w-[138px] shrink-0 items-center justify-center rounded-[0.9rem] bg-[#f4ece5] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
        {qrCodeDataUrl ? (
          <img src={qrCodeDataUrl} alt={`QR code for ${eventName}`} className="h-full w-full rounded-[0.45rem]" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center text-[#120c09]">
            <Spinner className="size-5" />
            <p className="text-xs font-medium">Generating QR</p>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Join on mobile</p>
        <h3 className="font-serif text-xl font-semibold tracking-tight text-foreground">Scan to open this event in Picsa</h3>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Guests can scan this code with their phone to open the mobile join flow and enter the event faster.
        </p>
        <Badge variant="outline" className="rounded-full border-accent/30 bg-accent/10 px-3 py-1 text-accent">
          {joinModeLabel}
        </Badge>
      </div>
    </div>
  )
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

  const eventPassesQuery = useQuery({
    queryKey: ['client', 'event-passes'],
    queryFn: () => performAuthenticatedRequest((token) => fetchEventPasses(token)),
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

  const unlockEventMutation = useMutation({
    mutationFn: async () => {
      const passInventory =
        eventPassesQuery.data ??
        (await performAuthenticatedRequest((token) => fetchEventPasses(token)))

      if (passInventory.availableCount > 0) {
        await performAuthenticatedRequest((token) => claimEventPassForEvent(token, eventId))

        return {
          kind: 'claimed' as const,
        }
      }

      const checkout = await performAuthenticatedRequest((token) =>
        createEventPassCheckoutSession(token, {
          flow: 'upgrade_event_pro',
          eventId,
          returnPath: '/payments/return',
        }),
      )

      if (checkout.mode === 'already_unlocked') {
        return {
          kind: 'already_unlocked' as const,
        }
      }

      if (checkout.mode === 'existing_pass') {
        await performAuthenticatedRequest((token) => claimEventPassForEvent(token, eventId))

        return {
          kind: 'claimed' as const,
        }
      }

      if (checkout.mode === 'checkout' && checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl)

        return {
          kind: 'redirected' as const,
        }
      }

      throw new Error('Unable to start Pro checkout')
    },
    onSuccess: (result) => {
      if (result.kind === 'claimed') {
        toast.success('Pro unlocked for this event')
        refreshWorkspace()
        void queryClient.invalidateQueries({ queryKey: ['client', 'event-passes'] })
      }

      if (result.kind === 'already_unlocked') {
        toast.success('This event is already on Pro')
        refreshWorkspace()
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to unlock Pro')
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
  const guestJoinLink = buildClientGuestLink(event.id)

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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <ClientMetricCard
          label="Plan"
          value={event.billing.tier === 'PRO' ? 'Pro' : 'Free'}
          helper={
            event.billing.tier === 'PRO'
              ? 'Image sharing and higher event limits are active.'
              : 'Unlock Pro here when you need more room.'
          }
        />
        <ClientMetricCard label="Guests" value={String(event.memberCount)} helper="Current people inside the event." />
        <ClientMetricCard label="Join mode" value={getJoinModeLabel(event.settings.joinMode)} helper="How access is controlled right now." />
        <ClientMetricCard label="Gallery items" value={String(galleryImages.length)} helper="Images loaded into this workspace view." />
        <ClientMetricCard label="Pending joins" value={String(joinRequestsQuery.data?.length ?? 0)} helper="Requests waiting for approval or decline." />
      </div>

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="h-auto w-full justify-start rounded-2xl border border-border/60 bg-card/80 p-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <TabsTrigger value="overview" className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:shadow-sm">Gallery</TabsTrigger>
          <TabsTrigger value="people" className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:shadow-sm">People</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:shadow-sm">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ClientSurface className="overflow-hidden p-0">
              <div className="relative aspect-video bg-secondary/50">
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
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-col flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Display picture</p>
                    <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Lead with a photo that feels like the event</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Add a memorable cover, then let guests scan the event QR below to open the mobile join flow in seconds.
                    </p>
                    <EventJoinQrCard
                      eventName={event.name}
                      joinLink={guestJoinLink}
                      joinModeLabel={getJoinModeLabel(event.settings.joinMode)}
                    />
                  </div>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[196px]">
                    <Button
                      variant="outline"
                      className="rounded-full border-border/80 bg-background/70"
                      onClick={() => document.getElementById('event-cover-upload')?.click()}
                      disabled={uploadDisplayPictureMutation.isPending}
                    >
                      <CameraIcon className="mr-2 h-4 w-4" />
                      {uploadDisplayPictureMutation.isPending ? 'Uploading...' : 'Upload cover'}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-border/80 bg-background/70"
                      onClick={async () => {
                        await navigator.clipboard.writeText(guestJoinLink)
                        toast.success('Guest join link copied')
                      }}
                    >
                      <Link2Icon className="mr-2 h-4 w-4" />
                      Copy join link
                    </Button>
                  </div>
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
              {event.billing.tier !== 'PRO' ? (
                <ClientSurface className="border-accent/30 bg-accent/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Upgrade this event</p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Unlock Pro for bigger galleries and shareable moments</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Pro raises this event to {appConfigQuery.data?.plan.proEventMaxGuests ?? 100} guests and{' '}
                    {appConfigQuery.data?.plan.proEventMaxImages ?? 2500} uploads, and turns on image sharing.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full border-accent/35 bg-accent/10 px-3 py-1 text-accent">
                      $12 per event
                    </Badge>
                    <Badge variant="outline" className="rounded-full border-accent/35 bg-accent/10 px-3 py-1 text-accent">
                      {eventPassesQuery.data?.availableCount
                        ? `${eventPassesQuery.data.availableCount} pass ready`
                        : 'Hosted checkout ready'}
                    </Badge>
                  </div>
                  <Button
                    className="mt-5 rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                    disabled={unlockEventMutation.isPending}
                    onClick={() => unlockEventMutation.mutate()}
                  >
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    {unlockEventMutation.isPending
                      ? 'Preparing Pro...'
                      : eventPassesQuery.data?.availableCount
                        ? 'Use existing pass'
                        : 'Unlock Pro'}
                  </Button>
                </ClientSurface>
              ) : (
                <ClientSurface className="border-emerald-300/50 bg-emerald-500/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Pro active</p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">This event is already running with Pro unlocked</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Guests can use image sharing, and the event can scale up to {appConfigQuery.data?.plan.proEventMaxGuests ?? 100} guests with{' '}
                    {appConfigQuery.data?.plan.proEventMaxImages ?? 2500} uploads.
                  </p>
                </ClientSurface>
              )}

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
                </dl>
              </ClientSurface>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <ClientSurface className="p-5 sm:p-6">
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

            <div className="mt-6 columns-2 gap-3 sm:columns-3 xl:columns-4 2xl:columns-5">
              {galleryImages.map((image) => {
                const galleryImageStyle = getGalleryImageStyle(image)

                return (
                  <article
                    key={image.id}
                    className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-border/60 bg-[#17110e] shadow-[0_18px_38px_rgba(0,0,0,0.2)]"
                  >
                    <div
                      className={`relative bg-[#120c09] ${galleryImageStyle ? '' : 'aspect-4/5'}`}
                      style={galleryImageStyle}
                    >
                    {image.accessUrl ? (
                      <img
                        src={image.accessUrl}
                        alt={getGalleryUploaderLabel(image)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-4/5 flex h-full items-center justify-center px-5 text-center text-sm text-white/72">
                        {getImageStatusLabel(image)}
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/72 via-black/18 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/90 via-black/42 to-transparent" />

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                      <Badge
                        variant="outline"
                        className={`rounded-[0.65rem] border-white/18 bg-black/36 px-2.5 py-1 text-[10px] text-white shadow-none backdrop-blur-md ${statusBadgeClass(image)}`}
                      >
                        {getImageStatusLabel(image)}
                      </Badge>

                      <div className="flex items-center gap-2">
                        {image.isPrivate ? (
                          <span className="rounded-[0.65rem] border border-white/14 bg-black/32 px-2 py-1.5 text-white/82 shadow-none backdrop-blur-sm">
                            <LockIcon className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                        {image.hd ? (
                          <span className="rounded-[0.65rem] border border-white/14 bg-black/32 px-2 py-1.5 text-white/82 shadow-none backdrop-blur-sm">
                            <SparklesIcon className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0 rounded-[0.7rem] border border-white/12 bg-black/30 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
                          <p className="truncate text-sm font-semibold">{getGalleryUploaderLabel(image)}</p>
                          <p className="mt-1 truncate text-[11px] text-white/72">
                            {formatRelativeTime(image.createdAt)} • {formatBytes(image.sizeBytes)}
                          </p>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                          {image.viewerCanShare ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="secondary"
                              className={galleryActionButtonClass}
                              onClick={() => shareImageMutation.mutate(image.id)}
                              aria-label="Share image"
                              title="Share image"
                            >
                              <Link2Icon className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {image.viewerCanApprove ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              className="h-8 w-8 rounded-[0.65rem] bg-emerald-500 text-white shadow-lg hover:bg-emerald-400"
                              onClick={() => approveImageMutation.mutate(image.id)}
                              aria-label="Approve image"
                              title="Approve image"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {image.viewerCanReject ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              className="h-8 w-8 rounded-[0.65rem] bg-amber-500 text-[#120c09] shadow-lg hover:bg-amber-400"
                              onClick={() => rejectImageMutation.mutate(image.id)}
                              aria-label="Reject image"
                              title="Reject image"
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {image.viewerCanDelete ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="secondary"
                              className="h-8 w-8 rounded-[0.65rem] border border-white/16 bg-rose-500/88 text-white shadow-lg hover:bg-rose-400"
                              onClick={() => deleteImageMutation.mutate(image.id)}
                              aria-label="Delete image"
                              title="Delete image"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {!galleryImages.length ? (
              <Empty className="mt-6 rounded-3xl border-border/70 bg-secondary/35 p-8">
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
                  <Empty className="rounded-3xl border-border/70 bg-secondary/35 p-8">
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
                  <Empty className="mt-5 rounded-3xl border-border/70 bg-secondary/35 p-8">
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
                  <Empty className="mt-5 rounded-3xl border-border/70 bg-secondary/35 p-8">
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
                appConfig={appConfigQuery.data}
                initialEvent={event}
                submitLabel={updateEventMutation.isPending ? 'Saving changes...' : 'Save changes'}
                isSubmitting={updateEventMutation.isPending}
                mode="edit"
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
              <AlertDialogContent className="rounded-3xl border-border/70">
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
