'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CalendarDaysIcon,
  CheckIcon,
  ImagesIcon,
  Link2Icon,
  LockIcon,
  MoreHorizontalIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import {
  approveImage,
  createImageShareLink,
  deleteImage,
  fetchHostedEvents,
  fetchMyImages,
  rejectImage,
} from '@/lib/client-api'
import type { ClientImage } from '@/lib/client-types'
import { formatBytes, formatDateTime, formatRelativeTime, getImageStatusLabel } from '@/lib/client-view'
import { cn } from '@/lib/utils'

function imageBadgeClass(image: ClientImage) {
  if (image.status === 'FAILED' || image.moderationStatus === 'REJECTED') {
    return 'border-rose-300 bg-rose-500/10 text-rose-600 dark:border-rose-400/30 dark:text-rose-300'
  }

  if (image.status !== 'READY' || image.moderationStatus === 'PENDING') {
    return 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:text-amber-300'
  }

  return 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-300'
}

export default function ClientImagesPage() {
  const queryClient = useQueryClient()
  const { performAuthenticatedRequest } = useClientAuth()
  const [activeImageId, setActiveImageId] = useState<string | null>(null)

  const hostedEventsQuery = useQuery({
    queryKey: ['client', 'hosted-events'],
    queryFn: () => performAuthenticatedRequest((token) => fetchHostedEvents(token)),
  })

  const imagesQuery = useInfiniteQuery({
    queryKey: ['client', 'my-images'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      performAuthenticatedRequest((token) =>
        fetchMyImages(token, {
          cursor: pageParam,
          limit: 18,
        }),
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
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
      void queryClient.invalidateQueries({ queryKey: ['client', 'my-images'] })
      void queryClient.invalidateQueries({ queryKey: ['client', 'event-images'] })
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
      void queryClient.invalidateQueries({ queryKey: ['client', 'my-images'] })
      void queryClient.invalidateQueries({ queryKey: ['client', 'event-images'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to reject image')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      performAuthenticatedRequest((token) => deleteImage(token, imageId)),
    onSuccess: () => {
      setActiveImageId(null)
      toast.success('Image deleted')
      void queryClient.invalidateQueries({ queryKey: ['client', 'my-images'] })
      void queryClient.invalidateQueries({ queryKey: ['client', 'event-images'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to delete image')
    },
  })

  const images = useMemo(
    () => imagesQuery.data?.pages.flatMap((page) => page.images) ?? [],
    [imagesQuery.data],
  )

  const eventNameById = useMemo(() => {
    return new Map((hostedEventsQuery.data ?? []).map((event) => [event.id, event.name]))
  }, [hostedEventsQuery.data])

  const activeImage = useMemo(
    () => images.find((image) => image.id === activeImageId) ?? null,
    [activeImageId, images],
  )

  const activeEventName = activeImage
    ? eventNameById.get(activeImage.eventId) ?? `Event ${activeImage.eventId.slice(0, 8)}`
    : null

  if (imagesQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6" />
          <p className="text-sm text-muted-foreground">Loading your images...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ClientPageHeader
        eyebrow="Image library"
        title="A gallery wall for every frame worth keeping"
        description="Scan the full collection as a dense visual grid, then open the 3-dot dialog on any image when you want to share it, review it, or remove it."
      />

      <ClientSurface className="rounded-[1.2rem] border-border/60 bg-card/88 p-4 sm:p-5">
        {images.length ? (
          <>
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Personal media</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                  Recent images across your events
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The wall stays visual-first. Tap the 3 dots on any frame to open the action dialog with sharing, moderation, and cleanup options.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <Badge
                  variant="outline"
                  className="rounded-full border-border/70 bg-background/80 px-3 py-1.5 text-foreground"
                >
                  {images.length} images loaded
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-border/70 bg-background/80 px-3 py-1.5 text-muted-foreground"
                >
                  {hostedEventsQuery.data?.length ?? 0} hosted events
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-[0.78rem] border border-border/45 bg-secondary/20 shadow-[0_10px_24px_rgba(35,30,27,0.08)]"
                >
                  <div className="aspect-[4/5]">
                    {image.accessUrl ? (
                      <img
                        src={image.accessUrl}
                        alt={eventNameById.get(image.eventId) ?? 'Event image'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,210,166,0.45),_transparent_55%),linear-gradient(180deg,rgba(61,41,30,0.95),rgba(26,20,17,0.92))] p-6 text-center text-sm text-white/80">
                        {getImageStatusLabel(image)}
                      </div>
                    )}
                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/52 via-black/6 to-black/10" />

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-[0.65rem] border-white/18 bg-black/34 px-2.5 py-1 text-[10px] text-white shadow-sm backdrop-blur-md',
                        imageBadgeClass(image),
                      )}
                    >
                      {getImageStatusLabel(image)}
                    </Badge>

                    <Button
                      type="button"
                      size="icon-sm"
                      variant="secondary"
                      className="pointer-events-auto rounded-[0.65rem] border border-white/18 bg-black/42 text-white shadow-lg backdrop-blur-md hover:bg-black/60 hover:text-white"
                      onClick={() => setActiveImageId(image.id)}
                      aria-label="Open image actions"
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5">
                    <div className="min-w-0 max-w-[74%] rounded-[0.65rem] border border-white/12 bg-black/28 px-2.5 py-1.5 text-[11px] text-white shadow-lg backdrop-blur-sm">
                      <p className="truncate font-medium">
                        {eventNameById.get(image.eventId) ?? `Event ${image.eventId.slice(0, 8)}`}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-white/72">
                        {formatRelativeTime(image.createdAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {image.isPrivate ? (
                        <span className="rounded-[0.65rem] border border-white/12 bg-black/28 px-2.5 py-2 text-[11px] text-white/80 backdrop-blur-sm">
                          <LockIcon className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                      {image.hd ? (
                        <span className="rounded-[0.65rem] border border-white/12 bg-black/28 px-2.5 py-2 text-[11px] text-white/80 backdrop-blur-sm">
                          <SparklesIcon className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {imagesQuery.hasNextPage ? (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="rounded-full border-border/80 bg-background/70"
                  onClick={() => void imagesQuery.fetchNextPage()}
                  disabled={imagesQuery.isFetchingNextPage}
                >
                  {imagesQuery.isFetchingNextPage ? 'Loading more...' : 'Load more images'}
                </Button>
              </div>
            ) : null}

            <Dialog open={Boolean(activeImage)} onOpenChange={(open) => !open && setActiveImageId(null)}>
              {activeImage ? (
                <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden rounded-[0.95rem] border-border/60 bg-background p-0 shadow-[0_30px_90px_rgba(18,12,9,0.3)]">
                  <div className="max-h-[92vh] overflow-y-auto">
                    <div className="relative aspect-[4/3] bg-muted sm:aspect-[16/9]">
                      {activeImage.accessUrl ? (
                        <img
                          src={activeImage.accessUrl}
                          alt={activeEventName ?? 'Selected image'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,210,166,0.35),_transparent_55%),linear-gradient(180deg,rgba(61,41,30,0.96),rgba(26,20,17,0.94))] p-8 text-center text-sm text-white/82">
                          {getImageStatusLabel(activeImage)}
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/38 via-transparent to-transparent" />

                      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-[0.65rem] border-white/16 bg-black/32 px-2.5 py-1 text-[10px] text-white backdrop-blur-md',
                              imageBadgeClass(activeImage),
                            )}
                          >
                            {getImageStatusLabel(activeImage)}
                          </Badge>
                          {activeImage.isPrivate ? (
                            <Badge
                              variant="outline"
                              className="rounded-[0.65rem] border-white/16 bg-black/32 px-2.5 py-1 text-[10px] text-white backdrop-blur-md"
                            >
                              <LockIcon className="h-3.5 w-3.5" />
                              Private
                            </Badge>
                          ) : null}
                          {activeImage.hd ? (
                            <Badge
                              variant="outline"
                              className="rounded-[0.65rem] border-white/16 bg-black/32 px-2.5 py-1 text-[10px] text-white backdrop-blur-md"
                            >
                              <SparklesIcon className="h-3.5 w-3.5" />
                              HD
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                    </div>

                    <div className="space-y-5 p-5 sm:p-6">
                      <DialogHeader className="space-y-3 border-b border-border/60 pb-5 text-left">
                        <div className="space-y-2">
                          <DialogTitle className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                            Image details
                          </DialogTitle>
                          <DialogDescription className="text-sm leading-6">
                            {activeEventName}. Uploaded {formatRelativeTime(activeImage.createdAt)} by{' '}
                            {activeImage.uploader.name ?? activeImage.uploader.email ?? 'Uploader'}.
                          </DialogDescription>
                        </div>
                      </DialogHeader>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[0.78rem] border border-border/60 bg-secondary/25 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Event</p>
                          <p className="mt-2 text-sm font-medium text-foreground">{activeEventName}</p>
                        </div>
                        <div className="rounded-[0.78rem] border border-border/60 bg-secondary/25 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Uploaded</p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {formatDateTime(activeImage.createdAt)}
                          </p>
                        </div>
                        <div className="rounded-[0.78rem] border border-border/60 bg-secondary/25 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Image size</p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {formatBytes(activeImage.sizeBytes)}
                          </p>
                          {activeImage.width && activeImage.height ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {activeImage.width} x {activeImage.height}px
                            </p>
                          ) : null}
                        </div>
                        <div className="rounded-[0.78rem] border border-border/60 bg-secondary/25 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Uploader</p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {activeImage.uploader.name ?? activeImage.uploader.email ?? 'Uploader'}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                          asChild
                          variant="outline"
                          className="h-auto w-full justify-start rounded-[0.78rem] border-border/60 bg-background/80 px-4 py-3.5"
                        >
                          <Link href={`/events/${activeImage.eventId}`}>
                            <span className="flex size-10 items-center justify-center rounded-[0.7rem] bg-secondary text-foreground">
                              <CalendarDaysIcon className="h-4 w-4" />
                            </span>
                            <span className="flex flex-col items-start">
                              <span className="text-sm font-medium">Open event</span>
                              <span className="text-xs text-muted-foreground">
                                Jump to the event workspace for this image.
                              </span>
                            </span>
                          </Link>
                        </Button>

                        {activeImage.viewerCanShare ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-auto w-full justify-start rounded-[0.78rem] border-border/60 bg-background/80 px-4 py-3.5"
                            onClick={() => shareImageMutation.mutate(activeImage.id)}
                            disabled={shareImageMutation.isPending}
                          >
                            <span className="flex size-10 items-center justify-center rounded-[0.7rem] bg-secondary text-foreground">
                              <Link2Icon className="h-4 w-4" />
                            </span>
                            <span className="flex flex-col items-start">
                              <span className="text-sm font-medium">
                                {shareImageMutation.isPending ? 'Creating share link...' : 'Copy share link'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Generate a single-image link and copy it to the clipboard.
                              </span>
                            </span>
                          </Button>
                        ) : null}

                        {activeImage.viewerCanApprove ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-auto w-full justify-start rounded-[0.78rem] border-emerald-200 bg-emerald-500/8 px-4 py-3.5 text-emerald-700 hover:bg-emerald-500/12 hover:text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-300"
                            onClick={() => approveImageMutation.mutate(activeImage.id)}
                            disabled={approveImageMutation.isPending}
                          >
                            <span className="flex size-10 items-center justify-center rounded-[0.7rem] bg-emerald-500/12 text-current dark:bg-emerald-400/14">
                              <CheckIcon className="h-4 w-4" />
                            </span>
                            <span className="flex flex-col items-start">
                              <span className="text-sm font-medium">
                                {approveImageMutation.isPending ? 'Approving image...' : 'Approve image'}
                              </span>
                              <span className="text-xs text-current/75">
                                Mark this frame ready for the event gallery.
                              </span>
                            </span>
                          </Button>
                        ) : null}

                        {activeImage.viewerCanReject ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-auto w-full justify-start rounded-[0.78rem] border-border/60 bg-background/80 px-4 py-3.5"
                            onClick={() => rejectImageMutation.mutate(activeImage.id)}
                            disabled={rejectImageMutation.isPending}
                          >
                            <span className="flex size-10 items-center justify-center rounded-[0.7rem] bg-secondary text-foreground">
                              <XIcon className="h-4 w-4" />
                            </span>
                            <span className="flex flex-col items-start">
                              <span className="text-sm font-medium">
                                {rejectImageMutation.isPending ? 'Rejecting image...' : 'Reject image'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Keep this frame out of the published gallery.
                              </span>
                            </span>
                          </Button>
                        ) : null}

                        {activeImage.viewerCanDelete ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="h-auto w-full justify-start rounded-[0.78rem] border-rose-200 bg-rose-500/8 px-4 py-3.5 text-rose-700 hover:bg-rose-500/12 hover:text-rose-700 dark:border-rose-400/30 dark:text-rose-300"
                            onClick={() => deleteImageMutation.mutate(activeImage.id)}
                            disabled={deleteImageMutation.isPending}
                          >
                            <span className="flex size-10 items-center justify-center rounded-[0.7rem] bg-rose-500/12 text-current dark:bg-rose-400/14">
                              <Trash2Icon className="h-4 w-4" />
                            </span>
                            <span className="flex flex-col items-start">
                              <span className="text-sm font-medium">
                                {deleteImageMutation.isPending ? 'Deleting image...' : 'Delete image'}
                              </span>
                              <span className="text-xs text-current/75">
                                Remove this frame permanently from the collection.
                              </span>
                            </span>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              ) : null}
            </Dialog>
          </>
        ) : (
          <Empty className="rounded-[1.5rem] border-border/70 bg-secondary/35 p-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImagesIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No images yet</EmptyTitle>
              <EmptyDescription>
                The moment you upload into an event, the image library will give you a single place to review, share, and manage everything.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </ClientSurface>
    </div>
  )
}
