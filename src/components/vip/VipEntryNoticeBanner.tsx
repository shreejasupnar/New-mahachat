import React, { useEffect, useState, useRef } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { getVipTier } from '../../data/vipData';
import { VipBadge } from './VipBadge';

interface VipEntryNoticeBannerProps {
  vipLevel: number;
  userName: string;
  userPhoto?: string;
  onDismiss?: () => void;
  durationMs?: number;
  isInline?: boolean;
}

export const VipEntryNoticeBanner: React.FC<VipEntryNoticeBannerProps> = ({
  vipLevel,
  userName,
  userPhoto,
  onDismiss,
  durationMs = 2700,
  isInline = false
}) => {
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    setVisible(true);
    setIsExiting(false);

    // Strictly enforce 2.5s to 3.0s duration (default 2700ms)
    const effectiveDuration = Math.min(Math.max(durationMs, 2500), 3000);

    // Fade out / slide up 350ms before dismissal (at ~2.35s)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(200, effectiveDuration - 350));

    // Fully dismiss and notify parent
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      if (onDismissRef.current) {
        onDismissRef.current();
      }
    }, effectiveDuration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [durationMs, vipLevel]);

  if (!visible || !vipLevel || vipLevel <= 0) return null;

  const tier = getVipTier(vipLevel);
  if (!tier) return null;

  const containerPositionClasses = isInline
    ? 'relative w-full select-none flex justify-center'
    : 'absolute top-16 left-3 right-3 z-40 pointer-events-none select-none flex justify-center';

  return (
    <div 
      className={`${containerPositionClasses} transition-all duration-300 ${
        isExiting ? 'opacity-0 -translate-y-4 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-6 duration-300'
      }`}
    >
      <div 
        className="relative max-w-sm w-full rounded-2xl p-2.5 shadow-2xl border flex items-center gap-3 backdrop-blur-md overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${tier.primaryColor}E6, #0F172AE6)`,
          borderColor: tier.accentColor,
          boxShadow: `0 8px 30px ${tier.glowColor}50`
        }}
      >
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

        {/* User Photo with VIP frame */}
        <div className="relative shrink-0">
          <div 
            className="w-10 h-10 rounded-full overflow-hidden border-2 shadow-md bg-slate-800"
            style={{ borderColor: tier.accentColor }}
          >
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">
                {userName.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1">
            <Crown className="w-3.5 h-3.5 text-yellow-300 drop-shadow-md" />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <VipBadge level={vipLevel} size="xs" />
            <span className="text-xs font-black text-white truncate max-w-[130px]">
              {userName}
            </span>
          </div>
          <div className="text-[11px] font-bold text-yellow-200 truncate mt-0.5">
            {tier.entryBannerTextMr}
          </div>
        </div>

        {/* Right Sparkle motif */}
        <div className="shrink-0 text-yellow-300 pr-1 animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
