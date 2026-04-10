import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ClientPaymentsReturnPage } from '@/components/client/client-payments-return-page'
import { Spinner } from '@/components/ui/spinner'

function ClientPaymentsReturnRoute() {
  return (
    <Suspense fallback={<ClientPaymentsReturnFallback />}>
      <ClientPaymentsReturnPage />
    </Suspense>
  )
}

function ClientPaymentsReturnFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-6" />
        <p className="text-sm text-muted-foreground">Preparing your payment return...</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/app/payments/return')({
  component: ClientPaymentsReturnRoute,
})

