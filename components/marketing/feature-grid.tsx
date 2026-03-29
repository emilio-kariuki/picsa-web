import {
  Lock,
  Link2,
  Images,
  HardDriveUpload,
  MessageCircle,
  ShieldCheck,
  Activity,
  Crown,
} from '@/components/ui/icons'

const features = [
  {
    icon: Lock,
    title: 'Private or open events',
    desc: 'Control who can see and join. Keep events exclusive or open them to the world.',
    size: 'md',
    accent: false,
  },
  {
    icon: Link2,
    title: 'Invite by link or email',
    desc: 'Share a simple invite link or send personalised email invites to your guests.',
    size: 'sm',
    accent: false,
  },
  {
    icon: Images,
    title: 'Shared photo galleries',
    desc: "Every guest's photos, beautifully organised in a single gallery only your group can see.",
    size: 'lg',
    accent: true,
  },
  {
    icon: HardDriveUpload,
    title: 'HD & private uploads',
    desc: 'Full-resolution photos, securely stored and private to your event.',
    size: 'sm',
    accent: false,
  },
  {
    icon: MessageCircle,
    title: 'Built-in event chat',
    desc: 'Guests can react, comment, and keep the conversation going long after the event.',
    size: 'md',
    accent: false,
  },
  {
    icon: ShieldCheck,
    title: 'Moderation & sharing controls',
    desc: 'Approve photos before they go live. Control what gets shared outside the event.',
    size: 'sm',
    accent: false,
  },
  {
    icon: Activity,
    title: 'Real-time updates',
    desc: 'See when guests upload, comment, or react — stay connected as memories pour in.',
    size: 'sm',
    accent: false,
  },
  {
    icon: Crown,
    title: 'Pro for premium events',
    desc: 'Bigger events, more storage, advanced controls, and white-glove features for special occasions.',
    size: 'md',
    accent: true,
  },
]

const sizeMap: Record<string, string> = {
  sm: 'col-span-1',
  md: 'col-span-1 md:col-span-1',
  lg: 'col-span-1 md:col-span-2',
}

export function FeatureGrid() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
            Everything you need
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-black text-foreground text-balance leading-tight">
            Built for the moments that matter
          </h2>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            From private weddings to open campus events, Picsa has every feature you need to collect, organise, and relive your memories.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            const span = sizeMap[f.size]
            return (
              <div
                key={f.title}
                className={`${span} group relative rounded-3xl p-6 border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  f.accent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-secondary/60'
                }`}
                style={
                  f.accent
                    ? {}
                    : { boxShadow: '0 2px 12px oklch(0.18 0.01 60 / 0.05)' }
                }
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    f.accent
                      ? 'bg-primary-foreground/15'
                      : 'bg-accent/10'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${f.accent ? 'text-primary-foreground' : 'text-accent'}`}
                  />
                </div>
                <h3
                  className={`font-serif font-bold text-lg mb-2 ${
                    f.accent ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {f.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    f.accent ? 'text-primary-foreground/75' : 'text-muted-foreground'
                  }`}
                >
                  {f.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
