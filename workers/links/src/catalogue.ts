// What every links page and card says, and the art it uses: ONE catalogue, so a page and its card
// never say two different things. Voice: the site's (Oswald capitals, a light line then a bold one)
// carrying the apps' toast voice (a short Title Case title, one warm sentence ending in the next
// step). British spelling, no em dashes, no "Oops" except a genuine failure, and nothing personal:
// a page knows a path, never whose data it leads to.
//
// Photos are Cloudflare Images ids the site already serves (imagedelivery.net/<hash>/<id>/public).
// Kept free of imports so the build script can read it directly.

export const CF_IMG = 'https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg';
export const LOGO = `${CF_IMG}/logo/public`;

export type CardLayout = 'fullBleed' | 'split' | 'quiet';

export interface Copy {
  eyebrow: string;
  title: string;      // the light line
  bold: string;       // the bold line
  sentence: string;   // one warm sentence
  pageTitle: string;  // <title> and og:title
  layout: CardLayout; // the Open Graph card's layout
  photo?: string;     // a Cloudflare Images id
  accent: string;
}

// Accents are the site's own hues: the device colours and the CTA purple.
const ORANGE = '#F97316', BLUE = '#3B82F6', RED = '#EF4444', CYAN = '#06B6D4', PURPLE = '#A855F7', VIOLET = '#7c3aed', GREEN = '#22C55E', AMBER = '#F59E0B';

// ---- Fallback kinds: a link opened without the app ----------------------------------------------

export const KIND_COPY = {
  group: {
    eyebrow: 'Groups', title: 'Groups Gather', bold: 'in the App',
    sentence: "Open SeeMyHealth to see this group, its posts and who's in it. What a group shares stays with its members.",
    pageTitle: 'A Group on SeeMyHealth', layout: 'fullBleed', photo: 'lifestyle-friends-bar', accent: ORANGE,
  },
  groupManage: {
    eyebrow: 'For group managers', title: "Your Group's", bold: 'To-Do List',
    sentence: 'Join requests and reports are waiting in the app, where only the people who run the group can see them.',
    pageTitle: 'Group Requests on SeeMyHealth', layout: 'split', photo: 'app-community-challenges', accent: ORANGE,
  },
  event: {
    eyebrow: 'Group event', title: "Something's", bold: 'Happening',
    sentence: "Open SeeMyHealth to see when and where it is, and let the group know if you're going.",
    pageTitle: 'An Event on SeeMyHealth', layout: 'fullBleed', photo: 'bottle-black-picnic', accent: CYAN,
  },
  challenge: {
    eyebrow: 'Challenges', title: 'Game On.', bold: 'See You There.',
    sentence: "Open SeeMyHealth to see the challenge, the leaderboard and how far everyone's got.",
    pageTitle: 'A Challenge on SeeMyHealth', layout: 'fullBleed', photo: 'challenge-accepted', accent: GREEN,
  },
  trophies: {
    eyebrow: 'Trophies', title: 'Your Trophy', bold: 'Cabinet',
    sentence: "Every badge you've earned is polished and waiting in the app. Go on, have a look.",
    pageTitle: 'Trophies on SeeMyHealth', layout: 'split', photo: 'app-goals-achieved', accent: AMBER,
  },
  post: {
    eyebrow: 'Community', title: 'Someone Has', bold: 'Something to Say',
    sentence: 'Open SeeMyHealth to read the post and join the conversation. Posts are for people in the app.',
    pageTitle: 'A Post on SeeMyHealth', layout: 'split', photo: 'app-couch-download', accent: VIOLET,
  },
  people: {
    eyebrow: 'Friends', title: 'Friends Make It', bold: 'Easier',
    sentence: 'Open SeeMyHealth to see who it is and say hello. Profiles only show what each person chooses to share.',
    pageTitle: 'Friends on SeeMyHealth', layout: 'split', photo: 'ring-man-smiling-lifestyle', accent: ORANGE,
  },
  family: {
    eyebrow: 'Family', title: 'Family,', bold: 'Kept Close',
    sentence: "Open SeeMyHealth to see your family and any requests waiting for you. Nobody's health is shared until they choose.",
    pageTitle: 'Family on SeeMyHealth', layout: 'fullBleed', photo: 'family-daughter', accent: AMBER,
  },
  messages: {
    eyebrow: 'Messages', title: 'Your Messages', bold: 'Stay Private',
    sentence: 'Conversations only open in the SeeMyHealth app, so nothing personal ever shows up on a web page.',
    pageTitle: 'Messages on SeeMyHealth', layout: 'quiet', accent: BLUE,
  },
  call: {
    eyebrow: 'Video call', title: 'Your Call Is', bold: 'About to Start',
    sentence: 'Calls only open in the SeeMyHealth app. Open it to join, and check your camera and microphone on the way in.',
    pageTitle: 'A Call on SeeMyHealth', layout: 'split', photo: 'app-video-consultation', accent: BLUE,
  },
  care: {
    eyebrow: 'Appointments', title: 'Your Care,', bold: 'in One Place',
    sentence: 'Appointments and messages with your practice only open in the SeeMyHealth app, so your details never show up here.',
    pageTitle: 'Appointments on SeeMyHealth', layout: 'split', photo: 'provider-appointments', accent: GREEN,
  },
  checkIn: {
    eyebrow: 'Check in', title: "You've", bold: 'Arrived',
    sentence: "This code checks you in at your practice through the SeeMyHealth app. Open it to let them know you're here.",
    pageTitle: 'Check In with SeeMyHealth', layout: 'split', photo: 'provider-payments', accent: GREEN,
  },
  billing: {
    eyebrow: 'Billing', title: 'Your Billing,', bold: 'Sorted',
    sentence: 'Payments, packages and refunds live in the SeeMyHealth app, where only you can see them.',
    pageTitle: 'Billing on SeeMyHealth', layout: 'quiet', accent: VIOLET,
  },
  health: {
    eyebrow: 'Your health', title: 'Your Health,', bold: 'Your Eyes Only',
    sentence: 'Your health hub, reports and goals only open in the SeeMyHealth app. Nothing about you shows up on a web page.',
    pageTitle: 'Your Health on SeeMyHealth', layout: 'split', photo: 'app-dashboard-hand', accent: RED,
  },
  mood: {
    eyebrow: 'Mood check-in', title: 'How Are You', bold: 'Feeling?',
    sentence: 'Open SeeMyHealth to check in. It takes a few seconds, and only you see it.',
    pageTitle: 'Mood Check-In on SeeMyHealth', layout: 'split', photo: 'app-mood-tracking', accent: PURPLE,
  },
  devices: {
    eyebrow: 'Devices', title: 'Your Devices', bold: 'Are Waiting',
    sentence: 'Open SeeMyHealth to see your devices and how each one is syncing.',
    pageTitle: 'Devices on SeeMyHealth', layout: 'split', photo: 'ring-aurora-phantom-multi', accent: ORANGE,
  },
  notifications: {
    eyebrow: 'Notifications', title: "You've Got", bold: 'Updates',
    sentence: 'Open SeeMyHealth to catch up. Your notifications only show in the app.',
    pageTitle: 'Notifications on SeeMyHealth', layout: 'quiet', accent: VIOLET,
  },
} satisfies Record<string, Copy>;

