export type InnovativeFrameStyle = 'wings' | 'mandala' | 'fusion';

export interface InnovativeFrameTier {
  vipLevel: number;
  levelTitleMr: string;
  themeName: string;
  wings: {
    id: string;
    seatId: string;
    nameMr: string;
    nameEn: string;
    descriptionMr: string;
    featherLayers: number;
    wingspanClass: string;
    gradient: [string, string, string]; // [primary, secondary, glow]
    icon: string;
    wingsEffectName: string;
  };
  mandala: {
    id: string;
    seatId: string;
    nameMr: string;
    nameEn: string;
    descriptionMr: string;
    petalsCount: number;
    ringsCount: number;
    gradient: [string, string, string];
    icon: string;
    geometryType: 'chakra' | 'lotus' | 'sunburst' | 'flame' | 'yantra' | 'kaleidoscope' | 'rajmudra' | 'kalachakra';
  };
  fusion: {
    id: string;
    seatId: string;
    nameMr: string;
    nameEn: string;
    descriptionMr: string;
  };
  auraGlow: string;
  crestIcon: string;
}

export const INNOVATIVE_VIP_FRAMES: InnovativeFrameTier[] = [
  {
    vipLevel: 1,
    levelTitleMr: 'कास्य / शौर्य VIP 1',
    themeName: 'कास्य वीर (Bronze Valor)',
    wings: {
      id: 'frame_wings_vip1',
      seatId: 'seat_wings_vip1',
      nameMr: 'कास्य वीर पंख (Bronze Falcon Wings)',
      nameEn: 'Bronze Falcon Winglets',
      descriptionMr: 'शौर्य पदक सन्मानित कास्य पंख आणि सोनेरी धार',
      featherLayers: 2,
      wingspanClass: 'scale-90',
      gradient: ['#B45309', '#78350F', '#F59E0B'],
      icon: '🪶',
      wingsEffectName: 'कास्य आभा'
    },
    mandala: {
      id: 'frame_mandala_vip1',
      seatId: 'seat_mandala_vip1',
      nameMr: 'कास्य भूमिती मंडल (Bronze Chakra Mandala)',
      nameEn: 'Bronze Geometric Chakra',
      descriptionMr: '८-कोनी वैदिक भूमिती चक्र आणि कास्य वर्तुळ',
      petalsCount: 8,
      ringsCount: 2,
      gradient: ['#B45309', '#D97706', '#FBBF24'],
      icon: '☸️',
      geometryType: 'chakra'
    },
    fusion: {
      id: 'frame_fusion_vip1',
      seatId: 'seat_fusion_vip1',
      nameMr: 'कास्य वीर फ्युजन (Bronze Wings & Mandala)',
      nameEn: 'Bronze Fusion Sovereign',
      descriptionMr: 'कास्य पंख व चक्राकार भूमितीचे एकत्रीकरण'
    },
    auraGlow: 'rgba(217, 119, 6, 0.45)',
    crestIcon: '🛡️'
  },
  {
    vipLevel: 2,
    levelTitleMr: 'रौप्य / तेज VIP 2',
    themeName: 'रौप्य तेज (Silver Radiance)',
    wings: {
      id: 'frame_wings_vip2',
      seatId: 'seat_wings_vip2',
      nameMr: 'रौप्य देवदूत पंख (Silver Angel Wings)',
      nameEn: 'Silver Angelic Wings',
      descriptionMr: 'रौप्य चकाकी असलेले तेजस्वी पंख आणि चंद्रकिरण आभा',
      featherLayers: 3,
      wingspanClass: 'scale-95',
      gradient: ['#CBD5E1', '#64748B', '#F8FAFC'],
      icon: '🪽',
      wingsEffectName: 'रौप्य किरण'
    },
    mandala: {
      id: 'frame_mandala_vip2',
      seatId: 'seat_mandala_vip2',
      nameMr: 'रौप्य चंद्रकमळ मंडल (Silver Moon Lotus)',
      nameEn: 'Silver Moon Lotus Mandala',
      descriptionMr: '१२-पाकळ्यांचे नक्षीदार चंद्रकमळ मंडल व तारांकित किरणे',
      petalsCount: 12,
      ringsCount: 2,
      gradient: ['#E2E8F0', '#94A3B8', '#FFFFFF'],
      icon: '🪷',
      geometryType: 'lotus'
    },
    fusion: {
      id: 'frame_fusion_vip2',
      seatId: 'seat_fusion_vip2',
      nameMr: 'रौप्य तेज फ्युजन (Silver Wings & Mandala)',
      nameEn: 'Silver Fusion Radiance',
      descriptionMr: 'रौप्य देवदूत पंख आणि १२-पाकळी चंद्रकमळ मंडल'
    },
    auraGlow: 'rgba(226, 232, 240, 0.55)',
    crestIcon: '✨'
  },
  {
    vipLevel: 3,
    levelTitleMr: 'सुवर्ण / वैभव VIP 3',
    themeName: 'सुवर्ण वैभव (Golden Fortune)',
    wings: {
      id: 'frame_wings_vip3',
      seatId: 'seat_wings_vip3',
      nameMr: 'सुवर्ण गरूड पंख (Golden Garuda Wings)',
      nameEn: 'Golden Garuda Wings',
      descriptionMr: 'शाही सोन्याचे ३-स्तरीय गरूड पंख आणि तरंगती सुवर्ण धूळ',
      featherLayers: 3,
      wingspanClass: 'scale-100',
      gradient: ['#F59E0B', '#B45309', '#FEF08A'],
      icon: '🦅',
      wingsEffectName: 'सुवर्ण तेज'
    },
    mandala: {
      id: 'frame_mandala_vip3',
      seatId: 'seat_mandala_vip3',
      nameMr: 'सुवर्ण सूर्यकमळ मंडल (Golden Sun Lotus)',
      nameEn: 'Golden Sun Lotus Mandala',
      descriptionMr: '१६-पाकळ्यांचे नक्षीदार सुवर्ण सूर्यकमळ आणि फिरणारे वलय',
      petalsCount: 16,
      ringsCount: 3,
      gradient: ['#F59E0B', '#EAB308', '#FEF08A'],
      icon: '☀️',
      geometryType: 'sunburst'
    },
    fusion: {
      id: 'frame_fusion_vip3',
      seatId: 'seat_fusion_vip3',
      nameMr: 'सुवर्ण गरूड फ्युजन (Golden Garuda Fusion)',
      nameEn: 'Golden Garuda Fusion',
      descriptionMr: 'सुवर्ण गरूड पंख आणि १६-पाकळ्यांचे सूर्यकमळ चक्र'
    },
    auraGlow: 'rgba(245, 158, 11, 0.65)',
    crestIcon: '👑'
  },
  {
    vipLevel: 4,
    levelTitleMr: 'माणिक / रुबाब VIP 4',
    themeName: 'अंगार माणिक (Ruby Prestige)',
    wings: {
      id: 'frame_wings_vip4',
      seatId: 'seat_wings_vip4',
      nameMr: 'माणिक ज्वाला पंख (Ruby Phoenix Wings)',
      nameEn: 'Ruby Phoenix Fire Wings',
      descriptionMr: 'धगधगणाऱ्या लाल अंगाराचे ज्वाला पंख आणि स्पार्कलिंग अग्नि',
      featherLayers: 4,
      wingspanClass: 'scale-105',
      gradient: ['#E11D48', '#9F1239', '#FDA4AF'],
      icon: '🔥',
      wingsEffectName: 'अग्नि शिखा'
    },
    mandala: {
      id: 'frame_mandala_vip4',
      seatId: 'seat_mandala_vip4',
      nameMr: 'माणिक अग्नि चक्र मंडल (Ruby Fire Chakra)',
      nameEn: 'Ruby Fire Chakra Mandala',
      descriptionMr: 'अग्निज्वाला आकाराचे गतिमान चक्र आणि माणिक्य बिंदू',
      petalsCount: 16,
      ringsCount: 3,
      gradient: ['#E11D48', '#BE123C', '#FECDD3'],
      icon: '🔥',
      geometryType: 'flame'
    },
    fusion: {
      id: 'frame_fusion_vip4',
      seatId: 'seat_fusion_vip4',
      nameMr: 'माणिक्य ज्वाला फ्युजन (Ruby Phoenix Fusion)',
      nameEn: 'Ruby Phoenix Fusion',
      descriptionMr: 'अंगार ज्वाला पंख आणि चक्राकार माणिक अग्नि मंडल'
    },
    auraGlow: 'rgba(225, 29, 72, 0.75)',
    crestIcon: '⚔️'
  },
  {
    vipLevel: 5,
    levelTitleMr: 'नीलम / राजेशाही VIP 5',
    themeName: 'राजेशाही नीलम (Sapphire Royalty)',
    wings: {
      id: 'frame_wings_vip5',
      seatId: 'seat_wings_vip5',
      nameMr: 'नीलम दिव्य पंख (Sapphire Celestial Wings)',
      nameEn: 'Sapphire Celestial Wings',
      descriptionMr: 'अथांग निळ्या नीलम स्फटिकाचे पंख व सायन तेजाचा प्रकाश',
      featherLayers: 4,
      wingspanClass: 'scale-110',
      gradient: ['#0284C7', '#0369A1', '#7DD3FC'],
      icon: '🪽',
      wingsEffectName: 'नीलम किरण'
    },
    mandala: {
      id: 'frame_mandala_vip5',
      seatId: 'seat_mandala_vip5',
      nameMr: 'नीलम ब्रह्मांड यंत्र मंडल (Sapphire Cosmic Yantra)',
      nameEn: 'Sapphire Cosmic Yantra Mandala',
      descriptionMr: '२०-बिंदूंचे पवित्र ब्रह्मांड यंत्र व दुहेरी फिरणारे रिंग्ज',
      petalsCount: 20,
      ringsCount: 3,
      gradient: ['#0284C7', '#0EA5E9', '#BAE6FD'],
      icon: '🔯',
      geometryType: 'yantra'
    },
    fusion: {
      id: 'frame_fusion_vip5',
      seatId: 'seat_fusion_vip5',
      nameMr: 'नीलम दिव्य फ्युजन (Sapphire Celestial Fusion)',
      nameEn: 'Sapphire Celestial Fusion',
      descriptionMr: 'नीलम पंख आणि ब्रह्मांड यंत्र मंडळाचे भव्य संमीलन'
    },
    auraGlow: 'rgba(6, 182, 212, 0.8)',
    crestIcon: '💎'
  },
  {
    vipLevel: 6,
    levelTitleMr: 'हिरा / सरदार VIP 6',
    themeName: 'अजिंक्य हिरा (Diamond Commander)',
    wings: {
      id: 'frame_wings_vip6',
      seatId: 'seat_wings_vip6',
      nameMr: 'प्रिझम डायमंड पंख (Prismatic Diamond Wings)',
      nameEn: 'Prismatic Diamond Wings',
      descriptionMr: 'इंद्रधनुषी हिऱ्यांच्या स्फटिकांचे पंख व प्रिझम रिफ्लेक्शन',
      featherLayers: 4,
      wingspanClass: 'scale-115',
      gradient: ['#C026D3', '#7E22CE', '#F5D0FE'],
      icon: '💎',
      wingsEffectName: 'प्रिझम प्रकाश'
    },
    mandala: {
      id: 'frame_mandala_vip6',
      seatId: 'seat_mandala_vip6',
      nameMr: 'प्रिझम नक्षत्र मंडल (Prismatic Kaleidoscope Mandala)',
      nameEn: 'Prismatic Kaleidoscope Mandala',
      descriptionMr: '२४-पाकळी बहुकोनीय फिरणारे हिरा नक्षत्र मंडल',
      petalsCount: 24,
      ringsCount: 4,
      gradient: ['#C026D3', '#E879F9', '#FDF4FF'],
      icon: '💠',
      geometryType: 'kaleidoscope'
    },
    fusion: {
      id: 'frame_fusion_vip6',
      seatId: 'seat_fusion_vip6',
      nameMr: 'अजिंक्य प्रिझम फ्युजन (Prismatic Commander Fusion)',
      nameEn: 'Prismatic Diamond Commander Fusion',
      descriptionMr: 'प्रिझम डायमंड पंख आणि २४-पाकळी नक्षत्र चक्र'
    },
    auraGlow: 'rgba(217, 70, 239, 0.85)',
    crestIcon: '👑'
  },
  {
    vipLevel: 7,
    levelTitleMr: 'छत्रपती सम्राट VIP 7',
    themeName: 'शाही छत्रपती सम्राट (Imperial Emperor)',
    wings: {
      id: 'frame_wings_vip7',
      seatId: 'seat_wings_vip7',
      nameMr: 'छत्रपती राजहंस महा-पंख (Chhatrapati Imperial Wings)',
      nameEn: 'Imperial Sovereign Archangel Wings',
      descriptionMr: '४-स्तरीय सुवर्ण राजहंस पंख, मराठा सूर्यमुद्रा व राजदंड तेज',
      featherLayers: 5,
      wingspanClass: 'scale-120',
      gradient: ['#F59E0B', '#DC2626', '#FEF08A'],
      icon: '🦅',
      wingsEffectName: 'साम्राज्य तेज'
    },
    mandala: {
      id: 'frame_mandala_vip7',
      seatId: 'seat_mandala_vip7',
      nameMr: 'राजमुद्रा महा-मंडल (Imperial Rajmudra Sovereign Mandala)',
      nameEn: 'Imperial Rajmudra Sovereign Mandala',
      descriptionMr: '३२-पाकळ्यांचे अष्टकोनी राजमुद्रा महा-मंडल व सुवर्ण किरणावली',
      petalsCount: 32,
      ringsCount: 4,
      gradient: ['#F59E0B', '#B91C1C', '#FEF08A'],
      icon: '🏵️',
      geometryType: 'rajmudra'
    },
    fusion: {
      id: 'frame_fusion_vip7',
      seatId: 'seat_fusion_vip7',
      nameMr: 'छत्रपती सम्राट महा-फ्युजन (Imperial Sovereign Fusion)',
      nameEn: 'Imperial Sovereign Supreme Fusion',
      descriptionMr: 'शाही राजहंस पंख आणि ३२-पाकळी राजमुद्रा महा-मंडल'
    },
    auraGlow: 'rgba(245, 158, 11, 0.95)',
    crestIcon: '👑'
  },
  {
    vipLevel: 8,
    levelTitleMr: 'विश्वविजयी देवराई VIP 8',
    themeName: 'विश्वविजयी देवराई (Celestial Sovereign)',
    wings: {
      id: 'frame_wings_vip8',
      seatId: 'seat_wings_vip8',
      nameMr: 'विश्वविजयी सोलर फिनिक्स महा-पंख (Solar Phoenix Supreme Wings)',
      nameEn: 'Celestial Solar Phoenix Supreme Wings',
      descriptionMr: 'अंतिम ५-स्तरीय दिव्य सोलर फिनिक्स पंख, अखंड सूर्य ज्वाळा व ऑरोरा',
      featherLayers: 5,
      wingspanClass: 'scale-125',
      gradient: ['#F97316', '#EA580C', '#FEF3C7'],
      icon: '🔥',
      wingsEffectName: 'अनंत सौर तेज'
    },
    mandala: {
      id: 'frame_mandala_vip8',
      seatId: 'seat_mandala_vip8',
      nameMr: 'विश्वविजयी अनंत कालचक्र मंडल (Infinite Kalachakra Mandala)',
      nameEn: 'Supreme Infinite Kalachakra Mandala',
      descriptionMr: 'तिहेरी परस्पर विरुद्ध फिरणारी अनंत कालचक्र वलये आणि कॉस्मिक बिंदू',
      petalsCount: 36,
      ringsCount: 5,
      gradient: ['#F97316', '#F59E0B', '#FFFBEB'],
      icon: '☸️',
      geometryType: 'kalachakra'
    },
    fusion: {
      id: 'frame_fusion_vip8',
      seatId: 'seat_fusion_vip8',
      nameMr: 'विश्वविजयी अनंत महा-फ्युजन (Supreme Cosmic Kalachakra Fusion)',
      nameEn: 'Supreme Celestial Phoenix & Kalachakra Fusion',
      descriptionMr: 'सौर फिनिक्स पंख आणि तिहेरी अनंत कालचक्र महा-मंडलाचे अंतिम शिखर'
    },
    auraGlow: 'rgba(251, 146, 60, 1.0)',
    crestIcon: '⚡'
  }
];

export function getInnovativeFrameByVip(level: number): InnovativeFrameTier {
  const safeLevel = Math.max(1, Math.min(8, level || 1));
  return INNOVATIVE_VIP_FRAMES.find(f => f.vipLevel === safeLevel) || INNOVATIVE_VIP_FRAMES[0];
}

export function findInnovativeFrameById(frameId?: string): { tier: InnovativeFrameTier; style: InnovativeFrameStyle } | null {
  if (!frameId) return null;
  for (const tier of INNOVATIVE_VIP_FRAMES) {
    if (tier.wings.id === frameId || tier.wings.seatId === frameId) return { tier, style: 'wings' };
    if (tier.mandala.id === frameId || tier.mandala.seatId === frameId) return { tier, style: 'mandala' };
    if (tier.fusion.id === frameId || tier.fusion.seatId === frameId) return { tier, style: 'fusion' };
  }
  return null;
}
