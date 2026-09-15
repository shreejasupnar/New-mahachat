export interface MaharashtraVoiceGift {
  id: string;
  name: string;
  nameMr: string;
  category: 'cultural' | 'royal' | 'festive' | 'popular' | 'vip';
  icon: string;
  coinCost: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  descriptionMr: string;
  soundPreset: 'chime' | 'fanfare' | 'dhol' | 'tasha' | 'bell';
}

export const MAHARASHTRA_VOICE_GIFTS: MaharashtraVoiceGift[] = [
  {
    id: 'gift-flower',
    name: 'Maharashtra Flower',
    nameMr: 'जास्वंद फूल',
    category: 'cultural',
    icon: '🌺',
    coinCost: 10,
    rarity: 'common',
    descriptionMr: 'महाराष्ट्राचे पवित्र लाल जास्वंद फूल',
    soundPreset: 'chime'
  },
  {
    id: 'gift-rose',
    name: 'Premacha Gulab',
    nameMr: 'प्रेमाचा गुलाब',
    category: 'popular',
    icon: '❤️',
    coinCost: 15,
    rarity: 'common',
    descriptionMr: 'हृदयातून दिलेला मराठमोळा गुलाब',
    soundPreset: 'chime'
  },
  {
    id: 'gift-flag',
    name: 'Bhagwa Flag',
    nameMr: 'भगवा ध्वज',
    category: 'royal',
    icon: '🚩',
    coinCost: 20,
    rarity: 'uncommon',
    descriptionMr: 'शिवरायांच्या स्वाभिमानाचा भगवा ध्वज',
    soundPreset: 'fanfare'
  },
  {
    id: 'gift-bell',
    name: 'Temple Bell',
    nameMr: 'मंदिराची घंटा',
    category: 'cultural',
    icon: '🛕',
    coinCost: 30,
    rarity: 'uncommon',
    descriptionMr: 'मंगळमय वातावरणासाठी मंदिराची घंटा',
    soundPreset: 'bell'
  },
  {
    id: 'gift-lezim',
    name: 'Lezim Beat',
    nameMr: 'पारंपारिक लेझीम',
    category: 'cultural',
    icon: '🪘',
    coinCost: 50,
    rarity: 'uncommon',
    descriptionMr: 'महाराष्ट्राचा पारंपारिक लेझीम नाद',
    soundPreset: 'tasha'
  },
  {
    id: 'gift-shetkari',
    name: 'Shetkari Sanman',
    nameMr: 'बळीराजा सन्मान',
    category: 'cultural',
    icon: '🌾',
    coinCost: 80,
    rarity: 'rare',
    descriptionMr: 'मातीच्या सुवासाचा आणि शेतकऱ्यांचा सन्मान',
    soundPreset: 'chime'
  },
  {
    id: 'gift-dhol-tasha',
    name: 'Dhol Tasha',
    nameMr: 'पुणेरी ढोल ताशा',
    category: 'festive',
    icon: '🥁',
    coinCost: 100,
    rarity: 'rare',
    descriptionMr: 'रोमारोमांत उत्साह भरणारा कडक ढोल ताशा पथक',
    soundPreset: 'dhol'
  },
  {
    id: 'gift-crown',
    name: 'Chhatrapati Royal Crown',
    nameMr: 'राजमुद्रा मुकुट',
    category: 'royal',
    icon: '👑',
    coinCost: 250,
    rarity: 'epic',
    descriptionMr: 'शाही राजमुकुट व स्वाभिमान भेट',
    soundPreset: 'fanfare'
  },
  {
    id: 'gift-express',
    name: 'Maharashtra Express',
    nameMr: 'महाराष्ट्र एक्सप्रेस',
    category: 'popular',
    icon: '🚂',
    coinCost: 300,
    rarity: 'epic',
    descriptionMr: 'कोल्हापूर ते गोंदिया जोडणारी सुपरफास्ट भेट',
    soundPreset: 'fanfare'
  },
  {
    id: 'gift-fort',
    name: 'Historical Fort',
    nameMr: 'ऐतिहासिक गड-किल्ला',
    category: 'royal',
    icon: '🏰',
    coinCost: 500,
    rarity: 'epic',
    descriptionMr: 'अजिंक्य शिवकालीन दुर्गाची भव्य भेट',
    soundPreset: 'fanfare'
  },
  {
    id: 'gift-star',
    name: 'Maharashtra Star',
    nameMr: 'महाराष्ट्र सुपरस्टार',
    category: 'vip',
    icon: '💫',
    coinCost: 1000,
    rarity: 'legendary',
    descriptionMr: 'कट्ट्यावरील सर्वात तेजस्वी महास्टार सन्मान',
    soundPreset: 'fanfare'
  },
  {
    id: 'gift-ganpati',
    name: 'Ganpati Bappa Celebration',
    nameMr: 'गणपती बाप्पा उत्सव',
    category: 'vip',
    icon: '🎉',
    coinCost: 2000,
    rarity: 'legendary',
    descriptionMr: 'संपूर्ण सभागृहात सुखकर्ता दुःखहर्ता महाउत्सव',
    soundPreset: 'dhol'
  }
];

