import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AdminAuthBootstrap } from '@/components/auth/admin-auth-bootstrap'
import { Providers } from '@/components/providers'

export const Route = createFileRoute('/admin')({
  component: AdminSiteLayout,
  head: () => ({
    meta: [
      { title: 'Picsa Admin' },
      {
        name: 'description',
        content: 'Admin dashboard for managing Picsa operations, users, payments, tickets, and notifications.',
      },
    ],
  }),
})

function AdminSiteLayout() {
  return (
    <Providers>
      <div data-site="admin" className="min-h-screen bg-background text-foreground font-sans">
        <AdminAuthBootstrap />
        <Outlet />
      </div>
    </Providers>
  )
}
