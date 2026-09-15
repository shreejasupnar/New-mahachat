import React from 'react';
import { Crown, Sparkles, Flame, Shield, Diamond } from 'lucide-react';
import { getVipTier } from '../../data/vipData';

interface VipSeatFrameOverlayProps {
  vipLevel: number;
  isSpeaking?: boolean;
}

export const VipSeatFrameOverlay: React.FC<VipSeatFrameOverlayProps> = ({
  vipLevel,
  isSpeaking = false
}) => {
  if (!vipLevel || vipLevel <= 0) return null;

  const tier = getVipTier(vipLevel);
  if (!tier) return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex items-center justify-center">
      {/* Outer Rotating Glow Aura for high VIP levels */}
      {vipLevel >= 5 && (
        <div 
          className="absolute -inset-2 rounded-full opacity-60 blur-xs animate-spin"
          style={{
            animationDuration: vipLevel >= 7 ? '4s' : '8s',
            background: `conic-gradient(from 0deg, transparent 0deg, ${tier.glowColor} 180deg, transparent 360deg)`
          }}
        />
      )}

      {/* Main VIP Ring border */}
      <div 
        className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
          isSpeaking ? 'scale-105' : 'scale-100'
        }`}
        style={{
          borderColor: tier.accentColor,
          boxShadow: `0 0 ${isSpeaking ? '24px' : '14px'} ${tier.glowColor}`,
          borderWidth: vipLevel >= 6 ? '3px' : '2px'
        }}
      />

      {/* Top Summit Crest or Crown */}
      <div 
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full flex items-center justify-center shadow-lg border text-[9px] font-black z-20"
        style={{
          background: tier.primaryColor,
          borderColor: tier.accentColor,
          color: '#FFFFFF'
        }}
      >
        {vipLevel >= 7 ? (
          <Crown className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
        ) : vipLevel >= 5 ? (
          <Diamond className="w-3 h-3 text-cyan-200" />
        ) : vipLevel >= 3 ? (
          <Crown className="w-3 h-3 text-yellow-200" />
        ) : (
          <Shield className="w-2.5 h-2.5 text-amber-200" />
        )}
      </div>

      {/* Bottom VIP Level Tag */}
      <div 
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded-full text-[8px] font-black uppercase tracking-tighter border shadow-xs leading-none z-20 whitespace-nowrap"
        style={{
          background: '#0F172A',
          borderColor: tier.accentColor,
          color: tier.accentColor
        }}
      >
        VIP {vipLevel}
      </div>
    </div>
  );
};
