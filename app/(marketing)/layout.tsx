import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Picsa — One event. Every photo. All in one beautiful place.',
  description:
    'Picsa helps you create a shared event space where guests can upload photos, chat, and relive the moment together without losing memories across group chats and camera rolls.',
}

export default function MarketingSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      data-site="marketing"
      className="grain-overlay relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans"
    >
      {children}
    </div>
  )
}
