import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/marketing/legal-page-shell'

export const metadata: Metadata = {
  title: 'Terms of Service | Picsa',
  description:
    'Review the terms that govern your use of Picsa, including event creation, guest participation, uploads, subscriptions, and acceptable use.',
}

const termsSections = [
  {
    title: 'Acceptance of the service',
    body: [
      'These Terms of Service govern your access to and use of Picsa, including the website, event experiences, hosted content areas, and related features. By using Picsa, you agree to comply with these terms and with any additional product rules or guidelines made available inside the service.',
      'If you use Picsa on behalf of an organization, event team, or business, you represent that you are authorized to bind that entity to these terms. If you do not agree, you should not use the service.',
    ],
  },
  {
    title: 'Accounts, invitations, and event roles',
    body: [
      'Some parts of Picsa may require an account, invite, or organizer approval. You are responsible for keeping your account credentials secure and for activity that occurs under your account, unless the activity results from Picsa’s own failure to maintain reasonable safeguards.',
      'Hosts, organizers, and invited participants may have different permissions within an event space. Picsa may allow organizers to invite guests, manage uploads, moderate content, or remove participants in order to keep an event orderly and safe.',
    ],
  },
  {
    title: 'Content ownership and permissions',
    body: [
      'You retain ownership of content you upload to Picsa, subject to any rights already granted to others. By uploading content, you grant Picsa a limited license to host, store, process, display, organize, and transmit that content as needed to operate and improve the service.',
      'You are responsible for ensuring that you have all rights, permissions, and consents necessary to upload content, including where images, music, names, likenesses, or other third-party rights are involved. Picsa may remove or restrict content that violates these terms or applicable law.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'You may not use Picsa to violate the law, infringe intellectual property or privacy rights, harass others, distribute malware, circumvent security controls, scrape or misuse platform data, or interfere with the normal operation of the service. This includes using shared event spaces in a way that could expose guests or organizers to harm.',
      'Picsa reserves the right to investigate suspected misuse and to suspend, limit, or terminate access where necessary to protect the platform, users, event organizers, or third parties.',
    ],
  },
  {
    title: 'Paid features and subscriptions',
    body: [
      'If Picsa offers paid plans, subscriptions, or premium event features, pricing and billing terms may be presented at the time of purchase. Subscription processing may be handled by third-party stores or payment providers, and renewals, cancellations, and refunds may be subject to those providers’ rules in addition to any product-specific disclosures shown during checkout.',
      'Access to paid features may change if a subscription expires, is canceled, or cannot be successfully renewed. Picsa may modify pricing or plan packaging going forward, but material changes will not retroactively alter completed purchases unless required by law or clearly disclosed.',
    ],
  },
  {
    title: 'Availability and changes',
    body: [
      'Picsa is continually evolving. We may add, remove, or modify features, event tools, integrations, and design elements over time. We may also suspend parts of the service temporarily for maintenance, security work, upgrades, or operational reasons.',
      'While we aim to provide a reliable service, Picsa does not guarantee uninterrupted availability, perfect retention of every upload, or compatibility with every device, browser, network, or third-party platform.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'You may stop using Picsa at any time. Picsa may suspend or terminate access if you violate these terms, create risk for other users, fail to pay required fees, or misuse the service in a way that affects safety, integrity, or lawful operation.',
      'Termination does not automatically remove all shared event content immediately, especially where the content belongs to or remains visible inside an organizer-controlled space. Some provisions of these terms will continue to apply after termination by their nature, including ownership, disclaimers, and limitations of liability.',
    ],
  },
  {
    title: 'Disclaimers and liability limits',
    body: [
      'To the fullest extent permitted by law, Picsa is provided on an “as is” and “as available” basis. We disclaim implied warranties to the extent allowed by law, including warranties of merchantability, fitness for a particular purpose, and non-infringement.',
      'To the fullest extent permitted by law, Picsa and its affiliates will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, revenues, goodwill, or data arising from or related to your use of the service. Nothing in these terms limits liability that cannot lawfully be excluded.',
    ],
  },
  {
    title: 'Changes to these terms',
    body: [
      'We may update these Terms of Service to reflect product, legal, or operational changes. When we do, the revised version will appear on this page with an updated effective date.',
      'Your continued use of Picsa after updated terms become effective means the revised terms apply to your use of the service, to the extent permitted by law.',
    ],
  },
] as const

export default function TermsOfServicePage() {
  return (
    <LegalPageShell
      eyebrow="Terms of service"
      title="A clear set of rules for the moments people share together."
      description="These Terms explain the responsibilities, permissions, and boundaries that apply when you create events, invite guests, upload content, or use paid features on Picsa."
      lastUpdated="March 25, 2026"
      accent="terms"
      sections={[...termsSections]}
    />
  )
}
