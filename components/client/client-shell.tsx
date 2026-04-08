'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import {
  BellIcon,
  CalendarDaysIcon,
  HomeIcon,
  ImageIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  SettingsIcon,
  XIcon,
} from '@/components/ui/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PicsaLogo } from '@/components/common/picsa-logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useClientAuth } from '@/hooks/use-client-auth'
import { getClientDisplayName, getClientInitials } from '@/lib/client-auth'
import { clientCurrentUserAtom } from '@/lib/store'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Events', href: '/events', icon: CalendarDaysIcon },
  { name: 'Images', href: '/images', icon: ImageIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/'
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="space-y-0.5">
      {navigation.map((item) => {
        const active = isActivePath(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-accent/12 text-accent'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <item.icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground',
              )}
            />
            {item.name}
          </Link>
        )
      })}
    </div>
  )
}

export function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentUser = useAtomValue(clientCurrentUserAtom)
  const { logout } = useClientAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const displayName = getClientDisplayName(currentUser)
  const initials = getClientInitials(currentUser)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <PicsaLogo size={26} />
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">Picsa</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <NavItems pathname={pathname} />
        </nav>

        {/* New event CTA */}
        <div className="border-t border-border p-3">
          <Button
            asChild
            className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/events/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New event
            </Link>
          </Button>
        </div>

        {/* User footer */}
        <div className="border-t border-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={currentUser?.url ?? undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{currentUser?.email ?? ''}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email ?? ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => void logout()}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile nav drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:hidden',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={() => setMobileNavOpen(false)}
          >
            <PicsaLogo size={28} />
            <span className="font-semibold text-foreground">Picsa</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setMobileNavOpen(false)}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3">
          <NavItems pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
        </nav>

        <div className="border-t border-border p-3">
          <Button
            asChild
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setMobileNavOpen(false)}
          >
            <Link href="/events/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New event
            </Link>
          </Button>
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.url ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{currentUser?.email ?? ''}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start rounded-xl text-muted-foreground hover:text-foreground"
            onClick={() => void logout()}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-sidebar/80 px-4 backdrop-blur-sm sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg lg:hidden"
            onClick={() => setMobileNavOpen(true)}
          >
            <MenuIcon className="h-4 w-4" />
          </Button>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Show logo on mobile since sidebar is hidden */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <PicsaLogo size={22} />
              <span className="font-serif text-base font-semibold tracking-tight text-foreground">Picsa</span>
            </Link>
            <div className="hidden h-5 w-px bg-border lg:block" />
            <span className="hidden truncate text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground lg:block">
              Organizer workspace
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 rounded-xl sm:inline-flex"
              onClick={() => router.push('/events/new')}
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New event
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={currentUser?.url ?? undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{currentUser?.email ?? ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => void logout()}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="client-scroll-area min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
