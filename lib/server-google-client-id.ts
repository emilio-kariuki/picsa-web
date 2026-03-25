import fs from 'node:fs'
import path from 'node:path'

function readEnvValue(filePath: string, key: string) {
  if (!fs.existsSync(filePath)) {
    return ''
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const currentKey = trimmedLine.slice(0, separatorIndex).trim()

    if (currentKey !== key) {
      continue
    }

    return trimmedLine.slice(separatorIndex + 1).trim()
  }

  return ''
}

export function getServerGoogleClientId() {
  const configuredValue =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim()

  if (configuredValue) {
    return configuredValue
  }

  const workspaceRoot = process.cwd()
  const candidateFiles = [
    path.join(workspaceRoot, '.env.local'),
    path.join(workspaceRoot, '.env.development.local'),
    path.join(workspaceRoot, '.env.development'),
    path.join(workspaceRoot, '.env'),
    path.join(workspaceRoot, '../.env.local'),
    path.join(workspaceRoot, '../.env'),
    path.join(workspaceRoot, '../backend/.env.dev'),
    path.join(workspaceRoot, '../backend/.env'),
  ]

  for (const filePath of candidateFiles) {
    const nextPublicValue = readEnvValue(filePath, 'NEXT_PUBLIC_GOOGLE_CLIENT_ID')

    if (nextPublicValue) {
      return nextPublicValue
    }

    const googleClientId = readEnvValue(filePath, 'GOOGLE_CLIENT_ID')

    if (googleClientId) {
      return googleClientId
    }
  }

  return ''
}
