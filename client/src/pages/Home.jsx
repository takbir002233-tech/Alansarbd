import React, { useState, useEffect } from 'react';
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
  HandHeart
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Home({ onNavigate }) {
  const { siteSettings } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');

  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
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
  const filteredProducts = selectedCat === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCat);

  return (
    <div className="space-y-16 pb-20 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* LUXURY HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white shadow-2xl border border-amber-900/40 animate-in fade-in duration-500">
        {/* Golden glow ambient effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{siteSettings?.hero_badge || 'আল আনসার • প্রিমিয়াম পারফিউম ও রাজকীয় উপহার কালেকশন'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              {siteSettings?.hero_title || 'প্রতিটি ফোঁটায় আভিজাত্য, প্রতিটি উপহারে চিরস্মরণীয় স্মৃতি।'}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              {siteSettings?.hero_subtitle || 'ফ্রান্স ও ওরিয়েন্টাল পারফিউম, অ্যালকোহলমুক্ত খাঁটি কম্বোডিয়ান উদ এবং প্রিয়জনের জন্য আকর্ষণীয় গিফট বক্স। সারাদেশে লাইভ কুরিয়ার ট্র্যাকিং সহ দ্রুততম হোম ডেলিভারি।'}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-600/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <span>সব সুগন্ধি কালেকশন দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('qard-hasana')}
                className="px-6 py-4 bg-emerald-900/90 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-2xl border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <HandHeart className="w-4 h-4 text-amber-300" />
                <span>করযে হাসানা (১০% ধার)</span>
              </button>

              <button
                onClick={() => onNavigate('catalog', { freeDelivery: true })}
                className="px-5 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition-all flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>ফ্রি ডেলিভারি আইটেম</span>
              </button>
            </div>

            {/* Quick 3 Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs">
              <div>
                <p className="text-xl font-black text-amber-300">{siteSettings?.hero_metric_1_val || '১০০% খাঁটি'}</p>
                <p className="text-slate-400">{siteSettings?.hero_metric_1_label || 'অ্যালকোহলমুক্ত আতর'}</p>
              </div>
              <div>
                <p className="text-xl font-black text-emerald-400">{siteSettings?.hero_metric_2_val || '১৬+ ঘণ্টা'}</p>
                <p className="text-slate-400">{siteSettings?.hero_metric_2_label || 'স্থায়িত্ব ও লংজিভিটি'}</p>
              </div>
              <div>
                <p className="text-xl font-black text-amber-400">{siteSettings?.hero_metric_3_val || 'স্টিভফাস্ট/রেডএক্স'}</p>
                <p className="text-slate-400">{siteSettings?.hero_metric_3_label || 'লাইভ কুরিয়ার ট্র্যাক'}</p>
              </div>
            </div>
          </div>

          {/* Right Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-amber-900/40 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 flex items-center">
                  <Flame className="w-3.5 h-3.5 mr-1 text-amber-400" /> সিগনেচার রয়্যাল উদ
                </span>
                <span className="text-xs font-bold text-emerald-400">সাশ্রয় ৳৯০০ (২০% ছাড়)</span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-slate-800 aspect-square relative group">
                <img
                  src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80"
                  alt="AL ANSAR Royal Oud"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">আল আনসার রয়্যাল ক্রাউন উদ (১০০ মিলি)</h3>
                <p className="text-xs text-slate-400 mt-1">আসল কম্বোডিয়ান আগরউড, বার্গামট ও রাজকীয় অ্যাম্বার</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <span className="text-xl font-black text-amber-300">৳৩,৬০০</span>
                  <span className="text-xs text-slate-500 line-through ml-2">৳৪,৫০০</span>
                </div>
                <button
                  onClick={() => onNavigate('product-details', { productId: 'prd_1' })}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
                >
                  এখনই অর্ডার করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY EXPLORATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-600">মনোনীত কালেকশন</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">ক্যাটাগরি অনুযায়ী সুগন্ধি কিনুন</h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>সব কালেকশন দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog', { category: cat.id })}
              className="group bg-white p-5 rounded-3xl border border-amber-100/80 hover:border-amber-400 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-1"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-50/60 mb-3 relative border border-amber-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">{toBengaliDigits(cat.item_count || 10)}+ আইটেম</p>
            </div>
          ))}
        </div>
      </section>

      {/* FLASH SALE / EXCLUSIVE DISCOUNTS */}
      {flashDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                  <Flame className="w-4 h-4 fill-current animate-bounce" />
                  <span>{siteSettings?.deals_badge || 'সীমিত সময়ের সুগন্ধি অফার'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {siteSettings?.deals_title || '⚡ বিশেষ ডিসকাউন্ট ডিল'}
                </h2>
                <p className="text-xs text-amber-200 mt-1">
                  {siteSettings?.deals_subtitle || 'ভাউচার কোড ব্যবহার করে পান ২৫% পর্যন্ত বিশেষ ছাড়'}
                </p>
              </div>

              <button
                onClick={() => onNavigate('catalog')}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
              >
                সব অফার দেখুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {flashDeals.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* FREE DELIVERY HIGHLIGHT SECTION */}
      {freeDeliveryItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">🚚 ফ্রি ডেলিভারি আইটেম (৳০ ডেলিভারি চার্জ)</h2>
                <p className="text-xs text-slate-500">এই আইটেমগুলো অর্ডারে পান সম্পূর্ণ বিনামূল্যে হোম ডেলিভারি সুবিধা</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('catalog', { freeDelivery: true })}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>সব ফ্রি ডেলিভারি পণ্য</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {freeDeliveryItems.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* ALL PRODUCTS SHOWCASE WITH PILLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-600">এক্সক্লুসিভ সমাহার</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">সব পারফিউম, আতর ও উপহার সামগ্রী</h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCat === 'all'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white border border-amber-200 text-slate-700 hover:bg-amber-50'
              }`}
            >
              সবগুলো পণ্য
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                    : 'bg-white border border-amber-200 text-slate-700 hover:bg-amber-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* WHY CHOOSE AL ANSAR GUARANTEE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-amber-900/40 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              {siteSettings?.guarantee_badge || 'আল আনসার নিশ্চয়তা'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black">
              {siteSettings?.guarantee_title || 'কেন ১৫,০০০+ সুগন্ধিপ্রেমী আল আনসার পছন্দ করেন?'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {siteSettings?.guarantee_subtitle || 'আমরা বিশুদ্ধতার সাথে কখনো আপস করি না। খাঁটি উদ তেল থেকে শুরু করে রাজকীয় কাঠের গিফট বক্স প্যাকেজিং, বিকাশ/নগদ পেমেন্ট এবং বিনা সুদে করযে হাসানা সুবিধা।'}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{siteSettings?.guarantee_point_1 || '১০০% অ্যালকোহলমুক্ত খাঁটি আতর ও উদ'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{siteSettings?.guarantee_point_2 || 'স্টিভফাস্ট ও রেডএক্স লাইভ কুরিয়ার ট্র্যাকিং লিংক'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{siteSettings?.guarantee_point_3 || 'ভাউচার কোডে ইনস্ট্যান্ট ডিসকাউন্ট ও পয়েন্ট রিওয়ার্ড'}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{siteSettings?.guarantee_point_4 || 'আকর্ষণীয় রাজকীয় গিফট বক্স ও কার্ড প্যাকেজিং'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
