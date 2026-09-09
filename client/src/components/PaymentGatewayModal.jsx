import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check, 
  ArrowLeft, 
  X, 
  Smartphone, 
  Building2, 
  Truck, 
  QrCode, 
  AlertCircle
} from 'lucide-react';
import useScrollLock from '../hooks/useScrollLock';

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  totalAmount,
  siteSettings,
  user,
  onConfirmPayment
}) {
  useScrollLock(isOpen);
  const [activeTab, setActiveTab] = useState('mfs'); // 'mfs', 'bank', 'cod'
  const [selectedMethod, setSelectedMethod] = useState(null); // null = method selector, 'bkash', 'nagad', 'rocket', etc.
  const [senderNumber, setSenderNumber] = useState(user?.phone || '');
  const [transactionId, setTransactionId] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [validationError, setValidationError] = useState('');
  const [invoiceId] = useState(() => 'INV-' + Math.random().toString(36).substr(2, 7).toUpperCase());

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(300);
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedMethod]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toBengaliDigits = (str) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return (str || '').toString().replace(/[0-9]/g, (w) => bengaliDigits[+w]);
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Payment Provider Configuration
  const paymentProviders = {
    bkash_personal: {
      key: 'bkash',
      name: 'bKash Personal',
      shortName: 'bKash',
      methodType: 'Send Money',
      number: siteSettings?.bkash_number || '01715712941',
      ussd: '*247#',
      bgColor: 'bg-[#E2136E]',
      themeHex: '#E2136E',
      textColor: 'text-white',
      accentBorder: 'border-[#E2136E]',
      helpline: '16247',
      instructions: [
        'আপনার bKash অ্যাপ ওপেন করুন অথবা *247# ডায়াল করুন।',
        'Send Money অপশনে যান এবং উল্লেখিত নম্বরে টাকা পাঠান।',
        'টাকা পাঠানো সফল হলে নিচের ঘরে TrxID ও আপনার নম্বর লিখে নিশ্চিত করুন।'
      ]
    },
    bkash_payment: {
      key: 'bkash',
      name: 'bKash Payment',
      shortName: 'bKash',
      badge: 'LIVE',
      methodType: 'Make Payment',
      number: siteSettings?.bkash_merchant_number || '01715712941',
      ussd: '*247#',
      bgColor: 'bg-[#E2136E]',
      themeHex: '#E2136E',
      textColor: 'text-white',
      accentBorder: 'border-[#E2136E]',
      helpline: '16247',
      instructions: [
        'আপনার bKash অ্যাপ ওপেন করুন বা *247# ডায়াল করুন।',
        'Payment অপশনে ক্লিক করে মার্চেন্ট নম্বরে ৳' + totalAmount + ' পরিশোধ করুন।',
        'পেমেন্টের পর এসএমএস-এ প্রাপ্ত TrxID নিচে প্রদান করুন।'
      ]
    },
    nagad: {
      key: 'nagad',
      name: 'Nagad Personal',
      shortName: 'Nagad',
      methodType: 'Send Money',
      number: siteSettings?.nagad_number || '01811223344',
      ussd: '*167#',
      bgColor: 'bg-[#F7941D]',
      themeHex: '#F7941D',
      textColor: 'text-white',
      accentBorder: 'border-[#F7941D]',
      helpline: '16167',
      instructions: [
        'আপনার Nagad অ্যাপ ওপেন করুন অথবা *167# ডায়াল করুন।',
        'Send Money অপশন বেছে নিয়ে উল্লেখিত নগদের নম্বরে টাকা পাঠান।',
        'টাকা পাঠানো শেষে TrxID ও প্রেরক নম্বর নিচে বসিয়ে নিশ্চিত করুন।'
      ]
    },
    rocket: {
      key: 'rocket',
      name: 'Rocket Personal',
      shortName: 'Rocket',
      methodType: 'Send Money',
      number: siteSettings?.rocket_number || '019112233448',
      ussd: '*322#',
      bgColor: 'bg-[#8C3494]',
      themeHex: '#8C3494',
      textColor: 'text-white',
      accentBorder: 'border-[#8C3494]',
      helpline: '16216',
      instructions: [
        'আপনার Rocket অ্যাপ অথবা *322# ব্যবহার করুন।',
        'Send Money অপশনে গিয়ে উল্লেখিত ১২ ডিজিটের নম্বরে টাকা পাঠান।',
        'সফল লেনদেনের Transaction ID নিচে লিখুন।'
      ]
    },
    upay: {
      key: 'upay',
      name: 'Upay Personal',
      shortName: 'Upay',
      methodType: 'Send Money',
      number: siteSettings?.upay_number || '01711223344',
      ussd: '*268#',
      bgColor: 'bg-[#005C8A]',
      themeHex: '#005C8A',
      textColor: 'text-white',
      accentBorder: 'border-[#005C8A]',
      helpline: '16268',
      instructions: [
        'আপনার Upay অ্যাপ বা ডায়াল কোড ব্যবহার করুন।',
        'Send Money করে উপরের নম্বরে নির্ধারিত টাকা পরিশোধ করুন।',
        'প্রাপ্ত TrxID দিয়ে পেমেন্ট ভেরিফাই করুন।'
      ]
    },
    cellfin: {
      key: 'cellfin',
      name: 'Cellfin Personal',
      shortName: 'Cellfin',
      methodType: 'Fund Transfer',
      number: siteSettings?.cellfin_number || '01711223344',
      ussd: '',
      bgColor: 'bg-[#006838]',
      themeHex: '#006838',
      textColor: 'text-white',
      accentBorder: 'border-[#006838]',
      helpline: '16259',
      instructions: [
        'আপনার Cellfin অ্যাপে লগইন করুন।',
        'Fund Transfer বা Send Money করে উল্লেখিত নম্বরে টাকা পাঠান।',
        'ট্রানজেকশন রেফারেন্স/নম্বর নিচে এন্ট্রি করুন।'
      ]
    },
    bank: {
      key: 'bank',
      name: 'Islami Bank Bangladesh',
      shortName: 'Bank Transfer',
      methodType: 'NPSB / BEFTN / Direct Transfer',
      number: siteSettings?.bank_account_no || '2050112233445500',
      accountName: 'AL ANSAR TRADING CORP',
      branch: 'Uttara Central Branch, Dhaka',
      routing: '125271822',
      bgColor: 'bg-[#1E3A8A]',
      themeHex: '#1E3A8A',
      textColor: 'text-white',
      accentBorder: 'border-[#1E3A8A]',
      helpline: '16259',
      instructions: [
        'যেকোনো ব্যাংক অ্যাপ বা অনলাইন ব্যাংকিং থেকে ফান্ড ট্রান্সফার করুন।',
        'অ্যাকাউন্ট নম্বর ও রাউটিং নম্বর সঠিকভাবে পূরণ করুন।',
        'ট্রান্সফার রেফারেন্স বা ট্রানজেকশন স্লিপ আইডি নিচে দিন।'
      ]
    },
    cod: {
      key: 'cod',
      name: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
      shortName: 'COD',
      methodType: 'Pay Upon Delivery',
      number: 'N/A',
      bgColor: 'bg-[#059669]',
      themeHex: '#059669',
      textColor: 'text-white',
      accentBorder: 'border-[#059669]',
      helpline: '01700-000000',
      instructions: [
        'পণ্য আপনার ঠিকানায় পৌঁছানোর পর দেখে-শুনে ডেলিভারিম্যানের কাছে সম্পূর্ণ টাকা পরিশোধ করবেন।',
        'কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।'
      ]
    }
  };

  const handleSelectMethod = (mKey) => {
    setSelectedMethod(paymentProviders[mKey]);
    setValidationError('');
  };

  const handleConfirm = () => {
    setValidationError('');
    if (!selectedMethod) {
      setValidationError('অনুগ্রহ করে একটি পেমেন্ট পদ্ধতি সিলেক্ট করুন।');
      return;
    }

    if (selectedMethod.key === 'cod') {
      onConfirmPayment({
        payment_method: 'cod',
        sender_number: '',
        transaction_id: ''
      });
      return;
    }

    // Digital methods require sender number & TrxID
    if (!senderNumber.trim()) {
      setValidationError('যে নম্বর/অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন তা উল্লেখ করুন।');
      return;
    }

    if (!transactionId.trim()) {
      setValidationError('পেমেন্ট নিশ্চিত করতে Transaction ID (TrxID) প্রদান করুন।');
      return;
    }

    onConfirmPayment({
      payment_method: selectedMethod.key,
      sender_number: senderNumber.trim(),
      transaction_id: transactionId.trim().toUpperCase()
    });
  };

  // Provider SVG Logos
  const renderProviderLogo = (key, sizeClass = "w-8 h-8") => {
    if (key.includes('bkash')) {
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-lg bg-[#E2136E] text-white font-black text-xs shadow-xs`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 9l3 13 7-4 7 4 3-13-10-7zm0 4.5l5.5 3.8-1.8 7.8-3.7-2.1-3.7 2.1-1.8-7.8L12 6.5z"/>
          </svg>
        </div>
      );
    }
    if (key.includes('nagad')) {
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-lg bg-[#F7941D] text-white font-black text-xs shadow-xs`}>
          <span className="font-bold text-[10px] tracking-tighter">নগদ</span>
        </div>
      );
    }
    if (key.includes('rocket')) {
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-lg bg-[#8C3494] text-white font-black text-xs shadow-xs`}>
          <span className="font-bold text-[9px] tracking-tighter">রকেট</span>
        </div>
      );
    }
    if (key.includes('upay')) {
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-lg bg-[#005C8A] text-amber-300 font-black text-xs shadow-xs`}>
          <span className="font-bold text-[9px] tracking-tighter">upay</span>
        </div>
      );
    }
    if (key.includes('cellfin')) {
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-lg bg-[#006838] text-white font-black text-xs shadow-xs`}>
          <span className="font-bold text-[8px] tracking-tighter">cellfin</span>
        </div>
      );
    }
    if (key.includes('bank')) {
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-lg bg-blue-900 text-white font-black text-xs shadow-xs`}>
          <Building2 className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className={`${sizeClass} flex items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs`}>
        <Truck className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedMethod ? (
              <button
                onClick={() => setSelectedMethod(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="পদ্ধতি পরিবর্তন করুন"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-400 flex items-center justify-center text-amber-800">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-none">
                AL ANSAR SUPER SHOP
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Invoice: <span className="font-bold text-slate-700">{invoiceId}</span>
              </p>
            </div>
          </div>

          <div className="text-right flex items-center space-x-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-600 block">মোট প্রদেয়</span>
              <span className="text-lg font-black text-slate-950 font-mono">
                ৳{toBengaliDigits(totalAmount.toLocaleString())}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto modal-scrollable overscroll-contain p-4 sm:p-5 space-y-4">

          {/* STEP 1: Method Selection (Matching Photo 2 Left Screen) */}
          {!selectedMethod && (
            <div className="space-y-4">
              {/* Category Tabs: MFS/WALLET vs BANK vs COD */}
              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('mfs')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeTab === 'mfs'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  MFS / WALLET
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bank')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeTab === 'bank'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  BANK TRANSFER
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cod')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeTab === 'cod'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  CASH ON DELIVERY
                </button>
              </div>

              {/* MFS Provider Grid */}
              {activeTab === 'mfs' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectMethod('bkash_personal')}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#E2136E] hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer bg-white"
                  >
                    {renderProviderLogo('bkash', 'w-10 h-10')}
                    <div>
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-[#E2136E]">Bkash Personal</h4>
                      <p className="text-[10px] text-slate-600 font-semibold">Send Money</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethod('bkash_payment')}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#E2136E] hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 relative group cursor-pointer bg-white"
                  >
                    <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                      LIVE
                    </span>
                    {renderProviderLogo('bkash', 'w-10 h-10')}
                    <div>
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-[#E2136E]">Bkash Payment</h4>
                      <p className="text-[10px] text-slate-600 font-semibold">Merchant / Counter</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethod('nagad')}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#F7941D] hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer bg-white"
                  >
                    {renderProviderLogo('nagad', 'w-10 h-10')}
                    <div>
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-[#F7941D]">Nagad Personal</h4>
                      <p className="text-[10px] text-slate-600 font-semibold">Send Money</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethod('rocket')}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#8C3494] hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer bg-white"
                  >
                    {renderProviderLogo('rocket', 'w-10 h-10')}
                    <div>
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-[#8C3494]">Rocket Personal</h4>
                      <p className="text-[10px] text-slate-600 font-semibold">Send Money (*322#)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethod('upay')}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#005C8A] hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer bg-white"
                  >
                    {renderProviderLogo('upay', 'w-10 h-10')}
                    <div>
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-[#005C8A]">Upay Personal</h4>
                      <p className="text-[10px] text-slate-600 font-semibold">Send Money</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethod('cellfin')}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#006838] hover:shadow-md transition-all flex flex-col items-center text-center space-y-2 group cursor-pointer bg-white"
                  >
                    {renderProviderLogo('cellfin', 'w-10 h-10')}
                    <div>
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-[#006838]">Cellfin Personal</h4>
                      <p className="text-[10px] text-slate-600 font-semibold">Fund Transfer</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Bank Transfer Option */}
              {activeTab === 'bank' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSelectMethod('bank')}
                    className="w-full p-4 rounded-2xl border border-slate-200 hover:border-blue-700 hover:shadow-md transition-all flex items-center space-x-4 bg-white text-left cursor-pointer"
                  >
                    {renderProviderLogo('bank', 'w-12 h-12')}
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-slate-900">Islami Bank Bangladesh Ltd (IBBL)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">NPSB / BEFTN / iRecharge / Account Transfer</p>
                      <span className="text-[10px] text-blue-700 font-bold">তাৎক্ষণিক ভেরিফিকেশন প্রযোজ্য</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Cash On Delivery Option */}
              {activeTab === 'cod' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSelectMethod('cod')}
                    className="w-full p-4 rounded-2xl border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all flex items-center space-x-4 bg-white text-left cursor-pointer"
                  >
                    {renderProviderLogo('cod', 'w-12 h-12')}
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-slate-900">ক্যাশ অন ডেলিভারি (নগদ পরিশোধ)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">পণ্য হাতে পেয়ে সম্পূর্ণ মূল্য পরিশোধ করুন।</p>
                      <span className="text-[10px] text-emerald-700 font-bold">কোনো অগ্রিম পেমেন্টের ঝামেলা নেই</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Trust Badges */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-[10px] text-slate-400 font-semibold">
                <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> ১০০% নিরাপদ</span>
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-blue-600" /> ২৪/৭ সাপোর্ট</span>
                <span className="flex items-center"><Smartphone className="w-3.5 h-3.5 mr-1 text-purple-600" /> মোবাইল ফ্রেন্ডলি</span>
              </div>
            </div>
          )}

          {/* STEP 2: Selected Gateway Screen (Matching Photo 1 & Photo 2 Right Screen) */}
          {selectedMethod && (
            <div className="space-y-4">
              
              {/* Branded Card Header */}
              <div className={`${selectedMethod.bgColor} ${selectedMethod.textColor} p-4 sm:p-5 rounded-3xl shadow-lg space-y-4`}>
                
                <div className="text-center space-y-1">
                  <h3 className="text-sm sm:text-base font-black tracking-wide">
                    Complete payment from your {selectedMethod.shortName} app
                  </h3>
                  <p className="text-[11px] opacity-90">
                    নিচের নম্বরে নির্ধারিত টাকা সেন্ড করে TrxID দিয়ে নিশ্চিত করুন
                  </p>
                </div>

                {/* Inner White Box with Amount, Number, QR (Matching Photo 1 & 2) */}
                <div className="bg-white text-slate-800 p-4 rounded-2xl shadow-inner border border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Left details */}
                    <div className="space-y-3 flex-1">
                      <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">AMOUNT</span>
                          <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                            ৳{toBengaliDigits(totalAmount.toLocaleString())}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">METHOD</span>
                          <span className="text-xs font-black text-slate-800">
                            {selectedMethod.methodType}
                          </span>
                        </div>
                      </div>

                      {/* Number Row with Copy Button */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                          {selectedMethod.key === 'bank' ? 'ACCOUNT NUMBER' : `NUMBER (${selectedMethod.methodType.toUpperCase()})`}
                        </span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-sm sm:text-base font-mono font-black text-slate-900 tracking-wider select-all">
                            {selectedMethod.number}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedMethod.number, 'number')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                              copiedField === 'number'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {copiedField === 'number' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'number' ? 'কপি হয়েছে' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Extra Bank Details if Bank */}
                      {selectedMethod.key === 'bank' && (
                        <div className="text-[10px] text-slate-500 pt-1 space-y-0.5">
                          <div><span className="font-bold text-slate-700">Account Name:</span> {selectedMethod.accountName}</div>
                          <div><span className="font-bold text-slate-700">Branch:</span> {selectedMethod.branch}</div>
                          <div><span className="font-bold text-slate-700">Routing:</span> {selectedMethod.routing}</div>
                        </div>
                      )}
                    </div>

                    {/* Right QR Code Section (Photo 1) */}
                    <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 flex-shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                        <QrCode className="w-full h-full text-slate-800" />
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase text-slate-500 mt-1 tracking-wider">
                        SCAN QR
                      </span>
                    </div>

                  </div>
                </div>

                {/* Copy Amount & Copy Number Action Buttons (Photo 1) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(totalAmount.toString(), 'amount')}
                    className="py-2 px-3 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white border border-white/30 backdrop-blur-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {copiedField === 'amount' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'amount' ? 'টাকা কপি হয়েছে' : 'Copy Amount'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(selectedMethod.number, 'number_quick')}
                    className="py-2 px-3 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white border border-white/30 backdrop-blur-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {copiedField === 'number_quick' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'number_quick' ? 'নম্বর কপি হয়েছে' : 'Copy Number'}</span>
                  </button>
                </div>

                {/* Countdown Timer Box (Photo 2 Right) */}
                <div className="bg-black/20 backdrop-blur-xs py-2 px-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[11px] opacity-90">পেমেন্ট সম্পন্ন করার জন্য সময় বাকি:</span>
                  <div className="flex items-center space-x-1 font-mono font-black text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimer(timeLeft)}</span>
                  </div>
                </div>

              </div>

              {/* Quick Step Instructions */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block text-[11px]">সহজ নির্দেশনা:</span>
                {selectedMethod.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-slate-600 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Input Fields for TrxID & Sender Number (Photo 1 "Verify with Transaction ID instead") */}
              {selectedMethod.key !== 'cod' && (
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                      পেমেন্ট ভেরিফিকেশন তথ্য
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold">* বাধ্যতামূলক</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        প্রেরক মোবাইল নম্বর (Sender Number):
                      </label>
                      <input
                        type="text"
                        placeholder="01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Transaction ID (TrxID):
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: BL7A90KQ1"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-mono uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Alert */}
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Action Buttons: Cancel vs Confirm (Photo 1 & 2 Footer) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod(null)}
                  className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 text-xs font-black rounded-2xl border border-slate-300 transition-colors cursor-pointer text-center"
                >
                  Cancel / পদ্ধতি বদলান
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`py-3 px-4 rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer ${
                    selectedMethod.key === 'cod'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : `${selectedMethod.bgColor} hover:opacity-95 ${selectedMethod.textColor}`
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>I'VE PAID - CONFIRM / নিশ্চিত করুন</span>
                </button>
              </div>

              {/* Help contact at bottom (Photo 1 "16247") */}
              <div className="text-center pt-2 text-[11px] text-slate-400">
                <span>প্রয়োজনে হেল্পলাইন: </span>
                <span className="font-bold text-slate-600">📞 {selectedMethod.helpline || '16247'}</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
