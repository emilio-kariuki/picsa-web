'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { ExternalLinkIcon, LifeBuoyIcon, LogOutIcon, ShieldAlertIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ClientMetricCard, ClientPageHeader, ClientSurface } from '@/components/client/client-page-chrome'
import { useClientAuth } from '@/hooks/use-client-auth'
import { fetchAppConfig, fetchUserConfig, updateUserConfig, deactivateClientAccount } from '@/lib/client-api'
import { clientCurrentUserAtom } from '@/lib/store'
import { formatDateShort } from '@/lib/client-view'

export default function ClientSettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { logout, performAuthenticatedRequest } = useClientAuth()
  const currentUser = useAtomValue(clientCurrentUserAtom)
  const [deactivateReason, setDeactivateReason] = useState('')
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const userConfigQuery = useQuery({
    queryKey: ['client', 'user-config'],
    queryFn: () => performAuthenticatedRequest((token) => fetchUserConfig(token)),
  })

  const appConfigQuery = useQuery({
    queryKey: ['client', 'app-config'],
    queryFn: fetchAppConfig,
  })

  const updateConfigMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateUserConfig>[1]) =>
      performAuthenticatedRequest((token) => updateUserConfig(token, input)),
    onSuccess: () => {
      toast.success('Preferences updated')
      void queryClient.invalidateQueries({ queryKey: ['client', 'user-config'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to update preferences')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: () =>
      performAuthenticatedRequest((token) => deactivateClientAccount(token, deactivateReason.trim() || undefined)),
    onSuccess: async () => {
      toast.success('Account deactivated')
      setDeactivateOpen(false)
      await logout()
      router.replace('/login')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Unable to deactivate account')
    },
  })

  const profileFacts = useMemo(
    () => [
      { label: 'Account type', value: currentUser?.pro ? 'Pro' : 'Free' },
      { label: 'Joined', value: formatDateShort(currentUser?.createdAt) },
      { label: 'Last login', value: formatDateShort(currentUser?.lastLoginAt, 'Recently') },
    ],
    [currentUser],
  )

  return (
    <div className="space-y-6">
      <ClientPageHeader
        eyebrow="Settings"
        title="Your account, preferences, and support links"
        description="Keep notifications tuned to your pace, review your account details, and reach support without leaving the workspace."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {profileFacts.map((fact) => (
          <ClientMetricCard key={fact.label} label={fact.label} value={fact.value} helper={fact.label === 'Account type' ? 'Your current plan level.' : undefined} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ClientSurface>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Profile summary</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Account details</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="mt-2 font-medium text-foreground">{currentUser?.name ?? 'No name on file'}</p>
            </div>
            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="mt-2 font-medium text-foreground">{currentUser?.email ?? 'No email on file'}</p>
            </div>
            <div className="rounded-[1.35rem] border border-border/70 bg-secondary/45 p-4">
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="mt-2 font-medium capitalize text-foreground">{currentUser?.role ?? 'user'}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-6 rounded-full border-border/80 bg-background/70"
            onClick={() => void logout().then(() => router.replace('/login'))}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </ClientSurface>

        <div className="space-y-6">
          <ClientSurface>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Notification preferences</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Set the rhythm that works for you</h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  key: 'pushNotificationsEnabled' as const,
                  label: 'Push notifications',
                  description: 'Stay on top of approvals, invitations, and gallery updates in real time.',
                },
                {
                  key: 'emailNotificationsEnabled' as const,
                  label: 'Email notifications',
                  description: 'Receive the most important event updates in your inbox.',
                },
                {
                  key: 'vibrationsEnabled' as const,
                  label: 'Vibrations',
                  description: 'Keep tactile feedback on for supported devices and notifications.',
                },
              ].map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4 rounded-[1.35rem] border border-border/70 bg-secondary/45 px-4 py-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={Boolean(userConfigQuery.data?.[item.key])}
                    onCheckedChange={(checked) =>
                      updateConfigMutation.mutate({
                        [item.key]: checked,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </ClientSurface>

          <ClientSurface>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Support and legal</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Need help or more context?</h2>

            <div className="mt-6 grid gap-3">
              {[
                {
                  label: 'Support email',
                  href: appConfigQuery.data?.links.supportEmail ? `mailto:${appConfigQuery.data.links.supportEmail}` : null,
                  value: appConfigQuery.data?.links.supportEmail ?? 'Not configured',
                },
                {
                  label: 'Privacy policy',
                  href: appConfigQuery.data?.links.privacyPolicyUrl ?? null,
                  value: 'Read policy',
                },
                {
                  label: 'Terms of service',
                  href: appConfigQuery.data?.links.termsOfServiceUrl ?? null,
                  value: 'Read terms',
                },
                {
                  label: 'Website',
                  href: appConfigQuery.data?.links.websiteUrl ?? null,
                  value: 'Open marketing site',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-border/70 bg-secondary/45 px-4 py-4">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                  </div>
                  {item.href ? (
                    <Button asChild variant="outline" className="rounded-full border-border/80 bg-background/70">
                      <Link href={item.href} target="_blank" rel="noreferrer">
                        Open
                        <ExternalLinkIcon className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                      <LifeBuoyIcon className="h-4 w-4" />
                      Unavailable
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ClientSurface>

          <ClientSurface className="border-rose-300/60 bg-rose-500/5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600 dark:text-rose-300">Danger zone</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight">Deactivate account</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You can return later through Google reactivation, but this pauses your account immediately.
            </p>

            <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="mt-5 rounded-full">
                  <ShieldAlertIcon className="mr-2 h-4 w-4" />
                  Deactivate account
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[1.5rem] border-border/70">
                <DialogHeader>
                  <DialogTitle>Deactivate your account?</DialogTitle>
                  <DialogDescription>
                    Share a brief reason if you want. You can reactivate later with Google.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Label htmlFor="deactivate-reason">Reason</Label>
                  <Textarea
                    id="deactivate-reason"
                    value={deactivateReason}
                    onChange={(event) => setDeactivateReason(event.target.value)}
                    placeholder="Tell us what led to the pause, if you'd like."
                    rows={5}
                    className="rounded-2xl"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="rounded-full border-border/80 bg-background/70"
                    onClick={() => setDeactivateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="rounded-full"
                    disabled={deactivateMutation.isPending}
                    onClick={() => deactivateMutation.mutate()}
                  >
                    {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </ClientSurface>
        </div>
      </div>
    </div>
  )
}
