import Link from 'next/link'
import { ArrowLeft, FileText, Scale, ShieldCheck, Sparkles } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/marketing/footer'

interface LegalSection {
  title: string
  body: readonly string[]
}

interface LegalPageShellProps {
  eyebrow: string
  title: string
  description: string
  lastUpdated: string
  accent: 'privacy' | 'terms'
  sections: readonly LegalSection[]
}

const accentStyles = {
  privacy: {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200/70',
    iconWrap: 'bg-emerald-100 text-emerald-800 border-emerald-200/70',
    panel: 'from-emerald-100/80 via-background to-background',
    glow: 'bg-emerald-300/25',
    icon: ShieldCheck,
  },
  terms: {
    badge: 'bg-amber-100 text-amber-900 border-amber-200/70',
    iconWrap: 'bg-amber-100 text-amber-900 border-amber-200/70',
    panel: 'from-amber-100/80 via-background to-background',
    glow: 'bg-amber-300/25',
    icon: Scale,
  },
} as const

export function LegalPageShell({
  eyebrow,
  title,
  description,
  lastUpdated,
  accent,
  sections,
}: LegalPageShellProps) {
  const accentStyle = accentStyles[accent]
  const AccentIcon = accentStyle.icon

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(214,122,92,0.18),transparent_58%)]" />
      <div className={`absolute right-[-8rem] top-24 -z-10 h-72 w-72 rounded-full blur-3xl ${accentStyle.glow}`} />
      <div className="absolute left-[-10rem] top-64 -z-10 h-80 w-80 rounded-full bg-secondary/70 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-sm font-bold text-accent-foreground shadow-sm">
                P
              </span>
              <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                Picsa
              </span>
            </Link>

            <div className="hidden h-6 w-px bg-border md:block" />

            <nav className="hidden items-center gap-2 md:flex">
              <Button
                asChild
                variant={accent === 'privacy' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-full"
              >
                <Link href="/privacy-policy">
                  Privacy
                </Link>
              </Button>
              <Button
                asChild
                variant={accent === 'terms' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-full"
              >
                <Link href="/terms-of-service">
                  Terms
                </Link>
              </Button>
            </nav>
          </div>

          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20 md:pt-24">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <Badge className={`rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] ${accentStyle.badge}`}>
              {eyebrow}
            </Badge>

            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/80 bg-background/80 px-4 py-2">
                Last updated: {lastUpdated}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 py-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Designed for event memories, shared albums, and guest participation
              </span>
            </div>
          </div>

          <div className={`relative overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br ${accentStyle.panel} p-6 shadow-[0_24px_80px_rgba(30,30,30,0.08)]`}>
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${accentStyle.iconWrap}`}>
                <AccentIcon className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Quick summary
                </p>
                <p className="text-base leading-7 text-foreground">
                  These pages explain how Picsa handles event content, guest accounts, uploads,
                  subscriptions, and the responsibilities that come with using a shared memory
                  space.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {sections.slice(0, 4).map((section, index) => (
                <div
                  key={section.title}
                  className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/78 px-4 py-4"
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{section.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {section.body[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-[2rem] border border-border/70 bg-card/90 shadow-[0_20px_60px_rgba(30,30,30,0.06)]">
          <div className="flex items-center gap-3 border-b border-border/70 px-6 py-5 sm:px-8">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${accentStyle.iconWrap}`}>
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Document details</p>
              <p className="text-sm text-muted-foreground">
                Review the sections below for the full text.
              </p>
            </div>
          </div>

          <div className="space-y-10 px-6 py-8 sm:px-8 sm:py-10">
            {sections.map((section, index) => (
              <section key={section.title} className="grid gap-4 lg:grid-cols-[72px_1fr]">
                <div className="flex items-start">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-secondary/60 text-sm font-semibold text-secondary-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.body.map((paragraph, paragraphIndex) => (
                      <p
                        key={`${section.title}-${paragraphIndex}`}
                        className="text-sm leading-7 text-muted-foreground sm:text-[15px]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
