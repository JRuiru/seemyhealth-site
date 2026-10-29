// A public group's or public challenge's invite card, drawn in the Worker from a verified card key
// (card-key.ts). Imported lazily by the image route, so a page request never initialises the wasm.

import yogaWasm from 'yoga-wasm-web/dist/yoga.wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import { initRenderer, photoDataUri, renderCard, type CardFonts } from './render.ts';
import { countLine } from '../invite.ts';
import { CF_IMG, INVITE_COPY, LOGO } from '../catalogue.ts';
import type { CardPayload } from './card-key.ts';

let fonts: Promise<CardFonts> | undefined;
let logo: Promise<string | undefined> | undefined;

const font = (assets: Fetcher, origin: string, name: string) =>
  assets.fetch(new Request(`${origin}/fonts/${name}.ttf`)).then((r) => {
    if (!r.ok) throw new Error('font');
    return r.arrayBuffer();
  });

export async function renderInviteCard(p: CardPayload, assets: Fetcher, origin: string): Promise<Uint8Array> {
  await initRenderer(yogaWasm, resvgWasm);
  fonts ??= Promise.all(['oswald-300', 'oswald-500', 'inter-400', 'inter-600'].map((n) => font(assets, origin, n)))
    .then(([oswaldLight, oswaldMedium, interRegular, interSemibold]) => ({ oswaldLight, oswaldMedium, interRegular, interSemibold }))
    .catch((e) => { fonts = undefined; throw e; });
  logo ??= photoDataUri(LOGO).then((l) => { if (!l) logo = undefined; return l; });

  const copy = INVITE_COPY[p.k];
  const [cardFonts, logoUri, photo] = await Promise.all([
    fonts,
    logo,
    // The target's own picture, or the kind's art when it has none or it will not load.
    (p.i ? photoDataUri(p.i) : Promise.resolve(undefined)).then((own) => own ?? photoDataUri(`${CF_IMG}/${copy.photo}/public`)),
  ]);
  if (!logoUri) throw new Error('logo');

  return renderCard({
    layout: p.k === 'group' ? 'fullBleed' : 'split',
    eyebrow: copy.eyebrow,
    title: p.k === 'group' ? "You're Invited to Join" : "You've Been Challenged",
    bold: p.n.length > 60 ? `${p.n.slice(0, 57).trimEnd()}...` : p.n,
    badge: p.k === 'group' ? 'Public group' : 'Public challenge',
    line: countLine(p.k, p.c) ?? undefined,
    accent: copy.accent,
    photo,
  }, logoUri, cardFonts);
}
