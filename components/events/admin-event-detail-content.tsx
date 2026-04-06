import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AdminEventDetail } from '@/lib/admin-events-api'
import {
  formatEventDateTime,
  formatEventJoinMode,
  getEventHostDisplayName,
  getEventHostInitials,
} from '@/lib/admin-events-format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/common/status-badge'
import {
  CalendarIcon,
  CameraIcon,
  CheckIcon,
  Clock3Icon,
  GlobeIcon,
  LockIcon,
  MailPlusIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  UserCheckIcon,
  UsersIcon,
  XIcon,
} from '@/components/ui/icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const DONUT_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#94a3b8']

function pct(value: number, total: number) {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

function capacityColor(ratio: number) {
  if (ratio >= 0.9) return 'text-rose-600 dark:text-rose-400'
  if (ratio >= 0.7) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function progressColor(ratio: number) {
  if (ratio >= 0.9) return '[&>[data-slot=progress-indicator]]:bg-rose-500'
  if (ratio >= 0.7) return '[&>[data-slot=progress-indicator]]:bg-amber-500'
  return '[&>[data-slot=progress-indicator]]:bg-emerald-500'
}

export function AdminEventDetailContent({ event }: { event: AdminEventDetail }) {
  const memberTotal = event.counts.activeMembersCount + event.counts.pendingMembersCount
  const guestCapacityRatio = event.maxGuests > 0 ? memberTotal / event.maxGuests : 0
  const imageCapacityRatio = event.maxImages > 0 ? event.counts.imageCount / event.maxImages : 0

  const memberDonutData = useMemo(
    () => [
      { name: 'Active', value: event.counts.activeMembersCount, color: DONUT_COLORS[0] },
      { name: 'Pending', value: event.counts.pendingMembersCount, color: DONUT_COLORS[1] },
    ],
    [event.counts.activeMembersCount, event.counts.pendingMembersCount],
  )

  const invitationDonutData = useMemo(
    () => {
      const used = event.counts.invitationCount - event.counts.activeInvitationCount
      return [
        { name: 'Active', value: event.counts.activeInvitationCount, color: DONUT_COLORS[2] },
        { name: 'Used / expired', value: used > 0 ? used : 0, color: DONUT_COLORS[3] },
      ]
    },
    [event.counts.invitationCount, event.counts.activeInvitationCount],
  )

  const mediaBarData = useMemo(
    () => [
      { name: 'Images', current: event.counts.imageCount, max: event.maxImages },
      { name: 'Pending mod.', current: event.counts.pendingImageModerationCount, max: event.counts.imageCount || 1 },
      { name: 'Chat msgs', current: event.chat.messageCount, max: event.chat.messageCount || 1 },
    ],
    [event.counts.imageCount, event.counts.pendingImageModerationCount, event.maxImages, event.chat.messageCount],
  )

  const settingsRows: Array<{ label: string; enabled: boolean; icon: typeof CheckIcon }> = [
    { label: 'Guests can invite others', enabled: event.settings.allowGuestsToInvite, icon: event.settings.allowGuestsToInvite ? CheckIcon : XIcon },
    { label: 'Guest chat', enabled: event.settings.allowGuestsChat, icon: event.settings.allowGuestsChat ? CheckIcon : XIcon },
    { label: 'Gallery upload', enabled: event.settings.allowGalleryUpload, icon: event.settings.allowGalleryUpload ? CheckIcon : XIcon },
    { label: 'Image sharing', enabled: event.settings.allowImagesToBeShared, icon: event.settings.allowImagesToBeShared ? CheckIcon : XIcon },
    { label: 'Content moderation', enabled: event.settings.moderateContent, icon: event.settings.moderateContent ? ShieldCheckIcon : ShieldOffIcon },
  ]

  return (
    <div className="mt-6 space-y-6">
      {/* ── Hero badges ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={event.status.toLowerCase()} />
        <Badge variant="outline" className="gap-1">
          {event.isPrivate ? <LockIcon className="h-3.5 w-3.5" /> : <GlobeIcon className="h-3.5 w-3.5" />}
          {event.isPrivate ? 'Private' : 'Public'}
        </Badge>
        <Badge variant="outline">{formatEventJoinMode(event.joinMode)}</Badge>
        <Badge variant="secondary">/{event.url}</Badge>
      </div>

      {event.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      )}

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<UsersIcon className="h-4 w-4" />} label="Members" value={event.memberCount} />
        <MetricCard icon={<CameraIcon className="h-4 w-4" />} label="Images" value={event.counts.imageCount} />
        <MetricCard icon={<MessageSquareIcon className="h-4 w-4" />} label="Chat messages" value={event.chat.messageCount} />
        <MetricCard icon={<MailPlusIcon className="h-4 w-4" />} label="Invitations" value={event.counts.invitationCount} />
      </div>

      {/* ── Capacity gauges ─────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Guest capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className={cn('text-2xl font-semibold tabular-nums', capacityColor(guestCapacityRatio))}>
                {memberTotal.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">/ {event.maxGuests.toLocaleString()}</span>
            </div>
            <Progress value={pct(memberTotal, event.maxGuests)} className={progressColor(guestCapacityRatio)} />
            <p className="text-xs text-muted-foreground">{pct(memberTotal, event.maxGuests)}% used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Image capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className={cn('text-2xl font-semibold tabular-nums', capacityColor(imageCapacityRatio))}>
                {event.counts.imageCount.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">/ {event.maxImages.toLocaleString()}</span>
            </div>
            <Progress value={pct(event.counts.imageCount, event.maxImages)} className={progressColor(imageCapacityRatio)} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{pct(event.counts.imageCount, event.maxImages)}% used</span>
              {event.counts.pendingImageModerationCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {event.counts.pendingImageModerationCount} pending moderation
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Membership & invitations charts ─────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Membership breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-[140px] w-[140px] shrink-0">
                {memberTotal > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={memberDonutData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {memberDonutData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid var(--border)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No members</div>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <LegendRow color={DONUT_COLORS[0]} label="Active" value={event.counts.activeMembersCount} />
                <LegendRow color={DONUT_COLORS[1]} label="Pending" value={event.counts.pendingMembersCount} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invitation breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-[140px] w-[140px] shrink-0">
                {event.counts.invitationCount > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={invitationDonutData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {invitationDonutData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid var(--border)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No invitations</div>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <LegendRow color={DONUT_COLORS[2]} label="Active" value={event.counts.activeInvitationCount} />
                <LegendRow
                  color={DONUT_COLORS[3]}
                  label="Used / expired"
                  value={Math.max(0, event.counts.invitationCount - event.counts.activeInvitationCount)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Media bar chart ─────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Media &amp; activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mediaBarData} layout="vertical" barCategoryGap="24%">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar dataKey="current" radius={[0, 6, 6, 0]} fill="#6366f1" barSize={20} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid var(--border)' }}
                  formatter={(value: number) => [value.toLocaleString(), 'Count']}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Host + timeline ─────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Host</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={event.host.url ?? undefined} />
                <AvatarFallback className="text-sm">{getEventHostInitials(event)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{getEventHostDisplayName(event)}</p>
                <p className="text-sm text-muted-foreground">{event.host.email ?? 'No email'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow className="border-border/60">
                  <TableCell className="w-8 py-2 pl-0"><CalendarIcon className="h-4 w-4 text-muted-foreground" /></TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">Created</TableCell>
                  <TableCell className="py-2 text-right text-sm font-medium">{formatEventDateTime(event.createdAt)}</TableCell>
                </TableRow>
                <TableRow className="border-border/60">
                  <TableCell className="w-8 py-2 pl-0"><Clock3Icon className="h-4 w-4 text-muted-foreground" /></TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">Updated</TableCell>
                  <TableCell className="py-2 text-right text-sm font-medium">{formatEventDateTime(event.updatedAt)}</TableCell>
                </TableRow>
                <TableRow className="border-border/60">
                  <TableCell className="w-8 py-2 pl-0"><CalendarIcon className="h-4 w-4 text-muted-foreground" /></TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">Starts</TableCell>
                  <TableCell className="py-2 text-right text-sm font-medium">{formatEventDateTime(event.startAt)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="w-8 py-2 pl-0"><CalendarIcon className="h-4 w-4 text-muted-foreground" /></TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">Ends</TableCell>
                  <TableCell className="py-2 text-right text-sm font-medium">{formatEventDateTime(event.endAt)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── Settings + chat ─────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <SettingsIcon className="h-4 w-4" /> Event settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/70">
                  <TableHead className="w-8" />
                  <TableHead>Setting</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settingsRows.map((row) => {
                  const Icon = row.icon
                  return (
                    <TableRow key={row.label} className="border-border/60">
                      <TableCell className="w-8 py-2.5 pl-0">
                        <Icon className={cn('h-4 w-4', row.enabled ? 'text-emerald-500' : 'text-muted-foreground/60')} />
                      </TableCell>
                      <TableCell className="py-2.5 text-sm">{row.label}</TableCell>
                      <TableCell className="py-2.5 text-right">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'rounded-full text-xs',
                            row.enabled
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {row.enabled ? 'On' : 'Off'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MessageSquareIcon className="h-4 w-4" /> Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Room exists</span>
              <Badge
                variant="secondary"
                className={cn(
                  'rounded-full text-xs',
                  event.chat.roomExists
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {event.chat.roomExists ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Messages</span>
              <span className="text-sm font-medium tabular-nums">{event.chat.messageCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last message</span>
              <span className="text-sm font-medium">{formatEventDateTime(event.chat.lastMessageAt)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Message content is intentionally not exposed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium tabular-nums">{value.toLocaleString()}</span>
    </div>
  )
}
