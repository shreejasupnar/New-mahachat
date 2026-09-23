import { GameItem } from '../types';

export const GAME_ZONE_CATALOG: GameItem[] = [
  // ==========================================
  // 1. BOARD GAMES (1 - 6)
  // ==========================================
  {
    id: 'ludo',
    nameMr: 'ल्युडो (Ludo)',
    nameEn: 'Ludo 1v1',
    category: 'board',
    descriptionMr: 'क्लासिक १ विरुद्ध १ ल्युडो. फासे फेका, गोटी चालवा आणि प्रतिस्पर्ध्याची गोटी पकडून आधी होममध्ये पोहोचा.',
    descriptionEn: 'Fast-paced 1v1 balanced Ludo duel. Roll dice, strike tokens, and reach home first.',
    icon: '🎲',
    bannerGradient: 'from-amber-500/20 via-orange-600/30 to-red-600/40',
    accentColor: '#f97316',
    entryFeeCoins: 30,
    popular: true,
    difficulty: 'सोपे',
    playTimeMinutes: 3,
    howToPlayMr: [
      'दोन्ही खेळाडूंना प्रत्येकी २ गोट्या मिळतील.',
      '६ आल्यावर टोकन बोर्डवर उतरवता येईल किंवा ६ घरांची चाल मिळेल.',
      'प्रतिस्पर्ध्याच्या घरावर उतरून त्याला कट करा. सेफ घरांवर कट होणार नाही.',
      'दोन्ही गोट्या प्रथम होममध्ये नेणारा खेळाडू विजेता ठरेल.'
    ]
  },
  {
    id: 'carrom',
    nameMr: 'कॅरम (Carrom)',
    nameEn: 'Carrom 1v1',
    category: 'board',
    descriptionMr: 'अस्सल डिजिटल कॅरम. स्ट्रायकरची दिशा व ताकद निवडून सोंगट्या खिशात पाडा. राणीवर (Queen) कव्हर मिळवा!',
    descriptionEn: 'Realistic digital carrom with precision striker aiming, power meter and queen cover.',
    icon: '🎯',
    bannerGradient: 'from-yellow-500/20 via-amber-600/30 to-stone-700/40',
    accentColor: '#eab308',
    entryFeeCoins: 30,
    popular: true,
    difficulty: 'मध्यम',
    playTimeMinutes: 3,
    howToPlayMr: [
      'स्ट्रायकरची दिशा निश्चित करण्यासाठी ड्रॅग करा.',
      'पॉवर बारवर योग्य ताकद धरून स्ट्राइक करा.',
      'पांढऱ्या व काळ्या सोंगट्या योग्य खिशात टाका.',
      'राणी खिशात पडल्यावर लगेच कव्हर करणे बंधनकारक आहे.'
    ]
  },
  {
    id: 'chess',
    nameMr: 'बुद्धिबळ (Chess)',
    nameEn: 'Chess 1v1',
    category: 'board',
    descriptionMr: 'पारंपरिक ८x८ आंतरराष्ट्रीय बुद्धिबळ नियम. प्रत्येक चालीवर विचार करा आणि प्रतिस्पर्ध्याला चेकमेट द्या.',
    descriptionEn: 'Full 8x8 standard chess with timer, legal moves, checkmate detection and move history.',
    icon: '♟️',
    bannerGradient: 'from-slate-600/20 via-zinc-700/30 to-slate-900/40',
    accentColor: '#94a3b8',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'कठीण',
    playTimeMinutes: 5,
    howToPlayMr: [
      'राजा, वजीर, हत्ती, घोडा, उंट आणि प्यादी नियमानुसार चाला.',
      'राजाला चेकमेट देऊन गेम जिंका.',
      'वेळेचे भान ठेवा - टर्न संपण्यापूर्वी चाल खेळणे आवश्यक आहे.'
    ]
  },
  {
    id: 'checkers',
    nameMr: 'चेकर्स (Checkers)',
    nameEn: 'Checkers 1v1',
    category: 'board',
    descriptionMr: 'कर्णरेषेतील उड्या, प्रतिस्पर्ध्याची सोंगटी खाणे आणि किंग (King) बनून संपूर्ण बोर्डवर नियंत्रण मिळवा.',
    descriptionEn: 'Classic 1v1 Checkers with diagonal jumps, multi-captures and King promotions.',
    icon: '🔴',
    bannerGradient: 'from-rose-500/20 via-red-600/30 to-red-950/40',
    accentColor: '#ef4444',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'मध्यम',
    playTimeMinutes: 3,
    howToPlayMr: [
      'काळ्या चौरसांवर तिरपी चाल चला.',
      'प्रतिस्पर्ध्याच्या सोंगटीवरून उडी मारून ती कॅप्चर करा.',
      'शेवटच्या रांगेत पोहोचल्यावर सोंगटी किंग बनते.'
    ]
  },
  {
    id: 'tictactoe',
    nameMr: 'टिक टॅक टो (Tic Tac Toe)',
    nameEn: 'Tic Tac Toe 1v1',
    category: 'board',
    descriptionMr: 'वेगवान ३x३ फेऱ्या. X आणि O ची अचूक जोडणी करा. सलग ३ चिन्हे जुळवा आणि सामना खिशात घाला (Best of 3).',
    descriptionEn: 'Lightning-fast Best of 3 Tic-Tac-Toe duel with real-time turns.',
    icon: '❌',
    bannerGradient: 'from-cyan-500/20 via-blue-600/30 to-indigo-700/40',
    accentColor: '#06b6d4',
    entryFeeCoins: 30,
    popular: true,
    difficulty: 'सोपे',
    playTimeMinutes: 1,
    howToPlayMr: [
      'आपल्या टर्नमध्ये ३x३ ग्रीडमधील मोकळ्या घरात टॅप करा.',
      'आडव्या, उभ्या किंवा तिरप्या ३ चिन्हांची सलग रेष बनवा.',
      '३ पैकी २ फेऱ्या जिंकणारा खेळाडू विजयी ठरतो.'
    ]
  },
  {
    id: 'four_in_a_row',
    nameMr: '४ इन अ रो (4-in-a-Row)',
    nameEn: '4-in-a-Row',
    category: 'board',
    descriptionMr: '७x६ बोर्डवर एकावर एक नाणी खाली टाका. आडवी, उभी किंवा तिरपी ४ नाणी सर्वात आधी जोडा.',
    descriptionEn: 'Connect 4 in a row. Drop colored discs into vertical columns to outsmart opponent.',
    icon: '🟡',
    bannerGradient: 'from-yellow-400/20 via-amber-500/30 to-emerald-600/40',
    accentColor: '#f59e0b',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'मध्यम',
    playTimeMinutes: 2,
    howToPlayMr: [
      '७ स्तंभांपैकी कोणत्याही एका स्तंभावर टॅप करून कॉईन खाली टाका.',
      'कॉईन गुरुत्वाकर्षणाने सर्वात खालच्या रिकाम्या जागेवर बसेल.',
      'आपल्या रंगाची सलग ४ नाणी जोडणारा खेळाडू तत्काळ जिंकतो.'
    ]
  },

  // ==========================================
  // 2. FUN GAMES (7 - 12)
  // ==========================================
  {
    id: 'truth_or_dare',
    nameMr: 'ट्रुथ ऑर डेअर (Truth or Dare)',
    nameEn: 'Truth or Dare 1v1',
    category: 'fun',
    descriptionMr: 'हसरा, स्वच्छ आणि मजेदार १v१ खेळ. मजेशीर प्रश्न किंवा हलकीफुलकी क्रिएटिव्ह चॅलेंज निवडा व रिॲक्ट करा.',
    descriptionEn: 'Safe, fun and hilarious 1v1 social prompts with timer and emoji reactions.',
    icon: '🎭',
    bannerGradient: 'from-purple-500/20 via-fuchsia-600/30 to-pink-600/40',
    accentColor: '#a855f7',
    entryFeeCoins: 30,
    popular: true,
    difficulty: 'सोपे',
    playTimeMinutes: 2,
    howToPlayMr: [
      'आपल्या टर्नवर Truth किंवा Dare निवडा.',
      'स्क्रीनवरील मजेदार स्वच्छ टास्क पूर्ण करा किंवा ऑडिओ/इमोजीने उत्तर द्या.',
      'टास्क अमान्य असल्यास स्किप बटण वापरू शकता.'
    ]
  },
  {
    id: 'spin_challenge',
    nameMr: 'स्पिन अँड चॅलेंज (Spin & Challenge)',
    nameEn: 'Spin & Challenge',
    category: 'fun',
    descriptionMr: 'रंगबेरंगी चक्र फिरवा! चक्र ज्या मजेदार चॅलेंजवर थांबेल, ते आव्हान पूर्ण करा आणि पॉइंट मिळवा.',
    descriptionEn: 'Spin the animated wheel to unlock safe, engaging interactive mini-challenges.',
    icon: '🎡',
    bannerGradient: 'from-pink-500/20 via-rose-600/30 to-orange-500/40',
    accentColor: '#ec4899',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'सोपे',
    playTimeMinutes: 2,
    howToPlayMr: [
      'व्हील फिरवण्यासाठी स्पिन बटण दाबा.',
      'चक्र थांबलेल्या सेगमेंटचे टास्क किंवा मिनी-गेम त्वरित पूर्ण करा.',
      'जास्त पॉइंट्स मिळवून विजय मिळवा.'
    ]
  },
  {
    id: 'rock_paper_scissors',
    nameMr: 'दगड कागद कात्री (Rock Paper Scissors)',
    nameEn: 'Rock Paper Scissors',
    category: 'fun',
    descriptionMr: 'लहानपणाचा सर्वात आवडता खेळ! दगड, कागद किंवा कात्री निवडा. ३ किंवा ५ फेऱ्यांची जुगलबंदी.',
    descriptionEn: 'Classic Rock Paper Scissors duel. Best of 3/5 with instant reveal animation.',
    icon: '✌️',
    bannerGradient: 'from-blue-500/20 via-indigo-600/30 to-violet-700/40',
    accentColor: '#3b82f6',
    entryFeeCoins: 30,
    popular: true,
    difficulty: 'सोपे',
    playTimeMinutes: 1,
    howToPlayMr: [
      'दगड कात्रीला फोडतो, कात्री कागद कापते, कागद दगडाला गुंडाळतो.',
      '३ सेकंदात आपले चिन्ह लॉक करा.',
      '३ फेऱ्या सर्वात आधी जिंकणारा खेळाडू सामना जिंकतो.'
    ]
  },
  {
    id: 'quick_tap',
    nameMr: 'क्विक टॅप (Quick Tap)',
    nameEn: 'Quick Tap Battle',
    category: 'fun',
    descriptionMr: 'रिफ्लेक्स आणि वेगाची परीक्षा! स्क्रीनवर झळकणाऱ्या टार्गेट्सवर विजेच्या वेगाने टॅप करा.',
    descriptionEn: 'High-speed reflex challenge. Tap targets instantly as they spawn to stack score.',
    icon: '⚡',
    bannerGradient: 'from-amber-400/20 via-yellow-500/30 to-red-500/40',
    accentColor: '#eab308',
    entryFeeCoins: 30,
    popular: true,
    difficulty: 'सोपे',
    playTimeMinutes: 1,
    howToPlayMr: [
      'स्क्रीनवर येणाऱ्या गोल्डन व निळ्या सर्कल्सवर वेगाने टॅप करा.',
      'चुकीच्या जागी टॅप केल्यास पेनल्टी होईल.',
      '३० सेकंदात सर्वोच्च गुण मिळवणारा खेळाडू जिंकतो.'
    ]
  },
  {
    id: 'bomb_pass',
    nameMr: 'बॉम्ब पास (Bomb Pass)',
    nameEn: 'Bomb Pass',
    category: 'fun',
    descriptionMr: 'टिक-टिक वाजणारा कार्टून बॉम्ब! त्वरित कार्य पूर्ण करून बॉम्ब प्रतिस्पर्ध्याकडे फेका.',
    descriptionEn: 'Harmless cartoon bomb pass! Complete quick prompts and pass before timer explodes.',
    icon: '💣',
    bannerGradient: 'from-red-500/20 via-rose-700/30 to-stone-900/40',
    accentColor: '#e11d48',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'सोपे',
    playTimeMinutes: 2,
    howToPlayMr: [
      'बॉम्ब तुमच्याकडे असताना स्क्रीनवर दिलेले सोपे बटण सलग टॅप करा.',
      'बॉम्ब प्रतिस्पर्ध्याकडे पास करा.',
      'ज्याच्या हातात बॉम्बचा टायमर संपेल, तो खेळाडू ती फेरी हरतो.'
    ]
  },
  {
    id: 'mini_race',
    nameMr: 'मिनी रेस (Mini Race)',
    nameEn: 'Mini Sprint Race',
    category: 'fun',
    descriptionMr: 'मिनी धावपटूंची मनोरंजक शर्यत! योग्य लयीत टॅप करून स्पीड वाढवा आणि अडथळे पार करा.',
    descriptionEn: 'Fun sprint dash! Tap in rhythm to accelerate and clear obstacles first.',
    icon: '🏃',
    bannerGradient: 'from-emerald-500/20 via-teal-600/30 to-cyan-600/40',
    accentColor: '#10b981',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'सोपे',
    playTimeMinutes: 1,
    howToPlayMr: [
      'धावण्याचा वेग वाढवण्यासाठी उजवे व डावे पाऊल आलटून-पालटून टॅप करा.',
      'अडथळा आल्यास जंप बटण दाबा.',
      'फिनिश लाईन सर्वात आधी ओलांडणारा खेळाडू जिंकतो.'
    ]
  },

  // ==========================================
  // 3. BRAIN GAMES (13 - 17)
  // ==========================================
  {
    id: 'quiz_battle',
    nameMr: 'क्विझ बॅटल (Quiz Battle)',
    nameEn: 'Quiz Battle',
    category: 'brain',
    descriptionMr: 'महाराष्ट्र, भारत, खेळ, चित्रपट व इतिहास यावरील प्रश्न. अचूक आणि जलद उत्तराला जास्त गुण!',
    descriptionEn: 'Live trivia quiz duel. Both players face identical questions with speed bonus scoring.',
    icon: '💡',
    bannerGradient: 'from-indigo-500/20 via-blue-600/30 to-purple-700/40',
    accentColor: '#6366f1',
    entryFeeCoins: 30,
    popular: true,
    difficulty: 'मध्यम',
    playTimeMinutes: 2,
    howToPlayMr: [
      'दोन्ही खेळाडूंना एकाच वेळी ५ समान प्रश्न दिसतील.',
      'प्रत्येक प्रश्नाला १० सेकंदांचा टायमर असतो.',
      'अचूक आणि जितक्या लवकर उत्तर द्याल, तितके जास्त गुण मिळतील.'
    ]
  },
  {
    id: 'memory_match',
    nameMr: 'मेमरी मॅच (Memory Match)',
    nameEn: 'Memory Match',
    category: 'brain',
    descriptionMr: 'स्मरणशक्तीची कसोटी! कार्डे उलटी करून समान जोड्या शोधा. सलग जोड्यांना कॉम्बो बोनस.',
    descriptionEn: 'Card flip memory grid duel. Reveal pairs and trigger combos to dominate.',
    icon: '🃏',
    bannerGradient: 'from-violet-500/20 via-purple-600/30 to-indigo-800/40',
    accentColor: '#8b5cf6',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'मध्यम',
    playTimeMinutes: 2,
    howToPlayMr: [
      '४x४ ग्रीडमधील २ कार्डे उघडून चिन्ह पाहा.',
      'समान चिन्ह निघाल्यास पॉइंट मिळून सोंगट्या जमा होतात.',
      'जास्त जोड्या गोळा करणारा खेळाडू विजयी होतो.'
    ]
  },
  {
    id: 'word_battle',
    nameMr: 'शब्द युद्ध (Word Battle)',
    nameEn: 'Word Battle',
    category: 'brain',
    descriptionMr: 'दिलेल्या अक्षरांमधून जास्तीत जास्त अर्थपूर्ण शब्द बनवा. मराठी व इंग्रजी दोन्ही शब्द मान्य!',
    descriptionEn: 'Letter scramble word challenge. Form valid words against the countdown clock.',
    icon: '📝',
    bannerGradient: 'from-teal-500/20 via-emerald-600/30 to-green-700/40',
    accentColor: '#14b8a6',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'मध्यम',
    playTimeMinutes: 2,
    howToPlayMr: [
      'दिलेल्या अक्षरांवर टॅप करून वैध शब्द तयार करा.',
      'शब्दाच्या लांबीनुसार अधिक गुण मिळतील.',
      'वेळ संपल्यावर ज्याचे गुण जास्त असतील तो खेळाडू जिंकेल.'
    ]
  },
  {
    id: 'higher_lower',
    nameMr: 'हाय किंवा लो (Higher or Lower)',
    nameEn: 'Higher or Lower',
    category: 'brain',
    descriptionMr: 'पुढचे कार्ड मोठे असेल की लहान? अचूक अंदाज बांधा आणि सलग विन स्ट्रीक निर्माण करा.',
    descriptionEn: 'Card prediction game with probability analysis, streaks and score multipliers.',
    icon: '📈',
    bannerGradient: 'from-sky-500/20 via-blue-600/30 to-cyan-700/40',
    accentColor: '#0284c7',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'सोपे',
    playTimeMinutes: 1,
    howToPlayMr: [
      'स्क्रीनवरील कार्ड पाहून पुढील कार्ड "Higher" की "Lower" हे निवडा.',
      'सलग अचूक अंदाजांना २x, ३x मल्टीप्लायर मिळेल.',
      'सर्वाधिक अचूक अंदाज देणारा खेळाडू विजेता ठरतो.'
    ]
  },
  {
    id: 'dots_and_boxes',
    nameMr: 'डॉट्स अँड बॉक्सेस (Dots & Boxes)',
    nameEn: 'Dots & Boxes',
    category: 'brain',
    descriptionMr: 'ठिपके जोडून रेष काढा. चौरस पूर्ण करून स्वतःचे नाव नोंदवा. चौरस पूर्ण केल्यास अतिरिक्त चाल!',
    descriptionEn: 'Classic dots and boxes grid. Close squares to score and earn extra turns.',
    icon: '⚄',
    bannerGradient: 'from-amber-500/20 via-orange-600/30 to-stone-800/40',
    accentColor: '#d97706',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'कठीण',
    playTimeMinutes: 3,
    howToPlayMr: [
      'दोन लगतच्या ठिपक्यांमध्ये आडवी किंवा उभी रेघ ओढा.',
      'चौथा भाग जोडून जो चौरस पूर्ण करेल, तो बॉक्स त्याचा होतो आणि त्याला अतिरिक्त चाल मिळते.',
      'बोर्डवर सर्वाधिक बॉक्सेस जिंकणारा खेळाडू विजयी.'
    ]
  },

  // ==========================================
  // 4. ACTION GAMES (18 - 23)
  // ==========================================
  {
    id: 'viti_dandu',
    nameMr: 'विटी दांडू (Viti Dandu Duel)',
    nameEn: 'Viti Dandu Duel',
    category: 'action',
    descriptionMr: 'महाराष्ट्राचा अस्सल पारंपरिक खेळ! विटी उडवून हवेत दांडूने अचूक फटका मारा. अंतर मोजा आणि विक्रम करा.',
    descriptionEn: 'Signature Maharashtra traditional sport. Flip the viti, time your strike and hit for maximum distance.',
    icon: '🏏',
    bannerGradient: 'from-orange-500/20 via-amber-600/30 to-emerald-700/40',
    accentColor: '#ea580c',
    entryFeeCoins: 30,
    popular: true,
    isNew: true,
    difficulty: 'मध्यम',
    playTimeMinutes: 2,
    howToPlayMr: [
      'पायरी १: विटीला हवेत उडवण्यासाठी अचूक क्षणी फ्लिक करा.',
      'पायरी २: विटी खाली येताना टाइमिंग मीटर हिरव्या झोनमध्ये असताना दांडू फिरवा.',
      'पायरी ३: ३ फेऱ्यांमध्ये विटीचे एकूण अंतर ज्याचे जास्त तो विजेता!'
    ]
  },
  {
    id: 'archery_duel',
    nameMr: 'धनुर्विद्या (Archery Duel)',
    nameEn: 'Archery Duel',
    category: 'action',
    descriptionMr: 'धनुष्यबाणाने अचूक लक्ष्यवेध करा. वाऱ्याचा रोख ओळखा आणि १०-पॉइंट बुलसाईवर (Bullseye) बाण मारा.',
    descriptionEn: 'Precision bow aiming with wind simulation. Land arrows in the 10-ring bullseye.',
    icon: '🏹',
    bannerGradient: 'from-emerald-500/20 via-green-600/30 to-teal-800/40',
    accentColor: '#16a34a',
    entryFeeCoins: 30,
    popular: true,
    difficulty: 'मध्यम',
    playTimeMinutes: 2,
    howToPlayMr: [
      'लक्ष्यावर क्रॉसहेअर आणण्यासाठी ड्रॅग करा.',
      'स्क्रीनवरील वाऱ्याच्या दिशेनुसार थोडा बदल करा.',
      'हात स्थिर ठेवून बाण सोडा. ५ बाणांचे एकूण गुण मोजले जातील.'
    ]
  },
  {
    id: 'snake_duel',
    nameMr: 'स्नेक ड्युएल (Snake Duel)',
    nameEn: 'Snake Duel',
    category: 'action',
    descriptionMr: 'एकाच मैदानात दोन साप! सफरचंद खा, स्वतःची लांबी वाढवा आणि प्रतिस्पर्ध्याला अडकवून संपवा.',
    descriptionEn: '1v1 battle arena snakes. Feed, grow and trap the rival snake without colliding.',
    icon: '🐍',
    bannerGradient: 'from-lime-500/20 via-emerald-600/30 to-stone-900/40',
    accentColor: '#84cc16',
    entryFeeCoins: 30,
    popular: true,
    difficulty: 'मध्यम',
    playTimeMinutes: 2,
    howToPlayMr: [
      'दिशानिर्देश बटणांनी किंवा स्वाइपने सापाला वळवा.',
      'अन्नाचे दाणे खाऊन लांबी वाढवा.',
      'भिंतीला किंवा प्रतिस्पर्ध्याच्या शरीराला धडकल्यास आऊट व्हाल.'
    ]
  },
  {
    id: 'mini_car_race',
    nameMr: 'मिनी कार रेस (Mini Car Race)',
    nameEn: 'Mini Car Race',
    category: 'action',
    descriptionMr: 'टॉप-डाऊन ट्रॅकवर वेगवान कार रेस. स्पीड बूस्ट पॅडचा वापर करा, खड्डे टाळा आणि प्रथम क्रमांक मिळवा.',
    descriptionEn: 'Top-down arcade racer. Hit nitro boost pads, dodge oil slicks and cross line first.',
    icon: '🏎️',
    bannerGradient: 'from-red-500/20 via-orange-600/30 to-zinc-800/40',
    accentColor: '#dc2626',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'मध्यम',
    playTimeMinutes: 2,
    howToPlayMr: [
      'डावी व उजवी स्टीअरिंग बटणे दाबून कार लेनमध्ये ठेवा.',
      'पिवळ्या बूस्ट पॅडवरून गाडी नेऊन कमाल वेग मिळवा.',
      '३ लॅप्स सर्वात आधी पूर्ण करणारा खेळाडू विजयी.'
    ]
  },
  {
    id: 'bow_arrow',
    nameMr: 'नेमबाजी (Bow & Arrow)',
    nameEn: 'Bow & Arrow Targets',
    category: 'action',
    descriptionMr: 'हवेत उडणारे रंगीबेरंगी फुगे आणि हलणारे टार्गेट्स! अचूक टायमिंग साधून सर्वाधिक निशाणे साधा.',
    descriptionEn: 'Dynamic moving target shooter. Pop target balloons to rack up combo points.',
    icon: '🎯',
    bannerGradient: 'from-fuchsia-500/20 via-rose-600/30 to-purple-800/40',
    accentColor: '#d946ef',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'सोपे',
    playTimeMinutes: 1,
    howToPlayMr: [
      'धनुष्य ताणण्यासाठी ड्रॅग करा आणि निशाण्यावर बाण सोडा.',
      'गोल्डन फुगे फोडल्यास डबल पॉइंट्स मिळतील.',
      '४५ सेकंदात सर्वाधिक स्कोअर करणारा खेळाडू विजेता.'
    ]
  },
  {
    id: 'block_puzzle',
    nameMr: 'ब्लॉक पझल (Block Puzzle)',
    nameEn: 'Block Puzzle Battle',
    category: 'action',
    descriptionMr: '८x८ ग्रीडवर रंगीबेरंगी ब्लॉक्स व्यवस्थित बसवा. आडव्या व उभ्या रेषा क्लिअर करून कॉम्बो गुणांची कमाई करा.',
    descriptionEn: 'Fast-paced block placement battle. Clear full lines simultaneously for combo multipliers.',
    icon: '🧱',
    bannerGradient: 'from-blue-600/20 via-indigo-600/30 to-slate-900/40',
    accentColor: '#2563eb',
    entryFeeCoins: 30,
    popular: false,
    difficulty: 'मध्यम',
    playTimeMinutes: 2,
    howToPlayMr: [
      'खालील ३ तुकड्यांमधून एक तुकडा निवडून ग्रीडवर ठेवा.',
      'संपूर्ण आडवी किंवा उभी ओळ भरल्यावर ती नष्ट होते आणि गुण मिळतात.',
      'जागा संपण्यापूर्वी सर्वाधिक गुण मिळवणारा खेळाडू विजयी.'
    ]
  }
];

