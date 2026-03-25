'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRightIcon, CalendarDaysIcon, ImagesIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { formatBytes, formatRelativeTime, getImageStatusLabel } from '@/lib/client-view'

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
        title="Everything you have captured or curated"
        description="Review image quality, approve what is ready, reject what is off-tone, and create share links when a single frame deserves the spotlight."
      />

      <ClientSurface>
        {images.length ? (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Personal media</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Recent images across your events</h2>
              </div>
              <p className="text-sm text-muted-foreground">{images.length} images loaded</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {images.map((image) => (
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
                      <Badge variant="outline" className={`rounded-full px-3 py-1 ${imageBadgeClass(image)}`}>
                        {getImageStatusLabel(image)}
                      </Badge>
                      <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {formatRelativeTime(image.createdAt)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1 text-foreground">
                          {eventNameById.get(image.eventId) ?? `Event ${image.eventId.slice(0, 8)}`}
                        </Badge>
                        {image.isPrivate ? (
                          <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 px-3 py-1">
                            Private
                          </Badge>
                        ) : null}
                      </div>
                      <p>{formatBytes(image.sizeBytes)}</p>
                      <p>{image.uploader.name ?? image.uploader.email ?? 'Uploader'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline" className="rounded-full border-border/80 bg-background/70">
                        <Link href={`/events/${image.eventId}`}>
                          <CalendarDaysIcon className="mr-2 h-4 w-4" />
                          Event
                        </Link>
                      </Button>
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
