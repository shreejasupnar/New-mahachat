import React, { useState, useEffect, useRef } from 'react';
import { 
  Advertisement, 
  DEFAULT_ADVERTISEMENT 
} from '../types';
import { 
  subscribeToAdvertisements, 
  preloadAdImage, 
  recordAdImpression, 
  recordAdClick,
  saveLastLoadedAd,
  getLastLoadedAd
} from '../services/adsService';
import { DefaultNeonBillboard } from './DefaultNeonBillboard';
import { 
  ExternalLink, 
  Phone, 
  ChevronRight, 
  ChevronLeft, 
  Megaphone,
  MapPin,
  Sparkles
} from 'lucide-react';

interface AdvertisementSlotProps {
  onOpenAdmin?: () => void;
  className?: string;
}

export const AdvertisementSlot: React.FC<AdvertisementSlotProps> = ({
  onOpenAdmin,
  className = ''
}) => {
  const [activeAds, setActiveAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const [offlineFallbackAd, setOfflineFallbackAd] = useState<Advertisement | null>(null);

  // Timer refs
  const timerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const impressionTimerRef = useRef<number | null>(null);

  // 1. Subscribe to active ads in real-time
  useEffect(() => {
    const unsub = subscribeToAdvertisements((ads) => {
      // Filter out ads that permanently failed to load image
      const validAds = ads.filter((ad) => !imageErrorMap[ad.adId]);
      setActiveAds(validAds);
      if (validAds.length > 0) {
        setOfflineFallbackAd(validAds[0]);
        saveLastLoadedAd(validAds[0]);
      } else {
        setOfflineFallbackAd(getLastLoadedAd());
      }
    });

    const handleUpdate = () => {
      // Re-trigger
      const cached = getLastLoadedAd();
      setOfflineFallbackAd(cached);
    };
    window.addEventListener('mahachat_ads_updated', handleUpdate);

    return () => {
      unsub();
      window.removeEventListener('mahachat_ads_updated', handleUpdate);
    };
  }, [imageErrorMap]);

  // Total count of valid active ads in carousel
  const totalAds = activeAds.length;
  const currentAd = totalAds > 0 ? activeAds[currentIndex % totalAds] : null;

  // 2. Preload NEXT advertisement image
  useEffect(() => {
    if (totalAds > 1) {
      const nextIndex = (currentIndex + 1) % totalAds;
      const nextAd = activeAds[nextIndex];
      if (nextAd?.imageUrl) {
        preloadAdImage(nextAd.imageUrl);
      }
    }
  }, [currentIndex, totalAds, activeAds]);

  // 3. Impression Recording: only record after ad is visible for >= 1s
  useEffect(() => {
    if (!currentAd) return;

    if (impressionTimerRef.current) {
      clearTimeout(impressionTimerRef.current);
    }

    impressionTimerRef.current = window.setTimeout(() => {
      recordAdImpression(currentAd.adId);
      saveLastLoadedAd(currentAd);
    }, 1200);

    return () => {
      if (impressionTimerRef.current) {
        clearTimeout(impressionTimerRef.current);
      }
    };
  }, [currentAd?.adId]);

  // 4. Automatic Continuous Carousel Rotation (every 4-5s)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    // If 0 or 1 active ad, do not auto-rotate
    if (totalAds <= 1) {
      setProgress(0);
      return;
    }

    const durationSeconds = currentAd?.displayDuration || 4.5;
    const durationMs = durationSeconds * 1000;
    const intervalStep = 50; // smooth progress update
    let elapsed = 0;

    progressTimerRef.current = window.setInterval(() => {
      if (!isPaused) {
        elapsed += intervalStep;
        const pct = Math.min(100, (elapsed / durationMs) * 100);
        setProgress(pct);
      }
    }, intervalStep);

    timerRef.current = window.setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prev) => (prev + 1) % totalAds);
        setProgress(0);
        elapsed = 0;
      }
    }, durationMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentIndex, totalAds, isPaused, currentAd?.displayDuration]);

  // Handle ad tap / click
  const handleAdClick = () => {
    if (!currentAd) return;

    if (currentAd.targetUrl) {
      recordAdClick(currentAd.adId);
      if (currentAd.targetUrl.startsWith('tel:') || currentAd.targetUrl.startsWith('mailto:')) {
        window.location.href = currentAd.targetUrl;
      } else {
        window.open(currentAd.targetUrl, '_blank', 'noopener,noreferrer');
      }
    } else if (currentAd.contact) {
      window.location.href = `tel:${currentAd.contact}`;
    }
  };

  // Image loading failure handler: skip immediately to next ad without showing broken icon
  const handleImageError = (adId: string) => {
    console.warn(`[Ads] Failed to render image for ad ${adId}, skipping.`);
    setImageErrorMap((prev) => ({ ...prev, [adId]: true }));
    if (totalAds > 1) {
      setCurrentIndex((prev) => (prev + 1) % totalAds);
    }
  };

  // CASE 1: 0 Active Paid Ads -> Render the Contact Us Advertisement Board with contact 7620363213
  if (totalAds === 0 || !currentAd) {
    return (
      <div id="permanent-advertisement-slot" className={`relative w-full ${className}`}>
        <DefaultNeonBillboard onOpenAdmin={onOpenAdmin} />
      </div>
    );
  }

  const adToDisplay = currentAd;

  return (
    <div 
      id="permanent-advertisement-slot"
      className={`relative w-full rounded-3xl overflow-hidden shadow-[0_10px_25px_-5px_rgba(15,23,42,0.4)] border border-slate-700/60 bg-slate-950 text-white select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Aspect Ratio Container (16:9 / responsive banner) with fixed height */}
      <div className="relative w-full h-[168px] sm:h-[188px] overflow-hidden bg-slate-950">
        
        {/* Background Blurred Ambient Glow from Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-110 pointer-events-none transition-all duration-700"
          style={{ backgroundImage: `url(${adToDisplay.imageUrl})` }}
        />

        {/* Foreground Main Commercial Image - perfectly fitted without distortion */}
        <div 
          className={`w-full h-full relative cursor-pointer group ${adToDisplay.targetUrl ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={handleAdClick}
        >
          <img
            key={adToDisplay.adId}
            src={adToDisplay.imageUrl}
            alt={adToDisplay.title}
            onError={() => handleImageError(adToDisplay.adId)}
            className="w-full h-full object-cover object-center transition-opacity duration-500 animate-in fade-in"
            loading="eager"
            decoding="async"
          />

          {/* Subtle Top & Bottom Legibility Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/70 pointer-events-none" />

          {/* Top Bar Floating Badges */}
          <div className="absolute top-2.5 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
            {/* Sponsored / Ad Tag */}
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/50 text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-md">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>प्रायोजित • Sponsored</span>
              </span>

              {adToDisplay.locationMr && (
                <span className="hidden xs:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[9px] font-medium text-slate-300">
                  <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                  <span className="truncate max-w-[110px]">{adToDisplay.locationMr}</span>
                </span>
              )}
            </div>

            {/* Right: Carousel Counter Pill & Admin Shortcut */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {totalAds > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white shadow-xs">
                  {currentIndex + 1}/{totalAds}
                </span>
              )}

              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAdmin();
                  }}
                  title="जाहिरात नियंत्रण (Admin)"
                  className="p-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-colors shadow-xs cursor-pointer"
                >
                  <Megaphone className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Bar: Title, Advertiser Name & Action Button */}
          <div className="absolute bottom-2.5 inset-x-3 z-10 flex items-end justify-between gap-2">
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs sm:text-sm font-black text-white truncate drop-shadow-md">
                {adToDisplay.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-amber-200/90 truncate font-medium drop-shadow-sm">
                {adToDisplay.taglineMr || adToDisplay.advertiserName}
              </p>
            </div>

            {/* CTA Button */}
            <div className="shrink-0 flex items-center gap-1.5 pointer-events-auto">
              {adToDisplay.contact && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${adToDisplay.contact}`;
                  }}
                  className="w-7 h-7 rounded-xl bg-slate-900/90 border border-cyan-400/40 text-cyan-300 hover:text-white flex items-center justify-center shadow-md cursor-pointer active:scale-95"
                  title={`कॉल करा: ${adToDisplay.contact}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
              )}

              {adToDisplay.targetUrl ? (
                <button
                  type="button"
                  onClick={handleAdClick}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-[0_2px_8px_rgba(245,158,11,0.4)] cursor-pointer active:scale-95 border border-amber-200"
                >
                  <span>भेट द्या</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (adToDisplay.contact) {
                      window.location.href = `tel:${adToDisplay.contact}`;
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
                >
                  <span>माहिती</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Smooth Looping Progress Bar at Bottom */}
        {totalAds > 1 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-20 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-amber-300 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Manual Arrow Controls (subtle on hover/tap) */}
      {totalAds > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + totalAds) % totalAds);
              setProgress(0);
            }}
            aria-label="Previous advertisement"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % totalAds);
              setProgress(0);
            }}
            aria-label="Next advertisement"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white/80 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};
