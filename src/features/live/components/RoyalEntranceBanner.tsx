import React, { useEffect, useState } from 'react';
import { Crown, Sparkles, Flame, Shield, Award } from 'lucide-react';

export interface EntranceEvent {
  id: string;
  userName: string;
  userPhoto?: string;
  district?: string;
  vipLevel?: number;
  effectType?: string; // 'royal_palakhi' | 'golden_lion' | 'sports_car' | 'standard'
}

interface RoyalEntranceBannerProps {
  event: EntranceEvent | null;
  onDismiss: () => void;
}

export const RoyalEntranceBanner: React.FC<RoyalEntranceBannerProps> = ({
  event,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 400);
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [event, onDismiss]);

  if (!event || !visible) return null;

  const vipLevel = event.vipLevel || 1;
  const isHighTier = vipLevel >= 3;

  return (
    <div className="absolute top-16 left-0 right-0 z-40 px-3 pointer-events-none flex justify-center animate-in slide-in-from-right duration-500">
      <div className={`relative w-full max-w-sm rounded-2xl overflow-hidden p-2.5 backdrop-blur-xl border shadow-2xl flex items-center gap-3 ${
        isHighTier
          ? 'bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-yellow-950/90 border-amber-400/60 shadow-amber-500/30'
          : 'bg-gradient-to-r from-slate-950/90 via-purple-950/90 to-rose-950/90 border-rose-400/40 shadow-rose-500/20'
      }`}>
        {/* Shimmer sweep animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

        {/* Left Icon / Avatar with VIP Crown */}
        <div className="relative shrink-0">
          {event.userPhoto ? (
            <img
              src={event.userPhoto}
              alt={event.userName}
              className={`w-11 h-11 rounded-full object-cover border-2 shadow-lg ${
                isHighTier ? 'border-amber-400 ring-2 ring-amber-300/40' : 'border-rose-400 ring-2 ring-rose-400/30'
              }`}
            />
          ) : (
            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-base shadow-lg ${
              isHighTier ? 'bg-gradient-to-tr from-amber-600 to-yellow-400' : 'bg-gradient-to-tr from-rose-600 to-purple-500'
            }`}>
              {event.userName.charAt(0)}
            </div>
          )}

          {/* Floating Crown Badge */}
          <div className="absolute -top-1.5 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
            <Crown className="w-3.5 h-3.5 fill-black" />
          </div>
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-sm flex items-center gap-0.5">
              <Crown className="w-2.5 h-2.5 fill-black" />
              VIP {vipLevel}
            </span>
            {event.district && (
              <span className="text-[10px] font-semibold text-amber-200">
                • {event.district}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <h4 className="text-xs font-black text-white truncate drop-shadow-md">
              {event.userName}
            </h4>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin shrink-0" />
          </div>

          <p className="text-[10px] text-amber-100/90 font-medium truncate">
            🚩 शाही पालखी आगमन • मंचावर भव्य स्वागत!
          </p>
        </div>

        {/* Right Chariot / Trophy Icon */}
        <div className="shrink-0 text-xl pl-1">
          {event.effectType === 'golden_lion' ? '🦁' : event.effectType === 'sports_car' ? '🏎️' : '👑'}
        </div>
      </div>
    </div>
  );
};
