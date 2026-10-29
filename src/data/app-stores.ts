// The app's store listings: the ONE place they live. Neither app is released yet, so both are
// empty, and every store button links to "#" as it always has. Filling a URL in here turns on every
// App Store or Google Play button: the site's (AppStoreButtons) and every links.seemyhealth.ai page
// (built from the same component), after the next build of each.
//
// Kept free of imports so the links Worker's build can read it too.
export const APP_STORE_URLS = {
  appStore: '',   // e.g. https://apps.apple.com/app/id0000000000
  googlePlay: '', // e.g. https://play.google.com/store/apps/details?id=ai.seemyhealth.app
};
