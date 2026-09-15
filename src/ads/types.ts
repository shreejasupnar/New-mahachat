export interface Advertisement {
  adId: string;
  imageUrl: string;
  title: string;
  advertiserName: string;
  contact: string;
  targetUrl?: string;
  displayDuration: number; // Duration in seconds (e.g. 4 or 5)
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  priority: number; // Higher number = higher priority
  isActive: boolean;
  createdAt: string;
  taglineMr?: string;
  locationMr?: string;
  category?: string;
  impressionsCount?: number;
  clicksCount?: number;
}

export interface AdAnalyticsEvent {
  adId: string;
  type: 'impression' | 'click';
  timestamp: number;
}

export const DEFAULT_ADVERTISEMENT: Advertisement = {
  adId: 'default_mahachat_neon_board',
  imageUrl: '/ads/default/maha_chat_default_ad.png',
  title: 'MahaChat डिजिटल जाहिरात फलक',
  taglineMr: 'आपल्या व्यवसायाची जाहिरात करा लाखो लोकांपर्यंत!',
  advertiserName: 'MahaChat अधिकृत जाहिरात मंच',
  contact: '7620363213',
  targetUrl: 'tel:7620363213',
  displayDuration: 5,
  startDate: '2025-01-01T00:00:00.000Z',
  endDate: '2035-12-31T23:59:59.000Z',
  priority: 0, // Lowest priority - only shown when 0 active paid ads
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  locationMr: 'महाराष्ट्र भर'
};
