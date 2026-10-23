import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/marketing/legal-page-shell'

export const metadata: Metadata = {
  title: 'Privacy Policy | Picsa',
  description:
    'Learn how Picsa collects, uses, stores, and protects personal data across shared event spaces, guest uploads, and subscriptions.',
}

const privacySections = [
  {
    title: 'Information we collect',
    body: [
      'Picsa collects the information needed to create and operate shared event spaces. This may include account details such as your name, email address, profile image, event participation details, uploaded photos, messages, and device or usage information generated when you access the service.',
      'If you join an event through an invite, Picsa may also receive limited information from the host or organizer, such as your invitation status, display name, and content you upload into that event space. Where paid features are offered, billing or subscription data may be processed through third-party payment providers rather than stored directly by Picsa.',
    ],
  },
  {
    title: 'How we use your information',
    body: [
      'We use personal data to provide core product functionality, including event creation, guest participation, media uploads, notifications, support workflows, fraud prevention, and service analytics. We also use information to maintain platform safety, troubleshoot technical issues, and improve the experience for hosts and attendees.',
      'Picsa may use aggregated or de-identified information for internal reporting, capacity planning, and product improvement. We do not treat de-identified information as personal information once it can no longer reasonably be linked back to an individual.',
    ],
  },
  {
    title: 'Event content and guest uploads',
    body: [
      'Photos, comments, captions, and similar content uploaded to an event are processed so that organizers and participants can view, share, and manage those memories inside the event space. Because Picsa is built around collaborative event albums, content you upload may be visible to other authorized participants in the same event.',
      'Hosts and administrators may be able to moderate, remove, organize, or export content associated with their event. You should only upload content that you have the right to share and that does not violate the rights or privacy of others.',
    ],
  },
  {
    title: 'Sharing and disclosures',
    body: [
      'Picsa may share information with service providers that help operate the platform, such as hosting vendors, analytics providers, messaging infrastructure, and payment or subscription processors. These parties are permitted to access information only as reasonably necessary to perform services on our behalf.',
      'We may also disclose information when required by law, when necessary to protect users, organizers, guests, or Picsa from harm, or in connection with a merger, acquisition, financing, or similar business transaction involving all or part of the service.',
    ],
  },
  {
    title: 'Retention and deletion',
    body: [
      'We keep information for as long as it is reasonably needed to provide the service, comply with legal obligations, resolve disputes, enforce agreements, and maintain security records. Retention periods may vary depending on the type of data, the event lifecycle, and whether the information is needed for safety or abuse prevention.',
      'When data is no longer required, Picsa may delete, anonymize, or aggregate it. Some backups or archival copies may persist for a limited period before being overwritten as part of normal infrastructure operations.',
    ],
  },
  {
    title: 'Your choices and controls',
    body: [
      'Depending on how you use Picsa, you may be able to update your profile details, manage event participation, remove uploads, or control certain notification settings from within the product. Hosts may also control the visibility and organization of content within their own event spaces.',
      'If you want to request access, correction, deletion, or other privacy-related action, you should use the support or contact channels made available by Picsa. We may need to verify your identity before responding to a request.',
    ],
  },
  {
    title: 'Security and children',
    body: [
      'Picsa uses administrative, technical, and organizational measures intended to protect personal information against unauthorized access, loss, misuse, or disclosure. No security system is perfect, and users should also help protect their accounts, devices, and shared event links.',
      'Picsa is not intended for use by children without appropriate supervision where required by applicable law. If we learn that personal information was collected in violation of applicable age-based requirements, we may take steps to remove that information.',
    ],
  },
  {
    title: 'Updates to this policy',
    body: [
      'Picsa may update this Privacy Policy from time to time to reflect product changes, legal developments, or operational needs. When the policy changes, the updated version will be posted on this page with a revised effective date.',
      'Your continued use of Picsa after an updated policy becomes effective means the updated policy will apply to your use of the service, to the extent permitted by law.',
    ],
  },
] as const

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy policy"
      title="Your memories deserve clarity, not hidden fine print."
      description="This Privacy Policy explains how Picsa handles personal information across event creation, shared albums, guest participation, messaging, and subscription experiences."
      lastUpdated="March 25, 2026"
      accent="privacy"
      sections={[...privacySections]}
    />
  )
}
