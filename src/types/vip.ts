export type VipLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface VipPrivilege {
  id: string;
  titleMr: string;
  titleEn: string;
  descMr: string;
  iconName: 'badge' | 'seat' | 'bubble' | 'entry' | 'gift' | 'shield' | 'mic' | 'crown' | 'sparkles';
  highlight?: boolean;
}

export interface VipTierConfig {
  level: number;
  nameMr: string;
  nameEn: string;
  titleMr: string;
  requiredExp: number;
  badgeCode: string; // e.g., 'VIP 1', 'VIP 2', etc.
  gradientTheme: string;
  badgeBg: string;
  badgeBorder: string;
  badgeTextColor: string;
  cardGradient: string;
  cardBorder: string;
  glowColor: string;
  primaryColor: string;
  accentColor: string;
  seatRingClass: string;
  bubbleClass: string;
  entryBannerTextMr: string;
  charmMultiplier: number;
  dailyFreeCoins?: number;
  privileges: VipPrivilege[];
}

export interface RechargePackage {
  id: string;
  inrPrice: number;
  coins: number;
  bonusCoins: number;
  vipExp: number;
  tagMr?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  bonusPercent?: number;
}

export interface RechargeTransactionRecord {
  id: string;
  userId: string;
  packageId: string;
  inrPrice: number;
  coinsGranted: number;
  bonusCoinsGranted: number;
  expGranted: number;
  paymentMethod: string; // 'RAZORPAY' | 'UPI'
  transactionRef: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface UserVipStatus {
  level: number;
  exp: number;
  coins: number;
  totalRecharged: number;
  currentTier: VipTierConfig | null;
  nextTier: VipTierConfig | null;
  expInCurrentLevel: number;
  expRequiredForNext: number;
  progressPercent: number;
}
