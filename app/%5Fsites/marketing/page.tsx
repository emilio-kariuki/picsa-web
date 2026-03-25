import { CtaSection } from '@/components/marketing/cta-section'
import { FAQ } from '@/components/marketing/faq'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { Footer } from '@/components/marketing/footer'
import { Hero } from '@/components/marketing/hero'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Nav } from '@/components/marketing/nav'
import { Pricing } from '@/components/marketing/pricing'
import { SocialProof } from '@/components/marketing/social-proof'
import { Testimonials } from '@/components/marketing/testimonials'
import { WhyPicsa } from '@/components/marketing/why-picsa'

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <Hero />
      <SocialProof />
      <FeatureGrid />
      <HowItWorks />
      <WhyPicsa />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CtaSection />
      <Footer />
    </main>
  )
}
