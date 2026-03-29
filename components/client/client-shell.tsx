'use client'

import { useMemo, useState, type ReactNode } from 'react'
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
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
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

function ClientNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-2">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
            isActivePath(pathname, item.href)
              ? 'bg-primary text-primary-foreground shadow-[0_16px_30px_rgba(43,37,34,0.16)]'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}

export function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentUser = useAtomValue(clientCurrentUserAtom)
  const { logout } = useClientAuth()
  const [sheetOpen, setSheetOpen] = useState(false)

  const displayName = getClientDisplayName(currentUser)
  const initials = getClientInitials(currentUser)

  const eyebrow = useMemo(() => {
    if (pathname === '/') {
      return 'Workspace'
    }

    if (pathname.startsWith('/events')) {
      return 'Events'
    }

    if (pathname.startsWith('/images')) {
      return 'Images'
    }

    if (pathname.startsWith('/notifications')) {
      return 'Notifications'
    }

    return 'Account'
  }, [pathname])

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="relative mx-auto flex h-full w-full max-w-[1440px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden h-full w-[280px] shrink-0 lg:flex">
          <div className="flex h-full w-full flex-col rounded-[2rem] border border-border/70 bg-card/90 p-5 shadow-[0_24px_80px_rgba(35,30,27,0.08)] backdrop-blur">
            <Link href="/" className="flex items-center gap-3 px-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-accent-foreground shadow-sm font-serif">
                P
              </span>
              <div>
                <p className="font-serif text-xl font-semibold tracking-tight">Picsa</p>
                <p className="text-sm text-muted-foreground">Organizer workspace</p>
              </div>
            </Link>

            <div className="mt-8">
              <ClientNavigation pathname={pathname} />
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-border/70 bg-secondary/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Ready in minutes</p>
              <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight text-foreground">
                Start a gallery guests will actually use.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Create the event, open uploads, and keep every guest photo in one place without losing the landing-page warmth.
              </p>
              <Button asChild className="mt-5 w-full rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
                <Link href="/events/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New event
                </Link>
              </Button>
            </div>

            <div className="mt-auto rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-border/60">
                  <AvatarImage src={currentUser?.url ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{currentUser?.email ?? 'No email on file'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="mt-4 w-full justify-start rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => void logout()}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="z-20 mb-6 shrink-0 rounded-[1.75rem] border border-border/70 bg-card/85 px-4 py-3 shadow-[0_18px_40px_rgba(35,30,27,0.08)] backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full lg:hidden">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="border-r-border/70 bg-background/98 p-0">
                  <SheetHeader className="border-b border-border/70 px-6 py-5 text-left">
                    <SheetTitle className="font-serif text-2xl">Picsa Workspace</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 px-6 py-6">
                    <ClientNavigation pathname={pathname} onNavigate={() => setSheetOpen(false)} />
                    <Button asChild className="w-full rounded-full bg-primary text-primary-foreground">
                      <Link href="/events/new" onClick={() => setSheetOpen(false)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New event
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
                <p className="font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  One event. Every photo. All in one place.
                </p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden rounded-full border-border/80 bg-background/70 sm:inline-flex"
                  onClick={() => router.push('/events/new')}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New event
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-11 rounded-full px-2">
                      <Avatar className="h-9 w-9 border border-border/70">
                        <AvatarImage src={currentUser?.url ?? undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-2xl">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{currentUser?.email ?? 'No email on file'}</p>
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
                    <DropdownMenuItem onSelect={() => void logout()}>
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="client-scroll-area min-h-0 flex-1 overflow-y-auto pb-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
