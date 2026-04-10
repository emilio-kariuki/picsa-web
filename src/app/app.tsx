import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ClientAuthBootstrap } from '@/components/auth/client-auth-bootstrap'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'

export const Route = createFileRoute('/app')({
  component: ClientSiteLayout,
  head: () => ({
    meta: [
      { title: 'Picsa Workspace' },
      {
        name: 'description',
        content:
          'Manage your events, galleries, guest access, and notifications in one warm, photo-led workspace.',
      },
    ],
  }),
})

function ClientSiteLayout() {
  return (
    <Providers>
      <div
        data-site="client"
        className="relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans"
      >
        <ClientAuthBootstrap />
        <Outlet />
        <Toaster />
      </div>
    </Providers>
  )
}
