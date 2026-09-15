import { VipTierConfig, RechargePackage, UserVipStatus } from '../types/vip';

export const VIP_TIERS: VipTierConfig[] = [
  {
    level: 1,
    nameMr: 'कास्य / शौर्य',
    nameEn: 'Bronze Valor',
    titleMr: 'शौर्य पदक VIP',
    requiredExp: 100,
    badgeCode: 'VIP 1',
    gradientTheme: 'from-amber-700 via-orange-800 to-yellow-900',
    badgeBg: 'bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-700',
    badgeBorder: 'border-amber-400/80',
    badgeTextColor: 'text-amber-100',
    cardGradient: 'from-stone-900 via-amber-950 to-stone-900',
    cardBorder: 'border-amber-600/40',
    glowColor: '#D97706',
    primaryColor: '#B45309',
    accentColor: '#FBBF24',
    seatRingClass: 'ring-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.5)]',
    bubbleClass: 'bg-gradient-to-r from-amber-950/90 to-stone-900/90 border-amber-500/50 text-amber-100',
    entryBannerTextMr: 'शौर्यपदक VIP 1 आगमन',
    charmMultiplier: 1.1,
    dailyFreeCoins: 0,
    privileges: [
      {
        id: 'p1_badge',
        titleMr: 'VIP 1 कास्य बॅज',
        titleEn: 'Bronze Badge',
        descMr: 'सर्व चॅट मेसेज आणि प्रोफाइलवर झळकणारा खास कास्य सन्मान बॅज',
        iconName: 'badge',
        highlight: true
      },
      {
        id: 'p1_seat',
        titleMr: 'कास्य ऑरा सीट फ्रेम',
        titleEn: 'Bronze Seat Aura',
        descMr: 'व्हॉईस रूम कट्ट्यावर बसल्यावर सीटवर चमकणारी कास्य आभा',
        iconName: 'seat'
      },
      {
        id: 'p1_bubble',
        titleMr: 'कास्य किनारी चॅट बबल',
        titleEn: 'Bronze Trim Chat Bubble',
        descMr: 'जिल्हा चॅटमध्ये तुमचे मेसेज कास्य बॉर्डर व शाही स्टाइलमध्ये दिसतील',
        iconName: 'bubble'
      },
      {
        id: 'p1_gift',
        titleMr: '१.१x गिफ्ट चार्म बोनस',
        titleEn: '1.1x Charm Multiplier',
        descMr: 'मित्रांना भेटवस्तू पाठवताना १०% अतिरिक्त चार्म गुण',
        iconName: 'gift'
      }
    ]
  },
  {
    level: 2,
    nameMr: 'रौप्य / तेज',
    nameEn: 'Silver Radiance',
    titleMr: 'तेजस्वी रौप्य VIP',
    requiredExp: 500,
    badgeCode: 'VIP 2',
    gradientTheme: 'from-slate-400 via-gray-300 to-slate-500',
    badgeBg: 'bg-gradient-to-r from-slate-400 via-slate-200 to-gray-400',
    badgeBorder: 'border-white/90',
    badgeTextColor: 'text-slate-900',
    cardGradient: 'from-slate-950 via-slate-900 to-gray-900',
    cardBorder: 'border-slate-300/40',
    glowColor: '#E2E8F0',
    primaryColor: '#94A3B8',
    accentColor: '#F8FAFC',
    seatRingClass: 'ring-slate-300 shadow-[0_0_20px_rgba(226,232,240,0.6)]',
    bubbleClass: 'bg-gradient-to-r from-slate-900/90 to-gray-900/90 border-slate-300/60 text-slate-100',
    entryBannerTextMr: 'रौप्य VIP 2 यांचे तेजस्वी आगमन',
    charmMultiplier: 1.2,
    dailyFreeCoins: 0,
    privileges: [
      {
        id: 'p2_badge',
        titleMr: 'VIP 2 तेजस्वी रौप्य बॅज',
        titleEn: 'Silver Radiance Badge',
        descMr: 'प्लॅटिनम चकाकी असलेला VIP 2 चा मानाचा बॅज',
        iconName: 'badge',
        highlight: true
      },
      {
        id: 'p2_entry',
        titleMr: 'रौप्य एंट्री अनाउन्समेंट',
        titleEn: 'Silver Entry Notice',
        descMr: 'व्हॉईस रूममध्ये प्रवेश करताना उपस्थितांना तुमच्या आगमनाची विशेष सूचना',
        iconName: 'entry',
        highlight: true
      },
      {
        id: 'p2_seat',
        titleMr: 'सिल्व्हर स्पार्क सीट फ्रेम',
        titleEn: 'Silver Sparkle Seat Frame',
        descMr: '८-सीट कट्ट्यावर बसताना सिल्व्हर रिंग आणि तारांकित चमक',
        iconName: 'seat'
      },
      {
        id: 'p2_bubble',
        titleMr: 'रौप्य चकाकी चॅट बबल',
        titleEn: 'Silver Shimmer Bubble',
        descMr: 'चॅटमध्ये मेसेज अधिक उठावदार व स्पष्ट दिसतात',
        iconName: 'bubble'
      },
      {
        id: 'p2_gift',
        titleMr: '१.२x गिफ्ट चार्म बोनस',
        titleEn: '1.2x Charm Multiplier',
        descMr: '२०% अतिरिक्त चार्म गुण व भेटवस्तूंचा प्रभाव',
        iconName: 'gift'
      }
    ]
  },
  {
    level: 3,
    nameMr: 'सुवर्ण / वैभव',
    nameEn: 'Gold Fortune',
    titleMr: 'वैभवशाली सुवर्ण VIP',
    requiredExp: 2000,
    badgeCode: 'VIP 3',
    gradientTheme: 'from-amber-400 via-yellow-300 to-amber-600',
    badgeBg: 'bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-600',
    badgeBorder: 'border-yellow-100',
    badgeTextColor: 'text-amber-950',
    cardGradient: 'from-amber-950 via-stone-900 to-yellow-950',
    cardBorder: 'border-yellow-400/50',
    glowColor: '#F59E0B',
    primaryColor: '#EAB308',
    accentColor: '#FEF08A',
    seatRingClass: 'ring-yellow-400 shadow-[0_0_25px_rgba(245,158,11,0.7)]',
    bubbleClass: 'bg-gradient-to-r from-stone-950/95 via-amber-950/80 to-stone-950/95 border-yellow-400/60 text-yellow-100',
    entryBannerTextMr: 'शाही आगमन: सुवर्ण VIP 3 उपस्थित!',
    charmMultiplier: 1.3,
    dailyFreeCoins: 0,
    privileges: [
      {
        id: 'p3_crown',
        titleMr: 'VIP 3 सुवर्ण मुकुट बॅज',
        titleEn: 'Golden Crown Badge',
        descMr: 'खास सुवर्ण मुकुट प्रतीक असलेला प्रतिष्ठा वाढवणारा बॅज',
        iconName: 'crown',
        highlight: true
      },
      {
        id: 'p3_entry',
        titleMr: 'तुतारी शाही आगमन बॅनर',
        titleEn: 'Golden Fanfare Entry Banner',
        descMr: 'रूममध्ये प्रवेश करताच वरून सरकणारा सुवर्ण ध्वज व तुतारी ललकार',
        iconName: 'entry',
        highlight: true
      },
      {
        id: 'p3_seat',
        titleMr: 'सुवर्ण सिंहासन सीट फ्रेम',
        titleEn: 'Golden Throne Seat Frame',
        descMr: 'स्टेजवर तुमची सीट सोन्यासारखी झगमगणाऱ्या रिंगने सजेल',
        iconName: 'seat'
      },
      {
        id: 'p3_bubble',
        titleMr: 'शाही सुवर्ण चॅट बबल',
        titleEn: 'Imperial Gold Chat Bubble',
        descMr: 'गिल्ट कॉर्नर व सुवर्ण अक्षरांचे चॅट बबल',
        iconName: 'bubble'
      },
      {
        id: 'p3_mic',
        titleMr: 'माईक रांगेत प्राधान्य',
        titleEn: 'Stage Seat Priority',
        descMr: 'स्टेजवर रिकाम्या जागेवर बसण्यासाठी प्राधान्य हक्क',
        iconName: 'mic'
      }
    ]
  },
  {
    level: 4,
    nameMr: 'माणिक / रुबाब',
    nameEn: 'Ruby Prestige',
    titleMr: 'अंगार माणिक VIP',
    requiredExp: 5000,
    badgeCode: 'VIP 4',
    gradientTheme: 'from-rose-600 via-red-500 to-rose-700',
    badgeBg: 'bg-gradient-to-r from-red-600 via-rose-500 to-red-700',
    badgeBorder: 'border-rose-200',
    badgeTextColor: 'text-white',
    cardGradient: 'from-rose-950 via-stone-950 to-red-950',
    cardBorder: 'border-rose-500/50',
    glowColor: '#E11D48',
    primaryColor: '#F43F5E',
    accentColor: '#FECDD3',
    seatRingClass: 'ring-rose-500 shadow-[0_0_28px_rgba(225,29,72,0.8)]',
    bubbleClass: 'bg-gradient-to-r from-rose-950/90 via-stone-950/90 to-red-950/90 border-rose-500/60 text-rose-100',
    entryBannerTextMr: 'ज्वाला माणिक VIP 4 यांचे रुबाबात आगमन!',
    charmMultiplier: 1.5,
    dailyFreeCoins: 0,
    privileges: [
      {
        id: 'p4_badge',
        titleMr: 'VIP 4 माणिक्य रुबाब बॅज',
        titleEn: 'Crimson Ruby Badge',
        descMr: 'अतिशय दुर्मीळ लाल माणिकासारखा धगधगणारा बॅज',
        iconName: 'badge',
        highlight: true
      },
      {
        id: 'p4_entry',
        titleMr: 'लाल अंगार रथ आगमन बॅनर',
        titleEn: 'Ruby Chariot Entry Animation',
        descMr: 'व्हॉईस रूममध्ये लाल रंगाच्या झंझावाती प्रभावासह भव्य एंट्री',
        iconName: 'entry',
        highlight: true
      },
      {
        id: 'p4_shield',
        titleMr: 'म्यूट सुरक्षा कवच (Anti-Mute)',
        titleEn: 'Anti-Mute Room Protection',
        descMr: 'सामान्य सदस्यांकडून अचानक म्यूट होण्यापासून संरक्षण',
        iconName: 'shield',
        highlight: true
      },
      {
        id: 'p4_seat',
        titleMr: 'माणिक्य ज्वाळा सीट फ्रेम',
        titleEn: 'Ruby Fire Seat Frame',
        descMr: 'स्टेजवर सीटभोवती लाल माणिकांचे चमकणारे आवरण',
        iconName: 'seat'
      },
      {
        id: 'p4_gift',
        titleMr: '१.५x गिफ्ट चार्म मल्टीप्लायर',
        titleEn: '1.5x Charm Multiplier',
        descMr: 'भेटवस्तूंचा ५०% जास्त प्रभाव व रँकिंग फायदा',
        iconName: 'gift'
      }
    ]
  },
  {
    level: 5,
    nameMr: 'नीलम / राजेशाही',
    nameEn: 'Sapphire Royalty',
    titleMr: 'राजेशाही नीलम VIP',
    requiredExp: 15000,
    badgeCode: 'VIP 5',
    gradientTheme: 'from-cyan-500 via-blue-600 to-indigo-700',
    badgeBg: 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600',
    badgeBorder: 'border-cyan-200',
    badgeTextColor: 'text-white',
    cardGradient: 'from-slate-950 via-blue-950 to-cyan-950',
    cardBorder: 'border-cyan-400/50',
    glowColor: '#06B6D4',
    primaryColor: '#0EA5E9',
    accentColor: '#BAE6FD',
    seatRingClass: 'ring-cyan-400 shadow-[0_0_32px_rgba(6,182,212,0.85)]',
    bubbleClass: 'bg-gradient-to-r from-blue-950/95 via-cyan-950/80 to-slate-950/95 border-cyan-400/70 text-cyan-100',
    entryBannerTextMr: 'राजेशाही नीलम VIP 5 यांचे दिमाखदार आगमन!',
    charmMultiplier: 1.8,
    dailyFreeCoins: 0,
    privileges: [
      {
        id: 'p5_badge',
        titleMr: 'VIP 5 राजेशाही नीलम बॅज',
        titleEn: 'Royal Sapphire Badge',
        descMr: 'रॉयल ब्लू व सायन रंगात तळपणारा प्रतिष्ठित नीलम बॅज',
        iconName: 'badge',
        highlight: true
      },
      {
        id: 'p5_entry',
        titleMr: 'राजहंस व गरूड शाही आगमन',
        titleEn: 'Royal Pegasus / Falcon Entry',
        descMr: 'संपूर्ण व्हॉईस रूमच्या स्क्रीनवर झळकणारा भव्य अॅनिमेटेड बॅनर',
        iconName: 'entry',
        highlight: true
      },
      {
        id: 'p5_mic',
        titleMr: 'माईकवर प्रथम क्रमांक हक्क',
        titleEn: 'First-in-Line Mic Privilege',
        descMr: 'स्पीकर वेटलिस्टमध्ये नेहमी सर्वात वरती स्थान',
        iconName: 'mic',
        highlight: true
      },
      {
        id: 'p5_seat',
        titleMr: 'नीलम क्रिस्टल ऑर्बिट सीट फ्रेम',
        titleEn: 'Sapphire Crystal Orbit Frame',
        descMr: 'फिरणाऱ्या चमकदार निळ्या स्फटिकांसह सीट फ्रेम',
        iconName: 'seat'
      },
      {
        id: 'p5_bubble',
        titleMr: 'नीलम निओन चॅट बबल',
        titleEn: 'Sapphire Neon Chat Bubble',
        descMr: 'सर्व जिल्हा चॅटमध्ये तुमचे मेसेज लक्षवेधी ठरतील',
        iconName: 'bubble'
      }
    ]
  },
  {
    level: 6,
    nameMr: 'हिरा / सरदार',
    nameEn: 'Diamond Commander',
    titleMr: 'अजिंक्य हिरा VIP',
    requiredExp: 40000,
    badgeCode: 'VIP 6',
    gradientTheme: 'from-violet-500 via-fuchsia-500 to-pink-500',
    badgeBg: 'bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-600',
    badgeBorder: 'border-fuchsia-200',
    badgeTextColor: 'text-white',
    cardGradient: 'from-slate-950 via-purple-950 to-fuchsia-950',
    cardBorder: 'border-fuchsia-400/50',
    glowColor: '#D946EF',
    primaryColor: '#C026D3',
    accentColor: '#F5D0FE',
    seatRingClass: 'ring-fuchsia-400 shadow-[0_0_36px_rgba(217,70,239,0.9)]',
    bubbleClass: 'bg-gradient-to-r from-purple-950/95 via-fuchsia-950/80 to-slate-950/95 border-fuchsia-400/70 text-fuchsia-100',
    entryBannerTextMr: 'अजिंक्य हिरा VIP 6 सरदार आगमन!',
    charmMultiplier: 2.0,
    dailyFreeCoins: 0,
    privileges: [
      {
        id: 'p6_badge',
        titleMr: 'VIP 6 अजिंक्य हिरा बॅज',
        titleEn: 'Diamond Commander Badge',
        descMr: 'प्रिझम रंगांचे परावर्तन करणारा अत्यंत उच्च दर्जाचा डायमंड बॅज',
        iconName: 'badge',
        highlight: true
      },
      {
        id: 'p6_shield',
        titleMr: 'अजिंक्य रूम सुरक्षा (Anti-Kick)',
        titleEn: 'Anti-Kick Immunity',
        descMr: 'सार्वजनिक रूममधून बाहेर काढले जाण्यापासून पूर्ण संरक्षण',
        iconName: 'shield',
        highlight: true
      },
      {
        id: 'p6_entry',
        titleMr: 'शाही फटाके व सिंहगर्जना आगमन',
        titleEn: 'Fireworks & Lion Entry Animation',
        descMr: 'रूममध्ये सर्वांचे लक्ष वेधून घेणारे भव्य स्क्रीन अॅनिमेशन',
        iconName: 'entry',
        highlight: true
      },
      {
        id: 'p6_seat',
        titleMr: 'प्रिझम कॉस्मिक सीट फ्रेम',
        titleEn: 'Prismatic Cosmic Seat Frame',
        descMr: 'अवताराभोवती फिरणाऱ्या हिऱ्यांच्या तुकड्यांची सीट फ्रेम',
        iconName: 'seat'
      },
      {
        id: 'p6_gift',
        titleMr: '२.०x डबल चार्म मल्टीप्लायर',
        titleEn: '2.0x Double Charm Multiplier',
        descMr: 'गिफ्ट पाठवताना दुप्पट चार्म पॉईंट्स',
        iconName: 'gift'
      }
    ]
  },
  {
    level: 7,
    nameMr: 'छत्रपती सम्राट',
    nameEn: 'Imperial Emperor',
    titleMr: 'शाही छत्रपती सम्राट VIP',
    requiredExp: 100000,
    badgeCode: 'VIP 7',
    gradientTheme: 'from-amber-400 via-rose-500 to-purple-600',
    badgeBg: 'bg-gradient-to-r from-amber-400 via-fuchsia-600 to-purple-700',
    badgeBorder: 'border-yellow-200',
    badgeTextColor: 'text-yellow-100',
    cardGradient: 'from-stone-950 via-purple-950 to-amber-950',
    cardBorder: 'border-yellow-400/60',
    glowColor: '#F59E0B',
    primaryColor: '#F59E0B',
    accentColor: '#FEF08A',
    seatRingClass: 'ring-yellow-300 shadow-[0_0_40px_rgba(245,158,11,0.95)]',
    bubbleClass: 'bg-gradient-to-r from-purple-950/95 via-amber-950/90 to-purple-950/95 border-yellow-300/80 text-yellow-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    entryBannerTextMr: '👑 महादरबार: शाही छत्रपती सम्राट VIP 7 यांचे आगमन!',
    charmMultiplier: 2.5,
    dailyFreeCoins: 0,
    privileges: [
      {
        id: 'p7_crown',
        titleMr: 'शाही छत्रपती सम्राट बॅज',
        titleEn: 'Supreme Emperor Crest',
        descMr: 'सुवर्ण राजदंड आणि तिहेरी मुकुट असलेला महाअभिषेक बॅज',
        iconName: 'crown',
        highlight: true
      },
      {
        id: 'p7_entry',
        titleMr: 'सर्व्हर-व्यापी महाप्रवेश बॅनर',
        titleEn: 'Server-Wide Imperial Entry',
        descMr: 'जिल्ह्यातील सर्व सदस्यांच्या स्क्रीनवर तुमच्या आगमनाची थेट घोषणा',
        iconName: 'entry',
        highlight: true
      },
      {
        id: 'p7_shield',
        titleMr: 'सर्वोच्च सुरक्षा अधिकार',
        titleEn: 'Supreme Absolute Protection',
        descMr: 'कोणत्याही प्रकारच्या रूम निर्बंधांपासून १००% स्वतंत्र संरक्षण',
        iconName: 'shield',
        highlight: true
      },
      {
        id: 'p7_seat',
        titleMr: 'राजमुद्रा ३D सुवर्ण सिंहासन फ्रेम',
        titleEn: 'Imperial 3D Golden Throne Frame',
        descMr: 'स्टेजवर तुमची सीट खऱ्या सोन्याच्या सिंहासनासारखी झळकते',
        iconName: 'seat',
        highlight: true
      },
      {
        id: 'p7_sparkles',
        titleMr: 'गोल्डन फ्लोटिंग अवतारा आभा',
        titleEn: 'Golden Floating Aura',
        descMr: 'संपूर्ण अॅपमध्ये तुमच्या फोटोभोवती सतत फिरणारे सोनेरी तेज',
        iconName: 'sparkles'
      }
    ]
  },
  {
    level: 8,
    nameMr: 'विश्वविजयी देवराई',
    nameEn: 'Celestial Sovereign',
    titleMr: 'विश्वविजयी देवराई VIP',
    requiredExp: 250000,
    badgeCode: 'VIP 8',
    gradientTheme: 'from-amber-300 via-orange-500 to-rose-600',
    badgeBg: 'bg-gradient-to-r from-yellow-300 via-amber-500 to-rose-600',
    badgeBorder: 'border-white',
    badgeTextColor: 'text-stone-950 font-black',
    cardGradient: 'from-black via-zinc-950 to-stone-900',
    cardBorder: 'border-amber-300/70',
    glowColor: '#FB923C',
    primaryColor: '#F97316',
    accentColor: '#FFEDD5',
    seatRingClass: 'ring-amber-300 shadow-[0_0_50px_rgba(251,146,60,1)]',
    bubbleClass: 'bg-gradient-to-r from-black/95 via-stone-900/95 to-black/95 border-amber-300/90 text-amber-200 shadow-[0_0_20px_rgba(251,146,60,0.5)]',
    entryBannerTextMr: '⚡ देवराई अवतरण: विश्वविजयी VIP 8 यांचे महाआगमन!',
    charmMultiplier: 3.0,
    dailyFreeCoins: 0,
    privileges: [
      {
        id: 'p8_crown',
        titleMr: 'अंतिम विश्वविजयी मुकुट',
        titleEn: 'Celestial Sovereign Crown',
        descMr: 'अॅपमधील सर्वात उच्च व दुर्मीळ शिखर सन्मान',
        iconName: 'crown',
        highlight: true
      },
      {
        id: 'p8_entry',
        titleMr: 'सुवर्ण फिनिक्स पूर्ण स्क्रीन इफेक्ट',
        titleEn: 'Golden Phoenix Screen Takeover',
        descMr: 'सोन्याची पंख पसरून फिनिक्स पक्षाचे पूर्ण स्क्रीन अॅनिमेशन',
        iconName: 'entry',
        highlight: true
      },
      {
        id: 'p8_gift',
        titleMr: '३.०x तिहेरी चार्म पॉवर',
        titleEn: '3.0x Triple Charm Power',
        descMr: 'कोणतीही भेटवस्तू पाठवताना तिप्पट चार्म आणि लीडरबोर्ड गुण',
        iconName: 'gift',
        highlight: true
      },
      {
        id: 'p8_seat',
        titleMr: 'सोलर ऑरोरा महासिंहासन फ्रेम',
        titleEn: 'Solar Aurora Mega-Frame',
        descMr: 'सूर्यतेजासारख्या प्रखर ज्वाळांची अद्वितीय सीट फ्रेम',
        iconName: 'seat'
      }
    ]
  }
];

