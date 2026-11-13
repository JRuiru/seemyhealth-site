// A public group's or public challenge's invite card, or a shared recipe's card, drawn in the Worker
// from a verified card key (card-key.ts). Imported lazily by the image route, so a page request never initialises the wasm.

import yogaWasm from 'yoga-wasm-web/dist/yoga.wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import { initRenderer, photoDataUri, renderCard, type CardFonts } from './render.ts';
import { countLine } from '../invite.ts';
import { CF_IMG, INVITE_COPY, LOGO, RECIPE_SHARE_COPY } from '../catalogue.ts';
import type { CardPayload } from './card-key.ts';

let fonts: Promise<CardFonts> | undefined;
let logo: Promise<string | undefined> | undefined;

const font = (assets: Fetcher, origin: string, name: string) =>
  assets.fetch(new Request(`${origin}/fonts/${name}.ttf`)).then((r) => {
    if (!r.ok) throw new Error('font');
    return r.arrayBuffer();
  });

const shorten = (s: string) => (s.length > 60 ? `${s.slice(0, 57).trimEnd()}...` : s);

// The renderer, the fonts and the logo, each loaded once per isolate (a failed load is retried).
async function ready(assets: Fetcher, origin: string): Promise<[CardFonts, string]> {
  await initRenderer(yogaWasm, resvgWasm);
  fonts ??= Promise.all(['oswald-300', 'oswald-500', 'inter-400', 'inter-600'].map((n) => font(assets, origin, n)))
    .then(([oswaldLight, oswaldMedium, interRegular, interSemibold]) => ({ oswaldLight, oswaldMedium, interRegular, interSemibold }))
    .catch((e) => { fonts = undefined; throw e; });
  logo ??= photoDataUri(LOGO).then((l) => { if (!l) logo = undefined; return l; });
  const [cardFonts, logoUri] = await Promise.all([fonts, logo]);
  if (!logoUri) throw new Error('logo');
  return [cardFonts, logoUri];
}

// The card's own picture, or the kind's art when it has none or it will not load.
const photoOr = (own: string | null, art: string | undefined) =>
  (own ? photoDataUri(own) : Promise.resolve(undefined)).then((p) => p ?? (art ? photoDataUri(`${CF_IMG}/${art}/public`) : undefined));

export async function renderDynamicCard(p: CardPayload, assets: Fetcher, origin: string): Promise<Uint8Array> {
  if (p.k === 'recipe') {
    // A shared recipe (/r/{code}): its own photo full-bleed, "Shared by <name>" over the recipe's name.
    const copy = RECIPE_SHARE_COPY;
    const [[cardFonts, logoUri], photo] = await Promise.all([ready(assets, origin), photoOr(p.i, copy.photo)]);
    return renderCard({
      layout: 'fullBleed',
      eyebrow: copy.eyebrow,
      title: shorten(p.s || 'Shared with you'),
      bold: shorten(p.n),
      accent: copy.accent,
      photo,
    }, logoUri, cardFonts);
  }

  const copy = INVITE_COPY[p.k];
  const [[cardFonts, logoUri], photo] = await Promise.all([ready(assets, origin), photoOr(p.i, copy.photo)]);
  return renderCard({
    layout: p.k === 'group' ? 'fullBleed' : 'split',
    eyebrow: copy.eyebrow,
    title: p.k === 'group' ? "You're Invited to Join" : "You've Been Challenged",
    bold: shorten(p.n),
    badge: p.k === 'group' ? 'Public group' : 'Public challenge',
    line: countLine(p.k, p.c) ?? undefined,
    accent: copy.accent,
    photo,
  }, logoUri, cardFonts);
}
