const isDevelopment = process.env.NODE_ENV === 'development'
const localWebPort = process.env.NEXT_PUBLIC_LOCAL_WEB_PORT?.trim() || '3002'

function buildLocalUrl(hostname: string) {
  return `http://${hostname}:${localWebPort}`
}

export const MARKETING_APP_URL = isDevelopment
  ? buildLocalUrl('localhost')
  : 'https://picsa.pro'

export const ADMIN_APP_URL = isDevelopment
  ? buildLocalUrl('admin.localhost')
  : 'https://admin.picsa.pro'

export const CLIENT_APP_URL = isDevelopment
  ? buildLocalUrl('app.localhost')
  : 'https://app.picsa.pro'

export const ADMIN_LOGIN_PATH = '/login'
export const CLIENT_LOGIN_PATH = '/login'
export const CLIENT_CREATE_EVENT_PATH = `${CLIENT_LOGIN_PATH}?next=${encodeURIComponent('/events/new')}`

export const ADMIN_LOGIN_URL = `${ADMIN_APP_URL}${ADMIN_LOGIN_PATH}`
export const CLIENT_LOGIN_URL = `${CLIENT_APP_URL}${CLIENT_LOGIN_PATH}`
export const CLIENT_CREATE_EVENT_URL = `${CLIENT_APP_URL}${CLIENT_CREATE_EVENT_PATH}`

export function buildClientEventUrl(eventId: string) {
  return `${CLIENT_APP_URL}/events/${eventId}`
}
