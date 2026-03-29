import { Suspense } from 'react'
import { MarketingPaymentReturnContent } from '@/components/payments/marketing-payment-return-content'

interface MarketingPaymentsReturnPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function MarketingPaymentsReturnFallback() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-6 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Return to Picsa</p>
      <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
        Finishing your payment return
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
        We&apos;re preparing the handoff back to Picsa.
      </p>
    </main>
  )
}

export default async function MarketingPaymentsReturnPage({
  searchParams,
}: MarketingPaymentsReturnPageProps) {
  const resolvedParams = (await searchParams) ?? {}
  const checkoutIntentId = Array.isArray(resolvedParams.checkoutIntentId)
    ? resolvedParams.checkoutIntentId[0]
    : resolvedParams.checkoutIntentId
  const flow = Array.isArray(resolvedParams.flow)
    ? resolvedParams.flow[0]
    : resolvedParams.flow

  return (
    <Suspense fallback={<MarketingPaymentsReturnFallback />}>
      <MarketingPaymentReturnContent
        checkoutIntentId={checkoutIntentId}
        flow={flow}
      />
    </Suspense>
  )
}
