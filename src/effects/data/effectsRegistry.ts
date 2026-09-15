// MahaChat Comprehensive Effects Registry
// Centralized data-driven catalog of all visual effects, tiers, cultural elements and themes

import { VisualEffectModel, RoomThemeConfig } from '../types';

export const VISUAL_EFFECTS_REGISTRY: VisualEffectModel[] = [
  // =================================================================
  // 1. TIER 1 — SIMPLE GIFTS (1-1.5s, targeted at avatar/seat, non-blocking)
  // =================================================================
  {
    effectId: 'gift_t1_heart_burst',
    effectType: 'gift',
    tier: 1,
    name: 'Heart Burst',
    nameMr: 'हार्ट बर्स्ट',
    rarity: 'common',
    price: 10,
    duration: 1500,
    animationDuration: 1400,
    previewIcon: '❤️',
    soundPreset: 'pop',
    priority: 20,
    enabled: true,
    triggerType: 'gift',
    targetType: 'seat',
    accentColor: '#f43f5e',
    metadata: {
      particleType: 'petals',
      cssClass: 'animate-ping'
    }
  },
  {
    effectId: 'gift_t1_red_roses',
    effectType: 'gift',
    tier: 1,
    name: 'Red Roses',
    nameMr: 'लाल गुलाब',
    rarity: 'common',
    price: 15,
    duration: 1500,
    animationDuration: 1500,
    previewIcon: '🌹',
    soundPreset: 'pop',
    priority: 22,
    enabled: true,
    triggerType: 'gift',
    targetType: 'seat',
    accentColor: '#e11d48'
  },
  {
    effectId: 'gift_t1_golden_stars',
    effectType: 'gift',
    tier: 1,
    name: 'Sparkle Stars',
    nameMr: 'चमकते तारे',
    rarity: 'common',
    price: 20,
    duration: 1400,
    animationDuration: 1300,
    previewIcon: '⭐',
    soundPreset: 'sparkle',
    priority: 25,
    enabled: true,
    triggerType: 'gift',
    targetType: 'seat',
    accentColor: '#f59e0b'
  },
  {
    effectId: 'gift_t1_jaswand_flower',
    effectType: 'gift',
    tier: 1,
    name: 'Jaswand Flower',
    nameMr: 'जास्वंद फूल',
    rarity: 'common',
    price: 25,
    duration: 1500,
    animationDuration: 1500,
    previewIcon: '🌺',
    soundPreset: 'pop',
    priority: 26,
    enabled: true,
    triggerType: 'gift',
    targetType: 'seat',
    culturalTheme: 'गणपती बाप्पांचे आवडते पुष्प',
    accentColor: '#dc2626'
  },
  {
    effectId: 'gift_t1_thumbs_up',
    effectType: 'gift',
    tier: 1,
    name: 'Marathi Thumbs Up',
    nameMr: 'भारीच दादा 👍',
    rarity: 'common',
    price: 10,
    duration: 1200,
    animationDuration: 1200,
    previewIcon: '👍',
    soundPreset: 'pop',
    priority: 20,
    enabled: true,
    triggerType: 'gift',
    targetType: 'seat',
    accentColor: '#3b82f6'
  },
  {
    effectId: 'gift_t1_fire_burst',
    effectType: 'gift',
    tier: 1,
    name: 'Fire Sparks',
    nameMr: 'अंगार ठिणग्या',
    rarity: 'rare',
    price: 30,
    duration: 1500,
    animationDuration: 1400,
    previewIcon: '🔥',
    soundPreset: 'sparkle',
    priority: 35,
    enabled: true,
    triggerType: 'gift',
    targetType: 'seat',
    accentColor: '#ea580c'
  },
  {
    effectId: 'gift_t1_bubbles',
    effectType: 'gift',
    tier: 1,
    name: 'Rainbow Bubbles',
    nameMr: 'रंगबेरंगी बुडबुडे',
    rarity: 'common',
    price: 15,
    duration: 1500,
    animationDuration: 1500,
    previewIcon: '🫧',
    soundPreset: 'pop',
    priority: 20,
    enabled: true,
    triggerType: 'gift',
    targetType: 'seat',
    accentColor: '#06b6d4'
  },

  // =================================================================
  // 2. TIER 2 — PREMIUM GIFTS (2-2.5s, top animated banner + rich sound)
  // =================================================================
  {
    effectId: 'gift_t2_flower_bouquet',
    effectType: 'gift',
    tier: 2,
    name: 'Royal Bouquet',
    nameMr: 'शाही पुष्पगुच्छ',
    rarity: 'rare',
    price: 100,
    duration: 2500,
    animationDuration: 2400,
    previewIcon: '💐',
    soundPreset: 'chime',
    priority: 50,
    enabled: true,
    triggerType: 'gift',
    targetType: 'top_banner',
    accentColor: '#ec4899'
  },
  {
    effectId: 'gift_t2_marathi_pheta',
    effectType: 'gift',
    tier: 2,
    name: 'Puneri Pheta',
    nameMr: 'पुणेरी भगवा फेटा',
    rarity: 'rare',
    price: 150,
    duration: 2500,
    animationDuration: 2500,
    previewIcon: '🚩',
    soundPreset: 'tutari',
    priority: 55,
    enabled: true,
    triggerType: 'gift',
    targetType: 'top_banner',
    culturalTheme: 'महाराष्ट्राची शान व सन्मान',
    accentColor: '#f97316'
  },
  {
    effectId: 'gift_t2_diamond_sparkle',
    effectType: 'gift',
    tier: 2,
    name: 'Kohinoor Diamond',
    nameMr: 'कोहिनूर हिरा',
    rarity: 'rare',
    price: 200,
    duration: 2500,
    animationDuration: 2500,
    previewIcon: '💎',
    soundPreset: 'sparkle',
    priority: 60,
    enabled: true,
    triggerType: 'gift',
    targetType: 'top_banner',
    accentColor: '#38bdf8'
  },
  {
    effectId: 'gift_t2_dhol_tasha',
    effectType: 'gift',
    tier: 2,
    name: 'Dhol Tasha Beats',
    nameMr: 'ढोल-ताशा गजर',
    rarity: 'epic',
    price: 250,
    duration: 2600,
    animationDuration: 2600,
    previewIcon: '🥁',
    soundPreset: 'drum',
    priority: 68,
    enabled: true,
    triggerType: 'gift',
    targetType: 'top_banner',
    culturalTheme: 'उत्सवाचा जल्लोष आणि निनाद',
    accentColor: '#eab308'
  },
  {
    effectId: 'gift_t2_tutari_vadya',
    effectType: 'gift',
    tier: 2,
    name: 'Shahi Tutari',
    nameMr: 'शाही ललकारी तुतारी',
    rarity: 'epic',
    price: 300,
    duration: 2700,
    animationDuration: 2700,
    previewIcon: '🎺',
    soundPreset: 'tutari',
    priority: 72,
    enabled: true,
    triggerType: 'gift',
    targetType: 'top_banner',
    culturalTheme: 'शिवकालीन ललकारी',
    accentColor: '#f59e0b'
  },
  {
    effectId: 'gift_t2_traditional_diwa',
    effectType: 'gift',
    tier: 2,
    name: 'Maticha Diwa',
    nameMr: 'मातीचा मंगल दिवा',
    rarity: 'rare',
    price: 120,
    duration: 2500,
    animationDuration: 2400,
    previewIcon: '🪔',
    soundPreset: 'chime',
    priority: 52,
    enabled: true,
    triggerType: 'gift',
    targetType: 'top_banner',
    culturalTheme: 'शुभ दीपावली व मांगल्य',
    accentColor: '#fbbf24'
  },
  {
    effectId: 'gift_t2_lezim_nritya',
    effectType: 'gift',
    tier: 2,
    name: 'Maharashtrian Lezim',
    nameMr: 'रंगीबेरंगी लेझीम',
    rarity: 'rare',
    price: 180,
    duration: 2500,
    animationDuration: 2500,
    previewIcon: '🔔',
    soundPreset: 'sparkle',
    priority: 58,
    enabled: true,
    triggerType: 'gift',
    targetType: 'top_banner',
    culturalTheme: 'लोकसंस्कृती व व्यायाम',
    accentColor: '#10b981'
  },
  {
    effectId: 'gift_t2_paithani_pallu',
    effectType: 'gift',
    tier: 2,
    name: 'Royal Paithani Saree',
    nameMr: 'पैठणी मोरपंखी पल्लू',
    rarity: 'epic',
    price: 350,
    duration: 2800,
    animationDuration: 2700,
    previewIcon: '🦚',
    soundPreset: 'chime',
    priority: 70,
    enabled: true,
    triggerType: 'gift',
    targetType: 'top_banner',
    culturalTheme: 'पैठणची पारंपारिक राजेशाही कला',
    accentColor: '#14b8a6'
  },

  // =================================================================
  // 3. TIER 3 — LEGENDARY CINEMATIC GIFTS (3.5-4s, full-screen punch)
  // =================================================================
  {
    effectId: 'gift_t3_chhatrapati_sinhasan',
    effectType: 'gift',
    tier: 3,
    name: 'Bhavya Sinhasan',
    nameMr: '३२ मण सुवर्ण सिंहासन',
    rarity: 'legendary',
    price: 2000,
    duration: 3800,
    animationDuration: 3800,
    previewIcon: '👑',
    soundPreset: 'tutari',
    priority: 98,
    enabled: true,
    triggerType: 'gift',
    targetType: 'screen',
    culturalTheme: 'शिवराज्याभिषेक सोहळा',
    accentColor: '#ffd700',
    metadata: {
      cinematicStyle: 'palace'
    }
  },
  {
    effectId: 'gift_t3_raigad_fort',
    effectType: 'gift',
    tier: 3,
    name: 'Durga Durg Raigad',
    nameMr: 'दुर्गराज रायगड किल्ला',
    rarity: 'legendary',
    price: 1500,
    duration: 3600,
    animationDuration: 3600,
    previewIcon: '🏰',
    soundPreset: 'drum',
    priority: 95,
    enabled: true,
    triggerType: 'gift',
    targetType: 'screen',
    culturalTheme: 'सह्याद्रीची बुलंद तटबंदी',
    accentColor: '#ea580c',
    metadata: {
      cinematicStyle: 'fort'
    }
  },
  {
    effectId: 'gift_t3_maharashtra_map_gold',
    effectType: 'gift',
    tier: 3,
    name: 'Garja Maharashtra',
    nameMr: 'गर्जा महाराष्ट्र माझा',
    rarity: 'legendary',
    price: 1800,
    duration: 3700,
    animationDuration: 3700,
    previewIcon: '🗺️',
    soundPreset: 'tutari',
    priority: 96,
    enabled: true,
    triggerType: 'gift',
    targetType: 'screen',
    culturalTheme: 'अखंड महाराष्ट्र सुवर्ण ऊर्जा',
    accentColor: '#f59e0b',
    metadata: {
      cinematicStyle: 'gold_shower'
    }
  },
  {
    effectId: 'gift_t3_warkari_dindi',
    effectType: 'gift',
    tier: 3,
    name: 'Pandharpur Dindi',
    nameMr: 'वारकरी दिंडी गजर',
    rarity: 'legendary',
    price: 1200,
    duration: 3500,
    animationDuration: 3500,
    previewIcon: '🪕',
    soundPreset: 'fanfare',
    priority: 92,
    enabled: true,
    triggerType: 'gift',
    targetType: 'screen',
    culturalTheme: 'ज्ञानोबा माउली तुकाराम दिंडी',
    accentColor: '#f97316',
    metadata: {
      cinematicStyle: 'fireworks'
    }
  },
  {
    effectId: 'gift_t3_ganpati_utsav',
    effectType: 'gift',
    tier: 3,
    name: 'Ganeshotsav Celebration',
    nameMr: 'मंगलमूर्ती महा-आरती',
    rarity: 'legendary',
    price: 2500,
    duration: 3900,
    animationDuration: 3900,
    previewIcon: '🐘',
    soundPreset: 'drum',
    priority: 99,
    enabled: true,
    triggerType: 'gift',
    targetType: 'screen',
    culturalTheme: 'महाराष्ट्र भूषण श्री गणेश',
    accentColor: '#e11d48',
    metadata: {
      cinematicStyle: 'fireworks'
    }
  },
  {
    effectId: 'gift_t3_sahyadri_lightning',
    effectType: 'gift',
    tier: 3,
    name: 'Sahyadri Lightning',
    nameMr: 'सह्याद्रीची वीज व गर्जना',
    rarity: 'legendary',
    price: 1100,
    duration: 3400,
    animationDuration: 3400,
    previewIcon: '⚡',
    soundPreset: 'whoosh',
    priority: 91,
    enabled: true,
    triggerType: 'gift',
    targetType: 'screen',
    culturalTheme: 'कडाडणारी सह्याद्री ऊर्जा',
    accentColor: '#38bdf8',
    metadata: {
      cinematicStyle: 'lightning'
    }
  },

  // =================================================================
  // 4. AVATAR / PROFILE FRAMES (Common, Rare, Epic, Legendary, VIP)
  // =================================================================
  {
    effectId: 'frame_common_bronze',
    effectType: 'avatar_frame',
    name: 'Bronze Halo',
    nameMr: 'कांस्य कडा',
    rarity: 'common',
    price: 50,
    duration: 0,
    animationDuration: 0,
    previewIcon: '⭕',
    priority: 20,
    enabled: true,
    triggerType: 'manual',
    targetType: 'avatar',
    metadata: {
      borderGradient: 'border-amber-700/60 ring-1 ring-amber-600/40',
      glowColor: 'rgba(180, 83, 9, 0.2)'
    }
  },
  {
    effectId: 'frame_rare_emerald_sparkle',
    effectType: 'avatar_frame',
    name: 'Emerald Sparkle',
    nameMr: 'हिरवा पाचू रिंग',
    rarity: 'rare',
    price: 150,
    duration: 0,
    animationDuration: 0,
    previewIcon: '🟢',
    priority: 45,
    enabled: true,
    triggerType: 'manual',
    targetType: 'avatar',
    metadata: {
      borderGradient: 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]',
      glowColor: 'rgba(16, 185, 129, 0.4)'
    }
  },
  {
    effectId: 'frame_epic_saffron_fire',
    effectType: 'avatar_frame',
    name: 'Saffron Fire Ring',
    nameMr: 'भगवी अग्निज्वाला रिंग',
    rarity: 'epic',
    price: 350,
    duration: 0,
    animationDuration: 0,
    previewIcon: '🔥',
    priority: 70,
    enabled: true,
    triggerType: 'manual',
    targetType: 'avatar',
    metadata: {
      borderGradient: 'ring-3 ring-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-pulse',
      glowColor: 'rgba(234, 88, 12, 0.6)'
    }
  },
  {
    effectId: 'frame_legendary_shahi_gold',
    effectType: 'avatar_frame',
    name: '24K Royal Crown Ring',
    nameMr: 'शाही सुवर्ण मुकुट फ्रेम',
    rarity: 'legendary',
    price: 800,
    duration: 0,
    animationDuration: 0,
    previewIcon: '👑',
    priority: 90,
    enabled: true,
    triggerType: 'manual',
    targetType: 'avatar',
    metadata: {
      borderGradient: 'ring-3 ring-yellow-400 shadow-[0_0_28px_rgba(250,204,21,0.9)]',
      glowColor: 'rgba(234, 179, 8, 0.7)'
    }
  },
  {
    effectId: 'frame_vip_paithani_luxe',
    effectType: 'vip_frame',
    name: 'VIP Peacock Silk Frame',
    nameMr: 'व्हीआयपी पैठणी मोरपंखी फ्रेम',
    rarity: 'vip',
    price: 1500,
    duration: 0,
    animationDuration: 0,
    previewIcon: '🦚',
    priority: 100,
    enabled: true,
    triggerType: 'manual',
    targetType: 'avatar',
    metadata: {
      borderGradient: 'ring-4 ring-purple-400 shadow-[0_0_32px_rgba(168,85,247,0.9)]',
      glowColor: 'rgba(168, 85, 247, 0.8)'
    }
  },

  // =================================================================
  // 5. ROOM ENTRANCE EFFECTS (under 2.5s, non-blocking)
  // =================================================================
  {
    effectId: 'entrance_spotlight_vip',
    effectType: 'entrance',
    name: 'VIP Golden Spotlight',
    nameMr: 'सुवर्ण प्रकाशझोत प्रवेश',
    rarity: 'rare',
    price: 200,
    duration: 2200,
    animationDuration: 2200,
    previewIcon: '🔦',
    soundPreset: 'whoosh',
    priority: 50,
    enabled: true,
    triggerType: 'entry',
    targetType: 'top_banner',
    accentColor: '#f59e0b'
  },
  {
    effectId: 'entrance_dhol_tasha_salute',
    effectType: 'entrance',
    name: 'Dhol Tasha Royal Entry',
    nameMr: 'ढोल-ताशा शाही आगमन',
    rarity: 'epic',
    price: 500,
    duration: 2400,
    animationDuration: 2400,
    previewIcon: '🥁',
    soundPreset: 'drum',
    priority: 75,
    enabled: true,
    triggerType: 'entry',
    targetType: 'top_banner',
    culturalTheme: 'उत्सवी आगमन',
    accentColor: '#f97316'
  },
  {
    effectId: 'entrance_tutari_sardar',
    effectType: 'entrance',
    name: 'Sardar Tutari Lalkar',
    nameMr: 'सरदार तुतारी ललकारी',
    rarity: 'legendary',
    price: 1000,
    duration: 2500,
    animationDuration: 2500,
    previewIcon: '🎺',
    soundPreset: 'tutari',
    priority: 95,
    enabled: true,
    triggerType: 'entry',
    targetType: 'top_banner',
    culturalTheme: 'शिवकालीन गौरवशाली प्रवेश',
    accentColor: '#ffd700'
  }
];

