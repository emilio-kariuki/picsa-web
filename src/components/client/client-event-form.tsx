import { useEffect, useMemo, useState } from 'react'
import { ImageIcon, ShieldCheckIcon, SparklesIcon, UsersIcon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type {
  ClientAppConfig,
  ClientEvent,
  ClientEventInput,
  ClientEventSettings,
  EventJoinMode,
} from '@/lib/client-types'

const defaultSettings: ClientEventSettings = {
  isPrivate: false,
  joinMode: 'OPEN',
  allowGuestsToInvite: true,
  allowGuestsChat: true,
  showChat: true,
  allowGalleryUpload: true,
  allowImagesToBeShared: false,
  moderateContent: true,
}

const fallbackFreeLimits = {
  guests: 10,
  images: 50,
}

const fallbackProLimits = {
  guests: 100,
  images: 2500,
}

function toInputDateTimeValue(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
}

function toIsoOrNull(value: string) {
  if (!value.trim()) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function readNumericInput(value: string) {
  if (!value.trim()) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function buildInitialDraft(initialEvent?: ClientEvent | null, initialInput?: ClientEventInput | null) {
  if (initialEvent) {
    return {
      name: initialEvent.name,
      description: initialEvent.description ?? '',
      maxGuests: initialEvent.maxGuests ? String(initialEvent.maxGuests) : '',
      maxImages: initialEvent.maxImages ? String(initialEvent.maxImages) : '',
      startAt: toInputDateTimeValue(initialEvent.startAt),
      endAt: toInputDateTimeValue(initialEvent.endAt),
      settings: {
        ...defaultSettings,
        ...(initialEvent.settings ?? {}),
      },
      unlockWithEventPass: initialEvent.billing.tier === 'PRO',
    }
  }

  return {
    name: initialInput?.name ?? '',
    description: initialInput?.description ?? '',
    maxGuests: initialInput?.maxGuests ? String(initialInput.maxGuests) : '',
    maxImages: initialInput?.maxImages ? String(initialInput.maxImages) : '',
    startAt: toInputDateTimeValue(initialInput?.startAt),
    endAt: toInputDateTimeValue(initialInput?.endAt),
    settings: {
      ...defaultSettings,
      ...(initialInput?.settings ?? {}),
    },
    unlockWithEventPass: initialInput?.unlockWithEventPass === true,
  }
}

export function ClientEventForm({
  appConfig,
  availablePassCount = 0,
  initialEvent,
  initialInput,
  isSubmitting,
  mode = initialEvent ? 'edit' : 'create',
  onSubmit,
  submitLabel,
}: {
  appConfig?: ClientAppConfig | null
  availablePassCount?: number
  initialEvent?: ClientEvent | null
  initialInput?: ClientEventInput | null
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
  onSubmit: (input: ClientEventInput) => Promise<void>
  submitLabel?: string
}) {
  const initialDraft = useMemo(
    () => buildInitialDraft(initialEvent, initialInput),
    [initialEvent, initialInput],
  )

  const [name, setName] = useState(initialDraft.name)
  const [description, setDescription] = useState(initialDraft.description)
  const [maxGuests, setMaxGuests] = useState(initialDraft.maxGuests)
  const [maxImages, setMaxImages] = useState(initialDraft.maxImages)
  const [startAt, setStartAt] = useState(initialDraft.startAt)
  const [endAt, setEndAt] = useState(initialDraft.endAt)
  const [settings, setSettings] = useState<ClientEventSettings>(initialDraft.settings)
  const [unlockWithEventPass, setUnlockWithEventPass] = useState(
    initialDraft.unlockWithEventPass,
  )

  useEffect(() => {
    setName(initialDraft.name)
    setDescription(initialDraft.description)
    setMaxGuests(initialDraft.maxGuests)
    setMaxImages(initialDraft.maxImages)
    setStartAt(initialDraft.startAt)
    setEndAt(initialDraft.endAt)
    setSettings(initialDraft.settings)
    setUnlockWithEventPass(initialDraft.unlockWithEventPass)
  }, [initialDraft])

  const isCreateMode = mode === 'create'
  const isProEvent = isCreateMode
    ? unlockWithEventPass
    : initialEvent?.billing.tier === 'PRO'

  const freeLimits = {
    guests: appConfig?.plan.freeEventMaxGuests ?? fallbackFreeLimits.guests,
    images: appConfig?.plan.freeEventMaxImages ?? fallbackFreeLimits.images,
  }
  const proLimits = {
    guests: appConfig?.plan.proEventMaxGuests ?? fallbackProLimits.guests,
    images: appConfig?.plan.proEventMaxImages ?? fallbackProLimits.images,
  }
  const activeLimits = isProEvent ? proLimits : freeLimits
  const canUseImageSharing = isProEvent

  const parsedMaxGuests = readNumericInput(maxGuests)
  const parsedMaxImages = readNumericInput(maxImages)

  const validationMessages = useMemo(() => {
    const nextMessages: string[] = []

    if (maxGuests.trim() && (!Number.isFinite(parsedMaxGuests) || (parsedMaxGuests ?? 0) < 1)) {
      nextMessages.push('Guest limit must be a whole number greater than zero.')
    } else if (parsedMaxGuests != null && parsedMaxGuests > activeLimits.guests) {
      nextMessages.push(
        `${isProEvent ? 'Pro' : 'Free'} events support up to ${activeLimits.guests} guests.`,
      )
    }

    if (maxImages.trim() && (!Number.isFinite(parsedMaxImages) || (parsedMaxImages ?? 0) < 1)) {
      nextMessages.push('Image limit must be a whole number greater than zero.')
    } else if (parsedMaxImages != null && parsedMaxImages > activeLimits.images) {
      nextMessages.push(
        `${isProEvent ? 'Pro' : 'Free'} events support up to ${activeLimits.images} uploads.`,
      )
    }

    return nextMessages
  }, [
    activeLimits.guests,
    activeLimits.images,
    isProEvent,
    maxGuests,
    maxImages,
    parsedMaxGuests,
    parsedMaxImages,
  ])

  const resolvedSubmitLabel =
    submitLabel ??
    (isCreateMode
      ? unlockWithEventPass
        ? availablePassCount > 0
          ? 'Create Pro event'
          : 'Continue to Pro checkout'
        : 'Create free event'
      : 'Save changes')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (validationMessages.length > 0) {
      return
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      maxGuests: maxGuests.trim() ? Number(maxGuests) : undefined,
      maxImages: maxImages.trim() ? Number(maxImages) : undefined,
      startAt: toIsoOrNull(startAt),
      endAt: toIsoOrNull(endAt),
      unlockWithEventPass: isCreateMode ? unlockWithEventPass : undefined,
      settings: {
        ...settings,
        allowImagesToBeShared: canUseImageSharing ? settings.allowImagesToBeShared : false,
      },
    })
  }

  function updateSetting<Key extends keyof ClientEventSettings>(key: Key, value: ClientEventSettings[Key]) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handlePlanToggle(checked: boolean) {
    setUnlockWithEventPass(checked)

    if (!checked) {
      setSettings((current) => ({
        ...current,
        allowImagesToBeShared: false,
      }))
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {isCreateMode ? (
        <div className="rounded-[1.75rem] border border-border/70 bg-secondary/45 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-accent/35 bg-accent/10 px-3 py-1 text-accent">
                  Event plan
                </Badge>
                {unlockWithEventPass ? (
                  <Badge className="rounded-full bg-primary text-primary-foreground">Pro selected</Badge>
                ) : null}
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight">
                  {unlockWithEventPass ? 'Build this event as Pro from the start' : 'Start free, upgrade only if you need more room'}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {unlockWithEventPass
                    ? 'Pro unlocks image sharing, up to 100 guests, and up to 2500 uploads. If you do not already have an event pass, checkout happens before the event is created.'
                    : `Free events cover up to ${freeLimits.guests} guests and ${freeLimits.images} uploads. You can still switch to Pro here if you need more room before launch.`}
                </p>
              </div>
            </div>
            <div className="flex min-w-55 flex-col items-start gap-3 rounded-[1.35rem] border border-border/70 bg-background/70 px-4 py-4">
              <div className="flex items-center gap-3">
                <Switch checked={unlockWithEventPass} onCheckedChange={handlePlanToggle} />
                <div>
                  <p className="text-sm font-semibold text-foreground">Make this event Pro</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">$12 per event pass</p>
                </div>
              </div>
              <div className="grid w-full gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-accent" />
                    Guest limit
                  </span>
                  <span className="font-medium text-foreground">
                    {unlockWithEventPass ? proLimits.guests : freeLimits.guests}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-accent" />
                    Upload limit
                  </span>
                  <span className="font-medium text-foreground">
                    {unlockWithEventPass ? proLimits.images : freeLimits.images}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-accent" />
                    Share links
                  </span>
                  <span className="font-medium text-foreground">
                    {unlockWithEventPass ? 'Enabled' : 'Pro only'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="event-name">Event name</Label>
          <Input
            id="event-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Summer picnic, wedding weekend, product launch..."
            required
            minLength={2}
            maxLength={140}
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="event-description">Description</Label>
          <Textarea
            id="event-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Set the tone for guests and explain what to expect."
            rows={5}
            maxLength={5000}
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="max-guests">Guest limit</Label>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {isProEvent ? 'Pro' : 'Free'} max {activeLimits.guests}
            </span>
          </div>
          <Input
            id="max-guests"
            type="number"
            inputMode="numeric"
            min={1}
            value={maxGuests}
            onChange={(event) => setMaxGuests(event.target.value)}
            placeholder={String(activeLimits.guests)}
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="max-images">Image limit</Label>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {isProEvent ? 'Pro' : 'Free'} max {activeLimits.images}
            </span>
          </div>
          <Input
            id="max-images"
            type="number"
            inputMode="numeric"
            min={1}
            value={maxImages}
            onChange={(event) => setMaxImages(event.target.value)}
            placeholder={String(activeLimits.images)}
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start-at">Starts</Label>
          <Input
            id="start-at"
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-at">Ends</Label>
          <Input
            id="end-at"
            type="datetime-local"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            className="rounded-2xl"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-secondary/60 p-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Event settings</p>
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Shape the guest experience</h2>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>Join mode</Label>
            <Select
              value={settings.joinMode}
              onValueChange={(value) => updateSetting('joinMode', value as EventJoinMode)}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Choose a join mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open join</SelectItem>
                <SelectItem value="APPROVAL_REQUIRED">Approval required</SelectItem>
                <SelectItem value="INVITE_ONLY">Invite only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-[1.25rem] border border-border/60 bg-background/70 px-4 py-4 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheckIcon className="h-4 w-4 text-accent" />
              Current plan guardrails
            </p>
            <p className="mt-2 leading-6">
              {isProEvent
                ? `You are creating a Pro event, so image sharing is available and the form will accept up to ${proLimits.guests} guests and ${proLimits.images} uploads.`
                : `This event is currently on the free tier, so image sharing stays off and the form will block anything above ${freeLimits.guests} guests or ${freeLimits.images} uploads.`}
            </p>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {[
              {
                key: 'isPrivate',
                label: 'Private event',
                description: 'Hide the event from open discovery and keep access intentional.',
                disabled: false,
              },
              {
                key: 'allowGuestsToInvite',
                label: 'Guests can invite',
                description: 'Let trusted attendees bring in more people without asking you every time.',
                disabled: false,
              },
              {
                key: 'allowGuestsChat',
                label: 'Guests can chat',
                description: 'Keep everyone talking inside the event instead of splintering into side threads.',
                disabled: false,
              },
              {
                key: 'showChat',
                label: 'Show chat',
                description: 'Display the chat section on the event details page. Turn off to hide it entirely.',
                disabled: false,
              },
              {
                key: 'allowGalleryUpload',
                label: 'Guests can upload',
                description: 'Open the gallery so attendees can add their own images.',
                disabled: false,
              },
              {
                key: 'allowImagesToBeShared',
                label: 'Images can be shared',
                description: canUseImageSharing
                  ? 'Allow guests to create share links for individual images.'
                  : 'Available only on Pro events.',
                disabled: !canUseImageSharing,
              },
              {
                key: 'moderateContent',
                label: 'Moderate uploads',
                description: 'Review images before they become visible in the gallery.',
                disabled: false,
              },
            ].map((option) => (
              <div
                key={option.key}
                className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-border/60 bg-background/70 px-4 py-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{option.label}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{option.description}</p>
                </div>
                <Switch
                  checked={Boolean(settings[option.key as keyof ClientEventSettings])}
                  disabled={option.disabled}
                  onCheckedChange={(checked) =>
                    updateSetting(option.key as keyof ClientEventSettings, checked)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {validationMessages.length ? (
        <div className="rounded-[1.35rem] border border-amber-300/70 bg-amber-500/10 px-4 py-4 text-sm text-amber-800 dark:text-amber-200">
          <ul className="space-y-1">
            {validationMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border/70 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          {isCreateMode
            ? unlockWithEventPass
              ? availablePassCount > 0
                ? 'You already have an unclaimed event pass, so this event can unlock Pro immediately.'
                : 'You will be taken to secure checkout before the Pro event is created.'
              : 'Start free now, then unlock Pro later if the event grows.'
            : isProEvent
              ? 'This event already has Pro unlocked.'
              : 'This event is still on the free tier.'}
        </p>
        <Button
          type="submit"
          disabled={isSubmitting || validationMessages.length > 0}
          className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {resolvedSubmitLabel}
        </Button>
      </div>
    </form>
  )
}
