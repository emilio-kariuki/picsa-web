export type ClientUserRole = 'admin' | 'user'

export interface ClientAuthenticatedUser {
  id: string
  email: string | null
  name: string | null
  url: string | null
  pro: boolean
  active: boolean
  role: ClientUserRole
  emailVerifiedAt: string | null
  lastLoginAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface ClientAuthResponseData {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  user: ClientAuthenticatedUser
}

export interface ClientAuthSession {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  currentUser: ClientAuthenticatedUser
}

export type EventJoinMode = 'OPEN' | 'APPROVAL_REQUIRED' | 'INVITE_ONLY'
export type EventStatus = 'ACTIVE' | 'ARCHIVED'
export type EventViewerMembership = 'none' | 'pending' | 'active' | 'invited'
export type EventParticipantRole = 'host' | 'member'
export type EventMembershipStatus = 'PENDING' | 'ACTIVE' | 'LEFT' | 'REMOVED' | 'REJECTED'

export interface ClientEventSettings {
  isPrivate: boolean
  joinMode: EventJoinMode
  allowGuestsToInvite: boolean
  allowGuestsChat: boolean
  allowGalleryUpload: boolean
  allowImagesToBeShared: boolean
  moderateContent: boolean
}

export interface ClientEventHost {
  id: string
  email: string | null
  name: string | null
  url: string | null
}

export interface ClientEvent {
  id: string
  name: string
  description: string | null
  url: string
  displayPictureUrl: string | null
  maxGuests: number
  maxImages: number
  memberCount: number
  startAt: string | null
  endAt: string | null
  status: EventStatus
  createdAt: string
  updatedAt: string
  host: ClientEventHost
  settings: ClientEventSettings
  viewerMembership: EventViewerMembership
  viewerRole: EventParticipantRole | null
}

export interface ClientEventParticipant {
  role: EventParticipantRole
  joinedAt: string | null
  user: ClientAuthenticatedUser
}

export interface ClientEventJoinRequest {
  userId: string
  status: EventMembershipStatus
  requestedAt: string
  user: ClientAuthenticatedUser
}

export interface ClientEventInvitation {
  id: string
  email: string
  expiresAt: string
  createdAt: string
}

export interface ClientEventInput {
  name: string
  description?: string | null
  maxGuests?: number
  maxImages?: number
  startAt?: string | null
  endAt?: string | null
  settings?: Partial<ClientEventSettings>
}

export type ImageStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED' | 'DELETED'
export type ImageModerationStatus = 'APPROVED' | 'PENDING' | 'REJECTED'

export interface ClientImage {
  id: string
  eventId: string
  uploader: ClientAuthenticatedUser
  status: ImageStatus
  moderationStatus: ImageModerationStatus
  hd: boolean
  isPrivate: boolean
  width: number | null
  height: number | null
  contentType: string
  sizeBytes: number
  createdAt: string
  accessUrl: string | null
  accessUrlExpiresAt: string | null
  viewerCanDelete: boolean
  viewerCanApprove: boolean
  viewerCanReject: boolean
  viewerCanShare: boolean
}

export interface ClientImageBatchSummary {
  acceptedCount: number
  rejectedCount: number
}

export interface ClientImageBatchAccepted {
  originalFileName: string
  uploadSessionId: string
  imageId: string
  status: string
}

export interface ClientImageBatchRejected {
  originalFileName: string
  code: string
  message: string
}

export interface ClientImageBatchResult {
  accepted: ClientImageBatchAccepted[]
  rejected: ClientImageBatchRejected[]
  summary: ClientImageBatchSummary
}

export interface ClientImageShareLink {
  imageId: string
  shareUrl: string
  expiresAt: string
}

export type ClientNotificationType =
  | 'chat_message'
  | 'event_invitation'
  | 'event_join_approved'
  | 'event_join_rejected'
  | 'event_join_request'
  | 'system'

export interface ClientNotification {
  id: string
  userId: string
  type: ClientNotificationType
  title: string
  body: string
  data: Record<string, string>
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientNotificationPage {
  notifications: ClientNotification[]
  unreadCount: number
  nextCursor: string | null
}

export interface ClientUserConfig {
  pushNotificationsEnabled: boolean
  emailNotificationsEnabled: boolean
  vibrationsEnabled: boolean
  updatedAt: string
}

export interface ClientAppConfigPlan {
  freeEventMaxGuests: number
  proEventMaxGuests: number
  freeEventMaxImages: number
  proEventMaxImages: number
  allowFreeHdUploads: boolean
  allowFreePrivateImages: boolean
}

export interface ClientAppConfigUploads {
  imageBatchMaxFiles: number
}

export interface ClientAppConfigLinks {
  websiteUrl: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string
  instagramUrl: string
  linkedinUrl: string
  twitterUrl: string
  supportEmail: string | null
  supportPhone: string | null
}

export interface ClientAppConfigUpdates {
  iosRecommendedVersion: string | null
  iosMinimumSupportedVersion: string | null
  androidRecommendedVersion: string | null
  androidMinimumSupportedVersion: string | null
  iosStoreUrl: string | null
  androidStoreUrl: string | null
  title: string | null
  message: string | null
  releaseNotes: string | null
  remindAfterHours: number
}

export interface ClientAppConfig {
  version: string
  plan: ClientAppConfigPlan
  uploads: ClientAppConfigUploads
  links: ClientAppConfigLinks
  updates: ClientAppConfigUpdates
}
