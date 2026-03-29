import { X, Check } from '@/components/ui/icons'

const withoutPicsa = [
  'Photos scattered across 5+ WhatsApp chats',
  'Guests forget to share what they shot',
  'Low-res compressed images from messages',
  'No way to browse or relive the event',
  '"Can you send me those photos?" — forever',
  'Best moments lost on someone\'s camera roll',
]

const withPicsa = [
  'One beautiful gallery for every guest\'s shots',
  'Guests upload in the moment, in real time',
  'Full HD, original-quality images always',
  'Browse, relive, and re-share any time',
  'Download everything, anytime, in one click',
  'Every memory, from every angle, preserved',
]

export function WhyPicsa() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Emotional lead */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
            Why Picsa
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-black text-foreground text-balance leading-tight">
            The memories you almost lost
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            Every gathering deserves to be remembered properly. Not buried in a WhatsApp thread. Not compressed and forgotten. Remembered — fully, beautifully, together.
          </p>
        </div>

        {/* Comparison table */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Without */}
          <div className="rounded-3xl border border-border bg-secondary/40 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
                <X className="w-4 h-4 text-destructive" />
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground">Without Picsa</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {withoutPicsa.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <X className="w-4 h-4 text-destructive/60 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With Picsa */}
          <div
            className="rounded-3xl border border-accent/30 bg-primary p-8"
            style={{ boxShadow: '0 12px 40px oklch(0.64 0.16 35 / 0.15)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Check className="w-4 h-4 text-accent-foreground" />
              </div>
              <h3 className="font-serif font-bold text-lg text-primary-foreground">With Picsa</h3>
            </div>
            <ul className="flex flex-col gap-3">
              {withPicsa.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-primary-foreground/80">
                  <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
