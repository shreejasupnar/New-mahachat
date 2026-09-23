export interface LiveFilter {
  id: string;
  nameMr: string;
  nameEn: string;
  icon: string;
  category: 'beauty' | 'cultural' | 'color';
  cssFilter?: string;
  overlayType?: 'pheta' | 'chandrakor' | 'gulal' | 'sparkle' | 'none';
  tintColor?: string;
}

export const LIVE_FILTERS: LiveFilter[] = [
  {
    id: 'none',
    nameMr: 'मूळ',
    nameEn: 'Normal',
    icon: '✨',
    category: 'beauty',
    cssFilter: 'none',
    overlayType: 'none',
  },
  {
    id: 'beauty_glow',
    nameMr: 'सौंदर्य ग्लो',
    nameEn: 'Beauty Glow',
    icon: '🌸',
    category: 'beauty',
    cssFilter: 'brightness(1.08) contrast(1.04) saturate(1.12) blur(0.2px)',
    overlayType: 'none',
    tintColor: 'rgba(255, 230, 240, 0.08)',
  },
  {
    id: 'royal_pheta',
    nameMr: 'शाही फेटा',
    nameEn: 'Royal Pheta',
    icon: '👑',
    category: 'cultural',
    cssFilter: 'contrast(1.06) saturate(1.15)',
    overlayType: 'pheta',
    tintColor: 'rgba(249, 115, 22, 0.05)',
  },
  {
    id: 'chandrakor',
    nameMr: 'मराठी चंद्रकोर',
    nameEn: 'Chandrakor',
    icon: '🌙',
    category: 'cultural',
    cssFilter: 'contrast(1.05) brightness(1.04)',
    overlayType: 'chandrakor',
  },
  {
    id: 'sahyadri_sunset',
    nameMr: 'सह्याद्री सनसेट',
    nameEn: 'Sahyadri Gold',
    icon: '🌅',
    category: 'color',
    cssFilter: 'sepia(0.25) saturate(1.35) contrast(1.08) hue-rotate(-10deg)',
    tintColor: 'rgba(245, 158, 11, 0.08)',
  },
  {
    id: 'gulal_utsav',
    nameMr: 'गुलाल उत्सव',
    nameEn: 'Festive Gulal',
    icon: '🎉',
    category: 'cultural',
    cssFilter: 'saturate(1.3) contrast(1.08) brightness(1.02)',
    overlayType: 'gulal',
    tintColor: 'rgba(236, 72, 153, 0.1)',
  },
  {
    id: 'cinematic',
    nameMr: 'सिनेमॅटिक',
    nameEn: 'Cinematic Noir',
    icon: '🎬',
    category: 'color',
    cssFilter: 'contrast(1.2) saturate(0.85) brightness(0.95)',
    overlayType: 'none',
  },
];
