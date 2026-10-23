import type { Metadata } from 'next'
import { CalendarDaysIcon, CameraIcon, Smartphone, UsersIcon } from '@/components/ui/icons'
import Image from 'next/image'
import Link from 'next/link'
import { Footer } from '@/components/marketing/footer'
import { Nav } from '@/components/marketing/nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getApiBaseUrl } from '@/lib/api'
import { buildAppClipBanner, buildEventDeepLink } from '@/lib/app-links'

interface EventPreviewPageProps {
  params: Promise<{ eventId: string }>
}

interface EventPreview {
  id: string
  name: string
  description: string | null
  url: string
  displayPictureUrl: string | null
  memberCount: number
  startAt: string | null
  endAt: string | null
  hostName: string | null
}

async function fetchEventPreview(eventId: string): Promise<EventPreview | null> {
  try {
    const baseUrl = getApiBaseUrl()
    const res = await fetch(`${baseUrl}/public/events/${encodeURIComponent(eventId)}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) return null

    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

function formatEventDate(isoString: string | null) {
  if (!isoString) return null
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export async function generateMetadata({ params }: EventPreviewPageProps): Promise<Metadata> {
  const { eventId } = await params
  const event = await fetchEventPreview(eventId)

  if (!event) {
    return { title: 'Event Not Found | Picsa' }
  }

  const appClipMeta: Record<string, string> = {
    'apple-itunes-app': buildAppClipBanner(`https://picsa.pro/events/${encodeURIComponent(eventId)}`),
  }

  return {
    title: `${event.name} | Picsa`,
    description: event.description ?? `Join ${event.name} on Picsa — upload and share event photos together.`,
    openGraph: {
      title: event.name,
      description: event.description ?? `Join ${event.name} on Picsa`,
      ...(event.displayPictureUrl ? { images: [event.displayPictureUrl] } : {}),
    },
    other: appClipMeta,
  }
}

export default async function EventPreviewPage({ params }: EventPreviewPageProps) {
  const { eventId } = await params
  const event = await fetchEventPreview(eventId)
  const deepLink = buildEventDeepLink(eventId)

  if (!event) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Nav />
        <section className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center space-y-4">
            <h1 className="font-serif text-3xl font-semibold">Event not found</h1>
            <p className="text-muted-foreground">This event may have ended or the link is invalid.</p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/">Back to Picsa</Link>
            </Button>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  const startFormatted = formatEventDate(event.startAt)
  const endFormatted = formatEventDate(event.endAt)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />

      <section className="relative overflow-hidden pt-28">
        <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(126,211,138,0.16),transparent_58%)]" />
        <div className="absolute right-[-7rem] top-16 -z-10 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute left-[-9rem] top-56 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-24 pt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-xl space-y-6">
            <Badge className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              Event
            </Badge>

            <div className="space-y-4">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {event.name}
              </h1>
              {event.description && (
                <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                  {event.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {event.hostName && (
                <span className="flex items-center gap-1.5">
                  <CameraIcon className="h-4 w-4 text-primary" />
                  Hosted by {event.hostName}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <UsersIcon className="h-4 w-4 text-primary" />
                {event.memberCount} {event.memberCount === 1 ? 'guest' : 'guests'}
              </span>
              {startFormatted && (
                <span className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="h-4 w-4 text-primary" />
                  {startFormatted}
                  {endFormatted && ` – ${endFormatted}`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <a href={deepLink}>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Open in Picsa
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <a href="/#download">
                  Get Picsa
                </a>
              </Button>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              If Safari shows the Picsa banner, tap Open in the banner to use the
              App Clip without installing the full app.
            </p>
          </div>

          {event.displayPictureUrl && (
            <div className="w-full max-w-md">
              <div className="overflow-hidden rounded-[2rem] border border-border/70 shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
                <Image
                  src={event.displayPictureUrl}
                  alt={event.name}
                  width={480}
                  height={480}
                  className="h-auto w-full object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
