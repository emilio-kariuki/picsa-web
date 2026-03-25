import type { Metadata } from 'next'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    default: 'Picsa Admin',
    template: '%s | Picsa Admin',
  },
  description: 'Admin dashboard for managing Picsa operations, users, payments, tickets, and notifications.',
}

export default function AdminSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      <div data-site="admin" className="min-h-screen bg-background text-foreground font-sans">
        {children}
      </div>
    </Providers>
  )
}
