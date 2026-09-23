export interface QuizQuestion {
  id: string;
  category: string;
  questionMr: string;
  questionEn: string;
  options: [string, string, string, string];
  correctIndex: number; // 0 to 3
}

export const QUIZ_QUESTION_BANK: QuizQuestion[] = [
  {
    id: 'mh_1',
    category: 'Maharashtra',
    questionMr: 'महाराष्ट्राची राजधानी कोणती आहे?',
    questionEn: 'What is the capital of Maharashtra?',
    options: ['पुणे', 'नागपूर', 'मुंबई', 'नाशिक'],
    correctIndex: 2
  },
  {
    id: 'mh_2',
    category: 'Maharashtra',
    questionMr: 'महाराष्ट्राची उपराजधानी कोणती?',
    questionEn: 'Which is the sub-capital (winter capital) of Maharashtra?',
    options: ['नागपूर', 'छत्रपती संभाजीनगर', 'कोल्हापूर', 'अमरावती'],
    correctIndex: 0
  },
  {
    id: 'mh_3',
    category: 'History',
    questionMr: 'छत्रपती शिवाजी महाराजांची राजधानी कोणती होती?',
    questionEn: 'Which was the capital fort of Chhatrapati Shivaji Maharaj?',
    options: ['शिवनेरी', 'रायगड', 'प्रतापगड', 'सिंहगड'],
    correctIndex: 1
  },
  {
    id: 'mh_4',
    category: 'Maharashtra',
    questionMr: 'महाराष्ट्रातील सर्वात उंच शिखर कोणते?',
    questionEn: 'Which is the highest peak in Maharashtra?',
    options: ['महाबळेश्वर', 'साल्हेर', 'कळसूबाई', 'हरिश्चंद्रगड'],
    correctIndex: 2
  },
  {
    id: 'sp_1',
    category: 'Sports',
    questionMr: 'क्रिकेटचा देव मानले जाणारे सचिन तेंडुलकर कोणत्या शहराचे आहेत?',
    questionEn: 'Sachin Tendulkar is from which Indian city?',
    options: ['मुंबई', 'पुणे', 'दिल्ली', 'कोलकाता'],
    correctIndex: 0
  },
  {
    id: 'sp_2',
    category: 'Sports',
    questionMr: 'भारताने प्रथमच क्रिकेट एकदिवसीय विश्वचषक कोणत्या वर्षी जिंकला?',
    questionEn: 'In which year did India win its first Cricket World Cup?',
    options: ['१९७५', '१९८३', '२००७', '२०११'],
    correctIndex: 1
  },
  {
    id: 'in_1',
    category: 'India',
    questionMr: 'भारताचे राष्ट्रीय फूल कोणते आहे?',
    questionEn: 'What is the national flower of India?',
    options: ['गुलाब', 'कमळ', 'सूर्यफूल', 'जास्वंद'],
    correctIndex: 1
  },
  {
    id: 'in_2',
    category: 'India',
    questionMr: 'भारतात प्रथम रेल्वे कोणत्या दोन शहरांदरम्यान धावली?',
    questionEn: 'The first train in India ran between which two stations?',
    options: ['मुंबई ते ठाणे', 'पुणे ते सोलापूर', 'दिल्ली ते आग्रा', 'कोलकाता ते हावडा'],
    correctIndex: 0
  },
  {
    id: 'mv_1',
    category: 'Movies',
    questionMr: 'भारतीय चित्रपटसृष्टीचे जनक कोणाला म्हटले जाते?',
    questionEn: 'Who is known as the Father of Indian Cinema?',
    options: ['दादासाहेब फाळके', 'राज कपूर', 'व्ही. शांताराम', 'सत्यजित रे'],
    correctIndex: 0
  },
  {
    id: 'mv_2',
    category: 'Movies',
    questionMr: 'सर्वोत्कृष्ट ऑस्कर गाण्याचा मान मिळवणारे "नाटू नाटू" गाणे कोणत्या चित्रपटातील आहे?',
    questionEn: 'Which movie features the Oscar-winning song "Naatu Naatu"?',
    options: ['बाहुबली', 'RRR', 'पुष्पा', 'KGF'],
    correctIndex: 1
  },
  {
    id: 'sc_1',
    category: 'Science',
    questionMr: 'मानवी शरीरात रक्ताचे शुद्धीकरण कोणत्या अवयवात होते?',
    questionEn: 'Which organ filters and purifies blood in the human body?',
    options: ['हृदय', 'फुप्फुस', 'मूत्रपिंड (Kidney)', 'यकृत'],
    correctIndex: 2
  },
  {
    id: 'sc_2',
    category: 'Science',
    questionMr: 'सूर्याच्या प्रकाशातून मानवी शरीराला कोणते जीवनसत्त्व मिळते?',
    questionEn: 'Which vitamin is synthesized by human skin from sunlight?',
    options: ['जीवनसत्त्व अ', 'जीवनसत्त्व ब', 'जीवनसत्त्व क', 'जीवनसत्त्व ड (Vitamin D)'],
    correctIndex: 3
  },
  {
    id: 'tc_1',
    category: 'Technology',
    questionMr: 'Android ऑपरेटिंग सिस्टीम कोणत्या कंपनीने विकसित केली आहे?',
    questionEn: 'Which company develops the Android operating system?',
    options: ['Google', 'Apple', 'Microsoft', 'Samsung'],
    correctIndex: 0
  },
  {
    id: 'tc_2',
    category: 'Technology',
    questionMr: 'इंटरनेटवर ईमेल पाठवण्यासाठी सामान्यतः कोणता प्रोटोकॉल वापरला जातो?',
    questionEn: 'Which protocol is standard for sending emails over the internet?',
    options: ['HTTP', 'SMTP', 'FTP', 'DNS'],
    correctIndex: 1
  },
  {
    id: 'gk_1',
    category: 'General Knowledge',
    questionMr: 'महाराष्ट्रातील ३६ वे सर्वात नवीन निर्माण झालेले जिल्हे कोणते?',
    questionEn: 'Which is the 36th and newest district of Maharashtra?',
    options: ['पालघर', 'गोंदिया', 'हिंगोली', 'वाशिम'],
    correctIndex: 0
  },
  {
    id: 'gk_2',
    category: 'General Knowledge',
    questionMr: 'जागतिक वारसा स्थळ असलेली "अजिंठा व वेरूळ लेणी" कोणत्या जिल्ह्यात आहेत?',
    questionEn: 'Ajanta and Ellora caves are in which Maharashtra district?',
    options: ['पुणे', 'छत्रपती संभाजीनगर', 'नाशिक', 'रायगड'],
    correctIndex: 1
  }
];

export function getRandomQuizQuestions(count: number = 5): QuizQuestion[] {
  const shuffled = [...QUIZ_QUESTION_BANK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
