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
const DEFAULT_ANDROID_PACKAGE_NAME = 'com.emiliokariuki.picsa'
const DEFAULT_ANDROID_SHA256_CERT_FINGERPRINTS = [
  'E3:6C:88:BE:B0:D4:81:0F:44:97:44:AB:AB:5B:3F:18:E0:D9:60:C6:D3:23:1F:BC:46:DF:1B:9F:AD:87:FC:C1',
  'BD:06:72:96:E2:99:5F:7F:20:39:C4:BE:C9:B2:0B:08:75:6C:F7:38:CC:FB:27:B6:CF:B8:8A:BC:58:DB:C3:95',
  '6F:3F:22:42:75:65:90:23:D4:77:F2:06:9C:07:34:97:AD:47:F3:3F:E6:EC:88:19:71:F4:2D:57:24:D6:65:86',
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
  const fingerprintsByPackage = {
    [androidPackageName]: androidSha256CertFingerprints,
    'com.ecoville.picsa': [
      '25:99:CD:49:28:91:21:D7:51:87:E7:D8:62:E2:22:39:C7:4A:BA:3C:51:D7:D2:69:C4:0C:DA:F8:43:F3:B0:50',
      '2B:79:7E:06:EE:D7:1F:BD:85:75:04:5F:48:C3:82:19:2D:E8:B6:B3:31:1E:5B:71:72:1C:80:DA:54:9C:2D:14',
    ],
    'com.ecoville.picsa.camera': [
      '2B:79:7E:06:EE:D7:1F:BD:85:75:04:5F:48:C3:82:19:2D:E8:B6:B3:31:1E:5B:71:72:1C:80:DA:54:9C:2D:14',
    ],
  }

  return Object.entries(fingerprintsByPackage).map(([packageName, fingerprints]) => ({
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: fingerprints,
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
