// Comprehensive Bangladesh Location Hierarchy Dataset (Bikroy.com Style)
// Divisions -> Districts -> Thanas/Upazilas -> Post Offices & Postal Codes

export const bangladeshDivisions = [
  { id: 'dhaka', name: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 'chattogram', name: 'চট্টগ্রাম', nameEn: 'Chattogram' },
  { id: 'rajshahi', name: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 'khulna', name: 'খুলনা', nameEn: 'Khulna' },
  { id: 'barishal', name: 'বরিশাল', nameEn: 'Barishal' },
  { id: 'sylhet', name: 'সিলেট', nameEn: 'Sylhet' },
  { id: 'rangpur', name: 'রংপুর', nameEn: 'Rangpur' },
  { id: 'mymensingh', name: 'ময়মনসিংহ', nameEn: 'Mymensingh' }
];

export const bangladeshDistricts = [
  // 1. ঢাকা বিভাগ (Dhaka Division)
  { id: 'dhaka_city', divisionId: 'dhaka', name: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 'gazipur', divisionId: 'dhaka', name: 'গাজীপুর', nameEn: 'Gazipur' },
  { id: 'narayanganj', divisionId: 'dhaka', name: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj' },
  { id: 'tangail', divisionId: 'dhaka', name: 'টাঙ্গাইল', nameEn: 'Tangail' },
  { id: 'narsingdi', divisionId: 'dhaka', name: 'নরসিংদী', nameEn: 'Narsingdi' },
  { id: 'faridpur', divisionId: 'dhaka', name: 'ফরিদপুর', nameEn: 'Faridpur' },
  { id: 'manikganj', divisionId: 'dhaka', name: 'মানিকগঞ্জ', nameEn: 'Manikganj' },
  { id: 'munshiganj', divisionId: 'dhaka', name: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj' },
  { id: 'kishoreganj', divisionId: 'dhaka', name: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj' },
  { id: 'gopalganj', divisionId: 'dhaka', name: 'গোপালগঞ্জ', nameEn: 'Gopalganj' },
  { id: 'madaripur', divisionId: 'dhaka', name: 'মাদারীপুর', nameEn: 'Madaripur' },
  { id: 'rajbari', divisionId: 'dhaka', name: 'রাজবাড়ী', nameEn: 'Rajbari' },
  { id: 'shariatpur', divisionId: 'dhaka', name: 'শরীয়তপুর', nameEn: 'Shariatpur' },

  // 2. চট্টগ্রাম বিভাগ (Chattogram Division)
  { id: 'chattogram_city', divisionId: 'chattogram', name: 'চট্টগ্রাম', nameEn: 'Chattogram' },
  { id: 'coxsbazar', divisionId: 'chattogram', name: 'কক্সবাজার', nameEn: "Cox's Bazar" },
  { id: 'cumilla', divisionId: 'chattogram', name: 'কুমিল্লা', nameEn: 'Cumilla' },
  { id: 'brahmanbaria', divisionId: 'chattogram', name: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria' },
  { id: 'chandpur', divisionId: 'chattogram', name: 'চাঁদপুর', nameEn: 'Chandpur' },
  { id: 'noakhali', divisionId: 'chattogram', name: 'নোয়াখালী', nameEn: 'Noakhali' },
  { id: 'feni', divisionId: 'chattogram', name: 'ফেনী', nameEn: 'Feni' },
  { id: 'lakshmipur', divisionId: 'chattogram', name: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur' },
  { id: 'rangamati', divisionId: 'chattogram', name: 'রাঙ্গামাটি', nameEn: 'Rangamati' },
  { id: 'bandarban', divisionId: 'chattogram', name: 'বান্দরবান', nameEn: 'Bandarban' },
  { id: 'khagrachhari', divisionId: 'chattogram', name: 'খাগড়াছড়ি', nameEn: 'Khagrachhari' },

  // 3. রাজশাহী বিভাগ (Rajshahi Division)
  { id: 'rajshahi_city', divisionId: 'rajshahi', name: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 'bogura', divisionId: 'rajshahi', name: 'বগুড়া', nameEn: 'Bogura' },
  { id: 'pabna', divisionId: 'rajshahi', name: 'পাবনা', nameEn: 'Pabna' },
  { id: 'sirajganj', divisionId: 'rajshahi', name: 'সিরাজগঞ্জ', nameEn: 'Sirajganj' },
  { id: 'naogaon', divisionId: 'rajshahi', name: 'নওগাঁ', nameEn: 'Naogaon' },
  { id: 'natore', divisionId: 'rajshahi', name: 'নাটোর', nameEn: 'Natore' },
  { id: 'chapainawabganj', divisionId: 'rajshahi', name: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapainawabganj' },
  { id: 'joypurhat', divisionId: 'rajshahi', name: 'জয়পুরহাট', nameEn: 'Joypurhat' },

  // 4. খুলনা বিভাগ (Khulna Division)
  { id: 'khulna_city', divisionId: 'khulna', name: 'খুলনা', nameEn: 'Khulna' },
  { id: 'jashore', divisionId: 'khulna', name: 'যশোর', nameEn: 'Jashore' },
  { id: 'kushtia', divisionId: 'khulna', name: 'কুষ্টিয়া', nameEn: 'Kushtia' },
  { id: 'satkhira', divisionId: 'khulna', name: 'সাতক্ষীরা', nameEn: 'Satkhira' },
  { id: 'bagerhat', divisionId: 'khulna', name: 'বাগেরহাট', nameEn: 'Bagerhat' },
  { id: 'chuadanga', divisionId: 'khulna', name: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga' },
  { id: 'jhenaidah', divisionId: 'khulna', name: 'ঝিনাইদহ', nameEn: 'Jhenaidah' },
  { id: 'magura', divisionId: 'khulna', name: 'মাগুরা', nameEn: 'Magura' },
  { id: 'meherpur', divisionId: 'khulna', name: 'মেহেরপুর', nameEn: 'Meherpur' },
  { id: 'narail', divisionId: 'khulna', name: 'নড়াইল', nameEn: 'Narail' },

  // 5. বরিশাল বিভাগ (Barishal Division)
  { id: 'barishal_city', divisionId: 'barishal', name: 'বরিশাল', nameEn: 'Barishal' },
  { id: 'bhola', divisionId: 'barishal', name: 'ভোলা', nameEn: 'Bhola' },
  { id: 'patuakhali', divisionId: 'barishal', name: 'পটুয়াখালী', nameEn: 'Patuakhali' },
  { id: 'pirojpur', divisionId: 'barishal', name: 'পিরোজপুর', nameEn: 'Pirojpur' },
  { id: 'barguna', divisionId: 'barishal', name: 'বরগুনা', nameEn: 'Barguna' },
  { id: 'jhalokati', divisionId: 'barishal', name: 'ঝালকাঠি', nameEn: 'Jhalokati' },

  // 6. সিলেট বিভাগ (Sylhet Division)
  { id: 'sylhet_city', divisionId: 'sylhet', name: 'সিলেট', nameEn: 'Sylhet' },
  { id: 'moulvibazar', divisionId: 'sylhet', name: 'মৌলভীবাজার', nameEn: 'Moulvibazar' },
  { id: 'habiganj', divisionId: 'sylhet', name: 'হবিগঞ্জ', nameEn: 'Habiganj' },
  { id: 'sunamganj', divisionId: 'sylhet', name: 'সুনামগঞ্জ', nameEn: 'Sunamganj' },

  // 7. রংপুর বিভাগ (Rangpur Division)
  { id: 'rangpur_city', divisionId: 'rangpur', name: 'রংপুর', nameEn: 'Rangpur' },
  { id: 'dinajpur', divisionId: 'rangpur', name: 'দিনাজপুর', nameEn: 'Dinajpur' },
  { id: 'gaibandha', divisionId: 'rangpur', name: 'গাইবান্ধা', nameEn: 'Gaibandha' },
  { id: 'kurigram', divisionId: 'rangpur', name: 'কুড়িগ্রাম', nameEn: 'Kurigram' },
  { id: 'lalmonirhat', divisionId: 'rangpur', name: 'লালমনিরহাট', nameEn: 'Lalmonirhat' },
  { id: 'nilphamari', divisionId: 'rangpur', name: 'নীলফামারী', nameEn: 'Nilphamari' },
  { id: 'panchagarh', divisionId: 'rangpur', name: 'পঞ্চগড়', nameEn: 'Panchagarh' },
  { id: 'thakurgaon', divisionId: 'rangpur', name: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon' },

  // 8. ময়মনসিংহ বিভাগ (Mymensingh Division)
  { id: 'mymensingh_city', divisionId: 'mymensingh', name: 'ময়মনসিংহ', nameEn: 'Mymensingh' },
  { id: 'jamalpur', divisionId: 'mymensingh', name: 'জামালপুর', nameEn: 'Jamalpur' },
  { id: 'netrokona', divisionId: 'mymensingh', name: 'নেত্রকোণা', nameEn: 'Netrokona' },
  { id: 'sherpur', divisionId: 'mymensingh', name: 'শেরপুর', nameEn: 'Sherpur' }
];

export const bangladeshThanas = {
  // DHAKA DISTRICT THANAS
  dhaka_city: [
    { id: 'mirpur', name: 'মিরপুর', nameEn: 'Mirpur' },
    { id: 'dhanmondi', name: 'ধানমন্ডি', nameEn: 'Dhanmondi' },
    { id: 'gulshan', name: 'গুলশান', nameEn: 'Gulshan' },
    { id: 'uttara', name: 'উত্তরা', nameEn: 'Uttara' },
    { id: 'banani', name: 'বনানী', nameEn: 'Banani' },
    { id: 'mohammadpur', name: 'মোহাম্মদপুর', nameEn: 'Mohammadpur' },
    { id: 'tejgaon', name: 'তেজগাঁও', nameEn: 'Tejgaon' },
    { id: 'badda', name: 'বাড্ডা', nameEn: 'Badda' },
    { id: 'khilgaon', name: 'খিলগাঁও', nameEn: 'Khilgaon' },
    { id: 'motijheel', name: 'মতিঝিল', nameEn: 'Motijheel' },
    { id: 'ramna', name: 'রমনা', nameEn: 'Ramna' },
    { id: 'paltan', name: 'পল্টন', nameEn: 'Paltan' },
    { id: 'lalbagh', name: 'লালবাগ', nameEn: 'Lalbagh' },
    { id: 'chawkbazar', name: 'চকবাজার', nameEn: 'Chawkbazar' },
    { id: 'kotwali_dhaka', name: 'কোতোয়ালী', nameEn: 'Kotwali' },
    { id: 'jatrabari', name: 'যাত্রাবাড়ী', nameEn: 'Jatrabari' },
    { id: 'demra', name: 'ডেমরা', nameEn: 'Demra' },
    { id: 'savar', name: 'সাভার', nameEn: 'Savar' },
    { id: 'dhamrai', name: 'ধামরাই', nameEn: 'Dhamrai' },
    { id: 'keraniganj', name: 'কেরানীগঞ্জ', nameEn: 'Keraniganj' },
    { id: 'ashulia', name: 'আশুলিয়া', nameEn: 'Ashulia' },
    { id: 'bhatara', name: 'ভাটারা (বসুন্ধরা)', nameEn: 'Bhatara / Bashundhara' }
  ],

  // GAZIPUR
  gazipur: [
    { id: 'gazipur_sadar', name: 'গাজীপুর সদর / জয়দেবপুর', nameEn: 'Gazipur Sadar' },
    { id: 'tongitown', name: 'টঙ্গী', nameEn: 'Tongi' },
    { id: 'kaliakair', name: 'কালিয়াকৈর', nameEn: 'Kaliakair' },
    { id: 'sreepur_gz', name: 'শ্রীপুর', nameEn: 'Sreepur' },
    { id: 'kapasia', name: 'কাপাসিয়া', nameEn: 'Kapasia' },
    { id: 'kaliganj_gz', name: 'কালীগঞ্জ', nameEn: 'Kaliganj' }
  ],

  // NARAYANGANJ
  narayanganj: [
    { id: 'narayanganj_sadar', name: 'নারায়ণগঞ্জ সদর', nameEn: 'Narayanganj Sadar' },
    { id: 'bandar', name: 'বন্দর', nameEn: 'Bandar' },
    { id: 'fatullah', name: 'ফতুল্লা', nameEn: 'Fatullah' },
    { id: 'siddhirganj', name: 'সিদ্ধিরগঞ্জ', nameEn: 'Siddhirganj' },
    { id: 'sonargaon', name: 'সোনারগাঁও', nameEn: 'Sonargaon' },
    { id: 'rupganj', name: 'রূপগঞ্জ', nameEn: 'Rupganj' },
    { id: 'araihazar', name: 'আড়াইহাজার', nameEn: 'Araihazar' }
  ],

  // CHATTOGRAM
  chattogram_city: [
    { id: 'panchlaish', name: 'পাঁচলাইশ', nameEn: 'Panchlaish' },
    { id: 'kotwali_ctg', name: 'কোতোয়ালী', nameEn: 'Kotwali' },
    { id: 'halishahar', name: 'হালিশহর', nameEn: 'Halishahar' },
    { id: 'khulshi', name: 'খুলশী', nameEn: 'Khulshi' },
    { id: 'agrabad', name: 'ডবলমুরিং / আগ্রাবাদ', nameEn: 'Agrabad' },
    { id: 'patenga', name: 'পতেঙ্গা', nameEn: 'Patenga' },
    { id: 'chandgaon', name: 'চাঁদগাঁও', nameEn: 'Chandgaon' },
    { id: 'chittagong_sadar', name: 'চট্টগ্রাম সদর', nameEn: 'Chittagong Sadar' },
    { id: 'hathazari', name: 'হাটহাজারী', nameEn: 'Hathazari' },
    { id: 'sitakunda', name: 'সীতাকুণ্ড', nameEn: 'Sitakunda' },
    { id: 'mirsharai', name: 'মীরসরাই', nameEn: 'Mirsharai' },
    { id: 'raozan', name: 'রাউজান', nameEn: 'Raozan' },
    { id: 'rangunia', name: 'রাঙ্গুনিয়া', nameEn: 'Rangunia' },
    { id: 'patiya', name: 'পটিয়া', nameEn: 'Patiya' },
    { id: 'boalkhali', name: 'বোয়ালখালী', nameEn: 'Boalkhali' },
    { id: 'anwara', name: 'আনোয়ারা', nameEn: 'Anwara' }
  ],

  // CUMILLA
  cumilla: [
    { id: 'cumilla_adarsha', name: 'আদর্শ সদর / কুমিল্লা শহর', nameEn: 'Cumilla Adarsha Sadar' },
    { id: 'cumilla_sadar_south', name: 'সদর দক্ষিণ', nameEn: 'Sadar South' },
    { id: 'daudkandi', name: 'দাউদকান্দি', nameEn: 'Daudkandi' },
    { id: 'chandina', name: 'চান্দিনা', nameEn: 'Chandina' },
    { id: 'debidwar', name: 'দেবিদ্বার', nameEn: 'Debidwar' },
    { id: 'burichang', name: 'বুড়িচং', nameEn: 'Burichang' },
    { id: 'laksham', name: 'লাকসাম', nameEn: 'Laksham' }
  ],

  // SYLHET
  sylhet_city: [
    { id: 'sylhet_sadar', name: 'সিলেট সদর / জিন্দাবাজার', nameEn: 'Sylhet Sadar' },
    { id: 'south_surma', name: 'দক্ষিণ সুরমা', nameEn: 'South Surma' },
    { id: 'beanibazar', name: 'বিয়ানীবাজার', nameEn: 'Beanibazar' },
    { id: 'golapganj', name: 'গোলাপগঞ্জ', nameEn: 'Golapganj' },
    { id: 'balaganj', name: 'বালাগঞ্জ', nameEn: 'Balaganj' },
    { id: 'biswanath', name: 'বিশ্বনাথ', nameEn: 'Biswanath' },
    { id: 'zakiganj', name: 'জকিগঞ্জ', nameEn: 'Zakiganj' }
  ],

  // RAJSHAHI
  rajshahi_city: [
    { id: 'boalia', name: 'বোয়ালিয়া / রাজশাহী সদর', nameEn: 'Boalia' },
    { id: 'rajpara', name: 'রাজপাড়া', nameEn: 'Rajpara' },
    { id: 'motihar', name: 'মতিহার', nameEn: 'Motihar' },
    { id: 'shah_makhdum', name: 'শাহ মখদুম', nameEn: 'Shah Makhdum' },
    { id: 'paba', name: 'পবা', nameEn: 'Paba' },
    { id: 'godagari', name: 'গোদাগাড়ী', nameEn: 'Godagari' },
    { id: 'bagha', name: 'বাঘা', nameEn: 'Bagha' }
  ],

  // BOGURA
  bogura: [
    { id: 'bogura_sadar', name: 'বগুড়া সদর', nameEn: 'Bogura Sadar' },
    { id: 'shajahanpur', name: 'শাজাহানপুর', nameEn: 'Shajahanpur' },
    { id: 'sherpur_bg', name: 'শেরপুর', nameEn: 'Sherpur' },
    { id: 'shibganj_bg', name: 'শিবগঞ্জ', nameEn: 'Shibganj' },
    { id: 'gabtali', name: 'গাবতলী', nameEn: 'Gabtali' },
    { id: 'sonatola', name: 'সোনাতলা', nameEn: 'Sonatola' }
  ],

  // KHULNA
  khulna_city: [
    { id: 'khulna_sadar', name: 'খুলনা সদর', nameEn: 'Khulna Sadar' },
    { id: 'sonadanga', name: 'সোনাডাঙ্গা', nameEn: 'Sonadanga' },
    { id: 'khalishpur', name: 'খালিশপুর', nameEn: 'Khalishpur' },
    { id: 'daulatpur_kh', name: 'দৌলতপুর', nameEn: 'Daulatpur' },
    { id: 'dighalia', name: 'দিঘলিয়া', nameEn: 'Dighalia' },
    { id: 'dumuria', name: 'ডুমুরিয়া', nameEn: 'Dumuria' },
    { id: 'rupsha', name: 'রূপসা', nameEn: 'Rupsha' }
  ],

  // BARISHAL
  barishal_city: [
    { id: 'barishal_sadar', name: 'বরিশাল সদর / কোতোয়ালী', nameEn: 'Barishal Sadar' },
    { id: 'bakerganj', name: 'বাকেরগঞ্জ', nameEn: 'Bakerganj' },
    { id: 'babuganj', name: 'বাবুগঞ্জ', nameEn: 'Babuganj' },
    { id: 'wazirpur', name: 'উজিরপুর', nameEn: 'Wazirpur' },
    { id: 'banaripara', name: 'বানারীপাড়া', nameEn: 'Banaripara' },
    { id: 'gournadi', name: 'গৌরনদী', nameEn: 'Gournadi' }
  ],

  // RANGPUR
  rangpur_city: [
    { id: 'rangpur_sadar', name: 'রংপুর সদর / কোতোয়ালী', nameEn: 'Rangpur Sadar' },
    { id: 'gangachara', name: 'গঙ্গাচড়া', nameEn: 'Gangachara' },
    { id: 'badarganj', name: 'বদরগঞ্জ', nameEn: 'Badarganj' },
    { id: 'mithapukur', name: 'মিঠাপুকুর', nameEn: 'Mithapukur' },
    { id: 'pirgachha', name: 'পীরগাছা', nameEn: 'Pirgachha' }
  ],

  // MYMENSINGH
  mymensingh_city: [
    { id: 'mymensingh_sadar', name: 'ময়মনসিংহ সদর / কোতোয়ালী', nameEn: 'Mymensingh Sadar' },
    { id: 'muktagachha', name: 'মুক্তাগাছা', nameEn: 'Muktagachha' },
    { id: 'fulbaria', name: 'ফুলবাড়ীয়া', nameEn: 'Fulbaria' },
    { id: 'trishal', name: 'ত্রিশাল', nameEn: 'Trishal' },
    { id: 'bhaluka', name: 'ভালুকা', nameEn: 'Bhaluka' },
    { id: 'gafargaon', name: 'গফরগাঁও', nameEn: 'Gafargaon' }
  ]
};

// Generic thana fallback for any other district
export const getGenericThanas = (districtName) => [
  { id: 'sadar', name: `${districtName} সদর`, nameEn: `${districtName} Sadar` },
  { id: 'upazila_1', name: `থানা / পৌরসভা ১`, nameEn: 'Thana 1' },
  { id: 'upazila_2', name: `থানা / উপজেলা ২`, nameEn: 'Thana 2' },
  { id: 'upazila_3', name: `থানা / উপজেলা ৩`, nameEn: 'Thana 3' }
];

export const bangladeshPostOffices = {
  // Mirpur Areas
  mirpur: [
    { id: 'mirpur_1', name: 'মিরপুর-১ (চিড়িয়াখানা রোড)', code: '১২১৬' },
    { id: 'mirpur_2', name: 'মিরপুর-২ (স্টেডিয়াম এলাকা)', code: '১২১৬' },
    { id: 'mirpur_10', name: 'মিরপুর-১০ (গোলচত্বর)', code: '১২১৬' },
    { id: 'mirpur_11', name: 'মিরপুর-১১ / পল্লবী', code: '১২১৬' },
    { id: 'mirpur_12', name: 'মিরপুর-১২ (বাসস্ট্যান্ড)', code: '১২১৬' },
    { id: 'mirpur_14', name: 'মিরপুর-১৪ (ক্যান্টনমেন্ট)', code: '১২০৬' },
    { id: 'kazipara', name: 'কাজীপাড়া ও শেওড়াপাড়া', code: '১২১৬' }
  ],
  dhanmondi: [
    { id: 'dhanmondi_main', name: 'ধানমন্ডি প্রধান ডাকঘর', code: '১২০৯' },
    { id: 'dhanmondi_27', name: 'ধানমন্ডি ২৭ নম্বর / শংকর', code: '১২০৯' },
    { id: 'dhanmondi_32', name: 'ধানমন্ডি ৩২ নম্বর / শুক্রাবাদ', code: '১২০৭' },
    { id: 'zigatola', name: 'ঝিগাতলা / রায়েরবাজার', code: '১২০৯' }
  ],
  gulshan: [
    { id: 'gulshan_1', name: 'গুলশান-১', code: '১২১২' },
    { id: 'gulshan_2', name: 'গুলশান-২ / বারিধারা', code: '১২১২' },
    { id: 'niketan', name: 'নিকেতন আবাসিক এলাকা', code: '১২১২' }
  ],
  uttara: [
    { id: 'uttara_sector_3', name: 'উত্তরা (সেক্টর ১ - ৭)', code: '১২৩০' },
    { id: 'uttara_sector_9', name: 'উত্তরা (সেক্টর ৮ - ১৪)', code: '১২৩০' },
    { id: 'uttara_sector_18', name: 'উত্তরা (সেক্টর ১৫ - ১৮)', code: '১২৩০' },
    { id: 'dakshinkhan', name: 'দক্ষিণখান / উত্তরখান', code: '১২৩০' }
  ],
  banani: [
    { id: 'banani_main', name: 'বনানী বাজার ও রোড ১১', code: '১২১৩' },
    { id: 'chairmanbari', name: 'চেয়ারম্যান বাড়ি / মহাখালী', code: '১২১৩' }
  ],
  mohammadpur: [
    { id: 'mohammadpur_townhall', name: 'মোহাম্মদপুর টাউনহল', code: '১২০৭' },
    { id: 'salimullah_road', name: 'সলিমুল্লাহ রোড / বাবর রোড', code: '১২০৭' },
    { id: 'adabor', name: 'আদাবর ও শ্যামলী', code: '১২০৭' },
    { id: 'bosila', name: 'বসিলা ব্রিজ এলাকা', code: '১২০৭' }
  ],
  bhatara: [
    { id: 'bashundhara_ra', name: 'বসুন্ধরা আবাসিক এলাকা (ব্লক A-P)', code: '১২২৯' },
    { id: 'norda', name: 'নদ্দা ও নতুনবাজার', code: '১২২৯' }
  ],
  savar: [
    { id: 'savar_cant', name: 'সাভার ক্যান্টনমেন্ট', code: '১৩৪০' },
    { id: 'savar_bazar', name: 'সাভার বাজার ও পৌরসভা', code: '১৩৪০' },
    { id: 'epz', name: 'ডিইপিজেড (DEPZ)', code: '১৩৪৯' }
  ]
};

// Generic Post Office fallback
export const getGenericPostOffices = (thanaName) => [
  { id: 'main_po', name: `${thanaName} প্রধান ডাকঘর`, code: '১০০০' },
  { id: 'sub_po_1', name: `${thanaName} বাজার শাখা`, code: '১০০১' },
  { id: 'sub_po_2', name: `${thanaName} আবাসিক এলাকা`, code: '১০০২' }
];

// Helper Selectors
export function getDistrictsForDivision(divisionId) {
  if (!divisionId) return bangladeshDistricts;
  return bangladeshDistricts.filter(d => d.divisionId === divisionId);
}

export function getThanasForDistrict(districtId) {
  if (!districtId) return [];
  if (bangladeshThanas[districtId]) {
    return bangladeshThanas[districtId];
  }
  const districtObj = bangladeshDistricts.find(d => d.id === districtId);
  const name = districtObj ? districtObj.name : 'উপজেলা';
  return getGenericThanas(name);
}

export function getPostOfficesForThana(thanaId, thanaName) {
  if (!thanaId) return [];
  if (bangladeshPostOffices[thanaId]) {
    return bangladeshPostOffices[thanaId];
  }
  return getGenericPostOffices(thanaName || 'থানা');
}
