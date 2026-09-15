import React from 'react';
import { Crown, Shield, Star, Award, Sparkles } from 'lucide-react';
import { getVipTier } from '../../data/vipData';

interface VipBadgeProps {
  level: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const VipBadge: React.FC<VipBadgeProps> = ({
  level,
  size = 'sm',
  showText = true,
  className = ''
}) => {
  if (!level || level <= 0) return null;

  const tier = getVipTier(level);
  if (!tier) return null;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-0.5 rounded-md',
    sm: 'px-2 py-0.5 text-[10px] gap-1 rounded-lg',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-xl',
    lg: 'px-3.5 py-1.5 text-sm gap-2 rounded-2xl'
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18
  };

  const getIcon = () => {
    const s = iconSizes[size];
    if (level >= 7) return <Crown className="shrink-0 animate-pulse text-yellow-300" style={{ width: s, height: s }} />;
    if (level >= 5) return <Sparkles className="shrink-0 text-cyan-200" style={{ width: s, height: s }} />;
    if (level >= 3) return <Award className="shrink-0 text-amber-200" style={{ width: s, height: s }} />;
    return <Shield className="shrink-0 text-amber-300" style={{ width: s, height: s }} />;
  };

  return (
    <span
      className={`inline-flex items-center font-black tracking-wider uppercase select-none shadow-xs border ${tier.badgeBg} ${tier.badgeBorder} ${tier.badgeTextColor} ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: `0 2px 8px ${tier.glowColor}40`
      }}
      title={`${tier.nameMr} (${tier.nameEn})`}
    >
      {getIcon()}
      {showText && (
        <span className="font-extrabold whitespace-nowrap drop-shadow-xs">
          VIP {level}
        </span>
      )}
    </span>
  );
};
