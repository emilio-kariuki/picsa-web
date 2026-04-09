'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { listAdminUsers, type AdminUserSummary } from '@/lib/admin-users-api'
import { listAdminEvents, type AdminEventSummary } from '@/lib/admin-events-api'
import { listAdminTickets, type AdminTicketSummary } from '@/lib/admin-tickets-api'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  UsersIcon,
  CalendarDaysIcon,
  TicketIcon,
  HomeIcon,
  CreditCardIcon,
  ImageIcon,
  BellIcon,
  SettingsIcon,
  ClipboardListIcon,
  Loader2Icon,
} from '@/components/ui/icons'

const pages = [
  { icon: HomeIcon, label: 'Dashboard', href: '/dashboard' },
  { icon: UsersIcon, label: 'Users', href: '/dashboard/users' },
  { icon: CreditCardIcon, label: 'Payments', href: '/dashboard/payments' },
  { icon: CalendarDaysIcon, label: 'Events', href: '/dashboard/events' },
  { icon: ImageIcon, label: 'Images', href: '/dashboard/media' },
  { icon: TicketIcon, label: 'Tickets', href: '/dashboard/tickets' },
  { icon: BellIcon, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: SettingsIcon, label: 'Settings', href: '/dashboard/settings' },
  { icon: ClipboardListIcon, label: 'Audit Log', href: '/dashboard/audit-log' },
]

interface SearchResults {
  users: AdminUserSummary[]
  events: AdminEventSummary[]
  tickets: AdminTicketSummary[]
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults>({
    users: [],
    events: [],
    tickets: [],
  })
  const router = useRouter()
  const { performAuthenticatedRequest } = useAdminAuth()
  const abortRef = useRef(0)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults({ users: [], events: [], tickets: [] })
    }
  }, [open])

  const search = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setResults({ users: [], events: [], tickets: [] })
        setLoading(false)
        return
      }

      const id = ++abortRef.current
      setLoading(true)

      try {
        const [usersRes, eventsRes, ticketsRes] = await Promise.allSettled([
          performAuthenticatedRequest((token) =>
            listAdminUsers(token, { search: term, limit: 5 })
          ),
          performAuthenticatedRequest((token) =>
            listAdminEvents(token, { search: term, limit: 5 })
          ),
          performAuthenticatedRequest((token) =>
            listAdminTickets(token, { search: term, limit: 5 })
          ),
        ])

        if (abortRef.current !== id) return

        setResults({
          users:
            usersRes.status === 'fulfilled'
              ? usersRes.value.data.items
              : [],
          events:
            eventsRes.status === 'fulfilled'
              ? eventsRes.value.data.items
              : [],
          tickets:
            ticketsRes.status === 'fulfilled'
              ? ticketsRes.value.data.items
              : [],
        })
      } catch {
        if (abortRef.current === id) {
          setResults({ users: [], events: [], tickets: [] })
        }
      } finally {
        if (abortRef.current === id) {
          setLoading(false)
        }
      }
    },
    [performAuthenticatedRequest],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      void search(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const navigate = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  const hasQuery = query.trim().length > 0
  const hasResults =
    results.users.length > 0 ||
    results.events.length > 0 ||
    results.tickets.length > 0

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Global Search"
      description="Search across users, events, tickets, and pages"
      showCloseButton={false}
    >
      <CommandInput
        placeholder="Search users, events, tickets..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {hasQuery && !loading && !hasResults && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {loading && hasQuery && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Searching...
          </div>
        )}

        {!hasQuery && (
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem
                key={page.href}
                value={page.label}
                onSelect={() => navigate(page.href)}
              >
                <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.users.length > 0 && (
          <>
            <CommandGroup heading="Users">
              {results.users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`user-${user.id}-${user.name ?? ''}-${user.email ?? ''}`}
                  onSelect={() => navigate(`/dashboard/users?search=${encodeURIComponent(query)}`)}
                >
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage src={user.url ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm">{user.name ?? 'Unnamed'}</span>
                    {user.email && (
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {results.events.length > 0 && (
          <>
            <CommandGroup heading="Events">
              {results.events.map((event) => (
                <CommandItem
                  key={event.id}
                  value={`event-${event.id}-${event.name}`}
                  onSelect={() => navigate(`/dashboard/events/${event.id}`)}
                >
                  <CalendarDaysIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm">{event.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.memberCount} members
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {results.tickets.length > 0 && (
          <CommandGroup heading="Tickets">
            {results.tickets.map((ticket) => (
              <CommandItem
                key={ticket.id}
                value={`ticket-${ticket.id}-${ticket.subject}-${ticket.ticketNumber}`}
                onSelect={() => navigate(`/dashboard/tickets/${ticket.id}`)}
              >
                <TicketIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm">{ticket.subject}</span>
                  <span className="text-xs text-muted-foreground">
                    #{ticket.ticketNumber} &middot; {ticket.status}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