export type FallbackKind = keyof typeof KIND_COPY;

// ---- The payment return: Flutterwave's ?status=, a hint only (the webhook settles it) -----------

export const PAYMENT_COPY = {
  pending: {
    eyebrow: 'Payment', title: 'Finishing Up', bold: 'Your Payment',
    sentence: 'Your appointment updates in the SeeMyHealth app as soon as the payment is confirmed, usually within a few seconds.',
    pageTitle: 'Payment on SeeMyHealth', layout: 'quiet', accent: GREEN,
  },
  successful: {
    eyebrow: 'Payment', title: 'Thanks,', bold: "You're All Set",
    sentence: 'The app confirms the payment in a few seconds, so head back to see your appointment.',
    pageTitle: 'Payment on SeeMyHealth', layout: 'quiet', accent: GREEN,
  },
  notCompleted: {
    eyebrow: 'Payment', title: 'Payment', bold: 'Not Completed',
    sentence: "Nothing's confirmed yet. Head back to the SeeMyHealth app to check your appointment and try again if you need to.",
    pageTitle: 'Payment on SeeMyHealth', layout: 'quiet', accent: AMBER,
  },
} satisfies Record<string, Copy>;

export type PaymentState = keyof typeof PAYMENT_COPY;

// ---- Invitations ---------------------------------------------------------------------------------
// The kind comes from the restricted preview. Only a public group or a public challenge ever has a
// name: everything else is generic, and a family invite never names anybody or anything.

