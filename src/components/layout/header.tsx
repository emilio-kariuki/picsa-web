import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { Link } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { GlobalSearch } from '@/components/layout/global-search'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  SearchIcon,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
} from '@/components/ui/icons'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { getAdminDisplayName, getAdminInitials } from '@/lib/auth'
import { currentUserAtom } from '@/lib/store'
import type { Notification } from '@/lib/types'
import { cn } from '@/lib/utils'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const currentUser = useAtomValue(currentUserAtom)
  const { logout } = useAdminAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const displayName = getAdminDisplayName(currentUser)
  const initials = getAdminInitials(currentUser)

  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
    <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">


      {/* Search */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="relative hidden h-9 w-64 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent md:flex"
      >
        <SearchIcon className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {/* Mobile Search */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)}>
          <SearchIcon className="h-5 w-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h4 className="font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </p>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-3 border-b p-4 last:border-b-0',
                      !notification.read && 'bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'mt-1 h-2 w-2 rounded-full',
                        notification.type === 'alert' && 'bg-red-500',
                        notification.type === 'warning' && 'bg-amber-500',
                        notification.type === 'success' && 'bg-emerald-500',
                        notification.type === 'info' && 'bg-blue-500'
                      )}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckIcon className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="border-t p-2">
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/admin/dashboard/notifications">View all notifications</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser?.email ?? 'No email on file'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/dashboard/settings">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void logout()}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  )
}
