'use client'

import { useState } from 'react'
import { ChevronDown } from '@/components/ui/icons'

const faqs = [
  {
    q: 'Who can see my event photos?',
    a: 'Only the people you invite. You control whether events are private (invite-only) or open (anyone with the link). You can change this setting any time before or during the event.',
  },
  {
    q: 'Can guests upload photos without creating an account?',
    a: 'Yes. Guests can upload photos and join the event chat using just the invite link — no sign-up required. Hosts create accounts, but your guests never have to.',
  },
  {
    q: 'How long are my photos stored?',
    a: 'Free events keep photos for 90 days after the event date. Pro events store photos indefinitely. You can download the full gallery as a ZIP at any time on any plan.',
  },
  {
    q: 'Can I moderate what gets shared in my gallery?',
    a: 'On Pro, you can enable moderation mode — photos are held for your review before appearing in the gallery. You can also remove any photo at any time on all plans.',
  },
  {
    q: 'What happens if I share the event link publicly?',
    a: 'Private events require an accepted invite to view or upload. If you set an event to "open", anyone with the link can join. You can restrict sharing and lock the event whenever you like.',
  },
  {
    q: 'Is Picsa good for large events like weddings or concerts?',
    a: 'Absolutely. Picsa is built for exactly this. Pro plan supports unlimited guests and unlimited HD uploads, with moderation and custom branding for a polished experience.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-secondary/30">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">FAQ</p>
          <h2 className="font-serif text-4xl md:text-5xl font-black text-foreground text-balance leading-tight">
            Questions answered
          </h2>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'bg-background border-accent/30 shadow-sm' : 'bg-background border-border'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`font-semibold text-sm leading-snug transition-colors ${
                      isOpen ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
