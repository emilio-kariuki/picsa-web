import type { Metadata } from 'next'
import { ArrowLeft, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { AccountDeletionRequestForm } from '@/components/marketing/account-deletion-request-form'
import { Footer } from '@/components/marketing/footer'
import { Nav } from '@/components/marketing/nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Request Account Deletion | Picsa',
  description:
    'Request account deletion for your Picsa account and our team will reach out within 48 hours.',
}

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      <section className="relative overflow-hidden pt-28">
        <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(214,122,92,0.14),transparent_58%)]" />
        <div className="absolute right-[-8rem] top-16 -z-10 h-72 w-72 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute left-[-10rem] top-52 -z-10 h-80 w-80 rounded-full bg-secondary/80 blur-3xl" />

        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-10 lg:flex-row lg:items-start lg:gap-16">
          <div className="w-full max-w-xl space-y-6 lg:sticky lg:top-28">
            <Badge className="rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              Privacy support
            </Badge>

            <div className="space-y-4">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Need your Picsa account removed?
              </h1>
              <p className="max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
                Submit a simple deletion request and our team will follow up within 48
                hours to confirm the details and help complete the process safely.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-4 py-2">
                <Clock3 className="h-4 w-4 text-accent" />
                Human response within 48 hours
              </span>
              <span className="rounded-full border border-border/70 bg-background/85 px-4 py-2">
                No login required
              </span>
            </div>

            <Button asChild variant="ghost" className="w-fit rounded-full px-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Picsa
              </Link>
            </Button>
          </div>

          <div className="w-full max-w-2xl flex-1">
            <AccountDeletionRequestForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
