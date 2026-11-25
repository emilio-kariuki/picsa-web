import type { AdminImageSummary } from '@/lib/admin-images-api'

export function formatImageDateTime(value: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatImageFileSize(bytes: number) {
  if (bytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  )
  const value = bytes / 1024 ** unitIndex

  return `${value >= 100 ? Math.round(value) : value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`
}

export function getImageUploaderDisplayName(image: Pick<AdminImageSummary, 'uploader'>) {
  const name = image.uploader.name?.trim()

  if (name) {
    return name
  }

  return image.uploader.email?.split('@')[0] ?? 'Unknown uploader'
}

export function getImageUploaderInitials(image: Pick<AdminImageSummary, 'uploader'>) {
  const parts = getImageUploaderDisplayName(image).split(/\s+/).filter(Boolean)

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  )
}
