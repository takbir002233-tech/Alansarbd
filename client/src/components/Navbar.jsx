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
  ShieldCheck,
  Calendar
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
    return str.toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
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
    e.preventDefault();
    setShowSearchDropdown(false);
    onNavigate('catalog', { search: searchKeyword });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs font-sans">
      
      {/* Top Header: Islamic Greeting & Real-time Live Bengali Date & Time */}
      <div className="bg-slate-950 text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-1">
        
        {/* Islamic Greeting & Welcome */}
        <div className="flex items-center space-x-2 text-amber-300 font-bold text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>✨ আসসালামু আলাইকুম! আল আনসার-এ আপনাকে স্বাগতম</span>
        </div>

        {/* Live Real-time Clock in Bengali */}
        <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-medium text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-amber-200/90">{currentDateTimeStr || 'লোড হচ্ছে...'}</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <button 
            onClick={() => onNavigate('track-order')} 
            className="hover:text-amber-300 transition-colors hidden md:flex items-center text-slate-300"
          >
            <Clock className="w-3 h-3 mr-1 text-amber-400" />
            <span>অর্ডার ট্র্যাক</span>
          </button>
        </div>
      </div>

      {/* Animated Marquee News Ticker (চলন্ত শিরোনাম) */}
      {siteSettings?.marquee_enabled !== false && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 py-1 overflow-hidden shadow-inner flex items-center border-b border-amber-500/40">
          <div className="animate-marquee whitespace-nowrap text-xs font-black tracking-wide flex items-center space-x-8">
            <span>{siteSettings?.marquee_text || '✨ আসসালামু আলাইকুম! আল আনসার-এ আপনাকে স্বাগতম • ভাউচার কোড ANSAR10 ব্যবহারে পান ১০% তাৎক্ষণিক ছাড় • ২০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি • বিনা সুদে করযে হাসানা (১০% তাৎক্ষণিক ধার) সুবিধা উপভোগ করুন ✨'}</span>
            <span>{siteSettings?.marquee_text || '✨ আসসালামু আলাইকুম! আল আনসার-এ আপনাকে স্বাগতম • ভাউচার কোড ANSAR10 ব্যবহারে পান ১০% তাৎক্ষণিক ছাড় • ২০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি • বিনা সুদে করযে হাসানা (১০% তাৎক্ষণিক ধার) সুবিধা উপভোগ করুন ✨'}</span>
          </div>
        </div>
      )}

      {/* Main Brand & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-22 gap-4">
          
          {/* Brand Logo (AL ANSAR - Larger & Clear, No extra fragrance subtext) */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer select-none group" 
            onClick={() => onNavigate('home')}
          >
            <img 
              src={siteSettings?.logo_url || '/logo.jpg'} 
              alt="AL ANSAR" 
              className="h-14 sm:h-16 w-14 sm:w-16 object-contain rounded-2xl shadow-md border-2 border-amber-300 group-hover:scale-105 transition-transform duration-200 bg-white" 
            />
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-none">
                  AL ANSAR
                </span>
              </div>
              <span className="text-xs font-bold text-amber-700 tracking-wider block mt-1">
                আল আনসার
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="পারফিউম, খাঁটি আতর, উদ, গিফট বক্স খুঁজুন..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                className="w-full pl-11 pr-24 py-2.5 bg-amber-50/40 hover:bg-amber-50/70 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-full border border-amber-200/80 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-amber-600 absolute left-4 top-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-full transition-colors flex items-center shadow-xs cursor-pointer"
              >
                খুঁজুন
              </button>
            </form>

            {/* Live Search Autocomplete Popup */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-amber-100 py-3 z-50 overflow-hidden animate-in fade-in">
                <div className="px-4 pb-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  পাওয়া গেছে
                </div>
                {searchResults.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      onNavigate('product-details', { productId: item.id });
                    }}
                    className="px-4 py-2.5 hover:bg-amber-50/50 flex items-center space-x-3 cursor-pointer transition-colors"
                  >
                    <img src={item.thumbnail} alt={item.title} className="w-10 h-10 object-cover rounded-lg bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                      <p className="text-xs font-black text-amber-600">৳{(item.discount_price || item.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div
                  onClick={handleSearchSubmit}
                  className="px-4 pt-2 border-t border-slate-100 text-xs font-bold text-amber-700 text-center cursor-pointer hover:underline"
                >
                  "{searchKeyword}" এর সব ফলাফল দেখুন →
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons & Qard-e-Hasana Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Dedicated Qard-e-Hasana (করযে হাসানা) Button */}
            <button
              onClick={() => onNavigate('qard-hasana')}
              className={`flex items-center px-3.5 py-2 text-xs font-black rounded-xl transition-all border shadow-xs cursor-pointer ${
                currentPage === 'qard-hasana'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border-emerald-300'
              }`}
              title="বিনা সুদে ঋণ সুবিধা (করযে হাসানা)"
            >
              <HandHeart className="w-4 h-4 mr-1.5 text-emerald-600 flex-shrink-0" />
              <span>করযে হাসানা</span>
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-700 text-white text-[9px] font-black rounded-md hidden lg:inline">
                ০% সুদ
              </span>
            </button>

            {/* Dedicated VIP Loyalty Credit Card Button */}
            <button
              onClick={() => user ? onNavigate('dashboard', { tab: 'overview' }) : onNavigate('login')}
              className="flex items-center px-3.5 py-2 text-xs font-black rounded-xl transition-all border shadow-xs cursor-pointer bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-600/15 text-amber-900 hover:bg-amber-100/90 border-amber-300"
              title="আল আনসার ভিআইপি লয়ালটি ক্রেডিট কার্ড"
            >
              <CreditCard className="w-4 h-4 mr-1.5 text-amber-700 flex-shrink-0" />
              <span>ভিআইপি কার্ড</span>
              <span className="ml-1 px-1.5 py-0.2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[9px] font-black rounded-md hidden lg:inline shadow-2xs">
                VIP
              </span>
            </button>

            {/* Free Delivery Quick Link */}
            <button
              onClick={() => onNavigate('catalog', { freeDelivery: true })}
              className="hidden xl:flex items-center px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 mr-1 text-amber-700" />
              <span>ফ্রি ডেলিভারি</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 text-slate-800 hover:text-amber-700 hover:bg-amber-50 rounded-2xl transition-all flex items-center group border border-amber-200 hover:border-amber-300 cursor-pointer"
              title="শপিং ব্যাগ"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110 text-amber-700" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[11px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                  {toBengaliDigits(totalItemCount)}
                </span>
              )}
              <span className="hidden xl:inline-block ml-2 text-xs font-black text-slate-900">
                ৳{toBengaliDigits(subtotal.toLocaleString())}
              </span>
            </button>

            {/* User Account Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 pl-2 pr-3 bg-amber-50/80 hover:bg-amber-100/70 rounded-full border border-amber-200 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-emerald-800 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden md:inline-block">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-amber-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400">লগইন একাউন্ট</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
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
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center transition-colors font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> লগআউট করুন
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                >
                  লগইন
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  রেজিস্টার
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-700 hover:text-amber-700 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Category & Subcategory Navigation Bar (Pure Bengali) */}
        <div className="hidden md:flex items-center justify-between py-2.5 border-t border-amber-100/70 text-xs font-bold text-slate-700">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-amber-700 transition-colors cursor-pointer ${currentPage === 'home' ? 'text-amber-700 font-black' : ''}`}
            >
              হোম
            </button>
            
            {/* Categories in Priority Order with Hover Subcategory Dropdowns */}
            {categories.map((cat) => {
              const hasSub = cat.subcategories && cat.subcategories.length > 0;
              return (
                <div
                  key={cat.id}
                  className="relative group"
                  onMouseEnter={() => setActiveCategoryDropdown(cat.id)}
                  onMouseLeave={() => setActiveCategoryDropdown(null)}
                >
                  <button
                    onClick={() => onNavigate('catalog', { category: cat.id })}
                    className="hover:text-amber-700 transition-colors flex items-center space-x-1 py-1 cursor-pointer"
                  >
                    <span>{cat.name}</span>
                    {hasSub && <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-amber-600" />}
                  </button>

                  {/* Subcategories Dropdown */}
                  {hasSub && activeCategoryDropdown === cat.id && (
                    <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-2xl shadow-xl border border-amber-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div
                        onClick={() => onNavigate('catalog', { category: cat.id })}
                        className="px-4 py-2 text-[11px] font-black text-amber-700 uppercase tracking-wider hover:bg-amber-50 cursor-pointer border-b border-slate-100"
                      >
                        {cat.name} (সবগুলো)
                      </div>
                      {cat.subcategories.map(sub => (
                        <div
                          key={sub.id}
                          onClick={() => onNavigate('catalog', { category: cat.id, subcategory: sub.id })}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 cursor-pointer transition-colors flex items-center"
                        >
                          <Tag className="w-3 h-3 mr-2 text-amber-600 flex-shrink-0" />
                          <span>{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => user ? onNavigate('dashboard', { tab: 'overview' }) : onNavigate('login')}
              className="text-amber-900 hover:text-amber-700 font-bold flex items-center space-x-1 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-700" />
              <span>ভিআইপি লয়ালটি কার্ড</span>
            </button>
            <button
              onClick={() => onNavigate('qard-hasana')}
              className="text-emerald-700 hover:text-emerald-800 font-black flex items-center space-x-1 cursor-pointer"
            >
              <HandHeart className="w-3.5 h-3.5 text-emerald-600" />
              <span>করযে হাসানা আবেদন</span>
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="text-slate-600 hover:text-amber-700 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>শর্তাবলী ও নীতিমালা</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="text-amber-700 hover:text-amber-800 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>যোগাযোগ</span>
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-100 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="পারফিউম, আতর, গিফট খুঁজুন..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 text-xs rounded-xl border border-slate-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>

            <div className="flex flex-col space-y-1 text-xs font-bold text-slate-700">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
                className="px-3 py-2 text-left hover:bg-amber-50 rounded-lg cursor-pointer"
              >
                হোম
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); user ? onNavigate('dashboard', { tab: 'overview' }) : onNavigate('login'); }}
                className="px-3 py-2 text-left bg-amber-50 text-amber-900 rounded-lg font-black flex items-center cursor-pointer border border-amber-200"
              >
                <CreditCard className="w-4 h-4 mr-2 text-amber-700" /> ভিআইপি লয়ালটি ক্রেডিট কার্ড
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('qard-hasana'); }}
                className="px-3 py-2 text-left bg-emerald-50 text-emerald-900 rounded-lg font-black flex items-center cursor-pointer"
              >
                <HandHeart className="w-4 h-4 mr-2 text-emerald-600" /> করযে হাসানা (বিনা সুদে ঋণ)
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('catalog', { freeDelivery: true }); }}
                className="px-3 py-2 text-left hover:bg-emerald-50 rounded-lg text-emerald-800 flex items-center cursor-pointer"
              >
                <Truck className="w-4 h-4 mr-2 text-emerald-600" /> ফ্রি ডেলিভারি আইটেম
              </button>
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('catalog', { category: cat.id }); }}
                    className="w-full px-3 py-2 text-left hover:bg-amber-50 rounded-lg text-amber-900 font-bold cursor-pointer"
                  >
                    {cat.name}
                  </button>
                  {cat.subcategories && cat.subcategories.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setMobileMenuOpen(false); onNavigate('catalog', { category: cat.id, subcategory: sub.id }); }}
                      className="w-full pl-6 pr-3 py-1.5 text-left hover:bg-amber-50 rounded-lg text-slate-600 text-[11px] cursor-pointer"
                    >
                      ↳ {sub.name}
                    </button>
                  ))}
                </div>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('terms'); }}
                className="px-3 py-2 text-left hover:bg-amber-50 rounded-lg cursor-pointer"
              >
                শর্তাবলী ও নীতিমালা
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('contact'); }}
                className="px-3 py-2 text-left hover:bg-amber-50 rounded-lg cursor-pointer"
              >
                যোগাযোগ ও সাপোর্ট
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('track-order'); }}
                className="px-3 py-2 text-left hover:bg-amber-50 rounded-lg cursor-pointer"
              >
                লাইভ অর্ডার ট্র্যাক
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
