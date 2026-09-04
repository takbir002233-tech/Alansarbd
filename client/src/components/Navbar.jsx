import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Package, 
  LogOut, 
  Sparkles,
  Phone,
  Truck,
  Clock,
  Flame,
  Gift,
  Headphones,
  Tag,
  HandHeart,
  CreditCard,
  FileText,
  Calendar,
  Star,
  ShoppingBasket,
  UtensilsCrossed,
  Baby,
  Layers
} from 'lucide-react';

export default function Navbar({ onNavigate, currentPage, searchKeyword, setSearchKeyword }) {
  const { user, logout } = useAuth();
  const { totalItemCount, subtotal, openCart, siteSettings } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [currentDateTimeStr, setCurrentDateTimeStr] = useState('');
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Bengali digits converter helper
  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  // Live real-time clock in Bengali
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
      const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      
      const dayName = days[now.getDay()];
      const day = toBengaliDigits(now.getDate());
      const monthName = months[now.getMonth()];
      const year = toBengaliDigits(now.getFullYear());
      
      let hours = now.getHours();
      const minutes = toBengaliDigits(String(now.getMinutes()).padStart(2, '0'));
      const seconds = toBengaliDigits(String(now.getSeconds()).padStart(2, '0'));
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const hoursStr = toBengaliDigits(String(hours).padStart(2, '0'));

      setCurrentDateTimeStr(`${dayName}, ${day} ${monthName} ${year} | ${hoursStr}:${minutes}:${seconds} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load dynamic categories in priority order
  useEffect(() => {
    async function loadNavCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error fetching navbar categories:', err);
      }
    }
    loadNavCategories();
  }, []);

  // Live search debounce
  useEffect(() => {
    if (!searchKeyword || searchKeyword.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchKeyword.trim())}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.products.slice(0, 5));
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowSearchDropdown(false);
    const q = (searchKeyword || '').trim();
    if (q) {
      onNavigate('catalog', { search: q });
    } else {
      onNavigate('catalog');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-sm font-sans">
      
      {/* 1. TOP HEADER BAR: Assalamualaikum (Left) | Bismillah (Center) | Real-time Date/Time (Right) */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2 px-4 sm:px-8 border-b border-amber-900/40 flex flex-col md:flex-row items-center justify-between gap-1.5">
        
        {/* Left: Islamic Greeting */}
        <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-bold text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
          <span>✨ আসসালামু আলাইকুম! আল আনসার সুপার শপে স্বাগতম</span>
        </div>

        {/* Center: Bismillahir Rahmanir Rahim */}
        <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs sm:text-sm tracking-wide text-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse hidden sm:inline" />
          <span className="font-serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • বিসমিল্লাহির রাহমানির রাহিম</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse hidden sm:inline" />
        </div>

        {/* Right: Real-time Bengali Clock & Order Tracking */}
        <div className="flex items-center space-x-3 text-[11px] sm:text-xs font-semibold text-amber-200">
          <div className="flex items-center space-x-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>{currentDateTimeStr || 'লোড হচ্ছে...'}</span>
          </div>
          <span className="text-slate-600 hidden lg:inline">|</span>
          <button 
            onClick={() => onNavigate('track-order')} 
            className="hover:text-amber-300 transition-colors hidden lg:flex items-center text-slate-300 cursor-pointer font-bold"
          >
            <Clock className="w-3 h-3 mr-1 text-amber-400" />
            <span>অর্ডার ট্র্যাক</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN BRAND & SEARCH BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-2 lg:gap-4">
          
          {/* Brand Logo & Name: AL ANSAR SUPER SHOP */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer select-none group flex-shrink-0" 
            onClick={() => onNavigate('home')}
          >
            <img 
              src={siteSettings?.logo_url || '/logo.jpg'} 
              alt="AL ANSAR SUPER SHOP" 
              className="h-10 sm:h-12 w-10 sm:w-12 object-contain rounded-2xl shadow-md border-2 border-amber-400 group-hover:scale-105 transition-transform duration-200 bg-white" 
            />
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 leading-none">
                  {siteSettings?.store_name || 'AL ANSAR SUPER SHOP'}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-amber-700 tracking-wider block mt-0.5 font-sans">
                {siteSettings?.store_name_bn || 'আল আনসার সুপার শপ'}
              </span>
            </div>
          </div>

          {/* Universal Compact Desktop Search Bar (Fits without pushing login/register out) */}
          <div className="hidden md:flex flex-1 min-w-[170px] max-w-sm lg:max-w-md mx-2 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <input
                type="text"
                placeholder="পণ্য খুঁজুন (ঘি, মধু, তেল, আতর)..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchSubmit(e); } }}
                className="w-full pl-8 pr-18 py-2 bg-amber-50/60 hover:bg-amber-50/90 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-full border border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none font-semibold shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-2.5" />
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="absolute right-1 top-1 bottom-1 px-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 text-xs font-black rounded-full transition-all flex items-center shadow-xs cursor-pointer select-none active:scale-95"
              >
                🔍 খুঁজুন
              </button>
            </form>

            {/* Live Search Autocomplete Popup */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-amber-100 py-3 z-50 overflow-hidden animate-in fade-in">
                <div className="px-4 pb-2 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
                  পাওয়া গেছে ({searchResults.length} টি)
                </div>
                {searchResults.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      onNavigate('product-details', { productId: item.id });
                    }}
                    className="px-4 py-2.5 hover:bg-amber-50/60 flex items-center space-x-3 cursor-pointer transition-colors"
                  >
                    <img src={item.thumbnail} alt={item.title} className="w-10 h-10 object-cover rounded-lg bg-slate-100 border border-amber-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">${item.title}</p>
                      <p className="text-xs font-black text-amber-700">৳{(item.discount_price || item.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div
                  onClick={handleSearchSubmit}
                  className="px-4 pt-2 border-t border-slate-100 text-xs font-bold text-amber-800 text-center cursor-pointer hover:underline"
                >
                  "{searchKeyword}" এর সব ফলাফল দেখুন →
                </div>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
            
            {/* Dedicated Qard-e-Hasana (করযে হাসানা) Button */}
            <button
              onClick={() => onNavigate('qard-hasana')}
              className={`flex items-center px-2 py-1.5 text-xs font-black rounded-xl transition-all border shadow-xs cursor-pointer whitespace-nowrap ${
                currentPage === 'qard-hasana'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100 border-emerald-300'
              }`}
              title="বিনা সুদে ঋণ সুবিধা (করযে হাসানা)"
            >
              <HandHeart className="w-3.5 h-3.5 mr-1 text-emerald-700 flex-shrink-0" />
              <span>করযে হাসানা</span>
              <span className="ml-1 px-1 py-0.2 bg-emerald-700 text-white text-[8px] font-black rounded hidden 2xl:inline">
                ১০% ধার
              </span>
            </button>

            {/* Dedicated VIP Loyalty Credit Card Button */}
            <button
              onClick={() => user ? onNavigate('dashboard', { tab: 'overview' }) : onNavigate('login')}
              className="flex items-center px-2 py-1.5 text-xs font-black rounded-xl transition-all border shadow-xs cursor-pointer bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-600/15 text-amber-950 hover:bg-amber-100/90 border-amber-300 whitespace-nowrap"
              title="আল আনসার ভিআইপি লয়ালটি ক্রেডিট কার্ড"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1 text-amber-700 flex-shrink-0" />
              <span>ভিআইপি কার্ড</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-slate-900 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-all flex items-center group border border-amber-300 hover:border-amber-400 cursor-pointer shadow-xs whitespace-nowrap"
              title="শপিং ব্যাগ"
            >
              <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110 text-amber-700" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-md animate-pulse">
                  {toBengaliDigits(totalItemCount)}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1 pl-1.5 pr-2.5 bg-amber-50/80 hover:bg-amber-100/70 rounded-full border border-amber-300 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-emerald-800 text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-900 max-w-[80px] truncate hidden md:inline-block">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-amber-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400">লগইন একাউন্ট</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate font-mono">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('dashboard', { tab: 'overview' });
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 flex items-center transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2 text-amber-600" /> আমার প্রোফাইল ও ড্যাশবোর্ড
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('dashboard', { tab: 'orders' });
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 flex items-center transition-colors cursor-pointer"
                    >
                      <Package className="w-4 h-4 mr-2 text-amber-600" /> আমার অর্ডার ও ইনভয়েস
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('dashboard', { tab: 'overview' });
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 flex items-center transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 mr-2 text-amber-600" /> ভিআইপি লয়ালটি ক্রেডিট কার্ড
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        onNavigate('home');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center transition-colors font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> লগআউট করুন
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  লগইন
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-3 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  রেজিস্টার
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs border border-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 transition-all cursor-pointer flex-shrink-0"
              aria-label="মেনু বাটন"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-slate-950" /> : <Menu className="w-4 h-4 text-slate-950" />}
              <span>মেনু</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Always visible below brand row on mobile screens) */}
        <div className="md:hidden pb-3 pt-1">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন (যেমন: ঘি, তেল, মধু, কুকিজ, আতর)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchSubmit(e); } }}
              className="w-full pl-9 pr-22 py-2.5 bg-amber-50/70 hover:bg-amber-50 border border-amber-300 focus:border-amber-600 focus:bg-white rounded-full text-xs font-semibold placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs transition-all"
            />
            <Search className="w-4 h-4 text-amber-700 absolute left-3 top-3" />
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="absolute right-1 top-1 bottom-1 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-950 text-xs font-black rounded-full shadow-xs cursor-pointer flex items-center transition-all select-none active:scale-95"
            >
              🔍 খুঁজুন
            </button>
          </form>
        </div>

        {/* 3. SUB-MENU CATEGORY LINE (Bolder Home, Ghorer Bajar, Bakery, Attar, Gifts, Reviews, Contact) */}
        <div className="hidden md:flex items-center justify-between py-2.5 border-t border-amber-200/80 text-xs font-bold text-slate-800">
          <div className="flex items-center space-x-5 lg:space-x-7">
            
            {/* 🌟 UNIQUE BLACK HOME BUTTON ("oi ektai just") */}
            <button
              onClick={() => onNavigate('home')}
              className={`relative px-4 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-1.5 transition-all duration-300 cursor-pointer shadow-md transform hover:scale-105 active:scale-95 border ${
                currentPage === 'home'
                  ? 'bg-slate-950 text-amber-400 border-amber-400 shadow-amber-950/20 ring-2 ring-amber-400/30'
                  : 'bg-black text-amber-300 hover:text-amber-200 border-amber-500/50 hover:border-amber-400'
              }`}
              title="হোম পেজে যান"
            >
              <span className="text-amber-400 text-sm">🏠</span>
              <span className="tracking-wide">হোম</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5 shadow-sm"></span>
            </button>
            
            {/* ঘরের বাজার (Household & Daily Grocery) */}
            <button
              onClick={() => onNavigate('catalog', { category: 'cat_grocery' })}
              className="hover:text-amber-700 transition-colors flex items-center space-x-1.5 py-1 text-slate-800 font-bold cursor-pointer"
            >
              <ShoppingBasket className="w-4 h-4 text-amber-600" />
              <span>ঘরের বাজার</span>
            </button>

            {/* বেকারি আইটেম (Fresh Bakery & Sweets) */}
            <button
              onClick={() => onNavigate('catalog', { category: 'cat_bakery' })}
              className="hover:text-amber-700 transition-colors flex items-center space-x-1.5 py-1 text-slate-800 font-bold cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              <span>বেকারি আইটেম</span>
            </button>

            {/* শিশু খাদ্য (Baby & Infant Food) */}
            <button
              onClick={() => onNavigate('catalog', { category: 'cat_baby_food' })}
              className="hover:text-amber-700 transition-colors flex items-center space-x-1.5 py-1 text-slate-800 font-bold cursor-pointer"
            >
              <Baby className="w-4 h-4 text-sky-600" />
              <span>শিশু খাদ্য</span>
            </button>

            {/* আতর ও সুগন্ধি (Attar & Pure Oud) */}
            <button
              onClick={() => onNavigate('catalog', { category: 'cat_attar' })}
              className="hover:text-amber-700 transition-colors flex items-center space-x-1.5 py-1 text-slate-800 font-bold cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-600" />
              <span>আতর ও সুগন্ধি</span>
            </button>

            {/* লাক্সারি পারফিউম (Luxury Perfumes) */}
            <button
              onClick={() => onNavigate('catalog', { category: 'cat_perfumes' })}
              className="hover:text-amber-700 transition-colors flex items-center space-x-1.5 py-1 text-slate-800 font-bold cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>পারফিউম</span>
            </button>

            {/* গিফট ও স্পেশাল সামগ্রী (Gifts & Lifestyle) */}
            <button
              onClick={() => onNavigate('catalog', { category: 'cat_gifts' })}
              className="hover:text-amber-700 transition-colors flex items-center space-x-1.5 py-1 text-slate-800 font-bold cursor-pointer"
            >
              <Gift className="w-4 h-4 text-amber-600" />
              <span>গিফট সামগ্রী</span>
            </button>

            {/* সব পণ্য / ক্যাটালগ */}
            <button
              onClick={() => onNavigate('catalog')}
              className="hover:text-amber-700 transition-colors flex items-center space-x-1.5 py-1 text-amber-800 font-black cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>সব কালেকশন</span>
            </button>
          </div>

          {/* Right Sub-Bar Buttons: Reviews & Contact */}
          <div className="flex items-center space-x-4">
            
            {/* ⭐ কাস্টমার রিভিউ বাটন (Replaces terms in top bar) */}
            <button
              onClick={() => onNavigate('reviews')}
              className={`flex items-center space-x-1.5 font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                currentPage === 'reviews'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>কাস্টমার রিভিউ</span>
            </button>

            {/* 📞 যোগাযোগ (যোগাযোগ এর নিচে ইংরেজি Contact Us) */}
            <button
              onClick={() => onNavigate('contact')}
              className="flex items-center space-x-2 text-slate-800 hover:text-amber-700 transition-colors cursor-pointer bg-slate-100 hover:bg-amber-50 px-3 py-1 rounded-xl border border-slate-200"
            >
              <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div className="text-left leading-tight">
                <span className="font-bold text-xs block text-slate-900">যোগাযোগ</span>
                <span className="text-[10px] text-slate-500 font-mono block">Contact Us</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search & Complete Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-200 space-y-4 animate-in slide-in-from-top-3">
            
            {/* Search inside menu */}
            <form onSubmit={(e) => { setMobileMenuOpen(false); handleSearchSubmit(e); }} className="relative flex items-center">
              <input
                type="text"
                placeholder="পণ্য খুঁজুন (ঘরের বাজার, বেকারি, আতর, গিফট)..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setMobileMenuOpen(false); handleSearchSubmit(e); } }}
                className="w-full pl-9 pr-20 py-2.5 bg-amber-50/70 text-xs rounded-xl border border-amber-300 font-semibold focus:border-amber-600 focus:bg-white outline-none"
              />
              <Search className="w-4 h-4 text-amber-700 absolute left-3 top-3" />
              <button
                type="button"
                onClick={(e) => { setMobileMenuOpen(false); handleSearchSubmit(e); }}
                className="absolute right-1 top-1 bottom-1 px-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 text-xs font-black rounded-lg shadow-xs cursor-pointer flex items-center"
              >
                খুঁজুন
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {/* 1. Black Home Button */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
                className="p-3 bg-black text-amber-300 rounded-xl font-black text-left flex items-center justify-between border border-amber-500/50 shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span>🏠</span>
                  <span>হোম পেজ</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              </button>

              {/* 2. Ghorer Bajar */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('catalog', { category: 'cat_grocery' }); }}
                className="p-3 bg-amber-50/70 text-slate-900 border border-amber-200/80 rounded-xl text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer font-bold"
              >
                <ShoppingBasket className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span className="truncate">ঘরের বাজার</span>
              </button>

              {/* 3. Bakery */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('catalog', { category: 'cat_bakery' }); }}
                className="p-3 bg-orange-50/70 text-slate-900 border border-orange-200/80 rounded-xl text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer font-bold"
              >
                <UtensilsCrossed className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="truncate">বেকারি আইটেম</span>
              </button>

              {/* 4. Baby Food */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('catalog', { category: 'cat_baby_food' }); }}
                className="p-3 bg-sky-50 text-sky-950 border border-sky-200/80 rounded-xl text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer font-bold"
              >
                <Baby className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span className="truncate">শিশু খাদ্য</span>
              </button>

              {/* 5. Attar */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('catalog', { category: 'cat_attar' }); }}
                className="p-3 bg-amber-50/70 text-slate-900 border border-amber-200/80 rounded-xl text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer font-bold"
              >
                <Flame className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="truncate">আতর ও সুগন্ধি</span>
              </button>

              {/* 6. Perfumes */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('catalog', { category: 'cat_perfumes' }); }}
                className="p-3 bg-amber-50/70 text-slate-900 border border-amber-200/80 rounded-xl text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer font-bold"
              >
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="truncate">লাক্সারি পারফিউম</span>
              </button>

              {/* 7. Gifts */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('catalog', { category: 'cat_gifts' }); }}
                className="p-3 bg-purple-50/70 text-purple-950 border border-purple-200/80 rounded-xl text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer font-bold"
              >
                <Gift className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="truncate">গিফট সামগ্রী</span>
              </button>

              {/* 8. All Collection */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('catalog'); }}
                className="p-3 bg-amber-100 text-amber-950 border border-amber-300 rounded-xl font-black text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span className="truncate">সব কালেকশন</span>
              </button>

              {/* 9. Qard-e-Hasana */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('qard-hasana'); }}
                className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-xl font-black text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer"
              >
                <HandHeart className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="truncate">করযে হাসানা (১০%)</span>
              </button>

              {/* 10. VIP Card */}
              <button
                onClick={() => { setMobileMenuOpen(false); user ? onNavigate('dashboard', { tab: 'overview' }) : onNavigate('login'); }}
                className="p-3 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-950 border border-amber-300 rounded-xl font-black text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span className="truncate">ভিআইপি কার্ড</span>
              </button>

              {/* 11. Customer Reviews */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('reviews'); }}
                className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer font-bold"
              >
                <Star className="w-4 h-4 fill-amber-500 text-amber-500 flex-shrink-0" />
                <span className="truncate">কাস্টমার রিভিউ</span>
              </button>

              {/* 12. Track Order */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('track-order'); }}
                className="p-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-left flex items-center space-x-2 active:scale-95 transition-transform cursor-pointer font-bold"
              >
                <Truck className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <span className="truncate">অর্ডার ট্র্যাক</span>
              </button>

              {/* 13. Contact Us */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('contact'); }}
                className="col-span-2 p-3 bg-slate-100 text-slate-900 border border-slate-200 rounded-xl text-left flex items-center justify-between active:scale-95 transition-transform cursor-pointer font-bold"
              >
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>যোগাযোগ</span>
                  <span className="text-[10px] text-slate-500 font-mono">(Contact Us)</span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. ANIMATED MARQUEE NEWS TICKER (চলন্ত শিরোনাম - Contained with left & right white margins) */}
      {siteSettings?.marquee_enabled !== false && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 py-1.5 px-4 rounded-2xl overflow-hidden shadow-xs flex items-center border border-amber-400">
            <div className="animate-marquee whitespace-nowrap text-xs font-black tracking-wide flex items-center space-x-12">
              <span>{siteSettings?.marquee_text || '✨ আসসালামু আলাইকুম! আল আনসার সুপার শপে আপনাকে স্বাগতম • ভাউচার কোড ANSAR10 ব্যবহারে পান ১০% তাৎক্ষণিক ছাড় • ঘরের নিত্যপ্রয়োজনীয় বাজার, তাজা বেকারি, খাঁটি আতর ও গিফট আইটেম • ২০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি • বিনা সুদে করযে হাসানা (১০% তাৎক্ষণিক ধার) সুবিধা উপভোগ করুন ✨'}</span>
              <span>{siteSettings?.marquee_text || '✨ আসসালামু আলাইকুম! আল আনসার সুপার শপে আপনাকে স্বাগতম • ভাউচার কোড ANSAR10 ব্যবহারে পান ১০% তাৎক্ষণিক ছাড় • ঘরের নিত্যপ্রয়োজনীয় বাজার, তাজা বেকারি, খাঁটি আতর ও গিফট আইটেম • ২০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি • বিনা সুদে করযে হাসানা (১০% তাৎক্ষণিক ধার) সুবিধা উপভোগ করুন ✨'}</span>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