export interface SeatFrameDef {
  id: string;
  name: string;
  nameMr: string;
  borderColor: string;
  glowColor: string;
  icon?: string;
  isVip?: boolean;
}

// 50 Configurable Seat Frames
export const SEAT_FRAMES_CATALOG: SeatFrameDef[] = [
  { id: 'frame-basic', name: 'Classic Simple', nameMr: 'साधी बैठक', borderColor: 'border-slate-500/40', glowColor: 'rgba(100,116,139,0.3)' },
  { id: 'frame-gold-1', name: 'Golden Glow', nameMr: 'सोनेरी कडा', borderColor: 'border-amber-400', glowColor: 'rgba(251,191,36,0.6)', icon: '✨' },
  { id: 'frame-royal-1', name: 'Royal Shivray', nameMr: 'शाही राजमुद्रा', borderColor: 'border-amber-500', glowColor: 'rgba(245,158,11,0.8)', icon: '👑', isVip: true },
  { id: 'frame-bhagwa-1', name: 'Bhagwa Pride', nameMr: 'भगवा कट्टा', borderColor: 'border-orange-500', glowColor: 'rgba(249,115,22,0.8)', icon: '🚩' },
  { id: 'frame-dhol-1', name: 'Dhol Pathak', nameMr: 'ढोल ताशा', borderColor: 'border-red-500', glowColor: 'rgba(239,68,68,0.7)', icon: '🥁' },
  { id: 'frame-fort-1', name: 'Raigad Stone', nameMr: 'दुर्ग रायगड', borderColor: 'border-stone-400', glowColor: 'rgba(168,162,158,0.6)', icon: '🏰' },
  { id: 'frame-diamond-1', name: 'Blue Diamond', nameMr: 'निळा हिरा', borderColor: 'border-cyan-400', glowColor: 'rgba(34,211,238,0.7)', icon: '💎', isVip: true },
  { id: 'frame-emerald-1', name: 'Sahyadri Green', nameMr: 'सह्याद्री हिरवा', borderColor: 'border-emerald-400', glowColor: 'rgba(52,211,153,0.7)', icon: '🌿' },
  { id: 'frame-rose-1', name: 'Gulabi Prem', nameMr: 'गुलाबी रंग', borderColor: 'border-pink-500', glowColor: 'rgba(236,72,153,0.7)', icon: '🌸' },
  { id: 'frame-purple-1', name: 'Lavani Purple', nameMr: 'लावणी जांभळा', borderColor: 'border-purple-500', glowColor: 'rgba(168,85,247,0.7)', icon: '🪘' },
  { id: 'frame-flame-1', name: 'Mashal Flame', nameMr: 'मशाल ज्वाला', borderColor: 'border-amber-600', glowColor: 'rgba(217,119,6,0.8)', icon: '🔥' },
  { id: 'frame-star-1', name: 'Star Constellation', nameMr: 'तारांगण', borderColor: 'border-indigo-400', glowColor: 'rgba(129,140,248,0.7)', icon: '⭐', isVip: true },
  { id: 'frame-pune-1', name: 'Puneri Pagadi', nameMr: 'पुणेरी पगडी', borderColor: 'border-red-600', glowColor: 'rgba(220,38,38,0.7)', icon: '🏮' },
  { id: 'frame-mumbai-1', name: 'Mumbai Lights', nameMr: 'मुंबई मरीन', borderColor: 'border-blue-400', glowColor: 'rgba(96,165,250,0.8)', icon: '🌊' },
  { id: 'frame-nagpur-1', name: 'Nagpur Santra', nameMr: 'नागपूर संत्रा', borderColor: 'border-orange-400', glowColor: 'rgba(251,146,60,0.7)', icon: '🍊' },
  { id: 'frame-kolhapur-1', name: 'Kolhapuri Saaj', nameMr: 'कोल्हापुरी साज', borderColor: 'border-yellow-400', glowColor: 'rgba(250,204,21,0.8)', icon: '📿' },
  { id: 'frame-nashik-1', name: 'Godavari Flow', nameMr: 'गोदावरी प्रवाह', borderColor: 'border-teal-400', glowColor: 'rgba(45,212,191,0.7)', icon: '🛕' },
  { id: 'frame-aurangabad-1', name: 'Ajanta Glow', nameMr: 'अजिंठा कला', borderColor: 'border-amber-300', glowColor: 'rgba(252,211,77,0.7)', icon: '🎨' },
  { id: 'frame-konkan-1', name: 'Konkan Coconut', nameMr: 'कोकण किनारा', borderColor: 'border-lime-400', glowColor: 'rgba(163,230,53,0.7)', icon: '🌴' },
  { id: 'frame-satara-1', name: 'Kas Pathar', nameMr: 'कास पठार', borderColor: 'border-fuchsia-400', glowColor: 'rgba(232,121,249,0.7)', icon: '🌺' },
  // Frames 21 to 50
  ...Array.from({ length: 30 }).map((_, i) => {
    const idx = i + 21;
    const colors = [
      { border: 'border-rose-400', glow: 'rgba(251,113,133,0.6)', name: `महाराष्ट्र वीरा ${idx}` },
      { border: 'border-violet-400', glow: 'rgba(167,139,250,0.6)', name: `किल्ला गौरव ${idx}` },
      { border: 'border-amber-400', glow: 'rgba(251,191,36,0.6)', name: `स्वराज्य तेज ${idx}` },
      { border: 'border-sky-400', glow: 'rgba(56,189,248,0.6)', name: `सह्याद्री शिखर ${idx}` },
      { border: 'border-emerald-500', glow: 'rgba(16,185,129,0.6)', name: `शेतकरी वैभव ${idx}` }
    ];
    const picked = colors[i % colors.length];
    return {
      id: `frame-custom-${idx}`,
      name: `Frame ${idx}`,
      nameMr: picked.name,
      borderColor: picked.border,
      glowColor: picked.glow,
      isVip: idx % 4 === 0
    };
  })
];

