import { atom } from 'jotai'
import type {
  AdminEventJoinModeValue,
  AdminEventSortOrder,
  AdminEventStatusValue,
  AdminEventSummary,
} from '@/lib/admin-events-api'

export type EventStatusFilterValue = 'all' | AdminEventStatusValue
export type EventJoinModeFilterValue = 'all' | AdminEventJoinModeValue
export type EventPrivacyFilterValue = 'all' | 'private' | 'public'

export type EventActionState =
  | {
      event: AdminEventSummary
      nextStatus: AdminEventStatusValue
    }
  | null

export const adminEventsSearchInputAtom = atom('')
export const adminEventsPageAtom = atom(1)
export const adminEventsStatusFilterAtom = atom<EventStatusFilterValue>('all')
export const adminEventsJoinModeFilterAtom = atom<EventJoinModeFilterValue>('all')
export const adminEventsPrivacyFilterAtom = atom<EventPrivacyFilterValue>('all')
export const adminEventsSortByAtom = atom<'createdAt' | 'updatedAt' | 'name' | 'memberCount'>('createdAt')
export const adminEventsSortOrderAtom = atom<AdminEventSortOrder>('DESC')
export const adminEventsActionAtom = atom<EventActionState>(null)
export const adminEventsActionReasonAtom = atom('')
