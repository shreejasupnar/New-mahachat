import fs from 'fs';
import path from 'path';

export interface ServerCatalogGift {
  id: string;
  nameMr: string;
  nameEn: string;
  category?: 'gifts';
  giftCategory?: 'love' | 'friendship' | 'festival' | 'heritage';
  culturalTheme: string;
  previewIcon: string;
  descriptionMr: string;
  animation: string;
  accentColor: string;
  tagMr: string;
  coinPrice: number;
  basePrice?: number;
  marketPrice?: number;
  priceChangePercent?: number;
  marketTrend?: 'HOT' | 'SURGE' | 'DISCOUNT' | 'STABLE';
  active: boolean;
  updatedAt: string;
}

export interface ServerTransaction {
  id: string;
  userId: string;
  type: 'PURCHASE' | 'GIFT_SENT' | 'GIFT_RECEIVED' | 'REFUND' | 'ADMIN_ADJUSTMENT' | 'GAME_CHALLENGE' | 'GAME_REWARD';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ServerWallet {
  userId: string;
  coinBalance: number;
  lifetimeCoinsPurchased: number;
  lifetimeCoinsSpent: number;
  lifetimeCoinsReceived: number;
  lastTransactionAt?: string;
}

// Initial 55 Cultural Maharashtra Gifts Catalog
const INITIAL_GIFTS: ServerCatalogGift[] = [
  // Treats & Traditional Tokens (10 - 35 coins)
  {
    id: 'gift_coconut',
    nameMr: 'नारळ (Coconut)',
    nameEn: 'Coconut',
    culturalTheme: 'शुभ शकुन',
    previewIcon: '🥥',
    descriptionMr: 'सत्कार्यात मानाचे श्रीफळ आणि शुभ शकुन.',
    animation: 'shreefal-glow',
    accentColor: '#854d0e',
    tagMr: 'श्रीफळ',
    coinPrice: 10,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_sugarcane',
    nameMr: 'ऊस (Sugarcane)',
    nameEn: 'Sugarcane',
    culturalTheme: 'शेतकरी संस्कृती',
    previewIcon: '🎋',
    descriptionMr: 'महाराष्ट्राच्या काळ्या मातीतील गोडवा आणि समृद्धी.',
    animation: 'cane-swing',
    accentColor: '#15803d',
    tagMr: 'समृद्धी',
    coinPrice: 10,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_traditional_diya',
    nameMr: 'पारंपरिक समई (Traditional Samai)',
    nameEn: 'Traditional Samai',
    culturalTheme: 'शुभ शकुन',
    previewIcon: '🪔',
    descriptionMr: 'मांगल्य आणि प्रकाशाचे प्रतीक पितळी समई.',
    animation: 'samai-light',
    accentColor: '#ca8a04',
    tagMr: 'मांगल्य',
    coinPrice: 10,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_misal',
    nameMr: 'कोल्हापुरी मिसळ (Kolhapuri Misal)',
    nameEn: 'Kolhapuri Misal',
    culturalTheme: 'महाराष्ट्रीयन खाद्यसंस्कृती',
    previewIcon: '🍲',
    descriptionMr: 'झणझणीत कट आणि अस्सल कोल्हापुरी चव.',
    animation: 'steam-rise',
    accentColor: '#dc2626',
    tagMr: 'खाद्यसंस्कृती',
    coinPrice: 15,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_aamras',
    nameMr: 'आम्रस पुरी (Aamras Puri)',
    nameEn: 'Aamras Puri',
    culturalTheme: 'महाराष्ट्रीयन खाद्यसंस्कृती',
    previewIcon: '🥭',
    descriptionMr: 'उन्हाळ्यातील अस्सल कोकणी हापूस आंब्याचा गोडवा.',
    animation: 'mango-swirl',
    accentColor: '#f59e0b',
    tagMr: 'खाद्यसंस्कृती',
    coinPrice: 15,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_toran',
    nameMr: 'झेंडूचे तोरण (Marigold Toran)',
    nameEn: 'Marigold Toran',
    culturalTheme: 'सण व उत्सव',
    previewIcon: '🌼',
    descriptionMr: 'दारावर सजणारे शुभ झेंडू आणि आंब्याच्या पानांचे तोरण.',
    animation: 'toran-sway',
    accentColor: '#ea580c',
    tagMr: 'उत्सव',
    coinPrice: 20,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_modak',
    nameMr: 'उकडीचे मोदक (Ukadiche Modak)',
    nameEn: 'Ukadiche Modak',
    culturalTheme: 'गणेशोत्सव',
    previewIcon: '🥟',
    descriptionMr: 'बाप्पाचे लाडके साजूक तुपातील उकडीचे मोदक.',
    animation: 'modak-bounce',
    accentColor: '#eab308',
    tagMr: 'गणेशोत्सव',
    coinPrice: 20,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_ukadiche_modak',
    nameMr: 'साजूक तूप मोदक (Ghee Modak)',
    nameEn: 'Ghee Modak',
    culturalTheme: 'गणेशोत्सव',
    previewIcon: '✨',
    descriptionMr: 'केशरी सुगंधाने युक्त शुद्ध तुपातील नैवेद्य.',
    animation: 'ghee-drip',
    accentColor: '#f59e0b',
    tagMr: 'प्रसाद',
    coinPrice: 20,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_kolhapuri_chappal',
    nameMr: 'कोल्हापुरी चप्पल (Kolhapuri Chappal)',
    nameEn: 'Kolhapuri Chappal',
    culturalTheme: 'हस्तकला व वारसा',
    previewIcon: '👡',
    descriptionMr: 'अस्सल कोल्हापुरी चामड्याची टिकाऊ आणि रुबाबदार कारागिरी.',
    animation: 'leather-shine',
    accentColor: '#92400e',
    tagMr: 'हस्तकला',
    coinPrice: 25,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_puran_poli',
    nameMr: 'पुरणपोळी (Puran Poli)',
    nameEn: 'Puran Poli',
    culturalTheme: 'महाराष्ट्रीयन खाद्यसंस्कृती',
    previewIcon: '🥞',
    descriptionMr: 'गुळ-डाळीचे गोड पुरण आणि साजूक तुपाची धार.',
    animation: 'ghee-pour',
    accentColor: '#b45309',
    tagMr: 'खाद्यसंस्कृती',
    coinPrice: 25,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_warli_art',
    nameMr: 'वारली चित्रकला (Warli Art)',
    nameEn: 'Warli Art',
    culturalTheme: 'आदिवासी वारसा',
    previewIcon: '🎨',
    descriptionMr: 'पालघर-ठाण्याची जगप्रसिद्ध पारंपरिक वारली रेखाटने.',
    animation: 'warli-dance',
    accentColor: '#78350f',
    tagMr: 'लोककला',
    coinPrice: 30,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_gudi',
    nameMr: 'गुढी पाडवा (Gudi)',
    nameEn: 'Gudi Padwa',
    culturalTheme: 'सण व उत्सव',
    previewIcon: '🎋',
    descriptionMr: 'मराठी नववर्षाची विजयाची गुढी आणि आनंदाची सुरुवात.',
    animation: 'gudi-shine',
    accentColor: '#f97316',
    tagMr: 'नववर्ष',
    coinPrice: 30,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_alphonso_mango',
    nameMr: 'रत्नागिरी हापूस (Ratnagiri Alphonso)',
    nameEn: 'Ratnagiri Alphonso',
    culturalTheme: 'कोकण निसर्ग',
    previewIcon: '🥭',
    descriptionMr: 'फळांचा राजा - जगप्रसिद्ध कोकणचा अस्सल हापूस.',
    animation: 'mango-shine',
    accentColor: '#f59e0b',
    tagMr: 'कोकण',
    coinPrice: 30,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_maha_thali',
    nameMr: 'मराठमोळा थाट (Maha Thali)',
    nameEn: 'Maha Thali',
    culturalTheme: 'खाद्यसंस्कृती',
    previewIcon: '🍽️',
    descriptionMr: 'पिठलं-भाकरी, पुरणपोळी आणि कोशिंबिरीने सजलेली मराठमोळी थाळी.',
    animation: 'thali-reveal',
    accentColor: '#b45309',
    tagMr: 'थाळी',
    coinPrice: 35,
    active: true,
    updatedAt: new Date().toISOString()
  },

  // Heritage, Music & Attire (40 - 90 coins)
  {
    id: 'gift_pheta',
    nameMr: 'शाही फेटा (Traditional Pheta)',
    nameEn: 'Traditional Pheta',
    culturalTheme: 'मराठमोळा पेहराव',
    previewIcon: '👑',
    descriptionMr: 'पुणेरी आणि कोल्हापुरी फेट्याचा रुबाबदार सन्मान.',
    animation: 'pheta-sparkle',
    accentColor: '#c2410c',
    tagMr: 'पेहराव',
    coinPrice: 40,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_nath',
    nameMr: 'मोत्यांची नथ (Pearl Nath)',
    nameEn: 'Pearl Nath',
    culturalTheme: 'पारंपरिक दागिने',
    previewIcon: '✨',
    descriptionMr: 'मराठमोळ्या स्त्रीचे सौंदर्य खुलवणारी पारंपारिक नथ.',
    animation: 'pearl-glimmer',
    accentColor: '#ec4899',
    tagMr: 'दागिने',
    coinPrice: 45,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_nauvari',
    nameMr: 'नऊवारी साडी (Nauvari Saree)',
    nameEn: 'Nauvari Saree',
    culturalTheme: 'मराठमोळा पेहराव',
    previewIcon: '👘',
    descriptionMr: 'राणी लक्ष्मीबाई आणि अहिल्याबाईंचा पराक्रमी नऊवारी पेहराव.',
    animation: 'saree-swirl',
    accentColor: '#db2777',
    tagMr: 'पेहराव',
    coinPrice: 50,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_powada',
    nameMr: 'शिवकालीन पोवाडा (Shiv Powada)',
    nameEn: 'Shiv Powada',
    culturalTheme: 'शाहीर परंपरा',
    previewIcon: '📜',
    descriptionMr: 'डफ आणि तुणतुण्यावर गुंजणारा शिवरायांचा गौरवशाली पोवाडा.',
    animation: 'daf-beat',
    accentColor: '#991b1b',
    tagMr: 'पोवाडा',
    coinPrice: 50,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_lezim',
    nameMr: 'पारंपरिक लेझीम (Traditional Lezim)',
    nameEn: 'Traditional Lezim',
    culturalTheme: 'लोककला व संगीत',
    previewIcon: '🔔',
    descriptionMr: 'छण-छण घुमणाऱ्या लेझीम पथकाचा सळसळता उत्साह.',
    animation: 'lezim-shake',
    accentColor: '#059669',
    tagMr: 'लोककला',
    coinPrice: 50,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_tutari',
    nameMr: 'शाही तुतारी (Shahi Tutari)',
    nameEn: 'Shahi Tutari',
    culturalTheme: 'शिवकालीन वाद्ये',
    previewIcon: '🎺',
    descriptionMr: 'सह्याद्रीच्या कड्यांवर गुंजणारा ऐतिहासिक तुतारीचा निनाद.',
    animation: 'tutari-blow',
    accentColor: '#ca8a04',
    tagMr: 'शिवकालीन',
    coinPrice: 60,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_dhol_tasha',
    nameMr: 'ढोल ताशा (Dhol Tasha)',
    nameEn: 'Dhol Tasha',
    culturalTheme: 'लोककला व संगीत',
    previewIcon: '🥁',
    descriptionMr: 'पुणे-नाशिक गणेशोत्सवाचा हृदयाचे ठोके वाढवणारा गजर.',
    animation: 'dhol-beat',
    accentColor: '#b91c1c',
    tagMr: 'संगीत',
    coinPrice: 65,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_sahyadri_peaks',
    nameMr: 'सह्याद्री पर्वत (Sahyadri Mountains)',
    nameEn: 'Sahyadri Mountains',
    culturalTheme: 'सह्याद्री निसर्ग',
    previewIcon: '⛰️',
    descriptionMr: 'दुर्गम सह्याद्रीच्या उत्तुंग कड्यांची भव्यता.',
    animation: 'mountain-rise',
    accentColor: '#15803d',
    tagMr: 'निसर्ग',
    coinPrice: 70,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_wari_dindi',
    nameMr: 'वारकरी दिंडी (Wari Dindi)',
    nameEn: 'Wari Dindi',
    culturalTheme: 'वारकरी संप्रदाय',
    previewIcon: '🚩',
    descriptionMr: 'ज्ञानोबा-तुकाराम जयघोषात चालणारी आषाढी वारी.',
    animation: 'dindi-walk',
    accentColor: '#ea580c',
    tagMr: 'भक्ती',
    coinPrice: 75,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_torana',
    nameMr: 'तोरणदुर्ग (Torana Fort)',
    nameEn: 'Torana Fort',
    culturalTheme: 'गडकोट संस्कृती',
    previewIcon: '🚩',
    descriptionMr: 'स्वराज्याची पहिली राजधानी आणि तोरणा किल्ला.',
    animation: 'flag-wave',
    accentColor: '#ea580c',
    tagMr: 'इतिहास',
    coinPrice: 80,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_paithani_saree',
    nameMr: 'अस्सल पैठणी (Royal Paithani)',
    nameEn: 'Royal Paithani',
    culturalTheme: 'हस्तकला व वारसा',
    previewIcon: '🥻',
    descriptionMr: 'पैठणची जरीकाठी अस्सल रेशमी मोरपंखी पैठणी.',
    animation: 'silk-glow',
    accentColor: '#7c3aed',
    tagMr: 'पैठणी',
    coinPrice: 85,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_kolhapuri_saaj',
    nameMr: 'कोल्हापुरी साज (Kolhapuri Saaj)',
    nameEn: 'Kolhapuri Saaj',
    culturalTheme: 'पारंपरिक दागिने',
    previewIcon: '📿',
    descriptionMr: '२१ पानांच्या अलंकारांनी विणलेला ऐतिहासिक कोल्हापुरी साज.',
    animation: 'gold-shimmer',
    accentColor: '#eab308',
    tagMr: 'दागिने',
    coinPrice: 85,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_fort_gate',
    nameMr: 'महादरवाजा (Fort Gate)',
    nameEn: 'Fort Gate',
    culturalTheme: 'गडकोट संस्कृती',
    previewIcon: '🏰',
    descriptionMr: 'ऐतिहासिक रायगडाचा अभेद्य महादरवाजा.',
    animation: 'gate-open',
    accentColor: '#78350f',
    tagMr: 'गडकोट',
    coinPrice: 90,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_pandharpur_theme',
    nameMr: 'पंढरपूर विठ्ठल दर्शन (Pandharpur Vitthal)',
    nameEn: 'Pandharpur Vitthal',
    culturalTheme: 'वारकरी संप्रदाय',
    previewIcon: '🛕',
    descriptionMr: 'विटेवर उभा कटेवर कर, पंढरीनाथाचा आशीर्वाद.',
    animation: 'vitthal-divine',
    accentColor: '#d97706',
    tagMr: 'विठ्ठल',
    coinPrice: 90,
    active: true,
    updatedAt: new Date().toISOString()
  },

  // Grand Celebrations & Forts (150 - 350 coins)
  {
    id: 'gift_maha_map',
    nameMr: 'महाराष्ट्र नकाशा (Maharashtra Map)',
    nameEn: 'Maharashtra Map',
    culturalTheme: 'महाराष्ट्र अभिमान',
    previewIcon: '🗺️',
    descriptionMr: 'अखंड महाराष्ट्राचा नकाशा आणि ३६ जिल्ह्यांचा स्वाभिमान.',
    animation: 'map-glow',
    accentColor: '#f97316',
    tagMr: 'अभिमान',
    coinPrice: 150,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_ganeshotsav_deco',
    nameMr: 'गणेशोत्सव भव्य आरास (Ganeshotsav)',
    nameEn: 'Ganeshotsav Grand Decor',
    culturalTheme: 'सण व उत्सव',
    previewIcon: '🌺',
    descriptionMr: 'लालबाग आणि कसबा गणपतीच्या थाटातील सुवर्ण आरास.',
    animation: 'ganesh-aarti',
    accentColor: '#dc2626',
    tagMr: 'गणपती',
    coinPrice: 150,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_dhol_celebration',
    nameMr: 'महा ढोल ताशा वादन (Grand Dhol Ensemble)',
    nameEn: 'Grand Dhol Ensemble',
    culturalTheme: 'लोककला व संगीत',
    previewIcon: '🥁',
    descriptionMr: '१०० ढोलांचा एकत्र निनाद आणि ताशांचा थरार.',
    animation: 'dhol-ensemble-fire',
    accentColor: '#b91c1c',
    tagMr: 'गजर',
    coinPrice: 200,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_shiv_jayanti_deco',
    nameMr: 'शिवजयंती उत्सव (Shiv Jayanti)',
    nameEn: 'Shiv Jayanti Celebration',
    culturalTheme: 'शिवकालीन वारसा',
    previewIcon: '🚩',
    descriptionMr: 'किल्ले शिवनेरी ते रायगडापर्यंत भगव्या ध्वजांची आतिशबाजी.',
    animation: 'shivjayanti-fireworks',
    accentColor: '#ea580c',
    tagMr: 'शिवजयंती',
    coinPrice: 250,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_dhol_tasha_blast',
    nameMr: 'नादब्रह्म गजर (Naad Brahma)',
    nameEn: 'Naad Brahma',
    culturalTheme: 'लोककला व संगीत',
    previewIcon: '💥',
    descriptionMr: 'संपूर्ण रूम दणाणून सोडणारा शक्तिशाली ढोल गजर.',
    animation: 'naad-soundwave',
    accentColor: '#ef4444',
    tagMr: 'नाद',
    coinPrice: 250,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_talwar_shield',
    nameMr: 'शिवकालीन भवानी तलवार (Bhavani Talwar)',
    nameEn: 'Bhavani Talwar & Shield',
    culturalTheme: 'शिवकालीन शस्त्रे',
    previewIcon: '⚔️',
    descriptionMr: 'ऐतिहासिक भवानी तलवार आणि सुवर्ण ढाल.',
    animation: 'sword-slash-gold',
    accentColor: '#f59e0b',
    tagMr: 'शस्त्र',
    coinPrice: 300,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_maha_star',
    nameMr: 'महास्टार सन्मान (MahaChat Star)',
    nameEn: 'MahaChat Star',
    culturalTheme: 'सर्वोच्च सन्मान',
    previewIcon: '🌟',
    descriptionMr: 'महाराष्ट्राच्या कट्ट्यावरील अत्यंत आदरणीय महास्टार पदक.',
    animation: 'star-burst-gold',
    accentColor: '#eab308',
    tagMr: 'सन्मान',
    coinPrice: 350,
    active: true,
    updatedAt: new Date().toISOString()
  },

  // Royal Treasures (400 - 1000 coins)
  {
    id: 'gift_golden_pheta',
    nameMr: 'सुवर्ण फेटा (Golden Shahi Pheta)',
    nameEn: 'Golden Shahi Pheta',
    culturalTheme: 'शाही वारसा',
    previewIcon: '👑',
    descriptionMr: 'शुद्ध सोन्याचे जरीकाम असलेला राजाधिराज फेटा.',
    animation: 'golden-crown-shine',
    accentColor: '#eab308',
    tagMr: 'शाही',
    coinPrice: 450,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_royal_paithani',
    nameMr: 'राजेशाही सुवर्ण पैठणी (Royal Gold Paithani)',
    nameEn: 'Royal Gold Paithani',
    culturalTheme: 'हस्तकला व वारसा',
    previewIcon: '🥻',
    descriptionMr: 'सोन्याच्या तारांनी विणलेली सर्वोत्तम राजेशाही पैठणी.',
    animation: 'gold-silk-cascade',
    accentColor: '#a855f7',
    tagMr: 'राजेशाही',
    coinPrice: 500,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_royal_crown',
    nameMr: 'सिंहासन मुकुट (Royal Throne Crown)',
    nameEn: 'Royal Throne Crown',
    culturalTheme: 'शाही वारसा',
    previewIcon: '👑',
    descriptionMr: 'बत्तीस मणांच्या सुवर्ण सिंहासनाचा तेजस्वी मुकुट.',
    animation: 'crown-ascension',
    accentColor: '#fbbf24',
    tagMr: 'सिंहासन',
    coinPrice: 750,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_fort_celebration',
    nameMr: 'रायगड राज्याभिषेक उत्सव (Raigad Coronation)',
    nameEn: 'Raigad Coronation Grandeur',
    culturalTheme: 'शिवकालीन वारसा',
    previewIcon: '🏰',
    descriptionMr: '६ जून १६७४ चा शिवछत्रपतींचा सुवर्ण राज्याभिषेक सोहळा.',
    animation: 'coronation-gold-shower',
    accentColor: '#f59e0b',
    tagMr: 'राज्याभिषेक',
    coinPrice: 1000,
    active: true,
    updatedAt: new Date().toISOString()
  },

  // ==========================================
  // LOVE & ROMANCE GIFTS (प्रेम भेटवस्तू)
  // ==========================================
  {
    id: 'gift_single_rose',
    nameMr: 'लाल गुलाब (Single Red Rose)',
    nameEn: 'Single Red Rose',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '🌹',
    descriptionMr: 'हृदयातून दिलेले ताजे लाल सुगंधी गुलाब.',
    animation: 'rose-bloom',
    accentColor: '#e11d48',
    tagMr: 'प्रेम',
    coinPrice: 20,
    basePrice: 20,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_rose_bouquet',
    nameMr: 'गुलाबांचा गुच्छ (Rose Bouquet)',
    nameEn: 'Rose Bouquet',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '💐',
    descriptionMr: 'नाजूक रिबिनने बांधलेला १०० गुलाबांचा मनमोहक गुच्छ.',
    animation: 'bouquet-burst',
    accentColor: '#f43f5e',
    tagMr: 'गुलाब गुच्छ',
    coinPrice: 99,
    basePrice: 99,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_love_heart',
    nameMr: 'प्रेम हृदय (Heart of Love)',
    nameEn: 'Heart of Love',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '💖',
    descriptionMr: 'चमकणारे आणि धडकणारे प्रेमाचे सुरेख हृदय.',
    animation: 'heart-pulse',
    accentColor: '#ec4899',
    tagMr: 'दिल',
    coinPrice: 150,
    basePrice: 150,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_chocolate_box',
    nameMr: 'चॉकलेट बॉक्स (Heart Chocolates)',
    nameEn: 'Heart Chocolates Box',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '🍫',
    descriptionMr: 'हार्ट-शेप लक्झरी स्विस चॉकलेट्सचा गोड नजराणा.',
    animation: 'choco-sparkle',
    accentColor: '#78350f',
    tagMr: 'चॉकलेट',
    coinPrice: 180,
    basePrice: 180,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_teddy_bear',
    nameMr: 'क्युट टेडी (Cute Teddy Bear)',
    nameEn: 'Cute Teddy Bear',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '🧸',
    descriptionMr: 'मऊ आणि गोड मिठी मारणारा प्रेमाचा टेडी.',
    animation: 'teddy-hug',
    accentColor: '#d97706',
    tagMr: 'टेडी',
    coinPrice: 220,
    basePrice: 220,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_love_letter',
    nameMr: 'प्रेम पत्र (Wax Seal Love Letter)',
    nameEn: 'Love Letter',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '💌',
    descriptionMr: 'शाही लाल मेणाच्या शिक्क्याने बंदिस्त केलेले भावुक प्रेम पत्र.',
    animation: 'letter-fly',
    accentColor: '#be123c',
    tagMr: 'प्रेमपत्र',
    coinPrice: 250,
    basePrice: 250,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_gold_pendant',
    nameMr: 'सुवर्ण पेंडंट (Golden Heart Pendant)',
    nameEn: 'Golden Heart Pendant',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '📿',
    descriptionMr: '२२ कॅरेट शुद्ध सोन्याचे नाजूक डिझायनर हार्ट पेंडंट.',
    animation: 'pendant-glow',
    accentColor: '#f59e0b',
    tagMr: 'पेंडंट',
    coinPrice: 499,
    basePrice: 499,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_diamond_ring',
    nameMr: 'हिऱ्याची अंगठी (Diamond Proposal Ring)',
    nameEn: 'Diamond Proposal Ring',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '💍',
    descriptionMr: 'अस्सल सॉलिटेअर हिऱ्याची झळाळती प्रपोजल अंगठी.',
    animation: 'ring-shine',
    accentColor: '#38bdf8',
    tagMr: 'अंगठी',
    coinPrice: 799,
    basePrice: 799,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_love_castle',
    nameMr: 'रोमान्स महाल (Romance Palace)',
    nameEn: 'Romance Castle',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '🏰',
    descriptionMr: 'स्वप्नांमधील परीकथेसारखा प्रेमाचा स्वर्गीय राजमहाल.',
    animation: 'castle-shimmer',
    accentColor: '#a855f7',
    tagMr: 'महाल',
    coinPrice: 1499,
    basePrice: 1499,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_cupid_arrow',
    nameMr: 'कामदेव सुवर्ण बाण (Cupid Golden Arrow)',
    nameEn: 'Cupid Golden Arrow',
    category: 'gifts',
    giftCategory: 'love',
    culturalTheme: 'प्रेम व भावना',
    previewIcon: '💘',
    descriptionMr: 'दोन हृदयांना जोडणारा मदन-बाण व स्वर्गीय प्रेमाची बरसात.',
    animation: 'cupid-strike',
    accentColor: '#ec4899',
    tagMr: 'मदन बाण',
    coinPrice: 2199,
    basePrice: 2199,
    active: true,
    updatedAt: new Date().toISOString()
  },

  // ==========================================
  // FRIENDSHIP GIFTS (मैत्री व दोस्ताना)
  // ==========================================
  {
    id: 'gift_chai_cutting',
    nameMr: 'कटिंग चहा (Special Cutting Chai)',
    nameEn: 'Cutting Chai',
    category: 'gifts',
    giftCategory: 'friendship',
    culturalTheme: 'मैत्री कट्टा',
    previewIcon: '☕',
    descriptionMr: 'मित्रांसोबतच्या कट्ट्यावरील अस्सल गरमागरम आले-विलायची कटिंग चहा.',
    animation: 'chai-steam',
    accentColor: '#b45309',
    tagMr: 'कट्टा चहा',
    coinPrice: 10,
    basePrice: 10,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_high_five',
    nameMr: 'हाय फाईव्ह (High Five Buddy)',
    nameEn: 'High Five',
    category: 'gifts',
    giftCategory: 'friendship',
    culturalTheme: 'मैत्री कट्टा',
    previewIcon: '✋',
    descriptionMr: 'सच्च्या मित्राला दिलेली टाळी आणि विजयाचा उत्साह.',
    animation: 'highfive-clap',
    accentColor: '#3b82f6',
    tagMr: 'टाळी',
    coinPrice: 15,
    basePrice: 15,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_fist_bump',
    nameMr: 'दोस्ती फिस्ट बम्प (Fist Bump)',
    nameEn: 'Fist Bump',
    category: 'gifts',
    giftCategory: 'friendship',
    culturalTheme: 'मैत्री कट्टा',
    previewIcon: '👊',
    descriptionMr: 'याराना पक्का दाखवणारा जबरदस्त फिस्ट बम्प.',
    animation: 'fist-spark',
    accentColor: '#6366f1',
    tagMr: 'दोस्ती',
    coinPrice: 20,
    basePrice: 20,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_friendship_band',
    nameMr: 'फ्रेंडशिप बँड (Friendship Band)',
    nameEn: 'Friendship Band',
    category: 'gifts',
    giftCategory: 'friendship',
    culturalTheme: 'मैत्री कट्टा',
    previewIcon: '🎗️',
    descriptionMr: 'कधीही न तुटणाऱ्या अतूट मैत्रीचा रंगीत बंध.',
    animation: 'band-glow',
    accentColor: '#10b981',
    tagMr: 'फ्रेंडशिप बँड',
    coinPrice: 35,
    basePrice: 35,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_warm_hug',
    nameMr: 'प्रेमाची मिठी (Warm Buddy Hug)',
    nameEn: 'Warm Hug',
    category: 'gifts',
    giftCategory: 'friendship',
    culturalTheme: 'मैत्री कट्टा',
    previewIcon: '🫂',
    descriptionMr: 'सगळे दुःख विसरायला लावणारी मित्राची प्रेमळ घट्ट मिठी.',
    animation: 'hug-embrace',
    accentColor: '#8b5cf6',
    tagMr: 'मिठी',
    coinPrice: 50,
    basePrice: 50,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_party_popper',
    nameMr: 'पार्टी रॉकेट पॉपर (Party Celebration)',
    nameEn: 'Party Popper',
    category: 'gifts',
    giftCategory: 'friendship',
    culturalTheme: 'मैत्री कट्टा',
    previewIcon: '🎉',
    descriptionMr: 'मित्राच्या आनंदावर उडवलेला रंगीबेरंगी पार्टी पॉपर.',
    animation: 'popper-blast',
    accentColor: '#f97316',
    tagMr: 'पार्टी',
    coinPrice: 75,
    basePrice: 75,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_friendship_trophy',
    nameMr: 'सच्चा मित्र ट्रॉफी (Best Friend Trophy)',
    nameEn: 'Best Friend Trophy',
    category: 'gifts',
    giftCategory: 'friendship',
    culturalTheme: 'मैत्री कट्टा',
    previewIcon: '🏆',
    descriptionMr: 'जगातील सर्वोत्कृष्ट मित्रासाठी खास सोन्याचा मानाचा करंडक.',
    animation: 'trophy-shine',
    accentColor: '#eab308',
    tagMr: 'ट्रॉफी',
    coinPrice: 120,
    basePrice: 120,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_duo_motorcycle',
    nameMr: 'बुलेट राईड (Buddy Bullet Ride)',
    nameEn: 'Buddy Bullet Ride',
    category: 'gifts',
    giftCategory: 'friendship',
    culturalTheme: 'मैत्री कट्टा',
    previewIcon: '🏍️',
    descriptionMr: 'मित्रासोबत सह्याद्रीच्या घाटात बुलेटवरून दिलेली थ्रिलिंग राईड.',
    animation: 'bike-zoom',
    accentColor: '#0ea5e9',
    tagMr: 'बुलेट राईड',
    coinPrice: 350,
    basePrice: 350,
    active: true,
    updatedAt: new Date().toISOString()
  },

  // ==========================================
  // FESTIVAL GIFTS (सण व उत्सव)
  // ==========================================
  {
    id: 'gift_diwali_lantern',
    nameMr: 'आकाशकंदील (Diwali Kandil)',
    nameEn: 'Festive Diwali Lantern',
    category: 'gifts',
    giftCategory: 'festival',
    culturalTheme: 'सण व उत्सव',
    previewIcon: '🏮',
    descriptionMr: 'दिवाळीच्या रात्री अंगणात लखलखणारा पारंपरिक आकाशकंदील.',
    animation: 'lantern-glow',
    accentColor: '#f43f5e',
    tagMr: 'कंदील',
    coinPrice: 60,
    basePrice: 60,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_diwali_rangoli',
    nameMr: 'उत्सव रांगोळी (Festive Rangoli)',
    nameEn: 'Festive Rangoli',
    category: 'gifts',
    giftCategory: 'festival',
    culturalTheme: 'सण व उत्सव',
    previewIcon: '🌸',
    descriptionMr: 'विविध रंगांनी सजलेली मंगलमय संस्कारभारती रांगोळी.',
    animation: 'rangoli-sparkle',
    accentColor: '#ec4899',
    tagMr: 'रांगोळी',
    coinPrice: 75,
    basePrice: 75,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_holi_pichkari',
    nameMr: 'होळी रंग पिचकारी (Holi Pichkari & Gulal)',
    nameEn: 'Holi Gulal Pichkari',
    category: 'gifts',
    giftCategory: 'festival',
    culturalTheme: 'सण व उत्सव',
    previewIcon: '🔫',
    descriptionMr: 'धुलिवंदनाला उडणारा लाल-गुलाबी गुलाल आणि पाण्याचे रंग.',
    animation: 'color-splash',
    accentColor: '#06b6d4',
    tagMr: 'होळी रंग',
    coinPrice: 80,
    basePrice: 80,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_rakhi',
    nameMr: 'पवित्र राखी (Pavitra Rakhi)',
    nameEn: 'Pavitra Rakhi',
    category: 'gifts',
    giftCategory: 'festival',
    culturalTheme: 'सण व उत्सव',
    previewIcon: '🧵',
    descriptionMr: 'भावा-बहिणीच्या प्रेमाचा पवित्र रेशमी धागा आणि रक्षण बंध.',
    animation: 'rakhi-shine',
    accentColor: '#e11d48',
    tagMr: 'राखी',
    coinPrice: 90,
    basePrice: 90,
    active: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gift_makar_kite',
    nameMr: 'संक्रांत पतंग (Sankranti Flying Kite)',
    nameEn: 'Sankranti Kite',
    category: 'gifts',
    giftCategory: 'festival',
    culturalTheme: 'सण व उत्सव',
    previewIcon: '🪁',
    descriptionMr: 'तिळगूळ घ्या गोड बोला आणि आकाशात उंच उडणारा रंगीत पतंग.',
    animation: 'kite-soar',
    accentColor: '#10b981',
    tagMr: 'पतंग',
    coinPrice: 100,
    basePrice: 100,
    active: true,
    updatedAt: new Date().toISOString()
  }
];

// Persistent File Paths
const DATA_DIR = path.join(process.cwd(), 'data');
const GIFTS_FILE = path.join(DATA_DIR, 'gift-catalog.json');
const WALLET_LEDGER_FILE = path.join(DATA_DIR, 'wallet-ledger.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

// In-Memory state
let giftCatalog: Map<string, ServerCatalogGift> = new Map();
let userWallets: Map<string, ServerWallet> = new Map();
let transactionLedger: ServerTransaction[] = [];

// Initialize or load Gift Catalog
function initCatalog() {
  giftCatalog.clear();
  // seed default gifts
  INITIAL_GIFTS.forEach((g) => giftCatalog.set(g.id, { ...g }));

  // Load customizations if exists
  if (fs.existsSync(GIFTS_FILE)) {
    try {
      const raw = fs.readFileSync(GIFTS_FILE, 'utf8');
      const list: ServerCatalogGift[] = JSON.parse(raw);
      list.forEach((g) => {
        // preserve basePrice if absent
        if (giftCatalog.has(g.id)) {
          const original = giftCatalog.get(g.id)!;
          giftCatalog.set(g.id, {
            ...original,
            ...g,
            basePrice: g.basePrice || original.basePrice || g.coinPrice,
            giftCategory: g.giftCategory || original.giftCategory
          });
        } else {
          giftCatalog.set(g.id, g);
        }
      });
    } catch (e) {
      console.warn('[WalletBackend] Error loading custom gift catalog:', e);
    }
  }

  // Always persist merged catalog
  persistCatalog();
}

function persistCatalog() {
  try {
    const list = Array.from(giftCatalog.values());
    fs.writeFileSync(GIFTS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('[WalletBackend] Error saving gift catalog:', err);
  }
}

// =========================================================================
// Dynamic Market Price Fluctuation System
// =========================================================================

export type MarketRegimeMode = 'NORMAL' | 'ROMANCE_FEST' | 'FESTIVAL_RUSH' | 'FRIENDSHIP_HAPPY_HOUR' | 'DYNAMIC_LIVE';

export interface CategoryFluctuationRule {
  category: 'love' | 'friendship' | 'festival' | 'heritage';
  labelMr: string;
  labelEn: string;
  icon: string;
  percent: number; // e.g. +10, -8
  trend: 'HOT' | 'SURGE' | 'DISCOUNT' | 'STABLE';
  demandLevel: string;
  reasonMr: string;
}

let currentMarketMode: MarketRegimeMode = 'ROMANCE_FEST';

let categoryFluctuationRules: Record<'love' | 'friendship' | 'festival' | 'heritage', CategoryFluctuationRule> = {
  love: {
    category: 'love',
    labelMr: 'प्रेम भेटवस्तू',
    labelEn: 'Love Gifts',
    icon: '💖',
    percent: 10,
    trend: 'HOT',
    demandLevel: 'उच्च मागणी (+10% तेजी)',
    reasonMr: 'रोमँटिक संध्याकाळमुळे प्रेम भेटवस्तूंची मागणी वाढली आहे'
  },
  friendship: {
    category: 'friendship',
    labelMr: 'मैत्री भेटवस्तू',
    labelEn: 'Friendship Gifts',
    icon: '🤝',
    percent: -8,
    trend: 'DISCOUNT',
    demandLevel: 'विशेष सवलत (-8% सूट)',
    reasonMr: 'कट्टा मित्रमंडळींसाठी विशेष हॅप्पी अवर सवलत चालू आहे'
  },
  festival: {
    category: 'festival',
    labelMr: 'सण व उत्सव',
    labelEn: 'Festival Gifts',
    icon: '🪔',
    percent: 15,
    trend: 'SURGE',
    demandLevel: 'हंगामी तेजी (+15% मागणी)',
    reasonMr: 'सण-उत्सव उत्साहामुळे बाजारपेठेत जोरदार तेजी'
  },
  heritage: {
    category: 'heritage',
    labelMr: 'संस्कृती व वारसा',
    labelEn: 'Heritage Gifts',
    icon: '🚩',
    percent: 0,
    trend: 'STABLE',
    demandLevel: 'प्रमाणित स्थिर दर',
    reasonMr: 'महाराष्ट्र ऐतिहासिक मानचिन्हांचे मूल्य प्रमाणबद्ध स्थिर'
  }
};

export function getMarketCategoryRates() {
  return {
    mode: currentMarketMode,
    updatedAt: new Date().toISOString(),
    headlineMr: currentMarketMode === 'ROMANCE_FEST'
      ? '📈 लाईव्ह बाजार भाव: प्रेम भेटवस्तू +10% तेजी 🔥 | मैत्री कट्टा -8% सवलत 🏷️ | सण उत्सव +15% तेजी 🪔'
      : currentMarketMode === 'FESTIVAL_RUSH'
      ? '🎉 सण उत्सव विशेष तेजी: सण भेटवस्तू +20% मागणी 🪔 | प्रेम भेटवस्तू +5% | मैत्री -5% सवलत 🏷️'
      : currentMarketMode === 'FRIENDSHIP_HAPPY_HOUR'
      ? '🤝 दोस्ताना हॅप्पी अवर: मैत्री भेटवस्तू -15% बंपर सूट 🏷️ | प्रेम व सण दर स्थिर'
      : '⚖️ संतुलित बाजार भाव: सर्व भेटवस्तू प्रमाणित दराने उपलब्ध',
    categories: Object.values(categoryFluctuationRules)
  };
}

export function setMarketRegimeMode(mode: MarketRegimeMode) {
  currentMarketMode = mode;
  if (mode === 'ROMANCE_FEST') {
    categoryFluctuationRules.love.percent = 10;
    categoryFluctuationRules.love.trend = 'HOT';
    categoryFluctuationRules.friendship.percent = -8;
    categoryFluctuationRules.friendship.trend = 'DISCOUNT';
    categoryFluctuationRules.festival.percent = 15;
    categoryFluctuationRules.festival.trend = 'SURGE';
    categoryFluctuationRules.heritage.percent = 0;
    categoryFluctuationRules.heritage.trend = 'STABLE';
  } else if (mode === 'FESTIVAL_RUSH') {
    categoryFluctuationRules.love.percent = 5;
    categoryFluctuationRules.love.trend = 'HOT';
    categoryFluctuationRules.friendship.percent = -5;
    categoryFluctuationRules.friendship.trend = 'DISCOUNT';
    categoryFluctuationRules.festival.percent = 20;
    categoryFluctuationRules.festival.trend = 'SURGE';
    categoryFluctuationRules.heritage.percent = 5;
    categoryFluctuationRules.heritage.trend = 'HOT';
  } else if (mode === 'FRIENDSHIP_HAPPY_HOUR') {
    categoryFluctuationRules.love.percent = 0;
    categoryFluctuationRules.love.trend = 'STABLE';
    categoryFluctuationRules.friendship.percent = -15;
    categoryFluctuationRules.friendship.trend = 'DISCOUNT';
    categoryFluctuationRules.festival.percent = 5;
    categoryFluctuationRules.festival.trend = 'HOT';
    categoryFluctuationRules.heritage.percent = 0;
    categoryFluctuationRules.heritage.trend = 'STABLE';
  } else if (mode === 'NORMAL') {
    categoryFluctuationRules.love.percent = 0;
    categoryFluctuationRules.love.trend = 'STABLE';
    categoryFluctuationRules.friendship.percent = 0;
    categoryFluctuationRules.friendship.trend = 'STABLE';
    categoryFluctuationRules.festival.percent = 0;
    categoryFluctuationRules.festival.trend = 'STABLE';
    categoryFluctuationRules.heritage.percent = 0;
    categoryFluctuationRules.heritage.trend = 'STABLE';
  }
  return getMarketCategoryRates();
}

export function setCategoryFluctuation(category: 'love' | 'friendship' | 'festival' | 'heritage', percent: number) {
  if (categoryFluctuationRules[category]) {
    categoryFluctuationRules[category].percent = percent;
    categoryFluctuationRules[category].trend = percent > 0 ? (percent >= 15 ? 'SURGE' : 'HOT') : percent < 0 ? 'DISCOUNT' : 'STABLE';
    categoryFluctuationRules[category].demandLevel = percent > 0 ? `उच्च मागणी (+${percent}%)` : percent < 0 ? `सवलत (${percent}%)` : 'प्रमाणित स्थिर';
  }
  return getMarketCategoryRates();
}

export function resolveGiftCategory(gift: ServerCatalogGift): 'love' | 'friendship' | 'festival' | 'heritage' {
  if (gift.giftCategory) return gift.giftCategory;
  const theme = (gift.culturalTheme || '').toLowerCase();
  const id = (gift.id || '').toLowerCase();
  if (theme.includes('प्रेम') || theme.includes('भावना') || id.includes('rose') || id.includes('ring') || id.includes('pendant') || id.includes('heart') || id.includes('teddy') || id.includes('love')) {
    return 'love';
  }
  if (theme.includes('मैत्री') || theme.includes('कट्टा') || id.includes('chai') || id.includes('hug') || id.includes('friend') || id.includes('five') || id.includes('bump')) {
    return 'friendship';
  }
  if (theme.includes('सण') || theme.includes('उत्सव') || id.includes('modak') || id.includes('diwali') || id.includes('holi') || id.includes('gudi') || id.includes('rakhi') || id.includes('dhol')) {
    return 'festival';
  }
  return 'heritage';
}

export function calculateGiftMarketPrice(gift: ServerCatalogGift): {
  basePrice: number;
  marketPrice: number;
  priceChangePercent: number;
  marketTrend: 'HOT' | 'SURGE' | 'DISCOUNT' | 'STABLE';
  giftCategory: 'love' | 'friendship' | 'festival' | 'heritage';
} {
  const basePrice = gift.basePrice || gift.coinPrice || 20;
  const cat = resolveGiftCategory(gift);
  const rule = categoryFluctuationRules[cat] || { percent: 0, trend: 'STABLE' as const };
  const percent = rule.percent || 0;

  const rawMarket = Math.round(basePrice * (1 + percent / 100));
  const marketPrice = Math.max(5, rawMarket);

  return {
    basePrice,
    marketPrice,
    priceChangePercent: percent,
    marketTrend: rule.trend,
    giftCategory: cat
  };
}

// Initialize or load Transaction Ledger
function initLedger() {
  transactionLedger = [];
  userWallets.clear();

  if (fs.existsSync(WALLET_LEDGER_FILE)) {
    try {
      const raw = fs.readFileSync(WALLET_LEDGER_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.transactions)) {
        transactionLedger = data.transactions;
      }
      if (data.wallets && typeof data.wallets === 'object') {
        Object.entries(data.wallets).forEach(([uid, w]) => {
          userWallets.set(uid, w as ServerWallet);
        });
      }
    } catch (e) {
      console.warn('[WalletBackend] Error loading wallet ledger:', e);
    }
  }
}

function persistLedger() {
  try {
    const walletsObj: Record<string, ServerWallet> = {};
    userWallets.forEach((val, key) => {
      walletsObj[key] = val;
    });

    const data = {
      wallets: walletsObj,
      transactions: transactionLedger.slice(0, 5000) // keep last 5000
    };
    fs.writeFileSync(WALLET_LEDGER_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('[WalletBackend] Error persisting wallet ledger:', err);
  }
}

// Initial bootstrap
initCatalog();
initLedger();

/**
 * Get all active gifts decorated with live market prices & category fluctuations
 */
export function getCatalogGifts(includeInactive: boolean = false): ServerCatalogGift[] {
  const all = Array.from(giftCatalog.values());
  const list = includeInactive ? all : all.filter((g) => g.active !== false);

  return list.map((g) => {
    const market = calculateGiftMarketPrice(g);
    return {
      ...g,
      category: 'gifts',
      giftCategory: market.giftCategory,
      basePrice: market.basePrice,
      marketPrice: market.marketPrice,
      coinPrice: market.marketPrice, // Authoritative live coin price
      priceChangePercent: market.priceChangePercent,
      marketTrend: market.marketTrend
    };
  });
}

/**
 * Get specific gift by ID
 */
export function getGiftById(giftId: string): ServerCatalogGift | undefined {
  return giftCatalog.get(giftId);
}

/**
 * Admin update gift price or active status
 */
export function adminUpdateGift(
  giftId: string,
  updates: Partial<ServerCatalogGift>
): ServerCatalogGift {
  let gift = giftCatalog.get(giftId);
  if (!gift) {
    // Create new gift if doesn't exist
    gift = {
      id: giftId,
      nameMr: updates.nameMr || 'नवीन भेट',
      nameEn: updates.nameEn || 'New Gift',
      culturalTheme: updates.culturalTheme || 'महाराष्ट्र संस्कृती',
      previewIcon: updates.previewIcon || '🎁',
      descriptionMr: updates.descriptionMr || '',
      animation: updates.animation || 'glow',
      accentColor: updates.accentColor || '#f97316',
      tagMr: updates.tagMr || 'भेट',
      coinPrice: Number(updates.coinPrice) || 20,
      active: updates.active !== false,
      updatedAt: new Date().toISOString()
    };
  } else {
    gift = {
      ...gift,
      ...updates,
      coinPrice: updates.coinPrice !== undefined ? Number(updates.coinPrice) : gift.coinPrice,
      updatedAt: new Date().toISOString()
    };
  }

  giftCatalog.set(giftId, gift);
  persistCatalog();
  return gift;
}

/**
 * Get or initialize user wallet
 */
export function getUserWallet(userId: string, initialCoins: number = 0): ServerWallet {
  let w = userWallets.get(userId);
  if (!w) {
    w = {
      userId,
      coinBalance: Math.max(0, initialCoins),
      lifetimeCoinsPurchased: initialCoins > 0 ? initialCoins : 0,
      lifetimeCoinsSpent: 0,
      lifetimeCoinsReceived: 0,
      lastTransactionAt: new Date().toISOString()
    };
    userWallets.set(userId, w);
    persistLedger();
  } else if (initialCoins > w.coinBalance && w.lifetimeCoinsSpent === 0) {
    // Sync if user has higher balance from client/database
    w.coinBalance = initialCoins;
    w.lifetimeCoinsPurchased = Math.max(w.lifetimeCoinsPurchased, initialCoins);
    persistLedger();
  }
  return w;
}

/**
 * Sync user wallet balance from Firestore profile
 */
export function syncUserBalance(userId: string, coins: number): ServerWallet {
  const w = getUserWallet(userId, coins);
  if (coins !== undefined && !isNaN(coins)) {
    // If incoming coins is different, adjust accurately
    w.coinBalance = Math.max(0, coins);
    persistLedger();
  }
  return w;
}

/**
 * Record immutable transaction in ledger
 */
export function recordTransaction(
  userId: string,
  type: ServerTransaction['type'],
  amount: number,
  balanceAfter: number,
  description: string,
  referenceId?: string,
  metadata?: Record<string, any>
): ServerTransaction {
  const txn: ServerTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    type,
    amount,
    balanceAfter,
    description,
    referenceId,
    metadata,
    createdAt: new Date().toISOString()
  };

  transactionLedger.unshift(txn);
  persistLedger();
  return txn;
}

/**
 * Execute Secure Server-Side Gift Sending Transaction
 */
export interface SendGiftParams {
  senderUid: string;
  senderName?: string;
  senderPhoto?: string;
  districtId: string;
  roomId?: string;
  giftId: string;
  multiplier: number;
  recipientUids: string[];
  recipientNames?: Record<string, string>;
  recipientPhotos?: Record<string, string>;
  knownBalance?: number;
}

export interface SendGiftResult {
  success: boolean;
  transactionId?: string;
  newSenderCoins?: number;
  totalCost?: number;
  gift?: {
    id: string;
    nameMr: string;
    previewIcon: string;
    coinPrice: number;
    basePrice?: number;
    marketPrice?: number;
    priceChangePercent?: number;
    marketTrend?: string;
    giftCategory?: string;
    animation: string;
  };
  error?: string;
}

export function executeSendGift(params: SendGiftParams): SendGiftResult {
  const {
    senderUid,
    senderName = 'MahaChat Member',
    senderPhoto = '',
    districtId,
    roomId = 'active',
    giftId,
    multiplier,
    recipientUids,
    recipientNames = {},
    recipientPhotos = {},
    knownBalance
  } = params;

  if (!senderUid) {
    return { success: false, error: 'गिफ्ट पाठवण्यासाठी कृपया लॉगिन करा.' };
  }

  if (!Array.isArray(recipientUids) || recipientUids.length === 0) {
    return { success: false, error: 'कृपया किमान एक प्राप्तकर्ता निवडा.' };
  }

  // Check gift validity
  const gift = giftCatalog.get(giftId);
  if (!gift) {
    return { success: false, error: 'निवडलेले गिफ्ट सापडले नाही.' };
  }

  if (gift.active === false) {
    return { success: false, error: 'हे गिफ्ट सध्या उपलब्ध नाही.' };
  }

  const isBroadcast = recipientUids.includes('room_broadcast') || recipientUids.some(u => u.startsWith('room_'));

  // Cannot send to self
  if (!isBroadcast && recipientUids.length === 1 && recipientUids[0] === senderUid) {
    return { success: false, error: 'तुम्ही स्वतःला गिफ्ट पाठवू शकत नाही. मित्राला निवडा किंवा संपूर्ण रूमला भेट द्या.' };
  }

  // Multiplier sanity
  const mult = Math.max(1, Math.min(100, Number(multiplier) || 1));
  const numRecipients = isBroadcast ? 1 : recipientUids.length;

  // Calculate authoritative live market price according to current category market rates
  const market = calculateGiftMarketPrice(gift);
  const unitPrice = market.marketPrice;
  const singleCost = unitPrice * mult;
  const totalCost = singleCost * numRecipients;

  // Retrieve sender wallet
  const senderWallet = getUserWallet(senderUid, knownBalance);

  // If knownBalance passed from client and wallet has 0, synchronize
  if (knownBalance !== undefined && knownBalance > senderWallet.coinBalance) {
    senderWallet.coinBalance = knownBalance;
  }

  // Validate sufficient coins
  if (senderWallet.coinBalance < totalCost) {
    return {
      success: false,
      error: `तुमच्याकडे पुरेसे कॉइन्स नाहीत. आवश्यक: 🪙 ${totalCost} नाणी, सध्याची शिल्लक: 🪙 ${senderWallet.coinBalance}. कृपया रिचार्ज करा.`,
      newSenderCoins: senderWallet.coinBalance
    };
  }

  // ATOMIC DEDUCTION
  senderWallet.coinBalance -= totalCost;
  senderWallet.lifetimeCoinsSpent += totalCost;
  senderWallet.lastTransactionAt = new Date().toISOString();

  // Create Sender Transaction Ledger Record
  const recipientSummary = isBroadcast 
    ? 'संपूर्ण जिल्हा कट्टा (All Room Members)' 
    : (recipientUids.map(uid => recipientNames[uid] || 'मित्र').join(', '));

  const senderTxn = recordTransaction(
    senderUid,
    'GIFT_SENT',
    -totalCost,
    senderWallet.coinBalance,
    `🎁 भेट पाठवली: ${gift.nameMr} ${gift.previewIcon} ${mult > 1 ? `x${mult}` : ''} -> ${recipientSummary}`,
    undefined,
    {
      giftId: gift.id,
      giftName: gift.nameMr,
      giftIcon: gift.previewIcon,
      multiplier: mult,
      totalCost,
      districtId,
      roomId,
      recipientUids,
      recipientCount: numRecipients
    }
  );

  // Process recipient credits if not broadcast
  if (!isBroadcast) {
    recipientUids.forEach((recUid) => {
      if (recUid !== senderUid) {
        const recWallet = getUserWallet(recUid);
        recWallet.lifetimeCoinsReceived += singleCost;
        recWallet.lastTransactionAt = new Date().toISOString();

        recordTransaction(
          recUid,
          'GIFT_RECEIVED',
          singleCost,
          recWallet.coinBalance,
          `🎁 भेट प्राप्त झाली: ${gift.nameMr} ${gift.previewIcon} ${mult > 1 ? `x${mult}` : ''} <- ${senderName}`,
          senderTxn.id,
          {
            giftId: gift.id,
            giftName: gift.nameMr,
            giftIcon: gift.previewIcon,
            multiplier: mult,
            senderUid,
            senderName,
            districtId
          }
        );
      }
    });
  }

  persistLedger();

  return {
    success: true,
    transactionId: senderTxn.id,
    newSenderCoins: senderWallet.coinBalance,
    totalCost,
    gift: {
      id: gift.id,
      nameMr: gift.nameMr,
      previewIcon: gift.previewIcon,
      coinPrice: unitPrice,
      basePrice: market.basePrice,
      marketPrice: unitPrice,
      priceChangePercent: market.priceChangePercent,
      marketTrend: market.marketTrend,
      giftCategory: market.giftCategory,
      animation: gift.animation
    }
  };
}

/**
 * Execute Purchase Credit in Ledger
 */
export function executeCreditPurchase(
  userId: string,
  coinsToAdd: number,
  inrPrice: number,
  packageId: string,
  paymentMethod: string = 'GOOGLE_PAY',
  transactionRef?: string
): { success: boolean; transactionId: string; newBalance: number } {
  const wallet = getUserWallet(userId);
  wallet.coinBalance += coinsToAdd;
  wallet.lifetimeCoinsPurchased += coinsToAdd;
  wallet.lastTransactionAt = new Date().toISOString();

  const txn = recordTransaction(
    userId,
    'PURCHASE',
    coinsToAdd,
    wallet.coinBalance,
    `🪙 ${coinsToAdd} कॉइन्स रिचार्ज यशस्वी (₹${inrPrice})`,
    transactionRef || `rec_${Date.now()}`,
    {
      packageId,
      inrPrice,
      coinsAdded: coinsToAdd,
      paymentMethod,
      transactionRef
    }
  );

  persistLedger();
  return {
    success: true,
    transactionId: txn.id,
    newBalance: wallet.coinBalance
  };
}

/**
 * Get transactions for a user or admin
 */
export function getTransactions(userId?: string, limitCount: number = 50): ServerTransaction[] {
  if (userId) {
    return transactionLedger
      .filter((t) => t.userId === userId)
      .slice(0, limitCount);
  }
  return transactionLedger.slice(0, limitCount);
}

/**
 * Game Zone Idempotency & Match Statistics Storage
 */
const challengeDeductions = new Map<string, { txnId: string; userId: string; coins: number; status: 'SUCCESS' | 'REFUNDED' }>();

export interface GameUserStats {
  userId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  xp: number;
  rating: number;
  favoriteGame: string;
  winStreak: number;
  achievements: string[];
}

const gameStatsMap = new Map<string, GameUserStats>();

/**
 * Deduct exactly 30 coins for 1v1 Game Zone Challenge Entry
 * Strictly idempotent per (userId + matchId)
 */
export function executeGameChallengeEntry(
  userId: string,
  matchId: string,
  gameId: string,
  gameName: string = 'Game',
  knownBalance?: number
): { success: boolean; transactionId?: string; newBalance?: number; error?: string } {
  if (!userId || !matchId) {
    return { success: false, error: 'User ID आणि Match ID आवश्यक आहेत.' };
  }

  const idempotencyKey = `${userId}_${matchId}`;
  if (challengeDeductions.has(idempotencyKey)) {
    const existing = challengeDeductions.get(idempotencyKey)!;
    const wallet = getUserWallet(userId, knownBalance);
    return {
      success: true,
      transactionId: existing.txnId,
      newBalance: wallet.coinBalance
    };
  }

  const ENTRY_FEE = 30;
  const wallet = getUserWallet(userId, knownBalance);

  if (wallet.coinBalance < ENTRY_FEE) {
    return {
      success: false,
      error: `अपुरा कॉइन बॅलन्स. चॅलेंजसाठी ३० कॉइन्स आवश्यक आहेत (तुमच्याकडे ${wallet.coinBalance} कॉइन्स आहेत).`
    };
  }

  // Deduct exactly 30 coins
  wallet.coinBalance -= ENTRY_FEE;
  wallet.lifetimeCoinsSpent += ENTRY_FEE;
  wallet.lastTransactionAt = new Date().toISOString();

  const txn = recordTransaction(
    userId,
    'GAME_CHALLENGE',
    ENTRY_FEE,
    wallet.coinBalance,
    `🎮 गेम झोन चॅलेंज प्रवेश: ${gameName} (३० कॉइन्स)`,
    matchId,
    {
      matchId,
      gameId,
      gameName,
      status: 'SUCCESS',
      entryFee: ENTRY_FEE
    }
  );

  challengeDeductions.set(idempotencyKey, {
    txnId: txn.id,
    userId,
    coins: ENTRY_FEE,
    status: 'SUCCESS'
  });

  persistLedger();

  return {
    success: true,
    transactionId: txn.id,
    newBalance: wallet.coinBalance
  };
}

/**
 * Refund 30 coins if matchmaking is cancelled or failed before match start
 * Strictly idempotent
 */
export function executeGameChallengeRefund(
  userId: string,
  matchId: string,
  gameId: string,
  reason: string = 'Matchmaking cancelled'
): { success: boolean; transactionId?: string; newBalance?: number; error?: string } {
  if (!userId || !matchId) {
    return { success: false, error: 'User ID आणि Match ID आवश्यक आहेत.' };
  }

  const idempotencyKey = `${userId}_${matchId}`;
  const record = challengeDeductions.get(idempotencyKey);

  if (!record) {
    // If it wasn't charged, nothing to refund
    const wallet = getUserWallet(userId);
    return { success: true, newBalance: wallet.coinBalance };
  }

  if (record.status === 'REFUNDED') {
    const wallet = getUserWallet(userId);
    return { success: true, transactionId: record.txnId, newBalance: wallet.coinBalance };
  }

  const REFUND_AMOUNT = record.coins || 30;
  const wallet = getUserWallet(userId);
  wallet.coinBalance += REFUND_AMOUNT;
  wallet.lastTransactionAt = new Date().toISOString();

  const txn = recordTransaction(
    userId,
    'REFUND',
    REFUND_AMOUNT,
    wallet.coinBalance,
    `🎮 गेम झोन चॅलेंज रद्द - ३० कॉइन्स परतावा (${reason})`,
    matchId,
    {
      matchId,
      gameId,
      reason,
      status: 'REFUNDED'
    }
  );

  record.status = 'REFUNDED';
  record.txnId = txn.id;
  persistLedger();

  return {
    success: true,
    transactionId: txn.id,
    newBalance: wallet.coinBalance
  };
}

/**
 * Record Game Match Results & Update Player XP / Leaderboard
 */
export function recordGameMatchCompletion(params: {
  matchId: string;
  gameId: string;
  player1Uid: string;
  player2Uid: string;
  winnerUid?: string;
  isDraw?: boolean;
  score1: number;
  score2: number;
  durationSeconds: number;
}): { success: boolean; xpEarnedP1: number; xpEarnedP2: number } {
  const { player1Uid, player2Uid, winnerUid, isDraw, gameId } = params;

  // Initialize or get stats
  const getOrCreateStats = (uid: string) => {
    let s = gameStatsMap.get(uid);
    if (!s) {
      s = {
        userId: uid,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        xp: 0,
        rating: 1200,
        favoriteGame: gameId,
        winStreak: 0,
        achievements: []
      };
      gameStatsMap.set(uid, s);
    }
    return s;
  };

  const p1 = getOrCreateStats(player1Uid);
  const p2 = getOrCreateStats(player2Uid);

  p1.gamesPlayed += 1;
  p2.gamesPlayed += 1;

  let xp1 = 15;
  let xp2 = 15;

  if (isDraw) {
    p1.draws += 1;
    p2.draws += 1;
    p1.winStreak = 0;
    p2.winStreak = 0;
    xp1 += 15;
    xp2 += 15;
  } else if (winnerUid === player1Uid) {
    p1.wins += 1;
    p2.losses += 1;
    p1.winStreak += 1;
    p2.winStreak = 0;
    p1.rating += 25;
    p2.rating = Math.max(1000, p2.rating - 15);
    xp1 += 50; // +65 total for win
  } else if (winnerUid === player2Uid) {
    p2.wins += 1;
    p1.losses += 1;
    p2.winStreak += 1;
    p1.winStreak = 0;
    p2.rating += 25;
    p1.rating = Math.max(1000, p1.rating - 15);
    xp2 += 50;
  }

  p1.xp += xp1;
  p2.xp += xp2;

  // Check achievements
  if (p1.wins >= 1 && !p1.achievements.includes('first_win')) p1.achievements.push('first_win');
  if (p1.wins >= 10 && !p1.achievements.includes('warrior_10')) p1.achievements.push('warrior_10');
  if (p1.winStreak >= 3 && !p1.achievements.includes('streak_3')) p1.achievements.push('streak_3');

  if (p2.wins >= 1 && !p2.achievements.includes('first_win')) p2.achievements.push('first_win');
  if (p2.wins >= 10 && !p2.achievements.includes('warrior_10')) p2.achievements.push('warrior_10');
  if (p2.winStreak >= 3 && !p2.achievements.includes('streak_3')) p2.achievements.push('streak_3');

  return {
    success: true,
    xpEarnedP1: xp1,
    xpEarnedP2: xp2
  };
}

export function getUserGameStats(userId: string): GameUserStats {
  let s = gameStatsMap.get(userId);
  if (!s) {
    s = {
      userId,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      xp: 0,
      rating: 1200,
      favoriteGame: 'ludo',
      winStreak: 0,
      achievements: []
    };
    gameStatsMap.set(userId, s);
  }
  return s;
}

export function getAllGameStats(): GameUserStats[] {
  return Array.from(gameStatsMap.values());
}

