import { DashboardAuthShell } from '@/components/auth/dashboard-auth-shell'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { BreadcrumbNav } from '@/components/common/breadcrumb-nav'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardAuthShell>
      <div className="flex h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-auto">
          <Header />
          <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            {/* <BreadcrumbNav /> */}
            {children}
          </div>
        </div>
        <Toaster />
      </div>
    </DashboardAuthShell>
  )
}
