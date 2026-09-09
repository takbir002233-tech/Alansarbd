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

  // Default fallback photo banners if siteSettings?.hero_banners is not set
  const defaultBanners = [
    {
      id: 'banner_1',
      title: 'ঘরের নিত্যপ্রয়োজনীয় খাঁটি বাজার ও অর্গানিক পণ্য',
      badge: '🛒 ১০০% খাঁটি পণ্য',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
      link: 'cat_grocery'
    },
    {
      id: 'banner_2',
      title: 'বিনা সুদে কেনাকাটা করুন ১০% তাৎক্ষণিক করযে হাসানার সুবিধায়',
      badge: '🤝 করযে হাসানা (১০% ধার)',
      image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1400&q=80',
      link: 'qard-hasana'
    },
    {
      id: 'banner_3',
      title: 'দৈনন্দিন ফ্রেশ বেকারি আইটেম ও স্পেশাল কুকিজ কালেকশন',
      badge: '🥐 তাজা বেকারি',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=80',
      link: 'cat_bakery'
    },
    {
      id: 'banner_4',
      title: '১০০% অ্যালকোহলমুক্ত খাঁটি আতর, উদ ও লাক্সারি পারফিউম',
      badge: '✨ খাঁটি সুবাস',
      image_url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=1400&q=80',
      link: 'cat_attar'
    },
    {
      id: 'banner_5',
      title: 'সারাদেশে দ্রুততম হোম ডেলিভারি • ২০০০+ অর্ডারে ফ্রি ডেলিভারি',
      badge: '🚚 ফ্রি ডেলিভারি',
      image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1400&q=80',
      link: 'catalog'
    }
  ];

  const heroBanners = (siteSettings?.hero_banners && siteSettings.hero_banners.length > 0)
    ? siteSettings.hero_banners.filter(b => b.active !== false && b.image_url)
    : defaultBanners;

  const displayBanners = heroBanners.length > 0 ? heroBanners : defaultBanners;

  // Auto slide timer
  useEffect(() => {
    if (sliderPaused || displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderPaused, displayBanners.length]);

  const handleBannerClick = (link) => {
    if (!link) {
      onNavigate('catalog');
      return;
    }
    if (link === 'qard-hasana' || link === '/qard-hasana') {
      onNavigate('qard-hasana');
    } else if (link === 'terms' || link === '/terms') {
      onNavigate('terms');
    } else if (link.startsWith('cat_')) {
      onNavigate('catalog', { category: link });
    } else if (link.includes('category=')) {
      const catId = link.split('category=')[1].split('&')[0];
      onNavigate('catalog', { category: catId });
    } else if (link === 'catalog' || link === '/catalog') {
      onNavigate('catalog');
    } else if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank');
    } else {
      onNavigate(link);
    }
  };

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
    <div className="space-y-8 pb-16 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* 🌟 DEDICATED SEARCH RESULTS SECTION (Visible on Home when user searches) */}
      {hasActiveSearch && (
        <section className="w-full px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in pt-4">
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
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-3.5">
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

      {/* 1. COMPACT PHOTO HERO BANNER SLIDER (Admin CMS Managed - Centered & Slim Height) */}
      <section 
        className={`w-full max-w-5xl mx-auto px-3 sm:px-4 pt-1 sm:pt-2 pb-1 select-none flex justify-center ${hasActiveSearch ? 'hidden' : ''}`}
        onMouseEnter={() => setSliderPaused(true)}
        onMouseLeave={() => setSliderPaused(false)}
      >
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-amber-300/70 bg-slate-950 h-32 sm:h-40 md:h-48 lg:h-52 group">
          {/* Slides Track */}
          <div 
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {displayBanners.map((slide, idx) => (
              <div 
                key={slide.id || idx}
                onClick={() => handleBannerClick(slide.link)}
                className="w-full h-full flex-shrink-0 relative cursor-pointer overflow-hidden group/slide"
              >
                {/* Banner Photo */}
                <img 
                  src={slide.image_url} 
                  alt={slide.title || 'Al Ansar Banner'} 
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover/slide:scale-102"
                  loading={idx === 0 ? "eager" : "lazy"}
                />

                {/* Aesthetic subtle bottom dark gradient overlay for caption & badge (Centered) */}
                {(slide.title || slide.badge) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent flex items-end justify-center text-center p-2.5 sm:p-4 pb-3 sm:pb-3.5 pointer-events-none">
                    <div className="space-y-1 max-w-xl mx-auto text-center">
                      {slide.badge && (
                        <span className="inline-flex items-center mx-auto space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
                          <Sparkles className="w-3 h-3 text-slate-950 mr-1" />
                          <span>{slide.badge}</span>
                        </span>
                      )}
                      {slide.title && (
                        <h2 className="text-white text-xs sm:text-sm md:text-base font-black drop-shadow-md line-clamp-1 leading-tight text-center">
                          {slide.title}
                        </h2>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Previous Slide Button */}
          {displayBanners.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(prev => (prev - 1 + displayBanners.length) % displayBanners.length);
              }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-950/60 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-80 hover:opacity-100 shadow-md cursor-pointer z-20"
              title="পূর্ববর্তী ব্যানার"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Next Slide Button */}
          {displayBanners.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(prev => (prev + 1) % displayBanners.length);
              }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-950/60 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-80 hover:opacity-100 shadow-md cursor-pointer z-20"
              title="পরবর্তী ব্যানার"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Carousel Indicators (Dots) */}
          {displayBanners.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20">
              {displayBanners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlide(idx);
                  }}
                  className={`transition-all cursor-pointer rounded-full ${
                    activeSlide === idx 
                      ? 'w-6 sm:w-7 h-1.5 sm:h-2 bg-amber-400 shadow-md' 
                      : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/90'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. CATEGORY QUICK JUMP PILLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          
          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_grocery' })}
            className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-amber-50/70 border-2 border-slate-200/90 hover:border-amber-500 hover:ring-2 hover:ring-amber-400/80 active:border-amber-600 active:ring-3 active:ring-amber-500 shadow-xs hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer flex items-center space-x-2.5 sm:space-x-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black group-hover:scale-105 transition-transform duration-150 flex-shrink-0">
              <ShoppingBasket className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-700 truncate">ঘরের বাজার</h3>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">চাল, তেল, ঘি ও মসলা</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_bakery' })}
            className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-amber-50/70 border-2 border-slate-200/90 hover:border-amber-500 hover:ring-2 hover:ring-amber-400/80 active:border-amber-600 active:ring-3 active:ring-amber-500 shadow-xs hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer flex items-center space-x-2.5 sm:space-x-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-black group-hover:scale-105 transition-transform duration-150 flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-orange-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-700 truncate">বেকারি আইটেম</h3>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">কুকিজ, কেক ও বিস্কুট</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_baby_food' })}
            className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-sky-50/70 border-2 border-slate-200/90 hover:border-amber-500 hover:ring-2 hover:ring-amber-400/80 active:border-amber-600 active:ring-3 active:ring-amber-500 shadow-xs hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer flex items-center space-x-2.5 sm:space-x-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black group-hover:scale-105 transition-transform duration-150 flex-shrink-0">
              <Baby className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-sky-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-sky-700 truncate">শিশু খাদ্য</h3>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">সেরেল্যাক, ওটস ও দুধ</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_attar' })}
            className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-amber-50/70 border-2 border-slate-200/90 hover:border-amber-500 hover:ring-2 hover:ring-amber-400/80 active:border-amber-600 active:ring-3 active:ring-amber-500 shadow-xs hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer flex items-center space-x-2.5 sm:space-x-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black group-hover:scale-105 transition-transform duration-150 flex-shrink-0">
              <Flame className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-700 truncate">আতর ও সুগন্ধি</h3>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">খাঁটি উদ ও পারফিউম</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('catalog', { category: 'cat_gifts' })}
            className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-purple-50/70 border-2 border-slate-200/90 hover:border-amber-500 hover:ring-2 hover:ring-amber-400/80 active:border-amber-600 active:ring-3 active:ring-amber-500 shadow-xs hover:shadow-lg active:scale-95 transition-all duration-150 cursor-pointer flex items-center space-x-2.5 sm:space-x-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black group-hover:scale-105 transition-transform duration-150 flex-shrink-0">
              <Gift className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-purple-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-amber-700 truncate">গিফট সামগ্রী</h3>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 truncate">উপহার ও স্পেশাল কম্বো</p>
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

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-3.5 mt-5">
            {flashDeals.slice(0, 5).map(product => (
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                selectedCat === 'all'
                  ? 'bg-amber-600 text-slate-950 font-black border-amber-600 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border-amber-200'
              }`}
            >
              সব পণ্য ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedCat === cat.id
                    ? 'bg-amber-600 text-slate-950 font-black border-amber-600 shadow-md'
                    : 'bg-white text-slate-700 hover:bg-amber-50 border-amber-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-3.5">
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

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-3.5 mt-5">
            {groceryItems.slice(0, 5).map(product => (
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

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-3.5 mt-5">
            {bakeryItems.slice(0, 5).map(product => (
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

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-3.5 mt-5">
            {babyFoodItems.slice(0, 5).map(product => (
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

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2.5 md:gap-3.5 mt-5">
          {(attarItems.length > 0 ? attarItems : products).slice(0, 5).map(product => (
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
