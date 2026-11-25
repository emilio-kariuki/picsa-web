import { atom } from 'jotai'
import type {
  AdminAuditChannel,
  AdminAuditOutcome,
} from '@/lib/admin-audit-logs-api'

export type AuditMethodFilterValue = 'all' | 'GET' | 'POST' | 'PATCH' | 'DELETE'
export type AuditChannelFilterValue = 'all' | AdminAuditChannel
export type AuditOutcomeFilterValue = 'all' | AdminAuditOutcome

export const adminAuditLogsSearchInputAtom = atom('')
export const adminAuditLogsPageAtom = atom(1)
export const adminAuditLogsChannelFilterAtom =
  atom<AuditChannelFilterValue>('all')
export const adminAuditLogsOutcomeFilterAtom =
  atom<AuditOutcomeFilterValue>('all')
export const adminAuditLogsMethodFilterAtom =
  atom<AuditMethodFilterValue>('all')
export const adminAuditLogsSortByAtom = atom<
  'action' | 'channel' | 'createdAt' | 'durationMs' | 'outcome' | 'route' | 'statusCode'
>('createdAt')
export const adminAuditLogsSortOrderAtom = atom<'ASC' | 'DESC'>('DESC')
export const adminAuditLogsSelectedAuditLogIdAtom = atom<string | null>(null)
