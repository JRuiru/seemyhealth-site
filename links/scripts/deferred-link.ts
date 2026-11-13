// Deferred deep links (cmh-golang Docs/deferred-links-plan.md): somebody without the app taps a shared
// link, installs from this page, opens the app, and lands on what was shared. Exact matching only:
// nothing about the device leaves the phone, and no third party is told anything.
//
//   Google Play   the Play button carries &referrer=link%3D<the link>, which Play hands to the app
//                 once, on first launch (the Play Install Referrer API). Not for an invitation (/i/):
//                 its link carries the invitation's token, and Google reads the referrer, so the
//                 Worker swaps it for a single-use code (<html data-deferred-link="handoff"
//                 data-handoff="<code>">) and the referrer is handoff=<code>, which the app redeems
//                 with the backend. No code, no referrer: an /i/ link never goes to Google.
//   App Store     a tap on the App Store button copies the link to the clipboard (the visitor's own
//                 tap, the only time a page may write it), and the app offers to paste it back with
//                 a UIPasteControl, so iOS never asks "Allow Paste?". The whole link, /i/ included:
//                 the clipboard stays on the phone.
//
// Only on a page the Worker marked <html data-deferred-link> (a real link path, not /get-the-app, a
// 404 or the payment return). The link is read from the address bar at run time and never written
// into the page the Worker serves, so an /i/ token is still only in og:url.

// The Play listing's URL with the link as its install referrer. A listing that isn't filled in yet
// ("#", or anything not Google Play's) is left as it is.
export function playUrlWithReferrer(playHref: string, link: string): string {
  let url: URL;
  try { url = new URL(playHref); } catch { return playHref; }
  if (url.protocol !== 'https:' || url.hostname !== 'play.google.com') return playHref;
  url.searchParams.set('referrer', `link=${encodeURIComponent(link)}`);
  return url.toString();
}

// The Play listing's URL with a handoff code as its install referrer (an /i/ page).
export function playUrlWithHandoff(playHref: string, code: string): string {
  if (!/^[A-Za-z0-9_-]{24}$/.test(code)) return playHref;
  let url: URL;
  try { url = new URL(playHref); } catch { return playHref; }
  if (url.protocol !== 'https:' || url.hostname !== 'play.google.com') return playHref;
  url.searchParams.set('referrer', `handoff=${code}`);
  return url.toString();
}

// What the Play button becomes on a page: the link as its referrer, or for an /i/ page (marked
// "handoff", or any /i/ address whatever the mark says) the code, or nothing at all.
export function playHrefFor(playHref: string, link: string, mark: string | null, code: string | null): string {
  const invite = mark === 'handoff' || new URL(link).pathname.startsWith('/i/');
  if (!invite) return playUrlWithReferrer(playHref, link);
  return code ? playUrlWithHandoff(playHref, code) : playHref;
}

// The page's own link, without a fragment.
export function currentLink(href: string): string {
  const url = new URL(href);
  url.hash = '';
  return url.toString();
}

export function startDeferredLinks(): void {
  const root = document.documentElement;
  if (!root.hasAttribute('data-deferred-link')) return;
  const link = currentLink(location.href);
  const mark = root.getAttribute('data-deferred-link');
  const code = root.getAttribute('data-handoff');

  for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-store="android"]')) {
    a.href = playHrefFor(a.href, link, mark, code);
  }

  for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-store="ios"]')) {
    a.addEventListener('click', (event) => {
      const href = a.getAttribute('href') ?? '';
      if (!href.startsWith('https://')) return; // no listing yet: nothing to go to
      const write = navigator.clipboard?.writeText?.(link);
      if (!write) return; // no clipboard API: the App Store all the same
      event.preventDefault();
      let gone = false;
      const go = () => { if (!gone) { gone = true; location.href = href; } };
      // Called inside the tap, as Safari requires; a refusal is silent, and a hung promise never
      // keeps the visitor from the store.
      write.then(go, go);
      setTimeout(go, 800);
    });
  }
}