export const RECHARGE_PACKAGES: RechargePackage[] = [
  {
    id: 'pkg_49',
    inrPrice: 49,
    coins: 50,
    bonusCoins: 5,
    vipExp: 49,
    tagMr: 'सुरुवात पॅक',
    bonusPercent: 10
  },
  {
    id: 'pkg_99',
    inrPrice: 99,
    coins: 105,
    bonusCoins: 15,
    vipExp: 99,
    tagMr: 'लोकप्रिय',
    isPopular: true,
    bonusPercent: 15
  },
  {
    id: 'pkg_249',
    inrPrice: 249,
    coins: 280,
    bonusCoins: 50,
    vipExp: 249,
    tagMr: 'विशेष ऑफर',
    bonusPercent: 18
  },
  {
    id: 'pkg_499',
    inrPrice: 499,
    coins: 600,
    bonusCoins: 150,
    vipExp: 499,
    tagMr: 'खास निवड',
    bonusPercent: 25
  },
  {
    id: 'pkg_999',
    inrPrice: 999,
    coins: 1300,
    bonusCoins: 400,
    vipExp: 999,
    tagMr: 'सर्वोत्कृष्ट मूल्य 🔥',
    isBestValue: true,
    bonusPercent: 30
  },
  {
    id: 'pkg_2499',
    inrPrice: 2499,
    coins: 3500,
    bonusCoins: 1500,
    vipExp: 2499,
    tagMr: 'VIP 4 थेट अनलॉक',
    bonusPercent: 42
  },
  {
    id: 'pkg_4999',
    inrPrice: 4999,
    coins: 7500,
    bonusCoins: 3500,
    vipExp: 4999,
    tagMr: 'VIP 5 थेट अनलॉक',
    bonusPercent: 46
  },
  {
    id: 'pkg_9999',
    inrPrice: 9999,
    coins: 16000,
    bonusCoins: 9000,
    vipExp: 9999,
    tagMr: 'सम्राट पॅक 👑',
    bonusPercent: 56
  }
];

