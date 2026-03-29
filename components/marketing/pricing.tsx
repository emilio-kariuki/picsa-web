import { Button } from '@/components/ui/button'
import { Check, Crown } from '@/components/ui/icons'
import { CLIENT_CREATE_EVENT_PATH } from '@/lib/site-urls'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'Perfect for getting started',
    cta: 'Start for free',
    ctaVariant: 'outline' as const,
    highlight: false,
    features: [
      'Create events for free',
      'Up to 10 guests per event',
      'Up to 50 photo uploads per event',
      'Invite by link or email',
      'Guest chat inside the event',
      'Shared gallery uploads',
      'Standard photo quality',
    ],
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per event',
    tagline: 'For events that deserve more',
    cta: 'Start with Pro',
    ctaVariant: 'default' as const,
    highlight: true,
    features: [
      'Unlock one event for $12',
      'Up to 100 guests for that event',
      'Up to 2500 photo uploads for that event',
      'HD uploads for that event',
      'Private image uploads for that event',
      'Image sharing for that event',
      'Moderation controls',
      'Priority support',
      'Event-level premium access',
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-xl mx-auto">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
            Pricing
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-black text-foreground text-balance leading-tight">
            Simple, honest pricing
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Start for free. Upgrade when your event calls for it.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-background border-border'
              }`}
              style={
                plan.highlight
                  ? { boxShadow: '0 20px 60px oklch(0.18 0.01 60 / 0.2)' }
                  : { boxShadow: '0 4px 16px oklch(0.18 0.01 60 / 0.06)' }
              }
            >
              {/* Pro badge */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">
                  <Crown className="w-3 h-3" />
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`font-serif font-bold text-xl mb-1 ${
                    plan.highlight ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.highlight ? 'text-primary-foreground/65' : 'text-muted-foreground'
                  }`}
                >
                  {plan.tagline}
                </p>
              </div>

              <div className="flex items-end gap-1 mb-6">
                <span
                  className={`font-serif font-black text-5xl ${
                    plan.highlight ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm mb-2 ${
                    plan.highlight ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  }`}
                >
                  /{plan.period}
                </span>
              </div>

              <Button
                asChild
                variant={plan.highlight ? 'secondary' : 'outline'}
                className={`w-full rounded-full mb-8 font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90 border-0'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <a href={CLIENT_CREATE_EVENT_PATH}>
                  {plan.cta}
                </a>
              </Button>

              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        plan.highlight ? 'bg-accent/20' : 'bg-accent/10'
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.highlight ? 'text-accent' : 'text-accent'
                        }`}
                      />
                    </div>
                    <span
                      className={
                        plan.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
