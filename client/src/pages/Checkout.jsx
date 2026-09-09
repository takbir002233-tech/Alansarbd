import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import useScrollLock from '../hooks/useScrollLock';
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
  Mail,
  X,
  ShoppingBag,
  RotateCcw
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
  
  // Modals Flow: Step 1 (Address on page) -> Step 2 (Order Summary Popup) -> Step 3 (Payment Gateway Modal)
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Lock scroll when summary modal is open
  useScrollLock(showSummaryModal);

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
    if (selectedDivision === 'dhaka') {
      setDeliveryZone('inside_dhaka');
    } else {
      setDeliveryZone('outside_dhaka');
    }
  }, [selectedDivision]);

  // Cascade Thanas when District changes
  useEffect(() => {
    if (selectedDistrict) {
      const thanas = getThanasForDistrict(selectedDistrict);
      setThanasList(thanas);
      if (thanas.length > 0) {
        setSelectedThana(thanas[0].id);
      } else {
        setSelectedThana('');
      }
    } else {
      setThanasList([]);
      setSelectedThana('');
    }
  }, [selectedDistrict]);

  // Cascade Post Offices when Thana changes
  useEffect(() => {
    if (selectedThana) {
      const pos = getPostOfficesForThana(selectedThana);
      setPostOfficesList(pos);
      if (pos.length > 0) {
        setSelectedPostOffice(pos[0].name);
        setPostalCode(pos[0].code);
      } else {
        setSelectedPostOffice('');
      }
    } else {
      setPostOfficesList([]);
      setSelectedPostOffice('');
    }
  }, [selectedThana]);

  const handlePostOfficeChange = (e) => {
    const poName = e.target.value;
    setSelectedPostOffice(poName);
    const found = postOfficesList.find(p => p.name === poName);
    if (found) {
      setPostalCode(found.code);
    }
  };

  // Delivery Fee Calculation
  const deliveryFee = getDeliveryFee(deliveryZone);
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Address validation before opening Summary Popup
  const handleOpenOrderSummary = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('অনুগ্রহ করে প্রাপকের পূর্ণ নাম লিখুন।');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 11) {
      setErrorMsg('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!streetAddress.trim()) {
      setErrorMsg('অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    setShowSummaryModal(true);
  };

  // Voucher apply handler
  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    const res = await applyPromo(voucherInput.trim(), subtotal);
    setVoucherMessage(res);
  };

  // Final Order Submission Handler
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
        setShowSummaryModal(false);
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

  // If cart is empty
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">আপনার শপিং ব্যাগ সম্পূর্ণ খালি</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          চেকআউট করার পূর্বে কার্টে কিছু পণ্য যোগ করুন। আল আনসার সুপার শপে প্রিমিয়াম পণ্যের বিশাল সমাহার রয়েছে।
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          <span>পণ্য কালেকশন দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Address recap text helper
  const compiledAddressSummary = `${streetAddress.trim()}, ${selectedPostOffice ? selectedPostOffice + ', ' : ''}${selectedThana ? selectedThana + ', ' : ''}${selectedDistrict ? selectedDistrict : ''}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 font-sans animate-in fade-in">
      
      {/* Top Standardized Universal Back Button & Security Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-5">
        <button
          type="button"
          onClick={onBack || (() => onNavigate('home'))}
          className="inline-flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>← পিছনে যান (Back)</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>২৫৬-বিট এনক্রিপ্টেড নিরাপদ চেকআউট</span>
        </div>
      </div>

      {/* ================= ONLY ADDRESS FORM ON CHECKOUT PAGE ================= */}
      <form onSubmit={handleOpenOrderSummary} noValidate className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
        
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400 flex items-center justify-center text-amber-800 shadow-2xs">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">ডেলিভারি ঠিকানা ও গ্রাহকের তথ্য</h2>
              <p className="text-[11px] text-slate-500">পণ্য ডেলিভারির জন্য আপনার সঠিক যোগাযোগের ঠিকানা দিন</p>
            </div>
          </div>

          {user ? (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
              অ্যাকাউন্ট ভেরিফাইড
            </span>
          ) : (
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              গেস্ট চেকআউট
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

        {/* Email */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            ইমেইল অ্যাড্রেস (ঐচ্ছিক - ইনভয়েসের জন্য):
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="user@gmail.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-white font-medium"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* CASCADING BANGLADESH LOCATION SELECTOR */}
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/90 space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-black text-xs">
            <Building className="w-4 h-4 text-amber-700" />
            <span>ডেলিভারি এলাকা ও অঞ্চল নির্বাচন</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Division */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">বিভাগ (Division) *</label>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs text-slate-900"
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
                className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs text-slate-900"
              >
                {districtsList.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {dist.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Thana / Upazila */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">থানা / উপজেলা (Thana) *</label>
              <select
                value={selectedThana}
                onChange={(e) => setSelectedThana(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs text-slate-900"
              >
                {thanasList.length > 0 ? (
                  thanasList.map((th) => (
                    <option key={th.id} value={th.id}>
                      {th.name}
                    </option>
                  ))
                ) : (
                  <option value="">থানা নির্বাচন করুন</option>
                )}
              </select>
            </div>

            {/* Post Office & Postal Code */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">পোস্ট অফিস ও কোড *</label>
              <select
                value={selectedPostOffice}
                onChange={handlePostOfficeChange}
                className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 focus:outline-none focus:border-amber-600 font-medium text-xs cursor-pointer shadow-2xs text-slate-900"
              >
                {postOfficesList.length > 0 ? (
                  postOfficesList.map((po, idx) => (
                    <option key={idx} value={po.name}>
                      {po.name} ({po.code})
                    </option>
                  ))
                ) : (
                  <option value="">পোস্ট অফিস নির্বাচন করুন</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Detailed Street Address */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            বিস্তারিত ডেলিভারি ঠিকানা (বাসা নং, রোড, এলাকা) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="যেমন: ফ্ল্যাট ৪/বি, বাড়ি ১২, রোড ৭, সেক্টর ৩, উত্তরা..."
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-white font-medium"
          />
        </div>

        {/* Delivery Zone Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ডেলিভারি এরিয়া (Delivery Zone):
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
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CTA: Next Button that opens Order Summary Modal */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
          >
            <span>অর্ডার বিবরণী ও নিশ্চিতকরণ (View Order Summary)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-center text-slate-500 mt-2">
            পরবর্তী পপ-আপে পণ্যের তালিকা, ভাউচার কোড এবং মোট প্রদেয় দেখে পেমেন্ট সম্পন্ন করতে পারবেন।
          </p>
        </div>

      </form>

      {/* ================= STEP 2: ORDER DETAILS POPUP MODAL ================= */}
      {showSummaryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
          onClick={() => setShowSummaryModal(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-300 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Top Bar */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-amber-500/15 px-3 sm:px-4 py-2.5 border-b border-amber-200/80 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="flex items-center space-x-1 text-[11px] font-black text-slate-800 hover:text-amber-900 bg-white/90 hover:bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="ঠিকানা পরিবর্তন করতে ফিরে যান"
              >
                <ArrowLeft className="w-3 h-3 text-amber-700 flex-shrink-0" />
                <span>← ঠিকানা পরিবর্তন (Edit)</span>
              </button>

              <span className="text-xs font-black text-slate-900 flex items-center space-x-1">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>অর্ডার প্রিভিউ ও সারসংক্ষেপ</span>
              </span>

              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto modal-scrollable overscroll-contain space-y-3.5 flex-1 text-xs">
              
              {/* Delivery Address Recap Badge */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl flex items-start space-x-2.5 text-slate-800">
                <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-xs">{customerName}</span>
                    <span className="font-mono text-[11px] font-bold text-amber-900">{customerPhone}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 truncate">{streetAddress}</p>
                </div>
              </div>

              {/* Items List (Compact View) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-900 border-b border-slate-100 pb-1.5">
                  <span>অর্ডারের পণ্যসমূহ</span>
                  <span className="font-mono font-bold text-slate-500">{toBengaliDigits(cartItems.length)} টি আইটেম</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1 space-y-1.5">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pt-1.5 first:pt-0 flex items-center space-x-2.5 text-xs">
                      <img
                        src={item.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80'}
                        alt={item.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-white"
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
              </div>

              {/* Voucher / Promo Code Input Box */}
              <div className="pt-2.5 border-t border-slate-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  ডিসকাউন্ট ভাউচার বা প্রোমোকোড:
                </label>
                <div className="flex space-x-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="ভাউচার কোড দিন"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-300 uppercase font-mono text-slate-900 bg-white focus:outline-none focus:border-amber-500 font-bold"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
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

              {/* Detailed Price Calculations */}
              <div className="pt-2.5 border-t border-slate-200 space-y-1.5 text-xs">
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
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-900">সর্বমোট প্রদেয়:</span>
                  <span className="text-xl font-black text-amber-900 font-mono">
                    ৳{toBengaliDigits(grandTotal.toLocaleString())}
                  </span>
                </div>
              </div>

              {/* Action Button: Proceed to Payment */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSummaryModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-800/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
                >
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span>পেমেন্ট এগিয়ে চলুন (Proceed to Payment)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= STEP 3: PAYMENT GATEWAY MODAL ================= */}
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
