import Link from 'next/link'

export default function MarketingPaymentsReturnPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-6 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Return to Picsa</p>
      <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
        Head back to the app to finish checkout
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
        Your payment is being confirmed. If the Picsa app did not open automatically, reopen it on your device and
        we will continue from there.
      </p>
      <div className="mt-8 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-border/60 px-5 py-2.5 text-sm font-medium transition hover:border-foreground/30 hover:text-foreground"
        >
          Back to Picsa
        </Link>
      </div>
    </main>
  )
}
