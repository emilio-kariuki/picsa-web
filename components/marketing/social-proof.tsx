const metrics = [
  { value: '12K+', label: 'Events created' },
  { value: '340K+', label: 'Photos shared' },
  { value: '98%', label: 'Host satisfaction' },
]

const uses = [
  'Weddings',
  'Birthdays',
  'Campus events',
  'Family gatherings',
  'Private parties',
  'Reunions',
]

export function SocialProof() {
  return (
    <section className="border-y border-border bg-secondary/40 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-sm font-medium text-muted-foreground mb-8">
          Perfect for every kind of gathering
        </p>

        {/* Event type pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {uses.map((u) => (
            <span
              key={u}
              className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-foreground font-medium"
            >
              {u}
            </span>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p className="font-serif text-4xl font-black text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
