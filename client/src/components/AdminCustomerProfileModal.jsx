import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  HandHeart, 
  CreditCard, 
  ExternalLink,
  Clock,
  ShieldCheck,
  Eye,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useScrollLock from '../hooks/useScrollLock';

export default function AdminCustomerProfileModal({ isOpen, user, onClose, onOpenInvoice }) {
  const { token } = useAuth();
  useScrollLock(isOpen);

  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState(null);

  // Inline Qard Limit Adjustment State
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [editLimitVal, setEditLimitVal] = useState('');
  const [savingLimit, setSavingLimit] = useState(false);
  const [limitSuccess, setLimitSuccess] = useState(false);

  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n) => String(n ?? '').replace(/[0-9]/g, d => bengaliDigits[+d]);

  useEffect(() => {
    if (!isOpen || !user?.id) {
      setDetails(null);
      setIsEditingLimit(false);
      setActiveSubTab('overview');
      return;
    }
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${user.id}/details`, {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('alansar_token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setDetails(data);
          setEditLimitVal(data.qard_ledger?.credit_limit || data.user?.qard_credit_limit || 5000);
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [isOpen, user?.id, token]);

  if (!isOpen || !user) return null;

  const currentUser = details?.user || user;
  const stats = details?.stats || {
    total_orders: user.orders_count || 0,
    cancelled_orders: user.cancelled_orders_count || 0,
    delivered_orders: user.delivered_orders_count || 0,
    total_spent: user.total_spent || 0
  };
  const orders = details?.orders || [];
  const pointsLedger = details?.points_history || {
    current_points: currentUser.loyalty_points || 0,
    total_earned: currentUser.loyalty_points || 0,
    total_used: 0,
    points_cash_value: currentUser.loyalty_points || 0,
    history: []
  };
  const qardLedger = details?.qard_ledger || {
    credit_limit: currentUser.qard_credit_limit || 5000,
    total_borrowed: currentUser.qard_unpaid_amount || 0,
    total_repaid: currentUser.qard_total_repaid || 0,
    unpaid_debt: currentUser.qard_unpaid_amount || 0,
    has_unpaid_qard: Boolean(currentUser.has_unpaid_qard && currentUser.qard_unpaid_amount > 0),
    due_date: currentUser.qard_due_date,
    days_remaining: null,
    is_overdue: false,
    transactions: []
  };

  const handleSaveQardLimit = async (e) => {
    e?.preventDefault();
    setSavingLimit(true);
    try {
      const res = await fetch(`/api/admin/users/${currentUser.id}/qard-limit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('alansar_token')}`
        },
        body: JSON.stringify({ credit_limit: Number(editLimitVal) })
      });
      const data = await res.json();
      if (data.success) {
        setLimitSuccess(true);
        setIsEditingLimit(false);
        setDetails(prev => ({
          ...prev,
          user: { ...prev?.user, qard_credit_limit: Number(editLimitVal) },
          qard_ledger: { ...prev?.qard_ledger, credit_limit: Number(editLimitVal) }
        }));
        setTimeout(() => setLimitSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error saving qard limit:', err);
    } finally {
      setSavingLimit(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-sm font-black text-white">
              গ্রাহক পূর্ণাঙ্গ প্রোফাইল ও ড্যাশবোর্ড ওভারভিউ
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto modal-scrollable space-y-4 flex-1 text-xs">
          
          {/* User Profile Identity Banner */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {currentUser.user_photo ? (
                <img 
                  src={currentUser.user_photo} 
                  alt={currentUser.name} 
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md cursor-pointer hover:opacity-90"
                  onClick={() => setZoomPhoto(currentUser.user_photo)}
                  title="ছবি বড় করে দেখুন"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-xl border border-amber-500/40">
                  {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h4 className="text-base font-black text-white">{currentUser.name}</h4>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {currentUser.loyalty_tier || 'Gold VIP Patron'}
                  </span>
                  {currentUser.is_blocked ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                      🚫 স্থগিত / সাসপেন্ড
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ সক্রিয় অ্যাকাউন্ট
                    </span>
                  )}
                </div>
                <p className="text-slate-300 mt-1 font-mono text-[11px]">
                  📞 {currentUser.phone || 'ফোন নেই'} {currentUser.email ? `• ✉️ ${currentUser.email}` : ''}
                </p>
                {currentUser.created_at && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    🗓️ নিবন্ধিত: {new Date(currentUser.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">ডিজিটাল লয়ালটি কার্ড</span>
              <p className="font-mono font-bold text-amber-400 text-xs mt-0.5">
                💳 {currentUser.loyalty_card_number || `ANSAR-VIP-${currentUser.id?.slice(0, 4)}-2026`}
              </p>
              <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
                ⭐ {currentUser.loyalty_points || 0} পয়েন্ট উপলব্ধ (৳{toBn(currentUser.loyalty_points || 0)})
              </p>
            </div>
          </div>

          {/* Navigation Tabs for Comprehensive Views */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                activeSubTab === 'overview'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ওভারভিউ ও অর্ডার ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('vip_ledger')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                activeSubTab === 'vip_ledger'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ভিআইপি পয়েন্ট বিবরণী ({pointsLedger.history?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('qard_ledger')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                activeSubTab === 'qard_ledger'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
              }`}
            >
              <HandHeart className="w-3.5 h-3.5 text-emerald-400" />
              <span>করযে হাসানা লেজার ({qardLedger.transactions?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & ORDERS */}
          {activeSubTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Delivery Address & Qard Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400" /> ডিফল্ট ডেলিভারি ঠিকানা
                  </span>
                  <p className="text-white font-medium text-xs pt-0.5">
                    {currentUser.address || 'ঠিকানা দেওয়া হয়নি'}
                  </p>
                  <p className="text-slate-400 font-mono text-[11px]">
                    শহর/জেলা: <strong className="text-slate-200">{currentUser.city || 'ঢাকা'}</strong> {currentUser.postal_code ? `• পোস্টকোড: ${currentUser.postal_code}` : ''}
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-wider">
                    <HandHeart className="w-3.5 h-3.5 mr-1 text-emerald-400" /> করযে হাসানা বর্তমান অবস্থা
                  </span>
                  <div className="flex items-center justify-between pt-0.5">
                    <div>
                      <span className="text-[10px] text-slate-400 block">অনুমোদিত লিমিট:</span>
                      <span className="text-emerald-400 font-black font-mono text-sm">
                        ৳{(qardLedger.credit_limit || 5000).toLocaleString()}
                      </span>
                    </div>
                    {qardLedger.has_unpaid_qard ? (
                      <div className="text-right">
                        <span className="text-[10px] text-rose-400 block font-bold">বর্তমান বকেয়া:</span>
                        <span className="text-rose-400 font-black font-mono text-sm">
                          ৳{Number(qardLedger.unpaid_debt).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        ✓ কোনো বকেয়া নেই
                      </span>
                    )}
                  </div>
                  {qardLedger.due_date && qardLedger.has_unpaid_qard && (
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">শেষ তারিখ: {new Date(qardLedger.due_date).toLocaleDateString('bn-BD')}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${qardLedger.is_overdue ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                        {qardLedger.is_overdue ? `মেয়াদ উত্তীর্ণ (${toBn(Math.abs(qardLedger.days_remaining))} দিন)` : `আর মাত্র ${toBn(qardLedger.days_remaining)} দিন বাকি`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* NID Documents Gallery (if available) */}
              {(currentUser.nid_front_photo || currentUser.nid_back_photo || currentUser.user_photo) && (
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" /> সংরক্ষিত এনআইডি ও ভেরিফিকেশন ছবি
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {currentUser.nid_front_photo && (
                      <div 
                        className="group relative cursor-pointer border border-slate-800 rounded-xl overflow-hidden bg-slate-900"
                        onClick={() => setZoomPhoto(currentUser.nid_front_photo)}
                      >
                        <img 
                          src={currentUser.nid_front_photo} 
                          alt="NID Front" 
                          className="w-full h-20 object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="p-1 bg-slate-950/80 text-center text-[10px] text-slate-300 font-bold">
                          এনআইডি (সামনে)
                        </div>
                      </div>
                    )}
                    {currentUser.nid_back_photo && (
                      <div 
                        className="group relative cursor-pointer border border-slate-800 rounded-xl overflow-hidden bg-slate-900"
                        onClick={() => setZoomPhoto(currentUser.nid_back_photo)}
                      >
                        <img 
                          src={currentUser.nid_back_photo} 
                          alt="NID Back" 
                          className="w-full h-20 object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="p-1 bg-slate-950/80 text-center text-[10px] text-slate-300 font-bold">
                          এনআইডি (পেছনে)
                        </div>
                      </div>
                    )}
                    {currentUser.user_photo && (
                      <div 
                        className="group relative cursor-pointer border border-slate-800 rounded-xl overflow-hidden bg-slate-900"
                        onClick={() => setZoomPhoto(currentUser.user_photo)}
                      >
                        <img 
                          src={currentUser.user_photo} 
                          alt="Selfie" 
                          className="w-full h-20 object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="p-1 bg-slate-950/80 text-center text-[10px] text-slate-300 font-bold">
                          আবেদনকারীর সেলফি
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4 Metrics Card Overview */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> অর্ডার পরিসংখ্যান ও লেনদেন
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">মোট অর্ডার</span>
                    <span className="text-lg font-black text-white font-mono block mt-0.5">
                      {stats.total_orders} <span className="text-xs font-normal text-slate-400">টি</span>
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/40 bg-rose-950/10">
                    <span className="text-[10px] font-bold text-rose-400 block">বাতিলকৃত অর্ডার</span>
                    <span className="text-lg font-black text-rose-400 font-mono block mt-0.5">
                      {stats.cancelled_orders} <span className="text-xs font-normal text-rose-300">টি</span>
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/40 bg-emerald-950/10">
                    <span className="text-[10px] font-bold text-emerald-400 block">সফল ডেলিভারি</span>
                    <span className="text-lg font-black text-emerald-400 font-mono block mt-0.5">
                      {stats.delivered_orders} <span className="text-xs font-normal text-emerald-300">টি</span>
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-amber-900/40 bg-amber-950/10">
                    <span className="text-[10px] font-bold text-amber-400 block">মোট কেনাকাটা</span>
                    <span className="text-lg font-black text-amber-300 font-mono block mt-0.5">
                      ৳{(stats.total_spent || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {stats.cancelled_orders > 0 && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-[11px] flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      ⚠️ <strong>ক্যান্সেলেশন হিস্ট্রি:</strong> এই গ্রাহক এ পর্যন্ত সর্বমোট <strong>{stats.cancelled_orders} টি অর্ডার বাতিল</strong> করেছেন।
                    </span>
                  </div>
                )}
              </div>

              {/* User Order List & Activity History */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center">
                  <Package className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> অর্ডারের ইতিহাস ({orders.length} টি)
                </h5>

                {loading ? (
                  <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span>অর্ডার হিস্ট্রি লোড হচ্ছে...</span>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {orders.map((ord) => (
                      <div key={ord.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-white text-xs">#{ord.order_code || ord.order_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              ord.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              ord.status === 'Shipped' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              ord.status === 'Processing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              ord.status === 'Confirmed' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {ord.status}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 text-[11px]">
                            <span className="text-slate-400 font-mono">
                              {ord.created_at ? new Date(ord.created_at).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }) : ''}
                            </span>
                            <span className="font-mono font-black text-amber-400">৳{ord.total_amount}</span>
                            {onOpenInvoice && (
                              <button
                                type="button"
                                onClick={() => onOpenInvoice(ord)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-md flex items-center space-x-1 cursor-pointer"
                              >
                                <span>ইনভয়েস</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-xl text-center text-slate-400 text-xs border border-slate-800">
                    এই গ্রাহকের কোনো অর্ডারের ইতিহাস পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VIP POINTS LEDGER */}
          {activeSubTab === 'vip_ledger' && (
            <div className="space-y-4 animate-in fade-in">
              {/* VIP Points Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-gradient-to-br from-amber-950/50 to-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-300/80 block uppercase">বর্তমান পয়েন্ট ব্যালেন্স</span>
                  <span className="text-xl font-black text-amber-300 font-mono block">
                    ⭐ {toBn(pointsLedger.current_points)}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block">
                    (৳{toBn(pointsLedger.points_cash_value)} ক্যাশ মান)
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">মোট অর্জিত পয়েন্ট</span>
                  <span className="text-xl font-black text-emerald-400 font-mono block">
                    +{toBn(pointsLedger.total_earned)}
                  </span>
                  <span className="text-[10px] text-slate-500">বোনাস ও কেনাকাটা</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">ব্যবহৃত / রিডিম পয়েন্ট</span>
                  <span className="text-xl font-black text-rose-400 font-mono block">
                    -{toBn(pointsLedger.total_used)}
                  </span>
                  <span className="text-[10px] text-slate-500">অর্ডারে মূল্যছাড়</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">মেম্বারশিপ টায়ার</span>
                  <span className="text-sm font-black text-amber-400 block mt-1">
                    {currentUser.loyalty_tier || 'Gold VIP'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentUser.loyalty_card_number || 'সক্রিয় কার্ড'}
                  </span>
                </div>
              </div>

              {/* Itemized Points Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> 
                    ভিআইপি পয়েন্ট অর্জনের ও ব্যবহারের পূর্ণাঙ্গ বিবরণী
                  </h5>
                  <span className="text-[10px] text-slate-400 font-mono">
                    সর্বমোট {pointsLedger.history?.length || 0} টি রেকর্ড
                  </span>
                </div>

                {pointsLedger.history && pointsLedger.history.length > 0 ? (
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                    {pointsLedger.history.map((pt, idx) => (
                      <div key={pt.id || idx} className="p-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            pt.type === 'earned' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {pt.type === 'earned' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{pt.title}</p>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                              <span>🗓️ {pt.date ? new Date(pt.date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' }) : 'তারিখ নেই'}</span>
                              {pt.order_code && (
                                <span className="bg-slate-800 px-1.5 py-0.2 rounded font-mono text-amber-300">
                                  #{pt.order_code}
                                </span>
                              )}
                              {pt.discount_amount && (
                                <span className="text-emerald-400 font-mono">ছাড়: ৳{toBn(pt.discount_amount)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-sm font-black font-mono block ${
                            pt.type === 'earned' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {pt.type === 'earned' ? `+${toBn(pt.points)}` : `${toBn(pt.points)}`} <span className="text-[10px]">পয়েন্ট</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {pt.type === 'earned' ? 'অর্জিত / ক্রেডিট' : 'ব্যবহৃত / ডেবিট'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 rounded-2xl text-center text-slate-400 border border-slate-800">
                    এখনও কোনো পয়েন্ট লেনদেনের ইতিহাস পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QARD-E-HASANA LEDGER */}
          {activeSubTab === 'qard_ledger' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Qard 4-Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Credit Limit with Admin Inline Edit */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">অনুমোদিত লিমিট</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingLimit(!isEditingLimit)}
                      className="p-1 hover:bg-slate-800 rounded text-amber-400 cursor-pointer"
                      title="লিমিট পরিবর্তন করুন"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xl font-black text-emerald-400 font-mono block">
                    ৳{toBn(Number(qardLedger.credit_limit || 5000).toLocaleString())}
                  </span>
                  <span className="text-[10px] text-slate-500 block">০% সুদমুক্ত ধার</span>
                </div>

                {/* 2. Total Borrowed */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">মোট গৃহীত ঋণ</span>
                  <span className="text-xl font-black text-amber-300 font-mono block">
                    ৳{toBn(Number(qardLedger.total_borrowed || 0).toLocaleString())}
                  </span>
                  <span className="text-[10px] text-slate-500 block">অর্ডারে ব্যবহৃত</span>
                </div>

                {/* 3. Total Repaid */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">মোট পরিশোধিত</span>
                  <span className="text-xl font-black text-cyan-300 font-mono block">
                    ৳{toBn(Number(qardLedger.total_repaid || 0).toLocaleString())}
                  </span>
                  <span className="text-[10px] text-slate-500 block">সরাসরি ও কিস্তিতে</span>
                </div>

                {/* 4. Current Unpaid Balance */}
                <div className={`p-3.5 rounded-2xl border space-y-1 ${
                  qardLedger.unpaid_debt > 0 ? 'bg-rose-950/40 border-rose-600/50 text-rose-300' : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  <span className="text-[10px] font-bold block uppercase opacity-80">বর্তমান বকেয়া ঋণ</span>
                  <span className="text-xl font-black font-mono block text-rose-400">
                    ৳{toBn(Number(qardLedger.unpaid_debt || 0).toLocaleString())}
                  </span>
                  <span className="text-[10px] font-bold block">
                    {qardLedger.unpaid_debt > 0 ? 'পরিশোধযোগ্য বকেয়া' : '✓ কোনো বকেয়া নেই'}
                  </span>
                </div>
              </div>

              {/* Admin Inline Limit Editor Form */}
              {isEditingLimit && (
                <form onSubmit={handleSaveQardLimit} className="p-3 bg-slate-950 rounded-2xl border border-amber-500/40 flex items-center space-x-2 animate-in zoom-in-95">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-amber-400 block mb-0.5">নতুন করযে হাসানা ক্রেডিট লিমিট (টাকা)</label>
                    <input
                      type="number"
                      value={editLimitVal}
                      onChange={(e) => setEditLimitVal(e.target.value)}
                      placeholder="টাকার লিমিট লিখুন (যেমন: ১০০০০)"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center space-x-1.5 pt-4">
                    <button
                      type="submit"
                      disabled={savingLimit}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      {savingLimit ? <span className="animate-spin">⏳</span> : <Check className="w-3.5 h-3.5" />}
                      <span>সংরক্ষণ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingLimit(false)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </form>
              )}

              {limitSuccess && (
                <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ক্রেডিট লিমিট সফলভাবে হালনাগাদ করা হয়েছে!</span>
                </div>
              )}

              {/* Repayment Due Date and Remaining Days Countdown Banner */}
              {qardLedger.has_unpaid_qard ? (
                <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                  qardLedger.is_overdue ? 'bg-rose-950/50 border-rose-600 text-rose-200' : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-5 h-5 shrink-0 text-amber-400" />
                    <div>
                      <span className="font-bold text-xs block">
                        পরিশোধের শেষ সময়সীমা: {qardLedger.due_date ? new Date(qardLedger.due_date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : 'নির্ধারিত হয়নি'}
                      </span>
                      <p className="text-[11px] opacity-80">
                        পরবর্তী অর্ডারে স্বয়ংক্রিয় ২% হারে এবং গ্রাহক ড্যাশবোর্ড থেকে যেকোনো সময় সরাসরি পরিশোধ সম্ভব।
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black shrink-0 border ${
                    qardLedger.is_overdue ? 'bg-rose-600 text-white border-rose-400 animate-pulse' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {qardLedger.is_overdue
                      ? `🚨 মেয়াদ উত্তীর্ণ (${toBn(Math.abs(qardLedger.days_remaining))} দিন অতিবাহিত)`
                      : qardLedger.days_remaining === 0
                      ? '⚠️ আজই শেষ দিন'
                      : `⏳ আর মাত্র ${toBn(qardLedger.days_remaining)} দিন বাকি`}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-600/40 rounded-2xl text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    ✓ <strong>হিসাব পরিশোধিত:</strong> এই গ্রাহকের বর্তমানে কোনো বকেয়া করযে হাসানা ঋণ নেই। আলহামদুলিল্লাহ!
                  </span>
                </div>
              )}

              {/* Itemized Qard Transactions Ledger Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center">
                    <HandHeart className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> 
                    করযে হাসানা গ্রহণ ও পরিশোধের বিস্তারিত হিসেব
                  </h5>
                  <span className="text-[10px] text-slate-400 font-mono">
                    সর্বমোট {qardLedger.transactions?.length || 0} টি লেনদেন
                  </span>
                </div>

                {qardLedger.transactions && qardLedger.transactions.length > 0 ? (
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                    {qardLedger.transactions.map((tr, idx) => (
                      <div key={tr.id || idx} className="p-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            tr.type === 'borrowed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {tr.type === 'borrowed' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{tr.title}</p>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 flex-wrap gap-y-0.5">
                              <span>🗓️ {tr.date ? new Date(tr.date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' }) : 'তারিখ নেই'}</span>
                              {tr.order_code && (
                                <span className="bg-slate-800 px-1.5 py-0.2 rounded font-mono text-amber-300">
                                  #{tr.order_code}
                                </span>
                              )}
                              {tr.transaction_id && (
                                <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-mono border border-emerald-800/40">
                                  TrxID: {tr.transaction_id}
                                </span>
                              )}
                              {tr.sender_number && (
                                <span className="text-slate-400 font-mono">প্রেরক: {tr.sender_number}</span>
                              )}
                              {tr.notes && (
                                <span className="text-slate-400 italic">"{tr.notes}"</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-sm font-black font-mono block ${
                            tr.type === 'borrowed' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {tr.type === 'borrowed' ? `+৳${toBn(tr.amount)}` : `-৳${toBn(tr.amount)}`}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {tr.type === 'borrowed' ? 'ঋণ গ্রহণ' : 'পরিশোধ / কিস্তি'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 rounded-2xl text-center text-slate-400 border border-slate-800">
                    এখনও কোনো করযে হাসানা ঋণ গ্রহণ বা পরিশোধের ইতিহাস নেই।
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomPhoto && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
          onClick={() => setZoomPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[88vh]">
            <img 
              src={zoomPhoto} 
              alt="Zoomed" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border-2 border-amber-500 shadow-2xl" 
            />
            <button 
              type="button"
              onClick={() => setZoomPhoto(null)}
              className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
