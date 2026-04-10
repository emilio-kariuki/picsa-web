export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
} as const

export const ORDER_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
} as const

export const PAYMENT_STATUS_LABELS = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
} as const

export const PAYMENT_STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
} as const

export const USER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
} as const

export const USER_STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-amber-100 text-amber-800',
} as const

export const PRODUCT_STATUS_LABELS = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
} as const

export const PRODUCT_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-amber-100 text-amber-800',
} as const

export const TICKET_PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
} as const

export const TICKET_PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-800',
} as const

export const TICKET_STATUS_LABELS = {
  open: 'Open',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
} as const

export const TICKET_STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-amber-100 text-amber-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-gray-100 text-gray-800',
} as const

export const NOTIFICATION_TYPE_COLORS = {
  alert: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
} as const

export const INVOICE_STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  overdue: 'bg-red-100 text-red-800',
} as const

export const MODULES = [
  'Dashboard',
  'Users',
  'Roles',
  'Orders',
  'Products',
  'Analytics',
  'Notifications',
  'Tickets',
  'Settings',
  'Audit Log',
] as const

export const ACTIONS = ['create', 'read', 'update', 'delete'] as const

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Health & Beauty',
  'Toys & Games',
  'Automotive',
] as const
