// User types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: Role
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  lastLogin?: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  usersCount: number
}

export interface Permission {
  id: string
  name: string
  module: string
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

// Analytics types
export interface AnalyticsData {
  date: string
  pageViews: number
  uniqueVisitors: number
  sessions: number
  bounceRate: number
  avgSessionDuration: number
}

export interface ConversionData {
  stage: string
  count: number
  percentage: number
}

export interface TrafficSource {
  source: string
  visitors: number
  percentage: number
}

// Notification types
export interface Notification {
  id: string
  type: 'alert' | 'info' | 'success' | 'warning'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

// Ticket types
export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  customer: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  assignedTo?: {
    id: string
    name: string
    avatar?: string
  }
  comments: TicketComment[]
  createdAt: string
  updatedAt: string
}

export interface TicketComment {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
    isStaff: boolean
  }
  content: string
  createdAt: string
}

// Settings types
export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  status: 'active' | 'pending'
  joinedAt: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  lastUsed?: string
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  date: string
  pdfUrl?: string
}

// RevenueCat Payment types
export interface RCSubscription {
  id: string
  subscriberId: string
  subscriberName: string
  subscriberEmail: string
  subscriberAvatar?: string
  productId: string
  productName: string
  store: 'app_store' | 'play_store' | 'stripe' | 'promotional'
  status: 'active' | 'expired' | 'grace_period' | 'cancelled' | 'paused' | 'trial'
  periodType: 'monthly' | 'annual' | 'weekly' | 'lifetime'
  price: number
  currency: string
  startedAt: string
  renewsAt?: string
  expiresAt?: string
  isTrial: boolean
  isAutoRenew: boolean
}

export interface RCTransaction {
  id: string
  transactionId: string
  subscriberId: string
  subscriberName: string
  subscriberEmail: string
  subscriberAvatar?: string
  productId: string
  productName: string
  store: 'app_store' | 'play_store' | 'stripe' | 'promotional'
  type: 'initial_purchase' | 'renewal' | 'product_change' | 'cancellation' | 'refund'
  amount: number
  currency: string
  revenueNet: number
  createdAt: string
}

export interface RCOverview {
  mrr: number
  mrrChange: number
  arr: number
  arrChange: number
  activeSubscriptions: number
  activeSubscriptionsChange: number
  trials: number
  trialsChange: number
  churnRate: number
  churnRateChange: number
  ltv: number
}

// Audit Log types
export interface AuditLogEntry {
  id: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  action: string
  resource: string
  resourceId: string
  details: string
  ipAddress: string
  timestamp: string
}

// Dashboard KPI types
export interface KPIData {
  label: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon?: string
}

// Activity types
export interface Activity {
  id: string
  user: {
    name: string
    avatar?: string
  }
  action: string
  target: string
  timestamp: string
}

// Event types
export interface Event {
  id: string
  title: string
  description: string
  coverImage?: string
  category: string
  status: 'draft' | 'upcoming' | 'live' | 'completed' | 'cancelled'
  organizer: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  venue: {
    name: string
    address: string
    city: string
    country: string
  }
  date: string
  time: string
  timezone: string
  capacity: number
  registrations: number
  ticketsSold: number
  checkInCount: number
  createdAt: string
  updatedAt: string
}

export interface EventAttendee {
  id: string
  eventId: string
  name: string
  email: string
  avatar?: string
  ticketType: string
  registrationDate: string
  paymentStatus: 'paid' | 'pending' | 'failed'
  checkInStatus: 'checked-in' | 'not-checked-in'
  checkInTime?: string
}

export interface EventActivity {
  id: string
  eventId: string
  user: {
    name: string
    avatar?: string
  }
  action: string
  timestamp: string
}

// Media/Image types
export interface MediaAsset {
  id: string
  filename: string
  originalName: string
  url: string
  type: 'image' | 'video' | 'document'
  mimeType: string
  size: number
  dimensions?: {
    width: number
    height: number
  }
  alt?: string
  caption?: string
  tags: string[]
  album?: string
  isFeatured: boolean
  usageCount: number
  usedIn: {
    type: 'event' | 'page' | 'product'
    id: string
    title: string
  }[]
  uploadedBy: {
    id: string
    name: string
    avatar?: string
  }
  uploadedAt: string
  updatedAt?: string
}

export interface MediaAlbum {
  id: string
  name: string
  description?: string
  imageCount: number
  createdAt: string
}
