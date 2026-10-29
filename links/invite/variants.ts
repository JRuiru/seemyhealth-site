// What one invite page can be. `public` exists only for a group or a challenge, and only when the
// restricted preview returned a target: an active invitation, sent to nobody in particular, to a
// public, non-sensitive group or a PUBLIC challenge. Everything else is `generic` or a state.
export const INVITE_VARIANTS = ['public', 'generic', 'expired', 'revoked', 'used_up'] as const;
export type InviteVariant = (typeof INVITE_VARIANTS)[number];
export const isState = (v: InviteVariant): v is 'expired' | 'revoked' | 'used_up' => v === 'expired' || v === 'revoked' || v === 'used_up';
