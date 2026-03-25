import type { Metadata } from 'next'
import { ClientAuthBootstrap } from '@/components/auth/client-auth-bootstrap'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: {
    default: 'Picsa Workspace',
    template: '%s | Picsa Workspace',
  },
  description:
    'Manage your events, galleries, guest access, and notifications in one warm, photo-led workspace.',
}

export default function ClientSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      <div
        data-site="client"
        className="grain-overlay relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans"
      >
        <ClientAuthBootstrap />
        {children}
        <Toaster />
      </div>
    </Providers>
  )
}
