import { atom } from 'jotai'
import type {
  AdminTicketPriorityValue,
  AdminTicketSortBy,
  AdminTicketSortOrder,
  AdminTicketStatusValue,
  AdminTicketTypeValue,
} from '@/lib/admin-tickets-api'

export type TicketStatusFilterValue = 'all' | AdminTicketStatusValue
export type TicketPriorityFilterValue = 'all' | AdminTicketPriorityValue
export type TicketAssignmentFilterValue = 'all' | 'assigned' | 'unassigned'
export type TicketTypeFilterValue = 'all' | AdminTicketTypeValue

export const adminTicketsSearchInputAtom = atom('')
export const adminTicketsPageAtom = atom(1)
export const adminTicketsTypeFilterAtom = atom<TicketTypeFilterValue>('all')
export const adminTicketsStatusFilterAtom = atom<TicketStatusFilterValue>('all')
export const adminTicketsPriorityFilterAtom = atom<TicketPriorityFilterValue>('all')
export const adminTicketsAssignmentFilterAtom = atom<TicketAssignmentFilterValue>('all')
export const adminTicketsSortByAtom = atom<AdminTicketSortBy>('updatedAt')
export const adminTicketsSortOrderAtom = atom<AdminTicketSortOrder>('DESC')
export const adminTicketsSelectedTicketIdAtom = atom<string | null>(null)
