// The Open Graph cards (1200 x 630), drawn as satori element trees in the site's own look: the
// near-black page, Oswald capitals with a light line and a bold one, a small tracked eyebrow, the
// logo, and the Cloudflare photos the site already uses. Pure: images arrive as data URIs, so the
// same trees render at build time (every static card) and in the Worker (a public group's or
// challenge's invite).

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const INK = '#ffffff';
const PAGE = '#0a0a0a';
const MUTED = 'rgba(255,255,255,0.62)';
const EYEBROW = 'rgba(255,255,255,0.55)';

export type CardLayout = 'fullBleed' | 'split' | 'quiet';

export interface CardSpec {
  layout: CardLayout;
  eyebrow: string;
  title: string;          // the light line
  bold?: string;          // the bold line under it
  line?: string;          // one sentence, or a stat line for an entity
  badge?: string;         // a small glass pill (Public group, Members only)
  accent: string;         // the kind's hue: the eyebrow dot and the quiet glow
  photo?: string;         // data URI
}

type Node = { type: string; props: Record<string, unknown> };

const h = (type: string, style: Record<string, unknown>, ...children: (Node | string | null | undefined | false)[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.filter((c) => c !== null && c !== undefined && c !== false) },
});

const img = (src: string, style: Record<string, unknown>): Node => ({ type: 'img', props: { src, style } });

// Long names shrink rather than spill: the title is one or two lines of capitals.
const titleSize = (text: string) => (text.length > 34 ? 60 : text.length > 22 ? 74 : 88);

const brand = (logo: string) =>
  h('div', { alignItems: 'center', gap: 16 },
    img(logo, { width: 52, height: 52, borderRadius: 14 }),
    h('div', { fontFamily: 'Oswald', fontWeight: 500, fontSize: 28, letterSpacing: 2, color: INK, textTransform: 'uppercase' }, 'SeeMyHealth'),
  );

const eyebrow = (text: string, accent: string) =>
  h('div', { alignItems: 'center', gap: 14, fontFamily: 'Inter', fontWeight: 600, fontSize: 20, letterSpacing: 6, color: EYEBROW, textTransform: 'uppercase' },
    h('div', { width: 12, height: 12, borderRadius: 6, backgroundColor: accent }),
    text,
  );

const heading = (spec: CardSpec, align: 'left' | 'center', scale = 1) => {
  const size = Math.round(titleSize(`${spec.title} ${spec.bold ?? ''}`) * scale);
  return h('div', { flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', textAlign: align, fontFamily: 'Oswald', textTransform: 'uppercase', lineHeight: 0.98, color: INK },
    h('div', { fontWeight: 300, fontSize: size }, spec.title),
    spec.bold ? h('div', { fontWeight: 500, fontSize: size }, spec.bold) : null,
  );
};

const line = (text: string | undefined, align: 'left' | 'center', width: number, size = 28) =>
  text ? h('div', { fontFamily: 'Inter', fontWeight: 400, fontSize: size, lineHeight: 1.4, color: MUTED, maxWidth: width, textAlign: align, justifyContent: align === 'center' ? 'center' : 'flex-start' }, text) : null;

const badge = (text: string | undefined) =>
  text ? h('div', { padding: '10px 22px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.08)', fontFamily: 'Inter', fontWeight: 600, fontSize: 20, letterSpacing: 2, color: INK, textTransform: 'uppercase' }, text) : null;

const ecg = (accent: string) =>
  ({ type: 'svg', props: { width: 760, height: 90, viewBox: '0 0 400 60', style: { opacity: 0.35 }, children: [
    { type: 'path', props: { d: 'M0 30 L80 30 L100 30 L120 10 L140 50 L160 5 L180 55 L200 30 L220 30 L400 30', stroke: accent, strokeWidth: 2.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } },
  ] } }) as Node;

// A photo behind everything, darkened from the bottom and the left as the site's heroes are.
const fullBleed = (spec: CardSpec, logo: string) =>
  h('div', { width: CARD_WIDTH, height: CARD_HEIGHT, position: 'relative', backgroundColor: PAGE },
    spec.photo ? img(spec.photo, { position: 'absolute', left: 0, top: 0, width: CARD_WIDTH, height: CARD_HEIGHT, objectFit: 'cover' }) : null,
    h('div', { position: 'absolute', left: 0, top: 0, width: CARD_WIDTH, height: CARD_HEIGHT, backgroundImage: 'linear-gradient(to top, rgba(10,10,10,0.97) 18%, rgba(10,10,10,0.55) 62%, rgba(10,10,10,0.25))' }),
    h('div', { position: 'absolute', left: 0, top: 0, width: CARD_WIDTH, height: CARD_HEIGHT, backgroundImage: 'linear-gradient(to right, rgba(10,10,10,0.75), rgba(10,10,10,0))' }),
    h('div', { position: 'absolute', left: 64, top: 56 }, brand(logo)),
    h('div', { position: 'absolute', left: 64, right: 64, bottom: 60, flexDirection: 'column', gap: 22 },
      eyebrow(spec.eyebrow, spec.accent),
      heading(spec, 'left'),
      h('div', { alignItems: 'center', gap: 22 }, badge(spec.badge), line(spec.line, 'left', 900)),
    ),
  );

// Words on the left, a framed photo on the right: a thing to look at, not a scene.
const split = (spec: CardSpec, logo: string) =>
  h('div', { width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: PAGE, position: 'relative' },
    h('div', { position: 'absolute', left: 64, top: 56, bottom: 56, width: 560, flexDirection: 'column', justifyContent: 'space-between' },
      brand(logo),
      h('div', { flexDirection: 'column', gap: 18 },
        eyebrow(spec.eyebrow, spec.accent),
        heading(spec, 'left', 0.8),
        badge(spec.badge) ? h('div', {}, badge(spec.badge)) : null,
        line(spec.line, 'left', 540, 24),
      ),
    ),
    h('div', { position: 'absolute', left: 664, top: 40, width: 496, height: 550, borderRadius: 32, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.10)', backgroundColor: '#141414' },
      spec.photo ? img(spec.photo, { width: 496, height: 550, objectFit: 'cover' }) : null,
      h('div', { position: 'absolute', left: 0, top: 0, width: 496, height: 550, backgroundImage: `linear-gradient(to top, ${spec.accent}33, rgba(0,0,0,0))` }),
    ),
  );

// No photo: the private kinds and the neutral states, centred over a soft glow and the site's ECG line.
const quiet = (spec: CardSpec, logo: string) =>
  h('div', { width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: PAGE, position: 'relative', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    h('div', { position: 'absolute', left: 300, top: -120, width: 600, height: 600, borderRadius: 300, backgroundImage: `radial-gradient(circle, ${spec.accent}2e, rgba(10,10,10,0) 70%)` }),
    h('div', { position: 'absolute', left: 64, top: 56 }, brand(logo)),
    h('div', { flexDirection: 'column', alignItems: 'center', gap: 22, marginTop: 40 },
      ecg(spec.accent),
      eyebrow(spec.eyebrow, spec.accent),
      heading(spec, 'center'),
      line(spec.line, 'center', 880),
    ),
  );

export function cardTree(spec: CardSpec, logo: string): Node {
  if (spec.layout === 'fullBleed') return fullBleed(spec, logo);
  if (spec.layout === 'split') return split(spec, logo);
  return quiet(spec, logo);
}
