export type SubscriptionPlanId = '6_months' | '3_months' | '1_month';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  price: number;
  durationMonths: number;
  durationLabelMr: string;
  durationLabelEn: string;
  descriptionMr: string;
  descriptionEn: string;
  badgeMr?: string;
  badge?: string;
  featured?: boolean;
  highlight?: boolean;
  featuresMr?: string[];
}

export type PremiumAssetCategory = 
  | 'gifts' 
  | 'bubbles' 
  | 'frames' 
  | 'seatFrames' 
  | 'badges' 
  | 'entryEffects' 
  | 'profileEffects' 
  | 'nameEffects';

export interface BasePremiumAsset {
  id: string;
  nameMr: string;
  nameEn: string;
  category: PremiumAssetCategory;
  culturalTheme: string;
  previewIcon?: string;
  premiumRequired: boolean;
  active?: boolean;
}

export type GiftCategoryType = 'love' | 'friendship' | 'festival' | 'heritage';

export interface PremiumGift extends BasePremiumAsset {
  category: 'gifts';
  giftCategory?: GiftCategoryType;
  descriptionMr: string;
  animation: string;
  accentColor: string;
  tagMr: string;
  coinPrice?: number;
  basePrice?: number;
  marketPrice?: number;
  priceChangePercent?: number; // e.g. +12 for surge, -8 for discount
  marketTrend?: 'HOT' | 'SURGE' | 'DISCOUNT' | 'STABLE';
}

export interface PremiumChatBubble extends BasePremiumAsset {
  category: 'bubbles';
  visualCategory: 'Royal' | 'Festival' | 'Traditional' | 'Modern' | 'Warli' | 'Paithani' | 'Fort' | 'Celebration' | 'Luxury';
  bgGradient: string;
  borderColor: string;
  textColor: string;
  patternType: string;
  cornerAccent?: string;
  bgClass?: string;
  borderClass?: string;
  textClass?: string;
}

export interface PremiumScreenFrame extends BasePremiumAsset {
  category: 'frames';
  theme: string;
  borderClass: string;
  glowColor: string;
  cornerMotif: string;
  ornamentSvg?: string;
  bgClass?: string;
}

export interface PremiumSeatFrame extends BasePremiumAsset {
  category: 'seatFrames';
  theme: string;
  seatRingClass: string;
  crownBadge: string;
  glowColor: string;
  pulseAnimation: string;
  icon?: string;
  ringClass?: string;
  glowClass?: string;
}

export interface PremiumBadge extends BasePremiumAsset {
  category: 'badges';
  icon: string;
  bgGradient: string;
  borderClass: string;
  textClass: string;
  descriptionMr: string;
}

export interface PremiumEntryEffect extends BasePremiumAsset {
  category: 'entryEffects';
  bannerTextMr: string;
  bannerGradient: string;
  icon: string;
  soundName?: string;
  animationKey: string;
}

export interface PremiumProfileEffect extends BasePremiumAsset {
  category: 'profileEffects';
  auraClass: string;
  glowColor: string;
  particleIcon: string;
}

export interface PremiumNameEffect extends BasePremiumAsset {
  category: 'nameEffects';
  gradientStyle: string;
  textShadow: string;
  badgeSymbol: string;
}

export interface UserSubscriptionData {
  status: 'none' | 'active' | 'expired';
  planId?: SubscriptionPlanId;
  startDate?: string;
  endDate?: string;
  amount?: number;
  paymentReference?: string;
}

export interface RoomGiftEvent {
  id: string;
  districtId: string;
  giftId: string;
  giftNameMr: string;
  giftIcon: string;
  animation: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  recipientId: string;
  recipientName: string;
  recipientPhoto?: string;
  multiplier?: number;
  createdAt: any;
}

export interface RoomEntryEvent {
  id: string;
  districtId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  effectId: string;
  effectNameMr: string;
  createdAt: any;
}
