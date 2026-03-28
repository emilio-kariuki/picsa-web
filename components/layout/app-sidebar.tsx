'use client'

import { useAtomValue } from 'jotai'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboardIcon,
  UsersIcon,
  CreditCardIcon,
  BellIcon,
  TicketIcon,
  SettingsIcon,
  ClipboardListIcon,
  LogOutIcon,
  ChevronsUpDownIcon,
  SparklesIcon,
  CalendarIcon,
  ImageIcon,
} from 'lucide-react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { getAdminDisplayName, getAdminInitials } from '@/lib/auth'
import { currentUserAtom } from '@/lib/store'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCardIcon },
  { name: 'Events', href: '/dashboard/events', icon: CalendarIcon },
  { name: 'Images', href: '/dashboard/media', icon: ImageIcon },
  { name: 'Tickets', href: '/dashboard/tickets', icon: TicketIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
  { name: 'Audit Log', href: '/dashboard/audit-log', icon: ClipboardListIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const currentUser = useAtomValue(currentUserAtom)
  const { logout } = useAdminAuth()
  const displayName = getAdminDisplayName(currentUser)
  const initials = getAdminInitials(currentUser)

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="[--sidebar-width:18.75rem] [--sidebar-width-icon:4.75rem]"
    >
      <SidebarHeader className="px-3 pt-5 pb-4">
        <SidebarMenu className="gap-3">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-14 rounded-[1.35rem] border border-white/6 bg-[linear-gradient(180deg,rgba(20,27,48,0.96),rgba(10,14,27,0.92))] px-4 text-white shadow-[0_18px_45px_rgba(0,0,0,0.28)] hover:bg-[linear-gradient(180deg,rgba(24,33,58,0.98),rgba(12,17,31,0.94))] data-[active=true]:bg-[linear-gradient(180deg,rgba(24,33,58,0.98),rgba(12,17,31,0.94))]"
            >
              <Link href="/dashboard">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                  <SparklesIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1 leading-none">
                  <span className="text-[0.95rem] font-semibold tracking-[-0.02em]">
                    Picsa
                  </span>
                  <span className="text-[0.72rem] uppercase tracking-[0.28em] text-white/45">
                    Admin Console
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-3 pb-4">
        <SidebarMenu className="gap-2.5">
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={
                  item.href === '/dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
                tooltip={item.name}
                className="h-12 rounded-[1.15rem] px-4 text-[0.96rem] font-medium tracking-[-0.02em] text-white/58 hover:bg-white/[0.045] hover:text-white data-[active=true]:border data-[active=true]:border-white/6 data-[active=true]:bg-[linear-gradient(180deg,rgba(18,25,46,0.96),rgba(12,16,30,0.92))] data-[active=true]:text-white data-[active=true]:shadow-[0_10px_28px_rgba(0,0,0,0.22)] [&>svg]:size-[1.05rem] [&>svg]:text-white/56 data-[active=true]:[&>svg]:text-white"
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto px-3 pb-4 pt-3">
        <SidebarMenu className="gap-3">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-14 rounded-[1.25rem] border border-white/6 bg-white/[0.035] px-4 text-white/88 hover:bg-white/[0.055] data-[state=open]:bg-white/[0.065] data-[state=open]:text-white"
                >
                  <Avatar className="h-9 w-9 ring-1 ring-white/10">
                    <AvatarImage src={currentUser?.url ?? undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 leading-none">
                    <span className="font-medium tracking-[-0.02em]">{displayName}</span>
                    <span className="text-[0.72rem] uppercase tracking-[0.24em] text-white/40">
                      Admin
                    </span>
                  </div>
                  <ChevronsUpDownIcon className="ml-auto h-4 w-4 text-white/45" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                align="start"
                side="top"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {currentUser?.email ?? 'No email on file'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
