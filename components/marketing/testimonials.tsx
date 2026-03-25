import Image from 'next/image'

const testimonials = [
  {
    quote:
      "I've planned over 60 weddings and Picsa completely changed how we handle photography. Instead of chasing down every guest for their shots, everything just appears — beautifully organised. My couples are obsessed.",
    name: 'Amara Osei-Bonsu',
    role: 'Wedding Planner, Bloom & Co.',
    avatar: '/images/testimonial-1.jpg',
  },
  {
    quote:
      "My girlfriend's surprise 30th was chaos in the best way. Picsa meant every photo from every corner of the room ended up in one gallery. We still look through it every month. Best decision I made for the party.",
    name: 'Daniel Ferreira',
    role: 'Host & birthday planner',
    avatar: '/images/testimonial-2.jpg',
  },
  {
    quote:
      "We run 12 community events a year and keeping photos organised was always a nightmare. With Picsa, our members upload as it happens and we have a living archive of our community's story. It's genuinely special.",
    name: 'Yuki Tanaka',
    role: 'Community Director, Eastside Collective',
    avatar: '/images/testimonial-3.jpg',
  },
]

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-xl mx-auto">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
            Loved by hosts
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-black text-foreground text-balance leading-tight">
            What people are saying
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`rounded-3xl p-7 border border-border flex flex-col gap-5 hover:-translate-y-1 transition-all duration-300 ${
                i === 1
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-card'
              }`}
              style={
                i === 1
                  ? { boxShadow: '0 16px 48px oklch(0.18 0.01 60 / 0.2)' }
                  : { boxShadow: '0 4px 16px oklch(0.18 0.01 60 / 0.05)' }
              }
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className="text-sm" style={{ color: 'oklch(0.72 0.14 65)' }}>
                    ★
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p
                className={`text-sm leading-relaxed flex-1 italic ${
                  i === 1 ? 'text-primary-foreground/85' : 'text-muted-foreground'
                }`}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-border/30">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      i === 1 ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {t.name}
                  </p>
                  <p
                    className={`text-xs ${
                      i === 1 ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    }`}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
