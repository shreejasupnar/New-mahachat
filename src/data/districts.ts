export interface District {
  id: string;
  nameEn: string;
  nameMr: string;
  divisionEn: string;
  divisionMr: string;
  landmark: string;
  landmarkMr: string;
  iconType: 'fort' | 'temple' | 'metro' | 'lake' | 'tiger' | 'caves' | 'coast' | 'monument';
  color: string;
}

export const MAHARASHTRA_DISTRICTS: District[] = [
  {
    id: 'pune',
    nameEn: 'Pune',
    nameMr: 'पुणे',
    divisionEn: 'Pune',
    divisionMr: 'पुणे विभाग',
    landmark: 'Shaniwar Wada & Sinhagad',
    landmarkMr: 'शनिवार वाडा व सिंहगड',
    iconType: 'fort',
    color: '#D97706' // Warm Amber
  },
  {
    id: 'mumbai-city',
    nameEn: 'Mumbai City',
    nameMr: 'मुंबई शहर',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण विभाग',
    landmark: 'Gateway of India',
    landmarkMr: 'गेटवे ऑफ इंडिया',
    iconType: 'metro',
    color: '#2563EB' // Royal Blue
  },
  {
    id: 'mumbai-suburban',
    nameEn: 'Mumbai Suburban',
    nameMr: 'मुंबई उपनगर',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण विभाग',
    landmark: 'Bandra-Worli Sea Link & Sanjay Gandhi National Park',
    landmarkMr: 'सी लिंक व नॅशनल पार्क',
    iconType: 'metro',
    color: '#0284C7' // Sky Blue
  },
  {
    id: 'thane',
    nameEn: 'Thane',
    nameMr: 'ठाणे',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण विभाग',
    landmark: 'City of Lakes & Upvan Lake',
    landmarkMr: 'तलावांचे शहर (उपवन)',
    iconType: 'lake',
    color: '#059669' // Emerald Green
  },
  {
    id: 'nashik',
    nameEn: 'Nashik',
    nameMr: 'नाशिक',
    divisionEn: 'Nashik',
    divisionMr: 'नाशिक विभाग',
    landmark: 'Trimbakeshwar & Godavari Ghat',
    landmarkMr: 'त्र्यंबकेश्वर व गोदावरी घाट',
    iconType: 'temple',
    color: '#DC2626' // Red/Crimson
  },
  {
    id: 'chhatrapati-sambhajinagar',
    nameEn: 'Chhatrapati Sambhajinagar',
    nameMr: 'छत्रपती संभाजीनगर',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा विभाग',
    landmark: 'Ajanta & Ellora Caves, Bibi Ka Maqbara',
    landmarkMr: 'अजिंठा-वेरूळ लेणी व दौलताबाद',
    iconType: 'caves',
    color: '#1D4ED8' // Deep Blue
  },
  {
    id: 'kolhapur',
    nameEn: 'Kolhapur',
    nameMr: 'कोल्हापूर',
    divisionEn: 'Pune',
    divisionMr: 'पुणे विभाग',
    landmark: 'Mahalakshmi Ambabai Temple & Rankala',
    landmarkMr: 'अंबाबाई मंदिर व रंकाळा तलाव',
    iconType: 'temple',
    color: '#B45309' // Bronze Amber
  },
  {
    id: 'satara',
    nameEn: 'Satara',
    nameMr: 'सातारा',
    divisionEn: 'Pune',
    divisionMr: 'पुणे विभाग',
    landmark: 'Ajinkyatara & Kaas Plateau',
    landmarkMr: 'अजिंक्यतारा व कास पठार',
    iconType: 'fort',
    color: '#047857' // Deep Emerald
  },
  {
    id: 'nagpur',
    nameEn: 'Nagpur',
    nameMr: 'नागपूर',
    divisionEn: 'Nagpur',
    divisionMr: 'विदर्भ (नागपूर) विभाग',
    landmark: 'Zero Mile & Deekshabhoomi',
    landmarkMr: 'दीक्षाभूमी व झिरो माईल',
    iconType: 'monument',
    color: '#EA580C' // Orange
  },
  {
    id: 'ahilyanagar',
    nameEn: 'Ahilyanagar',
    nameMr: 'अहिल्यानगर',
    divisionEn: 'Nashik',
    divisionMr: 'नाशिक विभाग',
    landmark: 'Ahmednagar Fort & Shirdi Sai Baba',
    landmarkMr: 'भुईकोट किल्ला व शिर्डी',
    iconType: 'temple',
    color: '#CA8A04' // Ochre Yellow
  },
  {
    id: 'akola',
    nameEn: 'Akola',
    nameMr: 'अकोला',
    divisionEn: 'Amravati',
    divisionMr: 'विदर्भ (अमरावती) विभाग',
    landmark: 'Narnala Fort & Rajeshwar Temple',
    landmarkMr: 'नरनाळा किल्ला व राजेश्वर मंदिर',
    iconType: 'fort',
    color: '#4B5563'
  },
  {
    id: 'amravati',
    nameEn: 'Amravati',
    nameMr: 'अमरावती',
    divisionEn: 'Amravati',
    divisionMr: 'विदर्भ (अमरावती) विभाग',
    landmark: 'Ambadevi Temple & Melghat Tiger Reserve',
    landmarkMr: 'अंबादेवी मंदिर व मेळघाट',
    iconType: 'tiger',
    color: '#0D9488'
  },
  {
    id: 'beed',
    nameEn: 'Beed',
    nameMr: 'बीड',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा विभाग',
    landmark: 'Parli Vaijnath Jyotirlinga & Kankaleshwar',
    landmarkMr: 'परळी वैजनाथ व कंकाळेश्वर',
    iconType: 'temple',
    color: '#D97706'
  },
  {
    id: 'bhandara',
    nameEn: 'Bhandara',
    nameMr: 'भंडारा',
    divisionEn: 'Nagpur',
    divisionMr: 'विदर्भ (नागपूर) विभाग',
    landmark: 'Brass City & Gaimukh',
    landmarkMr: 'पितळ नगरी व गायमुख',
    iconType: 'lake',
    color: '#6366F1'
  },
  {
    id: 'buldhana',
    nameEn: 'Buldhana',
    nameMr: 'बुलढाणा',
    divisionEn: 'Amravati',
    divisionMr: 'विदर्भ (अमरावती) विभाग',
    landmark: 'Lonar Crater Lake & Sindkhed Raja',
    landmarkMr: 'लोणार सरोवर व सिंदखेड राजा',
    iconType: 'lake',
    color: '#0891B2'
  },
  {
    id: 'chandrapur',
    nameEn: 'Chandrapur',
    nameMr: 'चंद्रपूर',
    divisionEn: 'Nagpur',
    divisionMr: 'विदर्भ (नागपूर) विभाग',
    landmark: 'Tadoba-Andhari Tiger Reserve & Mahakali Temple',
    landmarkMr: 'ताडोबा व्याघ्र प्रकल्प व महाकाली मंदिर',
    iconType: 'tiger',
    color: '#B91C1C'
  },
  {
    id: 'dharashiv',
    nameEn: 'Dharashiv',
    nameMr: 'धाराशिव',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा विभाग',
    landmark: 'Tuljabhavani Temple & Dharashiv Caves',
    landmarkMr: 'तुळजाभवानी मंदिर व लेणी',
    iconType: 'temple',
    color: '#BE123C'
  },
  {
    id: 'dhule',
    nameEn: 'Dhule',
    nameMr: 'धुळे',
    divisionEn: 'Nashik',
    divisionMr: 'खान्देश / नाशिक विभाग',
    landmark: 'Songir Fort & Laling Fort',
    landmarkMr: 'सोनगीर किल्ला व लळिंग',
    iconType: 'fort',
    color: '#7C3AED'
  },
  {
    id: 'gadchiroli',
    nameEn: 'Gadchiroli',
    nameMr: 'गडचिरोली',
    divisionEn: 'Nagpur',
    divisionMr: 'विदर्भ (नागपूर) विभाग',
    landmark: 'Markanda Temple & Forest Heritage',
    landmarkMr: 'मार्कंडा मंदिर व घनदाट वने',
    iconType: 'temple',
    color: '#15803D'
  },
  {
    id: 'gondia',
    nameEn: 'Gondia',
    nameMr: 'गोंदिया',
    divisionEn: 'Nagpur',
    divisionMr: 'विदर्भ (नागपूर) विभाग',
    landmark: 'Navegaon National Park & Nagzira',
    landmarkMr: 'नवेगाव राष्ट्रीय उद्यान व नागझिरा',
    iconType: 'tiger',
    color: '#047857'
  },
  {
    id: 'hingoli',
    nameEn: 'Hingoli',
    nameMr: 'हिंगोली',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा विभाग',
    landmark: 'Aundha Nagnath Jyotirlinga',
    landmarkMr: 'औंढा नागनाथ ज्योतिर्लिंग',
    iconType: 'temple',
    color: '#C2410C'
  },
  {
    id: 'jalgaon',
    nameEn: 'Jalgaon',
    nameMr: 'जळगाव',
    divisionEn: 'Nashik',
    divisionMr: 'खान्देश / नाशिक विभाग',
    landmark: 'Gold & Banana City, Padmalaya',
    landmarkMr: 'सुवर्ण नगरी, केळी व पद्मालय',
    iconType: 'monument',
    color: '#EAB308'
  },
  {
    id: 'jalna',
    nameEn: 'Jalna',
    nameMr: 'जालना',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा विभाग',
    landmark: 'Steel City & Matsyodari Devi',
    landmarkMr: 'स्टील नगरी व मत्स्योदरी देवी',
    iconType: 'temple',
    color: '#475569'
  },
  {
    id: 'latur',
    nameEn: 'Latur',
    nameMr: 'लातूर',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा विभाग',
    landmark: 'Ganj Golai & Siddheshwar Temple',
    landmarkMr: 'गंज गोलाई व सिद्धेश्वर मंदिर',
    iconType: 'monument',
    color: '#9333EA'
  },
  {
    id: 'nanded',
    nameEn: 'Nanded',
    nameMr: 'नांदेड',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा विभाग',
    landmark: 'Hazur Sahib Gurudwara & Godavari',
    landmarkMr: 'सचखंड हुजूर साहिब गुरुद्वारा',
    iconType: 'temple',
    color: '#EA580C'
  },
  {
    id: 'nandurbar',
    nameEn: 'Nandurbar',
    nameMr: 'नंदुरबार',
    divisionEn: 'Nashik',
    divisionMr: 'खान्देश / नाशिक विभाग',
    landmark: 'Toranmal Hill Station & Asthamba',
    landmarkMr: 'तोरणमाळ थंड हवेचे ठिकाण',
    iconType: 'fort',
    color: '#16A34A'
  },
  {
    id: 'palghar',
    nameEn: 'Palghar',
    nameMr: 'पालघर',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण विभाग',
    landmark: 'Shirgaon Fort, Kelva Beach & Warli Art',
    landmarkMr: 'केळवे बीच, शिरगाव किल्ला व वारली कला',
    iconType: 'coast',
    color: '#0284C7'
  },
  {
    id: 'parbhani',
    nameEn: 'Parbhani',
    nameMr: 'परभणी',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा विभाग',
    landmark: 'Turabul Haq Dargah & Agriculture Heritage',
    landmarkMr: 'हजरत तुराबुल हक दर्गा',
    iconType: 'monument',
    color: '#4F46E5'
  },
  {
    id: 'raigad',
    nameEn: 'Raigad',
    nameMr: 'रायगड',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण विभाग',
    landmark: 'Capital of Maratha Empire - Fort Raigad',
    landmarkMr: 'छत्रपती शिवाजी महाराजांची राजधानी - रायगड',
    iconType: 'fort',
    color: '#DC2626'
  },
  {
    id: 'ratnagiri',
    nameEn: 'Ratnagiri',
    nameMr: 'रत्नागिरी',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण विभाग',
    landmark: 'Hapús Mangoes, Jaigad & Bhatye Beach',
    landmarkMr: 'हापूस आंबा, जयगड व गणपतीपुळे',
    iconType: 'coast',
    color: '#0284C7'
  },
  {
    id: 'sangli',
    nameEn: 'Sangli',
    nameMr: 'सांगली',
    divisionEn: 'Pune',
    divisionMr: 'पुणे विभाग',
    landmark: 'Turmeric City & Ganpati Temple',
    landmarkMr: 'हळदीचे शहर व सांगली गणपती मंदिर',
    iconType: 'temple',
    color: '#D97706'
  },
  {
    id: 'sindhudurg',
    nameEn: 'Sindhudurg',
    nameMr: 'सिंधुदुर्ग',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण विभाग',
    landmark: 'Sindhudurg Sea Fort & Tarkarli Beach',
    landmarkMr: 'सिंधुदुर्ग जलदुर्ग व तारकर्ली',
    iconType: 'fort',
    color: '#0891B2'
  },
  {
    id: 'solapur',
    nameEn: 'Solapur',
    nameMr: 'सोलापूर',
    divisionEn: 'Pune',
    divisionMr: 'पुणे विभाग',
    landmark: 'Siddheshwar Temple, Chaddar & Great Indian Bustard',
    landmarkMr: 'सिद्धेश्वर मंदिर व सोलापुरी चादर',
    iconType: 'temple',
    color: '#7C3AED'
  },
  {
    id: 'wardha',
    nameEn: 'Wardha',
    nameMr: 'वर्धा',
    divisionEn: 'Nagpur',
    divisionMr: 'विदर्भ (नागपूर) विभाग',
    landmark: 'Sevagram Ashram & Gitai Mandir',
    landmarkMr: 'सेवाग्राम आश्रम व गीताई मंदिर',
    iconType: 'monument',
    color: '#D97706'
  },
  {
    id: 'washim',
    nameEn: 'Washim',
    nameMr: 'वाशीम',
    divisionEn: 'Amravati',
    divisionMr: 'विदर्भ (अमरावती) विभाग',
    landmark: 'Balaji Temple & Padmatirtha Lake',
    landmarkMr: 'श्री बालाजी मंदिर व पद्मातीर्थ',
    iconType: 'temple',
    color: '#059669'
  },
  {
    id: 'yavatmal',
    nameEn: 'Yavatmal',
    nameMr: 'यवतमाळ',
    divisionEn: 'Amravati',
    divisionMr: 'विदर्भ (अमरावती) विभाग',
    landmark: 'Cotton City & Tipeshwar Wildlife',
    landmarkMr: 'कापूस नगरी व टिपेश्वर अभयारण्य',
    iconType: 'tiger',
    color: '#D97706'
  }
];

export const DIVISIONS = [
  { id: 'all', nameMr: 'सर्व जिल्हे', nameEn: 'All Districts' },
  { id: 'Pune', nameMr: 'पुणे विभाग', nameEn: 'Pune Division' },
  { id: 'Konkan', nameMr: 'कोकण विभाग', nameEn: 'Konkan Division' },
  { id: 'Nashik', nameMr: 'नाशिक विभाग', nameEn: 'Nashik Division' },
  { id: 'Marathwada', nameMr: 'मराठवाडा विभाग', nameEn: 'Marathwada Division' },
  { id: 'Nagpur', nameMr: 'नागपूर विभाग', nameEn: 'Nagpur Division' },
  { id: 'Amravati', nameMr: 'अमरावती विभाग', nameEn: 'Amravati Division' },
];

export function getDistrictById(id: string): District | undefined {
  return MAHARASHTRA_DISTRICTS.find(d => d.id === id);
}
