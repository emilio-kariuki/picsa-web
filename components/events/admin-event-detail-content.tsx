import type { AdminEventDetail } from '@/lib/admin-events-api'
import {
  formatEventDateTime,
  formatEventJoinMode,
  getEventHostDisplayName,
  getEventHostInitials,
} from '@/lib/admin-events-format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/common/status-badge'
import { GlobeIcon, LockIcon } from '@/components/ui/icons'

export function AdminEventDetailContent({ event }: { event: AdminEventDetail }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{event.name}</h3>
          <StatusBadge status={event.status.toLowerCase()} />
          <Badge variant="outline">{formatEventJoinMode(event.joinMode)}</Badge>
          <Badge variant="secondary" className="gap-1">
            {event.isPrivate ? <LockIcon className="h-3.5 w-3.5" /> : <GlobeIcon className="h-3.5 w-3.5" />}
            {event.isPrivate ? 'Private' : 'Public'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {event.description || 'No description provided'}
        </p>
        {/* <p className="text-xs text-muted-foreground">Event ID: {event.id}</p> */}
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            <AvatarImage src={event.host.url ?? undefined} />
            <AvatarFallback>{getEventHostInitials(event)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-medium">{getEventHostDisplayName(event)}</p>
            <p className="text-sm text-muted-foreground">{event.host.email ?? 'No email address'}</p>
            {/* <p className="text-xs text-muted-foreground">Host ID: {event.host.id}</p> */}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailMetric label="Created" value={formatEventDateTime(event.createdAt)} />
        <DetailMetric label="Updated" value={formatEventDateTime(event.updatedAt)} />
        <DetailMetric label="Starts" value={formatEventDateTime(event.startAt)} />
        <DetailMetric label="Ends" value={formatEventDateTime(event.endAt)} />
      </div>

      <Separator />

      <section className="space-y-3">
        <div>
          <h4 className="font-medium">Participation</h4>
          <p className="text-sm text-muted-foreground">
            Member, invitation, and moderation counts for this event.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailMetric label="Visible members" value={String(event.memberCount)} />
          <DetailMetric label="Active memberships" value={String(event.counts.activeMembersCount)} />
          <DetailMetric label="Pending memberships" value={String(event.counts.pendingMembersCount)} />
          <DetailMetric label="Total invitations" value={String(event.counts.invitationCount)} />
          <DetailMetric label="Active invitations" value={String(event.counts.activeInvitationCount)} />
          <DetailMetric label="Pending image moderation" value={String(event.counts.pendingImageModerationCount)} />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <div>
          <h4 className="font-medium">Capacity and media</h4>
          <p className="text-sm text-muted-foreground">
            Event limits and actual media usage at this moment.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailMetric label="Max guests" value={event.maxGuests.toLocaleString()} />
          <DetailMetric label="Max images" value={event.maxImages.toLocaleString()} />
          <DetailMetric label="Stored images" value={event.counts.imageCount.toLocaleString()} />
          <DetailMetric label="Chat messages" value={event.chat.messageCount.toLocaleString()} />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <div>
          <h4 className="font-medium">Settings</h4>
          <p className="text-sm text-muted-foreground">
            Current rules that shape how the event behaves for hosts and members.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FlagBadge label={event.settings.allowGuestsToInvite ? 'Guests can invite' : 'Guests cannot invite'} />
          <FlagBadge label={event.settings.allowGuestsChat ? 'Guest chat on' : 'Guest chat off'} />
          <FlagBadge label={event.settings.allowGalleryUpload ? 'Gallery upload on' : 'Gallery upload off'} />
          <FlagBadge label={event.settings.allowImagesToBeShared ? 'Image sharing on' : 'Image sharing off'} />
          <FlagBadge label={event.settings.moderateContent ? 'Moderation on' : 'Moderation off'} />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <div>
          <h4 className="font-medium">Chat summary</h4>
          <p className="text-sm text-muted-foreground">
            Metadata only. Message content is intentionally not exposed here.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailMetric label="Room exists" value={event.chat.roomExists ? 'Yes' : 'No'} />
          <DetailMetric label="Last message at" value={formatEventDateTime(event.chat.lastMessageAt)} />
        </div>
      </section>
    </div>
  )
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  )
}

function FlagBadge({ label }: { label: string }) {
  return (
    <Badge variant="secondary" className="rounded-full px-3 py-1">
      {label}
    </Badge>
  )
}
