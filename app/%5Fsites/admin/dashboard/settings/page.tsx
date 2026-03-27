'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react'
import { useAtomValue } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/page-header'
import { StatusBadge } from '@/components/common/status-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { type EditableAdminAppConfig, fetchAdminAppConfig, updateAdminAppConfig } from '@/lib/admin-app-config-api'
import { isAdminApiError } from '@/lib/api'
import { getAdminDisplayName, getAdminInitials } from '@/lib/auth'
import { type ClientAppConfig } from '@/lib/client-types'
import { adminAuthSessionAtom, currentUserAtom } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  ArrowRightIcon,
  BellIcon,
  BuildingIcon,
  CircleAlertIcon,
  CreditCardIcon,
  KeyIcon,
  LoaderCircleIcon,
  LockIcon,
  RefreshCwIcon,
  SaveIcon,
  Settings2Icon,
  ShieldIcon,
  SmartphoneIcon,
  UsersIcon,
} from 'lucide-react'

const APP_CONFIG_QUERY_KEY = 'admin-app-config'

type SettingsSectionId =
  | 'general'
  | 'appConfig'
  | 'team'
  | 'billing'
  | 'security'
  | 'api'
  | 'notifications'

interface AppConfigDraft {
  plan: {
    freeEventMaxGuests: string
    proEventMaxGuests: string
    freeEventMaxImages: string
    proEventMaxImages: string
    allowFreeHdUploads: boolean
    allowFreePrivateImages: boolean
  }
  uploads: {
    imageBatchMaxFiles: string
  }
  links: {
    websiteUrl: string
    privacyPolicyUrl: string
    termsOfServiceUrl: string
    instagramUrl: string
    linkedinUrl: string
    twitterUrl: string
    supportEmail: string
    supportPhone: string
  }
  updates: {
    iosRecommendedVersion: string
    iosMinimumSupportedVersion: string
    androidRecommendedVersion: string
    androidMinimumSupportedVersion: string
    iosStoreUrl: string
    androidStoreUrl: string
    title: string
    message: string
    releaseNotes: string
    remindAfterHours: string
  }
}

