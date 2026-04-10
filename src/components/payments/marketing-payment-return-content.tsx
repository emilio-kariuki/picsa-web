import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2Icon, SmartphoneIcon } from '@/components/ui/icons'
import { buildPaymentsAppReturnUrl, isProbablyMobileUserAgent } from '@/lib/payment-return-link'

interface MarketingPaymentReturnContentProps {
  checkoutIntentId?: string
  flow?: string
}

export function MarketingPaymentReturnContent({
  checkoutIntentId,
  flow,
}: MarketingPaymentReturnContentProps) {
  const openAppHref = useMemo(() => {
    const params = new URLSearchParams()

    if (checkoutIntentId) {
      params.set('checkoutIntentId', checkoutIntentId)
    }

    if (flow) {
      params.set('flow', flow)
    }

    return buildPaymentsAppReturnUrl(params)
  }, [checkoutIntentId, flow])
  const hasAttemptedOpenRef = useRef(false)
  const [shouldAutoOpenApp, setShouldAutoOpenApp] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setShouldAutoOpenApp(isProbablyMobileUserAgent(window.navigator.userAgent))
  }, [])

  useEffect(() => {
    if (!shouldAutoOpenApp || !checkoutIntentId || hasAttemptedOpenRef.current) {
      return
    }

    hasAttemptedOpenRef.current = true
    const timer = window.setTimeout(() => {
      window.location.assign(openAppHref)
    }, 280)

    return () => {
      window.clearTimeout(timer)
    }
  }, [checkoutIntentId, openAppHref, shouldAutoOpenApp])

  return (
    <main className="mx-auto flex min-h-[78vh] w-full max-w-4xl items-center px-6 py-16">
      <section className="w-full overflow-hidden rounded-4xl border border-border/60 bg-background/95 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.55)]">
        <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-border/50 px-7 py-10 md:border-b-0 md:border-r md:px-10 md:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">
              Dodo payment return
            </p>
            <div className="mt-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
              <CheckCircle2Icon className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Payment received
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              We&apos;re taking you back to Picsa so the app can finish confirming your Pro event
              pass. If nothing happens, use the button below to reopen the app.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={openAppHref}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                <SmartphoneIcon className="mr-2 h-4 w-4" />
                Open Picsa app
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-border/60 px-5 py-2.5 text-sm font-medium transition hover:border-foreground/30 hover:text-foreground" to={'/app'}              >
                Back to Picsa
              </Link>
            </div>
          </div>

          <aside className="bg-muted/20 px-7 py-10 md:px-8 md:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              Checkout details
            </p>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="rounded-[1.25rem] border border-border/60 bg-background/80 px-4 py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Flow
                </dt>
                <dd className="mt-2 text-base font-medium text-foreground">
                  {flow === 'upgrade_event_pro' ? 'Upgrade event to Pro' : 'Create event as Pro'}
                </dd>
              </div>
              {checkoutIntentId ? (
                <div className="rounded-[1.25rem] border border-border/60 bg-background/80 px-4 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Checkout reference
                  </dt>
                  <dd className="mt-2 break-all text-sm font-medium text-foreground">
                    {checkoutIntentId}
                  </dd>
                </div>
              ) : null}
              <div className="rounded-[1.25rem] border border-border/60 bg-background/80 px-4 py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  What happens next
                </dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                  Picsa will finish confirming the checkout inside the app and return you to your
                  event flow.
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  )
}
