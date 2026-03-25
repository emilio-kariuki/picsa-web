import { ClientAuthShell } from '@/components/auth/client-auth-shell'
import { ClientShell } from '@/components/client/client-shell'

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientAuthShell>
      <ClientShell>{children}</ClientShell>
    </ClientAuthShell>
  )
}
