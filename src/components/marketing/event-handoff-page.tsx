import { Link } from '@tanstack/react-router'
import { ArrowRight, Link2, Smartphone } from '@/components/ui/icons'
import { Footer } from '@/components/marketing/footer'
import { Nav } from '@/components/marketing/nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buildJoinDeepLink, buildEventDeepLink } from '@/lib/app-links'

export function EventHandoffPage({ eventId, join = false }: { eventId: string; join?: boolean }) {
  const deepLink = join ? buildJoinDeepLink(eventId) : buildEventDeepLink(eventId)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      <section className="relative overflow-hidden pt-28">
        <div className="absolute inset-x-0 top-0 -z-10 h-112 bg-[radial-gradient(circle_at_top,rgba(126,211,138,0.16),transparent_58%)]" />
        <div className="absolute -right-28 top-16 -z-10 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -left-36 top-56 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-xl space-y-6">
            <Badge className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              Shared event invite
            </Badge>

            <div className="space-y-4">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Open Picsa to join this event.
              </h1>
              <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                Your invite is ready. Open it in Picsa to view the event and add
                your photos. On iPhone, you can also use the App Clip when the
                Picsa banner appears in Safari.
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-none backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Event ID
              </p>
              <p className="mt-3 break-all font-mono text-sm text-foreground sm:text-base">
                {eventId}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <a href={deepLink}>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Open in Picsa
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <Link to="/">
                  Learn more about Picsa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="w-full max-w-xl">
            <div className="rounded-4xl border border-border/70 bg-card/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Link2 className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    What happens next?
                  </h2>
                  <ul className="space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                    <li>If Picsa is installed, tap <span className="font-medium text-foreground">Open in Picsa</span> to hand this invite to the mobile app.</li>
                    <li>If Safari shows the Picsa banner, tap Open in the banner to use the App Clip.</li>
                    <li>Once inside, you can join the event, browse photos, and upload your own.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