export interface ChatBubbleDef {
  id: string;
  name: string;
  nameMr: string;
  bgStyle: string;
  textStyle: string;
  borderColor: string;
}

// 50 Configurable Chat Bubbles
export const CHAT_BUBBLES_CATALOG: ChatBubbleDef[] = [
  { id: 'bubble-default', name: 'Simple Slate', nameMr: 'साधी पाटी', bgStyle: 'bg-slate-800/80', textStyle: 'text-white', borderColor: 'border-slate-700/60' },
  { id: 'bubble-gold', name: 'Royal Gold', nameMr: 'सोनेरी अक्षरे', bgStyle: 'bg-gradient-to-r from-amber-950/80 to-amber-900/60', textStyle: 'text-amber-200 font-semibold', borderColor: 'border-amber-500/50' },
  { id: 'bubble-bhagwa', name: 'Bhagwa Shaan', nameMr: 'भगवी शान', bgStyle: 'bg-gradient-to-r from-orange-950/80 to-red-950/60', textStyle: 'text-orange-200', borderColor: 'border-orange-500/50' },
  { id: 'bubble-cyber', name: 'Cyber Neon', nameMr: 'सायबर निळा', bgStyle: 'bg-gradient-to-r from-blue-950/80 to-cyan-950/60', textStyle: 'text-cyan-200', borderColor: 'border-cyan-500/50' },
  { id: 'bubble-rose', name: 'Gulabi Sandhya', nameMr: 'गुलाबी संध्या', bgStyle: 'bg-gradient-to-r from-pink-950/80 to-rose-950/60', textStyle: 'text-pink-200', borderColor: 'border-pink-500/50' },
  // Remaining 45 Bubbles
  ...Array.from({ length: 45 }).map((_, i) => {
    const idx = i + 6;
    const gradients = [
      { bg: 'bg-gradient-to-r from-purple-950/80 to-indigo-950/60', text: 'text-purple-200', border: 'border-purple-500/40', name: `राजेशाही ${idx}` },
      { bg: 'bg-gradient-to-r from-emerald-950/80 to-teal-950/60', text: 'text-emerald-200', border: 'border-emerald-500/40', name: `सह्याद्री ${idx}` },
      { bg: 'bg-gradient-to-r from-red-950/80 to-amber-950/60', text: 'text-amber-200', border: 'border-red-500/40', name: `मशाल ${idx}` },
      { bg: 'bg-gradient-to-r from-blue-950/80 to-indigo-950/60', text: 'text-blue-200', border: 'border-blue-500/40', name: `सागर ${idx}` },
      { bg: 'bg-gradient-to-r from-fuchsia-950/80 to-pink-950/60', text: 'text-fuchsia-200', border: 'border-fuchsia-500/40', name: `उत्सव ${idx}` }
    ];
    const picked = gradients[i % gradients.length];
    return {
      id: `bubble-theme-${idx}`,
      name: `Bubble ${idx}`,
      nameMr: picked.name,
      bgStyle: picked.bg,
      textStyle: picked.text,
      borderColor: picked.border
    };
  })
];

