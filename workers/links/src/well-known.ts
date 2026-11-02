// The two association files the apps verify links.seemyhealth.ai with. Both are served 200,
// application/json, never redirected, and never anywhere but this host.

import { APPLE_APP_SITE_ASSOCIATION } from './generated/apple-app-site-association.ts';

export { APPLE_APP_SITE_ASSOCIATION };

// Android App Links. A fingerprint is the certificate that signed the INSTALLED app, whole (32
// colon-separated bytes, never shortened): a wrong one makes Android refuse every link for that app.
//
// An app installed from Play is signed with Google's app signing key, not the upload key, so that is
// the one each app lists (Play Console > Test and release > App integrity > App signing key
// certificate, or the Play Developer API's generatedApks). The dev app also lists the debug key, so a
// build installed from Android Studio opens links too.
const DEV_PLAY_SIGNING_SHA256 = '30:5B:BB:15:76:E8:F1:69:7D:E4:82:C8:B5:02:67:32:86:83:CF:95:A7:CF:4C:A9:B0:B7:1E:4C:B1:58:B2:8D';
const DEV_DEBUG_SHA256 = '96:F2:9A:52:78:30:39:B9:64:9B:D3:13:1B:BD:3C:29:E0:F5:09:64:A5:EA:74:9F:82:27:CA:61:C0:A7:46:78';
const PROD_PLAY_SIGNING_SHA256 = '5B:37:4A:19:1D:C0:63:E9:04:59:83:0F:D2:BB:39:09:17:1B:E3:4D:98:D6:61:64:AE:55:A8:09:A7:66:E0:06';

const app = (packageName: string, fingerprints: string[]) => ({
  relation: ['delegate_permission/common.handle_all_urls'],
  target: { namespace: 'android_app', package_name: packageName, sha256_cert_fingerprints: fingerprints },
});

export const ASSET_LINKS = [
  app('ai.seemyhealth.app', [PROD_PLAY_SIGNING_SHA256]),
  app('ai.seemyhealth.app.dev', [DEV_PLAY_SIGNING_SHA256, DEV_DEBUG_SHA256]),
];