// =================================================================
// 6. ROOM THEMES REGISTRY (Including "परावरच्या गप्पा")
// =================================================================
export const ROOM_THEMES_REGISTRY: RoomThemeConfig[] = [
  {
    id: 'paravarchya_gappa',
    name: 'Paravarchya Gappa',
    nameMr: 'परावरच्या गप्पा (विशेष कट्टा)',
    descriptionMr: 'गावचा विस्तीर्ण वटवृक्ष, पार, सायंकाळचे कंदील आणि शांत काजवे.',
    backgroundGradient: 'from-[#1c120c] via-[#100d0a] to-[#080705]',
    ambientParticleType: 'fireflies',
    seatRingColor: 'ring-amber-500/70',
    headerStyle: 'bg-amber-950/40 border-amber-800/40',
    isSpecialParavarchyaGappa: true
  },
  {
    id: 'maharashtra_night',
    name: 'Maharashtra Night',
    nameMr: 'महाराष्ट्र रात्र',
    descriptionMr: 'शांत सह्याद्रीच्या कुशीतील चांदणी रात्र.',
    backgroundGradient: 'from-[#0f172a] via-[#090d16] to-[#020617]',
    ambientParticleType: 'stars',
    seatRingColor: 'ring-blue-500/60',
    headerStyle: 'bg-slate-900/60 border-slate-800/60'
  },
  {
    id: 'sahyadri',
    name: 'Sahyadri Sunrise',
    nameMr: 'सह्याद्री प्रभात',
    descriptionMr: 'किल्ल्यांच्या शिखरांवरून दिसणारा सोनेरी सूर्योदय.',
    backgroundGradient: 'from-[#431407] via-[#2a0e05] to-[#0c0402]',
    ambientParticleType: 'gold_dust',
    seatRingColor: 'ring-orange-500/70',
    headerStyle: 'bg-orange-950/50 border-orange-800/40'
  },
  {
    id: 'village_chavdi',
    name: 'Village Chavdi',
    nameMr: 'गावची चावडी',
    descriptionMr: 'पारंपारिक गावकऱ्यांचा आपुलकीचा कट्टा.',
    backgroundGradient: 'from-[#271c12] via-[#18110a] to-[#0d0905]',
    ambientParticleType: 'leaves',
    seatRingColor: 'ring-yellow-600/70',
    headerStyle: 'bg-yellow-950/50 border-yellow-900/40'
  },
  {
    id: 'vadachya_zadakhali',
    name: 'Vadachya Zadakhali',
    nameMr: 'वडाच्या झाडाखाली',
    descriptionMr: 'हिरवागार सावलीचा पाराचा परिसर.',
    backgroundGradient: 'from-[#052e16] via-[#02180b] to-[#010c05]',
    ambientParticleType: 'leaves',
    seatRingColor: 'ring-emerald-500/70',
    headerStyle: 'bg-emerald-950/50 border-emerald-900/40'
  },
  {
    id: 'monsoon_maharashtra',
    name: 'Monsoon Maharashtra',
    nameMr: 'महाराष्ट्राचा मान्सून',
    descriptionMr: 'सह्याद्रीतील धुवांधार पाऊस आणि गारवा.',
    backgroundGradient: 'from-[#082f49] via-[#041a29] to-[#020d14]',
    ambientParticleType: 'rain',
    seatRingColor: 'ring-cyan-500/70',
    headerStyle: 'bg-cyan-950/50 border-cyan-900/40'
  },
  {
    id: 'ganpati_festival',
    name: 'Ganpati Festival',
    nameMr: 'गणेशोत्सव जल्लोष',
    descriptionMr: 'गुलाल, मोदक आणि ढोल-ताशांचा उत्सव.',
    backgroundGradient: 'from-[#4c0519] via-[#2a030e] to-[#120106]',
    ambientParticleType: 'petals',
    seatRingColor: 'ring-rose-500/70',
    headerStyle: 'bg-rose-950/50 border-rose-900/40'
  },
  {
    id: 'royal_maharashtra',
    name: 'Royal Maharashtra',
    nameMr: 'राजेशाही दरबार',
    descriptionMr: 'शिवकालीन सुवर्ण थाट आणि राजगादी.',
    backgroundGradient: 'from-[#3b1202] via-[#240a01] to-[#0f0400]',
    ambientParticleType: 'gold_dust',
    seatRingColor: 'ring-yellow-400/80',
    headerStyle: 'bg-amber-950/60 border-amber-700/50'
  },
  {
    id: 'midnight_purple',
    name: 'Midnight Purple',
    nameMr: 'मध्यरात्र जांभळा रंग',
    descriptionMr: 'रोमँटिक पार्टी क्लब नाईट वातावरण.',
    backgroundGradient: 'from-[#2b0636] via-[#160224] to-[#0a0114]',
    ambientParticleType: 'stars',
    seatRingColor: 'ring-pink-500/70',
    headerStyle: 'bg-purple-950/50 border-purple-900/40'
  },
  {
    id: 'golden_vip',
    name: 'Golden VIP',
    nameMr: 'गोल्डन व्हीआयपी',
    descriptionMr: 'उच्चभ्रू लक्झरी सुवर्ण मंच.',
    backgroundGradient: 'from-[#2e2103] via-[#171001] to-[#080500]',
    ambientParticleType: 'gold_dust',
    seatRingColor: 'ring-amber-300',
    headerStyle: 'bg-yellow-950/60 border-yellow-700/60'
  },
  {
    id: 'celebration',
    name: 'Celebration',
    nameMr: 'महा उत्सव',
    descriptionMr: 'रंगीबेरंगी कॉन्फेटी व आनंदोत्सव.',
    backgroundGradient: 'from-[#31103f] via-[#1a0822] to-[#09030c]',
    ambientParticleType: 'petals',
    seatRingColor: 'ring-fuchsia-500/70',
    headerStyle: 'bg-fuchsia-950/50 border-fuchsia-900/40'
  }
];

export const getVisualEffectById = (id: string): VisualEffectModel | undefined => {
  return VISUAL_EFFECTS_REGISTRY.find(e => e.effectId === id);
};

export const getThemeById = (id: string): RoomThemeConfig => {
  return ROOM_THEMES_REGISTRY.find(t => t.id === id) || ROOM_THEMES_REGISTRY[0];
};