export function getVipTier(level: number): VipTierConfig | undefined {
  return VIP_TIERS.find((t) => t.level === level);
}

export function calculateVipStatus(vipExp: number = 0, coins: number = 0, totalRecharged: number = 0): UserVipStatus {
  const safeExp = Math.max(0, vipExp);
  
  // Find current tier
  let currentLevel = 0;
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
    if (safeExp >= VIP_TIERS[i].requiredExp) {
      currentLevel = VIP_TIERS[i].level;
      break;
    }
  }

  const currentTier = currentLevel > 0 ? getVipTier(currentLevel) || null : null;
  const nextTier = getVipTier(currentLevel + 1) || null;

  let expInCurrentLevel = safeExp;
  let expRequiredForNext = nextTier ? nextTier.requiredExp : safeExp;
  let progressPercent = 0;

  if (nextTier) {
    const prevRequired = currentTier ? currentTier.requiredExp : 0;
    const currentSpan = safeExp - prevRequired;
    const totalSpan = nextTier.requiredExp - prevRequired;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentSpan / totalSpan) * 100)));
    expInCurrentLevel = currentSpan;
    expRequiredForNext = totalSpan;
  } else {
    // Max level achieved
    progressPercent = 100;
  }

  return {
    level: currentLevel,
    exp: safeExp,
    coins: Math.max(0, coins),
    totalRecharged: Math.max(0, totalRecharged),
    currentTier,
    nextTier,
    expInCurrentLevel,
    expRequiredForNext,
    progressPercent
  };
}