export const GAME_CATEGORIES_META = [
  {
    id: 'board' as const,
    nameMr: 'बोर्ड गेम्स',
    nameEn: 'Board Games',
    icon: '🧩',
    count: 6,
    accent: '#f97316',
    gradient: 'from-amber-500/20 via-orange-600/20 to-red-600/30',
    border: 'border-orange-500/30',
    description: 'ल्युडो, कॅरम, बुद्धिबळ, टिक टॅक टो व इतर क्लासिक खेळ'
  },
  {
    id: 'fun' as const,
    nameMr: 'फन गेम्स',
    nameEn: 'Fun Games',
    icon: '😂',
    count: 6,
    accent: '#a855f7',
    gradient: 'from-purple-500/20 via-fuchsia-600/20 to-pink-600/30',
    border: 'border-purple-500/30',
    description: 'ट्रुथ ऑर डेअर, दगड कात्री, बॉम्ब पास आणि हसरे खेळ'
  },
  {
    id: 'brain' as const,
    nameMr: 'ब्रेन गेम्स',
    nameEn: 'Brain Games',
    icon: '🧠',
    count: 5,
    accent: '#6366f1',
    gradient: 'from-indigo-500/20 via-blue-600/20 to-cyan-600/30',
    border: 'border-indigo-500/30',
    description: 'क्विझ बॅटल, स्मरणशक्ती, शब्द युद्ध आणि बुद्धीची परीक्षा'
  },
  {
    id: 'action' as const,
    nameMr: 'ॲक्शन गेम्स',
    nameEn: 'Action Games',
    icon: '⚡',
    count: 6,
    accent: '#ea580c',
    gradient: 'from-orange-500/20 via-red-600/20 to-amber-600/30',
    border: 'border-amber-500/30',
    description: 'अस्सल विटी दांडू, धनुर्विद्या, स्नेक व रेसिंगची धम्माल'
  }
];
