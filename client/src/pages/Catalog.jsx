import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
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
  Tag
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 space-y-3 animate-in fade-in font-sans">
      
      {/* Top Aligned Bar: [ Left: Back Button ] | [ Center: Title & Details ] | [ Right: Sort & Filter ] */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 pb-2 border-b border-amber-200/80">
        {/* Left: Back Button (ফিরে যান) */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onBack || (() => onNavigate('home'))}
            className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
            title="পিছনে যান"
          >
            <ArrowLeft className="w-4 h-4 text-amber-800" />
            <span>← পিছনে যান (Back)</span>
          </button>

          {freeDeliveryOnly && (
            <span className="hidden lg:flex bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full items-center">
              <Truck className="w-3 h-3 mr-1" /> ফ্রি ডেলিভারি
            </span>
          )}
        </div>

        {/* Center: Catalog Name & Details (একদম সোজা লাইনে মাঝে) */}
        <div className="text-center flex-1 min-w-0 px-1 sm:px-2">
          <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-tight truncate">
            {searchTerm ? `"${searchTerm}" এর ফলাফল` : activeCategoryObj ? activeCategoryObj.name : 'সকল পণ্যের সমাহার'}
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5 truncate">
            {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0
              ? `${activeCategoryObj.subcategories.map(s => s.name).slice(0, 3).join(', ')} • ${toBengaliDigits(products.length)} টি পণ্য`
              : `${toBengaliDigits(products.length)} টি পণ্য প্রদর্শিত হচ্ছে`}
          </p>
        </div>

        {/* Right: Sort Dropdown & Filter Toggle (সমান ডান পাশে সাজান) */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer border border-amber-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ফিল্টার</span>
          </button>

          <div className="flex items-center space-x-1.5 bg-white border border-amber-200 rounded-xl px-2.5 py-1 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">সাজান:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:ring-0 outline-none cursor-pointer py-0.5"
            >
              <option value="featured">জনপ্রিয় / রয়্যাল সিলেক্ট</option>
              <option value="low_high">মূল্য: কম থেকে বেশি</option>
              <option value="high_low">মূল্য: বেশি থেকে কম</option>
              <option value="rating">সর্বোচ্চ রেটিংপ্রাপ্ত</option>
              <option value="newest">নতুন সংযোজন</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subcategory Filter Pills (ছোট আকারে ও খুব কম দূরত্বে) */}
      {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
        <div className="py-1.5 px-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-amber-900 flex items-center flex-shrink-0 mr-1">
            <Tag className="w-3 h-3 mr-1 text-amber-700" /> সাব-ক্যাটাগরি:
          </span>
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap border ${
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
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap border ${
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 sm:gap-6 pt-1">
        
        {/* Sidebar Filters */}
        <div className={`space-y-6 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-2xs space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center">
                <Filter className="w-4 h-4 mr-2 text-amber-600" /> ফিল্টার সমূহ
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  সব রিসেট করুন
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">পণ্য বা ক্যাটাগরি দিয়ে খুঁজুন</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="যেমন: ঘি, মধু, তেল, কুকিজ, আতর..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Free Delivery Filter Checkbox */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-emerald-900">
                <input
                  type="checkbox"
                  checked={freeDeliveryOnly}
                  onChange={(e) => setFreeDeliveryOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300"
                />
                <span className="flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> শুধুমাত্র ফ্রি ডেলিভারি আইটেম
                </span>
              </label>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">মূল ক্যাটাগরি</label>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center justify-between cursor-pointer border ${
                    selectedCategory === 'all'
                      ? 'animate-menu-cat-active font-black shadow-xs'
                      : 'text-slate-700 bg-white hover:bg-amber-50/70 border-amber-200/50 hover:border-amber-300'
                  }`}
                >
                  <span>সব পণ্য (সকল ক্যাটাগরি)</span>
                  {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-slate-950 font-black" />}
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory('all'); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center justify-between cursor-pointer border ${
                      selectedCategory === cat.id
                        ? 'animate-menu-cat-active font-black shadow-xs'
                        : 'text-slate-700 bg-white hover:bg-amber-50/70 border-amber-200/50 hover:border-amber-300'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-slate-950 font-black" />}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span>শুধুমাত্র স্টকে থাকা পণ্য</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-amber-100 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm ? `"${searchTerm}" এর সাথে মিল রেখে কোনো পণ্য পাওয়া যায়নি।` : 'আপনার ফিল্টারের সাথে মিল রেখে কোনো পণ্য নেই।'} দয়া করে অন্য কোনো নাম দিয়ে চেষ্টা করুন।
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                সব ফিল্টার মুছুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3.5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}

          {/* Bottom Back Button (উপরে ও নিচে একই ব্যাক বাটন) */}
          <div className="pt-6 pb-2 flex items-center justify-between border-t border-amber-200/80 mt-6">
            <button
              onClick={onBack || (() => onNavigate('home'))}
              className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
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
    </div>
  );
}
