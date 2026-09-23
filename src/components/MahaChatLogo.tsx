import React, { useState } from 'react';
const CULTURE_LOGO_URL = '/assets/mahachat_logo.jpg';

export interface MahaChatLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showTagline?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
  showText?: boolean;
  showDevanagari?: boolean;
  variant?: 'emblem' | 'rounded' | 'badge';
}

export const MahaChatLogo: React.FC<MahaChatLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  theme = 'light',
  showText = true,
  showDevanagari = false,
  variant = 'emblem'
}) => {
  const [imageError, setImageError] = useState(false);

  // Size mapping
  const iconSizes: Record<string, { box: string; px: number }> = {
    sm: { box: 'w-7 h-7', px: 28 },
    md: { box: 'w-10 h-10', px: 40 },
    lg: { box: 'w-16 h-16', px: 64 },
    xl: { box: 'w-24 h-24', px: 96 }
  };

  const textSizes: Record<string, string> = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const isNumeric = typeof size === 'number';
  const sizeConfig = isNumeric 
    ? { box: '', px: size }
    : (iconSizes[size] || iconSizes.md);

  const textSizeClass = isNumeric 
    ? (size >= 50 ? 'text-4xl' : size >= 36 ? 'text-2xl' : 'text-xl')
    : (textSizes[size] || 'text-2xl');

  const numericStyle = isNumeric ? { width: `${size}px`, height: `${size}px` } : undefined;
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-2.5">
        {/* Cultural Logo Emblem Container */}
        <div
          className={`${sizeConfig.box} relative flex items-center justify-center shrink-0 overflow-hidden group shadow-md transition-transform duration-300 hover:scale-105 ${
            variant === 'rounded' 
              ? 'rounded-2xl' 
              : 'rounded-[26%] shadow-orange-500/20'
          } border-2 border-amber-400/80 bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 p-0.5`}
          style={numericStyle}
          title="MahaChat - महाराष्ट्राची संस्कृती व संवाद"
        >
          {/* Outer glowing border ring */}
          <div className="absolute inset-0 rounded-[24%] border border-amber-300/40 pointer-events-none" />

          {!imageError ? (
            <img
              src={CULTURE_LOGO_URL}
              alt="MahaChat Cultural Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center rounded-[22%]"
              onError={() => setImageError(true)}
            />
          ) : (
            /* Cultural Vector Fallback: Rajmudra Octagon + Saffron Pheta & Chat Bubble */
            <svg viewBox="0 0 100 100" fill="none" className="w-[85%] h-[85%] drop-shadow-md">
              <defs>
                <linearGradient id="bhagwaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF3C7" />
                  <stop offset="50%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>

              {/* Rajmudra Octagon Outer Border */}
              <polygon
                points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
                fill="#7F1D1D"
                stroke="url(#goldGrad)"
                strokeWidth="3.5"
              />
              
              {/* Inner Octagon */}
              <polygon
                points="32,10 68,10 90,32 90,68 68,90 32,90 10,68 10,32"
                fill="url(#bhagwaGrad)"
                stroke="url(#goldGrad)"
                strokeWidth="1.5"
              />

              {/* Chat Bubble Silhouette */}
              <path
                d="M50 24C35 24 24 33 24 45C24 51.5 27.5 57 33 60.5L30 72L42 65.5C44.5 66 47.2 66.5 50 66.5C65 66.5 76 57.5 76 45C76 32.5 65 24 50 24Z"
                fill="#FFFBEB"
              />

              {/* Maratha Pheta / Pagadi Crest inside Chat Bubble */}
              <path
                d="M40 38C44 32 56 32 60 38C62 41 58 46 50 47C42 46 38 41 40 38Z"
                fill="#EA580C"
              />
              <path
                d="M50 32C52 28 54 26 57 26C55 29 54 31 53 34L50 32Z"
                fill="#FBBF24"
              />

              {/* Chat Communication Dots / Sun Rays */}
              <circle cx="40" cy="51" r="3.2" fill="#D97706" />
              <circle cx="50" cy="51" r="3.2" fill="#EA580C" />
              <circle cx="60" cy="51" r="3.2" fill="#D97706" />
              
              {/* Golden Tutari Curve accent */}
              <path
                d="M26 68Q20 74 22 79Q25 82 32 78"
                stroke="url(#goldGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* Saffron flag mini-badge at top-right corner on larger displays */}
          {sizeConfig.px >= 48 && (
            <div className="absolute -top-1 -right-1 bg-amber-400 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow border border-white">
              🚩
            </div>
          )}
        </div>

        {/* Wordmark */}
        {showText && (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className={`font-black tracking-tight font-sans ${textSizeClass}`}>
                <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>Maha</span>
                <span className={isDark ? 'text-amber-300' : 'text-amber-500'}>Chat</span>
              </span>
              <span className="text-sm font-extrabold text-amber-500/90 drop-shadow-xs">🚩</span>
            </div>

            {/* Devanagari authentic Maharashtrian script */}
            {(showDevanagari || sizeConfig.px >= 48) && (
              <span className={`text-[11px] font-bold tracking-wider ${isDark ? 'text-amber-200/90' : 'text-orange-950/80'} mt-0.5`}>
                महाचॅट • महाराष्ट्र कट्टा
              </span>
            )}
          </div>
        )}
      </div>

      {showTagline && (
        <div className="mt-2 flex flex-col items-center">
          <p className={`text-xs sm:text-sm font-semibold tracking-wide text-center px-4 ${isDark ? 'text-amber-100' : 'text-slate-700'}`}>
            महाराष्ट्रातील प्रत्येक जिल्ह्याचा स्वतंत्र चॅट रूम
          </p>
          <span className="text-[11px] text-amber-600 font-bold mt-0.5 flex items-center gap-1">
            <span>सह्याद्रीचा अभिमान, मराठी मनाचा संवाद</span>
          </span>
        </div>
      )}
    </div>
  );
};
