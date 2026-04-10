export function getOAuthClientId(...keys: string[]) {
  const env = import.meta.env

  for (const key of keys) {
    const value = (env[key] as string | undefined)?.trim()

    if (value) {
      return value
    }
  }

  return ''
}
