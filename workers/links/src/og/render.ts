// Renders a card: satori lays the tree out as SVG (text as glyph paths, so nothing downstream needs a
// font), resvg rasterises it, jpeg-js encodes it. JPEG rather than PNG because a photo card as PNG is
// about a megabyte, and WhatsApp drops large previews.
//
// The two wasm modules are initialised by the caller, once: the Worker from its bundled (precompiled)
// modules, the build script from node_modules. satori is the wasm entry over yoga-wasm-web, as
// workers-og runs it: Workers refuse to compile wasm from bytes at run time, which satori's newer
// standalone build does as it loads.

import satori, { init as initSatori } from 'satori/wasm';
import initYoga from 'yoga-wasm-web';
import { Resvg, initWasm as initResvg } from '@resvg/resvg-wasm';
import jpeg from 'jpeg-js';
import { CARD_HEIGHT, CARD_WIDTH, cardTree, type CardSpec } from './cards.ts';

export interface CardFonts {
  oswaldLight: ArrayBuffer;
  oswaldMedium: ArrayBuffer;
  interRegular: ArrayBuffer;
  interSemibold: ArrayBuffer;
}

let ready: Promise<void> | undefined;

export function initRenderer(yogaWasm: WebAssembly.Module | BufferSource, resvgWasm: WebAssembly.Module | BufferSource): Promise<void> {
  ready ??= Promise.all([initYoga(yogaWasm).then((yoga) => initSatori(yoga)), initResvg(resvgWasm)]).then(() => undefined);
  return ready;
}

export async function renderCard(spec: CardSpec, logo: string, fonts: CardFonts, quality = 82): Promise<Uint8Array> {
  if (!ready) throw new Error('renderer not initialised');
  await ready;
  // satori's types expect React elements; a plain { type, props } tree is what it reads.
  const svg = await satori(cardTree(spec, logo) as unknown as Parameters<typeof satori>[0], {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [
      { name: 'Oswald', data: fonts.oswaldLight, weight: 300, style: 'normal' },
      { name: 'Oswald', data: fonts.oswaldMedium, weight: 500, style: 'normal' },
      { name: 'Inter', data: fonts.interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: fonts.interSemibold, weight: 600, style: 'normal' },
    ],
  });
  const image = new Resvg(svg, { fitTo: { mode: 'width', value: CARD_WIDTH } }).render();
  const encoded = jpeg.encode({ data: image.pixels, width: image.width, height: image.height }, quality);
  image.free();
  return new Uint8Array(encoded.data);
}

// A photo as a data URI, or nothing: only JPEG and PNG (what satori reads), at most 4 MB, within
// three seconds. Cloudflare Images answers with JPEG when that is all the request accepts.
export async function photoDataUri(url: string, fetcher: typeof fetch = fetch): Promise<string | undefined> {
  try {
    const res = await fetcher(url, { headers: { Accept: 'image/jpeg, image/png' }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return undefined;
    const type = (res.headers.get('content-type') ?? '').split(';')[0].trim();
    if (type !== 'image/jpeg' && type !== 'image/png') return undefined;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength > 4 * 1024 * 1024) return undefined;
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return `data:${type};base64,${btoa(binary)}`;
  } catch {
    return undefined;
  }
}
