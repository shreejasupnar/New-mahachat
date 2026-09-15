import { Advertisement, DEFAULT_ADVERTISEMENT } from '../types';
import { INITIAL_ACTIVE_ADS } from '../data/sampleAds';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const LOCAL_STORAGE_ADS_KEY = 'mahachat_advertisements_v2';
const LOCAL_STORAGE_LAST_AD_KEY = 'mahachat_last_loaded_ad_v2';
const LOCAL_STORAGE_OVERRIDE_MODE_KEY = 'mahachat_ads_override_mode'; // 'auto' | 'default_only' | 'single' | 'full'

// In-memory image cache to prevent redownloading
const imagePreloadCache = new Set<string>();

/**
 * Preload an image URL into browser cache
 */
export function preloadAdImage(url: string): Promise<boolean> {
  if (!url) return Promise.resolve(false);
  if (imagePreloadCache.has(url)) return Promise.resolve(true);

  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imagePreloadCache.add(url);
      resolve(true);
    };
    img.onerror = () => {
      console.warn(`[Ads] Failed to preload image: ${url}`);
      resolve(false);
    };
  });
}

/**
 * Get cached ads from local storage, strictly filtering out any old mock / sample ads
 */
export function getLocalCachedAds(): Advertisement[] {
  try {
    // Clear old v1 mock cache if present
    if (localStorage.getItem('mahachat_advertisements_v1')) {
      localStorage.removeItem('mahachat_advertisements_v1');
      localStorage.removeItem('mahachat_last_loaded_ad_v1');
    }

    const stored = localStorage.getItem(LOCAL_STORAGE_ADS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Exclude mock ads (like Pune Misal or ad_00*)
        return parsed.filter(ad => 
          ad && 
          !ad.adId?.startsWith('ad_00') && 
          !ad.title?.includes('मिसळ') &&
          !ad.title?.includes('फूड महोत्सव')
        );
      }
    }
  } catch (e) {
    console.warn('[Ads] Error reading local ads cache:', e);
  }
  return [];
}

/**
 * Save ads to local storage
 */
export function saveLocalCachedAds(ads: Advertisement[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ADS_KEY, JSON.stringify(ads));
  } catch (e) {
    console.warn('[Ads] Error saving local ads cache:', e);
  }
}

/**
 * Filter and sort active advertisements according to business logic:
 * - isActive === true
 * - startDate <= now <= endDate
 * - sorted by priority (highest first), then by createdAt desc
 */
