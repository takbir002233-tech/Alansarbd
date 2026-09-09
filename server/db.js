const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

// Initial database state for AL ANSAR SUPER SHOP
function getInitialData() {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const userPasswordHash = bcrypt.hashSync('user123', 10);

  return {
    users: [
      {
        id: 'usr_admin',
        name: 'Al Ansar Admin',
        email: 'admin@alansar.com',
        phone: '01711000000',
        password_hash: adminPasswordHash,
        address: 'House #14, Road #7, Sector 3, Uttara',
        city: 'Dhaka',
        postal_code: '1230',
        role: 'admin',
        is_blocked: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'usr_demo_customer',
        name: 'Tanvir Ahmed',
        email: 'tanvir.ahmed@gmail.com',
        phone: '01712345678',
        password_hash: userPasswordHash,
        address: 'Flat 4B, Green View Tower, Mirpur-10',
        city: 'Dhaka',
        postal_code: '1216',
        role: 'user',
        is_blocked: false,
        loyalty_card_approved: true,
        loyalty_card_status: 'Approved',
        loyalty_card_number: 'ANSAR-VIP-7861-2026',
        loyalty_points: 250,
        loyalty_tier: 'Royal Gold VIP',
        qard_credit_limit: 10000,
        qard_status: 'Approved',
        created_at: new Date().toISOString()
      },
      {
        id: 'usr_vip_member',
        name: 'তানভীর আহমেদ',
        email: 'vip@alansar.com',
        phone: '01700112233',
        password_hash: userPasswordHash,
        address: 'বাড়ি ১২, রোড ৫, সেক্টর ৩, উত্তরা',
        city: 'ঢাকা',
        postal_code: '1230',
        role: 'user',
        is_blocked: false,
        loyalty_card_approved: true,
        loyalty_card_status: 'Approved',
        loyalty_card_number: 'ANSAR-VIP-7861-2026',
        loyalty_points: 250,
        loyalty_tier: 'Royal Gold VIP',
        qard_credit_limit: 10000,
        qard_status: 'Approved',
        created_at: new Date().toISOString()
      }
    ],
    categories: [
      {
        id: 'cat_grocery',
        name: 'ঘরের বাজার (Grocery & Essentials)',
        slug: 'ghorer-bajar',
        icon: 'ShoppingBasket',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        priority_order: 1,
        item_count: 24,
        subcategories: [
          { id: 'sub_ghee_honey', name: 'খাঁটি গাওয়া ঘি ও সুন্দরবনের মধু', slug: 'ghee-honey' },
          { id: 'sub_mustard_oil', name: 'কাঠের ঘানি ভাঙা সরিষার তেল', slug: 'mustard-oil' },
          { id: 'sub_dates_dryfruits', name: 'মদিনার প্রিমিয়াম খেজুর ও ড্রাই ফ্রুটস', slug: 'dates-dryfruits' }
        ]
      },
      {
        id: 'cat_bakery',
        name: 'বেকারি আইটেম (Bakery & Delights)',
        slug: 'bakery-items',
        icon: 'UtensilsCrossed',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        priority_order: 2,
        item_count: 18,
        subcategories: [
          { id: 'sub_biscuits_cookies', name: 'স্পেশাল বাটার বিস্কুট ও কুকিজ', slug: 'biscuits-cookies' },
          { id: 'sub_cakes_pastry', name: 'হ্যান্ডমেড প্রিমিয়াম কেক ও ডেজার্ট', slug: 'handmade-cakes' }
        ]
      },
      {
        id: 'cat_baby_food',
        name: 'শিশু খাদ্য (Baby & Infant Food)',
        slug: 'baby-food',
        icon: 'Baby',
        image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
        priority_order: 3,
        item_count: 12,
        subcategories: [
          { id: 'sub_cereal_milk', name: 'সেরেল্যাক ও ফর্মুলা দুধ', slug: 'cereal-formula-milk' },
          { id: 'sub_organic_cereal', name: 'অর্গানিক বেবি ওটস ও খিচুড়ি মিক্স', slug: 'organic-baby-oats' }
        ]
      },
      {
        id: 'cat_attar',
        name: 'আতর ও সুগন্ধি (Pure Attar & Oud)',
        slug: 'pure-attar-oud',
        icon: 'Flame',
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=600&q=80',
        priority_order: 4,
        item_count: 20,
        subcategories: [
          { id: 'sub_cambodian_oud', name: 'Pure Cambodian Dehn Al Oud', slug: 'pure-cambodian-oud' },
          { id: 'sub_white_musk', name: 'Imperial White Musk', slug: 'imperial-white-musk' },
          { id: 'sub_royal_amber', name: 'Royal Ambergris & Rose', slug: 'royal-ambergris-rose' }
        ]
      },
      {
        id: 'cat_perfumes',
        name: 'লাক্সারি পারফিউম (Luxury Perfumes)',
        slug: 'french-perfumes',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
        priority_order: 5,
        item_count: 15,
        subcategories: [
          { id: 'sub_men_edp', name: "Men's Luxury EDP", slug: 'mens-luxury-edp' },
          { id: 'sub_women_edp', name: "Women's Floral Perfumes", slug: 'womens-floral-perfumes' }
        ]
      },
      {
        id: 'cat_gifts',
        name: 'গিফট সামগ্রী ও কম্বো (Gifts & Hampers)',
        slug: 'gift-boxes-combos',
        icon: 'Gift',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
        priority_order: 6,
        item_count: 16,
        subcategories: [
          { id: 'sub_wooden_boxes', name: 'Handcrafted Wooden Boxes', slug: 'handcrafted-wooden-boxes' },
          { id: 'sub_eid_sets', name: 'VIP Hampers & Gift Sets', slug: 'vip-hampers-gift-sets' }
        ]
      }
    ],
    products: [
      {
        id: 'prd_cerelac_1',
        title: 'নেসলে সেরেলাক হুইট অ্যান্ড ফ্রুটস বেবি ফুড (৪০০ গ্রাম)',
        slug: 'nestle-cerelac-wheat-fruits-400g',
        category_id: 'cat_baby_food',
        subcategory_id: 'sub_cereal_milk',
        price: 480,
        discount_price: 430,
        stock: 45,
        rating: 5.0,
        review_count: 48,
        is_featured: true,
        is_free_delivery: false,
        priority_order: 1,
        thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
        description: 'শিশুর স্বাভাবিক বৃদ্ধি ও মানসিক বিকাশের জন্য প্রয়োজনীয় আয়রন, ক্যালসিয়াম, জিঙ্ক ও ১২টি ভিটামিন সমৃদ্ধ প্রিমিয়াম পুষ্টিকর খাদ্য।',
        specs: { 'Brand': 'Nestle Cerelac', 'Weight': '৪০০ গ্রাম', 'Age Group': '৬+ মাস বয়স' },
        tags: ['শিশু খাদ্য', 'সেরেলাক', 'Baby Food', 'Cerelac'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_lactogen_1',
        title: 'ল্যাকটোজেন ১ ইনফ্যান্ট ফর্মুলা গুঁড়ো দুধ (৪০০ গ্রাম)',
        slug: 'lactogen-1-infant-formula-400g',
        category_id: 'cat_baby_food',
        subcategory_id: 'sub_cereal_milk',
        price: 890,
        discount_price: 820,
        stock: 35,
        rating: 4.9,
        review_count: 32,
        is_featured: true,
        is_free_delivery: true,
        priority_order: 2,
        thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
        description: 'শিশুর পরিপূর্ণ পুষ্টির জন্য আদর্শ ইনফ্যান্ট ফর্মুলা। সহজে হজমযোগ্য প্রোটিন এবং স্বাস্থ্যকর চর্বি সমৃদ্ধ।',
        specs: { 'Brand': 'Lactogen', 'Weight': '৪০০ গ্রাম টিন', 'Age Group': '০-৬ মাস' },
        tags: ['শিশু খাদ্য', 'দুধ', 'Baby Formula', 'Lactogen'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_baby_oats_1',
        title: 'অর্গানিক বেবি ওটস ও পুষ্টিকর খিচুড়ি মিক্স (৫০০ গ্রাম)',
        slug: 'organic-baby-oats-khichuri-mix-500g',
        category_id: 'cat_baby_food',
        subcategory_id: 'sub_organic_cereal',
        price: 380,
        discount_price: 320,
        stock: 50,
        rating: 5.0,
        review_count: 27,
        is_featured: true,
        is_free_delivery: false,
        priority_order: 3,
        thumbnail: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80'],
        description: 'শতভাগ নির্ভেজাল ঘরোয়া উপায়ে তৈরি প্রিমিয়াম চাল, মুগ ডাল, কাঠবাদাম ও ওটসের সমন্বয়ে শিশুর জন্য পুষ্টিকর ও উপাদেয় খাদ্য।',
        specs: { 'Brand': 'AL ANSAR Organic Baby', 'Weight': '৫০০ গ্রাম', 'Ingredients': 'Rolled Oats, Organic Rice, Lentils, Nuts' },
        tags: ['শিশু খাদ্য', 'খিচুড়ি মিক্স', 'বেবি ওটস', 'Organic'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_ghee_1',
        title: 'আল আনসার প্রিমিয়াম খাঁটি গাওয়া ঘি (১ কেজি কাচের জার)',
        slug: 'al-ansar-pure-gowa-ghee-1kg',
        category_id: 'cat_grocery',
        subcategory_id: 'sub_ghee_honey',
        price: 1800,
        discount_price: 1550,
        stock: 35,
        rating: 5.0,
        review_count: 64,
        is_featured: true,
        is_free_delivery: true,
        priority_order: 1,
        thumbnail: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80'
        ],
        description: '১০০% খাঁটি দেশি গরুর দুধের মাখন জ্বাল দিয়ে তৈরি ঐতিহ্যবাহী দানাদার গাওয়া ঘি। তীব্র সুঘ্রাণ ও সর্বোচ্চ পুষ্টিগুণ সমৃদ্ধ।',
        specs: {
          'Brand': 'AL ANSAR Food & Grocery',
          'Weight': '১০০০ গ্রাম (১ কেজি)',
          'Packaging': 'Food Grade Glass Jar'
        },
        tags: ['ঘরের বাজার', 'গাওয়া ঘি', 'Ghee', 'Pure', 'Free Delivery'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_honey_1',
        title: 'সুন্দরবনের ১০০% প্রাকৃতিক চাকের খলিসা মধু (৫০০ গ্রাম)',
        slug: 'sundarbans-pure-kholisa-honey-500g',
        category_id: 'cat_grocery',
        subcategory_id: 'sub_ghee_honey',
        price: 950,
        discount_price: 790,
        stock: 40,
        rating: 4.9,
        review_count: 52,
        is_featured: true,
        is_free_delivery: false,
        priority_order: 2,
        thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'সুন্দরবনের গভীর জঙ্গল থেকে সংগৃহীত কাঁচা ও সম্পূর্ণ প্রক্রিয়াজাতহীন প্রাকৃতিক খলিসা ফুলের মধু।',
        specs: {
          'Brand': 'AL ANSAR Pure Organic',
          'Net Weight': '৫০০ গ্রাম',
          'Source': 'সুন্দরবন'
        },
        tags: ['ঘরের বাজার', 'মধু', 'Honey', 'Organic'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_oil_1',
        title: 'কাঠের ঘানি ভাঙা ১০০% খাঁটি সরিষার তেল (১ লিটার)',
        slug: 'wood-pressed-pure-mustard-oil-1l',
        category_id: 'cat_grocery',
        subcategory_id: 'sub_mustard_oil',
        price: 360,
        discount_price: 290,
        stock: 60,
        rating: 4.9,
        review_count: 78,
        is_featured: true,
        is_free_delivery: false,
        priority_order: 3,
        thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'বাছাইকৃত দেশি মাঘী সরিষা কাঠের ঘানিতে কোল্ড-প্রেসড উপায়ে ভাঙানো তীব্র ঝাঁঝালো ও স্বাস্থ্যসম্মত সরিষার তেল।',
        specs: {
          'Brand': 'AL ANSAR Mustard Oil',
          'Volume': '১ লিটার',
          'Extraction': 'Cold Pressed Wood Ghani'
        },
        tags: ['ঘরের বাজার', 'সরিষার তেল', 'Mustard Oil'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_dates_1',
        title: 'মদিনার প্রিমিয়াম আজওয়া খেজুর ভিআইপি বক্স (১ কেজি)',
        slug: 'madinah-premium-ajwa-dates-vip-1kg',
        category_id: 'cat_grocery',
        subcategory_id: 'sub_dates_dryfruits',
        price: 1600,
        discount_price: 1350,
        stock: 25,
        rating: 5.0,
        review_count: 43,
        is_featured: true,
        is_free_delivery: true,
        priority_order: 4,
        thumbnail: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'সরাসরি মদিনা মুনাওয়ারা থেকে আমদানিকৃত নরম, কালো ও সুস্বাদু খাঁটি ভিআইপি গ্রেড আজওয়া খেজুর।',
        specs: {
          'Brand': 'AL ANSAR Madinah Collection',
          'Weight': '১ কেজি',
          'Grade': 'Jumbo VIP'
        },
        tags: ['ঘরের বাজার', 'আজওয়া খেজুর', 'Dates', 'Madinah', 'Free Delivery'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_bakery_1',
        title: 'আল আনসার স্পেশাল ড্যানিশ বাটার কুকিজ ও ক্রাফট বিস্কুট বক্স (৫০০ গ্রাম)',
        slug: 'al-ansar-danish-butter-cookies-500g',
        category_id: 'cat_bakery',
        subcategory_id: 'sub_biscuits_cookies',
        price: 650,
        discount_price: 520,
        stock: 30,
        rating: 4.9,
        review_count: 38,
        is_featured: true,
        is_free_delivery: false,
        priority_order: 5,
        thumbnail: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'খাঁটি বাটার ও প্রিমিয়াম উপাদানে বেক করা অত্যন্ত মুচমুচে ও মুখরোচক ড্যানিশ কুকিজ। চা বা কফির সাথে অতুলনীয়।',
        specs: {
          'Brand': 'AL ANSAR Artisan Bakery',
          'Weight': '৫০০ গ্রাম',
          'Flavor': 'Rich Butter & Almond'
        },
        tags: ['বেকারি', 'বিস্কুট', 'Cookies', 'Bakery'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_bakery_2',
        title: 'প্রিমিয়াম চকোলেট ফাজ ব্রাউনি ও ক্রাফট কেক বক্স (৬ পিস)',
        slug: 'premium-chocolate-fudge-brownie-box-6pcs',
        category_id: 'cat_bakery',
        subcategory_id: 'sub_cakes_pastry',
        price: 850,
        discount_price: 690,
        stock: 20,
        rating: 5.0,
        review_count: 29,
        is_featured: true,
        is_free_delivery: false,
        priority_order: 6,
        thumbnail: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'বেলজিয়ান ডার্ক চকোলেট ও ওয়ালনাট দিয়ে বেক করা লোভনীয় চকোলেট ফাজ ব্রাউনি। উপহার ও পারিবারিক আড্ডায় সেরা।',
        specs: {
          'Brand': 'AL ANSAR Artisan Bakery',
          'Quantity': '৬ পিস বক্স',
          'Type': 'Belgian Dark Chocolate'
        },
        tags: ['বেকারি', 'ব্রাউনি', 'কেক', 'Bakery', 'Cake'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_attar_1',
        title: 'Pure Dehn Al Oud Cambodi Concentrated Premium Attar (12ml)',
        slug: 'pure-dehn-al-oud-cambodi-12ml',
        category_id: 'cat_attar',
        subcategory_id: 'sub_cambodian_oud',
        price: 2500,
        discount_price: 1950,
        stock: 30,
        rating: 5.0,
        review_count: 62,
        is_featured: true,
        is_free_delivery: false,
        priority_order: 7,
        thumbnail: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80'
        ],
        description: '১০০% খাঁটি ও অ্যালকোহলমুক্ত প্রাকৃতিক কম্বোডিয়ান আগরউড থেকে পাতিত অভিজাত দেহন আল উদ।',
        specs: {
          'Form': '100% Non-Alcoholic Concentrated Oil',
          'Volume': '12ml (1 Tola)',
          'Origin': 'Cambodia'
        },
        tags: ['Attar', 'Oud', 'Alcohol Free', 'আতর'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_attar_2',
        title: 'Imperial Musk & White Ambergris Premium Attar (6ml)',
        slug: 'imperial-musk-white-ambergris-6ml',
        category_id: 'cat_attar',
        subcategory_id: 'sub_white_musk',
        price: 1200,
        discount_price: 950,
        stock: 45,
        rating: 4.8,
        review_count: 41,
        is_featured: false,
        is_free_delivery: false,
        priority_order: 8,
        thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'রেশমি, স্নিগ্ধ ও পবিত্র সাদা কস্তুরি আতর। মৃদু অ্যাম্বার ও ফ্লোরাল নোটসের অসাধারণ সমাহার।',
        specs: {
          'Form': 'Pure Concentrated Attar Oil',
          'Volume': '6ml (1/2 Tola)'
        },
        tags: ['Attar', 'White Musk', 'আতর'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_perfume_1',
        title: 'AL ANSAR Royal Crown Oud Eau de Parfum (100ml)',
        slug: 'al-ansar-royal-crown-oud-100ml',
        category_id: 'cat_perfumes',
        subcategory_id: 'sub_men_edp',
        price: 4500,
        discount_price: 3600,
        stock: 24,
        rating: 5.0,
        review_count: 48,
        is_featured: true,
        is_free_delivery: true,
        priority_order: 9,
        thumbnail: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'একটি রাজকীয় ফ্রেঞ্চ পারফিউম যার সূচনা বার্গামট ও কম্বোডিয়ান আগরউড দিয়ে, যা পরিণত হয় স্নিগ্ধ অ্যাম্বার ও ভ্যানিলার মুগ্ধতায়।',
        specs: {
          'Brand': 'AL ANSAR Luxury Collection',
          'Type': 'Eau de Parfum (EDP)',
          'Volume': '100ml / 3.4 fl oz',
          'Longevity': '14 - 18 Hours'
        },
        tags: ['Perfume', 'Oud', 'Royal', 'Luxury', 'Free Delivery'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_perfume_2',
        title: 'Velvet Rose & White Amber French Fragrance (80ml)',
        slug: 'velvet-rose-white-amber-80ml',
        category_id: 'cat_perfumes',
        subcategory_id: 'sub_women_edp',
        price: 3800,
        discount_price: 2950,
        stock: 18,
        rating: 4.9,
        review_count: 36,
        is_featured: true,
        is_free_delivery: false,
        priority_order: 10,
        thumbnail: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'দামেস্ক গোলাপ, প্রস্ফুটিত জুঁই এবং ঝিলমিলে সাদা অ্যাম্বারের এক রোমান্টিক সুবাস।',
        specs: {
          'Brand': 'AL ANSAR Signature',
          'Type': 'Eau de Parfum',
          'Volume': '80ml'
        },
        tags: ['Perfume', 'Floral', 'Rose', 'Amber', 'Women'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_gift_1',
        title: 'AL ANSAR Royal Wooden Gift Box (3x 12ml Attar + Tasbih + Velvet Box)',
        slug: 'al-ansar-royal-wooden-gift-box-trio',
        category_id: 'cat_gifts',
        subcategory_id: 'sub_wooden_boxes',
        price: 4200,
        discount_price: 3450,
        stock: 15,
        rating: 5.0,
        review_count: 29,
        is_featured: true,
        is_free_delivery: true,
        priority_order: 11,
        thumbnail: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'রাজকীয় ভেলভেটে মোড়ানো অভিজাত মেহগনি কাঠের তৈরি গিফট বক্স। উপহারের জন্য ৩টি প্রিমিয়াম ১২মিলি আতর ও তাসবীহ অন্তর্ভুক্ত।',
        specs: {
          'Box Material': 'Polished Mahogany Wood with Brass Latch',
          'Includes': '3x 12ml Crystal Attar Bottles + Premium Tasbih + Gift Box'
        },
        tags: ['Gift Box', 'Hamper', 'Eid', 'Free Delivery', 'উপহার'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_gift_2',
        title: "Gentleman's Signature VIP Gift Hamper (Perfume + Watch + Leather Wallet)",
        slug: 'gentlemans-signature-vip-gift-hamper',
        category_id: 'cat_gifts',
        subcategory_id: 'sub_eid_sets',
        price: 5800,
        discount_price: 4800,
        stock: 10,
        rating: 4.9,
        review_count: 34,
        is_featured: true,
        is_free_delivery: true,
        priority_order: 12,
        thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'পুরুষদের জন্য বিশেষ ভিআইপি গিফট কম্বো। ১টি ৫০মিলি রয়্যাল উদ পারফিউম + এলিগ্যান্ট ঘড়ি + ১০০% খাঁটি চামড়ার ওয়ালেট।',
        specs: {
          'Hamper Contents': '50ml Perfume + Quartz Watch + Cowhide Leather Wallet + Gift Card'
        },
        tags: ['Hamper', 'Men', 'Combo', 'Free Delivery', 'উপহার'],
        created_at: new Date().toISOString()
      }
    ],
    reviews: [
      {
        id: 'rev_1',
        user_name: 'তানভীর আহমেদ',
        user_id: 'usr_demo_customer',
        rating: 5,
        comment: 'মাশাল্লাহ! আতর এবং সরিষার তেলের কোয়ালিটি অসাধারণ। ডেলিভারিও মাত্র ২৪ ঘণ্টার মধ্যে পেয়েছি।',
        product_title: 'আল আনসার খাঁটি সরিষার তেল ও কম্বোডিয়ান উদ',
        is_verified: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'rev_2',
        user_name: 'রফিকুল ইসলাম',
        user_id: null,
        rating: 5,
        comment: 'ঘরের বাজারের গাওয়া ঘি এবং সুন্দরবনের মধু একদম খাঁটি। ১০% করযে হাসানা সুবিধাও পেয়েছি। জাযাকাল্লাহু খাইরান।',
        product_title: 'আল আনসার প্রিমিয়াম খাঁটি গাওয়া ঘি ও মধু',
        is_verified: true,
        created_at: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 'rev_3',
        user_name: 'নুসরাত জাহান',
        user_id: null,
        rating: 5,
        comment: 'গিফট বক্সটা সত্যি অনেক আকর্ষণীয়। পারফিউমের সুবাস সারাদিন স্থায়ী হয়। প্যাকেজিং অসাধারণ ও রাজকীয়!',
        product_title: 'AL ANSAR Royal Wooden Gift Box',
        is_verified: true,
        created_at: new Date(Date.now() - 86400000 * 6).toISOString()
      },
      {
        id: 'rev_4',
        user_name: 'মাহমুদুল হাসান',
        user_id: null,
        rating: 5,
        comment: 'বেকারির ড্যানিশ কুকিজ ও মদিনার আজওয়া খেজুর অত্যন্ত ফ্রেশ ছিল। আল আনসার সুপার শপের সামগ্রিক সার্ভিস দারুণ।',
        product_title: 'ড্যানিশ বাটার কুকিজ ও মদিনার আজওয়া খেজুর',
        is_verified: true,
        created_at: new Date(Date.now() - 86400000 * 8).toISOString()
      },
      {
        id: 'rev_5',
        user_name: 'আব্দুর রহমান',
        user_id: null,
        rating: 5,
        comment: 'খাঁটি আতর ও নিত্যপ্রয়োজনীয় অর্গানিক পণ্যের জন্য আল আনসার সুপার শপ বিশ্বস্ত প্রতিষ্ঠান। স্টিডফাস্ট কুরিয়ারে খুব দ্রুত ডেলিভারি পেয়েছি।',
        product_title: 'আল আনসার সুপার শপ সার্ভিস ও প্রোডাক্ট',
        is_verified: true,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ],
    vouchers: [
      {
        id: 'vch_1',
        code: 'ANSAR10',
        discount_type: 'percent',
        discount_value: 10,
        min_spend: 1000,
        is_active: true,
        description: '10% instant discount on all orders over ৳1,000'
      },
      {
        id: 'vch_2',
        code: 'EIDGIFT',
        discount_type: 'fixed',
        discount_value: 300,
        min_spend: 2500,
        is_active: true,
        description: '৳300 flat discount on luxury gift hampers above ৳2,500'
      }
    ],
    orders: [],
    chat_conversations: [],
    qard_applications: [],
    account_appeals: [],
    site_settings: {
      store_name: 'AL ANSAR SUPER SHOP',
      store_name_bn: 'আল আনসার সুপার শপ',
      store_tagline: 'ঘরের বাজার, প্রিমিয়াম বেকারি, খাঁটি আতর, পারফিউম ও রাজকীয় উপহার সামগ্রী বাংলাদেশ',
      store_phone: '+880 1711-223344',
      store_email: 'info@alansarbd.com',
      store_address: 'আল আনসার প্লাজা, লেভেল ৪, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০',
      showroom_address: 'আল আনসার ফ্ল্যাগশিপ শোরুম, লেভেল ৪, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০',
      whatsapp_number: '+880 1711-223344',
      logo_url: '/logo.jpg',
      bkash_number: '01711-223344 (ব্যক্তিগত / Send Money)',
      nagad_number: '01811-223344 (ব্যক্তিগত / Send Money)',
      rocket_number: '01911-223344 (ব্যক্তিগত / Send Money)',
      dhaka_delivery_fee: 60,
      outside_dhaka_delivery_fee: 120,
      free_delivery_threshold: 2000,
      
      // Top Dynamic Marquee Ticker
      marquee_text: '✨ আসসালামু আলাইকুম! আল আনসার সুপার শপ-এ আপনাকে স্বাগতম • ঘরের বাজার, বেকারি, খাঁটি আতর ও উপহার সামগ্রী • ভাউচার কোড ANSAR10 ব্যবহারে পান ১০% তাৎক্ষণিক ছাড় • ২০০০ টাকার বেশি অর্ডারে ফ্রি হোম ডেলিভারি • বিনা সুদে করযে হাসানা (১০% তাৎক্ষণিক ধার) সুবিধা উপভোগ করুন ✨',
      marquee_enabled: true,

      // Invoice Hadith & Slogans
      invoice_hadith_slogans: [
        '“সৎ ও আমানতদার ব্যবসায়ী কিয়ামতের দিন নবী, সিদ্দিক ও শহীদগণের সাথে থাকবে।” — (তিরমিযী)',
        '“হে মুমিনগণ! তোমরা পারস্পরিক সন্তুষ্টির ভিত্তিতে ব্যবসা-বাণিজ্য করো।” — (সূরা আন-নিসা: ২৯)',
        'আল আনসার সুপার শপ — বিশুদ্ধ পণ্য, সেবা ও বিশ্বস্ততার মেলবন্ধন।'
      ],

      // Qard-e-Hasana Full CMS
      qard_hasana_enabled: true,
      qard_hasana_percentage: 10,
      qard_hero_badge: 'আল আনসার করযে হাসানা স্কিম',
      qard_hero_title: 'সুদমুক্ত ‘করযে হাসানা’ ঋণ সুবিধা ও ১০% তাৎক্ষণিক বাকি সেবা',
      qard_hero_subtitle: 'ইসলামী শরীয়াহ অনুযায়ী পারস্পরিক সহযোগিতার উদ্দেশ্যে ‘আল আনসার’ নিয়ে এসেছে ১০০% সুদমুক্ত করযে হাসানা সুবিধা। আপনি কোনো প্রকার অতিরিক্ত ফি, প্রসেসিং চার্জ বা সুদ ছাড়াই পণ্য ক্রয় করে পরবর্তীতে সুবিধা অনুযায়ী মূল্য পরিশোধ করতে পারবেন।',
      qard_hadith_quote: '“যে ব্যক্তি কোনো মুমিনের দুনিয়াবী বিপদ দূর করে দেবে, আল্লাহ কিয়ামতের দিন তার বিপদসমূহ দূর করে দেবেন।” — (সহীহ মুসলিম: ২৬৯৯)',
      qard_pillar_1_title: '১০০% সুদমুক্ত (Zero Interest)',
      qard_pillar_1_desc: 'কোনো প্রকার লুকানো চার্জ, জরিমানা বা সুদ নেই। আপনি যতটুকু ধার নিবেন, ঠিক ততটুকুই পরিশোধ করবেন।',
      qard_pillar_2_title: 'চেকআউটে ১০% তাৎক্ষণিক বাকি',
      qard_pillar_2_desc: 'যেকোনো অর্ডারের সময় আপনি ৯০% পেমেন্ট করে বাকি ১০% টাকা করযে হাসানা হিসেবে ধার রাখতে পারবেন।',
      qard_pillar_3_title: 'সহজ কিস্তি ও আমানতদারিতা',
      qard_pillar_3_desc: 'আপনার সুবিধা অনুযায়ী নির্ধারিত মেয়াদে ঋণ পরিশোধের সুযোগ। ঈমানী আমানত হিসেবে যথাসময়ে ঋণ পরিশোধ করুন।',
      qard_terms_title: 'করযে হাসানার শর্তাবলী',
      qard_hasana_terms: '১. করযে হাসানা হলো সম্পূর্ণ সুদমুক্ত এবং কোনো প্রকার প্রসেসিং বা হিডেন চার্জ বিহীন ইসলামী ঋণ সুবিধা।\n২. ক্রেতা অর্ডারের সময় ৯০% পেমেন্ট করবেন এবং বাকি ১০% টাকা নির্ধারিত মেয়াদের মধ্যে কোনো সুদ ছাড়াই পরিশোধ করবেন।\n৩. এই সুবিধা গ্রহণের জন্য জাতীয় পরিচয়পত্র (NID) নম্বর ও বিস্তারিত তথ্য প্রদান করতে হবে।\n৪. অঙ্গীকার অনুযায়ী যথাসময়ে ঋণ পরিশোধ করা ঈমানী দায়িত্ব ও ইসলামী আমানতদারিতার অন্তর্ভুক্ত।',
      qard_special_notice: 'আবেদন অনুমোদিত হলে আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে ক্রেডিট লিমিট যুক্ত হবে এবং যেকোনো অর্ডারে ১-ক্লিকে ব্যবহার করা যাবে।',

      // Loyalty Card / Privilege Club Full CMS
      loyalty_card_enabled: true,
      loyalty_hero_badge: 'AL ANSAR PRIVILEGE CLUB',
      loyalty_hero_title: 'আল আনসার ভিআইপি মেম্বারশিপ ও ডিজিটাল লয়ালটি কার্ড',
      loyalty_hero_subtitle: 'আল আনসার সুপার শপের সম্মানিত নিয়মিত গ্রাহকদের জন্য বিশেষ সম্মাননা। প্রতি কেনাকাটায় ক্যাশব্যাক, রিওয়ার্ড পয়েন্ট ও বিশেষ ভিআইপি ডিসকাউন্ট সুবিধা।',
      loyalty_hadith_quote: 'লাইফটাইম ক্যাশ পয়েন্ট • ইউনিক ডিজিটাল বারকোড • বিশেষ মেম্বারশিপ ডিসকাউন্ট',
      loyalty_pillar_1_title: 'লাইফটাইম রিওয়ার্ড পয়েন্ট',
      loyalty_pillar_1_desc: 'প্রতি ১০০ টাকা কেনাকাটায় ক্যাশ পয়েন্ট সংগ্রহ করুন। পরবর্তী যেকোনো অর্ডারে পয়েন্ট রিডিম করে সরাসরি মূল্যছাড় পান।',
      loyalty_pillar_2_title: 'স্পেশাল মেম্বারশিপ ছাড়',
      loyalty_pillar_2_desc: 'প্রিমিয়াম খাঁটি আতর, ফ্রেঞ্চ পারফিউম ও উপহার সামগ্রীতে অতিরিক্ত ৫% থেকে ১৫% পর্যন্ত বিশেষ ভিআইপি মূল্যছাড়।',
      loyalty_pillar_3_title: 'ফ্রি ডেলিভারি ও অগ্রাধিকার',
      loyalty_pillar_3_desc: 'নির্ধারিত অর্ডারে সারা দেশে ফ্রি হোম ডেলিভারি এবং যেকোনো সহযোগিতায় ২৪/৭ ডেডিকেটেড ভিআইপি হেল্পলাইন সাপোর্ট।',
      loyalty_terms_title: 'কার্ডের শর্তাবলী ও নিয়ম',
      loyalty_terms_desc: '১. কার্ডটি আবেদনকারীর নিজস্ব নামে সংরক্ষিত ও হস্তান্তরঅযোগ্য।\n২. প্রতিটি সফল ডেলিভারির পর পয়েন্ট স্বয়ংক্রিয় যোগ হবে।\n৩. চেকআউটে কার্ডের বারকোড স্ক্যান বা নম্বর ব্যবহারযোগ্য।',
      loyalty_button_bn: 'লয়ালটি কার্ডের জন্য আবেদন করুন',
      loyalty_button_en: 'Apply for Loyalty Card',

      // Terms and Conditions Full CMS
      terms_hero_badge: 'অফিসিয়াল পলিসি ও নীতিমালা',
      terms_hero_title: 'শর্তাবলী, ডেলিভারি ও শরিয়াহ নীতিমালা',
      terms_hero_subtitle: 'আল আনসার সুপার শপ (AL ANSAR SUPER SHOP) বিশুদ্ধ পণ্য ও বিশ্বস্ততার সাথে ব্যবসা পরিচালনায় অঙ্গীকারবদ্ধ। ক্রেতা ও গ্রাহকদের সর্বোচ্চ সন্তুষ্টি ও অধিকার সুরক্ষায় আমাদের সুস্পষ্ট নীতিমালা নিচে বর্ণিত হলো।',
      terms_main_heading: 'সাধারণ শর্তাবলী ও বিক্রয় নীতিমালা',
      terms_and_conditions: '১. আল আনসার ১০০% খাঁটি পণ্য, অর্গানিক ঘরের বাজার, বেকারি ও অ্যালকোহলমুক্ত আতর সরবরাহে অঙ্গীকারবদ্ধ।\n২. ডেলিভারি গ্রহণের সময় পণ্য যাচাই করে গ্রহণ করুন। কোনো ত্রুটি থাকলে ৭ দিনের মধ্যে পরিবর্তন বা রিপ্লেসমেন্ট করা হবে।\n৩. ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। ২০০০ টাকার উপরে অর্ডারে ডেলিভারি ফ্রি।\n৪. করযে হাসানা সুবিধা গ্রহণের ক্ষেত্রে সঠিক তথ্য ও এনআইডি প্রদান বাধ্যতামূলক।',
      terms_pillar_1_title: '১. পণ্যের বিশুদ্ধতা ও গুণমান নিশ্চয়তা',
      terms_pillar_1_desc: 'আমাদের সকল পণ্য ১০০% খাঁটি, ভেজালমুক্ত এবং সর্বোচ্চ স্বাস্থ্যসম্মত মান বজায় রেখে প্রস্তুত ও সংগ্রহ করা হয়।',
      terms_pillar_2_title: '২. দ্রুত ডেলিভারি ও কুরিয়ার ট্র্যাকিং',
      terms_pillar_2_desc: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৪ দিনের মধ্যে স্টিডফাস্ট বা রেডএক্স কুরিয়ারের মাধ্যমে ডেলিভারি সম্পন্ন হয়। প্রতিটি অর্ডারে লাইভ কুরিয়ার ট্র্যাকিং লিংক প্রদান করা হয়।',
      terms_pillar_3_title: '৩. ৭ দিনের সহজ রিপ্লেসমেন্ট সুবিধা',
      terms_pillar_3_desc: 'পার্সেল খোলার সময় কোনো পণ্যে ত্রুটি পরিলক্ষিত হলে সাথে সাথে আমাদের হেল্পলাইনে কল দিন বা ইনভয়েস সহ জানালে আমরা ৭ দিনের মধ্যে ফ্রি রিপ্লেসমেন্ট প্রদান করি।',
      terms_pillar_4_title: '৪. সুদমুক্ত করযে হাসানা নীতিমালা',
      terms_pillar_4_desc: 'করযে হাসানা সুবিধার অধীনে কোনো অতিরিক্ত সুদ বা ফি প্রযোজ্য নয়। ক্রেতাকে আমানতদারিতার সাথে নির্ধারিত সময়ে বকেয়া টাকা পরিশোধের অঙ্গীকার করতে হবে।',

      // Hero Section CMS
      hero_badge: 'আল আনসার সুপার শপ • ঘরের বাজার, বেকারি, সুগন্ধি ও উপহার কালেকশন',
      hero_title: 'খাঁটি পণ্য ও আভিজাত্যের বিশ্বস্ত সুপার শপ',
      hero_subtitle: 'ঘরের সেরা বাজার, সুস্বাদু বেকারি আইটেম, অ্যালকোহলমুক্ত খাঁটি আতর ও প্রিয়জনের জন্য রাজকীয় গিফট বক্স। সারাদেশে দ্রুততম হোম ডেলিভারি।',
      hero_metric_1_val: '১০০% খাঁটি',
      hero_metric_1_label: 'অর্গানিক ও বিশুদ্ধ',
      hero_metric_2_val: '২৪-৪৮ ঘণ্টা',
      hero_metric_2_label: 'দ্রুততম হোম ডেলিভারি',
      hero_metric_3_val: 'স্টিভফাস্ট/রেডএক্স',
      hero_metric_3_label: 'লাইভ কুরিয়ার ট্র্যাক',

      // Compact Photo Hero Slider Banners CMS
      hero_banners: [
        {
          id: 'banner_1',
          title: 'ঘরের নিত্যপ্রয়োজনীয় খাঁটি বাজার ও অর্গানিক পণ্য',
          badge: '🛒 ১০০% খাঁটি পণ্য',
          image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
          link: 'cat_grocery',
          active: true
        },
        {
          id: 'banner_2',
          title: 'বিনা সুদে কেনাকাটা করুন ১০% তাৎক্ষণিক করযে হাসানার সুবিধায়',
          badge: '🤝 করযে হাসানা (১০% ধার)',
          image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1400&q=80',
          link: 'qard-hasana',
          active: true
        },
        {
          id: 'banner_3',
          title: 'দৈনন্দিন ফ্রেশ বেকারি আইটেম ও স্পেশাল কুকিজ কালেকশন',
          badge: '🥐 তাজা বেকারি',
          image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=80',
          link: 'cat_bakery',
          active: true
        },
        {
          id: 'banner_4',
          title: '১০০% অ্যালকোহলমুক্ত খাঁটি আতর, উদ ও লাক্সারি পারফিউম',
          badge: '✨ খাঁটি সুবাস',
          image_url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1400&q=80',
          link: 'cat_attar',
          active: true
        },
        {
          id: 'banner_5',
          title: 'সারাদেশে দ্রুততম হোম ডেলিভারি • ২০০০+ অর্ডারে ফ্রি ডেলিভারি',
          badge: '🚚 ফ্রি ডেলিভারি',
          image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1400&q=80',
          link: 'catalog',
          active: true
        }
      ],

      // Deals Section CMS
      deals_badge: 'সীমিত সময়ের বিশেষ অফার',
      deals_title: '⚡ বিশেষ ডিসকাউন্ট ডিল',
      deals_subtitle: 'ভাউচার কোড ব্যবহার করে পান ২৫% পর্যন্ত বিশেষ ছাড়',

      // Guarantee Section CMS
      guarantee_badge: 'আল আনসার নিশ্চয়তা',
      guarantee_title: 'কেন ২০,০০০+ গ্রাহক আল আনসার পছন্দ করেন?',
      guarantee_subtitle: 'আমরা বিশুদ্ধতার সাথে কখনো আপস করি না। খাঁটি সরিষার তেল ও গাওয়া ঘি থেকে শুরু করে রাজকীয় আতর, বিকাশ/নগদ পেমেন্ট এবং বিনা সুদে করযে হাসানা সুবিধা।',
      guarantee_point_1: '১০০% খাঁটি ঘরের বাজার ও অ্যালকোহলমুক্ত সুগন্ধি',
      guarantee_point_2: 'স্টিভফাস্ট ও রেডএক্স লাইভ কুরিয়ার ট্র্যাকিং লিংক',
      guarantee_point_3: 'ভাউচার কোডে ইনস্ট্যান্ট ডিসকাউন্ট ও পয়েন্ট রিওয়ার্ড',
      guarantee_point_4: 'আকর্ষণীয় উপহার সামগ্রী ও প্রিমিয়াম প্যাকেজিং',

      // 4 Trust Badges CMS
      trust_1_title: '১০০% খাঁটি ও বিশুদ্ধ',
      trust_1_desc: 'অর্গানিক বাজার ও খাঁটি সুগন্ধি',
      trust_2_title: 'সুস্বাদু বেকারি ও ফুড',
      trust_2_desc: 'হাইজেনিক ও প্রিমিয়াম উপাদান',
      trust_3_title: 'দ্রুত কুরিয়ার ডেলিভারি',
      trust_3_desc: 'স্টিভফাস্ট / রেডএক্স লাইভ ট্র্যাকিং',
      trust_4_title: '২৪/৭ গ্রাহক সেবা',
      trust_4_desc: 'লাইভ এআই ও কাস্টমার সাপোর্ট',

      // Footer CMS
      footer_about: 'বাংলাদেশে খাঁটি ঘরের বাজার, প্রিমিয়াম বেকারি সামগ্রী, অ্যালকোহলমুক্ত আতর এবং রাজকীয় উপহার সামগ্রীর বিশ্বস্ত প্রতিষ্ঠান।',
      footer_copyright: '© ২০২৬ AL ANSAR SUPER SHOP (আল আনসার সুপার শপ) বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।',
      footer_tagline: 'বিশুদ্ধ খাদ্য • আভিজাত্য সুবাস • সুদমুক্ত সেবা'
    }
  };
}

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        const initial = getInitialData();
        this.data.site_settings = { ...initial.site_settings, ...this.data.site_settings };
        if (!this.data.vouchers) this.data.vouchers = initial.vouchers;
        if (!this.data.reviews) this.data.reviews = initial.reviews;
        if (!this.data.categories || this.data.categories.length === 0) this.data.categories = initial.categories;
        if (!this.data.products || this.data.products.length === 0) this.data.products = initial.products;
        if (!this.data.users || this.data.users.length === 0) this.data.users = initial.users;
        
        // Ensure VIP account exists
        if (!this.data.users.find(u => u.phone === '01700112233' || u.id === 'usr_vip_member')) {
          const vipUser = initial.users.find(u => u.id === 'usr_vip_member');
          if (vipUser) this.data.users.push(vipUser);
        }
        // Ensure demo customer has approved card
        const demoCust = this.data.users.find(u => u.id === 'usr_demo_customer' || u.phone === '01712345678');
        if (demoCust) {
          demoCust.loyalty_card_approved = true;
          demoCust.loyalty_card_status = 'Approved';
          demoCust.loyalty_card_number = 'ANSAR-VIP-7861-2026';
          demoCust.loyalty_points = 250;
          demoCust.loyalty_tier = 'Royal Gold VIP';
        }
        this.save();
      } else {
        this.data = getInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, resetting to initial seed:', err);
      this.data = getInitialData();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Users
  getUsers() { return this.data.users; }
  getUserById(id) { return this.data.users.find(u => u.id === id); }
  getUserByEmail(email) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  getUserByPhone(phone) { return this.data.users.find(u => u.phone === phone); }
  
  createUser(userData) {
    const cardNumberSuffix = Math.floor(1000 + Math.random() * 9000);
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      is_blocked: false,
      role: 'user',
      loyalty_points: 100,
      loyalty_tier: 'Gold VIP',
      loyalty_card_number: `ANSAR-VIP-${cardNumberSuffix}-2026`,
      qard_credit_limit: 5000,
      qard_available_credit: 5000,
      qard_status: 'Eligible',
      created_at: new Date().toISOString(),
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Products
  getProducts() { 
    return [...this.data.products].sort((a, b) => (a.priority_order || 999) - (b.priority_order || 999)); 
  }
  getProductById(id) { return this.data.products.find(p => p.id === id); }
  getProductBySlug(slug) { return this.data.products.find(p => p.slug === slug); }
  
  createProduct(productData) {
    const id = 'prd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const slug = (productData.title || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substr(2, 4);
    
    const newProduct = {
      id,
      slug,
      rating: 5.0,
      review_count: 1,
      is_featured: productData.is_featured || false,
      is_free_delivery: productData.is_free_delivery || false,
      subcategory_id: productData.subcategory_id || null,
      priority_order: productData.priority_order || (this.data.products.length + 1),
      created_at: new Date().toISOString(),
      ...productData
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  reorderProduct(id, direction) {
    const sorted = this.getProducts();
    const idx = sorted.findIndex(p => p.id === id);
    if (idx === -1) return null;

    if (direction === 'up' && idx > 0) {
      const prev = sorted[idx - 1];
      const curr = sorted[idx];
      const tempOrder = prev.priority_order || idx;
      prev.priority_order = curr.priority_order || (idx + 1);
      curr.priority_order = tempOrder;
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const next = sorted[idx + 1];
      const curr = sorted[idx];
      const tempOrder = next.priority_order || (idx + 2);
      next.priority_order = curr.priority_order || (idx + 1);
      curr.priority_order = tempOrder;
    }
    this.save();
    return this.getProducts();
  }

  // Categories & Sub-Categories CRUD
  getCategories() { 
    return [...this.data.categories].sort((a, b) => (a.priority_order || 999) - (b.priority_order || 999)); 
  }

  getCategoryById(id) {
    return this.data.categories.find(c => c.id === id || c.slug === id);
  }

  createCategory(catData) {
    const id = 'cat_' + Date.now();
    const slug = (catData.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      id,
      slug,
      priority_order: catData.priority_order || (this.data.categories.length + 1),
      item_count: 0,
      subcategories: [],
      ...catData
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id, updates) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  deleteCategory(id) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  addSubcategory(categoryId, subcategoryData) {
    const category = this.getCategoryById(categoryId);
    if (!category) return null;
    if (!category.subcategories) category.subcategories = [];
    
    const id = 'sub_' + Date.now();
    const slug = (subcategoryData.name || 'subcat').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newSub = {
      id,
      slug,
      ...subcategoryData
    };
    category.subcategories.push(newSub);
    this.save();
    return newSub;
  }

  deleteSubcategory(categoryId, subcategoryId) {
    const category = this.getCategoryById(categoryId);
    if (!category || !category.subcategories) return false;
    const idx = category.subcategories.findIndex(s => s.id === subcategoryId);
    if (idx === -1) return false;
    category.subcategories.splice(idx, 1);
    this.save();
    return true;
  }

  // Reviews CRUD
  getReviews() {
    return (this.data.reviews || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createReview(reviewData) {
    if (!this.data.reviews) this.data.reviews = [];
    const newReview = {
      id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      rating: 5,
      is_verified: true,
      created_at: new Date().toISOString(),
      ...reviewData
    };
    this.data.reviews.unshift(newReview);
    this.save();
    return newReview;
  }

  deleteReview(id) {
    if (!this.data.reviews) return false;
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.reviews.splice(idx, 1);
    this.save();
    return true;
  }

  // Orders
  getOrders() { return this.data.orders; }
  getOrderById(id) { 
    return this.data.orders.find(o => o.id === id || o.order_code === id || o.order_number === id); 
  }
  getOrdersByUserId(userId) { return this.data.orders.filter(o => o.user_id === userId); }
  
  createOrder(orderData) {
    const orderNumber = orderData.order_code || orderData.order_number || ('ANSAR-' + Math.floor(100000 + Math.random() * 900000));
    const trackingCode = 'STF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const trackingUrl = `https://steadfast.com.bd/t/${trackingCode}`;
    
    const newOrder = {
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      order_code: orderNumber,
      order_number: orderNumber,
      tracking_code: trackingCode,
      tracking_url: trackingUrl,
      courier_status: 'Processing at Uttara Hub',
      created_at: new Date().toISOString(),
      status: 'Pending',
      ...orderData
    };
    this.data.orders.unshift(newOrder);

    // Reduce stock
    if (Array.isArray(orderData.items)) {
      orderData.items.forEach(item => {
        const prdId = item.product_id || item.id;
        const prd = this.getProductById(prdId);
        if (prd) {
          prd.stock = Math.max(0, prd.stock - (item.quantity || 1));
        }
      });
    }

    // Award loyalty points if user exists
    if (orderData.user_id) {
      const user = this.getUserById(orderData.user_id);
      if (user) {
        const pointsEarned = Math.floor((orderData.total_amount || 0) / 100);
        user.loyalty_points = (user.loyalty_points || 0) + pointsEarned;
      }
    }

    this.save();
    return newOrder;
  }

  updateOrderStatus(id, status, updates = {}) {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      status,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.orders[idx];
  }

  // Vouchers
  getVouchers() { return this.data.vouchers || []; }
  getVoucherByCode(code) {
    return (this.data.vouchers || []).find(v => v.code.toUpperCase() === code.toUpperCase() && v.is_active);
  }
  createVoucher(voucherData) {
    const id = 'vch_' + Date.now();
    const newVoucher = { id, is_active: true, ...voucherData };
    this.data.vouchers.push(newVoucher);
    this.save();
    return newVoucher;
  }
  updateVoucher(id, updates) {
    const idx = this.data.vouchers.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.vouchers[idx] = { ...this.data.vouchers[idx], ...updates };
    this.save();
    return this.data.vouchers[idx];
  }
  deleteVoucher(id) {
    const idx = this.data.vouchers.findIndex(v => v.id === id);
    if (idx === -1) return false;
    this.data.vouchers.splice(idx, 1);
    this.save();
    return true;
  }

  // Live Chat
  getChatConversations() {
    return (this.data.chat_conversations || []).sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
  }

  getConversation(convId) {
    let conv = (this.data.chat_conversations || []).find(c => c.id === convId);
    if (!conv) {
      conv = {
        id: convId,
        user_id: null,
        user_name: 'Guest User',
        created_at: new Date().toISOString(),
        messages: [
          {
            id: 'msg_' + Date.now(),
            sender: 'admin',
            text: 'আসসালামু আলাইকুম! আল আনসার সুপার শপে স্বাগতম। ঘরের বাজার, বেকারি, খাঁটি আতর বা অর্ডার সংক্রান্ত যেকোনো তথ্য জানতে মেসেজ দিন।',
            timestamp: new Date().toISOString(),
            is_bot_reply: true
          }
        ],
        last_updated: new Date().toISOString(),
        unread_admin_count: 0,
        unread_user_count: 0
      };
      this.data.chat_conversations.push(conv);
      this.save();
    }
    return conv;
  }

  addChatMessage(convId, { sender, text, userId = null, userName = '', isBot = false }) {
    const conv = this.getConversation(convId);
    if (userId && !conv.user_id) conv.user_id = userId;
    if (userName && conv.user_name === 'Guest User') conv.user_name = userName;

    const newMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      sender,
      text,
      timestamp: new Date().toISOString(),
      is_bot_reply: isBot
    };

    conv.messages.push(newMsg);
    conv.last_updated = new Date().toISOString();
    if (sender === 'user') {
      conv.unread_admin_count = (conv.unread_admin_count || 0) + 1;
    } else if (sender === 'admin') {
      conv.unread_user_count = (conv.unread_user_count || 0) + 1;
    }
    this.save();
    return { conv, message: newMsg };
  }

  // Qard-e-Hasana Applications
  getQardApplications() {
    return (this.data.qard_applications || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createQardApplication(appData) {
    if (!this.data.qard_applications) this.data.qard_applications = [];
    const newApp = {
      id: 'qrd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      status: 'Pending',
      created_at: new Date().toISOString(),
      ...appData
    };
    this.data.qard_applications.unshift(newApp);
    this.save();
    return newApp;
  }

  updateQardApplicationStatus(id, status, notes = '') {
    if (!this.data.qard_applications) return null;
    const app = this.data.qard_applications.find(a => a.id === id);
    if (!app) return null;
    app.status = status;
    app.admin_notes = notes;
    app.reviewed_at = new Date().toISOString();

    if (status === 'Approved') {
      let user = app.user_id ? this.getUserById(app.user_id) : null;
      if (!user && app.email) user = this.getUserByEmail(app.email);
      if (!user && app.phone) user = this.getUserByPhone(app.phone);

      if (user) {
        user.qard_status = 'Approved';
        user.qard_credit_limit = Number(app.requested_limit) || 5000;
        user.qard_available_credit = Number(app.requested_limit) || 5000;
      }
    }
    this.save();
    return app;
  }

  // Loyalty Card Applications
  getLoyaltyApplications() {
    return (this.data.loyalty_applications || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createLoyaltyApplication(appData) {
    if (!this.data.loyalty_applications) this.data.loyalty_applications = [];
    const newApp = {
      id: 'lyt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      status: 'Pending',
      created_at: new Date().toISOString(),
      ...appData
    };
    this.data.loyalty_applications.unshift(newApp);

    // If user exists, also update user's status to Pending
    if (appData.user_id) {
      const user = this.getUserById(appData.user_id);
      if (user) {
        user.loyalty_card_status = 'Pending';
      }
    }
    this.save();
    return newApp;
  }

  updateLoyaltyApplicationStatus(id, status, notes = '') {
    if (!this.data.loyalty_applications) return null;
    const app = this.data.loyalty_applications.find(a => a.id === id);
    if (!app) return null;
    app.status = status;
    app.admin_notes = notes;
    app.reviewed_at = new Date().toISOString();

    if (status === 'Approved') {
      let user = app.user_id ? this.getUserById(app.user_id) : null;
      if (!user && app.email) user = this.getUserByEmail(app.email);
      if (!user && app.phone) user = this.getUserByPhone(app.phone);

      if (user) {
        user.loyalty_card_status = 'Approved';
        user.loyalty_card_approved = true;
        user.loyalty_tier = 'Royal Gold VIP';
        if (!user.loyalty_card_number) {
          user.loyalty_card_number = `ANSAR-VIP-${Math.floor(1000 + Math.random() * 9000)}-2026`;
        }
      }
    }
    this.save();
    return app;
  }

  // Suspended Account Appeals
  getAccountAppeals() {
    return (this.data.account_appeals || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createAccountAppeal(appealData) {
    if (!this.data.account_appeals) this.data.account_appeals = [];
    const newAppeal = {
      id: 'apl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      status: 'Under Review',
      created_at: new Date().toISOString(),
      ...appealData
    };
    this.data.account_appeals.unshift(newAppeal);
    this.save();
    return newAppeal;
  }

  updateAccountAppealStatus(id, status, adminReply = '') {
    if (!this.data.account_appeals) return null;
    const appeal = this.data.account_appeals.find(a => a.id === id);
    if (!appeal) return null;
    appeal.status = status;
    appeal.admin_reply = adminReply;
    appeal.reviewed_at = new Date().toISOString();

    if (status === 'Resolved') {
      let user = null;
      if (appeal.user_email) user = this.getUserByEmail(appeal.user_email);
      if (!user && appeal.user_phone) user = this.getUserByPhone(appeal.user_phone);
      if (user) {
        user.is_blocked = false;
      }
    }
    this.save();
    return appeal;
  }

  // Site Settings
  getSiteSettings() { return this.data.site_settings; }
  updateSiteSettings(newSettings) {
    this.data.site_settings = { ...this.data.site_settings, ...newSettings };
    this.save();
    return this.data.site_settings;
  }
}

if (fs.existsSync(DB_FILE)) {
  fs.unlinkSync(DB_FILE);
}

const db = new Database();
module.exports = db;
