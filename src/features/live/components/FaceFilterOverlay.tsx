import React from 'react';
import { LiveFilter } from '../config/filters';

interface FaceFilterOverlayProps {
  filter: LiveFilter;
  className?: string;
}

export const FaceFilterOverlay: React.FC<FaceFilterOverlayProps> = ({
  filter,
  className = '',
}) => {
  if (filter.id === 'none') return null;

  return (
    <div className={`absolute inset-0 pointer-events-none z-10 overflow-hidden ${className}`}>
      {/* Optional Ambience Tint */}
      {filter.tintColor && (
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: filter.tintColor }}
        />
      )}

      {/* Royal Maharashtrian Pheta Overlay */}
      {filter.overlayType === 'pheta' && (
        <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[72%] max-w-[290px] aspect-[16/10] flex flex-col items-center animate-pulse duration-1000">
          <svg viewBox="0 0 240 150" className="w-full h-full drop-shadow-[0_10px_20px_rgba(249,115,22,0.6)]">
            <defs>
              <linearGradient id="phetaOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="35%" stopColor="#f97316" />
                <stop offset="70%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
              <linearGradient id="goldKalgi" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <radialGradient id="jewel" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#881337" />
              </radialGradient>
            </defs>

            {/* Kalgi / Feather on Top */}
            <path
              d="M 120 40 Q 115 10 100 0 Q 120 15 125 40 Z"
              fill="url(#goldKalgi)"
            />
            <path
              d="M 125 40 Q 130 8 142 2 Q 132 18 126 42 Z"
              fill="url(#goldKalgi)"
            />
            {/* Kalgi Brooch */}
            <circle cx="122" cy="42" r="7" fill="url(#jewel)" stroke="#fef08a" strokeWidth="1.5" />

            {/* Pheta Turban Main Folds */}
            <path
              d="M 30 95 C 40 50, 80 40, 120 42 C 160 40, 200 50, 210 95 C 180 115, 60 115, 30 95 Z"
              fill="url(#phetaOrange)"
            />
            <path
              d="M 35 88 C 70 65, 170 65, 205 88 C 175 104, 65 104, 35 88 Z"
              fill="#fb923c"
              opacity="0.9"
            />
            <path
              d="M 45 78 C 80 58, 160 58, 195 78 C 165 92, 75 92, 45 78 Z"
              fill="#fdba74"
              opacity="0.85"
            />

            {/* Saffron Side Tail (शिरपेच / पदर) */}
            <path
              d="M 195 90 C 215 105, 225 140, 218 150 C 210 135, 198 115, 190 98 Z"
              fill="url(#phetaOrange)"
            />

            {/* Golden Pearl Border Band */}
            <path
              d="M 45 96 Q 120 106 195 96"
              stroke="url(#goldKalgi)"
              strokeWidth="4"
              strokeDasharray="2 3"
              fill="none"
            />
          </svg>
        </div>
      )}

      {/* Marathi Chandrakor Tilak Overlay */}
      {filter.overlayType === 'chandrakor' && (
        <div className="absolute top-[28%] left-1/2 -translate-x-1/2 flex flex-col items-center drop-shadow-[0_4px_12px_rgba(225,29,72,0.8)]">
          <svg viewBox="0 0 50 60" className="w-10 h-12">
            <defs>
              <linearGradient id="tilakRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
            </defs>
            {/* Chandrakor Crescent */}
            <path
              d="M 10 24 C 18 36, 32 36, 40 24 C 34 31, 16 31, 10 24 Z"
              fill="url(#tilakRed)"
            />
            {/* Center Dot (बिंदू) */}
            <circle cx="25" cy="18" r="3" fill="url(#tilakRed)" />
          </svg>
        </div>
      )}

      {/* Festive Gulal & Sparkles */}
      {filter.overlayType === 'gulal' && (
        <div className="absolute inset-0">
          <div className="absolute top-10 left-6 w-16 h-16 rounded-full bg-pink-500/20 blur-xl animate-pulse" />
          <div className="absolute top-20 right-8 w-20 h-20 rounded-full bg-rose-500/20 blur-xl animate-pulse delay-300" />
          <div className="absolute bottom-28 left-12 w-24 h-24 rounded-full bg-amber-500/20 blur-xl animate-pulse delay-700" />
          
          {/* Confetti particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                top: `${15 + (i * 7) % 65}%`,
                left: `${10 + (i * 13) % 80}%`,
                backgroundColor: i % 3 === 0 ? '#ec4899' : i % 3 === 1 ? '#f59e0b' : '#f43f5e',
                opacity: 0.7,
                animationDuration: `${1.5 + (i % 4) * 0.5}s`,
                animationDelay: `${(i % 5) * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
