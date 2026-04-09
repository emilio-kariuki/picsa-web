'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Clock3Icon,
  EyeIcon,
  GlobeIcon,
  HardDriveIcon,
  ImageIcon,
  LockIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  ScanSearchIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  SparklesIcon,
  Trash2Icon,
} from '@/components/ui/icons'
import { toast } from 'sonner'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import {
  deleteAdminImage,
  getAdminImageById,
  listAdminImages,
  type AdminImageDetail,
  type AdminImagesQueryInput,
  type AdminImageModerationStatusValue,
  type AdminImageSummary,
  updateAdminImageModeration,
} from '@/lib/admin-images-api'
import {
  formatImageDateTime,
  formatImageFileSize,
  getImageUploaderDisplayName,
  getImageUploaderInitials,
} from '@/lib/admin-images-format'
import { getAdminOverview } from '@/lib/admin-overview-api'
import { isAdminApiError } from '@/lib/api'
import {
  adminImagesActionAtom,
  adminImagesActionReasonAtom,
  adminImagesModerationFilterAtom,
  adminImagesPageAtom,
  adminImagesPrivacyFilterAtom,
  adminImagesSearchInputAtom,
  adminImagesSelectedImageIdAtom,
  adminImagesSortByAtom,
  adminImagesSortOrderAtom,
  adminImagesStatusFilterAtom,
  type ImageModerationFilterValue,
  type ImagePrivacyFilterValue,
  type ImageStatusFilterValue,
} from '@/lib/images-page-state'
import { PageHeader } from '@/components/common/page-header'
import { KPICard } from '@/components/common/kpi-card'
import { StatusBadge } from '@/components/common/status-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

const IMAGES_QUERY_KEY = 'admin-images'
const IMAGE_QUERY_KEY = 'admin-image'
const OVERVIEW_QUERY_KEY = 'admin-overview'
const IMAGES_PAGE_SIZE = 20

function buildImagesQueryInput(query: {
  page: number
  limit: number
  search: string
  status: ImageStatusFilterValue
  moderation: ImageModerationFilterValue
  privacy: ImagePrivacyFilterValue
  sortBy: AdminImagesQueryInput['sortBy']
  sortOrder: AdminImagesQueryInput['sortOrder']
}): AdminImagesQueryInput {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search || undefined,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    status: query.status === 'all' ? undefined : query.status,
    moderationStatus:
      query.moderation === 'all' ? undefined : query.moderation,
    isPrivate:
      query.privacy === 'all'
        ? undefined
        : query.privacy === 'private',
  }
}

function getImageStatusTone(status: AdminImageSummary['status']) {
  switch (status) {
    case 'UPLOADING':
      return 'bg-sky-100 text-sky-900'
    case 'PROCESSING':
      return 'bg-violet-100 text-violet-900'
    case 'READY':
      return 'bg-emerald-100 text-emerald-900'
    case 'FAILED':
      return 'bg-rose-100 text-rose-900'
    case 'DELETED':
      return 'bg-slate-200 text-slate-800'
    default:
      return 'bg-slate-200 text-slate-800'
  }
}

function getImageModerationTone(status: AdminImageSummary['moderationStatus']) {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-900'
    case 'PENDING':
      return 'bg-amber-100 text-amber-900'
    case 'REJECTED':
      return 'bg-rose-100 text-rose-900'
    default:
      return 'bg-slate-200 text-slate-800'
  }
}

function getImagePreviewState(image: AdminImageDetail) {
  if (image.accessUrl) {
    return {
      title: 'Preview available',
      description: 'This image is public and ready, so a signed preview URL is available.',
    }
  }

  if (image.isPrivate) {
    return {
      title: 'Private image',
      description:
        'Private image previews are intentionally withheld in the admin console. Metadata is still available for moderation and investigation.',
    }
  }

  if (image.status !== 'READY') {
    return {
      title: 'Preview unavailable',
      description:
        'Preview links are only generated for public images that have completed processing.',
    }
  }

  return {
    title: 'Preview unavailable',
    description:
      'This image does not currently have a signed preview URL. Refresh the record if you expect one to be present.',
  }
}

