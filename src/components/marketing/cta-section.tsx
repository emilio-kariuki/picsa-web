import { AppStoreButtons } from './app-store-buttons'

export function CtaSection() {
  return (
    <section id="download" className="py-24 scroll-mt-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div
          className="relative rounded-3xl bg-primary overflow-hidden p-12 md:p-20 text-center"
          style={{ boxShadow: '0 24px 80px oklch(0.18 0.01 60 / 0.25)' }}
        >
          {/* Decorative background photos */}
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
            <div className="absolute -left-8 top-4 w-40 h-52 rounded-2xl overflow-hidden rotate-[-8deg]">
              <img src="/images/hero-photo-1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="absolute -right-6 bottom-4 w-36 h-48 rounded-2xl overflow-hidden rotate-6">
              <img src="/images/hero-photo-2.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-32 h-44 rounded-2xl overflow-hidden rotate-2 hidden lg:block">
              <img src="/images/hero-photo-4.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
              Picsa for your phone
            </p>
            <h2 className="font-serif text-4xl md:text-6xl font-black text-primary-foreground text-balance leading-tight mb-6">
              Never lose the best moments
              <br className="hidden md:block" /> from an event again.
            </h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-xl mx-auto mb-10">
              Your wedding, birthday, reunion — every photo from every guest, in one beautiful place. Preserved exactly as the moment felt.
            </p>

            <AppStoreButtons variant="light" className="justify-center pt-2" />

            <p className="text-primary-foreground/40 text-xs mt-8">
              Public downloads are coming soon. Already have Picsa? Create and join events in the app.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
