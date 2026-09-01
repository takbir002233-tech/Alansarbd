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
  FileText
} from 'lucide-react';

export default function Checkout({ onNavigate, onOrderSuccess }) {
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
    }
  }, [user]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <h2 className="text-2xl font-black text-slate-800">আপনার শপিং ব্যাগ খালি</h2>
        <p className="text-xs text-slate-500">অর্ডার করার জন্য অনুগ্রহ করে কালেকশন থেকে পছন্দের আতর বা পারফিউম যুক্ত করুন।</p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
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
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'shipping_city' && {
        delivery_zone: value.toLowerCase().includes('dhaka') || value.includes('ঢাকা') ? 'inside_dhaka' : 'outside_dhaka'
      })
    }));
  };

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    const res = await applyPromo(voucherInput);
    setVoucherMessage(res);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.customer_name.trim()) {
      setErrorMsg('অনুগ্রহ করে প্রাপকের পূর্ণ নাম লিখুন।');
      return;
    }
    if (!formData.customer_phone.trim() || formData.customer_phone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!formData.shipping_address.trim()) {
      setErrorMsg('অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা (বাসা/রোড) প্রদান করুন।');
      return;
    }

    if (['bkash', 'nagad', 'rocket'].includes(formData.payment_method)) {
      if (!formData.sender_number.trim() || formData.sender_number.length < 11) {
        setErrorMsg(`অনুগ্রহ করে পেমেন্ট করার জন্য ব্যবহৃত ${formData.payment_method.toUpperCase()} প্রেরক মোবাইল নম্বর দিন।`);
        return;
      }
      if (!formData.transaction_id.trim() || formData.transaction_id.trim().length < 5) {
        setErrorMsg('পেমেন্টের পর মেসেজে আসা TrxID (ট্রানজেকশন আইডি) টি লিখুন।');
        return;
      }
    }

    if (formData.payment_method === 'qard' && (!formData.qard_nid || formData.qard_nid.trim().length < 10)) {
      setErrorMsg('করযে হাসানা (১০% ধার/বাকি) সুবিধার জন্য জাতীয় পরিচয়পত্র (NID) নম্বর আবশ্যক।');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        user_id: user?.id || null,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || user?.email || '',
        shipping_address: formData.shipping_address,
        shipping_city: formData.shipping_city,
        delivery_zone: formData.delivery_zone,
        items: cartItems,
        payment_method: formData.payment_method,
        sender_number: formData.sender_number,
        transaction_id: formData.transaction_id,
        qard_nid: formData.qard_nid,
        qard_deferred_amount: formData.payment_method === 'qard' ? qardDiscountAmount : 0,
        notes: formData.notes,
        applied_voucher_code: appliedPromo?.code || '',
        discount_amount: discountAmount
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'অর্ডার করতে সমস্যা হয়েছে।');
      }

      clearCart();
      onOrderSuccess(data.order);
    } catch (err) {
      setErrorMsg(err.message || 'অর্ডার সম্পন্ন হতে কোনো ত্রুটি হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in font-sans">
      
      {/* Universal Back Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-amber-200/80">
        <button
          onClick={() => onNavigate('cart')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-amber-800 transition-colors bg-white px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>← শপিং ব্যাগে ফিরে যান</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>আল আনসার নিরাপদ ও সুরক্ষিত চেকআউট</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">অনুগ্রহ করে নিচের তথ্য সংশোধন করুন:</h4>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Delivery Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black">
                  ১
                </div>
                <h3 className="text-sm font-bold text-slate-900">ডেলিভারি তথ্য (Delivery Details)</h3>
              </div>
              {user ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ প্রোফাইল থেকে স্বয়ংক্রিয় পূরণ
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  গেস্ট মোড (লগইন ছাড়াই চেকআউট)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">প্রাপকের পূর্ণ নাম *</label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">১১ ডিজিটের মোবাইল নম্বর *</label>
                <input
                  type="text"
                  name="customer_phone"
                  required
                  maxLength={11}
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">ইমেইল ঠিকানা (ঐচ্ছিক - ইনভয়েসের জন্য)</label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড নম্বর) *</label>
                <textarea
                  name="shipping_address"
                  required
                  rows={2}
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  placeholder="বাড়ি ১৪, রোড ৭, সেক্টর ৩, উত্তরা, ঢাকা"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">জেলা / শহর *</label>
                <input
                  type="text"
                  name="shipping_city"
                  required
                  value={formData.shipping_city}
                  onChange={handleInputChange}
                  placeholder="ঢাকা"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">ডেলিভারি এরিয়া</label>
                <select
                  name="delivery_zone"
                  value={formData.delivery_zone}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="inside_dhaka">ঢাকা সিটির ভেতর (৳{toBengaliDigits(siteSettings?.dhaka_delivery_fee || 60)})</option>
                  <option value="outside_dhaka">ঢাকার বাইরে (৳{toBengaliDigits(siteSettings?.outside_dhaka_delivery_fee || 120)})</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">বিশেষ উপহার বার্তা / ডেলিভারি নোট</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="যেমন: আকর্ষণীয় রিবন প্যাকেজিং ও বিশেষ গিফট কার্ড যুক্ত করবেন"
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method (with Qard-e-Hasana 10% Credit) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-2xs space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black">
                ২
              </div>
              <h3 className="text-sm font-bold text-slate-900">পেমেন্ট মাধ্যম নির্বাচন করুন</h3>
            </div>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              
              {/* bKash */}
              <div
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'bkash' }))}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                  formData.payment_method === 'bkash'
                    ? 'border-pink-600 bg-pink-50/60 shadow-md ring-2 ring-pink-500/20'
                    : 'border-slate-200 hover:border-pink-300'
                }`}
              >
                <span className="text-xs font-black text-pink-600">বিকাশ ম্যানুয়াল</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Send Money / TrxID</span>
              </div>

              {/* Nagad */}
              <div
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'nagad' }))}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                  formData.payment_method === 'nagad'
                    ? 'border-amber-600 bg-amber-50/60 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <span className="text-xs font-black text-amber-600">নগদ ম্যানুয়াল</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Send Money / TrxID</span>
              </div>

              {/* Rocket */}
              <div
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'rocket' }))}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                  formData.payment_method === 'rocket'
                    ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                <span className="text-xs font-black text-purple-600">রকেট ম্যানুয়াল</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Send Money / TrxID</span>
              </div>

              {/* COD */}
              <div
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'cod' }))}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                  formData.payment_method === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="text-xs font-black text-emerald-600">ক্যাশ অন ডেলিভারি</span>
                <span className="text-[10px] text-slate-500 mt-0.5">হাতে পেয়ে পরিশোধ</span>
              </div>

              {/* Qard-e-Hasana (10% Deferred Credit) */}
              <div
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'qard' }))}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                  formData.payment_method === 'qard'
                    ? 'border-emerald-700 bg-emerald-50 shadow-md ring-2 ring-emerald-600/30'
                    : 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30'
                }`}
              >
                <span className="text-xs font-black text-emerald-900">করযে হাসানা</span>
                <span className="text-[10px] text-emerald-700 font-bold mt-0.5">১০% তাৎক্ষণিক ধার</span>
              </div>
            </div>

            {/* QARD-E-HASANA SPECIFIC BOX */}
            {formData.payment_method === 'qard' && (
              <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-amber-400/40 space-y-3 animate-in fade-in">
                <div className="flex items-center space-x-2 text-amber-300">
                  <HandHeart className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider">করযে হাসানা (১০% তাৎক্ষণিক ধার/বাকি সুবিধা)</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  এই অর্ডারে আপনি মোট টাকার <strong>৯০% (৳{toBengaliDigits(qardPayableNow.toLocaleString())})</strong> ডেলিভারির সময় বা বিকাশে পরিশোধ করবেন এবং বাকি <strong>১০% (৳{toBengaliDigits(qardDiscountAmount.toLocaleString())})</strong> করযে হাসানা হিসেবে সুবিধাজনক সময়ে সুদমুক্তভাবে পরিশোধ করতে পারবেন।
                </p>
                <div>
                  <label className="text-xs font-bold text-amber-300 block mb-1">আপনার জাতীয় পরিচয়পত্র (NID) নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="১০ বা ১৭ ডিজিটের এনআইডি নম্বর লিখুন"
                    value={formData.qard_nid}
                    onChange={(e) => setFormData({ ...formData, qard_nid: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 text-white text-xs rounded-xl border border-amber-500/40 focus:outline-none focus:border-amber-400 font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* Mobile Wallet Details (bKash, Nagad, Rocket) */}
            {['bkash', 'nagad', 'rocket'].includes(formData.payment_method) && (
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4 animate-in fade-in">
                
                {/* Instruction Mode Toggle */}
                <div className="flex bg-white p-1 rounded-xl border border-amber-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setInstructionMode('app')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      instructionMode === 'app'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>📱 অ্যাপ দিয়ে পেমেন্ট</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInstructionMode('dial')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      instructionMode === 'dial'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>📞 বাটন ফোনে {getUSSDCode()} ডায়াল</span>
                  </button>
                </div>

                {/* Account Number Box */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950 text-white rounded-2xl border border-amber-500/30">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold">
                      আল আনসার অফিসিয়াল {formData.payment_method.toUpperCase()} নম্বর
                    </span>
                    <span className="text-sm font-mono font-bold">{getPaymentNumber()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getPaymentNumber())}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>

                {/* Sender Phone & TrxID Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      প্রেরক {formData.payment_method.toUpperCase()} নম্বর *
                    </label>
                    <input
                      type="text"
                      name="sender_number"
                      required
                      value={formData.sender_number}
                      onChange={handleInputChange}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-white text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      ট্রানজেকশন আইডি (TrxID) *
                    </label>
                    <input
                      type="text"
                      name="transaction_id"
                      required
                      value={formData.transaction_id}
                      onChange={handleInputChange}
                      placeholder="যেমন: 9J8K7L6M5N"
                      className="w-full px-3.5 py-2.5 bg-white text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 font-mono font-bold uppercase tracking-wider"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-2xs space-y-5 sticky top-28">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
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
                  <img src={item.thumbnail} alt={item.title} className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                    <p className="text-slate-400 font-medium">
                      {toBengaliDigits(item.quantity)} × ৳{toBengaliDigits(item.price.toLocaleString())}
                      {item.is_free_delivery && <span className="text-emerald-600 font-bold ml-1.5">(ফ্রি ডেলিভারি)</span>}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">৳{toBengaliDigits((item.price * item.quantity).toLocaleString())}</span>
                </div>
              ))}
            </div>

            {/* Voucher Code Form */}
            <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-amber-700 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="ভাউচার কোড (e.g. ANSAR10)"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-2 py-2 bg-white text-xs rounded-xl border border-amber-200 focus:outline-none focus:border-amber-500 font-mono uppercase font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  প্রয়োগ করুন
                </button>
              </div>

              {voucherMessage && (
                <p className={`text-[11px] font-semibold ${voucherMessage.success ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {voucherMessage.message}
                </p>
              )}

              {appliedPromo && (
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 pt-1">
                  <span>✓ ভাউচার {appliedPromo.code} প্রযোজ্য হয়েছে</span>
                  <button type="button" onClick={removePromo} className="text-rose-500 text-[10px] underline cursor-pointer">
                    বাতিল
                  </button>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>সাবটোটাল</span>
                <span className="font-bold text-slate-800">৳{toBengaliDigits(subtotal.toLocaleString())}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>ভাউচার ছাড় ({appliedPromo?.code})</span>
                  <span>-৳{toBengaliDigits(discountAmount.toLocaleString())}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>ডেলিভারি ফি</span>
                <span className="font-semibold text-slate-800">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center">
                      <Truck className="w-3 h-3 mr-1" /> ফ্রি (৳০)
                    </span>
                  ) : (
                    `৳${toBengaliDigits(deliveryFee)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-amber-100">
                <span>সর্বমোট প্রদেয় টাকা</span>
                <span className="text-lg text-amber-700">৳{toBengaliDigits(grandTotal.toLocaleString())}</span>
              </div>

              {formData.payment_method === 'qard' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-xs text-emerald-950 font-bold">
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
    </div>
  );
}
