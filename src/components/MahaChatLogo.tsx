import React from 'react';

interface MahaChatLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showTagline?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
  showText?: boolean;
}

export const MahaChatLogo: React.FC<MahaChatLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  theme = 'light',
  showText = true
}) => {
  const iconSizes: Record<string, string> = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes: Record<string, string> = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const isNumeric = typeof size === 'number';
  const sizeClass = isNumeric ? '' : (iconSizes[size] || 'w-9 h-9');
  const textSizeClass = isNumeric ? 'text-2xl' : (textSizes[size] || 'text-2xl');
  const numericStyle = isNumeric ? { width: `${size}px`, height: `${size}px` } : undefined;

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-2">
        {/* Chat bubble icon matching mockup */}
        <div 
          className={`${sizeClass} relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm shrink-0 overflow-hidden`}
          style={numericStyle}
        >
          <svg viewBox="0 0 36 36" fill="none" className="w-[72%] h-[72%]">
            <path
              d="M18 4C10.268 4 4 9.82 4 17C4 20.89 5.86 24.34 8.78 26.68L7 32L13.12 30.08C14.67 30.68 16.3 31 18 31C25.732 31 32 25.18 32 17C32 8.82 25.732 4 18 4Z"
              fill="white"
            />
            <circle cx="11.5" cy="17" r="2.2" fill="#2563EB" />
            <circle cx="18" cy="17" r="2.2" fill="#2563EB" />
            <circle cx="24.5" cy="17" r="2.2" fill="#2563EB" />
          </svg>
        </div>

        {/* Wordmark */}
        {showText && (
          <span className={`font-black tracking-tight font-sans ${textSizeClass}`}>
            <span className={isDark ? 'text-white' : 'text-blue-600'}>Maha</span>
            <span className="text-amber-500">Chat</span>
          </span>
        )}
      </div>

      {showTagline && (
        <p className={`mt-1.5 text-xs sm:text-sm font-medium tracking-wide text-center px-4 ${isDark ? 'text-blue-200' : 'text-slate-600'}`}>
          महाराष्ट्रातील प्रत्येक जिल्ह्याचा स्वतंत्र चॅट रूम
        </p>
      )}
    </div>
  );
};
