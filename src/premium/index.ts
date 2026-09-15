export * from './types';
export * from './plans';
export * from './data/gifts';
export * from './data/chatBubbles';
export * from './data/screenFrames';
export * from './data/seatFrames';
export * from './data/badges';
export * from './data/entryEffects';
export * from './data/profileEffects';
export * from './data/nameEffects';

import { PREMIUM_GIFTS } from './data/gifts';
import { PREMIUM_CHAT_BUBBLES } from './data/chatBubbles';
import { PREMIUM_SCREEN_FRAMES } from './data/screenFrames';
import { PREMIUM_SEAT_FRAMES } from './data/seatFrames';
import { PREMIUM_BADGES } from './data/badges';
import { PREMIUM_ENTRY_EFFECTS } from './data/entryEffects';
import { PREMIUM_PROFILE_EFFECTS } from './data/profileEffects';
import { PREMIUM_NAME_EFFECTS } from './data/nameEffects';

export const getGiftById = (id?: string) => PREMIUM_GIFTS.find(g => g.id === id);
export const getBubbleById = (id?: string) => PREMIUM_CHAT_BUBBLES.find(b => b.id === id);
export const getFrameById = (id?: string) => PREMIUM_SCREEN_FRAMES.find(f => f.id === id);
export const getSeatFrameById = (id?: string) => PREMIUM_SEAT_FRAMES.find(s => s.id === id);
export const getBadgeById = (id?: string) => PREMIUM_BADGES.find(b => b.id === id);
export const getEntryEffectById = (id?: string) => PREMIUM_ENTRY_EFFECTS.find(e => e.id === id);
export const getProfileEffectById = (id?: string) => PREMIUM_PROFILE_EFFECTS.find(p => p.id === id);
export const getNameEffectById = (id?: string) => PREMIUM_NAME_EFFECTS.find(n => n.id === id);
