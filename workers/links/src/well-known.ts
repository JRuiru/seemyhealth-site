// The two association files the apps verify links.seemyhealth.ai with. Both are served 200,
// application/json, never redirected, and never anywhere but this host.

import { APPLE_APP_SITE_ASSOCIATION } from './generated/apple-app-site-association.ts';

export { APPLE_APP_SITE_ASSOCIATION };

// Android App Links. The dev app's upload-key fingerprint, in full (CMHAndroid's links README).
const DEV_APP = {
  relation: ['delegate_permission/common.handle_all_urls'],
  target: {
    namespace: 'android_app',
    package_name: 'ai.seemyhealth.app.dev',
    sha256_cert_fingerprints: [
      '96:F2:9A:52:78:30:39:B9:64:9B:D3:13:1B:BD:3C:29:E0:F5:09:64:A5:EA:74:9F:82:27:CA:61:C0:A7:46:78',
    ],
  },
};

// PRODUCTION: add ai.seemyhealth.app here once Google Play App Signing holds the release key. Its
// SHA-256 is in Play Console > Test and release > App integrity > App signing key certificate. Paste
// it whole (32 colon-separated bytes), never a shortened one, and set it as PROD_PLAY_SIGNING_SHA256
// below; until then the prod app claims nothing and nothing is listed for it. An entry listed with a
// wrong fingerprint would make Android refuse every link for that app.
const PROD_PLAY_SIGNING_SHA256 = '';

const PROD_APP = PROD_PLAY_SIGNING_SHA256
  ? [{
      relation: ['delegate_permission/common.handle_all_urls'],
      target: { namespace: 'android_app', package_name: 'ai.seemyhealth.app', sha256_cert_fingerprints: [PROD_PLAY_SIGNING_SHA256] },
    }]
  : [];

export const ASSET_LINKS = [DEV_APP, ...PROD_APP];
