import { CatalogGift, MarketCategoryRate } from '../types/wallet';
import { PREMIUM_GIFTS } from '../premium/data/gifts';

// Baseline authoritative price map for all gifts
export const DEFAULT_GIFT_PRICES: Record<string, number> = {
  // Treats & Traditional Tokens (10 - 30 coins)
  gift_coconut: 10,
  gift_sugarcane: 10,
  gift_traditional_diya: 10,
  gift_misal: 15,
  gift_aamras: 15,
  gift_toran: 20,
  gift_modak: 20,
  gift_ukadiche_modak: 20,
  gift_kolhapuri_chappal: 25,
  gift_puran_poli: 25,
  gift_nag_panchami: 25,
  gift_makar_sankranti: 25,
  gift_warli_art: 30,
  gift_gudi: 30,
  gift_holi_celebration: 30,
  gift_alphonso_mango: 30,
  gift_maha_thali: 35,

  // Love & Romance Gifts
  gift_single_rose: 20,
  gift_rose_bouquet: 99,
  gift_love_heart: 150,
  gift_chocolate_box: 180,
  gift_teddy_bear: 220,
  gift_love_letter: 250,
  gift_gold_pendant: 499,
  gift_diamond_ring: 799,
  gift_love_castle: 1499,
  gift_cupid_arrow: 2199,

  // Friendship Gifts
  gift_chai_cutting: 10,
  gift_high_five: 15,
  gift_fist_bump: 20,
  gift_friendship_band: 35,
  gift_warm_hug: 50,
  gift_party_popper: 75,
  gift_friendship_trophy: 120,
  gift_duo_motorcycle: 350,

  // Festival Gifts
  gift_holi_pichkari: 80,
  gift_rakhi: 90,
  gift_makar_kite: 100,

  // Heritage, Music & Attire (40 - 100 coins)
  gift_pheta: 40,
  gift_nath: 45,
  gift_powada: 50,
  gift_lezim: 50,
  gift_nauvari: 50,
  gift_diwali_lantern: 50,
  gift_diwali_rangoli: 50,
  gift_tutari: 60,
  gift_diya_shower: 60,
  gift_dhol_tasha: 65,
  gift_sahyadri_peaks: 70,
  gift_wari_dindi: 75,
  gift_torana: 80,
  gift_ashadhi_dindi: 80,
  gift_kartiki_dindi: 80,
  gift_paithani_saree: 85,
  gift_kolhapuri_saaj: 85,
  gift_fort_gate: 90,
  gift_pandharpur_theme: 90,

  // Grand Celebrations & Forts (120 - 350 coins)
  gift_maha_map: 150,
  gift_ganeshotsav_deco: 150,
  gift_gudi_celebration: 150,
  gift_warli_celebration: 150,
  gift_killa_toran: 160,
  gift_ganpati_modak_tray: 180,
  gift_lezim_celebration: 180,
  gift_dhol_celebration: 200,
  gift_paithani_peacock: 200,
  gift_shiv_jayanti_deco: 250,
  gift_sahyadri_sunrise: 250,
  gift_dhol_tasha_blast: 250,
  gift_talwar_shield: 300,
  gift_maha_pride_badge: 300,
  gift_maha_star: 350,

  // Royal Treasures (400 - 1000 coins)
  gift_golden_pheta: 450,
  gift_royal_paithani: 500,
  gift_royal_crown: 750,
  gift_fort_celebration: 1000
};

// In-memory catalog cache synchronized with server / Firebase
let catalogCache: CatalogGift[] = [];
let catalogInitialized = false;

/**
 * Build initial catalog from PREMIUM_GIFTS with authoritative prices
 */
export function getInitialCatalog(): CatalogGift[] {
  return PREMIUM_GIFTS.map((g) => {
    const defaultPrice = DEFAULT_GIFT_PRICES[g.id] || (g as any).basePrice || (g as any).coinPrice || 25;
    const cat = (g as any).giftCategory || (
      g.culturalTheme?.includes('प्रेम') ? 'love' :
      g.culturalTheme?.includes('मैत्री') ? 'friendship' :
      g.culturalTheme?.includes('सण') || g.culturalTheme?.includes('उत्सव') ? 'festival' : 'heritage'
    );
    return {
      id: g.id,
      nameMr: g.nameMr,
      nameEn: g.nameEn,
      category: 'gifts',
      giftCategory: cat,
      culturalTheme: g.culturalTheme,
      previewIcon: g.previewIcon || '🎁',
      descriptionMr: g.descriptionMr,
      animation: g.animation,
      accentColor: g.accentColor,
      tagMr: g.tagMr,
      coinPrice: (g as any).marketPrice || defaultPrice,
      basePrice: (g as any).basePrice || defaultPrice,
      marketPrice: (g as any).marketPrice || defaultPrice,
      priceChangePercent: (g as any).priceChangePercent || 0,
      marketTrend: (g as any).marketTrend || 'STABLE',
      active: true,
      updatedAt: new Date().toISOString()
    };
  });
}

/**
 * Get single gift authoritative price
 */
export function getGiftPrice(giftId: string): number {
  if (catalogCache.length > 0) {
    const item = catalogCache.find((c) => c.id === giftId);
    if (item && item.coinPrice) return item.coinPrice;
  }
  return DEFAULT_GIFT_PRICES[giftId] || 25;
}

/**
 * Fetch authoritative gift catalog from backend API
 */
export async function fetchLiveGiftCatalog(): Promise<CatalogGift[]> {
  try {
    const res = await fetch('/api/gifts');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.gifts) && data.gifts.length > 0) {
        catalogCache = data.gifts;
        catalogInitialized = true;
        return catalogCache;
      }
    }
  } catch (err) {
    console.warn('[GiftCatalog] Fallback to default catalog:', err);
  }

  if (!catalogInitialized) {
    catalogCache = getInitialCatalog();
    catalogInitialized = true;
  }

  return catalogCache;
}

/**
 * Admin update gift price or active status
 */
export async function updateCatalogGift(
  giftId: string, 
  updates: { coinPrice?: number; active?: boolean; nameMr?: string; culturalTheme?: string },
  idToken?: string
): Promise<{ success: boolean; gift?: CatalogGift; error?: string }> {
  try {
    const res = await fetch('/api/admin/gifts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({
        giftId,
        ...updates
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // Update local cache
      const index = catalogCache.findIndex((g) => g.id === giftId);
      if (index !== -1 && data.gift) {
        catalogCache[index] = data.gift;
      }
      return { success: true, gift: data.gift };
    }
    return { success: false, error: data.error || 'किंमत अपडेट करताना त्रुटी आली.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'नेटवर्क त्रुटी.' };
  }
}

/**
 * Fetch live market category rates and price fluctuation regime
 */
export async function fetchLiveMarketRates(): Promise<{
  mode: string;
  headlineMr: string;
  updatedAt: string;
  categories: MarketCategoryRate[];
} | null> {
  try {
    const res = await fetch('/api/gifts/market-rates');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        return {
          mode: data.mode || 'ROMANCE_FEST',
          headlineMr: data.headlineMr || '',
          updatedAt: data.updatedAt || new Date().toISOString(),
          categories: data.categories
        };
      }
    }
  } catch (err) {
    console.warn('[GiftCatalog] Error fetching market rates:', err);
  }
  return null;
}

/**
 * Admin update market regime or custom category fluctuation
 */
export async function updateMarketRegime(params: {
  mode?: string;
  category?: string;
  percent?: number;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/gifts/market-regime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.ok;
  } catch {
    return false;
  }
}

