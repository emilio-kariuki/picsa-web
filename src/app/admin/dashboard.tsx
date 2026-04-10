import { createFileRoute, Outlet } from '@tanstack/react-router'
import { DashboardAuthShell } from '@/components/auth/dashboard-auth-shell'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'

export const Route = createFileRoute('/admin/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <DashboardAuthShell>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-auto">
          <Header />
          <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <Outlet />
          </div>
        </div>
        <Toaster />
      </div>
    </DashboardAuthShell>
  )
}
