import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  ShieldCheck
} from 'lucide-react';

export default function UserDashboard({ initialTab = 'overview', onNavigate, onOpenInvoice }) {
  const { user, token, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Bengali digits converter helper
  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
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
  const loyaltyPoints = user?.loyalty_points !== undefined ? user.loyalty_points : 120;
  const qardLimit = user?.qard_credit_limit || 5000;
  const cardNumber = user?.loyalty_card_number || 'ANSAR-VIP-7861-2026';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in font-sans">
      
      {/* Universal Back Navigation Bar */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← মূল পেইজে ফিরে যান</span>
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
              <h1 className="text-xl sm:text-2xl font-black text-white">{user?.name}</h1>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {user?.loyalty_tier || 'Gold VIP Patron'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-mono">{user?.phone} • {user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('qard-hasana')}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black rounded-xl border border-emerald-600/40 flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <HandHeart className="w-4 h-4 text-amber-300" />
            <span>করযে হাসানা আবেদন</span>
          </button>

          <button
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            কালেকশন দেখুন
          </button>
        </div>
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
              
              {/* AL ANSAR VIRTUAL VIP LOYALTY CREDIT CARD GRAPHIC */}
              <div className="bg-gradient-to-tr from-slate-950 via-amber-950 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-amber-400/60 shadow-2xl relative overflow-hidden space-y-6">
                
                {/* Background holographic glow */}
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Top Row: Card Title & Monogram */}
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/logo.jpg" 
                      alt="AL ANSAR" 
                      className="w-12 h-12 object-contain rounded-xl border border-amber-400/50 shadow-md bg-slate-900" 
                    />
                    <div>
                      <h3 className="text-sm font-black tracking-widest text-amber-300 uppercase">
                        AL ANSAR PRIVILEGE CLUB
                      </h3>
                      <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                        Islamic Loyalty Credit Card
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    {user?.loyalty_tier || 'ROYAL VIP'}
                  </span>
                </div>

                {/* EMV Chip & Contactless wave */}
                <div className="flex items-center space-x-4 pt-1">
                  <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-600 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-5 border border-amber-700/60 rounded-xs" />
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>

                {/* Card Number & Available Balances */}
                <div className="space-y-1 relative z-10">
                  <p className="font-mono text-base sm:text-xl font-bold tracking-widest text-amber-100 drop-shadow-sm">
                    {cardNumber}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-amber-500/20 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">রিওয়ার্ড পয়েন্ট</span>
                      <span className="text-sm font-black text-amber-300">{toBengaliDigits(loyaltyPoints)} Pts</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">করযে হাসানা লিমিট</span>
                      <span className="text-sm font-black text-emerald-400">৳{toBengaliDigits(qardLimit.toLocaleString())} (০% সুদ)</span>
                    </div>
                  </div>
                </div>

                {/* Cardholder Name & Expiry */}
                <div className="flex items-end justify-between pt-2 border-t border-amber-500/20 relative z-10 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">কার্ডহোল্ডার নাম</span>
                    <span className="font-bold text-white uppercase tracking-wider">{user?.name || 'VALUED PATRON'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">মেয়াদ</span>
                    <span className="font-mono text-amber-300 font-bold">১২/২০২৯</span>
                  </div>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">মোট অর্ডার</span>
                  <p className="text-2xl font-black text-slate-900">{toBengaliDigits(orders.length)}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 uppercase">চলমান ডেলিভারি</span>
                  <p className="text-2xl font-black text-amber-700">{toBengaliDigits(activeOrders.length)}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">মোট কেনাকাটা</span>
                  <p className="text-2xl font-black text-emerald-700">৳{toBengaliDigits(totalSpent.toLocaleString())}</p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    সাম্প্রতিক সুগন্ধি অর্ডার
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
                        <p className="font-bold text-slate-800 mt-1">
                          ৳{toBengaliDigits(order.total_amount?.toLocaleString())} ({order.payment_method === 'qard' ? 'করযে হাসানা' : order.payment_method.toUpperCase()})
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onNavigate('track-order', { code: order.order_code })}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl cursor-pointer"
                        >
                          লাইভ ট্র্যাকিং
                        </button>
                        <button
                          onClick={() => onOpenInvoice(order)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center space-x-1 shadow-xs cursor-pointer"
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

              {loadingOrders ? (
                <div className="py-12 text-center text-slate-400 text-xs">অর্ডার লোড হচ্ছে...</div>
              ) : orders.length === 0 ? (
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
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                        <span className="font-black text-slate-900 text-sm">মোট টাকা: ৳{toBengaliDigits(order.total_amount?.toLocaleString())}</span>
                        <button
                          onClick={() => onNavigate('track-order', { code: order.order_code })}
                          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          লাইভ স্ট্যাটাস টাইমলাইন
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
    </div>
  );
}
