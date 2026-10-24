import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Clock3 } from '@/components/ui/icons'
import { AccountDeletionRequestForm } from '@/components/marketing/account-deletion-request-form'
import { Footer } from '@/components/marketing/footer'
import { Nav } from '@/components/marketing/nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_marketing/delete-account')({
  component: DeleteAccountPage,
  head: () => ({
    meta: [
      { title: 'Request Account Deletion | Picsa' },
      {
        name: 'description',
        content:
          'Request account deletion for your Picsa account and our team will reach out within 48 hours.',
      },
    ],
  }),
})

function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      <section className="relative overflow-hidden pt-28">
        <div className="absolute inset-x-0 top-0 -z-10 h-112 bg-[radial-gradient(circle_at_top,rgba(214,122,92,0.14),transparent_58%)]" />
        <div className="absolute -right-32 top-16 -z-10 h-72 w-72 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute -left-40 top-52 -z-10 h-80 w-80 rounded-full bg-secondary/80 blur-3xl" />

        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-10 lg:flex-row lg:items-start lg:gap-16">
          <div className="w-full max-w-xl space-y-6 lg:sticky lg:top-28">
            <Badge className="rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              Privacy support
            </Badge>

            <div className="space-y-4">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Delete your Picsa account
              </h1>
              <p className="max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
                For Picsa Pro: Event Photos, open Settings → Delete Account in the
                app. You can also enter your account email and a short deletion
                request in this form. We will follow up within 48 hours to verify
                the request.
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
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Picsa
              </Link>
            </Button>
          </div>

          <div className="w-full max-w-2xl flex-1 space-y-8">
            <AccountDeletionRequestForm />
            <section aria-labelledby="deletion-details" className="space-y-5 rounded-3xl border border-border/70 bg-card p-6 text-sm leading-7 text-muted-foreground">
              <h2 id="deletion-details" className="font-serif text-2xl font-semibold text-foreground">
                What happens to your data
              </h2>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Data removed from Picsa</h3>
                <p>
                  Completing account deletion removes your profile, sign-in sessions,
                  event memberships, and your photo and message records. Events you
                  host are also removed, including other guests&apos; photos and messages
                  in those events. Save anything you want to keep first.
                </p>
                <p>
                  Stored media is removed separately. A storage failure can leave
                  copies that need manual follow-up. We cannot remove copies other
                  people have downloaded or exported.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Records retained after deletion</h3>
                <p>
                  Purchase and transaction records remain for purchase verification
                  and disputes. Security and audit logs, including IP addresses and
                  device details, and support requests, including contact details and
                  messages, also remain. These records currently have no fixed
                  automatic deletion date.
                </p>
                <p>
                  Deleting your Picsa account does not automatically delete separate
                  records held by Google Analytics, RevenueCat, Apple, or Google Play.
                  Google Analytics is configured for two months of event data and
                  fourteen months of user data; most aggregate reports are excluded
                  from those limits.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Response and deletion timing</h3>
                <p>
                  The 48-hour target is for a human response, not completed erasure.
                  Database backups currently have no automatic expiry. Failed media
                  cleanup may require manual follow-up, with no guaranteed completion
                  date. Use this form to ask what is still retained for your account
                  or to request a review of that data.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
