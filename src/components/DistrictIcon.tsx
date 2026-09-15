import React from 'react';

interface DistrictIconProps {
  type: 'fort' | 'temple' | 'metro' | 'lake' | 'tiger' | 'caves' | 'coast' | 'monument';
  color?: string;
  size?: number;
  className?: string;
}

export const DistrictIcon: React.FC<DistrictIconProps> = ({ 
  type, 
  color = '#2563EB', 
  size = 28, 
  className = '' 
}) => {
  switch (type) {
    case 'fort':
      // Historic Bastion / Fort with flag
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M3 21H21V10L18 8V12L15 8V12L12 8V12L9 8V12L6 8V10L3 12V21Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 8V3M12 3L16 5L12 7" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21V16C9 14.8954 9.89543 14 11 14H13C14.1046 14 15 14.8954 15 16V21" fill="white" stroke={color} strokeWidth="1.8" />
        </svg>
      );
    case 'temple':
      // Mandir / Shikhara
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 2L6 10H18L12 2Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 2V1M12 1L14 2L12 3" stroke="#EA580C" strokeWidth="1.5" />
          <path d="M4 10H20V14H4V10Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.8" />
          <path d="M3 14H21V21H3V14Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M10 21V16C10 14.8954 10.8954 14 12 14C13.1046 14 14 14.8954 14 16V21" fill="white" stroke={color} strokeWidth="1.8" />
        </svg>
      );
    case 'metro':
      // Gateway of India / Modern City icon
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M3 21H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M4 21V9C4 7.5 5 6 7 6H17C19 6 20 7.5 20 9V21" stroke={color} strokeWidth="1.8" />
          <path d="M8 21V13C8 10.5 9.5 9.5 12 9.5C14.5 9.5 16 10.5 16 13V21" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.8" />
          <path d="M7 6L7 3M17 6L17 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="5" r="1.5" fill="#EAB308" />
        </svg>
      );
    case 'lake':
      // Serene waters / Lake
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M3 15C5 13.5 7 13.5 9 15C11 16.5 13 16.5 15 15C17 13.5 19 13.5 21 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3 19C5 17.5 7 17.5 9 19C11 20.5 13 20.5 15 19C17 17.5 19 17.5 21 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 11L12 4L17 11H7Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case 'tiger':
      // Wildlife / Sanctuary
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="13" r="8" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.8" />
          <path d="M7 6L5 3M17 6L19 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="12" r="1.5" fill={color} />
          <circle cx="15" cy="12" r="1.5" fill={color} />
          <path d="M12 14V16M10 17C11 18 13 18 14 17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'caves':
      // Ajanta Ellora Caves arch
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M3 21V12C3 7 7 3 12 3C17 3 21 7 21 12V21H3Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.8" />
          <path d="M7 21V13C7 10.5 9 8.5 12 8.5C15 8.5 17 10.5 17 13V21" fill="white" stroke={color} strokeWidth="1.8" />
        </svg>
      );
    case 'coast':
      // Konkan sea & palms
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M2 19C5 17.5 8 17.5 11 19C14 20.5 17 20.5 22 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M12 17V7M12 7C10 4 7 5 6 6M12 7C14 4 17 5 18 6M12 10C8 8 6 10 5 12M12 10C16 8 18 10 19 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="19" cy="5" r="2.5" fill="#EAB308" />
        </svg>
      );
    case 'monument':
    default:
      // Stupa / Heritage Monument
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M5 21H19M7 21V12C7 9.5 9 7.5 12 7.5C15 7.5 17 9.5 17 12V21" stroke={color} strokeWidth="1.8" />
          <circle cx="12" cy="4" r="2" fill="#EAB308" stroke={color} strokeWidth="1.5" />
          <path d="M10 15H14M10 18H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
};
