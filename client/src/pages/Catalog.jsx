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
  initialFreeDelivery = false, 
  onNavigate 
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
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(initialFreeDelivery || false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSubcategory) setSelectedSubcategory(initialSubcategory);
    if (initialSearch) setSearchTerm(initialSearch);
    if (initialFreeDelivery !== undefined) setFreeDeliveryOnly(initialFreeDelivery);
  }, [initialCategory, initialSubcategory, initialSearch, initialFreeDelivery]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in font-sans">
      
      {/* Universal Back Button */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← মূল পেইজে ফিরে যান</span>
        </button>

        {freeDeliveryOnly && (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
            <Truck className="w-3.5 h-3.5 mr-1" /> শুধুমাত্র ফ্রি ডেলিভারি আইটেম দেখানো হচ্ছে
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-amber-100 gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">আল আনসার স্টোরফ্রন্ট / সুগন্ধি কালেকশন</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">পারফিউম, আতর ও লাক্সারি গিফট ক্যাটালগ</h1>
          <p className="text-xs text-slate-500 mt-0.5">{toBengaliDigits(products.length)} টি প্রিমিয়াম সুগন্ধি ও উপহার প্রদর্শিত হচ্ছে</p>
        </div>

        {/* Sort & Mobile filter */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>ফিল্টার</span>
          </button>

          <div className="flex items-center space-x-2 bg-white border border-amber-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <ArrowUpDown className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">সাজান:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:ring-0 outline-none cursor-pointer"
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

      {/* Subcategory Filter Pills */}
      {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
        <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-amber-900 flex items-center flex-shrink-0 mr-1">
            <Tag className="w-3.5 h-3.5 mr-1 text-amber-700" /> সাব-ক্যাটাগরি:
          </span>
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              selectedSubcategory === 'all'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-200'
            }`}
          >
            {activeCategoryObj.name} (সব)
          </button>
          {activeCategoryObj.subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcategory(sub.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedSubcategory === sub.id
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
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
              <label className="text-xs font-bold text-slate-700 block mb-2">সুবাস বা নাম দিয়ে খুঁজুন</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="যেমন: রয়্যাল উদ, রোজ, অ্যাম্বার..."
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
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>সব সুগন্ধি ও উপহার</span>
                  {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory('all'); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-amber-600" />}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-slate-200 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-amber-100 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">কোনো সুগন্ধি পণ্য পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার দেওয়া ফিল্টারের সাথে মিল রেখে কোনো পণ্য নেই। দয়া করে অন্য ক্যাটাগরি বা ফিল্টার পরিবর্তন করে দেখুন।
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                সব ফিল্টার মুছুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