const navItems: Array<{
  id: SettingsSectionId
  label: string
  icon: typeof BuildingIcon
}> = [
  { id: 'general', label: 'General', icon: BuildingIcon },
  { id: 'appConfig', label: 'App Config', icon: SmartphoneIcon },
  { id: 'team', label: 'Team', icon: UsersIcon },
  { id: 'billing', label: 'Billing', icon: CreditCardIcon },
  { id: 'security', label: 'Security', icon: LockIcon },
  { id: 'api', label: 'API', icon: KeyIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
]

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

function toOptionalText(value: string) {
  const normalized = value.trim()
  return normalized ? normalized : null
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function parseSemanticVersion(value: string | null) {
  if (!value) {
    return null
  }

  const match = value.match(/^(\d+)\.(\d+)\.(\d+)$/)

  if (!match) {
    return null
  }

  return match.slice(1).map((part) => Number.parseInt(part, 10))
}

function compareSemanticVersions(left: number[], right: number[]) {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const delta = (left[index] ?? 0) - (right[index] ?? 0)

    if (delta !== 0) {
      return delta
    }
  }

  return 0
}

function buildAppConfigDraft(config: ClientAppConfig): AppConfigDraft {
  return {
    plan: {
      freeEventMaxGuests: String(config.plan.freeEventMaxGuests),
      proEventMaxGuests: String(config.plan.proEventMaxGuests),
      freeEventMaxImages: String(config.plan.freeEventMaxImages),
      proEventMaxImages: String(config.plan.proEventMaxImages),
      allowFreeHdUploads: config.plan.allowFreeHdUploads,
      allowFreePrivateImages: config.plan.allowFreePrivateImages,
    },
    uploads: {
      imageBatchMaxFiles: String(config.uploads.imageBatchMaxFiles),
    },
    links: {
      websiteUrl: config.links.websiteUrl,
      privacyPolicyUrl: config.links.privacyPolicyUrl,
      termsOfServiceUrl: config.links.termsOfServiceUrl,
      instagramUrl: config.links.instagramUrl,
      linkedinUrl: config.links.linkedinUrl,
      twitterUrl: config.links.twitterUrl,
      supportEmail: config.links.supportEmail ?? '',
      supportPhone: config.links.supportPhone ?? '',
    },
    updates: {
      iosRecommendedVersion: config.updates.iosRecommendedVersion ?? '',
      iosMinimumSupportedVersion: config.updates.iosMinimumSupportedVersion ?? '',
      androidRecommendedVersion: config.updates.androidRecommendedVersion ?? '',
      androidMinimumSupportedVersion:
        config.updates.androidMinimumSupportedVersion ?? '',
      iosStoreUrl: config.updates.iosStoreUrl ?? '',
      androidStoreUrl: config.updates.androidStoreUrl ?? '',
      title: config.updates.title ?? '',
      message: config.updates.message ?? '',
      releaseNotes: config.updates.releaseNotes ?? '',
      remindAfterHours: String(config.updates.remindAfterHours),
    },
  }
}

function parsePositiveInteger(value: string, label: string, errors: string[]) {
  const normalized = value.trim()

  if (!normalized) {
    errors.push(`${label} is required.`)
    return null
  }

  const parsed = Number.parseInt(normalized, 10)

  if (!Number.isInteger(parsed) || parsed < 1) {
    errors.push(`${label} must be a whole number greater than 0.`)
    return null
  }

  return parsed
}

function validateRequiredUrl(value: string, label: string, errors: string[]) {
  const normalized = value.trim()

  if (!normalized) {
    errors.push(`${label} is required.`)
    return
  }

  if (!isValidHttpUrl(normalized)) {
    errors.push(`${label} must be a valid http or https URL.`)
  }
}

function validateOptionalUrl(value: string, label: string, errors: string[]) {
  const normalized = value.trim()

  if (!normalized) {
    return
  }

  if (!isValidHttpUrl(normalized)) {
    errors.push(`${label} must be a valid http or https URL.`)
  }
}

function buildEditableAppConfigPayload(
  draft: AppConfigDraft,
): {
  errors: string[]
  payload?: EditableAdminAppConfig
} {
  const errors: string[] = []

  const freeEventMaxGuests = parsePositiveInteger(draft.plan.freeEventMaxGuests, 'Free max guests', errors)
  const proEventMaxGuests = parsePositiveInteger(draft.plan.proEventMaxGuests, 'Pro max guests', errors)
  const freeEventMaxImages = parsePositiveInteger(draft.plan.freeEventMaxImages, 'Free max images', errors)
  const proEventMaxImages = parsePositiveInteger(draft.plan.proEventMaxImages, 'Pro max images', errors)
  const imageBatchMaxFiles = parsePositiveInteger(draft.uploads.imageBatchMaxFiles, 'Image batch max files', errors)
  const remindAfterHours = parsePositiveInteger(draft.updates.remindAfterHours, 'Remind after hours', errors)

  validateRequiredUrl(draft.links.websiteUrl, 'Website URL', errors)
  validateRequiredUrl(draft.links.privacyPolicyUrl, 'Privacy policy URL', errors)
  validateRequiredUrl(draft.links.termsOfServiceUrl, 'Terms of service URL', errors)
  validateRequiredUrl(draft.links.instagramUrl, 'Instagram URL', errors)
  validateRequiredUrl(draft.links.linkedinUrl, 'LinkedIn URL', errors)
  validateRequiredUrl(draft.links.twitterUrl, 'Twitter/X URL', errors)
  validateOptionalUrl(draft.updates.iosStoreUrl, 'iOS store URL', errors)
  validateOptionalUrl(draft.updates.androidStoreUrl, 'Android store URL', errors)

  const supportEmail = toOptionalText(draft.links.supportEmail)

  if (supportEmail && !isValidEmail(supportEmail)) {
    errors.push('Support email must be a valid email address.')
  }

  const iosRecommendedVersion = toOptionalText(draft.updates.iosRecommendedVersion)
  const iosMinimumSupportedVersion = toOptionalText(draft.updates.iosMinimumSupportedVersion)
  const androidRecommendedVersion = toOptionalText(draft.updates.androidRecommendedVersion)
  const androidMinimumSupportedVersion = toOptionalText(
    draft.updates.androidMinimumSupportedVersion,
  )

  const parsedIosRecommendedVersion = parseSemanticVersion(iosRecommendedVersion)
  const parsedIosMinimumSupportedVersion = parseSemanticVersion(
    iosMinimumSupportedVersion,
  )
  const parsedAndroidRecommendedVersion = parseSemanticVersion(
    androidRecommendedVersion,
  )
  const parsedAndroidMinimumSupportedVersion = parseSemanticVersion(
    androidMinimumSupportedVersion,
  )

  if (iosRecommendedVersion && !parsedIosRecommendedVersion) {
    errors.push('iOS recommended version must use semantic versioning like 1.0.35.')
  }

  if (iosMinimumSupportedVersion && !parsedIosMinimumSupportedVersion) {
    errors.push('iOS minimum supported version must use semantic versioning like 1.0.35.')
  }

  if (
    parsedIosRecommendedVersion &&
    parsedIosMinimumSupportedVersion &&
    compareSemanticVersions(
      parsedIosRecommendedVersion,
      parsedIosMinimumSupportedVersion,
    ) < 0
  ) {
    errors.push('iOS recommended version cannot be lower than the iOS minimum supported version.')
  }

  if (androidRecommendedVersion && !parsedAndroidRecommendedVersion) {
    errors.push('Android recommended version must use semantic versioning like 1.0.35.')
  }

  if (androidMinimumSupportedVersion && !parsedAndroidMinimumSupportedVersion) {
    errors.push(
      'Android minimum supported version must use semantic versioning like 1.0.35.',
    )
  }

  if (
    parsedAndroidRecommendedVersion &&
    parsedAndroidMinimumSupportedVersion &&
    compareSemanticVersions(
      parsedAndroidRecommendedVersion,
      parsedAndroidMinimumSupportedVersion,
    ) < 0
  ) {
    errors.push(
      'Android recommended version cannot be lower than the Android minimum supported version.',
    )
  }

  if (
    freeEventMaxGuests == null ||
    proEventMaxGuests == null ||
    freeEventMaxImages == null ||
    proEventMaxImages == null ||
    imageBatchMaxFiles == null ||
    remindAfterHours == null ||
    errors.length > 0
  ) {
    return { errors }
  }

  return {
    errors,
    payload: {
      plan: {
        freeEventMaxGuests,
        proEventMaxGuests,
        freeEventMaxImages,
        proEventMaxImages,
        allowFreeHdUploads: draft.plan.allowFreeHdUploads,
        allowFreePrivateImages: draft.plan.allowFreePrivateImages,
      },
      uploads: {
        imageBatchMaxFiles,
      },
      links: {
        websiteUrl: draft.links.websiteUrl.trim(),
        privacyPolicyUrl: draft.links.privacyPolicyUrl.trim(),
        termsOfServiceUrl: draft.links.termsOfServiceUrl.trim(),
        instagramUrl: draft.links.instagramUrl.trim(),
        linkedinUrl: draft.links.linkedinUrl.trim(),
        twitterUrl: draft.links.twitterUrl.trim(),
        supportEmail,
        supportPhone: toOptionalText(draft.links.supportPhone),
      },
      updates: {
        iosRecommendedVersion,
        iosMinimumSupportedVersion,
        androidRecommendedVersion,
        androidMinimumSupportedVersion,
        iosStoreUrl: toOptionalText(draft.updates.iosStoreUrl),
        androidStoreUrl: toOptionalText(draft.updates.androidStoreUrl),
        title: toOptionalText(draft.updates.title),
        message: toOptionalText(draft.updates.message),
        releaseNotes: toOptionalText(draft.updates.releaseNotes),
        remindAfterHours,
      },
    },
  }
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

function ActionInfoCard({
  title,
  description,
  cta,
  href,
  onClick,
}: {
  title: string
  description: string
  cta: string
  href?: string
  onClick?: () => void
}) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/20 p-5">
      <div className="space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {href ? (
        <Button asChild variant="outline" className="mt-4">
          <Link href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" className="mt-4" onClick={onClick}>
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  description,
  textarea = false,
  inputMode,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  textarea?: boolean
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {textarea ? (
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-28"
        />
      ) : (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
        />
      )}
    </div>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/15 p-4">
      <div className="space-y-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function EditableSectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

function MetaStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border bg-muted/15 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  )
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('general')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [appConfigDraft, setAppConfigDraft] = useState<AppConfigDraft | null>(null)
  const currentUser = useAtomValue(currentUserAtom)
  const authSession = useAtomValue(adminAuthSessionAtom)
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()

  const displayName = getAdminDisplayName(currentUser)
  const initials = getAdminInitials(currentUser)
  const email = currentUser?.email ?? 'No email on file'
  const createdAt = formatDate(currentUser?.createdAt)
  const lastLoginAt = formatDateTime(currentUser?.lastLoginAt)
  const emailVerifiedAt = formatDateTime(currentUser?.emailVerifiedAt)
  const accessTokenExpiresAt = formatDateTime(authSession?.accessTokenExpiresAt)
  const refreshTokenExpiresAt = formatDateTime(authSession?.refreshTokenExpiresAt)
  const accountStatus = currentUser?.active ? 'active' : 'inactive'

  const appConfigQuery = useQuery({
    queryKey: [APP_CONFIG_QUERY_KEY],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        fetchAdminAppConfig(accessToken),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
    refetchOnWindowFocus: false,
  })

  const liveAppConfig = appConfigQuery.data?.data.config ?? null
  const liveAppConfigDraft = useMemo(
    () => (liveAppConfig ? buildAppConfigDraft(liveAppConfig) : null),
    [liveAppConfig],
  )

  useEffect(() => {
    if (!liveAppConfigDraft) {
      return
    }

    setAppConfigDraft(liveAppConfigDraft)
    setValidationErrors([])
  }, [liveAppConfigDraft])

  const hasUnsavedConfigChanges = useMemo(() => {
    if (!appConfigDraft || !liveAppConfigDraft) {
      return false
    }

    return JSON.stringify(appConfigDraft) !== JSON.stringify(liveAppConfigDraft)
  }, [appConfigDraft, liveAppConfigDraft])

  function updateDraft(updater: (current: AppConfigDraft) => AppConfigDraft) {
    setValidationErrors([])
    setAppConfigDraft((current) => {
      if (!current) {
        return current
      }

      return updater(current)
    })
  }

  const saveAppConfigMutation = useMutation({
    mutationFn: (payload: EditableAdminAppConfig) =>
      performAuthenticatedRequest((accessToken) =>
        updateAdminAppConfig(accessToken, payload),
      ),
    onSuccess: (response) => {
      queryClient.setQueryData([APP_CONFIG_QUERY_KEY], response)
      toast.success('App configuration updated live.')
    },
    onError: (error) => {
      const apiErrors =
        isAdminApiError(error) && error.errors?.length ? error.errors : []

      if (apiErrors.length > 0) {
        setValidationErrors(apiErrors)
      }

      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to update app configuration.'
      toast.error(message)
    },
  })

  async function handleSaveAppConfig() {
    if (!appConfigDraft) {
      return
    }

    const { errors, payload } = buildEditableAppConfigPayload(appConfigDraft)

    if (!payload || errors.length > 0) {
      setValidationErrors(errors)
      toast.error(errors[0] ?? 'Check the form before saving.')
      return
    }

    setValidationErrors([])
    await saveAppConfigMutation.mutateAsync(payload)
  }

  async function handleRefreshAppConfig() {
    try {
      await appConfigQuery.refetch({ throwOnError: true })
      toast.success('Live app configuration refreshed.')
    } catch (error) {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to refresh app configuration.'
      toast.error(message)
    }
  }

  function handleResetAppConfig() {
    if (!liveAppConfigDraft) {
      return
    }

    setAppConfigDraft(liveAppConfigDraft)
    setValidationErrors([])
    toast.success('Draft reset to the current live values.')
  }

  const pageActions =
    activeSection === 'appConfig'
      ? (
          <>
            <Button
              variant="outline"
              onClick={handleRefreshAppConfig}
              disabled={appConfigQuery.isFetching || saveAppConfigMutation.isPending}
            >
              <RefreshCwIcon
                className={cn(
                  'mr-2 h-4 w-4',
                  appConfigQuery.isFetching ? 'animate-spin' : '',
                )}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleResetAppConfig}
              disabled={!hasUnsavedConfigChanges || saveAppConfigMutation.isPending}
            >
              Reset
            </Button>
            <Button
              onClick={handleSaveAppConfig}
              disabled={
                !appConfigDraft ||
                !hasUnsavedConfigChanges ||
                appConfigQuery.isLoading ||
                saveAppConfigMutation.isPending
              }
            >
              {saveAppConfigMutation.isPending ? (
                <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="mr-2 h-4 w-4" />
              )}
              Save live changes
            </Button>
          </>
        )
      : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Review live admin account details and manage the connected settings surfaces for this build."
        actions={pageActions}
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
                  <CardTitle>Connected Settings Surfaces</CardTitle>
                  <CardDescription>
                    Live settings now live inside this workspace, while billing and notifications stay on their dedicated pages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 xl:grid-cols-3">
                  <ActionInfoCard
                    title="Edit the live app configuration"
                    description="Update plan limits, upload defaults, public links, and update prompts without touching environment files."
                    cta="Open App Config"
                    onClick={() => setActiveSection('appConfig')}
                  />
                  <ActionInfoCard
                    title="Review live billing activity"
                    description="Subscriptions, transactions, and revenue metrics already come from the real admin payments API."
                    href="/dashboard/payments"
                    cta="Open Payments"
                  />
                  <ActionInfoCard
                    title="Manage notification batches"
                    description="Broadcast creation and delivery history are live on the notifications page."
                    href="/dashboard/notifications"
                    cta="Open Notifications"
                  />
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'appConfig' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Public App Configuration</CardTitle>
                  <CardDescription>
                    These values are served by the public <code>/app-config</code> payload and take effect as soon as you save.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetaStat
                      label="Config schema"
                      value={liveAppConfig?.version ?? 'Loading...'}
                    />
                    <MetaStat
                      label="Last updated"
                      value={formatDateTime(appConfigQuery.data?.data.updatedAt)}
                    />
                    <MetaStat
                      label="Updated by"
                      value={appConfigQuery.data?.data.updatedByUserId ?? 'Not available'}
                    />
                    <MetaStat
                      label="Draft state"
                      value={hasUnsavedConfigChanges ? 'Unsaved changes' : 'Synced to live'}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      <Settings2Icon className="h-3 w-3" />
                      Live admin API connected
                    </Badge>
                    {hasUnsavedConfigChanges ? (
                      <Badge variant="outline">Local edits not saved yet</Badge>
                    ) : (
                      <Badge variant="outline">Draft matches live config</Badge>
                    )}
                  </div>

                  {appConfigQuery.error ? (
                    <Alert variant="destructive">
                      <CircleAlertIcon className="h-4 w-4" />
                      <AlertTitle>Unable to load app configuration</AlertTitle>
                      <AlertDescription>
                        {(isAdminApiError(appConfigQuery.error) || appConfigQuery.error instanceof Error)
                          ? appConfigQuery.error.message
                          : 'Try refreshing the page or checking the admin API connection.'}
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {validationErrors.length > 0 ? (
                    <Alert variant="destructive">
                      <CircleAlertIcon className="h-4 w-4" />
                      <AlertTitle>Check the form before saving</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc space-y-1 pl-4">
                          {validationErrors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {appConfigQuery.isLoading && !appConfigDraft ? (
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/15 p-5 text-sm text-muted-foreground">
                      <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                      Loading the live app configuration...
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {appConfigDraft ? (
                <>
                  <EditableSectionCard
                    title="Updates"
                    description="Control iOS and Android version policy separately, alongside store links and the copy used in update prompts."
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      <EditableField
                        label="iOS recommended version"
                        value={appConfigDraft.updates.iosRecommendedVersion}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            updates: {
                              ...current.updates,
                              iosRecommendedVersion: value,
                            },
                          }))
                        }
                        placeholder="1.0.35"
                        description="Optional. Used for the dismissible iOS upgrade prompt."
                      />
                      <EditableField
                        label="iOS minimum supported version"
                        value={appConfigDraft.updates.iosMinimumSupportedVersion}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            updates: {
                              ...current.updates,
                              iosMinimumSupportedVersion: value,
                            },
                          }))
                        }
                        placeholder="1.0.34"
                        description="Optional. Older iOS builds below this version should be blocked."
                      />
                      <EditableField
                        label="Android recommended version"
                        value={appConfigDraft.updates.androidRecommendedVersion}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            updates: {
                              ...current.updates,
                              androidRecommendedVersion: value,
                            },
                          }))
                        }
                        placeholder="1.0.35"
                        description="Optional. Used for the dismissible Android upgrade prompt."
                      />
                      <EditableField
                        label="Android minimum supported version"
                        value={appConfigDraft.updates.androidMinimumSupportedVersion}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            updates: {
                              ...current.updates,
                              androidMinimumSupportedVersion: value,
                            },
                          }))
                        }
                        placeholder="1.0.34"
                        description="Optional. Older Android builds below this version should be blocked."
                      />
                      <EditableField
                        label="iOS store URL"
                        value={appConfigDraft.updates.iosStoreUrl}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            updates: {
                              ...current.updates,
                              iosStoreUrl: value,
                            },
                          }))
                        }
                        placeholder="https://apps.apple.com/app/..."
                      />
                      <EditableField
                        label="Android store URL"
                        value={appConfigDraft.updates.androidStoreUrl}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            updates: {
                              ...current.updates,
                              androidStoreUrl: value,
                            },
                          }))
                        }
                        placeholder="https://play.google.com/store/apps/..."
                      />
                      <EditableField
                        label="Alert title"
                        value={appConfigDraft.updates.title}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            updates: {
                              ...current.updates,
                              title: value,
                            },
                          }))
                        }
                        placeholder="New version available"
                      />
                      <EditableField
                        label="Remind after hours"
                        value={appConfigDraft.updates.remindAfterHours}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            updates: {
                              ...current.updates,
                              remindAfterHours: value,
                            },
                          }))
                        }
                        placeholder="24"
                        inputMode="numeric"
                        description="How long to wait before showing the same recommended update again."
                      />
                      <div className="lg:col-span-2">
                        <EditableField
                          label="Alert message"
                          value={appConfigDraft.updates.message}
                          onChange={(value) =>
                            updateDraft((current) => ({
                              ...current,
                              updates: {
                                ...current.updates,
                                message: value,
                              },
                            }))
                          }
                          placeholder="Update now to get the latest fixes and improvements."
                          textarea
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <EditableField
                          label="Release notes"
                          value={appConfigDraft.updates.releaseNotes}
                          onChange={(value) =>
                            updateDraft((current) => ({
                              ...current,
                              updates: {
                                ...current.updates,
                                releaseNotes: value,
                              },
                            }))
                          }
                          placeholder="What changed in this release?"
                          textarea
                        />
                      </div>
                    </div>
                  </EditableSectionCard>

                  <EditableSectionCard
                    title="Plan"
                    description="Set free and pro event limits plus the free-tier capability flags used by the clients."
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      <EditableField
                        label="Free max guests"
                        value={appConfigDraft.plan.freeEventMaxGuests}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            plan: {
                              ...current.plan,
                              freeEventMaxGuests: value,
                            },
                          }))
                        }
                        placeholder="10"
                        inputMode="numeric"
                      />
                      <EditableField
                        label="Pro max guests"
                        value={appConfigDraft.plan.proEventMaxGuests}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            plan: {
                              ...current.plan,
                              proEventMaxGuests: value,
                            },
                          }))
                        }
                        placeholder="100"
                        inputMode="numeric"
                      />
                      <EditableField
                        label="Free max images"
                        value={appConfigDraft.plan.freeEventMaxImages}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            plan: {
                              ...current.plan,
                              freeEventMaxImages: value,
                            },
                          }))
                        }
                        placeholder="50"
                        inputMode="numeric"
                      />
                      <EditableField
                        label="Pro max images"
                        value={appConfigDraft.plan.proEventMaxImages}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            plan: {
                              ...current.plan,
                              proEventMaxImages: value,
                            },
                          }))
                        }
                        placeholder="500"
                        inputMode="numeric"
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <ToggleField
                        label="Allow free HD uploads"
                        description="Turn on higher-quality uploads for free-plan users."
                        checked={appConfigDraft.plan.allowFreeHdUploads}
                        onCheckedChange={(checked) =>
                          updateDraft((current) => ({
                            ...current,
                            plan: {
                              ...current.plan,
                              allowFreeHdUploads: checked,
                            },
                          }))
                        }
                      />
                      <ToggleField
                        label="Allow free private images"
                        description="Let free users keep uploads private when needed."
                        checked={appConfigDraft.plan.allowFreePrivateImages}
                        onCheckedChange={(checked) =>
                          updateDraft((current) => ({
                            ...current,
                            plan: {
                              ...current.plan,
                              allowFreePrivateImages: checked,
                            },
                          }))
                        }
                      />
                    </div>
                  </EditableSectionCard>

                  <EditableSectionCard
                    title="Uploads"
                    description="Control global batch upload behavior for event image uploads."
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      <EditableField
                        label="Image batch max files"
                        value={appConfigDraft.uploads.imageBatchMaxFiles}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            uploads: {
                              ...current.uploads,
                              imageBatchMaxFiles: value,
                            },
                          }))
                        }
                        placeholder="10"
                        inputMode="numeric"
                        description="Maximum files accepted in a single upload batch."
                      />
                    </div>
                  </EditableSectionCard>

                  <EditableSectionCard
                    title="Links"
                    description="Set the public website, legal, social, and support links surfaced across the apps."
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      <EditableField
                        label="Website URL"
                        value={appConfigDraft.links.websiteUrl}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            links: {
                              ...current.links,
                              websiteUrl: value,
                            },
                          }))
                        }
                        placeholder="https://picsa.pro"
                      />
                      <EditableField
                        label="Privacy policy URL"
                        value={appConfigDraft.links.privacyPolicyUrl}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            links: {
                              ...current.links,
                              privacyPolicyUrl: value,
                            },
                          }))
                        }
                        placeholder="https://picsa.pro/privacy-policy"
                      />
                      <EditableField
                        label="Terms of service URL"
                        value={appConfigDraft.links.termsOfServiceUrl}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            links: {
                              ...current.links,
                              termsOfServiceUrl: value,
                            },
                          }))
                        }
                        placeholder="https://picsa.pro/terms-of-service"
                      />
                      <EditableField
                        label="Instagram URL"
                        value={appConfigDraft.links.instagramUrl}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            links: {
                              ...current.links,
                              instagramUrl: value,
                            },
                          }))
                        }
                        placeholder="https://instagram.com/_picsapro"
                      />
                      <EditableField
                        label="LinkedIn URL"
                        value={appConfigDraft.links.linkedinUrl}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            links: {
                              ...current.links,
                              linkedinUrl: value,
                            },
                          }))
                        }
                        placeholder="https://linkedin.com/in/picsa-pro"
                      />
                      <EditableField
                        label="Twitter/X URL"
                        value={appConfigDraft.links.twitterUrl}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            links: {
                              ...current.links,
                              twitterUrl: value,
                            },
                          }))
                        }
                        placeholder="https://twitter.com/picsapro"
                      />
                      <EditableField
                        label="Support email"
                        value={appConfigDraft.links.supportEmail}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            links: {
                              ...current.links,
                              supportEmail: value,
                            },
                          }))
                        }
                        placeholder="support@picsa.pro"
                      />
                      <EditableField
                        label="Support phone"
                        value={appConfigDraft.links.supportPhone}
                        onChange={(value) =>
                          updateDraft((current) => ({
                            ...current,
                            links: {
                              ...current.links,
                              supportPhone: value,
                            },
                          }))
                        }
                        placeholder="+254700000000"
                      />
                    </div>
                  </EditableSectionCard>
                </>
              ) : null}
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
                <ActionInfoCard
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
                <ActionInfoCard
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
