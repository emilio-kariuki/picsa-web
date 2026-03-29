type AppleAppSiteAssociation = {
  applinks: {
    apps: [];
    details: Array<{
      appID: string;
      paths: string[];
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

const DEFAULT_APPLE_TEAM_ID = '4Q267QMF86'
const DEFAULT_IOS_BUNDLE_ID = 'com.ecoville.picsa'
const DEFAULT_IOS_APP_CLIP_BUNDLE_ID = 'com.ecoville.picsa.camera'
const DEFAULT_ANDROID_PACKAGE_NAME = 'com.ecoville.picsa'
const DEFAULT_ANDROID_SHA256_CERT_FINGERPRINTS = [
  '2B:79:7E:06:EE:D7:1F:BD:85:75:04:5F:48:C3:82:19:2D:E8:B6:B3:31:1E:5B:71:72:1C:80:DA:54:9C:2D:14',
]
const UNIVERSAL_LINK_PATHS = ['/join/*', '/event/*', '/events/*', '/camera/*', '/payments/*']

function readEnvValue(key: string, fallback: string) {
  const value = process.env[key]?.trim()
  return value && value.length > 0 ? value : fallback
}

function readEnvList(key: string, fallback: string[]) {
  const value = process.env[key]
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
  const appIds = [
    `${appleTeamId}.${iosBundleId}`,
    `${appleTeamId}.${iosAppClipBundleId}`,
  ]

  return {
    applinks: {
      apps: [],
      details: appIds.map((appID) => ({
        appID,
        paths: UNIVERSAL_LINK_PATHS,
      })),
    },
    appclips: {
      apps: [`${appleTeamId}.${iosAppClipBundleId}`],
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
