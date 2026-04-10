const isDevelopment = import.meta.env.MODE === 'development'
const localWebPort = import.meta.env.VITE_LOCAL_WEB_PORT?.trim() || '3002'

const BASE_URL = isDevelopment
  ? `http://localhost:${localWebPort}`
  : 'https://picsa.pro'

export const MARKETING_APP_URL = BASE_URL
export const ADMIN_APP_URL = BASE_URL
export const CLIENT_APP_URL = BASE_URL

export const ADMIN_LOGIN_PATH = '/admin/login'
export const CLIENT_LOGIN_PATH = '/app/login'
export const CLIENT_CREATE_EVENT_PATH = `${CLIENT_LOGIN_PATH}?next=${encodeURIComponent('/app/events/new')}`

export const ADMIN_LOGIN_URL = `${ADMIN_APP_URL}${ADMIN_LOGIN_PATH}`
export const CLIENT_LOGIN_URL = `${CLIENT_APP_URL}${CLIENT_LOGIN_PATH}`
export const CLIENT_CREATE_EVENT_URL = `${CLIENT_APP_URL}${CLIENT_CREATE_EVENT_PATH}`

export function buildClientEventUrl(eventId: string) {
  return `${CLIENT_APP_URL}/app/events/${eventId}`
}
