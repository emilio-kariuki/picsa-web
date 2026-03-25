import { atom } from 'jotai'
import type {
  AdminImageModerationStatusValue,
  AdminImageStatusValue,
  AdminImageSummary,
} from '@/lib/admin-images-api'

export type ImageStatusFilterValue = 'all' | AdminImageStatusValue
export type ImageModerationFilterValue = 'all' | AdminImageModerationStatusValue
export type ImagePrivacyFilterValue = 'all' | 'private' | 'public'

export type ImageActionState =
  | {
      type: 'moderation'
      image: AdminImageSummary
      nextModerationStatus: AdminImageModerationStatusValue
    }
  | {
      type: 'delete'
      image: AdminImageSummary
    }
  | null

export const adminImagesSearchInputAtom = atom('')
export const adminImagesPageAtom = atom(1)
export const adminImagesStatusFilterAtom = atom<ImageStatusFilterValue>('all')
export const adminImagesModerationFilterAtom = atom<ImageModerationFilterValue>('all')
export const adminImagesPrivacyFilterAtom = atom<ImagePrivacyFilterValue>('all')
export const adminImagesSortByAtom = atom<'createdAt' | 'updatedAt' | 'sizeBytes' | 'status'>('createdAt')
export const adminImagesSortOrderAtom = atom<'ASC' | 'DESC'>('DESC')
export const adminImagesSelectedImageIdAtom = atom<string | null>(null)
export const adminImagesActionAtom = atom<ImageActionState>(null)
export const adminImagesActionReasonAtom = atom('')