export interface CulturalRoomTheme {
  id: string;
  name: string;
  nameMr: string;
  descriptionMr: string;
  gradient: string;
  accentColor: string;
  particleType: 'cultural' | 'lanterns' | 'sparkles' | 'rain' | 'fireflies';
}

export const CULTURAL_ROOM_THEMES: CulturalRoomTheme[] = [
  {
    id: 'maharashtra_katta',
    name: 'Maharashtra Katta',
    nameMr: 'पारंपारिक महाराष्ट्र कट्टा',
    descriptionMr: 'गावचा पार, कडुनिंबाची सावली व शांत गप्पांचा माहोल',
    gradient: 'linear-gradient(180deg, #3d211a 0%, #2a130f 30%, #170a08 70%, #0c0403 100%)',
    accentColor: '#f97316',
    particleType: 'lanterns'
  },
  {
    id: 'fort_theme',
    name: 'Fort Raigad',
    nameMr: 'दुर्ग रायगड थीम',
    descriptionMr: 'गडकिल्ल्यांची भव्यता, शिवकालीन मशाल व स्वाभिमानी पार्श्वभूमी',
    gradient: 'linear-gradient(180deg, #2c2929 0%, #1e1b1a 35%, #131110 75%, #080707 100%)',
    accentColor: '#eab308',
    particleType: 'fireflies'
  },
  {
    id: 'dhol_tasha_theme',
    name: 'Dhol Tasha Utsav',
    nameMr: 'ढोल ताशा महाउत्सव',
    descriptionMr: 'पुणेरी व नाशिक ढोल ताशा पथकांचा उत्साही उत्सव रंग',
    gradient: 'linear-gradient(180deg, #421010 0%, #2d0b0b 30%, #1a0505 75%, #0d0101 100%)',
    accentColor: '#ef4444',
    particleType: 'sparkles'
  },
  {
    id: 'monsoon_maharashtra',
    name: 'Monsoon Maharashtra',
    nameMr: 'सह्याद्री पावसाळी कट्टा',
    descriptionMr: 'माळशेज व सह्याद्रीचे धुक्याने वेढलेले हिरवेगार डोंगर',
    gradient: 'linear-gradient(180deg, #102d28 0%, #0a1f1b 35%, #051411 75%, #020a08 100%)',
    accentColor: '#10b981',
    particleType: 'rain'
  },
  {
    id: 'royal_maharashtra',
    name: 'Royal Shivrajyabhishek',
    nameMr: 'शाही शिवराज्याभिषेक',
    descriptionMr: 'सिंहासन बत्तीसी, सुवर्ण कडा व राजेशाही दरबार',
    gradient: 'linear-gradient(180deg, #3d2605 0%, #291802 35%, #170d01 75%, #080400 100%)',
    accentColor: '#fbbf24',
    particleType: 'sparkles'
  },
  {
    id: 'city_night',
    name: 'Mumbai City Lights',
    nameMr: 'मुंबई नाईटलाईफ कट्टा',
    descriptionMr: 'मरीन ड्राईव्ह क्वीन नेकलेस व आधुनिक महाराष्ट्राची ऊर्जा',
    gradient: 'linear-gradient(180deg, #141b38 0%, #0c1126 35%, #060917 75%, #02030a 100%)',
    accentColor: '#38bdf8',
    particleType: 'sparkles'
  },
  {
    id: 'village_katta',
    name: 'Village Chawdi',
    nameMr: 'गावाकडची चावडी',
    descriptionMr: 'ग्रामीण भागातील हक्काचा पारावरचा कट्टा',
    gradient: 'linear-gradient(180deg, #2b1d12 0%, #1d1209 35%, #100a04 75%, #050301 100%)',
    accentColor: '#d97706',
    particleType: 'fireflies'
  },
  {
    id: 'ganpati_festival',
    name: 'Ganpati Bappa Fest',
    nameMr: 'गणपती बाप्पा उत्सव',
    descriptionMr: 'मोदक, गुलाल आणि बाप्पांच्या आरतीचा आनंदमय वातावरण',
    gradient: 'linear-gradient(180deg, #3b1130 0%, #26081e 35%, #150310 75%, #0a0108 100%)',
    accentColor: '#ec4899',
    particleType: 'sparkles'
  }
];