export function filterAndSortActiveAds(ads: Advertisement[]): Advertisement[] {
  const now = new Date().toISOString();
  
  return ads
    .filter((ad) => {
      if (!ad.isActive) return false;
      if (ad.startDate && ad.startDate > now) return false;
      if (ad.endDate && ad.endDate < now) return false;
      return true;
    })
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Hook to subscribe to advertisements with real-time Firebase + offline resilience
 */
export function subscribeToAdvertisements(
  callback: (activeAds: Advertisement[], allAds: Advertisement[]) => void
): () => void {
  let isMounted = true;

  // 1. Immediately provide cached/initial ads for zero latency
  const cached = getLocalCachedAds();
  const overrideMode = localStorage.getItem(LOCAL_STORAGE_OVERRIDE_MODE_KEY) || 'auto';
  
  const deliverAds = (rawAds: Advertisement[]) => {
    if (!isMounted) return;

    let activeList = filterAndSortActiveAds(rawAds);

    // Support Admin Quick Test Modes
    if (overrideMode === 'default_only') {
      activeList = []; // 0 paid ads -> forces default neon board
    } else if (overrideMode === 'single' && activeList.length > 0) {
      activeList = [activeList[0]]; // 1 ad -> forces single static ad
    }

    // Preload all active images
    activeList.forEach((ad) => {
      preloadAdImage(ad.imageUrl);
    });

    callback(activeList, rawAds);
  };

  deliverAds(cached);

  // 2. Attach Firestore real-time listener with error safety
  try {
    const adsRef = collection(db, 'advertisements');
    const unsubscribe = onSnapshot(
      adsRef,
      (snapshot) => {
        if (snapshot.empty) {
          saveLocalCachedAds([]);
          deliverAds([]);
        } else {
          const fetchedAds: Advertisement[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Advertisement;
            if (data && !data.adId?.startsWith('ad_00') && !data.title?.includes('मिसळ') && !data.title?.includes('फूड महोत्सव')) {
              fetchedAds.push(data);
            }
          });
          saveLocalCachedAds(fetchedAds);
          deliverAds(fetchedAds);
        }
      },
      (error) => {
        console.warn('[Ads] Firestore sync fallback to cache:', error);
        deliverAds(getLocalCachedAds());
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  } catch (err) {
    console.warn('[Ads] Firestore init error, using local cache:', err);
    return () => {
      isMounted = false;
    };
  }
}

/**
 * Record an actual impression (called only after ad was rendered for >= 1 second)
 */
export function recordAdImpression(adId: string): void {
  try {
    const key = `ad_imp_${adId}`;
    const lastTime = sessionStorage.getItem(key);
    const now = Date.now();
    // Throttle impression to once per 10s per session per ad
    if (lastTime && now - parseInt(lastTime, 10) < 10000) {
      return;
    }
    sessionStorage.setItem(key, now.toString());

    // Update local cache
    const ads = getLocalCachedAds();
    const target = ads.find((a) => a.adId === adId);
    if (target) {
      target.impressionsCount = (target.impressionsCount || 0) + 1;
      saveLocalCachedAds(ads);
    }

    // Attempt firestore increment
    const docRef = doc(db, 'advertisements', adId);
    updateDoc(docRef, {
      impressionsCount: (target?.impressionsCount || 1)
    }).catch(() => {});
  } catch (e) {
    // Ignore analytics write errors
  }
}

/**
 * Record an actual click on the advertisement
 */
export function recordAdClick(adId: string): void {
  try {
    const ads = getLocalCachedAds();
    const target = ads.find((a) => a.adId === adId);
    if (target) {
      target.clicksCount = (target.clicksCount || 0) + 1;
      saveLocalCachedAds(ads);
    }

    const docRef = doc(db, 'advertisements', adId);
    updateDoc(docRef, {
      clicksCount: (target?.clicksCount || 1)
    }).catch(() => {});
  } catch (e) {
    // Ignore analytics write errors
  }
}

/**
 * Admin: Add or update an advertisement
 */
export async function saveAdvertisement(ad: Advertisement): Promise<void> {
  // Update local cache first
  const current = getLocalCachedAds();
  const existingIndex = current.findIndex((a) => a.adId === ad.adId);
  if (existingIndex >= 0) {
    current[existingIndex] = ad;
  } else {
    current.unshift(ad);
  }
  saveLocalCachedAds(current);

  // Sync to Firestore
  try {
    const docRef = doc(db, 'advertisements', ad.adId);
    await setDoc(docRef, ad);
  } catch (e) {
    console.warn('[Ads] Firestore save fallback to local:', e);
  }
}

/**
 * Admin: Delete an advertisement
 */
export async function deleteAdvertisement(adId: string): Promise<void> {
  const current = getLocalCachedAds().filter((a) => a.adId !== adId);
  saveLocalCachedAds(current);

  try {
    const docRef = doc(db, 'advertisements', adId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('[Ads] Firestore delete fallback:', e);
  }
}

/**
 * Admin: Set override mode for testing
 */
export function setAdsTestMode(mode: 'auto' | 'default_only' | 'single' | 'full'): void {
  localStorage.setItem(LOCAL_STORAGE_OVERRIDE_MODE_KEY, mode);
  window.dispatchEvent(new Event('mahachat_ads_updated'));
}

export function getAdsTestMode(): 'auto' | 'default_only' | 'single' | 'full' {
  return (localStorage.getItem(LOCAL_STORAGE_OVERRIDE_MODE_KEY) as any) || 'auto';
}

/**
 * Store the last successfully loaded ad in localStorage so poor/offline internet keeps it visible
 */
export function saveLastLoadedAd(ad: Advertisement): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_LAST_AD_KEY, JSON.stringify(ad));
  } catch (e) {
    // Ignore
  }
}

export function getLastLoadedAd(): Advertisement {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_LAST_AD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore
  }
  return DEFAULT_ADVERTISEMENT;
}
