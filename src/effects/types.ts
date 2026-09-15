// MahaChat Visual Effects Engine - Types & Models
// Production-ready data-driven visual effects schema

export type EffectType =
  | 'gift'
  | 'gift_combo'
  | 'avatar_frame'
  | 'vip_frame'
  | 'badge'
  | 'entrance'
  | 'chat_bubble'
  | 'name_effect'
  | 'level_up'
  | 'room_theme'
  | 'ambient_particles'
  | 'seat_mic_active'
  | 'host_crown'
  | 'follow'
  | 'reaction'
  | 'pk_event'
  | 'achievement'
  | 'notification'
  | 'festival'
  | 'loading';

export type EffectRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'vip';

export type GiftTier = 1 | 2 | 3; // 1: Simple, 2: Premium, 3: Legendary Cinematic

export type EffectTriggerType =
  | 'gift'
  | 'entry'
  | 'combo'
  | 'speak'
  | 'level_up'
  | 'theme'
  | 'reaction'
  | 'badge_tap'
  | 'manual'
  | 'ambient'
  | 'pk_victory';

export type EffectTargetType =
  | 'seat'
  | 'screen'
  | 'chat_bubble'
  | 'name'
  | 'room_background'
  | 'avatar'
  | 'top_banner'
  | 'floating';

export type SoundPreset =
  | 'fanfare'
  | 'chime'
  | 'drum'
  | 'tutari'
  | 'sparkle'
  | 'whoosh'
  | 'levelup'
  | 'bell'
  | 'victory'
  | 'pop';

export interface VisualEffectModel {
  effectId: string;
  effectType: EffectType;
  name: string;
  nameMr: string;
  rarity: EffectRarity;
  tier?: GiftTier;
  price: number; // in MahaChat coins
  duration: number; // in milliseconds
  animationDuration: number; // in milliseconds
  assetUrl?: string;
  previewUrl?: string;
  previewIcon: string;
  soundUrl?: string;
  soundPreset?: SoundPreset;
  priority: number; // 0 to 100 (Legendary: 90+, Epic: 70+, Rare: 50+, Common: 20+)
  enabled: boolean;
  triggerType: EffectTriggerType;
  targetType: EffectTargetType;
  culturalTheme?: string;
  festivalTag?: string;
  accentColor?: string;
  metadata?: {
    cinematicStyle?: 'crown' | 'fort' | 'galaxy' | 'fireworks' | 'lightning' | 'palace' | 'gold_shower' | 'heart_blast' | 'tutari';
    particleType?: 'petals' | 'leaves' | 'fireflies' | 'gold_dust' | 'stars' | 'rain';
    cssClass?: string;
    borderGradient?: string;
    glowColor?: string;
    animationKey?: string;
    [key: string]: any;
  };
}

export interface QueuedGiftEffect {
  id: string;
  effect: VisualEffectModel;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  recipientId: string;
  recipientName: string;
  recipientPhoto?: string;
  seatIndex?: number | null;
  comboCount: number;
  timestamp: number;
  priority: number;
}

export interface UserEffectSettings {
  effectsEnabled: boolean;
  giftAnimationLevel: 'full' | 'reduced' | 'off';
  soundEnabled: boolean;
  entranceEffectsEnabled: boolean;
  ambientParticlesEnabled: boolean;
}

export interface RoomThemeConfig {
  id: string;
  themeId?: string;
  name: string;
  nameMr: string;
  descriptionMr: string;
  backgroundGradient: string;
  ambientParticleType?: 'fireflies' | 'leaves' | 'rain' | 'gold_dust' | 'stars' | 'petals' | 'none';
  seatRingColor: string;
  headerStyle: string;
  isSpecialParavarchyaGappa?: boolean;
}
