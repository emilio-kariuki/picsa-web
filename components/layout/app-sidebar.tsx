"use client"

import { useAtom, useAtomValue } from "jotai"
import { currentUserAtom, themeAtom } from "@/lib/store"
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
} from "@/components/ui/icons"

const menuItems = [
  { icon: HomeIcon, label: "Dashboard", page: "dashboard" },
  { icon: UsersIcon, label: "Users", page: "users" },
  { icon: CreditCardIcon, label: "Payments", page: "payments" },
  { icon: CalendarDaysIcon, label: "Events", page: "events" },
  { icon: ImageIcon, label: "Images", page: "media" },
  { icon: TicketIcon, label: "Tickets", page: "tickets" },
  { icon: BellIcon, label: "Notifications", page: "notifications" },
  { icon: SettingsIcon, label: "Settings", page: "settings" },
  { icon: ClipboardListIcon, label: "Audit Log", page: "audit-log" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const currentUser = useAtomValue(currentUserAtom)
  const [theme, setTheme] = useAtom(themeAtom)
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
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <aside className="w-64 border-r border-border flex flex-col bg-sidebar">
      <div className="px-6 py-2.5 border-b border-border">
        <div className="flex items-center gap-3">
          <PicsaLogo size={36} className="rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-sidebar-foreground leading-tight truncate">
              Picsa
            </h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.page
          return (
            <button
              key={item.page}
              onClick={() => navigateTo(item.page)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
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
                {theme === "dark" ? (
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
      </div>
    </aside>
  )
}
