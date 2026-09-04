import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ArrowLeft, 
  Copy, 
  Check, 
  Sparkles, 
  Tag, 
  Smartphone, 
  PhoneCall, 
  HandHeart, 
  FileText,
  Star,
  MessageSquare
} from 'lucide-react';

export default function Checkout({ onNavigate, onOrderSuccess, onBack }) {
  const { user } = useAuth();
  const { 
    cartItems, 
    subtotal, 
    discountAmount, 
    appliedPromo, 
    hasFreeDeliveryItem, 
    siteSettings, 
    getDeliveryFee, 
    getTotalAmount, 
    applyPromo, 
    removePromo, 
    clearCart 
  } = useCart();

  // Bengali digits converter helper
  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  // Form State - Pre-populated automatically from User Profile if logged in, or Guest
  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    shipping_address: user?.address || '',
    shipping_city: user?.city || 'ঢাকা (Dhaka)',
    delivery_zone: 'inside_dhaka',
    payment_method: 'bkash', // bkash, nagad, rocket, cod, qard
    sender_number: user?.phone || '',
    transaction_id: '',
    qard_nid: '',
    notes: ''
  });

  // Payment Instruction Mode: 'app' or 'dial'
  const [instructionMode, setInstructionMode] = useState('app');
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherMessage, setVoucherMessage] = useState(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revRating, setRevRating] = useState(5);
  const [revName, setRevName] = useState(user?.name || '');
  const [revComment, setRevComment] = useState('');
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revToast, setRevToast] = useState('');

  useEffect(() => {
    async function loadCheckoutReviews() {
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews.slice(0, 4));
        }
      } catch (err) {
        console.error('Error loading checkout reviews:', err);
      }
    }
    loadCheckoutReviews();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: prev.customer_name || user.name,
        customer_phone: prev.customer_phone || user.phone,
        customer_email: prev.customer_email || user.email,
        shipping_address: prev.shipping_address || user.address,
        shipping_city: prev.shipping_city || user.city || 'ঢাকা (Dhaka)',
        sender_number: prev.sender_number || user.phone
      }));
      setRevName(user.name);
    }
  }, [user]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <h2 className="text-2xl font-black text-slate-800">আপনার শপিং ব্যাগ খালি</h2>
        <p className="text-xs font-semibold text-slate-500">অর্ডার করার জন্য অনুগ্রহ করে কালেকশন থেকে পছন্দের ঘরের বাজার, বেকারি বা আতর যুক্ত করুন।</p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
        >
          কালেকশন ঘুরে দেখুন
        </button>
      </div>
    );
  }

  const deliveryFee = getDeliveryFee(formData.delivery_zone);
  const grandTotal = Math.max(0, subtotal - discountAmount) + deliveryFee;
  const qardDiscountAmount = Math.round(grandTotal * 0.10); // 10% deferred on Qard
  const qardPayableNow = grandTotal - qardDiscountAmount;

  const getPaymentNumber = () => {
    if (formData.payment_method === 'bkash') return siteSettings?.bkash_number || '01711-223344 (Send Money)';
    if (formData.payment_method === 'nagad') return siteSettings?.nagad_number || '01811-223344 (Send Money)';
    if (formData.payment_method === 'rocket') return siteSettings?.rocket_number || '01911-223344 (Send Money)';
    return '';
  };

  const getUSSDCode = () => {
    if (formData.payment_method === 'bkash') return '*247#';
    if (formData.payment_method === 'nagad') return '*167#';
    if (formData.payment_method === 'rocket') return '*322#';
    return '*247#';
  };

  const copyToClipboard = (text) => {
    const rawNumber = text.split(' ')[0].replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(rawNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleApplyVoucher = () => {
    if (!voucherInput.trim()) return;
    const result = applyPromo(voucherInput.trim());
    setVoucherMessage(result);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;
    setRevSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: revName.trim(),
          rating: revRating,
          comment: revComment.trim(),
          product_title: 'আল আনসার সুপার শপ চেকআউট অর্ডার'
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowReviewModal(false);
        setRevComment('');
        setRevToast('আপনার রিভিউটি সফলভাবে গৃহীত হয়েছে!');
        setTimeout(() => setRevToast(''), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevSubmitting(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.customer_name.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }
    if (!formData.customer_phone.trim() || formData.customer_phone.length < 11) {
      setErrorMsg('সঠিক ১১-সংখ্যার মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!formData.shipping_address.trim()) {
      setErrorMsg('ডেলিভারির সম্পূর্ণ ঠিকানা প্রদান করা বাধ্যতামূলক।');
      return;
    }

    // Payment validation for bKash/Nagad/Rocket
    if (['bkash', 'nagad', 'rocket'].includes(formData.payment_method)) {
      if (!formData.sender_number.trim()) {
        setErrorMsg('যে নম্বর থেকে টাকা পাঠিয়েছেন তা উল্লেখ করুন।');
        return;
      }
      if (!formData.transaction_id.trim()) {
        setErrorMsg('পেমেন্ট ভেরিফিকেশনের জন্য TrxID (Transaction ID) প্রদান করুন।');
        return;
      }
    }

    // Qard-e-Hasana NID validation
    if (formData.payment_method === 'qard') {
      if (!formData.qard_nid.trim() || formData.qard_nid.length < 10) {
        setErrorMsg('করযে হাসানা ১০% তাৎক্ষণিক ধার পেতে সঠিক জাতীয় পরিচয়পত্র (NID) নম্বর প্রদান আবশ্যক।');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim(),
        shipping_address: formData.shipping_address.trim(),
        shipping_city: formData.shipping_city.trim(),
        delivery_zone: formData.delivery_zone,
        delivery_fee: deliveryFee,
        payment_method: formData.payment_method,
        payment_details: {
          sender_number: formData.sender_number,
          transaction_id: formData.transaction_id,
          qard_nid: formData.qard_nid,
          qard_discount_amount: formData.payment_method === 'qard' ? qardDiscountAmount : 0,
          payable_now: formData.payment_method === 'qard' ? qardPayableNow : grandTotal
        },
        items: cartItems.map(item => ({
          product_id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          thumbnail: item.thumbnail
        })),
        subtotal: subtotal,
        discount_amount: discountAmount,
        promo_code: appliedPromo?.code || null,
        total_amount: grandTotal,
        notes: formData.notes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (data.success) {
        clearCart();
        if (onOrderSuccess) {
          onOrderSuccess(data.order);
        } else {
          onNavigate('order-confirmation', { order: data.order });
        }
      } else {
        setErrorMsg(data.message || 'অর্ডার সম্পন্ন করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setErrorMsg('সার্ভারে সমস্যা দেখা দিয়েছে। ইন্টারনেট কানেকশন চেক করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast */}
      {revToast && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center space-x-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-200" />
          <span className="text-xs font-bold">{revToast}</span>
        </div>
      )}

      {/* Top Header & Back Button */}
      <div className="pb-6 mb-6 border-b border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack || (() => onNavigate('home'))}
            className="inline-flex items-center space-x-1.5 text-xs font-black text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer mb-2 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-amber-800" />
            <span>← পিছনে যান (Back)</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">নিরাপদ চেকআউট ও পেমেন্ট</h1>
          <p className="text-xs font-bold text-slate-600 mt-0.5">
            সঠিক ডেলিভারি ঠিকানা দিন এবং সুবিধাজনক পেমেন্ট মেথড নির্বাচন করে অর্ডার সম্পন্ন করুন
          </p>
        </div>

        {/* Guest vs Logged-in info pill */}
        <div className="self-start sm:self-auto">
          {user ? (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>লগইন একাউন্ট: {user.name}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-black">
              <User className="w-4 h-4 text-amber-700" />
              <span>গেস্ট চেকআউট মোড (একাউন্ট ছাড়াও অর্ডার সম্ভব)</span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start space-x-3 text-rose-800 text-xs font-bold mb-6 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Customer Information Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center">
              <User className="w-4 h-4 mr-2 text-amber-600" /> গ্রাহকের ব্যক্তিগত তথ্য
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">আপনার পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
                <input
                  type="text"
                  required
                  placeholder="017XXXXXXXX"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-mono font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">ইমেইল অ্যাড্রেস (ঐচ্ছিক - ইনভয়েস প্রাপ্তির জন্য)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address & Delivery Zone */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-amber-600" /> ডেলিভারি ঠিকানা ও অঞ্চল
            </h3>

            {/* Delivery Zone Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">ডেলিভারি অঞ্চল নির্বাচন করুন *</label>
              <div className="grid grid-cols-2 gap-3">
                <label 
                  onClick={() => setFormData({ ...formData, delivery_zone: 'inside_dhaka' })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    formData.delivery_zone === 'inside_dhaka'
                      ? 'border-amber-600 bg-amber-50/70 text-slate-950 font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">ঢাকা সিটির ভেতরে</span>
                    <span className="text-xs font-mono font-black text-amber-700">
                      {hasFreeDeliveryItem || (siteSettings?.free_delivery_threshold && subtotal >= siteSettings.free_delivery_threshold) ? 'ফ্রি (৳০)' : `৳${toBengaliDigits(siteSettings?.delivery_fee_inside || 60)}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">হোম ডেলিভারি (২৪-৪৮ ঘণ্টা)</p>
                </label>

                <label 
                  onClick={() => setFormData({ ...formData, delivery_zone: 'outside_dhaka' })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    formData.delivery_zone === 'outside_dhaka'
                      ? 'border-amber-600 bg-amber-50/70 text-slate-950 font-black shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">ঢাকার বাইরে (সারাদেশে)</span>
                    <span className="text-xs font-mono font-black text-amber-700">
                      {hasFreeDeliveryItem || (siteSettings?.free_delivery_threshold && subtotal >= siteSettings.free_delivery_threshold) ? 'ফ্রি (৳০)' : `৳${toBengaliDigits(siteSettings?.delivery_fee_outside || 120)}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">কুরিয়ার হোম ডেলিভারি (৭২ ঘণ্টা)</p>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">জেলা / শহর *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঢাকা, চট্টগ্রাম, সিলেট"
                  value={formData.shipping_city}
                  onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">অর্ডার সংক্রান্ত বিশেষ নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: বিকেলে ডেলিভারি করবেন"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড/এরিয়া) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="বাড়ি নং, রোড নং, এলাকা বা গ্রামের নাম..."
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Methods (bKash, Nagad, Rocket, COD, Qard-e-Hasana) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-amber-600" /> পেমেন্ট পদ্ধতি নির্বাচন করুন
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              
              {/* bKash */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: 'bkash' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  formData.payment_method === 'bkash'
                    ? 'border-pink-600 bg-pink-50/80 text-pink-950 font-black shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-pink-700">বিকাশ (bKash)</span>
                  {formData.payment_method === 'bkash' && <Check className="w-4 h-4 text-pink-600" />}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">ম্যানুয়াল সেন্ড মানি</span>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: 'nagad' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  formData.payment_method === 'nagad'
                    ? 'border-orange-600 bg-orange-50/80 text-orange-950 font-black shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-700">নগদ (Nagad)</span>
                  {formData.payment_method === 'nagad' && <Check className="w-4 h-4 text-orange-600" />}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">ম্যানুয়াল সেন্ড মানি</span>
              </button>

              {/* Rocket */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: 'rocket' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  formData.payment_method === 'rocket'
                    ? 'border-purple-600 bg-purple-50/80 text-purple-950 font-black shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-700">রকেট (Rocket)</span>
                  {formData.payment_method === 'rocket' && <Check className="w-4 h-4 text-purple-600" />}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">ম্যানুয়াল সেন্ড মানি</span>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: 'cod' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  formData.payment_method === 'cod'
                    ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-black shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-800">ক্যাশ অন ডেলিভারি</span>
                  {formData.payment_method === 'cod' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">পণ্য পেয়ে মূল্য পরিশোধ</span>
              </button>

              {/* Qard-e-Hasana (10% Deferred) */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, payment_method: 'qard' })}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer sm:col-span-2 ${
                  formData.payment_method === 'qard'
                    ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-black shadow-xs'
                    : 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-900 font-bold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800 flex items-center">
                    <HandHeart className="w-4 h-4 mr-1 text-emerald-600" />
                    করযে হাসানা (১০% তাৎক্ষণিক ধার)
                  </span>
                  {formData.payment_method === 'qard' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                  এখন ৯০% দিন, বাকি ১০% পরে বিনা সুদে পরিশোধ করুন
                </span>
              </button>
            </div>

            {/* Payment Instructions & Form for MFS */}
            {['bkash', 'nagad', 'rocket'].includes(formData.payment_method) && (
              <div className="p-4 sm:p-5 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-black text-slate-900">
                      {formData.payment_method === 'bkash' ? 'বিকাশ পার্সোনাল নম্বর' : formData.payment_method === 'nagad' ? 'নগদ পার্সোনাল নম্বর' : 'রকেট পার্সোনাল নম্বর'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-800">{getPaymentNumber()}</span>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200">
                  <span className="text-xs font-mono font-black text-slate-800">{getPaymentNumber().split(' ')[0]}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getPaymentNumber())}
                    className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">প্রেরক নম্বর (যে নম্বর থেকে পাঠিয়েছেন) *</label>
                    <input
                      type="text"
                      required
                      placeholder="01XXXXXXXXX"
                      value={formData.sender_number}
                      onChange={(e) => setFormData({ ...formData, sender_number: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white text-xs font-mono font-bold rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Transaction ID (TrxID) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9J87K6L5M4"
                      value={formData.transaction_id}
                      onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 bg-white text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Qard-e-Hasana NID Input */}
            {formData.payment_method === 'qard' && (
              <div className="p-4 sm:p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
                <div className="flex items-center space-x-2 text-xs font-black text-emerald-950">
                  <HandHeart className="w-4 h-4 text-emerald-700" />
                  <span>করযে হাসানা ১০% তাৎক্ষণিক হালাল ধার আবেদন</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-emerald-900 block mb-1">জাতীয় পরিচয়পত্র (NID) নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="১০ বা ১৭ সংখ্যার এনআইডি নম্বর"
                    value={formData.qard_nid}
                    onChange={(e) => setFormData({ ...formData, qard_nid: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white text-xs font-mono font-black rounded-xl border border-emerald-300 text-emerald-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. REAL CUSTOMER REVIEWS & FEEDBACK IN CHECKOUT */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <h3 className="text-sm font-black text-slate-900">গ্রাহকদের বিশ্বস্ত মতামত ও অভিজ্ঞতা</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="text-xs font-black text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-xl border border-amber-200 transition-colors cursor-pointer"
              >
                + মতামত / রিভিউ দিন
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(reviews.length > 0 ? reviews : [
                { id: 1, user_name: 'আহমেদ হাসান', rating: 5, comment: 'মাশাআল্লাহ! পণ্যের কোয়ালিটি অত্যন্ত নিখুঁত এবং ডেলিভারি খুব দ্রুত পেয়েছি।' },
                { id: 2, user_name: 'রাশেদুল ইসলাম', rating: 5, comment: 'করযে হাসানা সুবিধা পেয়ে অনেক উপকার হলো। ১০০% হালাল ও খাঁটি পণ্য।' }
              ]).map(rev => (
                <div key={rev.id} className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rev.user_name}</span>
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-3 h-3 ${i <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 font-semibold leading-relaxed">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-sm space-y-5 sticky top-28">
            
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <h3 className="text-sm font-black text-slate-900">
                অর্ডার সারাংশ ({toBengaliDigits(cartItems.length)} টি আইটেম)
              </h3>
              {deliveryFee === 0 && (
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center">
                  <Truck className="w-3 h-3 mr-1 text-emerald-600" /> ফ্রি ডেলিভারি
                </span>
              )}
            </div>

            {/* Cart items list */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 text-xs">
                  <img src={item.thumbnail} alt={item.title} className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-amber-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-slate-500 font-semibold">
                      {toBengaliDigits(item.quantity)} × ৳{toBengaliDigits(item.price.toLocaleString())}
                      {item.is_free_delivery && <span className="text-emerald-700 font-bold ml-1.5">(ফ্রি ডেলিভারি)</span>}
                    </p>
                  </div>
                  <span className="font-black text-slate-950">৳{toBengaliDigits((item.price * item.quantity).toLocaleString())}</span>
                </div>
              ))}
            </div>

            {/* Voucher Code Form */}
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-amber-700 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="ভাউচার কোড (e.g. ANSAR10)"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-2 py-2 bg-white text-xs rounded-xl border border-amber-200 focus:outline-none focus:border-amber-500 font-mono uppercase font-black"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
                >
                  প্রয়োগ
                </button>
              </div>

              {voucherMessage && (
                <p className={`text-[11px] font-bold ${voucherMessage.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {voucherMessage.message}
                </p>
              )}

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs font-black text-emerald-800 pt-1">
                  <span>✓ ভাউচার {appliedPromo.code} প্রযোজ্য হয়েছে</span>
                  <button type="button" onClick={removePromo} className="text-rose-500 text-[10px] underline cursor-pointer">
                    বাতিল
                  </button>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100 font-bold">
              <div className="flex justify-between">
                <span>পণ্যের মোট মূল্য (সাবটোটাল)</span>
                <span className="font-black text-slate-950">৳{toBengaliDigits(subtotal.toLocaleString())}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-black">
                  <span>ভাউচার ছাড় ({appliedPromo?.code})</span>
                  <span>-৳{toBengaliDigits(discountAmount.toLocaleString())}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>ডেলিভারি ফি</span>
                <span className="font-bold text-slate-950">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-black flex items-center">
                      <Truck className="w-3 h-3 mr-1" /> ফ্রি ডেলিভারি (৳০)
                    </span>
                  ) : (
                    `৳${toBengaliDigits(deliveryFee)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-950 pt-3 border-t border-amber-200">
                <span>সর্বমোট প্রদেয় টাকা</span>
                <span className="text-lg text-amber-700">৳{toBengaliDigits(grandTotal.toLocaleString())}</span>
              </div>

              {formData.payment_method === 'qard' && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 space-y-1 text-xs text-emerald-950 font-black">
                  <div className="flex justify-between text-emerald-800">
                    <span>এখন প্রদেয় (৯০%):</span>
                    <span>৳{toBengaliDigits(qardPayableNow.toLocaleString())}</span>
                  </div>
                  <div className="flex justify-between text-amber-900">
                    <span>করযে হাসানা বকেয়া (১০% ধার):</span>
                    <span>৳{toBengaliDigits(qardDiscountAmount.toLocaleString())}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>অর্ডার নিশ্চিত করুন (৳{toBengaliDigits((formData.payment_method === 'qard' ? qardPayableNow : grandTotal).toLocaleString())})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Review Submission Modal in Checkout */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-amber-200 animate-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center">
                <Star className="w-4 h-4 mr-2 text-amber-600 fill-amber-500" /> আপনার মূল্যবান মতামত দিন
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">রেটিং প্রদান করুন *</label>
                <div className="flex items-center space-x-2 py-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRevRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          revRating >= star 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">আপনার মতামত ও অভিজ্ঞতা *</label>
                <textarea
                  rows={3}
                  required
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="সার্ভিস ও পণ্য কেমন লেগেছে লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={revSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {revSubmitting ? 'জমা হচ্ছে...' : '✓ মতামত জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
