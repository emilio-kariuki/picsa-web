type AppleAppSiteAssociation = {
  applinks: {
    details: Array<{
      appIDs: string[];
      components: Array<{
        '/'?: string;
        '#'?: string;
        exclude?: boolean;
        comment?: string;
      }>;
    }>;
  };
  appclips: {
    apps: string[];
  };
}

type AssetLinks = Array<{
  relation: string[];
  target: {
    namespace: 'android_app';
    package_name: string;
    sha256_cert_fingerprints: string[];
  };
}>

const DEFAULT_APPLE_TEAM_ID = 'RLHUQBL2FQ'
export const APP_STORE_ID = '6825893560'
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`
const DEFAULT_IOS_BUNDLE_ID = 'com.emiliokariuki.picsa'
const DEFAULT_IOS_APP_CLIP_BUNDLE_ID = 'com.emiliokariuki.picsa.camera'
const DEFAULT_ANDROID_PACKAGE_NAME = 'com.ecoville.picsa'
const DEFAULT_ANDROID_SHA256_CERT_FINGERPRINTS = [
  '2B:79:7E:06:EE:D7:1F:BD:85:75:04:5F:48:C3:82:19:2D:E8:B6:B3:31:1E:5B:71:72:1C:80:DA:54:9C:2D:14',
]
const UNIVERSAL_LINK_PATHS = ['/join/*', '/event/*', '/events/*', '/camera/*']

function readEnvValue(key: string, fallback: string) {
  const value = typeof process === 'undefined' ? undefined : process.env[key]?.trim()
  return value && value.length > 0 ? value : fallback
}

function readEnvList(key: string, fallback: string[]) {
  const value = (typeof process === 'undefined' ? undefined : process.env[key])
    ?.split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  return value && value.length > 0 ? value : fallback
}

const appleTeamId = readEnvValue('APP_LINKS_APPLE_TEAM_ID', DEFAULT_APPLE_TEAM_ID)
const iosBundleId = readEnvValue('APP_LINKS_IOS_BUNDLE_ID', DEFAULT_IOS_BUNDLE_ID)
const iosAppClipBundleId = readEnvValue(
  'APP_LINKS_IOS_APP_CLIP_BUNDLE_ID',
  DEFAULT_IOS_APP_CLIP_BUNDLE_ID,
)
const androidPackageName = readEnvValue(
  'APP_LINKS_ANDROID_PACKAGE_NAME',
  DEFAULT_ANDROID_PACKAGE_NAME,
)
const androidSha256CertFingerprints = readEnvList(
  'APP_LINKS_ANDROID_SHA256_CERT_FINGERPRINTS',
  DEFAULT_ANDROID_SHA256_CERT_FINGERPRINTS,
)

export function getAppleAppSiteAssociation(): AppleAppSiteAssociation {
  const mainAppId = `${appleTeamId}.${iosBundleId}`

  return {
    applinks: {
      details: [
        {
          appIDs: Array.from(new Set([mainAppId, '4Q267QMF86.com.ecoville.picsa'])),
          components: [
            { '#': 'no_universal_links', exclude: true, comment: 'Exclude URLs with no_universal_links fragment' },
            ...UNIVERSAL_LINK_PATHS.map((path) => ({
              '/': path,
              comment: `Matches ${path}`,
            })),
          ],
        },
      ],
    },
    appclips: {
      apps: Array.from(new Set([
        `${appleTeamId}.${iosAppClipBundleId}`,
        '4Q267QMF86.com.ecoville.picsa.camera',
      ])),
    },
  }
}

export function getAssetLinks(): AssetLinks {
  const packageNames = Array.from(
    new Set([androidPackageName, `${androidPackageName}.camera`]),
  )

  return packageNames.map((packageName) => ({
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: androidSha256CertFingerprints,
    },
  }))
}

export function buildJoinDeepLink(eventId: string) {
  return `customscheme://join/${encodeURIComponent(eventId)}`
}

export function buildEventDeepLink(eventId: string) {
  return `customscheme://event/${encodeURIComponent(eventId)}`
}

export function buildAppClipBanner(appArgument?: string) {
  return [
    `app-id=${APP_STORE_ID}`,
    `app-clip-bundle-id=${iosAppClipBundleId}`,
    ...(appArgument ? ['app-clip-display=card', `app-argument=${appArgument}`] : []),
  ].join(', ')
}
