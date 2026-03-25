import Link from 'next/link'
import { Instagram, Twitter, Github } from 'lucide-react'
import { CLIENT_LOGIN_PATH } from '@/lib/site-urls'

const footerLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Log in', href: CLIENT_LOGIN_PATH },
  { label: 'Delete Account', href: '/delete-account' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms-of-service' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold font-serif">
              P
            </span>
            <span className="font-serif font-bold text-lg text-foreground">Picsa</span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                prefetch={l.href.startsWith('/') ? undefined : false}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Social */}
          <div className="flex items-center gap-3">
            {[
              { Icon: Twitter, label: 'Twitter' },
              { Icon: Instagram, label: 'Instagram' },
              { Icon: Github, label: 'GitHub' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} Picsa. All rights reserved. Made with care for the moments that matter.
        </p>
      </div>
    </footer>
  )
}
