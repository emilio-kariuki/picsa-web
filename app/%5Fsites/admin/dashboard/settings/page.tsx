'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { PageHeader } from '@/components/common/page-header'
import { StatusBadge } from '@/components/common/status-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAdminDisplayName, getAdminInitials } from '@/lib/auth'
import { adminAuthSessionAtom, currentUserAtom } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  ArrowRightIcon,
  BellIcon,
  BuildingIcon,
  CreditCardIcon,
  KeyIcon,
  LockIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react'

function formatDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
) {
  if (!value) {
    return 'Not available'
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: 'UTC',
  }).format(parsed)
}

function formatDateTime(value: string | null | undefined) {
  const formatted = formatDate(value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return formatted === 'Not available' ? formatted : `${formatted} UTC`
}

function formatRole(value: string | null | undefined) {
  if (!value) {
    return 'Not available'
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function ReadOnlyField({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input readOnly value={value} className={cn('bg-muted/35', className)} />
    </div>
  )
}

function LinkedInfoCard({
  title,
  description,
  href,
  cta,
}: {
  title: string
  description: string
  href: string
  cta: string
}) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/20 p-5">
      <div className="space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="outline" className="mt-4">
        <Link href={href}>
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

const navItems = [
  { id: 'general', label: 'General', icon: BuildingIcon },
  { id: 'team', label: 'Team', icon: UsersIcon },
  { id: 'billing', label: 'Billing', icon: CreditCardIcon },
  { id: 'security', label: 'Security', icon: LockIcon },
  { id: 'api', label: 'API', icon: KeyIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const currentUser = useAtomValue(currentUserAtom)
  const authSession = useAtomValue(adminAuthSessionAtom)

  const displayName = getAdminDisplayName(currentUser)
  const initials = getAdminInitials(currentUser)
  const email = currentUser?.email ?? 'No email on file'
  const createdAt = formatDate(currentUser?.createdAt)
  const lastLoginAt = formatDateTime(currentUser?.lastLoginAt)
  const emailVerifiedAt = formatDateTime(currentUser?.emailVerifiedAt)
  const accessTokenExpiresAt = formatDateTime(authSession?.accessTokenExpiresAt)
  const refreshTokenExpiresAt = formatDateTime(authSession?.refreshTokenExpiresAt)
  const accountStatus = currentUser?.active ? 'active' : 'inactive'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Review live admin account details and the settings surfaces connected in this build."
      />

      <div className="flex gap-8">
        <aside className="w-56 shrink-0">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                    activeSection === item.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {activeSection === 'general' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Admin Account</CardTitle>
                  <CardDescription>
                    These values come from the current authenticated admin session.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-4 rounded-xl border bg-muted/15 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={currentUser?.url ?? undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">{displayName}</p>
                        <p className="text-sm text-muted-foreground">{email}</p>
                        <p className="text-sm text-muted-foreground">
                          User ID: {currentUser?.id ?? 'Not available'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={accountStatus} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReadOnlyField label="Display name" value={displayName} />
                    <ReadOnlyField label="Email" value={email} />
                    <ReadOnlyField label="Role" value={formatRole(currentUser?.role)} />
                    <ReadOnlyField label="Member since" value={createdAt} />
                    <ReadOnlyField label="Last login" value={lastLoginAt} />
                    <ReadOnlyField label="Email verified" value={emailVerifiedAt} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Editing Availability</CardTitle>
                  <CardDescription>
                    This settings screen is intentionally read-only until a dedicated admin settings API exists.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-2">
                  <LinkedInfoCard
                    title="Review live billing activity"
                    description="Subscriptions, transactions, and revenue metrics already come from the real admin payments API."
                    href="/dashboard/payments"
                    cta="Open Payments"
                  />
                  <LinkedInfoCard
                    title="Manage notification batches"
                    description="Broadcast creation and delivery history are live on the notifications page."
                    href="/dashboard/notifications"
                    cta="Open Notifications"
                  />
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'team' && (
            <Card>
              <CardHeader>
                <CardTitle>Team Access</CardTitle>
                <CardDescription>
                  The authenticated admin user is the only live team record exposed in this app today.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={currentUser?.url ?? undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-semibold">{displayName}</p>
                      <p className="text-sm text-muted-foreground">{email}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined {createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={accountStatus} />
                    <span className="text-sm text-muted-foreground">
                      {formatRole(currentUser?.role)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed bg-muted/20 p-5">
                  <h3 className="font-semibold">Team management is not connected yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Invite flows, role changes, and multi-admin access controls were previously sample data only.
                    They now stay hidden until there is a real backend endpoint to power them.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>
                  Live billing data is available in the payments dashboard instead of this read-only settings view.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LinkedInfoCard
                  title="Open the live payments workspace"
                  description="Use the payments page to review subscriptions, transactions, and revenue trends from the real admin API."
                  href="/dashboard/payments"
                  cta="Go to Payments"
                />

                <div className="rounded-xl border border-dashed bg-muted/20 p-5">
                  <h3 className="font-semibold">No billing editor is wired here</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Plan changes, payment method updates, and invoice downloads were mock content before. They remain
                    unavailable in this page until a writable billing settings endpoint is added.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'security' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Session Security</CardTitle>
                  <CardDescription>
                    Current security details from the active admin session.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-muted/15 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                          <ShieldIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Account status</p>
                          <p className="font-semibold capitalize">{accountStatus}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border bg-muted/15 p-4">
                      <p className="text-sm text-muted-foreground">Email verification</p>
                      <p className="mt-1 font-semibold">
                        {currentUser?.emailVerifiedAt ? 'Verified' : 'Pending'}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-muted/15 p-4">
                      <p className="text-sm text-muted-foreground">Permission level</p>
                      <p className="mt-1 font-semibold">{formatRole(currentUser?.role)}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReadOnlyField label="Last login" value={lastLoginAt} />
                    <ReadOnlyField label="Email verified at" value={emailVerifiedAt} />
                    <ReadOnlyField label="Access token expires" value={accessTokenExpiresAt} />
                    <ReadOnlyField label="Refresh token expires" value={refreshTokenExpiresAt} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credential Controls</CardTitle>
                  <CardDescription>
                    Password reset, two-factor enrollment, and device session management need dedicated backend support.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-dashed bg-muted/20 p-5">
                    <p className="text-sm text-muted-foreground">
                      Those controls were previously rendered with sample fields and made it look like changes were
                      possible. They are now hidden until the underlying auth workflows are exposed in the admin API.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'api' && (
            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  This admin surface uses session-based authentication and does not expose self-service API key
                  management.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField label="Authenticated user ID" value={currentUser?.id ?? 'Not available'} className="font-mono text-xs" />
                  <ReadOnlyField label="Authenticated role" value={formatRole(currentUser?.role)} />
                </div>

                <div className="rounded-xl border border-dashed bg-muted/20 p-5">
                  <h3 className="font-semibold">No live API key registry</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The old sample keys have been removed. Once the backend exposes real admin API key management, this
                    section can show creation, rotation, and last-used data without inventing records.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Broadcast management is live, but per-admin notification preferences are not connected in this page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LinkedInfoCard
                  title="Open live notification batches"
                  description="Create broadcasts, review delivery metrics, and inspect batch activity from the notifications workspace."
                  href="/dashboard/notifications"
                  cta="Go to Notifications"
                />

                <div className="rounded-xl border border-dashed bg-muted/20 p-5">
                  <h3 className="font-semibold">Preference toggles removed</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Email and push toggles were mock UI only. They now stay out of the way until the backend returns
                    real per-admin preferences that this page can save.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
