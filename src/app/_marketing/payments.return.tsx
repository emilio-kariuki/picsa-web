import { createFileRoute } from '@tanstack/react-router'
import { MarketingPaymentReturnContent } from '@/components/payments/marketing-payment-return-content'

export const Route = createFileRoute('/_marketing/payments/return')({
  component: MarketingPaymentsReturnPage,
  validateSearch: (search: Record<string, unknown>): { checkoutIntentId?: string; flow?: string } => ({
    checkoutIntentId: typeof search.checkoutIntentId === 'string' ? search.checkoutIntentId : undefined,
    flow: typeof search.flow === 'string' ? search.flow : undefined,
  }),
})

function MarketingPaymentsReturnPage() {
  const { checkoutIntentId, flow } = Route.useSearch()

  return (
    <MarketingPaymentReturnContent
      checkoutIntentId={checkoutIntentId}
      flow={flow}
    />
  )
}
