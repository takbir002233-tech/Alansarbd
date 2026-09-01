const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

// Default initial database state for AL ANSAR with Category Hierarchy & Subcategories
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
        created_at: new Date().toISOString()
      }
    ],
    categories: [
      {
        id: 'cat_perfumes',
        name: 'French & Western Perfumes',
        slug: 'french-perfumes',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
        priority_order: 1,
        item_count: 15,
        subcategories: [
          { id: 'sub_men_edp', name: "Men's Luxury EDP", slug: 'mens-luxury-edp' },
          { id: 'sub_women_edp', name: "Women's Floral Perfumes", slug: 'womens-floral-perfumes' },
          { id: 'sub_unisex_edp', name: 'Unisex Oriental Scents', slug: 'unisex-oriental-scents' }
        ]
      },
      {
        id: 'cat_attar',
        name: 'Non-Alcoholic Attar & Pure Oud',
        slug: 'pure-attar-oud',
        icon: 'Flame',
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=600&q=80',
        priority_order: 2,
        item_count: 18,
        subcategories: [
          { id: 'sub_cambodian_oud', name: 'Pure Cambodian Dehn Al Oud', slug: 'pure-cambodian-oud' },
          { id: 'sub_white_musk', name: 'Imperial White Musk', slug: 'imperial-white-musk' },
          { id: 'sub_royal_amber', name: 'Royal Ambergris & Rose', slug: 'royal-ambergris-rose' }
        ]
      },
      {
        id: 'cat_gift_boxes',
        name: 'Luxury Perfume Gift Boxes',
        slug: 'luxury-gift-boxes',
        icon: 'Gift',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
        priority_order: 3,
        item_count: 10,
        subcategories: [
          { id: 'sub_wooden_boxes', name: 'Handcrafted Wooden Boxes', slug: 'handcrafted-wooden-boxes' },
          { id: 'sub_eid_sets', name: 'Eid Mubarak Gift Boxes', slug: 'eid-mubarak-gift-boxes' },
          { id: 'sub_wedding_sets', name: 'Wedding VIP Collection', slug: 'wedding-vip-collection' }
        ]
      },
      {
        id: 'cat_combos',
        name: 'Exclusive Gift Hampers & Combos',
        slug: 'gift-combos',
        icon: 'Heart',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        priority_order: 4,
        item_count: 12,
        subcategories: [
          { id: 'sub_gentleman_combo', name: "Men's Watch & Fragrance Combos", slug: 'mens-watch-fragrance-combos' },
          { id: 'sub_women_combo', name: "Women's Romance Hampers", slug: 'womens-romance-hampers' }
        ]
      },
      {
        id: 'cat_bakhoor',
        name: 'Bakhoor & Scented Candles',
        slug: 'bakhoor-fragrance',
        icon: 'Flame',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
        priority_order: 5,
        item_count: 8,
        subcategories: [
          { id: 'sub_burners', name: 'Antique Brass Burners', slug: 'antique-brass-burners' },
          { id: 'sub_oudh_chips', name: 'Natural Oudh Wood Chips', slug: 'natural-oudh-wood-chips' }
        ]
      }
    ],
    products: [
      {
        id: 'prd_1',
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
        priority_order: 1,
        thumbnail: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'An opulent royal fragrance opening with spicy bergamot and Cambodian agarwood, settling into smoky amber and creamy Madagascar vanilla.',
        specs: {
          'Brand': 'AL ANSAR Luxury Collection',
          'Type': 'Eau de Parfum (EDP)',
          'Volume': '100ml / 3.4 fl oz',
          'Longevity': '14 - 18 Hours'
        },
        tags: ['Perfume', 'Oud', 'Royal', 'Luxury', 'AL ANSAR', 'Men', 'Free Delivery'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_2',
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
        priority_order: 2,
        thumbnail: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'A mesmerizing romantic blend of Damascus rose, blooming jasmine, and sparkling white amber crystals.',
        specs: {
          'Brand': 'AL ANSAR Signature',
          'Type': 'Eau de Parfum',
          'Volume': '80ml'
        },
        tags: ['Perfume', 'Floral', 'Rose', 'Amber', 'Women'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_3',
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
        priority_order: 3,
        thumbnail: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80'
        ],
        description: '100% pure, alcohol-free artisanal Dehn Al Oud distilled from aged Cambodian agarwood trees.',
        specs: {
          'Form': '100% Non-Alcoholic Concentrated Oil',
          'Volume': '12ml (1 Tola)',
          'Origin': 'Cambodia'
        },
        tags: ['Attar', 'Oud', 'Alcohol Free'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_4',
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
        priority_order: 4,
        thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Silky, clean white musk enriched with powdery amber and subtle floral accords.',
        specs: {
          'Form': 'Pure Concentrated Attar Oil',
          'Volume': '6ml (1/2 Tola)'
        },
        tags: ['Attar', 'White Musk'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_5',
        title: 'AL ANSAR Royal Wooden Gift Box (3x 12ml Attar + Tasbih + Velvet Box)',
        slug: 'al-ansar-royal-wooden-gift-box-trio',
        category_id: 'cat_gift_boxes',
        subcategory_id: 'sub_wooden_boxes',
        price: 4200,
        discount_price: 3450,
        stock: 15,
        rating: 5.0,
        review_count: 29,
        is_featured: true,
        is_free_delivery: true,
        priority_order: 5,
        thumbnail: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'An elite bespoke wooden gift box lined with royal velvet. Includes 3 signature 12ml luxury attars.',
        specs: {
          'Box Material': 'Polished Mahogany Wood with Brass Latch',
          'Includes': '3x 12ml Crystal Attar Bottles + Premium Tasbih + Gift Box'
        },
        tags: ['Gift Box', 'Hamper', 'Eid', 'Free Delivery'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_6',
        title: "Gentleman's Signature Gift Hamper (Perfume + Watch + Leather Wallet)",
        slug: 'gentlemans-signature-gift-hamper-set',
        category_id: 'cat_combos',
        subcategory_id: 'sub_gentleman_combo',
        price: 5800,
        discount_price: 4800,
        stock: 10,
        rating: 4.9,
        review_count: 34,
        is_featured: true,
        is_free_delivery: true,
        priority_order: 6,
        thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'The ultimate luxury combo gift for men. Features 1x AL ANSAR Royal Oud 50ml EDP + Formal Quartz Wristwatch + 100% Genuine Leather Bi-fold Wallet.',
        specs: {
          'Hamper Contents': '50ml Perfume + Quartz Watch + Cowhide Leather Wallet + Gift Card'
        },
        tags: ['Hamper', 'Men', 'Combo', 'Free Delivery'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_7',
        title: 'Golden Antique Bakhoor Burner & 100g Royal Oudh Incense Set',
        slug: 'golden-antique-bakhoor-burner-oudh-set',
        category_id: 'cat_bakhoor',
        subcategory_id: 'sub_burners',
        price: 2800,
        discount_price: 2250,
        stock: 20,
        rating: 4.9,
        review_count: 27,
        is_featured: false,
        is_free_delivery: false,
        priority_order: 7,
        thumbnail: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'Transform your home, office, or prayer space with an enchanting Arabic aroma.',
        specs: {
          'Burner Material': 'High-Heat Resistant Antique Brass / Gold Plating'
        },
        tags: ['Bakhoor', 'Oud', 'Home Fragrance'],
        created_at: new Date().toISOString()
      },
      {
        id: 'prd_8',
        title: "Rose Gold Elegance Women's Gift Hamper (Perfume + Mist + Scented Candle)",
        slug: 'rose-gold-elegance-womens-gift-hamper',
        category_id: 'cat_combos',
        subcategory_id: 'sub_women_combo',
        price: 4600,
        discount_price: 3750,
        stock: 14,
        rating: 5.0,
        review_count: 22,
        is_featured: false,
        is_free_delivery: true,
        priority_order: 8,
        thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
        ],
        description: 'A charming gift hamper designed to delight. Contains Velvet Rose 50ml EDP, matching shimmering Body Mist, and hand-poured Soy Scented Candle.',
        specs: {
          'Contents': '50ml Perfume + 150ml Body Mist + 200g Soy Scented Candle'
        },
        tags: ['Women', 'Gift Box', 'Rose', 'Free Delivery'],
        created_at: new Date().toISOString()
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
      store_name: 'AL ANSAR',
      store_name_bn: 'আল আনসার',
      store_tagline: 'বিলাসবহুল পারফিউম, ১০০% খাঁটি আতর ও এক্সক্লুসিভ উপহার সামগ্রী বাংলাদেশ',
      store_phone: '+880 1711-223344',
      store_email: 'info@alansarfragrance.com',
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
      marquee_text: '✨ আসসালামু আলাইকুম! আল আনসার-এ আপনাকে স্বাগতম • ভাউচার কোড ANSAR10 ব্যবহারে পান ১০% তাৎক্ষণিক ছাড় • ২০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি • বিনা সুদে করযে হাসানা (১০% তাৎক্ষণিক ধার) সুবিধা উপভোগ করুন ✨',
      marquee_enabled: true,

      // Invoice Hadith & Slogans
      invoice_hadith_slogans: [
        '“সৎ ও আমানতদার ব্যবসায়ী কিয়ামতের দিন নবী, সিদ্দিক ও শহীদগণের সাথে থাকবে।” — (তিরমিযী)',
        '“হে মুমিনগণ! তোমরা পারস্পরিক সন্তুষ্টির ভিত্তিতে ব্যবসা-বাণিজ্য করো।” — (সূরা আন-নিসা: ২৯)',
        'আল আনসার — বিশুদ্ধ সুবাস ও বিশ্বস্ততার মেলবন্ধন।'
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

      // Terms and Conditions Full CMS
      terms_hero_badge: 'অফিসিয়াল পলিসি ও নীতিমালা',
      terms_hero_title: 'শর্তাবলী, ডেলিভারি ও শরিয়াহ নীতিমালা',
      terms_hero_subtitle: 'আল আনসার (AL ANSAR) বিশুদ্ধ সুবাস ও বিশ্বস্ততার সাথে ব্যবসা পরিচালনায় অঙ্গীকারবদ্ধ। ক্রেতা ও গ্রাহকদের সর্বোচ্চ সন্তুষ্টি ও অধিকার সুরক্ষায় আমাদের সুস্পষ্ট নীতিমালা নিচে বর্ণিত হলো।',
      terms_main_heading: 'সাধারণ শর্তাবলী ও বিক্রয় নীতিমালা',
      terms_and_conditions: '১. আল আনসার ১০০% খাঁটি ও অ্যালকোহলমুক্ত আতর এবং প্রিমিয়াম পারফিউম সরবরাহে অঙ্গীকারবদ্ধ।\n২. ডেলিভারি গ্রহণের সময় পণ্য যাচাই করে গ্রহণ করুন। কোনো ত্রুটি থাকলে ৭ দিনের মধ্যে পরিবর্তন বা রিপ্লেসমেন্ট করা হবে।\n৩. ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। ২০০০ টাকার উপরে অর্ডারে ডেলিভারি ফ্রি।\n৪. করযে হাসানা সুবিধা গ্রহণের ক্ষেত্রে সঠিক তথ্য ও এনআইডি প্রদান বাধ্যতামূলক।',
      terms_pillar_1_title: '১. সুগন্ধির বিশুদ্ধতা ও গুণমান নিশ্চয়তা',
      terms_pillar_1_desc: 'আমাদের সকল আতর ১০০% নন-অ্যালকোহলিক প্রাকৃতিক তেল ও আসল কম্বোডিয়ান আগরউড থেকে তৈরি। কোনো প্রকার সিন্থেটিক বা ক্ষতিকর কেমিক্যাল ব্যবহার করা হয় না।',
      terms_pillar_2_title: '২. দ্রুত ডেলিভারি ও কুরিয়ার ট্র্যাকিং',
      terms_pillar_2_desc: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৪ দিনের মধ্যে স্টিভফাস্ট বা রেডএক্স কুরিয়ারের মাধ্যমে ডেলিভারি সম্পন্ন হয়। প্রতিটি অর্ডারে লাইভ কুরিয়ার ট্র্যাকিং লিংক প্রদান করা হয়।',
      terms_pillar_3_title: '৩. ৭ দিনের সহজ রিপ্লেসমেন্ট সুবিধা',
      terms_pillar_3_desc: 'পার্সেল খোলার সময় কোনো বোতল বা প্যাকেজিংয়ে ত্রুটি পরিলক্ষিত হলে সাথে সাথে আমাদের হেল্পলাইনে কল দিন বা ইনভয়েস সহ জানালে আমরা ৭ দিনের মধ্যে ফ্রি রিপ্লেসমেন্ট প্রদান করি।',
      terms_pillar_4_title: '৪. সুদমুক্ত করযে হাসানা নীতিমালা',
      terms_pillar_4_desc: 'করযে হাসানা সুবিধার অধীনে কোনো অতিরিক্ত সুদ বা ফি প্রযোজ্য নয়। ক্রেতাকে আমানতদারিতার সাথে নির্ধারিত সময়ে বকেয়া টাকা পরিশোধের অঙ্গীকার করতে হবে।',

      // Hero Section CMS
      hero_badge: 'আল আনসার • প্রিমিয়াম পারফিউম ও রাজকীয় উপহার কালেকশন',
      hero_title: 'প্রতিটি ফোঁটায় আভিজাত্য, প্রতিটি উপহারে চিরস্মরণীয় স্মৃতি।',
      hero_subtitle: 'ফ্রান্স ও ওরিয়েন্টাল পারফিউম, অ্যালকোহলমুক্ত খাঁটি কম্বোডিয়ান উদ এবং প্রিয়জনের জন্য আকর্ষণীয় গিফট বক্স। সারাদেশে লাইভ কুরিয়ার ট্র্যাকিং সহ দ্রুততম হোম ডেলিভারি।',
      hero_metric_1_val: '১০০% খাঁটি',
      hero_metric_1_label: 'অ্যালকোহলমুক্ত আতর',
      hero_metric_2_val: '১৬+ ঘণ্টা',
      hero_metric_2_label: 'স্থায়িত্ব ও লংজিভিটি',
      hero_metric_3_val: 'স্টিভফাস্ট/রেডএক্স',
      hero_metric_3_label: 'লাইভ কুরিয়ার ট্র্যাক',

      // Deals Section CMS
      deals_badge: 'সীমিত সময়ের সুগন্ধি অফার',
      deals_title: '⚡ বিশেষ ডিসকাউন্ট ডিল',
      deals_subtitle: 'ভাউচার কোড ব্যবহার করে পান ২৫% পর্যন্ত বিশেষ ছাড়',

      // Guarantee Section CMS
      guarantee_badge: 'আল আনসার নিশ্চয়তা',
      guarantee_title: 'কেন ১৫,০০০+ সুগন্ধিপ্রেমী আল আনসার পছন্দ করেন?',
      guarantee_subtitle: 'আমরা বিশুদ্ধতার সাথে কখনো আপস করি না। খাঁটি উদ তেল থেকে শুরু করে রাজকীয় কাঠের গিফট বক্স প্যাকেজিং, বিকাশ/নগদ পেমেন্ট এবং বিনা সুদে করযে হাসানা সুবিধা।',
      guarantee_point_1: '১০০% অ্যালকোহলমুক্ত খাঁটি আতর ও উদ',
      guarantee_point_2: 'স্টিভফাস্ট ও রেডএক্স লাইভ কুরিয়ার ট্র্যাকিং লিংক',
      guarantee_point_3: 'ভাউচার কোডে ইনস্ট্যান্ট ডিসকাউন্ট ও পয়েন্ট রিওয়ার্ড',
      guarantee_point_4: 'আকর্ষণীয় রাজকীয় গিফট বক্স ও কার্ড প্যাকেজিং',

      // 4 Trust Badges CMS
      trust_1_title: '১০০% খাঁটি সুগন্ধি',
      trust_1_desc: 'ফ্রেঞ্চ ও ওরিয়েন্টাল খাঁটি এসেন্সিয়াল অয়েল',
      trust_2_title: 'অ্যালকোহলমুক্ত আতর',
      trust_2_desc: '১০০% খাঁটি প্রাকৃতিক আতর ও উদ তেল',
      trust_3_title: 'দ্রুত কুরিয়ার ডেলিভারি',
      trust_3_desc: 'স্টিভফাস্ট / রেডএক্স লাইভ ট্র্যাকিং',
      trust_4_title: '২৪/৭ গ্রাহক সেবা',
      trust_4_desc: 'লাইভ এআই ও কাস্টমার সাপোর্ট',

      // Footer CMS
      footer_about: 'বাংলাদেশে ফ্রেঞ্চ পারফিউম, অ্যালকোহলমুক্ত খাঁটি আতর, আসল কম্বোডিয়ান উদ এবং রাজকীয় গিফট বক্সের বিশ্বস্ত প্রিমিয়াম প্রতিষ্ঠান।',
      footer_copyright: '© ২০২৬ AL ANSAR (আল আনসার) সুগন্ধি ও লাক্সারি গিফট বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।',
      footer_tagline: 'বিশুদ্ধ সুবাস • রাজকীয় কারুকার্য • সুদমুক্ত সেবা'
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
      name: catData.name.trim(),
      icon: catData.icon || 'Sparkles',
      image: catData.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
      priority_order: catData.priority_order || (this.data.categories.length + 1),
      item_count: 0,
      subcategories: Array.isArray(catData.subcategories) ? catData.subcategories : []
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

  reorderCategory(id, direction) {
    const sorted = this.getCategories();
    const idx = sorted.findIndex(c => c.id === id);
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
    return this.getCategories();
  }

  addSubcategory(categoryId, subName) {
    const cat = this.getCategoryById(categoryId);
    if (!cat) return null;
    if (!cat.subcategories) cat.subcategories = [];
    
    const newSub = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
      name: subName.trim(),
      slug: subName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };
    cat.subcategories.push(newSub);
    this.save();
    return newSub;
  }

  deleteSubcategory(categoryId, subId) {
    const cat = this.getCategoryById(categoryId);
    if (!cat || !cat.subcategories) return false;
    const idx = cat.subcategories.findIndex(s => s.id === subId);
    if (idx === -1) return false;
    cat.subcategories.splice(idx, 1);
    this.save();
    return true;
  }

  // Vouchers / Promo Codes
  getVouchers() { return this.data.vouchers || []; }
  createVoucher(voucherData) {
    const newVoucher = {
      id: 'vch_' + Date.now(),
      code: voucherData.code.trim().toUpperCase(),
      discount_type: voucherData.discount_type || 'percent',
      discount_value: Number(voucherData.discount_value) || 10,
      min_spend: Number(voucherData.min_spend) || 0,
      is_active: voucherData.is_active !== undefined ? !!voucherData.is_active : true,
      description: voucherData.description || ''
    };
    if (!this.data.vouchers) this.data.vouchers = [];
    this.data.vouchers.push(newVoucher);
    this.save();
    return newVoucher;
  }
  updateVoucher(id, updates) {
    const idx = (this.data.vouchers || []).findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.vouchers[idx] = { ...this.data.vouchers[idx], ...updates };
    this.save();
    return this.data.vouchers[idx];
  }
  deleteVoucher(id) {
    const idx = (this.data.vouchers || []).findIndex(v => v.id === id);
    if (idx === -1) return false;
    this.data.vouchers.splice(idx, 1);
    this.save();
    return true;
  }

  // Orders
  getOrdersByUserId(userId) { 
    const u = this.getUserById(userId);
    return this.data.orders.filter(o => {
      if (o.user_id === userId) return true;
      if (u) {
        if (u.email && o.customer_email && o.customer_email.toLowerCase() === u.email.toLowerCase()) return true;
        if (u.phone && o.customer_phone && o.customer_phone === u.phone) return true;
      }
      return false;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); 
  }
  
  createOrder(orderData) {
    const randomCode = 'ANSAR-' + Math.floor(10000 + Math.random() * 90000);
    const newOrder = {
      id: 'ord_' + Date.now(),
      order_code: randomCode,
      payment_status: orderData.payment_method === 'cod' ? 'Pending' : 'Paid (Trx Submitted)',
      status: 'Pending',
      courier_name: '',
      consignment_id: '',
      courier_tracking_url: '',
      status_history: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: `Order placed via ${orderData.payment_method.toUpperCase()}${orderData.transaction_id ? ` (TrxID: ${orderData.transaction_id})` : ''}`
        }
      ],
      created_at: new Date().toISOString(),
      ...orderData
    };

    // Decrement stock for ordered products
    if (Array.isArray(orderData.items)) {
      orderData.items.forEach(item => {
        const prd = this.getProductById(item.id);
        if (prd && prd.stock >= item.quantity) {
          prd.stock -= item.quantity;
        }
      });
    }

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus, note = '', courierDetails = {}) {
    const order = this.data.orders.find(o => o.id === orderId || o.order_code === orderId);
    if (!order) return null;
    order.status = newStatus;
    if (courierDetails.courier_name) order.courier_name = courierDetails.courier_name;
    if (courierDetails.consignment_id) order.consignment_id = courierDetails.consignment_id;
    if (courierDetails.courier_tracking_url) order.courier_tracking_url = courierDetails.courier_tracking_url;

    if (!order.status_history) order.status_history = [];
    order.status_history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${newStatus} by Admin`
    });

    if (newStatus === 'Confirmed' || newStatus === 'Delivered') {
      order.payment_status = 'Paid';
    } else if (newStatus === 'Cancelled') {
      order.payment_status = 'Cancelled';
    }
    this.save();
    return order;
  }

  // Chats
  getConversations() {
    return [...this.data.chat_conversations].sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
  }

  getConversation(convId) {
    let conv = this.data.chat_conversations.find(c => c.id === convId);
    if (!conv) {
      conv = {
        id: convId,
        user_id: null,
        user_name: 'Guest User',
        user_phone: '',
        user_email: '',
        messages: [
          {
            id: 'msg_' + Date.now(),
            sender: 'bot',
            text: 'Assalamu Alaikum! 👋 Welcome to AL ANSAR Luxury Fragrance & Gifts. How can we help you today? Ask about perfume notes, bKash payments, courier tracking, or request live support!',
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
      status: 'Pending', // Pending, Approved, Rejected
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

    // If approved, update user's qard status & limit
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

  // Suspended Account Appeals
  getAccountAppeals() {
    return (this.data.account_appeals || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createAccountAppeal(appealData) {
    if (!this.data.account_appeals) this.data.account_appeals = [];
    const newAppeal = {
      id: 'apl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      status: 'Under Review', // Under Review, Resolved, Rejected
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

    // If resolved, unblock user by email or phone
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
