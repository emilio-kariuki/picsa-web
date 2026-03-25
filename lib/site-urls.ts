const isDevelopment = process.env.NODE_ENV === 'development'

export const MARKETING_APP_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://picsa.pro'

export const ADMIN_APP_URL = isDevelopment
  ? 'http://admin.localhost:3000'
  : 'https://admin.picsa.pro'

export const ADMIN_LOGIN_URL = `${ADMIN_APP_URL}/login`
