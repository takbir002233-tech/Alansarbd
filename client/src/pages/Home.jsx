import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import { 
  Sparkles, 
  ArrowRight, 
  Flame, 
  ShieldCheck, 
  Truck, 
  Gift, 
  CheckCircle2, 
  Clock, 
  Heart, 
  Award,
  ChevronRight,
  ChevronLeft,
  HandHeart,
  CreditCard,
  ShoppingBasket,
  UtensilsCrossed,
  Baby,
  Tag,
  Star,
  Layers,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Home({ onNavigate, searchKeyword = '', setSearchKeyword = () => {} }) {
  const { siteSettings } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);

  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  // 5 Auto-Sliding Dynamic Hero Slides (ঘরের বাজার, করযে হাসানা, ভিআইপি কার্ড, বেকারি ও গিফট, ফ্রি ডেলিভারি)
  const heroSlides = [
    {
      id: 1,
      badge: '🛒 আল আনসার সুপার শপ • ফ্রেশ ও প্রিমিয়াম কোয়ালিটি',
      title: siteSettings?.hero_title || 'ঘরের নিত্যপ্রয়োজনীয় বাজার ও খাঁটি পণ্যের বিশ্বস্ত ঠিকানা',
      subtitle: siteSettings?.hero_subtitle || 'চাল, ডাল, সরিষার খাঁটি তেল, প্রিমিয়াম ঘি, সুন্দরবনের মধু ও মসলা—সবকিছু এক ছাদের নিচে শতভাগ নির্ভেজাল মানে। সারাদেশে দ্রুততম হোম ডেলিভারি।',
      btnPrimaryText: 'ঘরের বাজার দেখুন',
      btnPrimaryAction: () => onNavigate('catalog', { category: 'cat_grocery' }),
      btnSecondaryText: 'সব পণ্য কালেকশন',
      btnSecondaryAction: () => onNavigate('catalog'),
      theme: 'from-slate-950 via-emerald-950 to-slate-950',
      icon: ShoppingBasket,
      accentColor: 'text-amber-400'
    },
    {
      id: 2,
      badge: '🤝 করযে হাসানা • ১০% তাৎক্ষণিক হালাল ধার সুবিধা',
      title: 'বিনা সুদে কেনাকাটা করুন ১০% তাৎক্ষণিক করযে হাসানার সুবিধায়',
      subtitle: 'জরুরি প্রয়োজনে কেনাকাটায় অর্থ পরিশোধ করুন সহজ কিস্তিতে। জাতীয় পরিচয়পত্র (NID) দিয়ে মাত্র ১ মিনিটে আবেদন করুন এবং উপভোগ করুন শূন্য শতাংশ সুদের হালাল সুবিধা।',
      btnPrimaryText: 'করযে হাসানা আবেদন করুন',
      btnPrimaryAction: () => onNavigate('qard-hasana'),
      btnSecondaryText: 'শর্তাবলী ও নীতিমালা',
      btnSecondaryAction: () => onNavigate('terms'),
      theme: 'from-emerald-950 via-slate-950 to-emerald-950',
      icon: HandHeart,
      accentColor: 'text-emerald-400'
    },
    {
      id: 3,
      badge: '💳 ভিআইপি লয়ালটি ক্রেডিট কার্ড • রিওয়ার্ড ও ক্যাশব্যাক',
      title: 'প্রতি কেনাকাটায় আকর্ষণীয় ক্যাশব্যাক ও ভিআইপি রিওয়ার্ড পয়েন্ট',
      subtitle: 'সিলভার, গোল্ড ও প্লাটিনাম মেম্বারশিপে বিশেষ ডিসকাউন্ট, ফ্রি ডেলিভারি ও এক্সক্লুসিভ রিওয়ার্ড পয়েন্ট রূপান্তরের রাজকীয় সুবিধা।',
      btnPrimaryText: 'ভিআইপি কার্ড সক্রিয় করুন',
      btnPrimaryAction: () => onNavigate('dashboard', { tab: 'overview' }),
      btnSecondaryText: 'লয়ালটি অফার জানুন',
      btnSecondaryAction: () => onNavigate('catalog'),
      theme: 'from-amber-950 via-slate-950 to-amber-950',
      icon: CreditCard,
      accentColor: 'text-amber-300'
    },
    {
      id: 4,
      badge: '🥐 তাজা বেকারি, প্রিমিয়াম মিষ্টি ও আকর্ষণীয় গিফট সামগ্রী',
      title: 'দৈনন্দিন ফ্রেশ বেকারি আইটেম ও প্রিয়জনের জন্য স্পেশাল গিফট বক্স',
      subtitle: 'বাটার কুকিজ, ফ্রেশ কেক, বিস্কুট, টোস্ট, রয়্যাল আতর ও ইসলামিক আকর্ষণীয় উপহার সামগ্রীর বিশাল সমাহার।',
      btnPrimaryText: 'বেকারি আইটেম দেখুন',
      btnPrimaryAction: () => onNavigate('catalog', { category: 'cat_bakery' }),
      btnSecondaryText: 'গিফট কালেকশন',
      btnSecondaryAction: () => onNavigate('catalog', { category: 'cat_gifts' }),
      theme: 'from-slate-950 via-amber-950 to-emerald-950',
      icon: UtensilsCrossed,
      accentColor: 'text-amber-400'
    },
    {
      id: 5,
      badge: '🚚 সারাদেশে দ্রুততম হোম ডেলিভারি ও সহজ পেমেন্ট',
      title: 'ক্যাশ অন ডেলিভারি, বিকাশ ও নগদে নিরাপদ পেমেন্টে ঘরে বসেই কেনাকাটা',
      subtitle: 'ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা এবং সারাদেশে ৭২ ঘণ্টায় পৌঁছে যাবে আপনার পছন্দের অর্ডার। ২০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি!',
      btnPrimaryText: 'শপিং শুরু করুন',
      btnPrimaryAction: () => onNavigate('catalog'),
      btnSecondaryText: 'লাইভ অর্ডার ট্র্যাক',
      btnSecondaryAction: () => onNavigate('track-order'),
      theme: 'from-emerald-950 via-slate-950 to-slate-950',
      icon: Truck,
      accentColor: 'text-emerald-300'
    }
  ];

  // Auto slide timer
  useEffect(() => {
    if (sliderPaused) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderPaused, heroSlides.length]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData.success) setProducts(prodData.products);
        if (catData.success) setCategories(catData.categories);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const flashDeals = products.filter(p => p.discount_price && p.discount_price < p.price);
  const freeDeliveryItems = products.filter(p => p.is_free_delivery);
  const groceryItems = products.filter(p => p.category_id === 'cat_grocery');
  const bakeryItems = products.filter(p => p.category_id === 'cat_bakery');
  const babyFoodItems = products.filter(p => p.category_id === 'cat_baby_food');
  const attarItems = products.filter(p => p.category_id === 'cat_attar');
  const giftItems = products.filter(p => p.category_id === 'cat_gifts');

  const filteredProducts = selectedCat === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCat);

  const hasActiveSearch = !!(searchKeyword && searchKeyword.trim().length > 0);
  const searchResults = hasActiveSearch 
    ? products.filter(p => {
        const q = searchKeyword.trim().toLowerCase();
        const catObj = categories.find(c => c.id === p.category_id);
        const catName = catObj ? catObj.name.toLowerCase() : '';
        return (
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
          catName.includes(q)
        );
      })
    : [];

  return (
    <div className="space-y-14 pb-20 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* 🌟 DEDICATED SEARCH RESULTS SECTION (Visible on Home when user searches) */}
      {hasActiveSearch && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-3xl text-slate-950 shadow-lg border-2 border-amber-300">
            <div className="flex items-center space-x-3">
              <span className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center text-lg font-black shadow-md flex-shrink-0">
                🔍
              </span>
              <div>
                <h2 className="text-base sm:text-xl font-black tracking-tight leading-tight">
                  "{searchKeyword}" এর অনুসন্ধান ফলাফল
                </h2>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {toBengaliDigits(searchResults.length)} টি পণ্য পাওয়া গেছে
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setSearchKeyword('')} 
              className="px-3.5 sm:px-4 py-2 bg-slate-950 hover:bg-black text-amber-300 rounded-xl text-xs font-black shadow-md cursor-pointer transition-transform active:scale-95 flex items-center space-x-1.5 flex-shrink-0 border border-amber-400/40"
            >
              <span>✕ অনুসন্ধান বন্ধ করুন</span>
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {searchResults.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigate}
                  onSelect={(id) => onNavigate('product-details', { productId: id })}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-amber-200 text-center space-y-3 shadow-xs">
              <span className="text-4xl block">🛍️</span>
              <h3 className="text-base font-black text-slate-900">"{searchKeyword}" সম্পর্কিত কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                আপনার অনুসন্ধানের সাথে মিল রেখে কোনো পণ্য পাওয়া যায়নি। দয়া করে অন্য কোনো নাম দিয়ে চেষ্টা করুন।
              </p>
              <button 
                onClick={() => setSearchKeyword('')} 
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                সব পণ্য কালেকশন দেখুন
              </button>
            </div>
          )}
        </section>
      )}

      {/* 1. AUTO-SLIDING FULL-WIDTH HERO CAROUSEL */}
      <section 
        className={`relative overflow-hidden rounded-3xl mx-3 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 shadow-2xl border border-amber-900/40 select-none group ${hasActiveSearch ? 'hidden' : ''}`}
        onMouseEnter={() => setSliderPaused(true)}
        onMouseLeave={() => setSliderPaused(false)}
      >
        <div 
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {heroSlides.map((slide, idx) => {
            const IconComponent = slide.icon;
            return (
              <div 
                key={slide.id}
                className={`w-full flex-shrink-0 bg-gradient-to-br ${slide.theme} text-white px-6 sm:px-12 lg:px-16 py-12 sm:py-20 lg:py-24 relative`}
              >
                {/* Background ambient lighting */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                  
                  {/* Left Hero Content */}
                  <div className="lg:col-span-8 space-y-5 sm:space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-400/30 rounded-full px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md shadow-xs">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{slide.badge}</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-snug sm:leading-tight">
                      {slide.title}
                    </h1>

                    <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-medium">
                      {slide.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-3.5 pt-2">
                      <button
                        onClick={slide.btnPrimaryAction}
                        className="px-7 py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-600/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                      >
                        <span>{slide.btnPrimaryText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={slide.btnSecondaryAction}
                        className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl border border-amber-400/30 hover:border-amber-400 transition-all flex items-center space-x-2 shadow-md cursor-pointer"
                      >
                        <span>{slide.btnSecondaryText}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Hero Badge Showcase */}
                  <div className="hidden lg:flex lg:col-span-4 justify-center">
                    <div className="relative p-7 bg-slate-900/80 rounded-3xl border border-amber-500/30 shadow-2xl backdrop-blur-xl text-center space-y-4 max-w-xs w-full animate-in zoom-in-95">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-700 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                        <IconComponent className="w-8 h-8 text-slate-950" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest block">
                          AL ANSAR ASSURANCE
                        </span>
                        <h4 className="text-base font-black text-white mt-1">১০০% খাঁটি ও হালাল পণ্য</h4>
                        <p className="text-[11px] text-slate-300 mt-1 leading-normal font-medium">
                          ন্যায্য মূল্য, প্রিমিয়াম কোয়ালিটি ও দ্রুততম হোম ডেলিভারি নিশ্চয়তা।
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-around text-xs font-bold text-amber-300">
                        <span>✓ ক্যাশ অন ডেলিভারি</span>
                        <span>•</span>
                        <span>✓ ০% সুদে ধার</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={() => setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-amber-600 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-80 hover:opacity-100 shadow-lg"
          title="পূর্ববর্তী স্লাইড"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveSlide(prev => (prev + 1) % heroSlides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-amber-600 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-80 hover:opacity-100 shadow-lg"
          title="পরবর্তী স্লাইড"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Indicators (Dots) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`transition-all cursor-pointer rounded-full ${
                activeSlide === idx 
                  ? 'w-8 h-2.5 bg-amber-400 shadow-md' 
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. CATEGORY QUICK JUMP PILLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          
          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_grocery' })}
            className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-amber-50/60 border border-amber-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center space-x-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <ShoppingBasket className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-700">ঘরের বাজার</h3>
              <p className="text-[11px] font-semibold text-slate-500">চাল, তেল, ঘি ও মসলা</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_bakery' })}
            className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-amber-50/60 border border-amber-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center space-x-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-6 h-6 text-orange-700" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-700">বেকারি আইটেম</h3>
              <p className="text-[11px] font-semibold text-slate-500">কুকিজ, কেক ও বিস্কুট</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_baby_food' })}
            className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-sky-50/60 border border-sky-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center space-x-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Baby className="w-6 h-6 text-sky-700" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-sky-700">শিশু খাদ্য</h3>
              <p className="text-[11px] font-semibold text-slate-500">সেরেল্যাক, ওটস ও দুধ</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_attar' })}
            className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-amber-50/60 border border-amber-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center space-x-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-700">আতর ও সুগন্ধি</h3>
              <p className="text-[11px] font-semibold text-slate-500">খাঁটি উদ ও পারফিউম</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_gifts' })}
            className="p-4 sm:p-5 rounded-2xl bg-white hover:bg-amber-50/60 border border-amber-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center space-x-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-700">গিফট সামগ্রী</h3>
              <p className="text-[11px] font-semibold text-slate-500">উপহার ও স্পেশাল কম্বো</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FLASH DEALS & MEGA DISCOUNT OFFERS */}
      {flashDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-amber-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-rose-500 text-white rounded-lg animate-bounce">
                  <Flame className="w-4 h-4" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {siteSettings?.deals_title || 'হট ফ্ল্যাশ ডিল • বিশেষ ছাড়ের পণ্য'}
                </h2>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {siteSettings?.deals_subtitle || 'সীমিত সময়ের জন্য বিশেষ মূল্যে পছন্দের ফ্রেশ আইটেম ও গিফট অর্ডার করুন'}
              </p>
            </div>

            <button
              onClick={() => onNavigate('catalog')}
              className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>সব ডিল দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {flashDeals.slice(0, 4).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                onSelect={(id) => onNavigate('product-details', { productId: id })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. ALL PRODUCTS CATALOG FILTER (সব পণ্যের সমাহার - বিশেষ ডিলের পরেই) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">সব পণ্যের সমাহার</h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">আপনার পছন্দের ক্যাটাগরি ফিল্টার করে ব্রাউজ করুন</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedCat === 'all'
                  ? 'bg-amber-600 text-slate-950 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              সব পণ্য ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-amber-600 text-slate-950 shadow-md font-black'
                    : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              onSelect={(id) => onNavigate('product-details', { productId: id })}
            />
          ))}
        </div>
      </section>

      {/* 5. GHOREY BAJAR (GROCERY & DAILY ESSENTIALS) */}
      {groceryItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 border-b border-amber-200">
            <div className="flex items-center space-x-2">
              <ShoppingBasket className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">ঘরের বাজার (নিত্যপ্রয়োজনীয় গ্রোসারি)</h2>
            </div>
            <button
              onClick={() => onNavigate('catalog', { category: 'cat_grocery' })}
              className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>আরও দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {groceryItems.slice(0, 4).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                onSelect={(id) => onNavigate('product-details', { productId: id })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. BAKERY & SNACKS */}
      {bakeryItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 border-b border-amber-200">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">ফ্রেশ বেকারি ও স্ন্যাক্স</h2>
            </div>
            <button
              onClick={() => onNavigate('catalog', { category: 'cat_bakery' })}
              className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>আরও দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {bakeryItems.slice(0, 4).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                onSelect={(id) => onNavigate('product-details', { productId: id })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. BABY FOOD (শিশু খাদ্য ও পুষ্টিকর খাবার) */}
      {babyFoodItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pb-4 border-b border-sky-200">
            <div className="flex items-center space-x-2">
              <Baby className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">শিশু খাদ্য ও পুষ্টিকর খাবার</h2>
            </div>
            <button
              onClick={() => onNavigate('catalog', { category: 'cat_baby_food' })}
              className="text-xs font-black text-sky-700 hover:text-sky-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>আরও দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {babyFoodItems.slice(0, 4).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                onSelect={(id) => onNavigate('product-details', { productId: id })}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. ATTAR & GIFTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-amber-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">আতর ও রাজকীয় উপহার কালেকশন</h2>
          </div>
          <button
            onClick={() => onNavigate('catalog', { category: 'cat_attar' })}
            className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {(attarItems.length > 0 ? attarItems : products).slice(0, 4).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              onSelect={(id) => onNavigate('product-details', { productId: id })}
            />
          ))}
        </div>
      </section>

      {/* 8. 4 TRUST BADGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 bg-white rounded-3xl border border-amber-200/90 shadow-sm">
          <div className="flex items-center space-x-4 p-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-black">
              <ShieldCheck className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">{siteSettings?.badge_1_title || '১০০% খাঁটি ও নির্ভেজাল'}</h4>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{siteSettings?.badge_1_desc || 'উন্নত মানের গ্যারান্টি'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-black">
              <Truck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">{siteSettings?.badge_2_title || 'দ্রুততম হোম ডেলিভারি'}</h4>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{siteSettings?.badge_2_desc || 'সারাদেশে হোম ডেলিভারি'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-black">
              <HandHeart className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">{siteSettings?.badge_3_title || 'বিনা সুদে করযে হাসানা'}</h4>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{siteSettings?.badge_3_desc || '১০% তাৎক্ষণিক হালাল ধার'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-black">
              <CreditCard className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">{siteSettings?.badge_4_title || 'ভিআইপি ক্যাশব্যাক পয়েন্ট'}</h4>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{siteSettings?.badge_4_desc || 'প্রতি কেনাকাটায় রিওয়ার্ড'}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