export const INVITE_COPY = {
  group: {
    eyebrow: 'Group invite', title: "You're Invited", bold: 'to Join',
    sentence: 'Open the invite in SeeMyHealth to have a look around and join. Opening it never signs you up.',
    pageTitle: "You're Invited to a Group on SeeMyHealth", layout: 'fullBleed', photo: 'lifestyle-friends-bar', accent: ORANGE,
  },
  challenge: {
    eyebrow: 'Challenge invite', title: "You've Been", bold: 'Challenged',
    sentence: "Open the invite in SeeMyHealth to see the goal and the dates, then join in when you're ready.",
    pageTitle: "You've Been Challenged on SeeMyHealth", layout: 'fullBleed', photo: 'challenge-fitness', accent: GREEN,
  },
  friend: {
    eyebrow: 'Friend invite', title: 'Someone Wants', bold: 'to Connect',
    sentence: "A friend sent you this invite. Open it in SeeMyHealth to see who it's from and say yes.",
    pageTitle: "You're Invited to Connect on SeeMyHealth", layout: 'split', photo: 'ring-cocktails', accent: ORANGE,
  },
  family: {
    eyebrow: 'Family invite', title: "You've Been Invited", bold: 'to Share with Family',
    sentence: 'Open the invite in SeeMyHealth to see who it is from. Joining shares nothing about your health until you choose.',
    pageTitle: "You've Been Invited to Share with Family", layout: 'fullBleed', photo: 'family-grandma', accent: AMBER,
  },
} satisfies Record<string, Copy>;

export type InviteKind = keyof typeof INVITE_COPY;

// The generic group line when the preview names nothing (a private or sensitive group, or one sent to
// one person): it says the details are the members', never that the group is private.
export const INVITE_GROUP_GENERIC_LINE = 'Its details are for members, so you will see them in the app.';

// The apps' own words for each state (Scripts/backend_error_copy.json, INVITE_*), unchanged.
export const INVITE_STATE_COPY = {
  expired: { title: 'Invite Expired', sentence: 'This invite has run out of time. Ask whoever sent it to share a new one.' },
  revoked: { title: 'Invite Switched Off', sentence: "This invite isn't active any more. Ask whoever sent it for a new link." },
  used_up: { title: 'Invite Already Used', sentence: 'Someone has already used this invite. Ask whoever sent it for one of your own.' },
  not_found: { title: 'Invite Not Found', sentence: "This invite link doesn't lead anywhere. Ask whoever sent it for a fresh one." },
  // Not an INVITE_* code: the preview could not be read at all, a genuine failure.
  unavailable: { title: "Invite Didn't Load", sentence: 'Oops, something went wrong. Give it another go.' },
} as const;

export type InviteState = keyof typeof INVITE_STATE_COPY;

// ---- The rest ------------------------------------------------------------------------------------

export const GET_THE_APP_COPY: Copy = {
  eyebrow: 'The SeeMyHealth app', title: 'This Link Lives', bold: 'in the App',
  sentence: "Get SeeMyHealth on your phone, then tap the link again and it'll take you straight there.",
  pageTitle: 'Get the SeeMyHealth App', layout: 'fullBleed', photo: 'app-hero-triple-phones', accent: VIOLET,
};

export const NOT_FOUND_COPY: Copy = {
  eyebrow: 'Not found', title: 'Nothing', bold: 'Here',
  sentence: "This link doesn't lead anywhere. Check where it came from, or get the app and have a look around.",
  pageTitle: 'Not Found | SeeMyHealth', layout: 'quiet', accent: VIOLET,
};

// Every static card the build renders, by file name under /og/. The Worker picks one per page; the
// dynamic route draws only a public group's or public challenge's invite and falls back to these.
export const STATIC_CARDS: Record<string, Copy & { line?: string }> = {
  default: GET_THE_APP_COPY,
  'not-found': NOT_FOUND_COPY,
  ...Object.fromEntries(Object.entries(KIND_COPY).map(([k, c]) => [`kind-${k}`, { ...c, line: c.sentence }])),
  ...Object.fromEntries(Object.entries(PAYMENT_COPY).map(([k, c]) => [`payment-${k}`, { ...c, line: c.sentence }])),
  ...Object.fromEntries(Object.entries(INVITE_COPY).map(([k, c]) => [`invite-${k}`, { ...c, line: c.sentence }])),
  // The states are neutral: no kind, no art, no name.
  ...Object.fromEntries(Object.entries(INVITE_STATE_COPY).map(([k, c]) => [`invite-${k.replace('_', '-')}`, {
    eyebrow: 'Invite', title: c.title, bold: '', sentence: c.sentence, line: c.sentence,
    pageTitle: `${c.title} | SeeMyHealth`, layout: 'quiet' as const, accent: '#737373',
  }])),
};
