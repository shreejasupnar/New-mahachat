export type TransactionType = 
  | 'PURCHASE' 
  | 'GIFT_SENT' 
  | 'GIFT_RECEIVED' 
  | 'REFUND' 
  | 'ADMIN_ADJUSTMENT';

export interface CoinTransactionMetadata {
  giftId?: string;
  giftName?: string;
  giftIcon?: string;
  multiplier?: number;
  recipientId?: string;
  recipientName?: string;
  recipientCount?: number;
  senderId?: string;
  senderName?: string;
  districtId?: string;
  roomId?: string;
  packageId?: string;
  paymentMethod?: string;
  utrNumber?: string;
  notes?: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // positive for credits, negative for debits
  balanceAfter: number;
  description: string;
  referenceId?: string;
  metadata?: CoinTransactionMetadata;
  createdAt: string;
}

export interface UserWallet {
  userId: string;
  coinBalance: number;
  lifetimeCoinsPurchased: number;
  lifetimeCoinsSpent: number;
  lifetimeCoinsReceived: number;
  lastTransactionAt?: string;
}

export interface CatalogGift {
  id: string;
  nameMr: string;
  nameEn: string;
  category: 'gifts';
  giftCategory?: 'love' | 'friendship' | 'festival' | 'heritage';
  culturalTheme: string;
  previewIcon: string;
  descriptionMr: string;
  animation: string;
  accentColor: string;
  tagMr: string;
  coinPrice: number;
  basePrice?: number;
  marketPrice?: number;
  priceChangePercent?: number;
  marketTrend?: 'HOT' | 'SURGE' | 'DISCOUNT' | 'STABLE';
  active: boolean;
  updatedAt?: string;
}

export interface MarketCategoryRate {
  category: 'love' | 'friendship' | 'festival' | 'heritage';
  labelMr: string;
  labelEn: string;
  icon: string;
  fluctuationPercent: number; // e.g. +10, -5
  trend: 'HOT' | 'SURGE' | 'DISCOUNT' | 'STABLE';
  demandLevel: string;
  reasonMr: string;
}

export interface SendGiftRequest {
  senderUid: string;
  districtId: string;
  roomId?: string;
  giftId: string;
  multiplier: number;
  recipientUids: string[];
  clientRequestId?: string;
}

export interface SendGiftResponse {
  success: boolean;
  transactionId?: string;
  newSenderCoins?: number;
  totalCost?: number;
  gift?: {
    id: string;
    nameMr: string;
    previewIcon: string;
    coinPrice: number;
  };
  error?: string;
}
