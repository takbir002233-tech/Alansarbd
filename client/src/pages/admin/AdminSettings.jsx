import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ImageUploadField from '../../components/ImageUploadField';
import { 
  Settings, 
  Save, 
  Check, 
  Building, 
  CreditCard, 
  Truck, 
  Bell, 
  Sparkles,
  ShieldCheck,
  Flame,
  Layout,
  MessageCircle,
  FileText,
  HandHeart,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Layers,
  Phone,
  HelpCircle,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

export default function AdminSettings() {
  const { token } = useAuth();
  const { setSiteSettings, refreshSettings } = useCart();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('brand'); // brand, marquee, invoice, qard, terms, hero, deals, trust, guarantee, footer, payment

  const [form, setForm] = useState({
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
    qard_pillar_3_desc: 'আপনার সুবিধা অনুযায়ী নির্ধারিত মেয়াদের মধ্যে ঋণ পরিশোধের সুযোগ। ঈমানী আমানত হিসেবে যথাসময়ে ঋণ পরিশোধ করুন।',
    qard_terms_title: 'করযে হাসানার শর্তাবলী',
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
  });

  const [newSloganInput, setNewSloganInput] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setForm(prev => ({
            ...prev,
            ...data.settings,
            invoice_hadith_slogans: Array.isArray(data.settings.invoice_hadith_slogans) ? data.settings.invoice_hadith_slogans : prev.invoice_hadith_slogans,
            hero_banners: Array.isArray(data.settings.hero_banners) && data.settings.hero_banners.length > 0 ? data.settings.hero_banners : prev.hero_banners
          }));
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : ['dhaka_delivery_fee', 'outside_dhaka_delivery_fee', 'free_delivery_threshold', 'qard_hasana_percentage'].includes(name)
        ? Number(value)
        : value
    }));
  };

  const handleAddSlogan = () => {
    if (!newSloganInput.trim()) return;
    setForm(prev => ({
      ...prev,
      invoice_hadith_slogans: [...(prev.invoice_hadith_slogans || []), newSloganInput.trim()]
    }));
    setNewSloganInput('');
  };

  const handleRemoveSlogan = (idx) => {
    setForm(prev => ({
      ...prev,
      invoice_hadith_slogans: prev.invoice_hadith_slogans.filter((_, i) => i !== idx)
    }));
  };

  // Hero Photo Banners Management Helpers
  const handleAddBanner = () => {
    const newBanner = {
      id: 'banner_' + Date.now(),
      title: 'নতুন অফার বা পণ্যের আকর্ষণীয় ব্যানার',
      badge: '🛒 বিশেষ অফার',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
      link: 'cat_grocery',
      active: true
    };
    setForm(prev => ({
      ...prev,
      hero_banners: [...(prev.hero_banners || []), newBanner]
    }));
  };

  const handleUpdateBanner = (idx, field, value) => {
    setForm(prev => {
      const banners = [...(prev.hero_banners || [])];
      banners[idx] = { ...banners[idx], [field]: value };
      return { ...prev, hero_banners: banners };
    });
  };

  const handleRemoveBanner = (idx) => {
    if (!window.confirm('আপনি কি এই ব্যানার স্লাইডটি মুছে ফেলতে চান?')) return;
    setForm(prev => ({
      ...prev,
      hero_banners: prev.hero_banners.filter((_, i) => i !== idx)
    }));
  };

  const handleMoveBanner = (idx, direction) => {
    setForm(prev => {
      const banners = [...(prev.hero_banners || [])];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= banners.length) return prev;
      const temp = banners[idx];
      banners[idx] = banners[targetIdx];
      banners[targetIdx] = temp;
      return { ...prev, hero_banners: banners };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setSiteSettings(data.settings);
        refreshSettings();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-xs font-sans">লোড হচ্ছে...</div>;
  }

  const sections = [
    { id: 'brand', label: '১. ব্র্যান্ড ও লোগো', icon: Building },
    { id: 'marquee', label: '২. চলন্ত শিরোনাম', icon: Bell },
    { id: 'invoice', label: '৩. ইনভয়েস হাদিস ও স্লোগান', icon: FileText },
    { id: 'qard', label: '৪. করযে হাসানা পেজ ও শর্তাবলী', icon: HandHeart },
    { id: 'loyalty', label: '৫. লয়ালটি কার্ড ও মেম্বারশিপ CMS', icon: Sparkles },
    { id: 'terms', label: '৬. শর্তাবলী ও পলিসি পেজ', icon: ShieldCheck },
    { id: 'hero', label: '৭. স্লাইডিং ফটো ব্যানার CMS', icon: Layout },
    { id: 'deals', label: '৮. বিশেষ অফার ব্যানার', icon: Flame },
    { id: 'trust', label: '৯. ৪টি ট্রাস্ট ব্যাজ', icon: Sparkles },
    { id: 'guarantee', label: '১০. আল আনসার গ্যারান্টি', icon: ShieldCheck },
    { id: 'footer', label: '১১. ফুটার ও কপিরাইট', icon: Layers },
    { id: 'payment', label: '১২. পেমেন্ট ও ডেলিভারি ফি', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in pb-16 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">মাস্টার অ্যাডমিন সেটিংস ও CMS</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">ওয়েবসাইটের ১০০% কনটেন্ট পরিবর্তন ও নিয়ন্ত্রণ</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            করযে হাসানা, শর্তাবলী, হাদিস স্লোগান, হিরো ব্যানার, পেমেন্ট নম্বর ও লোগো সহ প্রতিটি লেখা পরিবর্তন করুন
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {savedSuccess && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>সকল তথ্য লাইভ সক্রিয় হয়েছে!</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-600/25 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Navigation Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-slate-900 p-3 rounded-3xl border border-slate-800 shadow-xl space-y-1 sticky top-24">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider px-3 py-2">
              কনটেন্ট ক্যাটাগরি
            </p>
            {sections.map(sec => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center">
                    <Icon className="w-4 h-4 mr-2.5 flex-shrink-0" />
                    <span>{sec.label}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Tab Forms (8 cols) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* SECTION 1: BRAND IDENTITY & LOGO */}
            {activeSection === 'brand' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-5 shadow-xl animate-in fade-in">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <Building className="w-4 h-4 mr-2 text-amber-400" /> ১. ব্র্যান্ড পরিচয় ও অফিসিয়াল লোগো আপলোড
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">ব্র্যান্ড নাম (ইংরেজি) *</label>
                    <input
                      type="text"
                      name="store_name"
                      required
                      value={form.store_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">ব্র্যান্ড নাম (বাংলা) *</label>
                    <input
                      type="text"
                      name="store_name_bn"
                      value={form.store_name_bn || 'আল আনসার'}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <ImageUploadField
                      label="স্টোর লোগো ছবি (Photo Upload)"
                      value={form.logo_url}
                      onChange={(url) => setForm({ ...form, logo_url: url })}
                      helper="অফিসিয়াল লোগো আপলোড করুন বা ডিফল্ট /logo.jpg বজায় রাখুন।"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">ব্র্যান্ড ট্যাগলাইন / স্লোগান</label>
                    <input
                      type="text"
                      name="store_tagline"
                      value={form.store_tagline}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">গ্রাহক সেবা হটলাইন নম্বর</label>
                    <input
                      type="text"
                      name="store_phone"
                      value={form.store_phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-emerald-400 block mb-1">হোয়াটসঅ্যাপ সাপোর্ট নম্বর</label>
                    <input
                      type="text"
                      name="whatsapp_number"
                      value={form.whatsapp_number}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">অফিসিয়াল শোরুম ও প্রধান কার্যালয়ের ঠিকানা</label>
                    <input
                      type="text"
                      name="showroom_address"
                      value={form.showroom_address}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: MARQUEE TICKER */}
            {activeSection === 'marquee' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-amber-500/30 space-y-5 shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-amber-400" /> ২. চলন্ত শিরোনাম (Animated Marquee Ticker)
                  </h3>
                  <label className="flex items-center space-x-2 text-xs text-amber-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      name="marquee_enabled"
                      checked={form.marquee_enabled !== false}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <span>চলন্ত শিরোনাম চালু রাখুন</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">চলন্ত স্ক্রল লেখার টেক্সট (Marquee Message)</label>
                  <textarea
                    rows={3}
                    name="marquee_text"
                    value={form.marquee_text}
                    onChange={handleChange}
                    placeholder="✨ আসসালামু আলাইকুম! আল আনসার-এ আপনাকে স্বাগতম..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-amber-200 font-medium focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    এই লেখাটি ওয়েবসাইটের একদম শীর্ষভাগে সোনালী পটভূমিতে চলমান থাকবে।
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 3: INVOICE HADITH & SLOGANS */}
            {activeSection === 'invoice' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-5 shadow-xl animate-in fade-in">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-emerald-400" /> ৩. ইনভয়েসের নিচের হাদিস ও ইসলামিক স্লোগান (Invoice Hadith CMS)
                </h3>
                <p className="text-xs text-slate-400">
                  গ্রাহক যখন ইনভয়েস প্রিন্ট বা PDF ডাউনলোড করবেন, তখন নিচের এই হাদিস ও স্লোগানগুলো ইনভয়েস কাগজের নিচে স্বয়ংক্রিয়ভাবে মুদ্রিত হবে।
                </p>

                <div className="space-y-2">
                  {(form.invoice_hadith_slogans || []).map((slogan, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-800 rounded-xl border border-slate-700 text-xs text-amber-200">
                      <span className="flex-1 pr-3">“{slogan}”</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlogan(idx)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="নতুন হাদিস বা স্লোগান লিখুন..."
                    value={newSloganInput}
                    onChange={(e) => setNewSloganInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSlogan}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>যোগ করুন</span>
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 4: QARD-E-HASANA FULL CMS */}
            {activeSection === 'qard' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-emerald-900/50 space-y-6 shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <HandHeart className="w-4 h-4 mr-2 text-emerald-400" /> ৪. করযে হাসানা পেজ, শর্তাবলী ও শতাংশ নিয়ন্ত্রণ
                  </h3>
                  <label className="flex items-center space-x-2 text-xs text-emerald-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      name="qard_hasana_enabled"
                      checked={form.qard_hasana_enabled !== false}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span>করযে হাসানা সেবা সক্রিয় রাখুন</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-emerald-400 block mb-1">চেকআউটে তাৎক্ষণিক করযে হাসানা ছাড়/বাকি (%) *</label>
                    <input
                      type="number"
                      name="qard_hasana_percentage"
                      value={form.qard_hasana_percentage || 10}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">করযে হাসানা পেজ ব্যাজ টেক্সট</label>
                    <input
                      type="text"
                      name="qard_hero_badge"
                      value={form.qard_hero_badge || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">করযে হাসানা পেজ মূল শিরোনাম (Title) *</label>
                    <input
                      type="text"
                      name="qard_hero_title"
                      value={form.qard_hero_title || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">করযে হাসানা পেজ সাবটাইটেল বিবরণ</label>
                    <textarea
                      rows={2}
                      name="qard_hero_subtitle"
                      value={form.qard_hero_subtitle || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-amber-400 block mb-1">করযে হাসানা পেজের হাদিস বাণী</label>
                    <input
                      type="text"
                      name="qard_hadith_quote"
                      value={form.qard_hadith_quote || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-amber-200 italic focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* 3 Pillars */}
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400">পিলার ১ (সুদমুক্ত)</span>
                    <input
                      type="text"
                      name="qard_pillar_1_title"
                      value={form.qard_pillar_1_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="qard_pillar_1_desc"
                      value={form.qard_pillar_1_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-amber-400">পিলার ২ (১০% বাকি)</span>
                    <input
                      type="text"
                      name="qard_pillar_2_title"
                      value={form.qard_pillar_2_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="qard_pillar_2_desc"
                      value={form.qard_pillar_2_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-2 p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400">পিলার ৩ (কিস্তি ও আমানতদারিতা)</span>
                    <input
                      type="text"
                      name="qard_pillar_3_title"
                      value={form.qard_pillar_3_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="qard_pillar_3_desc"
                      value={form.qard_pillar_3_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">করযে হাসানার শর্তাবলী টেক্সট (Terms & Rules) *</label>
                    <textarea
                      rows={4}
                      name="qard_hasana_terms"
                      value={form.qard_hasana_terms}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-amber-400 block mb-1">বিশেষ সুবিধা / নোটিশ টেক্সট</label>
                    <input
                      type="text"
                      name="qard_special_notice"
                      value={form.qard_special_notice || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-amber-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: LOYALTY CARD & PRIVILEGE CLUB FULL CMS */}
            {activeSection === 'loyalty' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-amber-900/50 space-y-6 shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-amber-400" /> ৫. লয়ালটি কার্ড পেজ, ৪টি সুবিধা ও শর্তাবলী CMS
                  </h3>
                  <label className="flex items-center space-x-2 text-xs text-amber-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      name="loyalty_card_enabled"
                      checked={form.loyalty_card_enabled !== false}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-amber-600"
                    />
                    <span>লয়ালটি কার্ড স্কিম সক্রিয় রাখুন</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">লয়ালটি পেজ ব্যাজ টেক্সট</label>
                    <input
                      type="text"
                      name="loyalty_hero_badge"
                      value={form.loyalty_hero_badge || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">লয়ালটি পেজ মূল শিরোনাম (Title) *</label>
                    <input
                      type="text"
                      name="loyalty_hero_title"
                      value={form.loyalty_hero_title || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">লয়ালটি পেজ সাবটাইটেল বিবরণ</label>
                    <textarea
                      rows={2}
                      name="loyalty_hero_subtitle"
                      value={form.loyalty_hero_subtitle || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-amber-400 block mb-1">ট্যাগলাইন / স্লোগান কোট</label>
                    <input
                      type="text"
                      name="loyalty_hadith_quote"
                      value={form.loyalty_hadith_quote || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-amber-200 italic focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* 4 Cards (3 features + 1 terms) */}
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400">কার্ড ১ (ক্যাশব্যাক ও পয়েন্ট)</span>
                    <input
                      type="text"
                      name="loyalty_pillar_1_title"
                      value={form.loyalty_pillar_1_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="loyalty_pillar_1_desc"
                      value={form.loyalty_pillar_1_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-amber-400">কার্ড ২ (ভিআইপি ছাড়)</span>
                    <input
                      type="text"
                      name="loyalty_pillar_2_title"
                      value={form.loyalty_pillar_2_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="loyalty_pillar_2_desc"
                      value={form.loyalty_pillar_2_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400">কার্ড ৩ (ফ্রি ডেলিভারি ও কেয়ার)</span>
                    <input
                      type="text"
                      name="loyalty_pillar_3_title"
                      value={form.loyalty_pillar_3_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="loyalty_pillar_3_desc"
                      value={form.loyalty_pillar_3_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-purple-400">কার্ড ৪ (শর্তাবলী ও নিয়মাবলী)</span>
                    <input
                      type="text"
                      name="loyalty_terms_title"
                      value={form.loyalty_terms_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="loyalty_terms_desc"
                      value={form.loyalty_terms_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">আবেদন বাটন বাংলা লেখা</label>
                    <input
                      type="text"
                      name="loyalty_button_bn"
                      value={form.loyalty_button_bn || 'লয়ালটি কার্ডের জন্য আবেদন করুন'}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">আবেদন বাটন ইংরেজি লেখা</label>
                    <input
                      type="text"
                      name="loyalty_button_en"
                      value={form.loyalty_button_en || 'Apply for Loyalty Card'}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-amber-300 font-mono focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: TERMS & CONDITIONS FULL CMS */}
            {activeSection === 'terms' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-amber-400" /> ৫. শর্তাবলী ও বিক্রয় নীতিমালা পেজ CMS (Terms & Conditions)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">পলিসি পেজ ব্যাজ টেক্সট</label>
                    <input
                      type="text"
                      name="terms_hero_badge"
                      value={form.terms_hero_badge || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">পলিসি পেজ মূল শিরোনাম (Title) *</label>
                    <input
                      type="text"
                      name="terms_hero_title"
                      value={form.terms_hero_title || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">পলিসি পেজ সাবটাইটেল বিবরণ</label>
                    <textarea
                      rows={2}
                      name="terms_hero_subtitle"
                      value={form.terms_hero_subtitle || ''}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-amber-400 block mb-1">সাধারণ শর্তাবলী মূল বক্স টেক্সট *</label>
                    <textarea
                      rows={4}
                      name="terms_and_conditions"
                      value={form.terms_and_conditions}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  {/* 4 Pillars */}
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400">পলিসি ১ (বিশুদ্ধতা ও গুণমান)</span>
                    <input
                      type="text"
                      name="terms_pillar_1_title"
                      value={form.terms_pillar_1_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="terms_pillar_1_desc"
                      value={form.terms_pillar_1_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400">পলিসি ২ (ডেলিভারি ও কুরিয়ার ট্র্যাকিং)</span>
                    <input
                      type="text"
                      name="terms_pillar_2_title"
                      value={form.terms_pillar_2_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="terms_pillar_2_desc"
                      value={form.terms_pillar_2_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-amber-400">পলিসি ৩ (৭ দিনের রিপ্লেসমেন্ট)</span>
                    <input
                      type="text"
                      name="terms_pillar_3_title"
                      value={form.terms_pillar_3_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="terms_pillar_3_desc"
                      value={form.terms_pillar_3_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-purple-400">পলিসি ৪ (করযে হাসানা শরিয়াহ নীতি)</span>
                    <input
                      type="text"
                      name="terms_pillar_4_title"
                      value={form.terms_pillar_4_title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <textarea
                      rows={2}
                      name="terms_pillar_4_desc"
                      value={form.terms_pillar_4_desc || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: HERO BANNER CMS (SLIDING PHOTO BANNERS) */}
            {activeSection === 'hero' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center">
                      <Layout className="w-4 h-4 mr-2 text-amber-400" /> ৬. হোম পেজ স্লাইডিং ফটো ব্যানার CMS (Hero Photo Slider)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      হোম পেজের কম্প্যাক্ট স্লাইডার ব্যানারের ফটো আপলোড করুন, লিংক ও ক্যাপশন সেট করুন, নতুন ব্যানার যোগ করুন বা মুছুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBanner}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন ব্যানার যোগ করুন</span>
                  </button>
                </div>

                {/* Banner Slides List */}
                <div className="space-y-4">
                  {(form.hero_banners || []).map((banner, idx) => (
                    <div 
                      key={banner.id || idx}
                      className="p-4 sm:p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-4 relative hover:border-amber-500/50 transition-colors"
                    >
                      {/* Slide Item Header */}
                      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30">
                            স্লাইড #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                            {banner.title || 'ব্যানার ছবি'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveBanner(idx, 'up')}
                            className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="উপরে নিন"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={idx === (form.hero_banners?.length || 0) - 1}
                            onClick={() => handleMoveBanner(idx, 'down')}
                            className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="নিচে নিন"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveBanner(idx)}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 cursor-pointer ml-1"
                            title="ব্যানার মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Slide Controls Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Left: Image Upload & Preview (5 cols) */}
                        <div className="md:col-span-5 space-y-3">
                          <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                            {banner.image_url ? (
                              <img 
                                src={banner.image_url} 
                                alt={banner.title || 'Preview'} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-bold">
                                <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
                                <span>ছবি নির্বাচন করুন</span>
                              </div>
                            )}
                          </div>

                          <ImageUploadField
                            value={banner.image_url || ''}
                            onChange={(url) => handleUpdateBanner(idx, 'image_url', url)}
                            label="ব্যানার ছবি (কম্পিউটার/মোবাইল থেকে আপলোড অথবা লিংক) *"
                            aspect="wide"
                            helper="ব্যানারের সুন্দর অনুপাত: ২১:৮ বা ৩:১"
                          />
                        </div>

                        {/* Right: Title, Badge, Link (7 cols) */}
                        <div className="md:col-span-7 space-y-3">
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">
                              ব্যানার শিরোনাম (Title / Caption)
                            </label>
                            <input
                              type="text"
                              value={banner.title || ''}
                              onChange={(e) => handleUpdateBanner(idx, 'title', e.target.value)}
                              placeholder="যেমন: ঘরের নিত্যপ্রয়োজনীয় খাঁটি বাজার ও অর্গানিক পণ্য"
                              className="w-full px-3 py-2 bg-slate-900 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-slate-300 block mb-1">
                                ছোট ব্যাজ (Tag Badge)
                              </label>
                              <input
                                type="text"
                                value={banner.badge || ''}
                                onChange={(e) => handleUpdateBanner(idx, 'badge', e.target.value)}
                                placeholder="যেমন: 🛒 ১০০% খাঁটি পণ্য"
                                className="w-full px-3 py-2 bg-slate-900 text-xs rounded-xl border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-300 block mb-1">
                                ক্লিক লিংক ড্রপডাউন
                              </label>
                              <select
                                value={banner.link || 'catalog'}
                                onChange={(e) => handleUpdateBanner(idx, 'link', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                              >
                                <option value="cat_grocery">🛒 ঘরের বাজার (Grocery)</option>
                                <option value="cat_bakery">🥐 বেকারি আইটেম (Bakery)</option>
                                <option value="cat_baby_food">👶 শিশু খাদ্য (Baby Food)</option>
                                <option value="cat_attar">✨ আতর ও সুগন্ধি (Attar & Oud)</option>
                                <option value="cat_perfume">💎 লাক্সারি পারফিউম (Perfumes)</option>
                                <option value="cat_gifts">🎁 গিফট কালেকশন (Gifts)</option>
                                <option value="qard-hasana">🤝 করযে হাসানা পেজ (Qard-e-Hasana)</option>
                                <option value="loyalty-card">💳 ভিআইপি লয়ালটি কার্ড পেজ (VIP Loyalty Card)</option>
                                <option value="catalog">📦 সব কালেকশন (All Catalog)</option>
                                <option value="terms">📜 শর্তাবলী পেজ (Terms & Policy)</option>
                                <option value="custom">🔗 কাস্টম লিংক</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1">
                              নির্দিষ্ট পেজ বা কাস্টম URL (টার্গেট লিংক)
                            </label>
                            <input
                              type="text"
                              value={banner.link || ''}
                              onChange={(e) => handleUpdateBanner(idx, 'link', e.target.value)}
                              placeholder="যেমন: cat_grocery অথবা https://..."
                              className="w-full px-3 py-2 bg-slate-900 text-xs rounded-xl border border-slate-700 text-slate-300 focus:outline-none focus:border-amber-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!form.hero_banners || form.hero_banners.length === 0) && (
                    <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-dashed border-slate-700 text-slate-400 text-xs">
                      বর্তমানে কোনো ব্যানার নেই। "নতুন ব্যানার যোগ করুন" বাটনে ক্লিক করে স্লাইড যোগ করুন।
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddBanner}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>আরেকটি ব্যানার স্লাইড যোগ করুন</span>
                  </button>
                </div>

                {/* Additional SEO / Meta Headline Fields */}
                <div className="border-t border-slate-800 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    অতিরিক্ত টেক্সট ও মেটা হেডলাইন (ঐচ্ছিক)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300 block mb-1">ওয়েবসাইটের মূল হেডলাইন</label>
                      <input
                        type="text"
                        name="hero_title"
                        value={form.hero_title || ''}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300 block mb-1">সাবটাইটেল বিবরণ</label>
                      <textarea
                        rows={2}
                        name="hero_subtitle"
                        value={form.hero_subtitle || ''}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: DEALS BANNER CMS */}
            {activeSection === 'deals' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-5 shadow-xl animate-in fade-in">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <Flame className="w-4 h-4 mr-2 text-rose-400" /> ৭. বিশেষ অফার ব্যানার CMS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">অফার ছোট ব্যাজ</label>
                    <input
                      type="text"
                      name="deals_badge"
                      value={form.deals_badge}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">অফার হেডলাইন *</label>
                    <input
                      type="text"
                      name="deals_title"
                      value={form.deals_title}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">অফার সাবটাইটেল</label>
                    <input
                      type="text"
                      name="deals_subtitle"
                      value={form.deals_subtitle}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 8: 4 TRUST BADGES CMS */}
            {activeSection === 'trust' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-5 shadow-xl animate-in fade-in">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-emerald-400" /> ৮. ৪টি ট্রাস্ট ব্যাজ CMS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-amber-400">ব্যাজ ১</span>
                    <input
                      type="text"
                      name="trust_1_title"
                      value={form.trust_1_title}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <input
                      type="text"
                      name="trust_1_desc"
                      value={form.trust_1_desc}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400">ব্যাজ ২</span>
                    <input
                      type="text"
                      name="trust_2_title"
                      value={form.trust_2_title}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <input
                      type="text"
                      name="trust_2_desc"
                      value={form.trust_2_desc}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400">ব্যাজ ৩</span>
                    <input
                      type="text"
                      name="trust_3_title"
                      value={form.trust_3_title}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <input
                      type="text"
                      name="trust_3_desc"
                      value={form.trust_3_desc}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-purple-400">ব্যাজ ৪</span>
                    <input
                      type="text"
                      name="trust_4_title"
                      value={form.trust_4_title}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-600 text-white"
                    />
                    <input
                      type="text"
                      name="trust_4_desc"
                      value={form.trust_4_desc}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 bg-slate-800 text-xs rounded-lg border border-slate-600 text-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 9: GUARANTEE SECTION CMS */}
            {activeSection === 'guarantee' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-5 shadow-xl animate-in fade-in">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-amber-400" /> ৯. আল আনসার গ্যারান্টি ও ৪টি পয়েন্ট CMS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">গ্যারান্টি ছোট ট্যাগ</label>
                    <input
                      type="text"
                      name="guarantee_badge"
                      value={form.guarantee_badge}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">গ্যারান্টি বড় হেডলাইন</label>
                    <input
                      type="text"
                      name="guarantee_title"
                      value={form.guarantee_title}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">গ্যারান্টি বর্ণনা প্যারাগ্রাফ</label>
                    <textarea
                      rows={2}
                      name="guarantee_subtitle"
                      value={form.guarantee_subtitle}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">পয়েন্ট ১</label>
                    <input
                      type="text"
                      name="guarantee_point_1"
                      value={form.guarantee_point_1}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-800 text-xs rounded-xl border border-slate-700 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">পয়েন্ট ২</label>
                    <input
                      type="text"
                      name="guarantee_point_2"
                      value={form.guarantee_point_2}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-800 text-xs rounded-xl border border-slate-700 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">পয়েন্ট ৩</label>
                    <input
                      type="text"
                      name="guarantee_point_3"
                      value={form.guarantee_point_3}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-800 text-xs rounded-xl border border-slate-700 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">পয়েন্ট ৪</label>
                    <input
                      type="text"
                      name="guarantee_point_4"
                      value={form.guarantee_point_4}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-800 text-xs rounded-xl border border-slate-700 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 10: FOOTER & COPYRIGHT CMS */}
            {activeSection === 'footer' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-5 shadow-xl animate-in fade-in">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-amber-400" /> ১০. ফুটার কপিরাইট, ডান পাশের স্লোগান ও বর্ণনা CMS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      ফুটার কপিরাইট টেক্সট (বাম পাশের লেখা) *
                    </label>
                    <input
                      type="text"
                      name="footer_copyright"
                      required
                      value={form.footer_copyright}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-400 block mb-1">
                      ফুটার ডান পাশের ট্যাগলাইন / স্লোগান *
                    </label>
                    <input
                      type="text"
                      name="footer_tagline"
                      required
                      value={form.footer_tagline}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-300 block mb-1">ফুটার পরিচিতি বর্ণনা (About Paragraph)</label>
                    <textarea
                      rows={3}
                      name="footer_about"
                      value={form.footer_about}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 11: PAYMENT NUMBERS & DELIVERY FEES */}
            {activeSection === 'payment' && (
              <div className="p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-5 shadow-xl animate-in fade-in">
                <h3 className="text-sm font-bold text-white flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-pink-400" /> ১১. পেমেন্ট অ্যাকাউন্ট নম্বর ও ডেলিভারি চার্জ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-pink-400 block mb-1">বিকাশ নম্বর ও বিবরণ *</label>
                    <input
                      type="text"
                      name="bkash_number"
                      required
                      value={form.bkash_number}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-amber-400 block mb-1">নগদ নম্বর ও বিবরণ *</label>
                    <input
                      type="text"
                      name="nagad_number"
                      required
                      value={form.nagad_number}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-purple-400 block mb-1">রকেট নম্বর ও বিবরণ *</label>
                    <input
                      type="text"
                      name="rocket_number"
                      required
                      value={form.rocket_number}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">ঢাকা সিটির ডেলিভারি চার্জ (টাকা) *</label>
                    <input
                      type="number"
                      name="dhaka_delivery_fee"
                      required
                      value={form.dhaka_delivery_fee}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">ঢাকার বাইরের ডেলিভারি চার্জ (টাকা) *</label>
                    <input
                      type="number"
                      name="outside_dhaka_delivery_fee"
                      required
                      value={form.outside_dhaka_delivery_fee}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">ফ্রি ডেলিভারির সর্বনিম্ন কেনাকাটা (টাকা) *</label>
                    <input
                      type="number"
                      name="free_delivery_threshold"
                      required
                      value={form.free_delivery_threshold}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-800 text-xs rounded-xl border border-slate-700 text-white font-mono font-bold text-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Action Bar */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-amber-600/25 flex items-center space-x-2 transition-all cursor-pointer"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>সকল পরিবর্তন সংরক্ষণ ও লাইভ আপডেট করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
