import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { CLIENT_CREATE_EVENT_PATH } from '@/lib/site-urls'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-16">
      {/* Subtle warm background wash */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 60% 40%, oklch(0.92 0.04 70 / 0.5), transparent 70%), radial-gradient(ellipse 50% 40% at 20% 70%, oklch(0.88 0.06 35 / 0.15), transparent 60%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div className="flex flex-col gap-6">
          {/* Pill badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Now available — Free to start
          </div>

          <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] text-foreground text-balance">
            One event.
            <br />
            <span className="italic text-accent">Every photo.</span>
            <br />
            All in one beautiful place.
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-md font-sans">
            Picsa helps you create a shared event space where guests can upload photos, chat, and relive
            the moment together — without losing memories across group chats and camera rolls.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-full px-8 text-base font-semibold group"
            >
              <a href={CLIENT_CREATE_EVENT_PATH}>
                Start an Event
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 text-base border-border text-foreground hover:bg-secondary transition-all group gap-2"
            >
              <a href="#how-it-works">
                <span className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Play className="w-3 h-3 fill-foreground text-foreground" />
                </span>
                See How It Works
              </a>
            </Button>
          </div>

          {/* Mini social proof */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background bg-secondary overflow-hidden"
                >
                  <Image
                    src={`/images/hero-photo-${i}.jpg`}
                    alt=""
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">12,000+</span> events created
            </p>
          </div>
        </div>

        {/* Right: layered photo mosaic */}
        <div className="relative h-[520px] lg:h-[600px] flex items-center justify-center">
          {/* Background card */}
          <div
            className="absolute top-8 right-0 w-64 h-80 rounded-3xl overflow-hidden shadow-2xl rotate-3 border border-white/40"
            style={{ boxShadow: '0 25px 60px oklch(0.18 0.01 60 / 0.18)' }}
          >
            <Image
              src="/images/hero-photo-2.jpg"
              alt="Wedding reception event"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
          </div>

          {/* Center card */}
          <div
            className="absolute top-16 left-0 w-60 h-72 rounded-3xl overflow-hidden shadow-2xl -rotate-2 border border-white/40 z-10"
            style={{ boxShadow: '0 20px 50px oklch(0.18 0.01 60 / 0.15)' }}
          >
            <Image
              src="/images/hero-photo-3.jpg"
              alt="Birthday party gathering"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
          </div>

          {/* Bottom card */}
          <div
            className="absolute bottom-0 left-16 right-8 h-56 rounded-3xl overflow-hidden shadow-xl rotate-1 border border-white/40 z-20"
            style={{ boxShadow: '0 16px 40px oklch(0.18 0.01 60 / 0.12)' }}
          >
            <Image
              src="/images/hero-photo-1.jpg"
              alt="Friends celebrating outdoors"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 to-transparent" />
          </div>

          {/* Floating invite chip */}
          <div
            className="absolute top-4 left-12 bg-background rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-3 z-30 border border-border"
            style={{ boxShadow: '0 8px 24px oklch(0.18 0.01 60 / 0.12)' }}
          >
            <span className="text-lg">✉️</span>
            <div>
              <p className="text-xs font-semibold text-foreground leading-none">Invite sent</p>
              <p className="text-xs text-muted-foreground mt-0.5">sophie@email.com</p>
            </div>
          </div>

          {/* Floating photo count chip */}
          <div
            className="absolute bottom-8 right-2 bg-accent text-accent-foreground rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2 z-30"
          >
            <span className="text-lg">📸</span>
            <div>
              <p className="text-xs font-bold leading-none">247 photos</p>
              <p className="text-xs opacity-80 mt-0.5">uploaded today</p>
            </div>
          </div>

          {/* Floating chat chip */}
          <div
            className="absolute top-1/2 right-0 -translate-y-1/2 bg-background rounded-2xl shadow-lg px-3 py-2 z-30 border border-border max-w-[160px]"
            style={{ boxShadow: '0 8px 24px oklch(0.18 0.01 60 / 0.1)' }}
          >
            <p className="text-xs font-semibold text-foreground">💬 "The photos are incredible!"</p>
            <p className="text-xs text-muted-foreground mt-0.5">— Tom, Best Man</p>
          </div>
        </div>
      </div>
    </section>
  )
}
