// The season the home page dresses for. From 15 Oct to 1 Nov it is Halloween by itself, and
// ?season=halloween previews it any day. The why scene and the tracker chat both ask here, so they
// always change together.
export type Season = 'halloween';

export function currentSeason(): Season | null {
  const today = new Date();
  const halloween = new URLSearchParams(location.search).get('season') === 'halloween'
    || (today.getMonth() === 9 && today.getDate() >= 15) || (today.getMonth() === 10 && today.getDate() <= 1);
  return halloween ? 'halloween' : null;
}
