const steps = [
  {
    number: '01',
    title: 'Create your event',
    desc: 'Name your event, set the date, choose privacy settings, and customise the look. Takes less than two minutes.',
    detail: 'Wedding, birthday, reunion — whatever it is, Picsa shapes itself around your moment.',
  },
  {
    number: '02',
    title: 'Invite your people',
    desc: 'Share a link, send email invites, or both. Guests can join on any device — no app download required.',
    detail: 'Your guests get a beautiful invitation, not a WhatsApp message they will scroll past.',
  },
  {
    number: '03',
    title: 'Collect every memory',
    desc: 'Guests upload photos from their phones or cameras. Everything lands in one beautiful shared gallery, instantly.',
    detail: 'No more "send me those photos!" texts. Every shot from every angle, all in one place.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-xl mx-auto">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
            Simple by design
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-black text-foreground text-balance leading-tight">
            Ready in three steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-border z-0" />

          {steps.map((step, i) => (
            <div key={step.number} className="relative z-10 flex flex-col gap-4">
              {/* Step number circle */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-black text-lg border-2 transition-all ${
                    i === 0
                      ? 'bg-accent text-accent-foreground border-accent'
                      : i === 1
                      ? 'bg-foreground text-primary-foreground border-foreground'
                      : 'bg-background text-foreground border-border'
                  }`}
                >
                  {step.number}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-background p-6 shadow-none hover:shadow-md transition-shadow duration-300">
                <h3 className="font-serif font-bold text-xl text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">{step.desc}</p>
                <p className="text-xs text-accent font-medium leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
