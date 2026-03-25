'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { ClientEvent, ClientEventInput, ClientEventSettings, EventJoinMode } from '@/lib/client-types'

const defaultSettings: ClientEventSettings = {
  isPrivate: false,
  joinMode: 'OPEN',
  allowGuestsToInvite: true,
  allowGuestsChat: true,
  allowGalleryUpload: true,
  allowImagesToBeShared: true,
  moderateContent: true,
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

export function ClientEventForm({
  initialEvent,
  submitLabel,
  onSubmit,
  isSubmitting,
}: {
  initialEvent?: ClientEvent | null
  submitLabel: string
  onSubmit: (input: ClientEventInput) => Promise<void>
  isSubmitting?: boolean
}) {
  const initialSettings = useMemo(
    () => ({
      ...defaultSettings,
      ...(initialEvent?.settings ?? {}),
    }),
    [initialEvent],
  )

  const [name, setName] = useState(initialEvent?.name ?? '')
  const [description, setDescription] = useState(initialEvent?.description ?? '')
  const [maxGuests, setMaxGuests] = useState(initialEvent?.maxGuests ? String(initialEvent.maxGuests) : '')
  const [maxImages, setMaxImages] = useState(initialEvent?.maxImages ? String(initialEvent.maxImages) : '')
  const [startAt, setStartAt] = useState(toInputDateTimeValue(initialEvent?.startAt))
  const [endAt, setEndAt] = useState(toInputDateTimeValue(initialEvent?.endAt))
  const [settings, setSettings] = useState<ClientEventSettings>(initialSettings)

  useEffect(() => {
    setName(initialEvent?.name ?? '')
    setDescription(initialEvent?.description ?? '')
    setMaxGuests(initialEvent?.maxGuests ? String(initialEvent.maxGuests) : '')
    setMaxImages(initialEvent?.maxImages ? String(initialEvent.maxImages) : '')
    setStartAt(toInputDateTimeValue(initialEvent?.startAt))
    setEndAt(toInputDateTimeValue(initialEvent?.endAt))
    setSettings({
      ...defaultSettings,
      ...(initialEvent?.settings ?? {}),
    })
  }, [initialEvent])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      maxGuests: maxGuests.trim() ? Number(maxGuests) : undefined,
      maxImages: maxImages.trim() ? Number(maxImages) : undefined,
      startAt: toIsoOrNull(startAt),
      endAt: toIsoOrNull(endAt),
      settings,
    })
  }

  function updateSetting<Key extends keyof ClientEventSettings>(key: Key, value: ClientEventSettings[Key]) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
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
          <Label htmlFor="max-guests">Guest limit</Label>
          <Input
            id="max-guests"
            type="number"
            inputMode="numeric"
            min={1}
            value={maxGuests}
            onChange={(event) => setMaxGuests(event.target.value)}
            placeholder="50"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-images">Image limit</Label>
          <Input
            id="max-images"
            type="number"
            inputMode="numeric"
            min={1}
            value={maxImages}
            onChange={(event) => setMaxImages(event.target.value)}
            placeholder="200"
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

      <div className="rounded-[1.5rem] border border-border/70 bg-secondary/60 p-5">
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

          <div className="space-y-4 lg:col-span-2">
            {[
              {
                key: 'isPrivate',
                label: 'Private event',
                description: 'Hide the event from open discovery and keep access intentional.',
              },
              {
                key: 'allowGuestsToInvite',
                label: 'Guests can invite',
                description: 'Let trusted attendees bring in more people without asking you every time.',
              },
              {
                key: 'allowGuestsChat',
                label: 'Guests can chat',
                description: 'Keep everyone talking inside the event instead of splintering into side threads.',
              },
              {
                key: 'allowGalleryUpload',
                label: 'Guests can upload',
                description: 'Open the gallery so attendees can add their own images.',
              },
              {
                key: 'allowImagesToBeShared',
                label: 'Images can be shared',
                description: 'Allow guests to create share links for individual images.',
              },
              {
                key: 'moderateContent',
                label: 'Moderate uploads',
                description: 'Review images before they become visible in the gallery.',
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
                  onCheckedChange={(checked) =>
                    updateSetting(option.key as keyof ClientEventSettings, checked)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
