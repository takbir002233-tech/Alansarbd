import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import { 
  bangladeshDivisions, 
  getDistrictsForDivision, 
  getThanasForDistrict, 
  getPostOfficesForThana 
} from '../data/bangladeshLocations';
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
  ArrowRight,
  Sparkles, 
  Tag, 
  FileText,
  Lock,
  Building,
  Mail
} from 'lucide-react';

export default function Checkout({ onNavigate, onOrderSuccess, onBack }) {
  const { user } = useAuth();
  const { 
    cartItems, 
    subtotal, 
    discountAmount, 
    appliedPromo, 
    siteSettings, 
    getDeliveryFee, 
    applyPromo, 
    removePromo, 
    clearCart 
  } = useCart();

  // Helper for Bengali digits
  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  // Basic Contact Info
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [orderNotes, setOrderNotes] = useState('');

  // Cascading Location Hierarchy (Same as Registration)
  const [selectedDivision, setSelectedDivision] = useState('dhaka');
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('dhaka_city');
  const [thanasList, setThanasList] = useState([]);
  const [selectedThana, setSelectedThana] = useState('');
  const [postOfficesList, setPostOfficesList] = useState([]);
  const [selectedPostOffice, setSelectedPostOffice] = useState('');
  const [postalCode, setPostalCode] = useState('১২১৬');
  const [streetAddress, setStreetAddress] = useState(user?.address || '');

  // Delivery Zone (inside_dhaka or outside_dhaka)
  const [deliveryZone, setDeliveryZone] = useState('inside_dhaka');

  const [voucherInput, setVoucherInput] = useState('');
  const [voucherMessage, setVoucherMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Auto-fill from user profile when logged in
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
      if (user.address) setStreetAddress(user.address);
      if (user.postal_code) setPostalCode(user.postal_code);
    }
  }, [user]);

  // Cascade Districts when Division changes
  useEffect(() => {
    const districts = getDistrictsForDivision(selectedDivision);
    setDistrictsList(districts);
    if (districts.length > 0) {
      setSelectedDistrict(districts[0].id);
    }
    // Automatically set delivery zone based on division
    if (selectedDivision === 'dhaka') {
      setDeliveryZone('inside_dhaka');
    } else {
      setDeliveryZone('outside_dhaka');
    }
  }, [selectedDivision]);

  // Cascade Thanas when District changes
  useEffect(() => {
    if (!selectedDistrict) {
      setThanasList([]);
      setSelectedThana('');
      return;
    }
    const thanas = getThanasForDistrict(selectedDistrict);
    setThanasList(thanas);
    if (thanas.length > 0) {
      setSelectedThana(thanas[0].id);
    }
  }, [selectedDistrict]);

  // Cascade Post Offices when Thana changes
  useEffect(() => {
    if (!selectedThana) {
      setPostOfficesList([]);
      setSelectedPostOffice('');
      return;
    }
    const thanaObj = thanasList.find(t => t.id === selectedThana);
    const postOffices = getPostOfficesForThana(selectedThana, thanaObj ? thanaObj.name : '');
    setPostOfficesList(postOffices);
    if (postOffices.length > 0) {
      setSelectedPostOffice(postOffices[0].name);
      setPostalCode(postOffices[0].code || '');
    }
  }, [selectedThana, thanasList]);

  const handlePostOfficeChange = (e) => {
    const poName = e.target.value;
    setSelectedPostOffice(poName);
    const found = postOfficesList.find(p => p.name === poName);
    if (found && found.code) {
      setPostalCode(found.code);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        {/* Standard Universal Back Button */}
        <div className="flex justify-start mb-4">
          <button
            onClick={onBack || (() => onNavigate('home'))}
            className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-amber-800" />
            <span>← পিছনে যান (Back)</span>
          </button>
        </div>
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

  const deliveryFee = getDeliveryFee(deliveryZone);
  const grandTotal = Math.max(0, subtotal - discountAmount) + deliveryFee;

  const handleApplyVoucher = () => {
    if (!voucherInput.trim()) return;
    const result = applyPromo(voucherInput.trim());
    setVoucherMessage(result);
  };

  // Validate address form and open payment modal
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('অনুগ্রহ করে প্রাপকের পূর্ণ নাম লিখুন।');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 11) {
      setErrorMsg('সঠিক ১১-সংখ্যার মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!streetAddress.trim()) {
      setErrorMsg('বাসা নং, রোড নং বা বিস্তারিত ডেলিভারি ঠিকানা প্রদান করা বাধ্যতামূলক।');
      return;
    }

    setShowPaymentModal(true);
  };

  // Final Order Submission once confirmed from PaymentGatewayModal
  const handleConfirmPaymentOrder = async (paymentData) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const divObj = bangladeshDivisions.find(d => d.id === selectedDivision);
      const distObj = districtsList.find(d => d.id === selectedDistrict);
      const thanaObj = thanasList.find(t => t.id === selectedThana);

      const divName = divObj ? divObj.name : '';
      const distName = distObj ? distObj.name : '';
      const thanaName = thanaObj ? thanaObj.name : '';

      // Detailed compiled full address
      const formattedFullAddress = `${streetAddress.trim()}, ${selectedPostOffice ? selectedPostOffice + ' (পোস্ট কোড: ' + postalCode + '), ' : ''}${thanaName ? thanaName + ', ' : ''}${distName ? distName + ', ' : ''}${divName}`;

      const orderPayload = {
        user_id: user?.id || null,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: (customerEmail || '').trim(),
        shipping_address: formattedFullAddress,
        shipping_city: distName || 'ঢাকা',
        delivery_zone: deliveryZone,
        delivery_fee: deliveryFee,
        payment_method: paymentData.payment_method,
        sender_number: paymentData.sender_number || '',
        transaction_id: paymentData.transaction_id || '',
        payment_details: {
          sender_number: paymentData.sender_number || '',
          transaction_id: paymentData.transaction_id || ''
        },
        items: cartItems.map(item => ({
          id: item.id,
          product_id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          thumbnail: item.thumbnail
        })),
        subtotal: subtotal,
        discount_amount: discountAmount,
        promo_code: appliedPromo?.code || null,
        applied_voucher_code: appliedPromo?.code || null,
        total_amount: grandTotal,
        notes: (orderNotes || '').trim()
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (data.success && data.order) {
        clearCart();
        setShowPaymentModal(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 font-sans">
      
      {/* Top Standardized Universal Back Button & Security Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>২৫৬-বিট এনক্রিপ্টেড নিরাপদ চেকআউট</span>
        </div>
      </div>

      {/* 2-Column Checkout Grid: Left = Cascading Address, Right = Order Summary */}
      <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: CASCADING ADDRESS FORM (7 COLS) ================= */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-400 flex items-center justify-center text-amber-800">
                <MapPin className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-base font-black text-slate-900">ডেলিভারি ঠিকানা ও গ্রাহকের তথ্য</h2>
            </div>

            {user ? (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                স্বয়ংক্রিয় পূরণ (Registered Account)
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                গেস্ট চেকআউট (Guest Checkout)
              </span>
            )}
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                প্রাপকের পূর্ণ নাম <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="আপনার নাম লিখুন"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-white font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 font-mono text-slate-900 bg-white font-bold"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* CASCADING BANGLADESH LOCATION SELECTOR (Same as Registration) */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/90 space-y-3">
            <div className="flex items-center space-x-2 text-amber-900 font-black text-xs">
              <Building className="w-4 h-4 text-amber-700" />
              <span>ডেলিভারি এলাকা ও অঞ্চল নির্বাচন (রেজিস্ট্রেশনের অনুরূপ)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Division */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">বিভাগ (Division) *</label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs"
                >
                  {bangladeshDivisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name} ({div.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">জেলা (District) *</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs"
                >
                  {districtsList.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name} ({dist.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Thana / Upazila */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">থানা / উপজেলা *</label>
                <select
                  value={selectedThana}
                  onChange={(e) => setSelectedThana(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs"
                >
                  {thanasList.map((thana) => (
                    <option key={thana.id} value={thana.id}>
                      {thana.name} ({thana.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Post Office & Postal Code */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">পোস্ট অফিস / এলাকা *</label>
                <select
                  value={selectedPostOffice}
                  onChange={handlePostOfficeChange}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs"
                >
                  {postOfficesList.map((po, idx) => (
                    <option key={idx} value={po.name}>
                      {po.name} (পোস্ট কোড: {po.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Street / Flat / Road Detailed Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                বিস্তারিত ডেলিভারি ঠিকানা (বাসা নং, রোড নং, ফ্ল্যাট বা হোল্ডিং) *
              </label>
              <textarea
                rows={2}
                required
                placeholder="যেমন: বাসা ১২/এ, রোড ৪, ব্লক সি, উত্তরা"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 text-slate-900 bg-white resize-none shadow-2xs"
              />
            </div>
          </div>

          {/* Delivery Zone Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ডেলিভারি চার্জ জোন
              </label>
              <select
                value={deliveryZone}
                onChange={(e) => setDeliveryZone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 bg-white text-slate-900 cursor-pointer font-bold"
              >
                <option value="inside_dhaka">ঢাকার ভেতরে (Inside Dhaka - ৳৬০)</option>
                <option value="outside_dhaka">ঢাকার বাইরে (Outside Dhaka - ৳১২০)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                বিশেষ নির্দেশনা / নোট (ঐচ্ছিক):
              </label>
              <input
                type="text"
                placeholder="যেমন: ডেলিভারিম্যানের জন্য বিশেষ নোট..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 bg-slate-50"
              />
            </div>
          </div>

          {/* Inline Error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Proceed to Payment CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>পরবর্তী: পেমেন্ট সম্পন্ন করুন (Proceed to Payment)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              পরের ধাপে বিকাশ, নগদ, রকেট, ব্যাংক ও ক্যাশ অন ডেলিভারি পপ-আপ থেকে পেমেন্ট পদ্ধতি বেছে নিতে পারবেন।
            </p>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: CHECKOUT PREVIEW & VOUCHER (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-slate-900">অর্ডার প্রিভিউ ও সারসংক্ষেপ</h3>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {toBengaliDigits(cartItems.length)} টি পণ্য
            </span>
          </div>

          {/* Items List (Compact View) */}
          <div className="divide-y divide-slate-200 max-h-56 overflow-y-auto pr-1 space-y-2">
            {cartItems.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex items-center space-x-3 text-xs">
                <img
                  src={item.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80'}
                  alt={item.title}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate text-[11px]">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    ৳{toBengaliDigits(item.price)} × {toBengaliDigits(item.quantity)}
                  </p>
                </div>
                <div className="text-right font-black font-mono text-slate-900 text-xs">
                  ৳{toBengaliDigits((item.price * item.quantity).toLocaleString())}
                </div>
              </div>
            ))}
          </div>

          {/* Voucher / Promo Code Input Box */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              ডিসকাউন্ট ভাউচার বা প্রোমোকোড:
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ভাউচার কোড দিন"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 uppercase font-mono text-slate-900 bg-white focus:outline-none focus:border-amber-500"
                />
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                প্রয়োগ
              </button>
            </div>

            {/* Voucher status message */}
            {voucherMessage && (
              <p className={`text-[11px] font-semibold ${voucherMessage.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                {voucherMessage.message}
              </p>
            )}

            {appliedPromo && (
              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                <span>কোড <strong>{appliedPromo.code}</strong> কার্যকর (-৳{toBengaliDigits(discountAmount)})</span>
                <button
                  type="button"
                  onClick={removePromo}
                  className="text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            )}
          </div>

          {/* Detailed Calculations */}
          <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>আইটেম সাব-টোটাল:</span>
              <span className="font-mono font-bold text-slate-900">৳{toBengaliDigits(subtotal.toLocaleString())}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>ভাউচার ছাড়:</span>
                <span className="font-mono font-bold">-৳{toBengaliDigits(discountAmount.toLocaleString())}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center">
                <Truck className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span>হোম ডেলিভারি ফি:</span>
              </span>
              <span className="font-mono font-bold text-slate-900">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-black">ফ্রি (FREE)</span>
                ) : (
                  `৳${toBengaliDigits(deliveryFee)}`
                )}
              </span>
            </div>

            {/* Grand Total */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">সর্বমোট প্রদেয়:</span>
              <span className="text-xl font-black text-amber-900 font-mono">
                ৳{toBengaliDigits(grandTotal.toLocaleString())}
              </span>
            </div>
          </div>

          {/* Notice */}
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
            <span className="font-bold block flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
              আল আনসার সুন্নাহ নিশ্চয়তা
            </span>
            <p className="text-amber-800">
              ডেলিভারিম্যানের উপস্থিতিতে পণ্য চেক করে গ্রহণ করতে পারবেন। শতভাগ খাঁটি ও ফ্রেশ কোয়ালিটি নিশ্চিত।
            </p>
          </div>

        </div>

      </form>

      {/* Payment Gateway Modal (Popup with MFS, Bank, COD) */}
      <PaymentGatewayModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={grandTotal}
        siteSettings={siteSettings}
        user={user}
        onConfirmPayment={handleConfirmPaymentOrder}
      />

    </div>
  );
}
