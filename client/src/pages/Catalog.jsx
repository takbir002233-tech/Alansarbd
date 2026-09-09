import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import useScrollLock from '../hooks/useScrollLock';
import { 
  Filter, 
  SlidersHorizontal, 
  Search, 
  Check, 
  ArrowUpDown,
  ShoppingBag, 
  Sparkles, 
  ArrowLeft, 
  Truck, 
  Tag,
  X,
  RotateCcw
} from 'lucide-react';

export default function Catalog({ 
  initialCategory = null, 
  initialSubcategory = null, 
  initialSearch = '', 
  searchQuery = '',
  initialFreeDelivery = false, 
  onNavigate, 
  onBack 
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bengali digits converter helper
  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory || 'all');
  const [searchTerm, setSearchTerm] = useState(initialSearch || searchQuery || '');
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(initialFreeDelivery || false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Lock body scroll when mobile filter modal is open
  useScrollLock(mobileFilterOpen);

  useEffect(() => {
    if (initialSearch && initialSearch.trim()) {
      setSelectedCategory('all');
      setSelectedSubcategory('all');
    } else if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    if (initialSubcategory) setSelectedSubcategory(initialSubcategory);
    const searchVal = initialSearch !== undefined ? initialSearch : (searchQuery || '');
    setSearchTerm(searchVal);
    if (initialFreeDelivery !== undefined) setFreeDeliveryOnly(initialFreeDelivery);
  }, [initialCategory, initialSubcategory, initialSearch, searchQuery, initialFreeDelivery]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let url = `/api/products?`;
        if (selectedCategory && selectedCategory !== 'all') url += `category=${selectedCategory}&`;
        if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
        if (freeDeliveryOnly) url += `free_delivery=true&`;
        if (sortBy) {
          if (sortBy === 'low_high') url += `sort=price_asc&`;
          else if (sortBy === 'high_low') url += `sort=price_desc&`;
          else if (sortBy === 'newest') url += `sort=newest&`;
          else if (sortBy === 'rating') url += `sort=rating&`;
        }
        if (inStockOnly) url += `in_stock=true&`;
        if (priceRange.min) url += `min_price=${priceRange.min}&`;
        if (priceRange.max) url += `max_price=${priceRange.max}&`;

        const [prodRes, catRes] = await Promise.all([
          fetch(url),
          fetch('/api/categories')
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        let prods = prodData.products || [];
        if (selectedSubcategory && selectedSubcategory !== 'all') {
          prods = prods.filter(p => p.subcategory_id === selectedSubcategory);
        }

        if (prodData.success) setProducts(prods);
        if (catData.success) setCategories(catData.categories);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedCategory, selectedSubcategory, searchTerm, sortBy, inStockOnly, freeDeliveryOnly, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSearchTerm('');
    setSortBy('featured');
    setInStockOnly(false);
    setFreeDeliveryOnly(false);
    setPriceRange({ min: '', max: '' });
  };

  const activeCategoryObj = categories.find(c => c.id === selectedCategory);
  const hasActiveFilters = selectedCategory !== 'all' || selectedSubcategory !== 'all' || searchTerm || inStockOnly || freeDeliveryOnly || priceRange.min || priceRange.max;

  return (
    <div className="w-full font-sans animate-in fade-in">
      
      {/* 1. SLIM CONSTANT STICKY CATEGORY & FILTER HEADER:
          - Reduced height, low-profile and sleek ("bar ta ache otar height ta arektu choto kore deo")
          - Touching moving bar with 0 gap ("moving tar sathe lege jabe")
          - Left: Back button
          - Center: Grand Animated Category Title
          - Right: Vertical compact filter box in place of 'সাজান'
      */}
      <div 
        className="sticky z-40 w-full bg-gradient-to-r from-[#031d16] via-[#062c21] to-[#031d16] text-white border-b-2 border-amber-500/80 shadow-md px-2 sm:px-4 md:px-6 py-1 flex flex-wrap items-center justify-between gap-1.5 backdrop-blur-md"
        style={{ top: 'var(--navbar-height, 160px)' }}
      >
        {/* Left: Back Button (← পিছনে যান) */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <button
            onClick={onBack || (() => onNavigate('home'))}
            className="inline-flex items-center space-x-1 text-[11px] sm:text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-amber-300 transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
            title="পিছনে যান"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-950 flex-shrink-0" />
            <span className="hidden sm:inline">← পিছনে যান</span>
            <span className="sm:hidden">← Back</span>
          </button>
        </div>

        {/* Center: GRAND ANIMATED CATEGORY TITLE (Slim Profile) */}
        <div 
          key={selectedCategory + (searchTerm || '')} 
          className="text-center flex-1 min-w-[130px] px-1 flex flex-col items-center justify-center animate-category-grand"
        >
          <div className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-0.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-300/30 to-amber-500/20 border border-amber-400/80 animate-aura-pulse shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow flex-shrink-0" />
            <span className="text-amber-400 text-[10px] sm:text-xs font-black select-none">✦</span>
            <h1 className="text-xs sm:text-sm md:text-base font-black animate-gold-gleam leading-tight tracking-tight drop-shadow-md truncate max-w-[130px] sm:max-w-xs md:max-w-sm">
              {searchTerm ? `"${searchTerm}"` : activeCategoryObj ? activeCategoryObj.name : 'সকল কালেকশন'}
            </h1>
            <span className="text-amber-400 text-[10px] sm:text-xs font-black select-none">✦</span>
            <Sparkles className="w-3 h-3 text-amber-300 animate-spin-reverse-slow flex-shrink-0" />
          </div>
          <p className="text-[8.5px] sm:text-[9.5px] text-amber-200/90 font-bold mt-0.5 truncate flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>মোট {toBengaliDigits(products.length)} টি পণ্য</span>
          </p>
        </div>

        {/* Right: 🌟 SLIM VERTICAL COMPACT FILTER BOX IN PLACE OF "সাজান"
            ("diye sajan er jaygay deo kintu obossoi vertically sob kichui jeno filter er okhane sajan er oi jaygatay thake choto kore holeo")
        */}
        <div className="flex-shrink-0">
          <div className="flex flex-col space-y-0.5 bg-[#04241b] border border-amber-400/80 rounded-xl p-1 sm:p-1.5 shadow-md w-[155px] sm:w-[185px] md:w-[205px] text-white">
            
            {/* 1. Vertical Row 1: Search Input + Reset Button */}
            <div className="flex items-center space-x-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-5 pr-1 py-0.5 bg-white text-slate-900 text-[9px] sm:text-[10px] rounded border border-amber-300 focus:outline-none focus:border-amber-500 font-semibold h-5 shadow-2xs"
                />
                <Search className="w-2.5 h-2.5 text-slate-400 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[8.5px] font-black text-rose-300 bg-rose-950/90 hover:bg-rose-900 px-1 py-0.5 rounded border border-rose-500/50 cursor-pointer flex items-center space-x-0.5 h-5 flex-shrink-0"
                  title="রিসেট"
                >
                  <RotateCcw className="w-2 h-2" />
                  <span>রিসেট</span>
                </button>
              )}
            </div>

            {/* 2. Vertical Row 2: Sort Dropdown (সাজান) */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-1 py-0.5 bg-white text-slate-900 text-[9px] sm:text-[10px] font-bold rounded border border-amber-300 focus:outline-none focus:border-amber-500 cursor-pointer h-5 shadow-2xs"
              >
                <option value="featured">সাজান: জনপ্রিয় / রয়্যাল</option>
                <option value="low_high">সাজান: মূল্য (কম থেকে বেশি)</option>
                <option value="high_low">সাজান: মূল্য (বেশি থেকে কম)</option>
                <option value="rating">সাজান: সেরা রেটিংপ্রাপ্ত</option>
                <option value="newest">সাজান: নতুন সংযোজন</option>
              </select>
            </div>

            {/* 3. Vertical Row 3: In Stock & Free Delivery Checkboxes */}
            <div className="flex items-center justify-between text-[8.5px] sm:text-[9px] font-bold text-amber-200">
              <label className="flex items-center space-x-1 cursor-pointer hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-2.5 h-2.5 rounded text-amber-500 focus:ring-amber-400 border-amber-400/50 cursor-pointer"
                />
                <span>স্টকে থাকা</span>
              </label>

              <label className="flex items-center space-x-0.5 cursor-pointer text-emerald-300 hover:text-emerald-200 select-none">
                <input
                  type="checkbox"
                  checked={freeDeliveryOnly}
                  onChange={(e) => setFreeDeliveryOnly(e.target.checked)}
                  className="w-2.5 h-2.5 rounded text-emerald-500 focus:ring-emerald-400 border-emerald-400/50 cursor-pointer"
                />
                <span className="flex items-center">
                  <Truck className="w-2.5 h-2.5 mr-0.5" /> ফ্রি ডেলিভারি
                </span>
              </label>
            </div>

          </div>
        </div>
      </div>

      {/* 2. MAIN BODY AREA:
          - Subcategory Pills (if available)
          - 5 COMPACT PRODUCTS IN EVERY ROW ("ar product er height tao ei page er shudhu, ar niche 5 ta kore product deo")
      */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 space-y-2">
        
        {/* Subcategories Selector (if any) */}
        {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
          <div className="py-1 px-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10.5px] font-bold text-amber-900 flex items-center flex-shrink-0 mr-1">
              <Tag className="w-3 h-3 mr-1 text-amber-700" /> সাব-ক্যাটাগরি:
            </span>
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap border ${
                selectedSubcategory === 'all'
                  ? 'bg-amber-600 text-slate-950 font-black border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-amber-100 hover:text-amber-900 border-amber-200'
              }`}
            >
              {activeCategoryObj.name} (সব)
            </button>
            {activeCategoryObj.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  selectedSubcategory === sub.id
                    ? 'bg-amber-600 text-slate-950 font-black border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-100 hover:text-amber-900 border-amber-200'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* 🌟 3. CLEAN FULL-WIDTH 5-PRODUCT ROW GRID WITH COMPACT PRODUCT CARD HEIGHT
            ("ar product er height tao ei page er shudhu, ar niche 5 ta kore product deo")
        */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-56 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-amber-200 text-center space-y-3 flex flex-col items-center justify-center min-h-[260px]">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              {searchTerm ? `"${searchTerm}" এর সাথে মিল রেখে কোনো পণ্য পাওয়া যায়নি।` : 'আপনার ফিল্টারের সাথে মিল রেখে কোনো পণ্য নেই।'}
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-slate-950 text-xs font-black rounded-xl shadow-xs cursor-pointer"
            >
              সব ফিল্টার মুছুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3 items-stretch">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                compact={true}
                onNavigate={onNavigate}
                onSelect={(id) => onNavigate('product-details', { productId: id })}
              />
            ))}
          </div>
        )}

        {/* Bottom Navigation & Scroll to top */}
        <div className="pt-3 pb-2 flex items-center justify-between border-t border-amber-200/80 mt-3">
          <button
            onClick={onBack || (() => onNavigate('home'))}
            className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-1.5 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
            title="পিছনে যান"
          >
            <ArrowLeft className="w-4 h-4 text-amber-800" />
            <span>← পিছনে যান (Back)</span>
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer flex items-center space-x-1"
          >
            <span>↑ উপরে যান</span>
          </button>
        </div>

      </div>

    </div>
  );
}