function canApproveImage(image: AdminImageSummary | AdminImageDetail) {
  return image.status === 'READY' && image.moderationStatus !== 'APPROVED'
}

function canRejectImage(image: AdminImageSummary | AdminImageDetail) {
  return image.status === 'READY' && image.moderationStatus !== 'REJECTED'
}

function canDeleteImage(image: AdminImageSummary | AdminImageDetail) {
  return image.status !== 'DELETED'
}

function MediaPreviewPanel({
  image,
}: {
  image: AdminImageDetail
}) {
  const previewState = getImagePreviewState(image)

  if (image.accessUrl) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
        <img
          src={image.accessUrl}
          alt={image.eventName ?? 'Image preview'}
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/25 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-none">
        {image.isPrivate ? <LockIcon className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-base font-semibold">{previewState.title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {previewState.description}
      </p>
    </div>
  )
}

export default function ImagesPage() {
  const queryClient = useQueryClient()
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()
  const [searchInput, setSearchInput] = useAtom(adminImagesSearchInputAtom)
  const deferredSearch = useDeferredValue(searchInput.trim())
  const [page, setPage] = useAtom(adminImagesPageAtom)
  const [statusFilter, setStatusFilter] = useAtom(adminImagesStatusFilterAtom)
  const [moderationFilter, setModerationFilter] = useAtom(adminImagesModerationFilterAtom)
  const [privacyFilter, setPrivacyFilter] = useAtom(adminImagesPrivacyFilterAtom)
  const [sortBy, setSortBy] = useAtom(adminImagesSortByAtom)
  const [sortOrder, setSortOrder] = useAtom(adminImagesSortOrderAtom)
  const [selectedImageId, setSelectedImageId] = useAtom(adminImagesSelectedImageIdAtom)
  const [imageAction, setImageAction] = useAtom(adminImagesActionAtom)
  const [actionReason, setActionReason] = useAtom(adminImagesActionReasonAtom)
  const clearActionReason = useSetAtom(adminImagesActionReasonAtom)

  useEffect(() => {
    setPage(1)
  }, [deferredSearch, moderationFilter, privacyFilter, setPage, sortBy, sortOrder, statusFilter])

  const queryInput = useMemo(
    () =>
      buildImagesQueryInput({
        page,
        limit: IMAGES_PAGE_SIZE,
        search: deferredSearch,
        status: statusFilter,
        moderation: moderationFilter,
        privacy: privacyFilter,
        sortBy,
        sortOrder,
      }),
    [
      deferredSearch,
      moderationFilter,
      page,
      privacyFilter,
      sortBy,
      sortOrder,
      statusFilter,
    ],
  )

  const imagesQuery = useQuery({
    queryKey: [IMAGES_QUERY_KEY, queryInput],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminImages(accessToken, queryInput),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
    placeholderData: (previousData) => previousData,
  })

  const selectedImageQuery = useQuery({
    queryKey: [IMAGE_QUERY_KEY, selectedImageId],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        getAdminImageById(accessToken, selectedImageId!),
      ),
    enabled: Boolean(
      selectedImageId &&
        bootstrapStatus === 'ready' &&
        isAuthenticated,
    ),
  })

  const overviewQuery = useQuery({
    queryKey: [OVERVIEW_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) => getAdminOverview(accessToken)),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
  })

  const moderationMutation = useMutation({
    mutationFn: async (input: {
      imageId: string
      moderationStatus: AdminImageModerationStatusValue
      reason: string
    }) =>
      performAuthenticatedRequest((accessToken) =>
        updateAdminImageModeration(accessToken, input.imageId, {
          moderationStatus: input.moderationStatus,
          reason: input.reason,
        }),
      ),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [IMAGES_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [IMAGE_QUERY_KEY, variables.imageId] }),
        queryClient.invalidateQueries({ queryKey: [OVERVIEW_QUERY_KEY] }),
      ])
      setImageAction(null)
      clearActionReason('')
      toast.success(
        variables.moderationStatus === 'APPROVED'
          ? 'Image approved'
          : 'Image rejected',
      )
    },
    onError: (error) => {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to update image moderation'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (input: {
      imageId: string
    }) =>
      performAuthenticatedRequest((accessToken) =>
        deleteAdminImage(accessToken, input.imageId),
      ),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [IMAGES_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [IMAGE_QUERY_KEY, variables.imageId] }),
        queryClient.invalidateQueries({ queryKey: [OVERVIEW_QUERY_KEY] }),
      ])
      setImageAction(null)
      clearActionReason('')
      if (selectedImageId === variables.imageId) {
        setSelectedImageId(null)
      }
      toast.success('Image deleted')
    },
    onError: (error) => {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to delete image'
      toast.error(message)
    },
  })

  const refreshImages = async () => {
    try {
      await Promise.all([imagesQuery.refetch(), overviewQuery.refetch()])
      if (selectedImageId) {
        await selectedImageQuery.refetch()
      }
      toast.success('Images refreshed')
    } catch (error) {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to refresh images'
      toast.error(message)
    }
  }

  const images = imagesQuery.data?.data.items ?? []
  const overview = overviewQuery.data?.data.overview
  const totalCount = imagesQuery.data?.data.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / IMAGES_PAGE_SIZE))
  const selectedImage = selectedImageQuery.data?.data.image ?? null
  const visiblePrivateCount = images.filter((image) => image.isPrivate).length
  const visibleReadyCount = images.filter((image) => image.status === 'READY').length
  const visibleHdCount = images.filter((image) => image.hd).length
  const canSubmitAction =
    imageAction?.type === 'delete' || actionReason.trim().length >= 3
  const actionIsLoading = moderationMutation.isPending || deleteMutation.isPending

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, setPage, totalPages])

  const handleConfirmAction = async () => {
    if (!imageAction || !canSubmitAction) {
      return
    }

    if (imageAction.type === 'moderation') {
      await moderationMutation.mutateAsync({
        imageId: imageAction.image.id,
        moderationStatus: imageAction.nextModerationStatus,
        reason: actionReason.trim(),
      })
      return
    }

    await deleteMutation.mutateAsync({
      imageId: imageAction.image.id,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Images"
        description="Review uploads, inspect file metadata, and moderate what becomes visible across the platform."
        actions={
          <Button
            variant="outline"
            onClick={() => void refreshImages()}
            disabled={
              imagesQuery.isFetching ||
              overviewQuery.isFetching ||
              selectedImageQuery.isFetching
            }
          >
            {imagesQuery.isFetching || overviewQuery.isFetching || selectedImageQuery.isFetching ? (
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
          title="Matching images"
          value={totalCount.toLocaleString()}
          change={overview ? Math.round((totalCount / Math.max(overview.totalImages, 1)) * 100) : 0}
          changeLabel="of total inventory"
          icon={<ScanSearchIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Pending review"
          value={(overview?.pendingModeratedImages ?? 0).toLocaleString()}
          change={overview ? Math.round((overview.pendingModeratedImages / Math.max(overview.totalImages, 1)) * 100) : 0}
          changeLabel="awaiting decisions"
          icon={<Clock3Icon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Rejected"
          value={(overview?.rejectedImages ?? 0).toLocaleString()}
          change={overview ? Math.round((overview.rejectedImages / Math.max(overview.totalImages, 1)) * 100) : 0}
          changeLabel="hidden from viewers"
          icon={<ShieldOffIcon className="h-5 w-5 text-muted-foreground" />}
          className="rounded-2xl border-border/70 bg-card/90 shadow-none"
        />
        <KPICard
          title="Visible in view"
          value={visibleReadyCount.toLocaleString()}
          change={Math.round((visiblePrivateCount / Math.max(images.length, 1)) * 100)}
          changeLabel="private within current page"
          icon={<SparklesIcon className="h-5 w-5 text-muted-foreground" />}
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
                placeholder="Search uploads"
                className="h-11 rounded-xl border-border/70 bg-background pl-10 shadow-none"
              />
            </div>
            <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/35 px-3 py-1.5 text-sm text-muted-foreground">
              Showing <span className="mx-1 font-semibold text-foreground">{images.length}</span> of{' '}
              <span className="mx-1 font-semibold text-foreground">{totalCount}</span> images
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Filter
              </span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ImageStatusFilterValue)}
              >
                <SelectTrigger className="h-10 w-[160px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="UPLOADING">Uploading</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="DELETED">Deleted</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={moderationFilter}
                onValueChange={(value) =>
                  setModerationFilter(value as ImageModerationFilterValue)
                }
              >
                <SelectTrigger className="h-10 w-[180px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Moderation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All moderation</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={privacyFilter}
                onValueChange={(value) => setPrivacyFilter(value as ImagePrivacyFilterValue)}
              >
                <SelectTrigger className="h-10 w-[150px] rounded-full border-border/70 bg-background shadow-none">
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
                  setSortBy(value as NonNullable<AdminImagesQueryInput['sortBy']>)
                }
              >
                <SelectTrigger className="h-10 w-[170px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created date</SelectItem>
                  <SelectItem value="updatedAt">Updated date</SelectItem>
                  <SelectItem value="sizeBytes">File size</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortOrder ?? 'DESC'}
                onValueChange={(value) =>
                  setSortOrder(value as NonNullable<AdminImagesQueryInput['sortOrder']>)
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
        {imagesQuery.isLoading ? (
          <div className="flex min-h-80 flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-3 w-[120px]" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="hidden h-4 w-[80px] sm:block" />
              </div>
            ))}
          </div>
        ) : imagesQuery.isError ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Unable to load images</h2>
                <p className="text-sm text-muted-foreground">
                  {isAdminApiError(imagesQuery.error) || imagesQuery.error instanceof Error
                    ? imagesQuery.error.message
                    : 'Something went wrong while loading the image list.'}
                </p>
              </div>
              <Button onClick={() => void imagesQuery.refetch()}>Try again</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Moderation</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {images.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                        No images matched your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    images.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 text-left"
                            onClick={() => setSelectedImageId(image.id)}
                          >
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/30 text-muted-foreground shadow-none">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                            {/* <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">
                                  {image.hd ? 'HD upload' : 'Standard upload'}
                                </p>
                                {image.hd ? (
                                  <Badge variant="secondary" className="rounded-full">
                                    HD
                                  </Badge>
                                ) : null}
                              </div>
                              
                            </div> */}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/events/${image.eventId}`} className="block">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {image.eventName ?? 'Unnamed event'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Tap to open the event
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={image.uploader.url ?? undefined} />
                              <AvatarFallback>{getImageUploaderInitials(image)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <p className="font-medium">{getImageUploaderDisplayName(image)}</p>
                              <p className="text-sm text-muted-foreground">
                                {image.uploader.email ?? 'No email address'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="gap-1 rounded-full">
                              {image.isPrivate ? (
                                <LockIcon className="h-3.5 w-3.5" />
                              ) : (
                                <GlobeIcon className="h-3.5 w-3.5" />
                              )}
                              {image.isPrivate ? 'Private' : 'Public'}
                            </Badge>
                            {image.hd ? (
                              <Badge variant="secondary" className="rounded-full">
                                HD
                              </Badge>
                            ) : null}
                            <StatusBadge
                                  status={image.status.toLowerCase()}
                                  colorClass={getImageStatusTone(image.status)}
                                />
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={image.moderationStatus.toLowerCase()}
                            colorClass={getImageModerationTone(image.moderationStatus)}
                          />
                        </TableCell>
                        {/* <TableCell className="text-sm text-muted-foreground">
                          <div className="space-y-1">
                            <p>{formatImageFileSize(image.sizeBytes)}</p>
                            <p>{image.contentType}</p>
                          </div>
                        </TableCell> */}
                        <TableCell className="text-sm text-muted-foreground">
                          {formatImageDateTime(image.createdAt)}
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
                              <DropdownMenuItem onClick={() => setSelectedImageId(image.id)}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!canApproveImage(image)}
                                onClick={() => {
                                  clearActionReason('')
                                  setImageAction({
                                    type: 'moderation',
                                    image,
                                    nextModerationStatus: 'APPROVED',
                                  })
                                }}
                              >
                                <ShieldCheckIcon className="mr-2 h-4 w-4" />
                                Approve image
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!canRejectImage(image)}
                                onClick={() => {
                                  clearActionReason('')
                                  setImageAction({
                                    type: 'moderation',
                                    image,
                                    nextModerationStatus: 'REJECTED',
                                  })
                                }}
                              >
                                <ShieldOffIcon className="mr-2 h-4 w-4" />
                                Reject image
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={!canDeleteImage(image)}
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  clearActionReason('')
                                  setImageAction({
                                    type: 'delete',
                                    image,
                                  })
                                }}
                              >
                                <Trash2Icon className="mr-2 h-4 w-4" />
                                Delete image
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
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Page {page} of {totalPages}
                </span>
                <Separator orientation="vertical" className="hidden h-4 sm:block" />
                <span>{visibleHdCount.toLocaleString()} HD in view</span>
                <Separator orientation="vertical" className="hidden h-4 sm:block" />
                <span>{visiblePrivateCount.toLocaleString()} private in view</span>
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
        open={Boolean(selectedImageId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedImageId(null)
          }
        }}
      >
        <SheetContent side="right" className="w-full gap-0 overflow-hidden sm:max-w-2xl">
          <SheetHeader className="border-b border-border/70 bg-card">
            <SheetTitle>Image details</SheetTitle>
            <SheetDescription>
              Inspect moderation state, preview access, and file metadata.
            </SheetDescription>
          </SheetHeader>

          {selectedImageQuery.isLoading ? (
            <div className="mt-6 space-y-4 px-1">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
            </div>
          ) : selectedImageQuery.isError ? (
            <div className="flex flex-1 items-center justify-center px-8 text-center">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">Unable to load image</h2>
                  <p className="text-sm text-muted-foreground">
                    {isAdminApiError(selectedImageQuery.error) || selectedImageQuery.error instanceof Error
                      ? selectedImageQuery.error.message
                      : 'Something went wrong while loading this image.'}
                  </p>
                </div>
                <Button onClick={() => void selectedImageQuery.refetch()}>Try again</Button>
              </div>
            </div>
          ) : selectedImage ? (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="space-y-6 p-6">
                <div className="space-y-4">
                  <MediaPreviewPanel image={selectedImage} />
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      status={selectedImage.status.toLowerCase()}
                      colorClass={getImageStatusTone(selectedImage.status)}
                    />
                    <StatusBadge
                      status={selectedImage.moderationStatus.toLowerCase()}
                      colorClass={getImageModerationTone(selectedImage.moderationStatus)}
                    />
                    <Badge variant="outline" className="rounded-full">
                      {selectedImage.isPrivate ? 'Private' : 'Public'}
                    </Badge>
                    {selectedImage.hd ? (
                      <Badge variant="secondary" className="rounded-full">
                        HD
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <Card className="rounded-2xl border-border/70 bg-muted/15">
                  <CardHeader className="pb-4">
                    <CardTitle>Record</CardTitle>
                    <CardDescription>
                      The moderation timeline and delivery state for this upload.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p className="font-medium">{formatImageDateTime(selectedImage.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Delivery state</p>
                      <p className="font-medium">{selectedImage.status}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Moderated at</p>
                      <p className="font-medium">
                        {formatImageDateTime(selectedImage.moderatedAt)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Moderated by</p>
                      <p className="font-medium">
                        {selectedImage.moderatedByUserId ?? 'Not yet moderated'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/70 bg-muted/15">
                  <CardHeader className="pb-4">
                    <CardTitle>Event and uploader</CardTitle>
                    <CardDescription>
                      The source event and user account connected to this image.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Event</p>
                      <Link
                        href={`/dashboard/events/${selectedImage.eventId}`}
                        className="block rounded-2xl border border-border/70 bg-background p-4 transition hover:border-foreground/20"
                      >
                        <p className="font-semibold">
                          {selectedImage.eventName ?? 'Unnamed event'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Open the event record
                        </p>
                      </Link>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Uploader</p>
                      <div className="rounded-2xl border border-border/70 bg-background p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedImage.uploader.url ?? undefined} />
                            <AvatarFallback>{getImageUploaderInitials(selectedImage)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <p className="font-semibold">{getImageUploaderDisplayName(selectedImage)}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedImage.uploader.email ?? 'No email address'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border/70 bg-muted/15">
                  <CardHeader className="pb-4">
                    <CardTitle>File profile</CardTitle>
                    <CardDescription>
                      File characteristics used for storage, moderation, and downstream delivery.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background p-4">
                      <HardDriveIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">File size</p>
                        <p className="font-semibold">{formatImageFileSize(selectedImage.sizeBytes)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background p-4">
                      <ImageIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
                        <p className="font-semibold">
                          {selectedImage.width && selectedImage.height
                            ? `${selectedImage.width} × ${selectedImage.height}`
                            : 'Not available'}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <p className="text-sm font-medium text-muted-foreground">Content type</p>
                      <p className="mt-1 font-semibold">{selectedImage.contentType}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <p className="text-sm font-medium text-muted-foreground">Preview access</p>
                      <p className="mt-1 font-semibold">
                        {selectedImage.accessUrl ? 'Signed URL available' : 'Metadata only'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="border-t border-border/70 bg-background/95 p-6">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    disabled={!canApproveImage(selectedImage)}
                    onClick={() => {
                      clearActionReason('')
                      setImageAction({
                        type: 'moderation',
                        image: selectedImage,
                        nextModerationStatus: 'APPROVED',
                      })
                    }}
                  >
                    <ShieldCheckIcon className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canRejectImage(selectedImage)}
                    onClick={() => {
                      clearActionReason('')
                      setImageAction({
                        type: 'moderation',
                        image: selectedImage,
                        nextModerationStatus: 'REJECTED',
                      })
                    }}
                  >
                    <ShieldOffIcon className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={!canDeleteImage(selectedImage)}
                    onClick={() => {
                      clearActionReason('')
                      setImageAction({
                        type: 'delete',
                        image: selectedImage,
                      })
                    }}
                  >
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(imageAction)}
        onOpenChange={(open) => {
          if (!open) {
            setImageAction(null)
            clearActionReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {imageAction?.type === 'moderation'
                ? imageAction.nextModerationStatus === 'APPROVED'
                  ? 'Approve image'
                  : 'Reject image'
                : 'Delete image'}
            </DialogTitle>
            <DialogDescription>
              {imageAction?.type === 'moderation'
                ? imageAction.nextModerationStatus === 'APPROVED'
                  ? 'Record why this image is safe to show and move it into the approved set.'
                  : 'Record why this image should stay hidden from viewers.'
                : 'Soft delete this image and record why it needs to be removed from the platform.'}
            </DialogDescription>
          </DialogHeader>

          {imageAction ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-none">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {imageAction.image.eventName ?? 'Unnamed event'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatImageFileSize(imageAction.image.sizeBytes)} • {imageAction.image.contentType}
                    </p>
                  </div>
                </div>
              </div>

              {imageAction.type === 'moderation' ? (
                <div className="space-y-2">
                  <Label htmlFor="image-action-reason">Reason</Label>
                  <Textarea
                    id="image-action-reason"
                    value={actionReason}
                    onChange={(event) => setActionReason(event.target.value)}
                    placeholder="Add a clear operational reason for the audit trail"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    At least 3 characters are required.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  This removes the image from normal admin and viewer flows while preserving the
                  backend audit trail.
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImageAction(null)
                clearActionReason('')
              }}
              disabled={actionIsLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmAction()}
              disabled={!canSubmitAction || actionIsLoading}
              variant={imageAction?.type === 'delete' ? 'destructive' : 'default'}
            >
              {actionIsLoading ? <Spinner className="mr-2 size-4" /> : null}
              {imageAction?.type === 'moderation'
                ? imageAction.nextModerationStatus === 'APPROVED'
                  ? 'Approve image'
                  : 'Reject image'
                : 'Delete image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
