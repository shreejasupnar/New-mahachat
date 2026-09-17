import React from 'react';
import { EffectRarity } from '../types';
import { findInnovativeFrameById } from '../../data/innovativeFramesData';
import { InnovativeFrame } from '../../components/vip/InnovativeFrame';

interface AvatarFrameOverlayProps {
  rarity?: EffectRarity | 'none';
  frameId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  showCrown?: boolean;
}

export const AvatarFrameOverlay: React.FC<AvatarFrameOverlayProps> = ({
  rarity = 'none',
  frameId,
  size = 'md',
  children,
  showCrown = false
}) => {
  // If frameId is an innovative Wings/Mandala/Fusion frame, use InnovativeFrame
  const innovativeMatch = frameId ? findInnovativeFrameById(frameId) : null;
  if (innovativeMatch) {
    return (
      <InnovativeFrame
        vipLevel={innovativeMatch.tier.vipLevel}
        style={innovativeMatch.style}
        size={size}
        showCrest={showCrown || innovativeMatch.tier.vipLevel >= 3}
        showBadge={innovativeMatch.tier.vipLevel >= 2}
      >
        {children}
      </InnovativeFrame>
    );
  }

  // Infer rarity from frameId if present
  let resolvedRarity = rarity;
  if (frameId) {
    if (frameId.includes('vip')) resolvedRarity = 'vip';
    else if (frameId.includes('legendary') || frameId.includes('shahi') || frameId.includes('gold')) resolvedRarity = 'legendary';
    else if (frameId.includes('epic') || frameId.includes('fire')) resolvedRarity = 'epic';
    else if (frameId.includes('rare') || frameId.includes('emerald')) resolvedRarity = 'rare';
    else if (frameId.includes('common') || frameId.includes('bronze')) resolvedRarity = 'common';
  }


  const getContainerSize = () => {
    switch (size) {
      case 'sm': return 'w-10 h-10';
      case 'lg': return 'w-16 h-16 sm:w-18 sm:h-18';
      case 'xl': return 'w-20 h-20 sm:w-24 sm:h-24';
      case 'md':
      default: return 'w-13 h-13 sm:w-15 sm:h-15';
    }
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${getContainerSize()}`}>
      {/* Crown / Top Insignia for Legendary and VIP frames */}
      {(showCrown || resolvedRarity === 'legendary' || resolvedRarity === 'vip') && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 text-xs drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-bounce select-none pointer-events-none">
          {resolvedRarity === 'vip' ? '👑' : '✨'}
        </div>
      )}

      {/* Frame Ring Overlays around Avatar */}
      {resolvedRarity === 'common' && (
        <div className="absolute inset-0 rounded-full border-2 border-amber-600/50 shadow-[0_0_8px_rgba(217,119,6,0.3)] pointer-events-none z-10" />
      )}

      {resolvedRarity === 'rare' && (
        <div className="absolute -inset-0.5 rounded-full ring-2 ring-emerald-400/80 shadow-[0_0_14px_rgba(52,211,153,0.5)] pointer-events-none z-10" />
      )}

      {resolvedRarity === 'epic' && (
        <div className="absolute -inset-1 rounded-full ring-3 ring-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.7)] animate-pulse pointer-events-none z-10" />
      )}

      {resolvedRarity === 'legendary' && (
        <>
          <div className="absolute -inset-1 rounded-full ring-3 ring-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.85)] pointer-events-none z-10" />
          <div className="absolute -inset-1.5 rounded-full border border-amber-300/40 animate-spin [animation-duration:8s] pointer-events-none z-10" />
        </>
      )}

      {resolvedRarity === 'vip' && (
        <>
          <div className="absolute -inset-1.5 rounded-full ring-3 ring-purple-400 shadow-[0_0_28px_rgba(192,132,252,0.85)] pointer-events-none z-10" />
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-amber-400/60 animate-spin [animation-duration:12s] pointer-events-none z-10" />
        </>
      )}

      {/* User Photo Container - Untouched, uncropped, preserved ratio */}
      <div className="w-full h-full rounded-full overflow-hidden relative z-0 flex items-center justify-center bg-slate-800">
        {children}
      </div>
    </div>
  );
};
