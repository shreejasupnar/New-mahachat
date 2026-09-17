import React from 'react';
import { InnovativeFrameStyle, getInnovativeFrameByVip, findInnovativeFrameById } from '../../data/innovativeFramesData';

interface InnovativeFrameProps {
  vipLevel?: number;
  frameId?: string;
  style?: InnovativeFrameStyle;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'seat';
  showBadge?: boolean;
  showCrest?: boolean;
  overlayOnly?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const InnovativeFrame: React.FC<InnovativeFrameProps> = ({
  vipLevel = 1,
  frameId,
  style = 'fusion',
  isSpeaking = false,
  size = 'md',
  showBadge = true,
  showCrest = true,
  overlayOnly = false,
  className = '',
  children
}) => {
  // If frameId is provided, resolve the tier & style automatically
  let resolvedTier = getInnovativeFrameByVip(vipLevel);
  let resolvedStyle = style;

  if (frameId) {
    const found = findInnovativeFrameById(frameId);
    if (found) {
      resolvedTier = found.tier;
      resolvedStyle = found.style;
    }
  }

  const { wings, mandala, auraGlow, crestIcon } = resolvedTier;
  const level = resolvedTier.vipLevel;

  // Sizing definitions for circular avatar inside
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-10 h-10',
          avatarRadius: 20,
          wingsScale: 'scale-[0.55]',
          mandalaScale: 'scale-[0.6]',
          badgeText: 'text-[7px] px-1 py-0',
          crestPos: '-top-3 text-[10px]'
        };
      case 'lg':
        return {
          container: 'w-18 h-18 sm:w-20 sm:h-20',
          avatarRadius: 38,
          wingsScale: 'scale-[0.95]',
          mandalaScale: 'scale-[1.0]',
          badgeText: 'text-[9px] px-2 py-0.5',
          crestPos: '-top-4 text-xs'
        };
      case 'xl':
        return {
          container: 'w-24 h-24 sm:w-28 sm:h-28',
          avatarRadius: 52,
          wingsScale: 'scale-[1.25]',
          mandalaScale: 'scale-[1.3]',
          badgeText: 'text-[10px] px-2.5 py-0.5',
          crestPos: '-top-5 text-sm'
        };
      case 'seat':
        return {
          container: 'w-full h-full',
          avatarRadius: 30,
          wingsScale: 'scale-[0.85]',
          mandalaScale: 'scale-[0.9]',
          badgeText: 'text-[8px] px-1.5 py-0.2',
          crestPos: '-top-3.5 text-[11px]'
        };
      case 'md':
      default:
        return {
          container: 'w-13 h-13 sm:w-15 sm:h-15',
          avatarRadius: 30,
          wingsScale: 'scale-[0.8]',
          mandalaScale: 'scale-[0.85]',
          badgeText: 'text-[8px] px-1.5 py-0.2',
          crestPos: '-top-3.5 text-[11px]'
        };
    }
  };

  const sz = getSizeStyles();

  // Color Gradients
  const [wingsColor1, wingsColor2, wingsGlow] = wings.gradient;
  const [mandalaColor1, mandalaColor2, mandalaGlow] = mandala.gradient;

  const renderWings = () => (
    <div
      className={`absolute inset-0 pointer-events-none flex items-center justify-between z-0 transition-transform duration-300 ${sz.wingsScale} ${
        isSpeaking ? 'scale-110' : 'scale-100'
      }`}
      style={{
        filter: `drop-shadow(0 0 10px ${wingsGlow}) drop-shadow(0 0 4px ${wingsColor1})`
      }}
    >
      {/* LEFT WING */}
      <div 
        className="absolute -left-12 sm:-left-14 top-1/2 -translate-y-1/2 w-16 sm:w-20 h-20 sm:h-24 transition-all duration-300 origin-right"
        style={{
          animation: isSpeaking 
            ? 'wingFlapFast 0.6s ease-in-out infinite alternate' 
            : 'wingFloatSlow 3.2s ease-in-out infinite alternate'
        }}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`leftWingGrad_${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={wingsGlow} stopOpacity="1" />
              <stop offset="50%" stopColor={wingsColor1} stopOpacity="0.9" />
              <stop offset="100%" stopColor={wingsColor2} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id={`featherGradL_${level}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="30%" stopColor={wingsGlow} stopOpacity="0.8" />
              <stop offset="100%" stopColor={wingsColor1} stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Wing Base Plume */}
          <path
            d="M 90 60 C 60 40, 20 20, 5 5 C 10 30, 25 55, 45 70 C 65 80, 85 75, 90 60 Z"
            fill={`url(#leftWingGrad_${level})`}
            stroke={wingsGlow}
            strokeWidth="1.2"
          />

          {/* Primary Top Flight Feather */}
          <path
            d="M 90 55 C 55 30, 15 10, 0 0 C 15 25, 35 45, 60 58 Z"
            fill={`url(#featherGradL_${level})`}
            opacity="0.9"
          />

          {/* Secondary Feathers */}
          <path
            d="M 90 65 C 65 55, 30 45, 10 32 C 22 52, 45 68, 75 75 Z"
            fill={`url(#leftWingGrad_${level})`}
            opacity="0.85"
          />
          <path
            d="M 88 72 C 65 65, 35 60, 20 52 C 30 70, 52 82, 80 84 Z"
            fill={`url(#leftWingGrad_${level})`}
            opacity="0.8"
          />

          {/* Higher VIP extra feather layers (VIP 4+) */}
          {level >= 4 && (
            <path
              d="M 85 80 C 65 78, 40 75, 30 70 C 40 85, 60 95, 82 92 Z"
              fill={`url(#featherGradL_${level})`}
              opacity="0.75"
            />
          )}
          {level >= 7 && (
            <path
              d="M 80 88 C 65 88, 48 88, 40 86 C 50 100, 68 108, 80 100 Z"
              fill={wingsGlow}
              opacity="0.9"
            />
          )}

          {/* Sparkling Feather Quill Spine Lines */}
          <path
            d="M 90 60 Q 45 35 5 5"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 88 68 Q 50 50 15 32"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Feather Glow Gem on Wing Joint */}
          <circle cx="88" cy="62" r={level >= 5 ? 4 : 3} fill={wingsGlow} filter="drop-shadow(0 0 6px #FFF)" />
        </svg>
      </div>

      {/* RIGHT WING */}
      <div 
        className="absolute -right-12 sm:-right-14 top-1/2 -translate-y-1/2 w-16 sm:w-20 h-20 sm:h-24 transition-all duration-300 origin-left"
        style={{
          animation: isSpeaking 
            ? 'wingFlapFast 0.6s ease-in-out infinite alternate' 
            : 'wingFloatSlow 3.2s ease-in-out infinite alternate'
        }}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`rightWingGrad_${level}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={wingsGlow} stopOpacity="1" />
              <stop offset="50%" stopColor={wingsColor1} stopOpacity="0.9" />
              <stop offset="100%" stopColor={wingsColor2} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id={`featherGradR_${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="30%" stopColor={wingsGlow} stopOpacity="0.8" />
              <stop offset="100%" stopColor={wingsColor1} stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Wing Base Plume */}
          <path
            d="M 10 60 C 40 40, 80 20, 95 5 C 90 30, 75 55, 55 70 C 35 80, 15 75, 10 60 Z"
            fill={`url(#rightWingGrad_${level})`}
            stroke={wingsGlow}
            strokeWidth="1.2"
          />

          {/* Primary Top Flight Feather */}
          <path
            d="M 10 55 C 45 30, 85 10, 100 0 C 85 25, 65 45, 40 58 Z"
            fill={`url(#featherGradR_${level})`}
            opacity="0.9"
          />

          {/* Secondary Feathers */}
          <path
            d="M 10 65 C 35 55, 70 45, 90 32 C 78 52, 55 68, 25 75 Z"
            fill={`url(#rightWingGrad_${level})`}
            opacity="0.85"
          />
          <path
            d="M 12 72 C 35 65, 65 60, 80 52 C 70 70, 48 82, 20 84 Z"
            fill={`url(#rightWingGrad_${level})`}
            opacity="0.8"
          />

          {/* Higher VIP extra feather layers (VIP 4+) */}
          {level >= 4 && (
            <path
              d="M 15 80 C 35 78, 60 75, 70 70 C 60 85, 40 95, 18 92 Z"
              fill={`url(#featherGradR_${level})`}
              opacity="0.75"
            />
          )}
          {level >= 7 && (
            <path
              d="M 20 88 C 35 88, 52 88, 60 86 C 50 100, 32 108, 20 100 Z"
              fill={wingsGlow}
              opacity="0.9"
            />
          )}

          {/* Sparkling Feather Quill Spine Lines */}
          <path
            d="M 10 60 Q 55 35 95 5"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 12 68 Q 50 50 85 32"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Feather Glow Gem on Wing Joint */}
          <circle cx="12" cy="62" r={level >= 5 ? 4 : 3} fill={wingsGlow} filter="drop-shadow(0 0 6px #FFF)" />
        </svg>
      </div>
    </div>
  );

  const renderMandala = () => {
    const petals = mandala.petalsCount;
    const step = 360 / petals;

    return (
      <div 
        className={`absolute inset-0 pointer-events-none flex items-center justify-center z-10 ${sz.mandalaScale}`}
      >
        {/* Outer Rotating Mandala Petal Ring */}
        <div 
          className="absolute -inset-4 sm:-inset-5 rounded-full flex items-center justify-center animate-spin"
          style={{
            animationDuration: isSpeaking ? '9s' : '18s',
            animationTimingFunction: 'linear'
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`mandalaGrad_${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={mandalaGlow} />
                <stop offset="60%" stopColor={mandalaColor1} />
                <stop offset="100%" stopColor={mandalaColor2} />
              </linearGradient>
            </defs>

            {/* Concentric Petals Loop */}
            {Array.from({ length: petals }).map((_, i) => {
              const angle = i * step;
              return (
                <g key={i} transform={`rotate(${angle} 100 100)`}>
                  {/* Lotus / Flame / Chakra Petal Geometry */}
                  {mandala.geometryType === 'flame' ? (
                    <path
                      d="M 100 12 C 94 30, 88 42, 94 54 C 98 46, 102 46, 106 54 C 112 42, 106 30, 100 12 Z"
                      fill={`url(#mandalaGrad_${level})`}
                      stroke={mandalaGlow}
                      strokeWidth="0.8"
                      opacity={0.85}
                    />
                  ) : mandala.geometryType === 'rajmudra' ? (
                    <path
                      d="M 100 8 L 93 24 L 97 38 L 100 32 L 103 38 L 107 24 Z"
                      fill={`url(#mandalaGrad_${level})`}
                      stroke="#FFFFFF"
                      strokeWidth="0.8"
                      opacity={0.9}
                    />
                  ) : mandala.geometryType === 'kalachakra' ? (
                    <g>
                      <path
                        d="M 100 6 C 90 22, 85 36, 96 46 C 100 40, 100 40, 104 46 C 115 36, 110 22, 100 6 Z"
                        fill={`url(#mandalaGrad_${level})`}
                        stroke="#FFF"
                        strokeWidth="1"
                      />
                      <circle cx="100" cy="8" r="2.5" fill="#FFF" />
                    </g>
                  ) : (
                    /* Classic Lotus / Chakra / Star Petals */
                    <path
                      d="M 100 14 C 92 28, 88 40, 95 48 C 100 44, 100 44, 105 48 C 112 40, 108 28, 100 14 Z"
                      fill={`url(#mandalaGrad_${level})`}
                      stroke={mandalaGlow}
                      strokeWidth="0.7"
                      opacity={0.85}
                    />
                  )}

                  {/* Bindu Bead Tips */}
                  <circle cx="100" cy="18" r="1.8" fill="#FFFFFF" opacity="0.9" />
                </g>
              );
            })}

            {/* Outer Concentric Geometric Wire Ring */}
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke={mandalaGlow}
              strokeWidth="1.2"
              strokeDasharray={level >= 4 ? '3 3' : 'none'}
              opacity="0.7"
            />
            <circle
              cx="100"
              cy="100"
              r="66"
              fill="none"
              stroke={mandalaColor1}
              strokeWidth="1.4"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* Inner Counter-Rotating Sacred Filigree Chakra Ring */}
        <div 
          className="absolute -inset-1 sm:-inset-1.5 rounded-full flex items-center justify-center animate-spin"
          style={{
            animationDuration: isSpeaking ? '6s' : '12s',
            animationDirection: 'reverse',
            animationTimingFunction: 'linear'
          }}
        >
          <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible opacity-80">
            {Array.from({ length: Math.min(petals, 16) }).map((_, i) => {
              const angle = i * (360 / Math.min(petals, 16));
              return (
                <g key={i} transform={`rotate(${angle} 80 80)`}>
                  <line
                    x1="80"
                    y1="22"
                    x2="80"
                    y2="34"
                    stroke={mandalaGlow}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="24" r="1.5" fill="#FFF" />
                </g>
              );
            })}
            <circle
              cx="80"
              cy="80"
              r="58"
              fill="none"
              stroke={mandalaGlow}
              strokeWidth="1"
              strokeDasharray="4 2"
              opacity="0.85"
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none ${sz.container} ${className}`}>
      {/* Background Radial Aura Glow - Hollow center so DP stays 100% clear */}
      <div 
        className="absolute -inset-2 rounded-full blur-md pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle, transparent 42%, ${auraGlow} 72%, transparent 95%)`,
          opacity: isSpeaking ? 0.95 : 0.65,
          transform: isSpeaking ? 'scale(1.2)' : 'scale(1.0)'
        }}
      />

      {/* 1. WINGS LAYER (Rendered if 'wings' or 'fusion') */}
      {(resolvedStyle === 'wings' || resolvedStyle === 'fusion') && renderWings()}

      {/* 2. MANDALA LAYER (Rendered if 'mandala' or 'fusion') */}
      {(resolvedStyle === 'mandala' || resolvedStyle === 'fusion') && renderMandala()}

      {/* 3. CORE AVATAR RING BORDER */}
      <div
        className={`absolute inset-0 rounded-full border-2 transition-all duration-300 z-10 pointer-events-none ${
          isSpeaking ? 'scale-105 shadow-xl' : 'scale-100 shadow-md'
        }`}
        style={{
          borderColor: mandalaGlow,
          borderWidth: level >= 5 ? '3px' : '2px',
          boxShadow: `0 0 ${isSpeaking ? '22px' : '12px'} ${auraGlow}`
        }}
      />

      {/* 4. TOP SUMMIT CREST (Crown / Falcon / Diamond / Sunburst) */}
      {showCrest && (
        <div 
          className={`absolute ${sz.crestPos} left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] filter pointer-events-none animate-bounce flex items-center justify-center`}
          style={{ animationDuration: '2.5s' }}
        >
          <span className="leading-none select-none">{crestIcon}</span>
        </div>
      )}

      {/* 5. BOTTOM VIP LEVEL BADGE */}
      {showBadge && (
        <div 
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full font-black uppercase tracking-tighter border shadow-md leading-none z-30 whitespace-nowrap flex items-center gap-0.5 ${sz.badgeText}`}
          style={{
            background: 'linear-gradient(135deg, #0F172A, #020617)',
            borderColor: mandalaGlow,
            color: '#FFF',
            boxShadow: `0 0 8px ${mandalaGlow}`
          }}
        >
          <span style={{ color: mandalaGlow }}>VIP</span>
          <span className="font-extrabold">{level}</span>
        </div>
      )}

      {/* 6. USER AVATAR / CONTENT CONTAINER (Only rendered if children exists and not in overlay-only mode) */}
      {children && !overlayOnly ? (
        <div className="w-full h-full rounded-full overflow-hidden relative z-0 flex items-center justify-center">
          {children}
        </div>
      ) : null}

      {/* Inline styles for wing flap animations */}
      <style>{`
        @keyframes wingFlapFast {
          0% { transform: translateY(-50%) rotate(-4deg) scale(1.0); }
          100% { transform: translateY(-50%) rotate(8deg) scale(1.12); }
        }
        @keyframes wingFloatSlow {
          0% { transform: translateY(-50%) rotate(-2deg) scale(1.0); }
          100% { transform: translateY(-50%) rotate(3deg) scale(1.04); }
        }
      `}</style>
    </div>
  );
};
