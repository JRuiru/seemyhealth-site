// Which page each link path draws for somebody without the app: ONE table, keyed by the name
// link-paths.json gives the path. `npm run links:check` fails a path with no kind, and a name here
// the backend does not list. A kind is a page design (links/kinds/<Kind>.astro), its Open Graph
// card, and its Rive icon; paths share a kind only when they are the same sort of thing.
//
// Kept free of imports so the check script can read it directly.

export const PAGE_KINDS = [
  'invite',
  'connection',
  'group',
  'groupManage',
  'event',
  'challenge',
  'awards',
  'post',
  'people',
  'family',
  'messages',
  'call',
  'care',
  'checkIn',
  'payment',
  'billing',
  'health',
  'mood',
  'devices',
  'recipeShare',
  'notifications',
] as const;

export type PageKind = (typeof PAGE_KINDS)[number];

export const PAGE_KIND_BY_PATH: Record<string, PageKind> = {
  invite: 'invite',
  connectionInvite: 'connection',

  groups: 'group',
  group: 'group',
  groupJoinRequests: 'groupManage',
  groupReports: 'groupManage',
  groupEvent: 'event',
  groupEventPost: 'event',
  groupEventSpots: 'event',

  challenges: 'challenge',
  challenge: 'challenge',
  challengeParticipants: 'challenge',
  awards: 'awards',

  feed: 'post',
  post: 'post',
  postComments: 'post',
  groupPost: 'post',
  groupPostComments: 'post',

  connectionRequests: 'people',
  userProfile: 'people',

  family: 'family',
  familyInvitation: 'family',
  familyInvitations: 'family',

  messages: 'messages',
  conversation: 'messages',
  call: 'call',

  appointments: 'care',
  appointment: 'care',
  enquiry: 'care',
  practice: 'checkIn',
  paymentsReturn: 'payment',
  billing: 'billing',

  home: 'health',
  health: 'health',
  healthReport: 'health',
  goal: 'health',
  mood: 'mood',
  devices: 'devices',
  recipeShare: 'recipeShare',

  notifications: 'notifications',
};

// The kinds a fallback page draws (every kind but the four the Worker answers with content of its
// own: an invitation's preview, a person's connection invite with their @handle, the payment return,
// and a recipe shared by link with its name, photo and who shared it).
export const FALLBACK_KINDS = PAGE_KINDS.filter((k) => k !== 'invite' && k !== 'connection' && k !== 'payment' && k !== 'recipeShare');

// The site's Rive tab icons (public/media/app-icons, copied from the app), one per area.
export type KindIcon = 'community' | 'my-health' | 'providers' | 'nutrition';

export const KIND_ICON: Partial<Record<PageKind, KindIcon>> = {
  invite: 'community',
  connection: 'community',
  group: 'community',
  groupManage: 'community',
  event: 'community',
  challenge: 'community',
  awards: 'community',
  post: 'community',
  people: 'community',
  family: 'community',
  messages: 'community',
  call: 'providers',
  care: 'providers',
  checkIn: 'providers',
  payment: 'providers',
  billing: 'providers',
  health: 'my-health',
  mood: 'my-health',
  devices: 'my-health',
  recipeShare: 'nutrition',
};
