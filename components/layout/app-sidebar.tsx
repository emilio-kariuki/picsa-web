"use client"

import { useAtom, useAtomValue } from "jotai"
import { useTheme } from "next-themes"
import { currentUserAtom, sidebarCollapsedAtom } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter, usePathname } from "next/navigation"
import { PicsaLogo } from "@/components/common/picsa-logo"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { getAdminDisplayName, getAdminInitials } from "@/lib/auth"
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ImageIcon,
  TicketIcon,
  BellIcon,
  SettingsIcon,
  ClipboardListIcon,
  LogOutIcon,
  ChevronsUpDownIcon,
  SunIcon,
  MoonIcon,
  UserRoundIcon,
  PanelLeftIcon,
} from "@/components/ui/icons"

const menuItems = [
  { icon: HomeIcon, label: "Dashboard", page: "dashboard" },
  { icon: UsersIcon, label: "Users", page: "users" },
  { icon: CreditCardIcon, label: "Payments", page: "payments" },
  { icon: CalendarDaysIcon, label: "Events", page: "events" },
  { icon: ImageIcon, label: "Images", page: "media" },
  { icon: BellIcon, label: "Notifications", page: "notifications" },
  { icon: ClipboardListIcon, label: "Audit Log", page: "audit-log" },
  { icon: TicketIcon, label: "Tickets", page: "tickets" },
  { icon: SettingsIcon, label: "Settings", page: "settings" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const currentUser = useAtomValue(currentUserAtom)
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom)
  const { resolvedTheme, setTheme } = useTheme()
  const { logout } = useAdminAuth()
  const router = useRouter()
  const displayName = getAdminDisplayName(currentUser)
  const initials = getAdminInitials(currentUser)

  const getCurrentPage = () => {
    const segments = pathname.split("/")
    if (segments.length <= 2 || segments[2] === "") return "dashboard"
    return segments[2]
  }
  const currentPage = getCurrentPage()

  const navigateTo = (page: string) => {
    if (page === "dashboard") {
      router.push("/dashboard")
    } else {
      router.push(`/dashboard/${page}`)
    }
  }

  const handleLogout = () => {
    void logout()
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <aside
      className={cn(
        "border-r border-border flex flex-col bg-sidebar transition-[width] duration-200 ease-in-out shrink-0",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      {/* Header */}
      <div className={cn("border-b border-border", collapsed ? "px-3 py-2.5" : "px-6 py-2.5")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <PicsaLogo size={44} className="rounded-lg shrink-0 border-none bg-transparent shadow-none" imageClassName="rounded-lg" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-sidebar-foreground leading-tight truncate">
                Picsa
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1 py-4", collapsed ? "px-2" : "px-3")}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.page

          const button = (
            <button
              key={item.page}
              onClick={() => navigateTo(item.page)}
              className={cn(
                "w-full flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
            </button>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.page}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return button
        })}
      </nav>

      {/* Collapse toggle */}
      <div className={cn("px-3 pb-2", collapsed && "flex justify-center px-2")}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "text-muted-foreground hover:text-sidebar-foreground",
                collapsed ? "h-9 w-9" : "w-full justify-start gap-3 px-3",
              )}
            >
              <PanelLeftIcon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", collapsed && "rotate-180")} />
              {!collapsed && <span className="text-sm">Collapse</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={8}>
              Expand sidebar
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* User footer */}
      <div className={cn("border-t border-border", collapsed ? "p-2" : "p-4")}>
        {collapsed ? (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center justify-center rounded-lg py-1 hover:bg-sidebar-accent/50 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={currentUser?.url ?? undefined} alt={displayName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {displayName}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email ?? "No email on file"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigateTo("settings")}>
                <UserRoundIcon className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {resolvedTheme === "dark" ? (
                  <>
                    <SunIcon className="mr-2 h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <MoonIcon className="mr-2 h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser?.url ?? undefined} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser?.email ?? "No email on file"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-sidebar-foreground"
                >
                  <ChevronsUpDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigateTo("settings")}>
                  <UserRoundIcon className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {resolvedTheme === "dark" ? (
                    <>
                      <SunIcon className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </aside>
  )
}
