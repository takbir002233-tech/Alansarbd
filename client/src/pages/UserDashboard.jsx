import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  User, 
  Package, 
  MapPin, 
  Lock, 
  Check, 
  Printer, 
  Truck, 
  Calendar, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Download,
  CreditCard,
  HandHeart,
  Award,
  QrCode,
  ShieldCheck,
  FileText
} from 'lucide-react';
import LuxuryLoyaltyCard from '../components/LuxuryLoyaltyCard';
import LoyaltyApplicationModal from '../components/LoyaltyApplicationModal';
import QardApplicationModal from '../components/QardApplicationModal';

export default function UserDashboard({ initialTab = 'overview', onNavigate, onBack, onOpenInvoice }) {
  const { user, token, updateProfile, changePassword } = useAuth();
  const { siteSettings } = useCart();
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loyaltyModalOpen, setLoyaltyModalOpen] = useState(false);
  const [qardModalOpen, setQardModalOpen] = useState(false);
  const [userLoyaltyStatus, setUserLoyaltyStatus] = useState(user?.loyalty_card_status || null);

  // Bengali digits converter helper - correctly handles 0 and empty values
  const toBengaliDigits = (str) => {
    if (str === null || str === undefined || str === '') return '০';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || ''
  });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || ''
      });
    }
  }, [user]);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!token) return;
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error loading user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchUserOrders();
  }, [token]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    const res = await updateProfile(profileForm);
    setProfileSaving(false);

    if (res.success) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } else {
      setProfileError(res.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordSaving(false);
      setPasswordError('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি।');
      return;
    }

    const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setPasswordSaving(false);

    if (res.success) {
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      setPasswordError(res.message || 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি।');
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? (o.total_amount || 0) : 0), 0);
  const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
  const isLoyaltyDeclined = (userLoyaltyStatus === 'Declined' || userLoyaltyStatus === 'Rejected') || (user?.loyalty_card_status === 'Declined' || user?.loyalty_card_status === 'Rejected');
  const isLoyaltyApproved = (userLoyaltyStatus === 'Approved') || (user?.loyalty_card_status === 'Approved') || (user?.loyalty_card_approved === true);
  const isLoyaltyPending = (userLoyaltyStatus === 'Pending') || (user?.loyalty_card_status === 'Pending');
  const isQardDeclined = user?.qard_status === 'Declined' || user?.qard_status === 'Rejected';
  const isQardApproved = user?.qard_status === 'Approved';
  const isQardPending = user?.qard_status === 'Pending';
  const initialCardBonus = Number(siteSettings?.loyalty_card_initial_points ?? siteSettings?.reward_points_new_user ?? 100);
  const loyaltyPoints = isLoyaltyApproved 
    ? (user?.loyalty_points !== undefined ? Number(user.loyalty_points) : initialCardBonus) 
    : 0;
  const pointCashValue = loyaltyPoints * (Number(siteSettings?.reward_point_value_bdt) || 1);
  const qardLimit = isQardApproved ? (user?.qard_credit_limit || 5000) : 0;
  const cardNumber = user?.loyalty_card_number || 'ANSAR-VIP-7861-2026';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in font-sans">
      
      {/* Universal Back Navigation Bar */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          আল আনসার কাস্টমার পোর্টাল
        </span>
      </div>

      {/* Header Banner & VIP Card Teaser */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-amber-900/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-700 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg ring-2 ring-amber-400/40">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user?.name || 'সম্মানিত গ্রাহক'}</h1>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {isLoyaltyApproved ? (user?.loyalty_tier || 'Gold VIP Patron') : 'সাধারণ গ্রাহক (Regular Member)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-mono">{user?.phone || ''} {user?.email ? `• ${user?.email}` : ''}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isQardApproved ? (
            <div className="px-4 py-2 bg-emerald-900/80 text-amber-300 text-xs font-black rounded-xl border border-emerald-500/40 flex items-center space-x-1.5 shadow-md">
              <HandHeart className="w-4 h-4 text-amber-300" />
              <span>করযে হাসানা লিমিট: ৳{toBengaliDigits(qardLimit.toLocaleString())}</span>
            </div>
          ) : (
            <button
              onClick={() => setQardModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black rounded-xl border border-emerald-600/40 flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <HandHeart className="w-4 h-4 text-amber-300" />
              <span>{isQardPending ? 'করযে হাসানা আবেদন পর্যালোচনায়' : 'করযে হাসানা আবেদন'}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            কালেকশন দেখুন
          </button>
        </div>
      </div>

      {/* 🌟 MODERN 4-CARD QUICK STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Total Orders */}
        <div 
          onClick={() => setActiveTab('orders')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between min-h-[112px] sm:min-h-[122px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">মোট অর্ডার</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono leading-none">
              {toBengaliDigits(orders.length)}
            </span>
            <span className="text-xs font-bold text-slate-500">টি পার্সেল</span>
          </div>
          <p className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center">
            <span>{activeOrders.length > 0 ? `${toBengaliDigits(activeOrders.length)}টি কুরিয়ারে চলমান` : 'সব অর্ডার সম্পন্ন'}</span>
            <ChevronRight className="w-3 h-3 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Stat 2: Total Spent */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[112px] sm:min-h-[122px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">মোট কেনাকাটা</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1 overflow-hidden">
            <span className="text-lg sm:text-xl font-bold text-slate-700 mr-0.5 font-mono leading-none">৳</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono leading-none truncate">
              {toBengaliDigits(totalSpent.toLocaleString())}
            </span>
          </div>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">১০০% ক্যাশ অন / ডিজিটাল</p>
        </div>

        {/* Stat 3: Loyalty Points */}
        <div 
          onClick={() => setActiveTab('overview')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between min-h-[112px] sm:min-h-[122px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">লয়ালটি কার্ড পয়েন্ট</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1.5 overflow-hidden">
            <span className="text-2xl sm:text-3xl font-black text-purple-900 font-mono leading-none">
              {toBengaliDigits(loyaltyPoints)}
            </span>
            <span className="text-xs font-bold text-purple-600">পয়েন্ট</span>
            {isLoyaltyApproved && loyaltyPoints > 0 && (
              <span className="text-[10px] font-bold text-slate-400 truncate">
                (≈ ৳{toBengaliDigits(pointCashValue)})
              </span>
            )}
          </div>
          <p className="text-[10px] text-purple-700 font-semibold mt-1 truncate">
            {isLoyaltyApproved
              ? `প্রতি ৳${toBengaliDigits(siteSettings?.reward_points_spend_amount || 100)} এ ${toBengaliDigits(siteSettings?.reward_points_earned || 1)} পয়েন্ট কার্ডে জমা`
              : 'লয়ালটি কার্ড অনুমোদনে পয়েন্ট সুবিধা'}
          </p>
        </div>

        {/* Stat 4: Qard Limit */}
        <div 
          onClick={() => isQardApproved ? null : setQardModalOpen(true)}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group flex flex-col justify-between min-h-[112px] sm:min-h-[122px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">করযে হাসানা লিমিট</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HandHeart className="w-4 h-4 text-teal-700" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-1 overflow-hidden">
            <span className="text-lg sm:text-xl font-bold text-teal-800 mr-0.5 font-mono leading-none">৳</span>
            <span className="text-2xl sm:text-3xl font-black text-teal-950 font-mono leading-none truncate">
              {toBengaliDigits(qardLimit.toLocaleString())}
            </span>
          </div>
          <p className="text-[10px] text-teal-700 font-bold mt-1">
            {isQardApproved ? '✓ সক্রিয় ক্রেডিট লিমিট' : isQardPending ? '⏳ আবেদন পর্যালোচনায়' : 'বিনা সুদে কেনাকাটা'}
          </p>
        </div>
      </div>

      {/* 📱 Mobile Horizontal Tabs Pill Bar */}
      <div className="flex md:hidden items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ড্যাশবোর্ড ও লয়ালটি</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>অর্ডার ({toBengaliDigits(orders.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>ঠিকানা ও তথ্য</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>নিরাপত্তা</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <div className="bg-white p-3 rounded-3xl border border-amber-100 shadow-2xs space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2.5" /> ড্যাশবোর্ড ও লয়ালটি কার্ড</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <span className="flex items-center"><Package className="w-4 h-4 mr-2.5" /> আমার অর্ডার ও ইনভয়েস ({toBengaliDigits(orders.length)})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <span className="flex items-center"><User className="w-4 h-4 mr-2.5" /> ঠিকানা ও ব্যক্তিগত তথ্য</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              <span className="flex items-center"><Lock className="w-4 h-4 mr-2.5" /> নিরাপত্তা ও পাসওয়ার্ড</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="md:col-span-3">
          
          {/* TAB 1: OVERVIEW WITH VIRTUAL LOYALTY CREDIT CARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* 🎁 DYNAMIC REWARD POINTS BALANCE & RULES CARD (ONLY FOR APPROVED LOYALTY CARDHOLDERS) */}
              {isLoyaltyApproved && (
                <div className="bg-gradient-to-br from-[#1e1435] via-[#16122b] to-[#0f172a] text-white p-5 sm:p-6 rounded-3xl border border-purple-500/30 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                          লয়ালটি কার্ড রিওয়ার্ড ব্যালেন্স
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-white mt-1">আপনার ডিজিটাল লয়ালটি কার্ডের অর্জিত পয়েন্ট</h3>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-purple-200 block font-bold uppercase">পয়েন্টের ক্যাশ ভ্যালু</span>
                      <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                        ৳{toBengaliDigits(pointCashValue.toLocaleString())}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-purple-950/40 p-3.5 rounded-2xl border border-purple-500/20 space-y-1">
                      <span className="text-purple-300 font-bold block text-[11px]">বর্তমান কার্ড পয়েন্ট</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-black text-amber-300 font-mono">{toBengaliDigits(loyaltyPoints)}</span>
                        <span className="text-xs text-purple-200 font-bold">পয়েন্ট</span>
                      </div>
                    </div>

                    <div className="bg-purple-950/40 p-3.5 rounded-2xl border border-purple-500/20 space-y-1">
                      <span className="text-purple-300 font-bold block text-[11px]">কার্ড অনুমোদন বোনাস</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-black text-emerald-400 font-mono">+{toBengaliDigits(siteSettings?.loyalty_card_initial_points ?? siteSettings?.reward_points_new_user ?? 100)}</span>
                        <span className="text-xs text-emerald-300 font-bold">পয়েন্ট উপহার</span>
                      </div>
                    </div>

                    <div className="bg-purple-950/40 p-3.5 rounded-2xl border border-purple-500/20 space-y-1">
                      <span className="text-purple-300 font-bold block text-[11px]">কেনাকাটায় কার্ডে অর্জনের হার</span>
                      <div className="flex items-baseline space-x-1 pt-0.5">
                        <span className="text-xs font-black text-cyan-300">
                          প্রতি ৳{toBengaliDigits(siteSettings?.reward_points_spend_amount || 100)} এ {toBengaliDigits(siteSettings?.reward_points_earned || 1)} পয়েন্ট
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 p-3 bg-purple-900/30 rounded-xl border border-purple-500/20 text-[11px] text-purple-200/90 flex items-center space-x-2">
                    <span>💡 আপনার ভিআইপি লয়ালটি কার্ডে এই পয়েন্ট জমা হচ্ছে। প্রতি কেনাকাটায় পয়েন্ট যোগ হবে এবং যেকোনো অর্ডারে ১ পয়েন্ট = ৳{toBengaliDigits(siteSettings?.reward_point_value_bdt || 1)} সমমূল্যের ক্যাশ ছাড় পাওয়া যাবে।</span>
                  </div>
                </div>
              )}

              {/* 1. CONDITIONAL VIP LOYALTY CARD DISPLAY */}
              {isLoyaltyApproved ? (
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        ✓ অনুমোদিত ভিআইপি লয়ালটি কার্ড (Approved)
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1">আপনার ডিজিটাল প্রিভিলেজ মেম্বারশিপ কার্ড</h3>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      আইডি: {cardNumber}
                    </span>
                  </div>
                  
                  {/* Luxury Member Card matching Photo */}
                  <LuxuryLoyaltyCard user={user} />
                </div>
              ) : isLoyaltyDeclined ? (
                /* Declined Status Banner */
                <div className="bg-rose-50/90 p-6 sm:p-7 rounded-3xl border-2 border-rose-300 shadow-xs space-y-3">
                  <div className="flex items-center space-x-3 text-rose-900">
                    <div className="w-10 h-10 rounded-2xl bg-rose-200 text-rose-800 flex items-center justify-center font-bold">
                      <AlertCircle className="w-6 h-6 text-rose-700" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-wide">
                        প্রত্যাখ্যাত (Declined)
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-rose-950 mt-1">
                        আপনার ভিআইপি লয়ালটি কার্ড আবেদনটি অনুমোদিত হয়নি
                      </h3>
                    </div>
                  </div>
                  <div className="p-3 bg-white/80 border border-rose-200 rounded-2xl text-xs space-y-1">
                    <span className="font-bold text-rose-900 block">প্রত্যাখ্যানের কারণ (Admin Note):</span>
                    <p className="text-rose-800 leading-relaxed font-medium">
                      {user?.loyalty_decline_reason || 'তথ্য অসম্পূর্ণ বা যাচাইকরণে অসঙ্গতি থাকায় আপনার আবেদনটি বাতিল করা হয়েছে।'}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    সঠিক ও পূর্ণাঙ্গ তথ্য প্রদান করে আপনি এখনই পুনরায় আবেদন করতে পারেন।
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setLoyaltyModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>🔄 সংশোধিত তথ্য দিয়ে পুনরায় আবেদন করুন</span>
                    </button>
                  </div>
                </div>
              ) : isLoyaltyPending ? (
                /* Pending Review Banner */
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/70 p-6 sm:p-7 rounded-3xl border-2 border-amber-300 shadow-xs space-y-3">
                  <div className="flex items-center space-x-3 text-amber-900">
                    <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black">আপনার লয়ালটি কার্ড আবেদনটি পর্যালোচনায় রয়েছে</h3>
                      <p className="text-xs text-amber-800">Application Status: Pending Verification</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    আমাদের কাস্টমার কেয়ার টিম আপনার তথ্য যাচাই করে ২৪ ঘণ্টার মধ্যে ভার্চুয়াল ভিআইপি কার্ডটি সক্রিয় করবে। অনুমোদিত হলে স্বয়ংক্রিয়ভাবে এখানে আপনার ইউনিক বারকোডসহ প্রিমিয়াম কার্ডটি প্রদর্শিত হবে।
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setUserLoyaltyStatus('Approved')}
                      className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      ★ কার্ডের অনুমোদিত প্রিভিউ দেখুন (Test Preview)
                    </button>
                    <button
                      onClick={() => setUserLoyaltyStatus(null)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                    >
                      রিসেট করুন
                    </button>
                  </div>
                </div>
              ) : (
                /* 4-Card Wireframe Layout for Unapplied Users */
                <div className="space-y-4">
                  {/* Top Compact Advert Banner */}
                  <div className="bg-gradient-to-r from-emerald-950 via-[#03241b] to-slate-950 text-white p-5 sm:p-6 rounded-3xl border-2 border-amber-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 space-y-1.5">
                      <div className="flex items-center space-x-2 text-amber-400">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                          AL ANSAR PRIVILEGE CLUB
                        </span>
                      </div>
                      <h2 className="text-base sm:text-xl font-black text-white">
                        আল আনসার ভিআইপি মেম্বারশিপ ও লয়ালটি কার্ড
                      </h2>
                      <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                        লয়ালটি কার্ডটি প্রোফাইলে স্বয়ংক্রিয়ভাবে থাকবে না। আবেদনের পর অনুমোদিত হলে ইউনিক বারকোডসহ আপনার নিজস্ব ডিজিটাল লাক্সারি কার্ডটি সক্রিয় হবে।
                      </p>
                    </div>
                  </div>

                  {/* 4 Cards in a Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-2">
                      <Award className="w-5 h-5 text-emerald-700" />
                      <h4 className="text-xs font-black text-slate-900">লাইফটাইম ক্যাশ পয়েন্ট</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">কার্ড অনুমোদন হলেই পাবেন +{toBengaliDigits(siteSettings?.loyalty_card_initial_points ?? siteSettings?.reward_points_new_user ?? 100)} প্রারম্ভিক পয়েন্ট এবং প্রতি ৳{toBengaliDigits(siteSettings?.reward_points_spend_amount || 100)} কেনাকাটায় {toBengaliDigits(siteSettings?.reward_points_earned || 1)} পয়েন্ট কার্ডে জমা।</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-2">
                      <Sparkles className="w-5 h-5 text-amber-700" />
                      <h4 className="text-xs font-black text-slate-900">স্পেশাল ভিআইপি ছাড়</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">সকল আতর ও পারফিউমে অতিরিক্ত ৫% থেকে ১৫% মূল্যছাড়।</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-2">
                      <Truck className="w-5 h-5 text-blue-700" />
                      <h4 className="text-xs font-black text-slate-900">ফ্রি হোম ডেলিভারি</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">নির্দিষ্ট অর্ডারে ফ্রি ডেলিভারি ও অগ্রাধিকারমূলক ২৪/৭ সাপোর্ট।</p>
                    </div>

                    <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
                      <FileText className="w-5 h-5 text-amber-800" />
                      <h4 className="text-xs font-black text-slate-950">মেম্বারশিপ শর্তাবলী</h4>
                      <p className="text-[11px] text-slate-700 leading-relaxed">কার্ডটি আবেদনকারীর নামে সংরক্ষিত ও সহজে ব্যবহারযোগ্য।</p>
                    </div>
                  </div>

                  {/* Bottom-Right Dual-Language Apply Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setUserLoyaltyStatus('Approved')}
                      className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                    >
                      ★ প্রিভিউ মোডে কার্ড দেখতে ক্লিক করুন
                    </button>

                    <div className="flex justify-end w-full sm:w-auto">
                      <button
                        onClick={() => setLoyaltyModalOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-end space-x-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-5 py-2.5 rounded-2xl border-2 border-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer group"
                      >
                        <CreditCard className="w-4 h-4 text-slate-950 flex-shrink-0" />
                        <div className="text-right">
                          <span className="block text-xs font-black text-slate-950 leading-tight">
                            লয়ালটি কার্ডের জন্য আবেদন করুন
                          </span>
                          <span className="block text-[10px] text-slate-900 font-mono font-bold tracking-wide">
                            Apply for Loyalty Card
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CONDITIONAL QARD-E-HASANA (করযে হাসানা) DISPLAY */}
              {isQardApproved ? (
                <div className="bg-gradient-to-r from-[#04261d] via-[#073629] to-[#04261d] p-6 rounded-3xl border-2 border-emerald-500/40 text-white shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-700/50 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-700/60 border border-emerald-400/30 flex items-center justify-center text-amber-300">
                        <HandHeart className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          ✓ অনুমোদিত সুবিধা (Approved)
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-white mt-1">করযে হাসানা ডিজিটাল ক্রেডিট লিমিট</h3>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-emerald-200 block font-bold uppercase">অনুমোদিত ঋণ সীমা</span>
                      <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                        ৳{toBengaliDigits(qardLimit.toLocaleString())}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-600/30">
                      <span className="text-emerald-300 font-bold block">সুদের হার</span>
                      <span className="text-sm font-black text-white">০% (সম্পূর্ণ সুদমুক্ত)</span>
                    </div>
                    <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-600/30">
                      <span className="text-emerald-300 font-bold block">ব্যবহার পদ্ধতি</span>
                      <span className="text-sm font-black text-white">চেকআউটে 'করযে হাসানা' সিলেক্ট</span>
                    </div>
                    <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-600/30">
                      <span className="text-emerald-300 font-bold block">পরিশোধের মেয়াদ</span>
                      <span className="text-sm font-black text-white">সুবিধাজনক কিস্তি বা ৩০ দিন</span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    💡 আপনি যেকোনো অর্ডারে সর্বোচ্চ ১০% পর্যন্ত করযে হাসানা ধার সুবিধা ব্যবহার করে অবশিষ্ট টাকা ক্যাশ অন ডেলিভারিতে দিতে পারবেন।
                  </p>
                </div>
              ) : isQardDeclined ? (
                /* Declined Status Banner */
                <div className="bg-rose-50/90 p-5 rounded-3xl border-2 border-rose-300 text-rose-950 space-y-2.5 shadow-2xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center font-bold flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-rose-700" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        আবেদন প্রত্যাখ্যাত (Declined)
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-rose-950 mt-0.5">
                        আপনার করযে হাসানা ঋণের আবেদনটি অনুমোদিত হয়নি
                      </h4>
                    </div>
                  </div>
                  <div className="p-3 bg-white/90 border border-rose-200 rounded-2xl text-xs space-y-0.5">
                    <span className="font-bold text-rose-900 block text-[11px]">প্রত্যাখ্যানের কারণ (Admin Note):</span>
                    <p className="text-rose-800 leading-relaxed font-medium">
                      {user?.qard_decline_reason || 'জাতীয় পরিচয়পত্র বা তথ্যে অসঙ্গতি থাকায় আপনার আবেদনটি বাতিল করা হয়েছে।'}
                    </p>
                  </div>
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-500">
                      তথ্য সংশোধন করে আপনি যেকোনো সময় আবার আবেদন করতে পারেন।
                    </p>
                    <button
                      onClick={() => setQardModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
                    >
                      <HandHeart className="w-3.5 h-3.5 text-amber-300" />
                      <span>🔄 সংশোধিত তথ্য দিয়ে পুনরায় আবেদন করুন</span>
                    </button>
                  </div>
                </div>
              ) : isQardPending ? (
                <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center space-x-2">
                    <HandHeart className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-xs font-black text-emerald-900">আপনার করযে হাসানা আবেদনটি যাচাই করা হচ্ছে</h3>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    আপনার প্রদত্ত জাতীয় পরিচয়পত্র ও তথ্য অ্যাডমিন টিম ভেরিফাই করছে। অনুমোদন পাওয়ার সাথে সাথে আপনার ড্যাশবোর্ডে ক্রেডিট লিমিট সক্রিয় হবে।
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-50 via-white to-amber-50/40 p-5 sm:p-6 rounded-3xl border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HandHeart className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">বিনা সুদে করযে হাসানা (১০% ধার সুবিধা)</h4>
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">সুদমুক্ত</span>
                      </div>
                      <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                        জরুরি প্রয়োজনে বা কেনাকাটায় অর্ডারের ১০% তাৎক্ষণিক সুদমুক্ত ধারের সুবিধা পেতে আবেদন করুন। অনুমোদিত হলে ড্যাশবোর্ডে আপনার ক্রেডিট লিমিট সক্রিয় হবে।
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setQardModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black rounded-xl border border-emerald-600 shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto flex items-center space-x-1.5"
                  >
                    <HandHeart className="w-3.5 h-3.5 text-amber-300" />
                    <span>করযে হাসানা আবেদন করুন</span>
                  </button>
                </div>
              )}


              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/60 shadow-xs flex flex-col justify-between min-h-[96px] sm:min-h-[106px] transition-all hover:border-amber-300">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wide uppercase">মোট অর্ডার</span>
                  <div className="flex items-baseline mt-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono leading-none">
                      {toBengaliDigits(orders.length)}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5 font-semibold">টি</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/60 shadow-xs flex flex-col justify-between min-h-[96px] sm:min-h-[106px] transition-all hover:border-amber-300">
                  <span className="text-[11px] sm:text-xs font-bold text-amber-800 tracking-wide uppercase">চলমান ডেলিভারি</span>
                  <div className="flex items-baseline mt-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight font-mono leading-none">
                      {toBengaliDigits(activeOrders.length)}
                    </span>
                    <span className="text-[11px] text-amber-600/70 ml-1.5 font-semibold">টি</span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/60 shadow-xs flex flex-col justify-between min-h-[96px] sm:min-h-[106px] transition-all hover:border-amber-300">
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-800 tracking-wide uppercase">মোট কেনাকাটা</span>
                  <div className="flex items-baseline mt-2 overflow-hidden">
                    <span className="text-base sm:text-lg font-bold text-emerald-700 mr-1 font-mono leading-none">৳</span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700 tracking-tight font-mono leading-none truncate">
                      {toBengaliDigits(totalSpent.toLocaleString('en-US'))}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/60 shadow-xs flex flex-col justify-between min-h-[96px] sm:min-h-[106px] transition-all hover:border-amber-300">
                  <span className="text-[11px] sm:text-xs font-bold text-amber-800 tracking-wide uppercase">ক্যাশ পয়েন্ট</span>
                  <div className="flex items-baseline mt-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight font-mono leading-none">
                      {toBengaliDigits(loyaltyPoints)}
                    </span>
                    <span className="text-[11px] text-amber-600/70 ml-1.5 font-semibold">পয়েন্ট</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-amber-200/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                    সাম্প্রতিক অর্ডারসমূহ
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    সবগুলো দেখুন →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">এখনো কোনো অর্ডার করা হয়নি।</p>
                ) : (
                  orders.slice(0, 3).map(order => (
                    <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-amber-700">#{order.order_code}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{new Date(order.created_at).toLocaleDateString('bn-BD')}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="font-bold text-slate-800">
                            ৳{toBengaliDigits(order.total_amount?.toLocaleString())} ({order.payment_method === 'qard' ? 'করযে হাসানা' : order.payment_method.toUpperCase()})
                          </p>
                          {Number(order.points_earned) > 0 && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                              +{toBengaliDigits(order.points_earned)} লয়ালটি পয়েন্ট কার্ডে অর্জিত
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onNavigate('track-order', { code: order.order_code, orderNumber: order.order_code, order })}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-200" />
                          <span>লাইভ ট্র্যাকিং টাইমলাইন</span>
                        </button>
                        <button
                          onClick={() => onOpenInvoice(order)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center space-x-1 shadow-xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>ইনভয়েস</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS WITH DIRECT INVOICE DOWNLOAD */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">আমার অর্ডার ও অফিসিয়াল ইনভয়েস</h3>
                  <p className="text-xs text-slate-500 mt-0.5">আপনার অ্যাকাউন্টের মাধ্যমে করা সকল অর্ডারের মেমো সংরক্ষিত আছে</p>
                </div>
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                  {toBengaliDigits(orders.length)} টি অর্ডার
                </span>
              </div>

              {loadingOrders ? null : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">আপনি এখনো কোনো অর্ডার করেননি।</p>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    কেনাকাটা শুরু করুন
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl border border-slate-200/90 hover:border-amber-300 transition-all space-y-4 bg-slate-50/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-amber-700 text-sm">অর্ডার #{order.order_code}</span>
                          <p className="text-[11px] text-slate-400">
                            তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')} | সময়: {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {order.status === 'Delivered' ? 'ডেলিভার্ড' : order.status === 'Cancelled' ? 'বাতিল' : order.status === 'Shipped' ? 'কুরিয়ারে হস্তান্তর' : 'প্রক্রিয়াধীন'}
                          </span>

                          <button
                            onClick={() => onOpenInvoice(order)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                            title="ইনভয়েস ডাউনলোড"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                            <span>ইনভয়েস ডাউনলোড</span>
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 text-xs">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="font-medium text-slate-800 truncate max-w-sm">{item.title}</span>
                            <span className="text-slate-600 font-semibold">{toBengaliDigits(item.quantity)} × ৳{toBengaliDigits(Number(item.price).toLocaleString())}</span>
                          </div>
                        ))}
                      </div>

                      {/* COURIER DIRECT LINK */}
                      {order.courier_tracking_url && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <Truck className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-950 font-bold">
                              {order.courier_name || 'স্টিভফাস্ট কুরিয়ার'} (কনসাইনমেন্ট: {order.consignment_id || 'SF-TRACK'})
                            </span>
                          </div>
                          <a
                            href={order.courier_tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg flex items-center justify-center space-x-1 shadow-xs"
                          >
                            <span>🚚 কুরিয়ার ওয়েবসাইটে ট্র্যাক করুন</span>
                            <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </a>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-200 text-xs gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-900 text-sm">মোট টাকা: ৳{toBengaliDigits(order.total_amount?.toLocaleString())}</span>
                          {Number(order.points_earned) > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>+{toBengaliDigits(order.points_earned)} লয়ালটি পয়েন্ট কার্ডে অর্জিত</span>
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onNavigate('track-order', { code: order.order_code, orderNumber: order.order_code, order })}
                          className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-200" />
                          <span>লাইভ স্ট্যাটাস টাইমলাইন</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE & LOCATION EDIT */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-2xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">ব্যক্তিগত প্রোফাইল ও ডেলিভারি ঠিকানা</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ভবিষ্যতের সকল অর্ডারে দ্রুত চেকআউটের জন্য আপনার ঠিকানা ও তথ্য আপডেট রাখুন।
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-bold">
                  <Check className="w-4 h-4" />
                  <span>প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-xs text-rose-800 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">ডিফল্ট ডেলিভারি ঠিকানা (বাসা/রোড) *</label>
                    <textarea
                      rows={2}
                      required
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="বাড়ি নম্বর, রোড নম্বর, এলাকা..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">জেলা / শহর *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">পোস্টাল কোড</label>
                    <input
                      type="text"
                      value={profileForm.postal_code}
                      onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {profileSaving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-2xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন</h3>
                <p className="text-xs text-slate-500 mt-0.5">অ্যাকাউন্টের সুরক্ষার জন্য শক্তিশালী পাসওয়ার্ড ব্যবহার করুন</p>
              </div>

              {passwordSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-bold">
                  <Check className="w-4 h-4" />
                  <span>পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-xs text-rose-800 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">বর্তমান পাসওয়ার্ড *</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">নতুন পাসওয়ার্ড পুনরায় লিখুন *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {passwordSaving ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Loyalty Application Popup Modal */}
      <LoyaltyApplicationModal
        onNavigate={onNavigate}
        isOpen={loyaltyModalOpen}
        onClose={() => setLoyaltyModalOpen(false)}
        onSuccess={(app) => setUserLoyaltyStatus('Pending')}
      />

      {/* Qard Application Popup Modal */}
      <QardApplicationModal
        onNavigate={onNavigate}
        isOpen={qardModalOpen}
        onClose={() => setQardModalOpen(false)}
      />
    </div>
  );
}
