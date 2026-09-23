// Live Feature Configuration and Constants
export const LIVE_CONFIG = {
  // Feature flag helper: on unless explicitly set to 'false'
  FEATURE_FLAG_KEY: 'VITE_FEATURE_LIVE',
  
  // PK Battle limits
  PK_DURATION_SEC: 300, // 5 minutes
  PK_COOLDOWN_SEC: 60, // 60 seconds
  PK_INVITE_TIMEOUT_SEC: 20, // 20 seconds
  
  // Guest and Stream limits
  MAX_GUESTS: 3,
  CALL_RING_TIMEOUT_SEC: 30, // 30 seconds for 1-on-1 calls
  
  // Chat limits
  CHAT_RATE_LIMIT_MS: 1000, // 1 message per sec
  MAX_CHAT_LENGTH: 140,
  MAX_STREAM_MESSAGES_BUFFER: 200,
  
  // Daily spending limit for safety & anti-fraud
  DEFAULT_DAILY_SPEND_LIMIT_COINS: 5000,
  
  // Server endpoints
  TOKEN_ENDPOINT: '/api/live/token',
  SEND_GIFT_ENDPOINT: '/api/live/send-gift',
  PURCHASE_COINS_ENDPOINT: '/api/live/purchase-coins',
  PK_TRANSITIONS_ENDPOINT: '/api/live/pk-transitions',
  MODERATION_ENDPOINT: '/api/live/moderation',
};

export interface GiftItem {
  id: string;
  nameMr: string;
  nameEn: string;
  icon: string;
  coinPrice: number;
  tier: 'small' | 'medium' | 'large';
  animationType: 'pop' | 'float' | 'fullscreen';
  description?: string;
}

export const SEEDED_GIFTS: GiftItem[] = [
  { id: 'rose_1', nameMr: 'गुलाब (Rose)', nameEn: 'Rose', icon: '🌹', coinPrice: 1, tier: 'small', animationType: 'pop' },
  { id: 'heart_5', nameMr: 'प्रेम (Heart)', nameEn: 'Heart', icon: '❤️', coinPrice: 5, tier: 'small', animationType: 'float' },
  { id: 'tea_10', nameMr: 'कटिंग चहा (Tea)', nameEn: 'Cutting Chai', icon: '☕', coinPrice: 10, tier: 'small', animationType: 'float' },
  { id: 'fire_25', nameMr: 'ज्वाला (Fire)', nameEn: 'Fire', icon: '🔥', coinPrice: 25, tier: 'small', animationType: 'float' },
  { id: 'crown_50', nameMr: 'राजमुकुट (Crown)', nameEn: 'Crown', icon: '👑', coinPrice: 50, tier: 'medium', animationType: 'pop' },
  { id: 'modak_100', nameMr: 'मोदक (Modak)', nameEn: 'Modak', icon: '🥟', coinPrice: 100, tier: 'medium', animationType: 'pop' },
  { id: 'dhol_150', nameMr: 'ढोल ताशा (Dhol)', nameEn: 'Dhol Tasha', icon: '🥁', coinPrice: 150, tier: 'medium', animationType: 'fullscreen' },
  { id: 'rocket_200', nameMr: 'रॉकेट (Rocket)', nameEn: 'Rocket', icon: '🚀', coinPrice: 200, tier: 'large', animationType: 'fullscreen' },
  { id: 'pagadi_250', nameMr: 'मराठी फेटा (Pagadi)', nameEn: 'Shahi Feta', icon: '👳', coinPrice: 250, tier: 'large', animationType: 'fullscreen' },
  { id: 'lion_500', nameMr: 'सिंह गर्जना (Lion)', nameEn: 'Lion Roar', icon: '🦁', coinPrice: 500, tier: 'large', animationType: 'fullscreen' },
  { id: 'galaxy_1000', nameMr: 'आकाशगंगा (Galaxy)', nameEn: 'Galaxy Star', icon: '🌌', coinPrice: 1000, tier: 'large', animationType: 'fullscreen' },
];
